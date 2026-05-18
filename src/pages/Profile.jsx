import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaUser, FaEdit, FaHeart, FaBookmark, FaHistory, 
  FaSignOutAlt, FaCamera, FaThumbsUp, FaComment,
  FaEnvelope, FaIdCard, FaCalendarAlt
} from "react-icons/fa";
import { useFavorites } from '../context/FavoriteContext';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
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
  const navigate = useNavigate();
  const { favoriteIds, toggleFavorite, isFavorited } = useFavorites();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserInfo(user);
      setEditForm(user);
      const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
      if (savedAvatar) setAvatarPreview(savedAvatar);
    }

    loadMockData();
  }, [navigate]);

  const loadMockData = () => {
    const posts = [
      { id: 1, title: "求助：React 路由配置", content: "有没有大佬知道...", createdAt: "2024-01-15", likes: 5, comments: 3, tag: "求助" },
      { id: 2, title: "分享一个好用的前端工具", content: "今天发现一个神器...", createdAt: "2024-01-20", likes: 12, comments: 7, tag: "分享" },
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
      favorites: 2,
      posts: posts.length
    });
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const handleSaveProfile = () => {
    localStorage.setItem("userInfo", JSON.stringify(editForm));
    setUserInfo(editForm);
    if (avatarPreview) {
      localStorage.setItem(`avatar_${userInfo.id}`, avatarPreview);
    }
    setIsEditing(false);
    alert("资料更新成功！");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
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

  if (isLoading) return <div className="loading">加载中...</div>;

  return (
    <div className="profile-container">
      {/* 用户信息卡片 */}
      <div className="profile-header-card">
        <div className="profile-cover"></div>
        <div className="profile-info-section">
          <div className="profile-avatar">
            {avatarPreview ? (
              <img src={avatarPreview} alt="头像" />
            ) : (
              <div className="avatar-placeholder">{userInfo?.name?.charAt(0)}</div>
            )}
            {!isEditing && (
              <button className="avatar-edit-btn" onClick={() => fileInputRef.current?.click()}>
                <FaCamera />
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
          </div>
          
          {!isEditing ? (
            <>
              <div className="profile-name">{userInfo?.name}</div>
              <div className="profile-student-id"><FaIdCard /> {userInfo?.studentId}</div>
              {userInfo?.email && <div className="profile-email"><FaEnvelope /> {userInfo.email}</div>}
              <div className="profile-bio">{userInfo?.bio || "这个人很懒，什么都没写~"}</div>
              <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                <FaEdit /> 编辑资料
              </button>
            </>
          ) : (
            <div className="edit-form">
              <div className="form-group"><label>姓名</label><input className="input" name="name" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} /></div>
              <div className="form-group"><label>邮箱</label><input className="input" name="email" value={editForm.email || ""} onChange={(e) => setEditForm({...editForm, email: e.target.value})} placeholder="请输入邮箱" /></div>
              <div className="form-group"><label>个人简介</label><textarea className="input" name="bio" value={editForm.bio || ""} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} rows="3" placeholder="介绍一下自己吧~" /></div>
              <div className="edit-buttons"><button className="btn-save" onClick={handleSaveProfile}>保存</button><button className="btn-cancel" onClick={() => setIsEditing(false)}>取消</button></div>
            </div>
          )}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="stats-grid">
        <StatCard icon={<FaThumbsUp />} label="获赞数" value={stats.likes} color="#667eea" />
        <StatCard icon={<FaHeart />} label="点赞数" value={likedPosts.length} color="#f5576c" />
        <StatCard icon={<FaBookmark />} label="收藏数" value={stats.favorites} color="#f6ad55" />
        <StatCard icon={<FaComment />} label="评论数" value={stats.comments} color="#48bb78" />
      </div>

      {/* Tab 切换 */}
      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}><FaUser /> 我的发帖</button>
        <button className={`tab-btn ${activeTab === "likes" ? "active" : ""}`} onClick={() => setActiveTab("likes")}><FaHeart /> 我的点赞</button>
        <button className={`tab-btn ${activeTab === "favorites" ? "active" : ""}`} onClick={() => setActiveTab("favorites")}><FaBookmark /> 我的收藏</button>
        <button className={`tab-btn ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}><FaHistory /> 浏览历史</button>
      </div>

      {/* Tab 内容 */}
      <div className="tab-content">
        {activeTab === "posts" && myPosts.map(post => (
          <div key={post.id} className="post-card-mini"><Link to={`/post/${post.id}`}><h4>{post.title}</h4><p>{post.content}</p></Link><div className="post-meta-mini"><span>{post.tag}</span><span>{post.createdAt}</span><span>❤️ {post.likes}</span><span>💬 {post.comments}</span></div></div>
        ))}
        {activeTab === "likes" && likedPosts.map(post => (
          <div key={post.id} className="post-card-mini"><Link to={`/post/${post.id}`}><h4>{post.title}</h4><p>作者：{post.author}</p></Link><div className="post-meta-mini"><span>{post.createdAt}</span><span>❤️ {post.likes}</span></div></div>
        ))}
        {activeTab === "favorites" && favoritePosts.map(post => (
          <div key={post.id} className="post-card-mini"><Link to={`/post/${post.id}`}><h4>{post.title}</h4><p>作者：{post.author}</p></Link><div className="post-meta-mini"><span>{post.createdAt}</span><span>❤️ {post.likes}</span></div></div>
        ))}
        {activeTab === "history" && historyPosts.map((post, i) => (
          <div key={i} className="post-card-mini"><Link to={`/post/${post.id}`}><h4>{post.title}</h4></Link><div className="post-meta-mini"><span>🕐 {post.viewedAt}</span></div></div>
        ))}
      </div>

      <button className="logout-btn" onClick={handleLogout}><FaSignOutAlt /> 退出登录</button>
    </div>
  );
};

export default Profile;