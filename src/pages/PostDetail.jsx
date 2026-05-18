import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { posts, comments as initialComments } from '../mockData';
import { useFavorites } from '../context/FavoriteContext'; // 1. 导入全局收藏

function PostDetail() {
  const { id } = useParams();
  const post = posts.find(p => p.id == id);

  // 评论相关状态（保持不变）
  const [commentList, setCommentList] = useState(initialComments);
  const [newComment, setNewComment] = useState('');

  // 点赞状态（本地的，不需要全局）
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post ? post.likes : 0);

  // 收藏状态改用全局 Context
  const { toggleFavorite, isFavorited } = useFavorites();
  const collected = isFavorited(post ? post.id : null);  // 判断是否已收藏
  const [collectCount, setCollectCount] = useState(post ? post.collects : 0);

  if (!post) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>帖子未找到</h2>
        <p>抱歉，ID为 {id} 的帖子不存在。</p>
        <Link to="/">← 返回首页</Link>
      </div>
    );
  }

  const postComments = commentList.filter(c => c.postId == id);

  // 处理点赞（本地状态切换）
  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(likeCount - 1);
    } else {
      setLiked(true);
      setLikeCount(likeCount + 1);
    }
  };

  // 处理收藏（调用全局 Context 切换）
  const handleCollect = () => {
    toggleFavorite(post.id);          // 通知全局状态
    setCollectCount(collected ? collectCount - 1 : collectCount + 1); // 更新显示数字
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: commentList.length + 1,
      postId: Number(id),
      author: '当前用户',
      content: newComment,
      time: '刚刚'
    };

    setCommentList([newCommentObj, ...commentList]);
    setNewComment('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <Link to="/" style={{ display: 'block', marginBottom: '15px', color: '#1890ff', textDecoration: 'none' }}>
        ← 返回首页
      </Link>

      {/* 帖子内容 */}
      <span style={{
        background: '#e6f7ff',
        color: '#1890ff',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        {post.tag}
      </span>
      
      <h2 style={{ margin: '15px 0 10px 0', textAlign: 'center' }}>{post.title}</h2>
      
      <div style={{ color: '#999', fontSize: '12px', marginBottom: '20px' }}>
        <span>{post.author}</span>
        <span style={{ margin: '0 8px' }}>·</span>
        <span>{post.time}</span>
      </div>
      
      {/* 帖子图片（新增） */}
{post.image && (
  <img
    src={post.image}
    alt={post.title}
    style={{
      maxWidth: '100%',
      maxHeight: '400px',
      borderRadius: '4px',
      marginBottom: '15px',
      display: 'block'
    }}
  />
)}

<p style={{ fontSize: '16px', lineHeight: '1.6', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
  {post.content}
</p>

      {/* 点赞和收藏按钮 */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '15px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        <button onClick={handleLike} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px',
          border: liked ? '1px solid #ff4d4f' : '1px solid #ddd',
          borderRadius: '20px',
          backgroundColor: liked ? '#fff1f0' : 'white',
          color: liked ? '#ff4d4f' : '#666',
          cursor: 'pointer', fontSize: '14px'
        }}>
          <span>{liked ? '❤️' : '🤍'}</span>
          <span>点赞 {likeCount}</span>
        </button>

        <button onClick={handleCollect} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px',
          border: collected ? '1px solid #faad14' : '1px solid #ddd',
          borderRadius: '20px',
          backgroundColor: collected ? '#fffbe6' : 'white',
          color: collected ? '#faad14' : '#666',
          cursor: 'pointer', fontSize: '14px'
        }}>
          <span>{collected ? '⭐' : '☆'}</span>
          <span>收藏 {collectCount}</span>
        </button>
      </div>

      {/* 评论区 */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>💬 评论 ({postComments.length})</h3>
        
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

        <form onSubmit={handleSubmitComment} style={{ marginTop: '20px' }}>
          <textarea
            placeholder="写下你的评论..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="3"
            style={{
              width: '100%', padding: '8px', borderRadius: '4px',
              border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box'
            }}
          />
          <button type="submit" style={{
            marginTop: '10px', padding: '8px 18px',
            backgroundColor: '#1890ff', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px'
          }}>
            发表评论
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostDetail;