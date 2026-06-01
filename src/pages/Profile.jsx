import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaUser, FaEdit, FaHeart, FaBookmark, FaHistory, 
  FaSignOutAlt, FaCamera, FaThumbsUp, FaComment,
  FaEnvelope, FaIdCard, FaTrash, FaSpinner
} from "react-icons/fa";
import { useFavorites } from '../context/FavoriteContext';
import { useAuth } from '../context/AuthContext';   // 新增

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser } = useAuth();    // 获取全局用户信息和方法
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();

  // 本地状态：用于编辑表单、预览头像等
  const [userInfo, setUserInfo] = useState(currentUser || { name: '', studentId: '', email: '', bio: '' });
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [historyPosts, setHistoryPosts] = useState([]);
  const [stats, setStats] = useState({ likes: 0, comments: 0, favorites: 0, posts: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);

  // 加载模拟数据（帖子、点赞等）
  const loadMockData = () => {
    const posts = [
      { 
        id: 1, 
        title: "求助：React 路由配置", 
        content: "有没有大佬知道...", 
        createdAt: "2024-01-15", 
        likes: 5, 
        comments: 3, 
        tag: "求助",
        image: "https://picsum.photos/id/1/200/150"
      },
      { 
        id: 2, 
        title: "分享一个好用的前端工具", 
        content: "今天发现一个神器...", 
        createdAt: "2024-01-20", 
        likes: 12, 
        comments: 7, 
        tag: "分享",
        image: "https://picsum.photos/id/20/200/150"
      },
    ];
    setMyPosts(posts);
    setLikedPosts([
      { id: 5, title: "Webpack 配置详解", author: "技术大佬", createdAt: "2024-01-10", likes: 45 },
    ]);
    setFavoritePosts([
      { id: 7, title: "JavaScript 进阶指南", author: "老马", createdAt: "2024-01-05", likes: 89 },
    ]);
    setHistoryPosts([
      { id: 3, title: "关于毕业设计的思考", viewedAt: "2024-01-26 15:30" },
    ]);
    setStats({
      likes: posts.reduce((sum, p) => sum + p.likes, 0) + 45 + 89,
      comments: posts.reduce((sum, p) => sum + p.comments, 0),
      favorites: favoriteIds.length,
      posts: posts.length
    });
    setIsLoading(false);
  };

  // 初始化：如果没有登录则跳转，否则从全局 currentUser 同步到本地
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (currentUser) {
      setUserInfo(currentUser);
      setEditForm(currentUser);
      // 如果有保存的头像预览，从 localStorage 加载（可选的）
      const savedAvatar = localStorage.getItem(`avatar_${currentUser.id}`);
      if (savedAvatar) setAvatarPreview(savedAvatar);
    } else {
      // 降级：尝试从 localStorage 读取（防止 AuthContext 未就绪）
      const storedUser = localStorage.getItem("userInfo");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserInfo(user);
        setEditForm(user);
      }
    }
    loadMockData();
  }, [navigate, currentUser]);

  // 监听全局登录状态变化
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("token");
      if (!token) navigate("/login");
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, [navigate]);

  // 当收藏变化时更新统计
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      favorites: favoriteIds.length
    }));
  }, [favoriteIds]);

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("favoritePosts");
    window.dispatchEvent(new Event('authChange'));
    navigate("/");
  };

  // 保存个人资料（同时同步到全局 AuthContext）
  const handleSaveProfile = () => {
    // 更新本地状态
    setUserInfo(editForm);
    // 同步到全局
    updateUser({
      name: editForm.name,
      studentId: editForm.studentId,
      email: editForm.email,
      bio: editForm.bio,
      avatar: avatarPreview || currentUser?.avatar
    });
    // 同步到 localStorage（可选，便于其他组件读取）
    localStorage.setItem("userInfo", JSON.stringify(editForm));
    if (avatarPreview) {
      localStorage.setItem(`avatar_${userInfo.id}`, avatarPreview);
    }
    setIsEditing(false);
    alert("资料更新成功！");
  };

  // 上传头像（同步到全局）
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result;
        setAvatarPreview(newAvatar);
        // 同步到全局 AuthContext
        updateUser({ avatar: newAvatar });
        // 同时存入 localStorage
        if (userInfo?.id) {
          localStorage.setItem(`avatar_${userInfo.id}`, newAvatar);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 取消收藏
  const handleRemoveFavorite = (postId, e) => {
    e.preventDefault();
    toggleFavorite(postId);
  };

  const StatCard = ({ icon, label, value, color }) => (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-icon" style={{ background: color }}>{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinning" />
        <p>加载中...</p>
      </div>
    );
  }

  // 展示用的用户信息优先从全局 currentUser 取（实时同步）
  const displayUser = currentUser || userInfo;

  return (
    <div className="profile-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* 用户信息卡片 */}
      <div className="profile-header-card" style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
        <div className="profile-info-section" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* 头像区域 */}
          <div className="profile-avatar" style={{ position: 'relative', width: '88px', height: '88px' }}>
            {(avatarPreview || displayUser?.avatar) ? (
              <img src={avatarPreview || displayUser.avatar} alt="头像" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
            ) : (
              <div className="avatar-placeholder" style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
                {displayUser?.name?.charAt(0) || 'U'}
              </div>
            )}
            {!isEditing && (
              <button className="avatar-edit-btn" onClick={() => fileInputRef.current?.click()} style={{ position: 'absolute', bottom: '0', right: '0', background: '#667eea', border: 'none', width: '28px', height: '28px', borderRadius: '50%', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaCamera size={12} />
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
          </div>

          <div style={{ flex: 1 }}>
            {!isEditing ? (
              <>
                <div className="profile-name" style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>{displayUser?.name}</div>
                <div className="profile-student-id" style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}><FaIdCard size={12} /> {displayUser?.studentId}</div>
                {displayUser?.email && <div className="profile-email" style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}><FaEnvelope size={12} /> {displayUser.email}</div>}
                <div className="profile-bio" style={{ color: '#999', fontSize: '13px', marginBottom: '12px' }}>{displayUser?.bio || "这个人很懒，什么都没写~"}</div>
                <button className="edit-profile-btn" onClick={() => setIsEditing(true)} style={{ background: '#f0f0f0', border: 'none', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer' }}><FaEdit /> 编辑资料</button>
              </>
            ) : (
              <div className="edit-form">
                <div className="form-group" style={{ marginBottom: '12px' }}><label>姓名</label><input className="input" name="name" value={editForm.name || ""} onChange={(e) => setEditForm({...editForm, name: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                <div className="form-group" style={{ marginBottom: '12px' }}><label>邮箱</label><input className="input" name="email" value={editForm.email || ""} onChange={(e) => setEditForm({...editForm, email: e.target.value})} placeholder="请输入邮箱" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                <div className="form-group" style={{ marginBottom: '12px' }}><label>个人简介</label><textarea className="input" name="bio" value={editForm.bio || ""} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} rows="2" placeholder="介绍一下自己吧~" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                <div className="edit-buttons" style={{ display: 'flex', gap: '12px' }}><button className="btn-save" onClick={handleSaveProfile} style={{ background: '#48bb78', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '20px' }}>保存</button><button className="btn-cancel" onClick={() => setIsEditing(false)} style={{ background: '#e2e8f0', border: 'none', padding: '6px 16px', borderRadius: '20px' }}>取消</button></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard icon={<FaThumbsUp />} label="获赞数" value={stats.likes} color="#667eea" />
        <StatCard icon={<FaHeart />} label="点赞数" value={likedPosts.length} color="#f5576c" />
        <StatCard icon={<FaBookmark />} label="收藏数" value={stats.favorites} color="#f6ad55" />
        <StatCard icon={<FaComment />} label="评论数" value={stats.comments} color="#48bb78" />
      </div>

      {/* Tab 切换 */}
      <div className="profile-tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #eee', marginBottom: '24px', paddingBottom: '8px' }}>
        <button className={`tab-btn ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")} style={{ background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer', fontSize: '15px', fontWeight: activeTab === "posts" ? 'bold' : 'normal', borderBottom: activeTab === "posts" ? '2px solid #ff6b6b' : 'none' }}><FaUser /> 我的发帖</button>
        <button className={`tab-btn ${activeTab === "likes" ? "active" : ""}`} onClick={() => setActiveTab("likes")} style={{ background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer', fontSize: '15px', fontWeight: activeTab === "likes" ? 'bold' : 'normal', borderBottom: activeTab === "likes" ? '2px solid #ff6b6b' : 'none' }}><FaHeart /> 我的点赞</button>
        <button className={`tab-btn ${activeTab === "favorites" ? "active" : ""}`} onClick={() => setActiveTab("favorites")} style={{ background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer', fontSize: '15px', fontWeight: activeTab === "favorites" ? 'bold' : 'normal', borderBottom: activeTab === "favorites" ? '2px solid #ff6b6b' : 'none' }}><FaBookmark /> 我的收藏</button>
        <button className={`tab-btn ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")} style={{ background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer', fontSize: '15px', fontWeight: activeTab === "history" ? 'bold' : 'normal', borderBottom: activeTab === "history" ? '2px solid #ff6b6b' : 'none' }}><FaHistory /> 浏览历史</button>
      </div>

      {/* Tab 内容 */}
      <div className="tab-content">
        {/* 我的发帖 - 网格布局带图片 */}
        {activeTab === "posts" && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {myPosts.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#999' }}>暂无发帖</div>
            ) : (
              myPosts.map(post => (
                <Link to={`/post/${post.id}`} key={post.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="post-grid-card" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform 0.2s', cursor: 'pointer' }}>
                    {post.image && <img src={post.image} alt={post.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />}
                    <div style={{ padding: '12px' }}>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}>
                        <span>{post.tag}</span>
                        <span>{post.createdAt}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '10px', fontSize: '12px', color: '#666' }}>
                        <span>❤️ {post.likes}</span>
                        <span>💬 {post.comments}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* 我的点赞 - 列表样式 */}
        {activeTab === "likes" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {likedPosts.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无点赞</div>
            ) : (
              likedPosts.map(post => (
                <div key={post.id} className="post-card-mini" style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h4>{post.title}</h4>
                    <p>作者：{post.author}</p>
                  </Link>
                  <div className="post-meta-mini" style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                    <span>{post.createdAt}</span>
                    <span>❤️ {post.likes}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 我的收藏 */}
        {activeTab === "favorites" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {favoriteIds.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <FaBookmark />
                <p>暂无收藏</p>
                <p className="empty-hint">遇到喜欢的帖子，点击❤️收藏吧~</p>
              </div>
            ) : (
              favoriteIds.map(id => (
                <div key={id} className="post-card-mini favorite-card" style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <Link to={`/post/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h4>帖子 {id}</h4>
                    <p>点击查看详情</p>
                  </Link>
                  <button className="remove-favorite-btn" onClick={(e) => handleRemoveFavorite(id, e)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', marginTop: '8px', fontSize: '12px' }}>
                    <FaTrash /> 取消收藏
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 浏览历史 */}
        {activeTab === "history" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {historyPosts.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无浏览记录</div>
            ) : (
              historyPosts.map((post, i) => (
                <div key={i} className="post-card-mini" style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h4>{post.title}</h4>
                  </Link>
                  <div className="post-meta-mini" style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                    <span>🕐 {post.viewedAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <button className="logout-btn" onClick={handleLogout} style={{ width: '100%', marginTop: '32px', padding: '12px', background: '#fef0f0', border: 'none', borderRadius: '40px', color: '#ff6b6b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <FaSignOutAlt /> 退出登录
      </button>
    </div>
  );
};

export default Profile;