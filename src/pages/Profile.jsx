import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaUser, FaEdit, FaHeart, FaBookmark, FaHistory, 
  FaSignOutAlt, FaCamera, FaComment,
  FaEnvelope, FaIdCard, FaSpinner, FaTrash
} from "react-icons/fa";
import { useAuth } from '../context/AuthContext';
import { postAPI, resolveAssetUrl, userAPI } from '../api';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser, logout } = useAuth();

  const [userInfo, setUserInfo] = useState(currentUser || { name: '', studentId: '', email: '', bio: '' });
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [historyPosts, setHistoryPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [stats, setStats] = useState({ likes: 0, comments: 0, favorites: 0, posts: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

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

    const loadProfileData = async () => {
      if (!currentUser?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [profileData, postsData] = await Promise.all([
          userAPI.getProfile(),
          userAPI.getMyPosts(),
        ]);
        const realPosts = postsData.list || [];
        if (profileData.avatar && profileData.avatar !== currentUser?.avatar) {
          setAvatarPreview(profileData.avatar);
          updateUser({ avatar: profileData.avatar });
        }
        setMyPosts(realPosts);
        setStats({
          likes: profileData.stats?.likesCount ?? 0,
          comments: profileData.stats?.commentsCount ?? 0,
          favorites: profileData.stats?.collectsCount ?? 0,
          posts: profileData.stats?.postsCount ?? realPosts.length
        });
      } catch {
        setMyPosts([]);
        setLikedPosts([]);
        setFavoritePosts([]);
        setHistoryPosts([]);
        setMyComments([]);
        setStats({ likes: 0, comments: 0, favorites: 0, posts: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [navigate, currentUser]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const loadTabData = async () => {
      setTabLoading(true);
      setTabError("");
      try {
        if (activeTab === "posts") {
          const data = await userAPI.getMyPosts();
          setMyPosts(data.list || []);
        } else if (activeTab === "likes") {
          const data = await userAPI.getMyLikes();
          setLikedPosts(data.list || []);
        } else if (activeTab === "favorites") {
          const data = await userAPI.getMyFavorites();
          setFavoritePosts(data.list || []);
        } else if (activeTab === "history") {
          const data = await userAPI.getMyHistory();
          setHistoryPosts(data.list || []);
        } else if (activeTab === "comments") {
          const data = await userAPI.getMyComments();
          setMyComments(data.list || []);
        }
      } catch (err) {
        setTabError(err.message || "加载列表失败");
      } finally {
        setTabLoading(false);
      }
    };

    loadTabData();
  }, [activeTab, currentUser?.id]);

  // 监听登录状态变化（用于退出登录后跳转）
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("token");
      if (!token) navigate("/login");
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, [navigate]);

  const handleLogout = () => {
    if (!window.confirm("是否确认退出登录")) return;
    logout();
    window.dispatchEvent(new Event('authChange'));
    navigate("/");
  };

  const handleSaveProfile = async () => {
    if (avatarFile && avatarFile.size > 5 * 1024 * 1024) {
      alert('头像大小不能超过 5MB');
      return;
    }

    try {
      let avatar = editForm.avatar ?? currentUser?.avatar ?? null;

      if (avatarFile) {
        setAvatarUploading(true);
        const uploadResult = await userAPI.uploadAvatar(avatarFile);
        avatar = uploadResult.avatar || uploadResult.url;
      }

      const updated = await userAPI.updateProfile({
        username: editForm.username,
        nickname: editForm.nickname,
        email: editForm.email,
        bio: editForm.bio,
        avatar,
      });
      setUserInfo(updated);
      setEditForm(updated);
      setAvatarFile(null);
      setAvatarPreview(updated.avatar || null);
      updateUser({
        ...updated,
        avatar: updated.avatar || avatar
      });
      setIsEditing(false);
      alert("资料更新成功！");
    } catch (err) {
      alert("资料更新失败：" + (err.message || "请稍后重试"));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('头像大小不能超过 5MB');
      return;
    }

    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const enterEditMode = () => {
    setEditForm({
      ...(currentUser || userInfo),
      username: (currentUser || userInfo)?.username || '',
      nickname: (currentUser || userInfo)?.nickname || '',
      email: (currentUser || userInfo)?.email || '',
      bio: (currentUser || userInfo)?.bio || '',
      avatar: (currentUser || userInfo)?.avatar || '',
    });
    setAvatarPreview((currentUser || userInfo)?.avatar || null);
    setAvatarFile(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(currentUser?.avatar || userInfo?.avatar || null);
    setAvatarFile(null);
    setEditForm(currentUser || userInfo || {});
    setIsEditing(false);
  };

  const displayAvatar = resolveAssetUrl(avatarPreview || currentUser?.avatar || null);
  const displayUser = currentUser || userInfo;
  const displayName = displayUser?.nickname || displayUser?.username || '用户';
  const tabs = [
    { key: "posts", label: "我的发帖", icon: <FaUser /> },
    { key: "likes", label: "我的点赞", icon: <FaHeart /> },
    { key: "favorites", label: "我的收藏", icon: <FaBookmark /> },
    { key: "history", label: "浏览历史", icon: <FaHistory /> },
    { key: "comments", label: "我的评论", icon: <FaComment /> },
  ];
  const isPostTakenDown = (post) => post?.status === "TAKEN_DOWN";
  const isPostRejected = (post) => post?.status === "REJECTED";
  const postTitle = (post) => isPostTakenDown(post) ? "该帖子已下架" : post.title;
  const postSummary = (post) => isPostTakenDown(post) ? "该帖子已下架" : post.summary;
  const aiReviewLabel = (post) => ({
    PASS: { text: "AI 合规", color: "#389e0d", background: "#f6ffed", border: "#b7eb8f" },
    NEED_HUMAN: { text: "AI 可疑", color: "#d48806", background: "#fffbe6", border: "#ffe58f" },
    REJECT: { text: "AI 不合规", color: "#cf1322", background: "#fff1f0", border: "#ffa39e" },
  }[post?.aiReview?.result]);

  const handleDeleteMyPost = async (postId) => {
    if (!window.confirm("是否删除该帖子")) return;

    try {
      await postAPI.deleteMine(postId);
      setMyPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      alert("删除失败：" + (err.message || "请稍后重试"));
    }
  };

  const handleDeleteMyComment = async (comment) => {
    if (!comment.post?.id) return;
    if (!window.confirm("是否删除该评论")) return;

    try {
      await postAPI.deleteComment(comment.post.id, comment.id);
      setMyComments(prev => prev.filter(item => item.id !== comment.id));
    } catch (err) {
      alert("删除失败：" + (err.message || "请稍后重试"));
    }
  };

  const handleEditRejectedPost = (post) => {
    sessionStorage.setItem('retryPostDraft', JSON.stringify({
      title: post.title || '',
      content: post.content || post.summary || '',
      category: post.category || '',
      estimatedPrice: post.estimatedPrice || '',
    }));
    navigate('/create?retry=1');
  };

  const renderListPost = (post, extra = null) => (
    <div key={`${post.id}-${extra || ""}`} style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <h4>{postTitle(post)}</h4>
        <p>作者：{post.author?.nickname || post.author || '匿名用户'}</p>
      </Link>
      <div style={{ color: '#999', fontSize: '12px', marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {extra && <span>{extra}</span>}
        <span>{post.createdAt}</span>
        <span>❤️ {post.likesCount || 0}</span>
        <span>⭐ {post.collectsCount || 0}</span>
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
                {displayName.charAt(0)}
              </div>
            )}
            {isEditing && (
              <button disabled={avatarUploading} onClick={() => fileInputRef.current?.click()} style={{ position: 'absolute', bottom: '0', right: '0', background: avatarUploading ? '#a0aec0' : '#667eea', border: 'none', width: '28px', height: '28px', borderRadius: '50%', color: 'white', cursor: avatarUploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {avatarUploading ? <FaSpinner size={12} className="spinning" /> : <FaCamera size={12} />}
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>

          <div style={{ flex: 1 }}>
            {!isEditing ? (
              <>
                <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>{displayName}</div>
                <div style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}><FaIdCard size={12} /> {displayUser?.username}</div>
                {displayUser?.email && <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}><FaEnvelope size={12} /> {displayUser.email}</div>}
                <div style={{ color: '#999', fontSize: '13px', marginBottom: '12px' }}>{displayUser?.bio || "这个人很懒，什么都没写~"}</div>
                <button onClick={enterEditMode} style={{ background: '#f0f0f0', border: 'none', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer' }}><FaEdit /> 编辑资料</button>
              </>
            ) : (
              <div>
                <div style={{ marginBottom: '12px' }}><label>昵称</label><input value={editForm.nickname || ""} onChange={(e) => setEditForm({...editForm, nickname: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                <div style={{ marginBottom: '12px' }}><label>学号</label><input value={editForm.username || ""} onChange={(e) => setEditForm({...editForm, username: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                <div style={{ marginBottom: '12px' }}><label>邮箱</label><input value={editForm.email || ""} onChange={(e) => setEditForm({...editForm, email: e.target.value})} placeholder="请输入邮箱" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                <div style={{ marginBottom: '12px' }}><label>个人简介</label><textarea value={editForm.bio || ""} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} rows="2" placeholder="介绍一下自己吧~" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                <div style={{ display: 'flex', gap: '12px' }}><button onClick={handleSaveProfile} disabled={avatarUploading} style={{ background: avatarUploading ? '#9ae6b4' : '#48bb78', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '20px' }}>{avatarUploading ? '保存中...' : '保存'}</button><button onClick={cancelEdit} style={{ background: '#e2e8f0', border: 'none', padding: '6px 16px', borderRadius: '20px' }}>取消</button></div>
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
        <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#222' }}>{stats.likes}</div><div style={{ fontSize: '12px', color: '#999' }}>点赞数</div></div>
        <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#222' }}>{stats.favorites}</div><div style={{ fontSize: '12px', color: '#999' }}>收藏数</div></div>
        <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#222' }}>{stats.comments}</div><div style={{ fontSize: '12px', color: '#999' }}>评论数</div></div>
      </div>

      {/* Tab 切换 */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #eee', marginBottom: '24px', paddingBottom: '8px', flexWrap: 'wrap' }}>
        {tabs.map(tab => {
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer',
              fontSize: '15px', fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              borderBottom: activeTab === tab.key ? '2px solid #ff6b6b' : 'none',
              color: activeTab === tab.key ? '#ff6b6b' : '#666'
            }}>{tab.icon} {tab.label}</button>
          );
        })}
      </div>

      {/* 内容区域 */}
      <div>
        {tabLoading && <div style={{ textAlign: 'center', padding: '16px', color: '#999' }}>加载中...</div>}
        {tabError && <div style={{ textAlign: 'center', padding: '16px', color: '#f56565' }}>{tabError}</div>}

        {activeTab === "posts" && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {myPosts.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无发帖</div> :
              myPosts.map(post => (
                <div key={post.id} style={{ position: 'relative' }}>
                  <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform 0.2s' }}>
                      {post.coverImage && <img src={post.coverImage} alt={post.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />}
                      <div style={{ padding: '12px', paddingBottom: (isPostTakenDown(post) || isPostRejected(post)) ? '78px' : '36px' }}>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</h4>
                        {post.summary && <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '13px' }}>{post.summary}</p>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}><span>{post.category}</span><span>{post.createdAt}</span></div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', fontSize: '12px', color: '#666' }}><span>❤️ {post.likesCount || 0}</span><span>💬 {post.commentsCount || 0}</span></div>
                        {aiReviewLabel(post) && (
                          <div style={{ display: 'inline-block', marginTop: '10px', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', color: aiReviewLabel(post).color, background: aiReviewLabel(post).background, border: `1px solid ${aiReviewLabel(post).border}` }}>
                            {aiReviewLabel(post).text}
                          </div>
                        )}
                        {isPostTakenDown(post) && (
                          <div style={{ marginTop: '10px', padding: '8px 10px', background: '#fff7e6', border: '1px solid #ffd591', borderRadius: '8px', color: '#ad6800', fontSize: '13px' }}>
                            该帖子已被封禁
                          </div>
                        )}
                        {isPostRejected(post) && (
                          <div style={{ marginTop: '10px', padding: '8px 10px', background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: '8px', color: '#cf1322', fontSize: '13px' }}>
                            已打回：{post.aiReview?.reason || '内容未通过审核'}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                  {isPostRejected(post) && (
                    <button
                      type="button"
                      onClick={() => handleEditRejectedPost(post)}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        bottom: '12px',
                        border: '1px solid #91caff',
                        background: '#e6f4ff',
                        color: '#1677ff',
                        borderRadius: '16px',
                        height: '30px',
                        padding: '0 12px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      重新编辑
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteMyPost(post.id)}
                    title="删除帖子"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      bottom: '12px',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      border: '1px solid #fed7d7',
                      background: '#fff5f5',
                      color: '#e53e3e',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FaTrash size={13} />
                  </button>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "likes" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {likedPosts.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无点赞</div> :
              likedPosts.map(post => renderListPost(post))
            }
          </div>
        )}

        {activeTab === "favorites" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {favoritePosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <FaBookmark size={32} style={{ marginBottom: '12px' }} />
                <p>暂无收藏</p>
              </div>
            ) : (
              favoritePosts.map(post => renderListPost(post))
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {historyPosts.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无浏览历史</div> :
              historyPosts.map((post, i) => renderListPost(post, `浏览于 ${post.viewedAt || ""}`))
            }
          </div>
        )}

        {activeTab === "comments" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myComments.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无评论</div> :
              myComments.map(comment => (
                <div key={comment.id} style={{ background: 'white', borderRadius: '12px', padding: '12px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 6px 0', color: '#4a5568', fontSize: '14px' }}>{comment.content}</p>
                    <Link to={`/post/${comment.post?.id}`} style={{ textDecoration: 'none', color: '#718096', fontSize: '12px' }}>
                      被评论帖子：{postTitle(comment.post)}
                    </Link>
                    <div style={{ color: '#999', fontSize: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <span>{comment.createdAt}</span>
                      <span>状态：{comment.status}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteMyComment(comment)}
                        style={{ border: 'none', background: 'transparent', color: '#e53e3e', cursor: 'pointer', padding: 0, fontSize: '12px' }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  {comment.post?.coverImage && (
                    <img
                      src={comment.post.coverImage}
                      alt={comment.post.title}
                      style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', flex: '0 0 auto' }}
                    />
                  )}
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
