import { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // 新增：用于跳转
import PostCard from '../components/PostCard';
import CategoryTabs from '../components/CategoryTabs';
import { posts } from '../mockData';

function Home() {
  const navigate = useNavigate();  // 新增：获取路由跳转函数
  const [activeTag, setActiveTag] = useState('全部');

  const filteredPosts = activeTag === '全部'
    ? posts
    : posts.filter(post => post.tag === activeTag);

  // 新增：处理举报点击
  const handleReport = (post) => {
    // 将举报信息存储到 localStorage，方便举报页面读取
    localStorage.setItem('reportTarget', JSON.stringify({
      targetType: 'post',
      targetId: post.id,
      targetTitle: post.title,
      targetAuthor: post.author
    }));
    // 跳转到举报页面
    navigate('/report');
  };

  return (
    <div style={{ padding: '20px' }}>
      <CategoryTabs
        activeTag={activeTag}
        onTagChange={setActiveTag}
      />

      {filteredPosts.length > 0 ? (
        filteredPosts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            onReport={handleReport}   // 新增：传递举报回调
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