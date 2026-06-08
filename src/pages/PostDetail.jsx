import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { posts, comments as initialComments } from '../mockData';
import { useFavorites } from '../context/FavoriteContext';

function PostDetail() {
  const { id } = useParams();
  const post = posts.find(p => p.id == id);

  const [commentList, setCommentList] = useState(initialComments);
  const [newComment, setNewComment] = useState('');

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post ? post.likes : 0);

  const { toggleFavorite, isFavorited } = useFavorites();
  const collected = isFavorited(post ? post.id : null);
  const [collectCount, setCollectCount] = useState(post ? post.collects : 0);

  const [returnPressed, setReturnPressed] = useState(false);

  // ===== 举报相关状态 =====
  const [showReportModal, setShowReportModal] = useState(false);   // 是否显示举报弹窗
  const [reportReason, setReportReason] = useState('');             // 举报原因类型
  const [reportDetail, setReportDetail] = useState('');             // 详细描述

  // 预设的举报原因选项（对应后端 reason_type）
  const reportReasons = [
    '色情低俗',
    '广告营销',
    '人身攻击',
    '虚假信息',
    '违法违规',
    '其他'
  ];

  if (!post) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>帖子未找到</h2>
        <p>抱歉，ID为 {id} 的帖子不存在。</p>
        <Link to="/" style={{ color: '#1890ff' }}>← 返回首页</Link>
      </div>
    );
  }

  const postComments = commentList.filter(c => c.postId == id);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(likeCount - 1);
    } else {
      setLiked(true);
      setLikeCount(likeCount + 1);
    }
  };

  const handleCollect = () => {
    toggleFavorite(post.id);
    setCollectCount(collected ? collectCount - 1 : collectCount + 1);
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

  // ===== 举报相关处理函数 =====
  const openReportModal = () => {
    setReportReason('');      // 打开弹窗时清空之前的选择
    setReportDetail('');
    setShowReportModal(true);
  };

  const handleSubmitReport = () => {
    if (!reportReason) {
      alert('请选择举报原因');
      return;
    }

    // 构造举报数据（对应后端 reports 表）
    const reportData = {
      target_type: 'post',          // 举报对象类型：帖子
      target_id: post.id,           // 被举报帖子的ID
      reason_type: reportReason,    // 举报原因类型
      reason_detail: reportDetail   // 详细描述
    };

    console.log('提交举报：', reportData);
    // 以后这里换成 fetch 请求发给后端
    // fetch('/api/reports', { method: 'POST', body: JSON.stringify(reportData) })

    alert('举报已提交，我们会尽快处理');
    setShowReportModal(false);
  };

  const images = post.images && post.images.length > 0 ? post.images : (post.image ? [post.image] : []);

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto', minHeight: '150vh' }}>
      {/* ====== 顶部栏 ====== */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: '#f8f9fa',
      }}>
        <Link
          to="/"
          onMouseDown={() => setReturnPressed(true)}
          onMouseUp={() => setReturnPressed(false)}
          onMouseLeave={() => setReturnPressed(false)}
          style={{
            display: 'inline-block',
            padding: '6px 14px',
            backgroundColor: returnPressed ? '#d9d9d9' : '#ffffff',
            borderRadius: '20px',
            color: '#333',
            textDecoration: 'none',
            fontSize: '14px',
            border: '1px solid #ddd',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'background-color 0.1s'
          }}
        >
          ← 返回首页
        </Link>

        <span style={{
          background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
          color: '#1890ff',
          padding: '3px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {post.tag}
        </span>
      </div>

      {/* ==================== 帖子内容卡片 ==================== */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid #eee',
        marginBottom: '24px'
      }}>
        {/* 作者信息 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            backgroundColor: '#e6f7ff', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', color: '#1890ff'
          }}>
            👤
          </div>
          <span style={{ fontSize: '15px', fontWeight: '500', color: '#333' }}>
            {typeof post.author === 'object' ? post.author.nickname : post.author}
          </span>
        </div>

        {/* 标题 */}
        <h2 style={{ textAlign: 'center', margin: '10px 0 20px 0', fontSize: '22px', fontWeight: '600', color: '#1a1a1a' }}>
          {post.title}
        </h2>

        {/* 图片区域 */}
        {images.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            {images.map((img, index) => (
              <img key={index} src={img} alt={`${post.title} ${index + 1}`}
                style={{
                  display: 'block', maxWidth: '100%', height: 'auto',
                  maxHeight: '500px', margin: '0 auto 10px',
                  borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              />
            ))}
          </div>
        )}

        {/* 正文 */}
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333', margin: '0 0 15px 0', wordBreak: 'break-word' }}>
          {post.content}
        </p>

        {/* 发帖时间 */}
        <div style={{ textAlign: 'right', color: '#999', fontSize: '12px', marginBottom: '15px' }}>
          {post.time}
        </div>

        {/* 互动栏（点赞 + 评论数 + 收藏 + 举报） */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '24px',
          padding: '15px 0 0 0', borderTop: '1px solid #eee', flexWrap: 'wrap'
        }}>
          <button onClick={handleLike} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: liked ? '#ff4d4f' : '#999', fontSize: '14px',
            padding: '4px 8px', borderRadius: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>{liked ? '❤️' : '🤍'}</span>
            <span>{likeCount}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#999', fontSize: '14px' }}>
            <span style={{ fontSize: '16px' }}>💬</span>
            <span>{postComments.length}</span>
          </div>

          <button onClick={handleCollect} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: collected ? '#faad14' : '#999', fontSize: '14px',
            padding: '4px 8px', borderRadius: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>{collected ? '⭐' : '☆'}</span>
            <span>{collectCount}</span>
          </button>

          {/* ===== 举报按钮（新增） ===== */}
          <button onClick={openReportModal} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#999', fontSize: '14px',
            padding: '4px 8px', borderRadius: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>🚩</span>
            <span>举报</span>
          </button>
        </div>
      </div>

      {/* ==================== 评论区卡片 ==================== */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '12px', padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #eee'
      }}>
        <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '600', color: '#333' }}>
          💬 评论 ({postComments.length})
        </h3>

        {postComments.length > 0 ? (
          postComments.map(comment => (
            <div key={comment.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{comment.author}</span>
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
              width: '100%', padding: '10px', borderRadius: '8px',
              border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box'
            }}
          />
          <button type="submit" style={{
            marginTop: '10px', padding: '8px 20px',
            backgroundColor: '#1890ff', color: 'white',
            border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '14px',
            float: 'right'
          }}>
            发表评论
          </button>
          <div style={{ clear: 'both' }}></div>
        </form>
      </div>

      {/* ==================== 举报弹窗 ==================== */}
      {showReportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}
        onClick={() => setShowReportModal(false)}  // 点击背景关闭
        >
          <div style={{
            backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
            width: '400px', maxWidth: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
          onClick={(e) => e.stopPropagation()}  // 防止点击弹窗内部关闭
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#333' }}>
              🚩 举报帖子
            </h3>

            {/* 举报原因选择 */}
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>请选择举报原因：</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {reportReasons.map(reason => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: reportReason === reason ? '2px solid #1890ff' : '1px solid #ddd',
                    backgroundColor: reportReason === reason ? '#e6f7ff' : '#fff',
                    color: reportReason === reason ? '#1890ff' : '#666',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>

            {/* 详细描述 */}
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>详细描述（可选）：</p>
            <textarea
              placeholder="请补充更多细节..."
              value={reportDetail}
              onChange={(e) => setReportDetail(e.target.value)}
              rows="3"
              style={{
                width: '100%', padding: '8px', borderRadius: '8px',
                border: '1px solid #ddd', fontSize: '14px', resize: 'vertical',
                boxSizing: 'border-box', marginBottom: '16px'
              }}
            />

            {/* 按钮区 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowReportModal(false)}
                style={{
                  padding: '8px 18px', borderRadius: '20px',
                  border: '1px solid #ddd', backgroundColor: '#f5f5f5',
                  color: '#666', cursor: 'pointer', fontSize: '14px'
                }}
              >
                取消
              </button>
              <button
                onClick={handleSubmitReport}
                style={{
                  padding: '8px 18px', borderRadius: '20px',
                  border: 'none', backgroundColor: '#ff4d4f',
                  color: 'white', cursor: 'pointer', fontSize: '14px'
                }}
              >
                提交举报
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostDetail;