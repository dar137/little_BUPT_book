import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userAPI } from "../api";

const Register = () => {
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [studentCard, setStudentCard] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (!studentCard) {
      setError("请上传学生证或学生卡图片");
      return;
    }

    if (studentCard.size > 5 * 1024 * 1024) {
      setError("学生证图片大小不能超过 5MB");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("username", formData.studentId);
      payload.append("nickname", formData.name);
      payload.append("password", formData.password);
      payload.append("studentCard", studentCard);

      await userAPI.register(payload);
      setMessage("注册申请已提交，请等待管理员审核。审核通过后再登录。");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message || "注册失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container auth-entry-page">
      <div className="auth-card" style={styles.card}>
        <h2>注册</h2>
        <form onSubmit={handleRegister}>
          <div style={styles.field}>
            <label>学号</label>
            <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} style={styles.input} required />
          </div>
          <div style={styles.field}>
            <label>姓名</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} style={styles.input} required />
          </div>
          <div style={styles.field}>
            <label>密码</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} style={styles.input} required />
          </div>
          <div style={styles.field}>
            <label>确认密码</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={styles.input} required />
          </div>
          <div style={styles.field}>
            <label>学生证 / 学生卡图片</label>
            <input type="file" accept="image/*" onChange={(e) => setStudentCard(e.target.files?.[0] || null)} style={styles.input} required />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.success}>{message}</p>}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "提交中..." : "提交注册申请"}
          </button>
        </form>
        <p>已有账号？ <Link to="/login">去登录</Link></p>
      </div>
    </div>
  );
};

const styles = {
  card: { maxWidth: "400px" },
  field: { marginBottom: "1rem" },
  input: { width: "100%", padding: "0.5rem", marginTop: "0.25rem", border: "1px solid #ddd", borderRadius: "4px" },
  button: { width: "100%", padding: "0.75rem", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  error: { color: "red", fontSize: "0.875rem" },
  success: { color: "#237804", fontSize: "0.875rem" },
};

export default Register;
