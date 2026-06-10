// src/pages/AuthPrompt.jsx
import { useNavigate } from "react-router-dom";
import { FaSignInAlt, FaUserPlus, FaSchool } from "react-icons/fa";

const AuthPrompt = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container auth-prompt-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="brand-mark"><FaSchool /></span>
          <span>小邮书</span>
        </div>
        <div className="auth-header">
          <h2>欢迎来到小邮书</h2>
          <p>请先登录或注册，以获得更多内容</p>
        </div>

        <div className="auth-buttons">
          <button className="auth-btn primary" onClick={() => navigate("/login")}>
            <FaSignInAlt /> 登录
          </button>
          <button className="auth-btn secondary" onClick={() => navigate("/register")}>
            <FaUserPlus /> 注册账号
          </button>
        </div>

        <div className="auth-features">
          <div>📝 发布动态</div>
          <div>🔍 智能搜索</div>
          <div>💬 互动交流</div>
          <div>📚 学习分享</div>
        </div>
      </div>
    </div>
  );
};

export default AuthPrompt;
