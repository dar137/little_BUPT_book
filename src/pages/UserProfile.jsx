// src/pages/UserProfile.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { FaUser, FaEnvelope, FaIdCard } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// 模拟数据（当后端未就绪时使用）
const mockUserData = {
  101: { id: 101, name: '小明', studentId: '20240001', bio: '热爱摄影和前端', avatar: '', email: 'xiaoming@bupt.edu.cn' },
  102: { id: 102, name: '热心同学', studentId: '20240002', bio: '失物招领达人', avatar: '' },
};
const mockUserPosts = {
  101: [
    { id: 1, title: '求助：React 路由配置', content: '有没有大佬知道...', author: '小明', authorId: 101, time: '10分钟前', tag: '求助', likes: 5, comments: 3, image: '' },
    { id: 2, title: '分享一个好用的前端工具', content: '今天发现一个神器...', author: '小明', authorId: 101, time: '1小时前', tag: '分享', likes: 12, comments: 7, image: '' },
  ],
  102: [
    { id: 3, title: '图书馆四楼捡到一张校园卡', content: '失主叫张三...', author: '热心同学', authorId: 102, time: '昨天', tag: '失物招领', likes: 23, comments: 5, image: '' },
  ],
};

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
      try {
        // TODO: 替换为真实后端接口
        // const res = await fetch(`/api/user/${userId}`);
        // const userData = await res.json();
        // const postsRes = await fetch(`/api/user/${userId}/posts`);
        // const userPosts = await postsRes.json();

        // 临时使用模拟数据
        setTimeout(() => {
          const userData = mockUserData[userId];
          const userPosts = mockUserPosts[userId] || [];
          if (userData) {
            setUser(userData);
            setPosts(userPosts);
          } else {
            setError('用户不存在');
          }
          setLoading(false);
        }, 300);
      } catch (err) {
        setError('加载失败，请稍后重试');
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
            <img src={user.avatar} alt={user.name} style={styles.avatarImg} />
          ) : (
            <div style={styles.avatarPlaceholder}>{user.name.charAt(0)}</div>
          )}
        </div>
        <div style={styles.info}>
          <h2>{user.name}</h2>
          <p><FaIdCard /> 学号：{user.studentId}</p>
          {user.email && <p><FaEnvelope /> {user.email}</p>}
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
          posts.map(post => <PostCard key={post.id} post={post} onReport={() => {}} />)
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