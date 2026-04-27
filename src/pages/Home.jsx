import PostCard from '../components/PostCard';

function Home() {
  const posts = [
    { id: 1, title: '有同学一起组队参加大创吗？', content: '想找一个前端和一个后端，项目是关于校园二手交易的...', author: '小明', time: '10分钟前', tag: '组队' },
    { id: 2, title: '图书馆四楼捡到一张校园卡', content: '失主叫张三，学号2024xxxx，请失主联系我...', author: '热心同学', time: '1小时前', tag: '失物招领' },
    { id: 3, title: '求推荐好用的笔记软件', content: '之前一直用Notion，但最近觉得有点重，有没有轻量一点的推荐？', author: '笔记达人', time: '3小时前', tag: '闲聊' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>🏠 首页信息流</h2>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export default Home;