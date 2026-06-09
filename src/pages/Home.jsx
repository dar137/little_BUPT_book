import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import CategoryTabs from '../components/CategoryTabs';
import { categoryAPI, postAPI } from '../api';

function Home() {
  const [activeTag, setActiveTag] = useState('全部');
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState(['全部']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError(err.message || '帖子加载失败');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(activeTag);
  }, [activeTag]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await categoryAPI.getList();
        const names = (result.list || []).map(item => item.name).filter(Boolean);
        setCategories(['全部', ...names]);
      } catch {
        setCategories(['全部']);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <CategoryTabs
        tags={categories}
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
