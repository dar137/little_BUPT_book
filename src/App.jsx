import { useEffect, useLayoutEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { FaHome, FaPlus, FaSearch, FaUser, FaSignOutAlt, FaShieldAlt, FaSchool } from 'react-icons/fa';
import { adminAPI } from './api';
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
import UserProfile from './pages/UserProfile';  // ← 新增导入
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

// 导航栏组件
const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingAuditCount, setPendingAuditCount] = useState(0);
  const [seenAuditCount, setSeenAuditCount] = useState(0);

  const auditSeenKey = currentUser?.id
    ? `adminSeenAuditCount:${currentUser.id}`
    : 'adminSeenAuditCount';

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      setPendingAuditCount(0);
      setSeenAuditCount(0);
      return;
    }

    let ignore = false;
    const storedSeenAuditCount = Number(localStorage.getItem(auditSeenKey) || 0);
    setSeenAuditCount(storedSeenAuditCount);

    const loadPendingAuditCount = async () => {
      try {
        const [postsData, commentsData, postReportsData, commentReportsData, registrationsData] = await Promise.all([
          adminAPI.getPendingPosts(),
          adminAPI.getPendingComments(),
          adminAPI.getReports({ targetType: 'POST' }),
          adminAPI.getReports({ targetType: 'COMMENT' }),
          adminAPI.getRegistrations(),
        ]);
        if (ignore) return;
        const totalPendingAuditCount = (
          (postsData.list?.length || 0)
          + (commentsData.list?.length || 0)
          + (postReportsData.list?.length || 0)
          + (commentReportsData.list?.length || 0)
          + (registrationsData.list?.length || 0)
        );
        setPendingAuditCount(totalPendingAuditCount);
        if (totalPendingAuditCount < storedSeenAuditCount) {
          localStorage.setItem(auditSeenKey, String(totalPendingAuditCount));
          setSeenAuditCount(totalPendingAuditCount);
        }
      } catch {
        if (!ignore) setPendingAuditCount(0);
      }
    };

    loadPendingAuditCount();

    return () => {
      ignore = true;
    };
  }, [currentUser, auditSeenKey]);

  const newAuditCount = Math.max(pendingAuditCount - seenAuditCount, 0);

  const handleMyClick = () => {
    if (currentUser) {
      navigate('/profile');
    } else {
      navigate('/auth-prompt');
    }
  };

  const handleLogout = () => {
    if (!window.confirm('是否确认退出登录')) return;
    logout();
    navigate('/');
  };

  const handleAdminClick = () => {
    localStorage.setItem(auditSeenKey, String(pendingAuditCount));
    setSeenAuditCount(pendingAuditCount);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <span className="logo-mark"><FaSchool /></span>
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

          {currentUser ? (
            <>
              {currentUser.role === 'ADMIN' && (
                <Link to="/admin" className="nav-item admin-nav-item" style={{ position: 'relative' }} onClick={handleAdminClick}>
                  <span style={{ position: 'relative', display: 'inline-flex' }}>
                    <FaShieldAlt className="nav-icon" />
                    {newAuditCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-10px',
                        minWidth: '16px',
                        height: '16px',
                        padding: '0 4px',
                        borderRadius: '9px',
                        background: '#ff4d4f',
                        color: '#fff',
                        fontSize: '10px',
                        lineHeight: '16px',
                        fontWeight: '700',
                        boxSizing: 'border-box',
                        textAlign: 'center'
                      }}>
                        {newAuditCount > 99 ? '99+' : newAuditCount}
                      </span>
                    )}
                  </span>
                  <span>管理</span>
                </Link>
              )}
              <div className="user-menu">
                <button className="nav-item user-btn" onClick={() => navigate('/profile')}>
                  <FaUser className="nav-icon" />
                  <span>{currentUser.nickname || currentUser.username}</span>
                </button>
                <button className="logout-btn-nav" onClick={handleLogout} title="退出登录">
                  <FaSignOutAlt />
                </button>
              </div>
            </>
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

function AppContent() {
  const location = useLocation();
  const isAuthRoute = ['/auth-prompt', '/login', '/register'].includes(location.pathname);
  const isAuthPromptRoute = location.pathname === '/auth-prompt';

  useLayoutEffect(() => {
    document.body.classList.toggle('auth-route', isAuthRoute);
    document.body.classList.toggle('auth-prompt-route', isAuthPromptRoute);

    return () => {
      document.body.classList.remove('auth-route', 'auth-prompt-route');
    };
  }, [isAuthRoute, isAuthPromptRoute]);

  return (
    <>
      {!isAuthRoute && <Navbar />}
      <main className={`main-content${isAuthRoute ? ' main-content-auth' : ''}`}>
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
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user/:userId" element={<UserProfile />} />   {/* ← 新增路由 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
