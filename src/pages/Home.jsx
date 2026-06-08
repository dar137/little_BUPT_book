import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import CategoryTabs from '../components/CategoryTabs';
import { postAPI } from '../api';

function Home() {
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState('全部');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取帖子列表
  const fetchPosts = async (category) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (category && category !== '全部') {
        params.category = category;
      }
      const result = await postAPI.getList(params);
      setPosts(result.list || []);
    } catch (err) {
      console.error('获取帖子失败:', err);
      setError(err.message || '加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(activeTag);
  }, [activeTag]);

  // 处理举报点击（保留原有逻辑，但需适配新的 post 结构）
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

      {loading ? (
        <p style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
          加载中...
        </p>
      ) : error ? (
        <p style={{ textAlign: 'center', color: '#ff4d4f', marginTop: '40px' }}>
          {error}
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