import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import CategoryTabs from '../components/CategoryTabs';
import { postAPI } from '../api';
import { posts as mockPosts } from '../mockData';   // ← 导入假数据作为降级

function Home() {
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState('全部');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMock, setUsingMock] = useState(false);   // ← 标记是否正在使用假数据

  const fetchPosts = async (category) => {
    setLoading(true);
    setError(null);
    setUsingMock(false);

    try {
      const params = {};
      if (category && category !== '全部') {
        params.category = category;
      }
      const result = await postAPI.getList(params);
      setPosts(result.list || []);
    } catch (err) {
      console.warn('后端不可用，降级使用假数据:', err.message);
      setUsingMock(true);
      // 降级：用假数据，并根据分类过滤
      if (category && category !== '全部') {
        setPosts(mockPosts.filter(p => p.category === category));
      } else {
        setPosts(mockPosts);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(activeTag);
  }, [activeTag]);

  const handleReport = (post) => {
    localStorage.setItem('reportTarget', JSON.stringify({
      targetType: 'post',
      targetId: post.id,
      targetTitle: post.title,
      targetAuthor: post.author?.nickname || '未知'
    }));
    navigate('/report');
  };

  return (
    <div style={{ padding: '20px' }}>
      <CategoryTabs
        activeTag={activeTag}
        onTagChange={setActiveTag}
      />

      {usingMock && (
        <p style={{ textAlign: 'center', color: '#faad14', fontSize: '12px', margin: '8px 0' }}>
          ⚠️ 后端未连接，当前显示模拟数据
        </p>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
          加载中...
        </p>
      ) : posts.length > 0 ? (
        posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onReport={handleReport}
          />
        ))
      ) : (
        <p style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>
          该分类下暂无帖子
        </p>
      )}
    </div>
  );
}

export default Home;