import json
import re

import requests
from flask import current_app


MAX_EXPANDED_TERMS = 8


def _chat_completion_url(endpoint):
    endpoint = str(endpoint or "").strip()
    if not endpoint:
        return ""
    if endpoint.rstrip("/").endswith("/chat/completions"):
        return endpoint
    return f"{endpoint.rstrip('/')}/chat/completions"


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


def _normalize_terms(keyword, payload):
    terms = []

    if isinstance(payload, list):
        terms = payload
    elif isinstance(payload, dict):
        data = payload.get("data")
        candidates = [
            payload.get("keywords"),
            payload.get("terms"),
            payload.get("expandedWords"),
            payload.get("expanded_words"),
            payload.get("list"),
        ]
        if isinstance(data, dict):
            candidates.extend([
                data.get("keywords"),
                data.get("terms"),
                data.get("expandedWords"),
                data.get("expanded_words"),
                data.get("list"),
            ])
        elif isinstance(data, list):
            candidates.append(data)

        for candidate in candidates:
            if isinstance(candidate, list):
                terms = candidate
                break
            if isinstance(candidate, str):
                terms = re.split(r"[,\s，、]+", candidate)
                break

    result = []
    for term in [keyword, *terms]:
        term = str(term or "").strip()
        if not term or len(term) > 64 or term in result:
            continue
        result.append(term)
        if len(result) >= MAX_EXPANDED_TERMS:
            break

    return result or [keyword]


def _parse_chat_completion(raw_response):
    output = raw_response.get("output") or {}
    if isinstance(output, dict) and output.get("text"):
        parsed = _extract_json(output.get("text"))
        if parsed is not None:
            return parsed
        return re.split(r"[,\s，、]+", output.get("text"))

    choices = raw_response.get("choices") or []
    if not choices:
        return None

    message = choices[0].get("message") or {}
    content = message.get("content")
    parsed = _extract_json(content)
    if parsed is not None:
        return parsed
    if isinstance(content, str):
        return re.split(r"[,\s，、]+", content)
    return None


def expand_search_terms(keyword):
    keyword = str(keyword or "").strip()
    if not keyword:
        return []

    api_key = current_app.config.get("FUZZY_SEARCH_API_KEY")
    endpoint = current_app.config.get("FUZZY_SEARCH_API_URL")
    model = current_app.config.get("FUZZY_SEARCH_MODEL")
    if not api_key or not endpoint or not model:
        return [keyword]

    prompt = (
        "你是校园社区搜索扩展助手。请基于用户输入生成若干相近检索词，"
        "用于召回帖子标题、正文、分类和作者昵称。只返回 JSON，格式为："
        "{\"keywords\":[\"词1\",\"词2\"]}。不要返回解释。"
        f"\n用户输入：{keyword}"
    )

    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        response = requests.post(
            _chat_completion_url(endpoint),
            headers=headers,
            json={
                "model": model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2,
            },
            timeout=8,
        )
        response.raise_for_status()
        raw_response = response.json()
        parsed = _parse_chat_completion(raw_response) or raw_response
        return _normalize_terms(keyword, parsed)
    except Exception:
        return [keyword]
