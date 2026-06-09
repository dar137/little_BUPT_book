import base64
import json
import mimetypes
import os
import re
from urllib.parse import urlparse

import requests
from flask import current_app


AI_RESULT_PASS = "PASS"
AI_RESULT_REJECT = "REJECT"
AI_RESULT_NEED_HUMAN = "NEED_HUMAN"

RESULT_LABELS = {
    AI_RESULT_PASS: "合规",
    AI_RESULT_NEED_HUMAN: "可疑",
    AI_RESULT_REJECT: "不合规",
}


def _chat_completion_url(endpoint):
    endpoint = str(endpoint or "").strip()
    if not endpoint:
        return ""
    if endpoint.rstrip("/").endswith("/chat/completions"):
        return endpoint
    return f"{endpoint.rstrip('/')}/chat/completions"


def _app_completion_url(endpoint, app_id):
    parsed = urlparse(str(endpoint or "").strip())
    if not parsed.scheme or not parsed.netloc:
        return ""
    return f"{parsed.scheme}://{parsed.netloc}/api/v1/apps/{app_id}/completion"


def _extract_json(text):
    if not text:
        return None

    match = re.search(r"\{.*\}", text, re.S)
    if not match:
        return None

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


def _normalize_result(payload):
    result = str(payload.get("result") or payload.get("ai_result") or "").upper()
    risk = str(payload.get("risk_level") or "LOW").upper()

    if result in ["PASS", "合规", "COMPLIANT"]:
        ai_result = AI_RESULT_PASS
        risk_level = "NONE"
    elif result in ["REJECT", "不合规", "BLOCK"]:
        ai_result = AI_RESULT_REJECT
        risk_level = "HIGH"
    else:
        ai_result = AI_RESULT_NEED_HUMAN
        risk_level = risk if risk in ["LOW", "MEDIUM", "HIGH"] else "MEDIUM"

    try:
        confidence = float(payload.get("confidence", 0.5))
    except (TypeError, ValueError):
        confidence = 0.5

    confidence = min(max(confidence, 0), 1)

    return {
        "ai_result": ai_result,
        "risk_level": risk_level,
        "confidence": confidence,
        "reason": str(payload.get("reason") or RESULT_LABELS[ai_result])[:512],
        "raw_response": payload,
    }


def _local_upload_path(image_url):
    marker = "/uploads/"
    if not image_url or marker not in image_url:
        return None

    relative_path = image_url.split(marker, 1)[1].split("?", 1)[0]
    upload_root = os.path.abspath(os.path.join(current_app.root_path, "..", "uploads"))
    candidate = os.path.abspath(os.path.join(upload_root, relative_path))

    if not candidate.startswith(upload_root):
        return None

    return candidate if os.path.exists(candidate) else None


def _image_to_data_url(image_url):
    local_path = _local_upload_path(image_url)
    if not local_path:
        return image_url

    mime_type = mimetypes.guess_type(local_path)[0] or "image/jpeg"
    with open(local_path, "rb") as file:
        encoded = base64.b64encode(file.read()).decode("ascii")

    return f"data:{mime_type};base64,{encoded}"


def _build_prompt(title, content):
    return (
        "请审核校园社区帖子是否合规。需要同时检查标题、正文和图片。"
        "只返回 JSON，不要返回解释性文本。JSON 字段："
        "result 取 PASS/NEED_HUMAN/REJECT，risk_level 取 NONE/LOW/MEDIUM/HIGH，"
        "confidence 取 0 到 1，reason 为中文简短理由。"
        f"\n标题：{title or ''}\n正文：{content or ''}"
    )


def _build_image_list(image_urls):
    return [
        _image_to_data_url(image_url)
        for image_url in image_urls[:4]
    ]


def _build_messages(title, content, image_urls):
    content_parts = [{"type": "text", "text": _build_prompt(title, content)}]
    for image_url in image_urls[:4]:
        content_parts.append({
            "type": "image_url",
            "image_url": {"url": _image_to_data_url(image_url)}
        })

    return [{"role": "user", "content": content_parts}]


def _extract_answer(raw_response):
    output = raw_response.get("output") or {}
    if isinstance(output, dict) and output.get("text"):
        return output.get("text")

    choices = raw_response.get("choices") or []
    if choices:
        return choices[0].get("message", {}).get("content")

    return ""


def _safe_error(exc, app_id=None):
    message = str(exc)
    if app_id:
        message = message.replace(app_id, "[APP_ID]")
    return message[:180]


def review_post_content(title, content, image_urls):
    api_key = current_app.config.get("QWEN_API_KEY")
    endpoint = current_app.config.get("QWEN_API_URL")
    model = current_app.config.get("QWEN_MODEL")
    app_id = current_app.config.get("QWEN_APP_ID")

    if not api_key:
        return {
            "ai_result": AI_RESULT_NEED_HUMAN,
            "risk_level": "MEDIUM",
            "confidence": 0,
            "reason": "未配置 AI 审核 API Key，转人工审核",
            "raw_response": {"error": "QWEN_API_KEY missing"},
            "ai_model": None,
        }

    if not endpoint or (not app_id and not model):
        return {
            "ai_result": AI_RESULT_NEED_HUMAN,
            "risk_level": "MEDIUM",
            "confidence": 0,
            "reason": "未配置 AI 审核 API URL 或模型，转人工审核",
            "raw_response": {"error": "QWEN_API_URL or QWEN_MODEL missing"},
            "ai_model": model,
        }

    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        used_app = False
        if app_id:
            try:
                response = requests.post(
                    _app_completion_url(endpoint, app_id),
                    headers=headers,
                    json={
                        "input": {
                            "prompt": _build_prompt(title, content),
                            "image_list": _build_image_list(image_urls),
                        }
                    },
                    timeout=30,
                )
                response.raise_for_status()
                used_app = True
            except Exception:
                if not model:
                    raise
                response = None

        if not app_id or response is None:
            response = requests.post(
                _chat_completion_url(endpoint),
                headers=headers,
                json={
                    "model": model,
                    "messages": _build_messages(title, content, image_urls),
                    "temperature": 0,
                },
                timeout=30,
            )
        response.raise_for_status()
        raw_response = response.json()
        answer = _extract_answer(raw_response)
        parsed = _extract_json(answer) or {"result": "NEED_HUMAN", "reason": answer}
        result = _normalize_result(parsed)
        result["raw_response"] = raw_response
        result["ai_model"] = "QWEN_APP" if used_app else model
        return result
    except Exception as exc:
        return {
            "ai_result": AI_RESULT_NEED_HUMAN,
            "risk_level": "MEDIUM",
            "confidence": 0,
            "reason": f"AI 审核调用失败，转人工审核：{_safe_error(exc, app_id)}",
            "raw_response": {"error": _safe_error(exc, app_id)},
            "ai_model": model,
        }


def review_comment_content(content):
    return review_post_content("评论", content, [])
