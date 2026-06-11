// src/pages/AuthPrompt.jsx
import { useNavigate } from "react-router-dom";
import { FaSignInAlt, FaUserPlus, FaSchool } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";

const AuthPrompt = () => {
  const navigate = useNavigate();
  const [transitionTarget, setTransitionTarget] = useState("");
  const transitionTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (transitionTimer.current) {
        clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  const handleAuthTransition = (path) => {
    if (transitionTarget) return;

    setTransitionTarget(path);
    transitionTimer.current = setTimeout(() => {
      navigate(path);
    }, 560);
  };

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
          <button className="auth-btn primary" onClick={() => handleAuthTransition("/login")}>
            <FaSignInAlt /> 登录
          </button>
          <button className="auth-btn secondary" onClick={() => handleAuthTransition("/register")}>
            <FaUserPlus /> 注册账号
          </button>
        </div>

        <div className="auth-features">
          <div>📝 发布动态</div>
          <div>🔍 互帮互助</div>
          <div>💬 生活交流</div>
          <div>📚 学习分享</div>
        </div>
      </div>
      <div
        className={`auth-route-transition${transitionTarget ? " is-active" : ""}`}
        aria-hidden="true"
      />
    </div>
  );
};

export default AuthPrompt;
