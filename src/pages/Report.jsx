import { useState, useEffect } from "react";

const Report = () => {
  const [formData, setFormData] = useState({
    targetType: "post",
    targetId: "",
    reason: "",
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState(null);
  const [preloadedTitle, setPreloadedTitle] = useState(""); // 新增：存储被举报内容的标题

  // 组件加载时，检查是否有从其他页面传来的举报信息
  useEffect(() => {
    const reportTarget = localStorage.getItem("reportTarget");
    if (reportTarget) {
      const target = JSON.parse(reportTarget);
      setFormData(prev => ({
        ...prev,
        targetType: target.targetType || "post",
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
    // TODO: 替换成真实接口 /api/report/submit
    console.log("提交举报:", formData);
    setSubmitted(true);
    setStatus("pending");
  };

  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>举报已提交</h2>
          <p>感谢您的反馈，我们会尽快处理。</p>
          <p>当前状态：{status === "pending" ? "审核中" : status}</p>
          <button onClick={() => setSubmitted(false)} style={styles.button}>继续举报</button>
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
              <option value="post">违规帖子</option>
              <option value="user">违规用户</option>
            </select>
          </div>
          <div style={styles.field}>
            <label>帖子ID / 用户ID</label>
            <input
              type="text"
              name="targetId"
              value={formData.targetId}
              onChange={handleChange}
              placeholder="请输入ID"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label>举报原因</label>
            <select name="reason" value={formData.reason} onChange={handleChange} style={styles.input} required>
              <option value="">请选择</option>
              <option value="spam">垃圾广告</option>
              <option value="abuse">人身攻击</option>
              <option value="illegal">违法违规</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div style={styles.field}>
            <label>详细描述（可选）</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              style={styles.textarea}
            />
          </div>
          <button type="submit" style={styles.button}>提交举报</button>
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