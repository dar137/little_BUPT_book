// src/pages/AuthPrompt.jsx
import { useNavigate } from "react-router-dom";
import { FaSignInAlt, FaUserPlus, FaSchool } from "react-icons/fa";

const AuthPrompt = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-prompt-container">
      <div className="auth-prompt-card">
        <div className="auth-prompt-logo">
          <FaSchool />
          <span>小邮书</span>
        </div>
        
        <h2>欢迎来到小邮书</h2>
        <p>请先登录或注册，查看个人主页</p>
        
        <div className="auth-prompt-buttons">
          <button className="prompt-login-btn" onClick={() => navigate("/login")}>
            <FaSignInAlt /> 登录
          </button>
          <button className="prompt-register-btn" onClick={() => navigate("/register")}>
            <FaUserPlus /> 注册
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPrompt;