import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    // TODO: 替换成真实接口 /api/user/register
    localStorage.setItem("token", "fake-token-reg");
    localStorage.setItem("userInfo", JSON.stringify({
      studentId: formData.studentId,
      name: formData.name,
    }));
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
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
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>注册</button>
        </form>
        <p>已有账号？ <Link to="/login">去登录</Link></p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f5f5f5" },
  card: { backgroundColor: "white", padding: "2rem", borderRadius: "8px", width: "100%", maxWidth: "400px" },
  field: { marginBottom: "1rem" },
  input: { width: "100%", padding: "0.5rem", marginTop: "0.25rem", border: "1px solid #ddd", borderRadius: "4px" },
  button: { width: "100%", padding: "0.75rem", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  error: { color: "red", fontSize: "0.875rem" },
};

export default Register;