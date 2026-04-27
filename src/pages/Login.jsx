import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // TODO: 后期替换成真实接口 /api/user/login
    if (studentId === "20240001" && password === "123456") {
      localStorage.setItem("token", "fake-token-123");
      localStorage.setItem("userInfo", JSON.stringify({ studentId, name: "测试用户" }));
      navigate("/");
    } else {
      setError("学号或密码错误（演示用：20240001 / 123456）");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>登录</h2>
        <form onSubmit={handleLogin}>
          <div style={styles.field}>
            <label>学号</label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="20240001"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="123456"
              style={styles.input}
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>登录</button>
        </form>
        <p>还没有账号？ <Link to="/register">立即注册</Link></p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  field: { marginBottom: "1rem" },
  input: {
    width: "100%",
    padding: "0.5rem",
    marginTop: "0.25rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  error: { color: "red", fontSize: "0.875rem" },
};

export default Login;