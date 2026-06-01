import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaUser, FaEdit, FaHeart, FaBookmark, FaHistory, 
  FaSignOutAlt, FaCamera, FaThumbsUp, FaComment,
  FaEnvelope, FaIdCard, FaTrash, FaSpinner
} from "react-icons/fa";
import { useFavorites } from '../context/FavoriteContext';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser, logout } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();  // favoriteIds 是 Set

  const [userInfo, setUserInfo] = useState(currentUser || { name: '', studentId: '', email: '', bio: '' });
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [historyPosts, setHistoryPosts] = useState([]);
  const [stats, setStats] = useState({ likes: 0, comments: 0, favorites: 0, posts: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);

  // 模拟数据加载
  const loadMockData = () => {
    const posts = [
      { id: 1, title: "求助：React 路由配置", content: "有没有大佬知道...", createdAt: "2024-01-15", likes: 5, comments: 3, tag: "求助", image: "https://picsum.photos/id/1/200/150" },
      { id: 2, title: "分享一个好用的前端工具", content: "今天发现一个神器...", createdAt: "2024-01-20", likes: 12, comments: 7, tag: "分享", image: "https://picsum.photos/id/20/200/150" },
    ];
    setMyPosts(posts);
    setLikedPosts([
      { id: 5, title: "Webpack 配置详解", author: "技术大佬", createdAt: "2024-01-10", likes: 45 },
    ]);
    setHistoryPosts([
      { id: 3, title: "关于毕业设计的思考", viewedAt: "2024-01-26 15:30" },
    ]);
    setStats({
      likes: posts.reduce((sum, p) => sum + p.likes, 0) + 45,
      comments: posts.reduce((sum, p) => sum + p.comments, 0),
      favorites: favoriteIds.size,
      posts: posts.length
    });
    setIsLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (currentUser) {
      setUserInfo(currentUser);
      setEditForm(currentUser);
      if (currentUser.avatar) setAvatarPreview(currentUser.avatar);
    }
    loadMockData();
  }, [navigate, currentUser]);

  // 监听登录状态变化（用于退出登录后跳转）
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
    setStats(prev => ({ ...prev, favorites: favoriteIds.size }));
  }, [favoriteIds]);

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event('authChange'));
    navigate("/");
  };

  const handleSaveProfile = () => {
    setUserInfo(editForm);
    updateUser({
      name: editForm.name,
      studentId: editForm.studentId,
      email: editForm.email,
      bio: editForm.bio,
      avatar: avatarPreview || currentUser?.avatar
    });
    setIsEditing(false);
    alert("资料更新成功！");
  };

  // 头像上传：预览 + 同步到全局
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result;
        setAvatarPreview(newAvatar);
        updateUser({ avatar: newAvatar });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFavorite = (postId, e) => {
    e.preventDefault();
    toggleFavorite(postId);
  };

  const displayAvatar = avatarPreview || currentUser?.avatar || null;
  const displayUser = currentUser || userInfo;

  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinning" />
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="profile-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* 用户信息卡片 */}
      <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '88px', height: '88px' }}>
            {displayAvatar ? (
              <img src={displayAvatar} alt="头像" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
                {displayUser?.name?.charAt(0) || 'U'}
              </div>
            )}
            {!isEditing && (
              <button onClick={() => fileInputRef.current?.click()} style={{ position: 'absolute', bottom: '0', right: '0', background: '#667eea', border: 'none', width: '28px', height: '28px', borderRadius: '50%', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaCamera size={12} />
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>

          <div style={{ flex: 1 }}>
            {!isEditing ? (
              <>
                <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>{displayUser?.name}</div>
                <div style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}><FaIdCard size={12} /> {displayUser?.studentId}</div>
                {displayUser?.email && <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}><FaEnvelope size={12} /> {displayUser.email}</div>}
                <div style={{ color: '#999', fontSize: '13px', marginBottom: '12px' }}>{displayUser?.bio || "这个人很懒，什么都没写~"}</div>
                <button onClick={() => setIsEditing(true)} style={{ background: '#f0f0f0', border: 'none', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer' }}><FaEdit /> 编辑资料</button>
              </>
            ) : (
              <div>
                <div style={{ marginBottom: '12px' }}><label>姓名</label><input value={editForm.name || ""} onChange={(e) => setEditForm({...editForm, name: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                <div style={{ marginBottom: '12px' }}><label>邮箱</label><input value={editForm.email || ""} onChange={(e) => setEditForm({...editForm, email: e.target.value})} placeholder="请输入邮箱" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                <div style={{ marginBottom: '12px' }}><label>个人简介</label><textarea value={editForm.bio || ""} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} rows="2" placeholder="介绍一下自己吧~" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                <div style={{ display: 'flex', gap: '12px' }}><button onClick={handleSaveProfile} style={{ background: '#48bb78', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '20px' }}>保存</button><button onClick={() => setIsEditing(false)} style={{ background: '#e2e8f0', border: 'none', padding: '6px 16px', borderRadius: '20px' }}>取消</button></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        textAlign: 'center',
        marginBottom: '32px',
        padding: '12px 0',
        borderTop: '1px solid #f0f0f0',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#222' }}>{stats.likes}</div><div style={{ fontSize: '12px', color: '#999' }}>获赞数</div></div>
        <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#222' }}>{likedPosts.length}</div><div style={{ fontSize: '12px', color: '#999' }}>点赞数</div></div>
        <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#222' }}>{favoriteIds.size}</div><div style={{ fontSize: '12px', color: '#999' }}>收藏数</div></div>
        <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#222' }}>{stats.comments}</div><div style={{ fontSize: '12px', color: '#999' }}>评论数</div></div>
      </div>

      {/* Tab 切换 */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #eee', marginBottom: '24px', paddingBottom: '8px' }}>
        {['posts', 'likes', 'favorites', 'history'].map(tab => {
          const icons = { posts: <FaUser />, likes: <FaHeart />, favorites: <FaBookmark />, history: <FaHistory /> };
          const labels = { posts: '我的发帖', likes: '我的点赞', favorites: '我的收藏', history: '浏览历史' };
          return (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer',
              fontSize: '15px', fontWeight: activeTab === tab ? 'bold' : 'normal',
              borderBottom: activeTab === tab ? '2px solid #ff6b6b' : 'none',
              color: activeTab === tab ? '#ff6b6b' : '#666'
            }}>{icons[tab]} {labels[tab]}</button>
          );
        })}
      </div>

      {/* 内容区域 */}
      <div>
        {activeTab === "posts" && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {myPosts.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无发帖</div> :
              myPosts.map(post => (
                <Link to={`/post/${post.id}`} key={post.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform 0.2s' }}>
                    {post.image && <img src={post.image} alt={post.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />}
                    <div style={{ padding: '12px' }}>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}><span>{post.tag}</span><span>{post.createdAt}</span></div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '10px', fontSize: '12px', color: '#666' }}><span>❤️ {post.likes}</span><span>💬 {post.comments}</span></div>
                    </div>
                  </div>
                </Link>
              ))
            }
          </div>
        )}

        {activeTab === "likes" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {likedPosts.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无点赞</div> :
              likedPosts.map(post => (
                <div key={post.id} style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}><h4>{post.title}</h4><p>作者：{post.author}</p></Link>
                  <div style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}><span>{post.createdAt}</span><span>❤️ {post.likes}</span></div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "favorites" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {favoriteIds.size === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <FaBookmark size={32} style={{ marginBottom: '12px' }} />
                <p>暂无收藏</p>
                <p style={{ fontSize: '12px' }}>遇到喜欢的帖子，点击❤️收藏吧~</p>
              </div>
            ) : (
              Array.from(favoriteIds).map(id => (
                <div key={id} style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <Link to={`/post/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}><h4>帖子 {id}</h4><p>点击查看详情</p></Link>
                  <button onClick={(e) => handleRemoveFavorite(id, e)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', marginTop: '8px', fontSize: '12px' }}><FaTrash /> 取消收藏</button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {historyPosts.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无浏览记录</div> :
              historyPosts.map((post, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}><h4>{post.title}</h4></Link>
                  <div style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}><span>🕐 {post.viewedAt}</span></div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      <button onClick={handleLogout} style={{ width: '100%', marginTop: '32px', padding: '12px', background: '#fef0f0', border: 'none', borderRadius: '40px', color: '#ff6b6b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <FaSignOutAlt /> 退出登录
      </button>
    </div>
  );
};

export default Profile;