import { Link } from 'react-router-dom';

function PostCard({ post }) {
  return (
    <div style={{
      border: '1px solid #ddd',
      margin: '10px 0',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',      // 横排布局
      gap: '12px'           // 图片和文字之间的间距
    }}>
      {/* 左侧缩略图（如果存在） */}
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '6px',
            objectFit: 'cover',
            flexShrink: 0
          }}
        />
      )}

      {/* 右侧文字内容 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          background: '#e6f7ff',
          color: '#1890ff',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          {post.tag}
        </span>

        <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{ margin: '10px 0 5px 0' }}>{post.title}</h3>
        </Link>

        <p style={{ color: '#666', fontSize: '14px' }}>{post.content}</p>

        <div style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
          <span>{post.author}</span>
          <span style={{ margin: '0 8px' }}>·</span>
          <span>{post.time}</span>
        </div>
      </div>
    </div>
  );
}

export default PostCard;