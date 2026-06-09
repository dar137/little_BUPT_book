// src/pages/UserProfile.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { resolveAssetUrl, userAPI } from '../api';

const UserProfile = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = currentUser?.id === parseInt(userId);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError('');
      try {
        const [userData, postsData] = await Promise.all([
          userAPI.getPublicProfile(userId),
          userAPI.getUserPosts(userId),
        ]);
        setUser(userData);
        setPosts(postsData.list || []);
      } catch (err) {
        setError(err.message || '用户不存在');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  if (loading) return <div style={styles.loading}>加载中...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!user) return <div style={styles.error}>用户未找到</div>;

  return (
    <div className="user-profile-container" style={styles.container}>
      {/* 用户信息卡片 */}
      <div style={styles.card}>
        <div style={styles.avatar}>
          {user.avatar ? (
            <img src={resolveAssetUrl(user.avatar)} alt={user.nickname} style={styles.avatarImg} />
          ) : (
            <div style={styles.avatarPlaceholder}>{(user.nickname || user.username || '?').charAt(0)}</div>
          )}
        </div>
        <div style={styles.info}>
          <h2>{user.nickname || user.username}</h2>
          <p className="bio">{user.bio || '这个人很懒，什么都没写~'}</p>
          {isOwnProfile && (
            <Link to="/profile" style={styles.editBtn}>编辑资料</Link>
          )}
        </div>
      </div>

      {/* 帖子列表 */}
      <div style={styles.postsSection}>
        <h3>Ta 的帖子</h3>
        {posts.length === 0 ? (
          <p>暂无帖子</p>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '20px' },
  card: { display: 'flex', gap: '24px', background: 'white', borderRadius: '24px', padding: '24px', marginBottom: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  avatar: { width: '100px', height: '100px', flexShrink: 0 },
  avatarImg: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' },
  info: { flex: 1 },
  editBtn: { display: 'inline-block', marginTop: '12px', padding: '6px 16px', background: '#f0f0f0', borderRadius: '20px', textDecoration: 'none', color: '#333', fontSize: '14px' },
  postsSection: { marginTop: '20px' },
  loading: { textAlign: 'center', padding: '60px' },
  error: { textAlign: 'center', padding: '60px', color: 'red' },
};

export default UserProfile;
