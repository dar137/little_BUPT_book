import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { posts, comments as initialComments } from '../mockData';

function PostDetail() {
  const { id } = useParams();
  const post = posts.find(p => p.id == id);

  // 1. 评论列表状态（初始使用假数据）
  const [commentList, setCommentList] = useState(initialComments);
  
  // 2. 新评论输入框的内容状态
  const [newComment, setNewComment] = useState('');

  // 3. 处理找不到帖子的情况
  if (!post) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>帖子未找到</h2>
        <p>抱歉，ID为 {id} 的帖子不存在。</p>
        <Link to="/">← 返回首页</Link>
      </div>
    );
  }

  // 4. 筛选出属于当前帖子的评论
  const postComments = commentList.filter(c => c.postId == id);

  // 5. 处理提交新评论
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return; // 空内容不提交

    const newCommentObj = {
      id: commentList.length + 1,        // 临时用简单自增 ID
      postId: Number(id),                // 关联到当前帖子
      author: '当前用户',                // 等对接真实用户信息后替换
      content: newComment,
      time: '刚刚'
    };

    // 把新评论添加到评论列表的开头（最新的在上面）
    setCommentList([newCommentObj, ...commentList]);
    setNewComment(''); // 清空输入框
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      {/* 返回首页链接 */}
      <Link to="/" style={{ display: 'block', marginBottom: '15px', color: '#1890ff', textDecoration: 'none' }}>
        ← 返回首页
      </Link>

      {/* 帖子内容区域 */}
      <span style={{
        background: '#e6f7ff',
        color: '#1890ff',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        {post.tag}
      </span>
      
      <h2 style={{ margin: '15px 0 10px 0',textAlign: 'center'}}>{post.title}</h2>
      
      <div style={{ color: '#999', fontSize: '12px', marginBottom: '20px' }}>
        <span>{post.author}</span>
        <span style={{ margin: '0 8px' }}>·</span>
        <span>{post.time}</span>
      </div>
      
      <p style={{ fontSize: '16px', lineHeight: '1.6', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        {post.content}
      </p>

      {/* 评论区 */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '15px',textAlign: 'center' }}>💬 评论 ({postComments.length})</h3>
        
        {/* 评论列表 */}
        {postComments.length > 0 ? (
          postComments.map(comment => (
            <div key={comment.id} style={{
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                  {comment.author}
                </span>
                <span style={{ color: '#999', fontSize: '12px' }}>{comment.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>{comment.content}</p>
            </div>
          ))
        ) : (
          <p style={{ color: '#999', textAlign: 'center' }}>暂无评论，快来发表第一条评论吧！</p>
        )}

        {/* 评论输入框 */}
        <form onSubmit={handleSubmitComment} style={{ marginTop: '20px' }}>
          <textarea
            placeholder="写下你的评论..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="3"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            style={{
              marginTop: '10px',
              padding: '8px 18px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            发表评论
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostDetail;