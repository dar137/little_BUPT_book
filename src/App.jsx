import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaHome, FaPlus, FaSearch, FaUser, FaSignOutAlt } from 'react-icons/fa';
import './App.css';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Report from './pages/Report';
import AuthPrompt from './pages/AuthPrompt';

// 导航栏组件
const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      const userInfo = localStorage.getItem("userInfo");
      if (token && userInfo) {
        setIsLoggedIn(true);
        const user = JSON.parse(userInfo);
        setUserName(user.name || user.studentId);
      } else {
        setIsLoggedIn(false);
        setUserName('');
      }
    };
    
    checkLogin();
    window.addEventListener('authChange', checkLogin);
    return () => window.removeEventListener('authChange', checkLogin);
  }, []);

  const handleMyClick = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate('/profile');
    } else {
      navigate('/auth-prompt');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">小邮书</span>
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-item">
            <FaHome className="nav-icon" />
            <span>首页</span>
          </Link>
          <Link to="/create" className="nav-item">
            <FaPlus className="nav-icon" />
            <span>发帖</span>
          </Link>
          <Link to="/search" className="nav-item">
            <FaSearch className="nav-icon" />
            <span>搜索</span>
          </Link>
          
          {isLoggedIn ? (
            <div className="user-menu">
              <button className="nav-item user-btn" onClick={() => navigate('/profile')}>
                <FaUser className="nav-icon" />
                <span>{userName}</span>
              </button>
              <button className="logout-btn-nav" onClick={handleLogout} title="退出登录">
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <button className="nav-item my-btn" onClick={handleMyClick}>
              <FaUser className="nav-icon" />
              <span>我的</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/report" element={<Report />} />
          <Route path="/auth-prompt" element={<AuthPrompt />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;