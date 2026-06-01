import { useState } from 'react';
import PostCard from '../components/PostCard';
import CategoryTabs from '../components/CategoryTabs';
import { posts } from '../mockData';

function Home() {
  // 1. 定义状态：当前选中的标签，默认是“全部”
  const [activeTag, setActiveTag] = useState('全部');

  // 2. 根据选中的标签过滤帖子
  //    如果选中的是“全部”，就显示所有帖子；否则只显示 tag 匹配的帖子
  const filteredPosts = activeTag === '全部'
    ? posts
    : posts.filter(post => post.tag === activeTag);

  return (
    <div style={{ padding: '20px' }}>
      

      {/* 3. 放入标签栏组件，传入当前选中的标签和切换标签的函数 */}
      <CategoryTabs
        activeTag={activeTag}
        onTagChange={setActiveTag}
      />

      {/* 4. 渲染过滤后的帖子列表 */}
      {filteredPosts.length > 0 ? (
        filteredPosts.map(post => (
          <PostCard key={post.id} post={post} />
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