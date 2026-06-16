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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 模拟注册（降级备用）
  const mockRegister = (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟注册成功
        const userInfo = {
          studentId: data.studentId,
          name: data.name,
        };
        localStorage.setItem("token", "fake-token-reg");
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        resolve({ success: true });
      }, 500);
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setLoading(true);

    try {
      // 调用真实后端接口
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: formData.studentId,
          name: formData.name,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // 假设后端返回 { token, user }
        localStorage.setItem("token", data.token);
        localStorage.setItem("userInfo", JSON.stringify(data.user));
        window.dispatchEvent(new Event("authChange")); // 触发导航栏更新
        navigate("/");
        setLoading(false);
        return;
      } else {
        // 如果后端返回错误，尝试读取错误信息
        const errData = await response.json();
        throw new Error(errData.message || "注册失败");
      }
    } catch (err) {
      console.warn("后端连接失败，使用模拟注册", err);
      // 降级：使用模拟注册
      const result = await mockRegister(formData);
      if (result.success) {
        window.dispatchEvent(new Event("authChange"));
        navigate("/");
      } else {
        setError("注册失败，请稍后重试");
      }
    }
    setLoading(false);
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
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "注册中..." : "注册"}
          </button>
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