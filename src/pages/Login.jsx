import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaSignInAlt, FaUser, FaLock, FaSchool } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";  // 新增：导入全局认证

const Login = () => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();  // 新增：获取登录方法

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(studentId, password);
      if (result.success) {
        window.dispatchEvent(new Event('authChange'));
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        navigate(userInfo.role === "ADMIN" ? "/admin" : "/");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || "登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <FaSchool />
          <span>小邮书</span>
        </div>
        <div className="auth-header">
          <h2>欢迎回来</h2>
          <p>登录你的北邮校园社交平台</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>学号 / 管理员用户名</label>   {/* 提示文字稍作调整，不影响原有功能 */}
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                className="input"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="学号 或 管理员用户名"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>密码</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "登录中..." : <><FaSignInAlt /> 登录</>}
          </button>
        </form>

        <div className="auth-footer">
          还没有账号？ <Link to="/register">立即注册</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
