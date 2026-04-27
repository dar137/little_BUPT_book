function PostCard({ post }) {
  return (
    <div style={{/* 边框信息 */
      border: '1px solid #ddd',
      margin: '15px 0',/* 帖间距 */
      padding: '20px',/* 贴长 */
      borderRadius: '10px',/* 贴角圆滑程度 */
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
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

      {/* 标题 */}
      <h3 style={{ margin: '10px 0 5px 0' }}>
        {post.title}</h3>

      {/* 内容摘要 */}
      <p style={{ color: '#666', fontSize: '14px' }}>
        {post.content}</p>

      {/* 底部信息：作者和时间 */}
      <div style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
        <span>{post.author}</span>
        <span style={{ margin: '0 8px' }}>·</span>
        <span>{post.time}</span>
      </div>
    </div>
  );
}

export default PostCard;