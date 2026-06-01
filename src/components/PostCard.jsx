import { Link } from 'react-router-dom';
import { FaFlag } from 'react-icons/fa';  // 添加举报图标

// 增加 onReport 属性
function PostCard({ post, onReport }) {
  const handleReportClick = (e) => {
    e.preventDefault();      // 阻止 Link 跳转
    e.stopPropagation();     // 阻止事件冒泡
    if (onReport) {
      onReport(post);
    }
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      margin: '10px 0',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      gap: '12px'
    }}>
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

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#999',
          fontSize: '12px',
          marginTop: '8px'
        }}>
          <div>
            <span>{post.author}</span>
            <span style={{ margin: '0 8px' }}>·</span>
            <span>{post.time}</span>
          </div>
          {/* 添加举报按钮 */}
          <button
            onClick={handleReportClick}
            className="report-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#999',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '16px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef0f0';
              e.currentTarget.style.color = '#ff6b6b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#999';
            }}
            title="举报"
          >
            <FaFlag /> 举报
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostCard;