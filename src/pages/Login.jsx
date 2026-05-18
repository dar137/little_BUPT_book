import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaSignInAlt, FaUser, FaLock, FaSchool } from "react-icons/fa";

const Login = () => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // TODO: 后期替换成真实接口 /api/user/login
    setTimeout(() => {
      if (studentId === "20240001" && password === "123456") {
        // 保存用户信息
        const userInfo = {
          id: 1,
          studentId: studentId,
          name: "刘宇欣",
          email: "liuyuxin@bupt.edu.cn",
          bio: "热爱编程的前端开发者"
        };
        localStorage.setItem("token", "fake-token-123");
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        
        // 触发登录状态更新（通知导航栏）
        window.dispatchEvent(new Event('authChange'));
        
        // 跳转到首页
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
            <label>学号</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                className="input"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="请输入学号"
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