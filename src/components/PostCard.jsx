import { Link } from 'react-router-dom';
import { FaFlag } from 'react-icons/fa';  // 添加举报图标
import { resolveAssetUrl } from '../api';

// 增加 onReport 属性
function PostCard({ post, onReport }) {
  const authorName = post.author?.nickname || post.author || '匿名用户';
  const authorAvatar = resolveAssetUrl(post.author?.avatar);
  const imageUrl = post.coverImage || post.image;
  const categoryName = post.category || post.tag || '未分类';
  const summary = post.summary || post.content || '';
  const createdAt = post.createdAt || post.time || '';
  const isAdminAuthor = post.author?.role === 'ADMIN';
  const isSecondHand = categoryName === '二手交易';
  const placeholderConfig = {
    二手交易: { icon: '🛍️', label: '二手好物' },
    失物招领: { icon: '🔎', label: '失物招领' },
    学习交流: { icon: '📚', label: '学习交流' },
    校园生活: { icon: '🏫', label: '校园生活' },
  }[categoryName] || { icon: '📌', label: categoryName };

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
        border: '1px solid #dedede',
        margin: '14px 0',
        padding: '18px',
        borderRadius: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 5px 16px rgba(0,0,0,0.08)',
        display: 'flex',
        gap: '18px',
        alignItems: 'flex-start',
        position: 'relative',
      }}>
        {/* ========== 左侧：图片 ========== */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0

        }}>
          {/* 缩略图 */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={post.title}
              style={{
                width: '118px',
                height: '118px',
                borderRadius: '12px',
                objectFit: 'cover',
                border: '1px solid #e7e7e7'
              }}
            />
          ) : (
            <div style={{
              width: '118px',
              height: '118px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #eef8ff 0%, #d9efff 100%)',
              border: '1px solid #cfe8ff',
              color: '#1677ff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <span style={{ fontSize: '28px', lineHeight: 1 }}>{placeholderConfig.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: '600' }}>{placeholderConfig.label}</span>
            </div>
          )}
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
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0
                }}
              />
            ) : (
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
            )}
            <span style={{ fontSize: '13px', color: '#333', fontWeight: '500' }}>
              {authorName}
            </span>
            {isAdminAuthor && (
              <span style={{
                background: '#f0fff4',
                border: '1px solid #9ae6b4',
                color: '#2f855a',
                borderRadius: '8px',
                padding: '0 5px',
                fontSize: '10px',
                fontWeight: '600'
              }}>
                管理员
              </span>
            )}
          </div>


          {/* 标题（去掉了 Link，因为整个卡片已经是链接） */}
          <h3 style={{
            margin: '0 0 10px 0',
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
            margin: isSecondHand && post.estimatedPrice ? '0 0 8px 0' : '0 0 30px 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {summary}
          </p>
          {isSecondHand && post.estimatedPrice && (
            <div style={{ color: '#b7791f', fontSize: '15px', fontWeight: '700', marginBottom: '30px' }}>
              ￥{post.estimatedPrice}
            </div>
          )}
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
          <span style={{
            color: '#1677ff',
            backgroundColor: '#e6f4ff',
            border: '1px solid #bae0ff',
            borderRadius: '10px',
            padding: '1px 7px',
            fontWeight: '500',
            lineHeight: 1.5
          }}>
            {categoryName}
          </span>
          <span>{createdAt}</span>
          <span>💬 {post.commentsCount ?? 0}</span>
          <span>❤ {post.likesCount ?? 0}</span>
          <span>⭐ {post.collectsCount ?? 0}</span>
          {onReport && (
            <button
              onClick={handleReportClick}
              title="举报"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                border: 'none',
                background: 'transparent',
                color: '#999',
                cursor: 'pointer',
                padding: 0,
                fontSize: '12px'
              }}
            >
              <FaFlag /> 举报
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

export default PostCard;
