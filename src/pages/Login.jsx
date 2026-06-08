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

    // ========== 新增：管理员登录分支 ==========
    // 使用管理员用户名（例如 admin）和密码（例如 admin）登录
    if (studentId === "admin" && password === "admin") {
      const result = await login(studentId, password);
      if (result.success) {
        window.dispatchEvent(new Event('authChange')); // 触发导航栏更新
        navigate("/admin");                           // 跳转到管理后台
      } else {
        setError(result.message);
      }
      setLoading(false);
      return;
    }
    // ========== 原有普通用户登录逻辑（完全保留） ==========
    setTimeout(() => {
      if (studentId === "20240001" && password === "123456") {
        // 保存用户信息，并增加 role 字段（用于区分身份）
        const userInfo = {
          id: 1,
          studentId: studentId,
          name: "刘宇欣",
          email: "liuyuxin@bupt.edu.cn",
          bio: "热爱编程的前端开发者",
          role: "user",        // 新增：标明普通用户角色
        };
        localStorage.setItem("token", "fake-token-123");
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        
        window.dispatchEvent(new Event('authChange'));
        navigate("/");
      } else {
        setError("学号或密码错误（演示用：20240001 / 123456）");
      }
      setLoading(false);
    }, 500);
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