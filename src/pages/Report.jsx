import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { reportAPI } from "../api";

const Report = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    targetType: "POST",
    targetId: "",
    reasonType: "",
    reasonDetail: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [preloadedTitle, setPreloadedTitle] = useState(""); // 新增：存储被举报内容的标题

  // 组件加载时，检查是否有从其他页面传来的举报信息
  useEffect(() => {
    const reportTarget = localStorage.getItem("reportTarget");
    if (reportTarget) {
      const target = JSON.parse(reportTarget);
      const targetType = String(target.targetType || "POST").toUpperCase();
      setFormData(prev => ({
        ...prev,
        targetType: targetType === "COMMENT" ? "COMMENT" : "POST",
        targetId: target.targetId || "",
      }));
      if (target.targetTitle) {
        setPreloadedTitle(target.targetTitle);
      }
      // 读取后清除，避免重复使用
      localStorage.removeItem("reportTarget");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.targetId) {
      setError("请从帖子或评论入口发起举报");
      return;
    }

    setSubmitting(true);

    try {
      await reportAPI.submit({
        targetType: formData.targetType,
        targetId: Number(formData.targetId),
        reasonType: formData.reasonType,
        reasonDetail: formData.reasonDetail || undefined,
      });
      setSubmitted(true);
      setStatus("pending");
    } catch (err) {
      setError(err.message || "举报提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>举报已提交</h2>
          <p>感谢您的反馈，我们会尽快处理。</p>
          <p>当前状态：{status === "pending" ? "审核中" : status}</p>
          <button onClick={() => navigate("/")} style={styles.button}>确定</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>举报/反馈</h2>
        {preloadedTitle && (
          <div style={styles.preloadNotice}>
            <strong>正在举报：</strong> {preloadedTitle}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label>举报类型</label>
            <select name="targetType" value={formData.targetType} onChange={handleChange} style={styles.input}>
              <option value="POST">违规帖子</option>
              <option value="COMMENT">违规评论</option>
            </select>
          </div>
          <div style={styles.field}>
            <label>举报原因</label>
            <select name="reasonType" value={formData.reasonType} onChange={handleChange} style={styles.input} required>
              <option value="">请选择</option>
              <option value="PORN">色情低俗</option>
              <option value="SPAM">垃圾广告</option>
              <option value="AD">广告营销</option>
              <option value="ABUSE">人身攻击</option>
              <option value="FALSE_INFO">虚假信息</option>
              <option value="ILLEGAL">违法违规</option>
              <option value="OTHER">其他</option>
            </select>
          </div>
          <div style={styles.field}>
            <label>详细描述（可选）</label>
            <textarea
              name="description"
              rows="4"
              value={formData.reasonDetail}
              onChange={(e) => setFormData({ ...formData, reasonDetail: e.target.value })}
              style={styles.textarea}
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button} disabled={submitting}>
            {submitting ? "提交中..." : "提交举报"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f5f5f5" },
  card: { backgroundColor: "white", padding: "2rem", borderRadius: "8px", width: "100%", maxWidth: "500px" },
  field: { marginBottom: "1rem" },
  input: { width: "100%", padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px" },
  textarea: { width: "100%", padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "inherit" },
  button: { width: "100%", padding: "0.75rem", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  error: { color: "#dc3545", fontSize: "0.875rem" },
  preloadNotice: {
    backgroundColor: "#e6f7ff",
    border: "1px solid #91d5ff",
    borderRadius: "4px",
    padding: "8px 12px",
    marginBottom: "16px",
    fontSize: "14px",
    color: "#0050b3"
  }
};

export default Report;
