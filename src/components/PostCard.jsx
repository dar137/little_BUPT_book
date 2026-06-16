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
    <Link
      to={`/post/${post.id}`}
      style={{
        textDecoration: 'none',   // 去掉链接下划线
        color: 'inherit',          // 继承文字颜色，不变成蓝色
        display: 'block'           // 让 Link 表现为块级元素，占满整行
      }}
    >
      <div style={{
        border: '1px solid #e8e8e8',
        margin: '12px 0',
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
        position: 'relative',
      }}>
        {/* ========== 左侧：图片 + 分类标签 ========== */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0

        }}>
          {/* 缩略图 */}
          {post.image ? (
            <img
              src={post.image}
              alt={post.title}
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '10px',
                objectFit: 'cover',
                border: '1px solid #f0f0f0'
              }}
            />
          ) : (
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '10px',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ccc',
              fontSize: '24px'
            }}>
              📷
            </div>
          )}

          {/* 分类标签 */}
          <span style={{
            background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
            color: '#1890ff',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: '500',
            whiteSpace: 'nowrap'
          }}>
            {post.tag}
          </span>
        </div>

        {/* ========== 右侧：文字内容 ========== */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 头像 + 作者名（居中） */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#e6f7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: '#1890ff',
              flexShrink: 0
            }}>
              👤
            </div>
            <span style={{ fontSize: '13px', color: '#333', fontWeight: '500' }}>
              {post.author}
            </span>
          </div>


          {/* 标题（去掉了 Link，因为整个卡片已经是链接） */}
          <h3 style={{
            margin: '0 0 6px 0',
            fontSize: '16px',
            fontWeight: '600',
            lineHeight: '1.4',
            color: '#1a1a1a'
          }}>{post.title}</h3>

          {/* 摘要 */}
          <p style={{
            color: '#666',
            fontSize: '14px',
            lineHeight: '1.5',
            margin: '0 0 30px 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {post.content}
          </p>
        </div>

        {/* ========== 右下角：时间 + 评论 + 点赞 + 收藏 ========== */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          color: '#999',
          fontSize: '12px',
          gap: '12px'
        }}>
          <span>🕒 {post.time}</span>
          <span>💬 {post.commentsCount ?? 0}</span>
          <span>❤️ {post.likesCount ?? 0}</span>
          <span>⭐ {post.collectsCount ?? 0}</span>
        </div>
      </div>
    </Link>
  );
}

export default PostCard;