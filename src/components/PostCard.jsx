import { Link } from 'react-router-dom'

function PostCard({ post }) {
  return (
    <div style={{
      border: '1px solid #ddd',
      margin: '10px 0',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      {/* 标签 */}
      <span style={{
        background: '#e6f7ff',
        color: '#1890ff',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        {post.tag}
      </span>

      {/* 2. 将标题用 Link 包裹，点击后跳转到 /post/帖子ID */}
      <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <h3 style={{ margin: '10px 0 5px 0' }}>{post.title}</h3>
      </Link>

      {/* 内容摘要 */}
      <p style={{ color: '#666', fontSize: '14px' }}>{post.content}</p>

      {/* 底部信息 */}
      <div style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
        <span>{post.author}</span>
        <span style={{ margin: '0 8px' }}>·</span>
        <span>{post.time}</span>
      </div>
    </div>
  );
}

export default PostCard;