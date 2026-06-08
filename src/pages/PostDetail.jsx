import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postAPI, reportAPI } from '../api';
import { useAuth } from '../context/AuthContext';

function PostDetail() {
  const { id } = useParams();
  const { currentUser } = useAuth();

  // ===== 帖子数据状态 =====
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===== 评论相关状态 =====
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // ===== 回复相关状态 =====
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // ===== 点赞/收藏状态（由后端返回，不再本地维护） =====
  const [returnPressed, setReturnPressed] = useState(false);

  // ===== 举报相关状态 =====
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetail, setReportDetail] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // 举报原因映射（前端显示用中文，发送给后端用英文）
  const reportReasons = [
    { label: '色情低俗', value: 'SPAM' },
    { label: '广告营销', value: 'AD' },
    { label: '人身攻击', value: 'ABUSE' },
    { label: '虚假信息', value: 'FALSE_INFO' },
    { label: '违法违规', value: 'ILLEGAL' },
    { label: '其他', value: 'OTHER' },
  ];

  // ===== 获取帖子详情 =====
  const fetchPostDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await postAPI.getDetail(id);
      setPost(result);
    } catch (err) {
      console.error('获取帖子详情失败:', err);
      setError(err.message || '加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetail();
  }, [id]);

  // ===== 处理点赞 =====
  const handleLike = async () => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }
    try {
      const result = await postAPI.like(post.id);
      setPost(prev => ({
        ...prev,
        isLiked: result.isLiked,
        likesCount: result.likesCount,
      }));
    } catch (err) {
      alert('操作失败：' + (err.message || '请稍后重试'));
    }
  };

  // ===== 处理收藏 =====
  const handleCollect = async () => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }
    try {
      const result = await postAPI.collect(post.id);
      setPost(prev => ({
        ...prev,
        isCollected: result.isCollected,
        collectsCount: result.collectsCount,
      }));
    } catch (err) {
      alert('操作失败：' + (err.message || '请稍后重试'));
    }
  };

  // ===== 提交评论 =====
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!currentUser) {
      alert('请先登录');
      return;
    }

    setSubmittingComment(true);
    try {
      await postAPI.addComment(post.id, { content: newComment });
      setNewComment('');
      // 重新获取详情以刷新评论列表
      await fetchPostDetail();
    } catch (err) {
      alert('评论失败：' + (err.message || '请稍后重试'));
    } finally {
      setSubmittingComment(false);
    }
  };

  // ===== 提交回复 =====
  const handleSubmitReply = async (commentId) => {
    if (!replyContent.trim()) return;

    if (!currentUser) {
      alert('请先登录');
      return;
    }

    try {
      await postAPI.addComment(post.id, { content: replyContent, parentId: commentId });
      setReplyContent('');
      setReplyingTo(null);
      // 重新获取详情以刷新评论列表
      await fetchPostDetail();
    } catch (err) {
      alert('回复失败：' + (err.message || '请稍后重试'));
    }
  };

  // ===== 打开举报弹窗 =====
  const openReportModal = () => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }
    setReportReason('');
    setReportDetail('');
    setShowReportModal(true);
  };

  // ===== 提交举报 =====
  const handleSubmitReport = async () => {
    if (!reportReason) {
      alert('请选择举报原因');
      return;
    }

    setSubmittingReport(true);
    try {
      await reportAPI.submit({
        targetType: 'POST',
        targetId: post.id,
        reasonType: reportReason,
        reasonDetail: reportDetail || undefined,
      });
      alert('举报已提交，我们会尽快处理');
      setShowReportModal(false);
    } catch (err) {
      alert('举报失败：' + (err.message || '请稍后重试'));
    } finally {
      setSubmittingReport(false);
    }
  };

  // ===== 加载状态 =====
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        加载中...
      </div>
    );
  }

  // ===== 错误或帖子不存在 =====
  if (error || !post) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>帖子未找到</h2>
        <p>{error || `抱歉，ID为 ${id} 的帖子不存在。`}</p>
        <Link to="/" style={{ color: '#1890ff' }}>← 返回首页</Link>
      </div>
    );
  }

  // ===== 图片数组（兼容后端返回的 images 字段） =====
  const images = post.images || [];

  // ===== 评论列表 =====
  const postComments = post.comments || [];

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
          {post.category}
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
          {post.author?.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.nickname}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: '#e6f7ff', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', color: '#1890ff'
            }}>
              👤
            </div>
          )}
          <span style={{ fontSize: '15px', fontWeight: '500', color: '#333' }}>
            {post.author?.nickname || '匿名用户'}
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
          {post.createdAt}
        </div>

        {/* 互动栏 */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '24px',
          padding: '15px 0 0 0', borderTop: '1px solid #eee', flexWrap: 'wrap'
        }}>
          <button onClick={handleLike} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: post.isLiked ? '#ff4d4f' : '#999', fontSize: '14px',
            padding: '4px 8px', borderRadius: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>{post.isLiked ? '❤️' : '🤍'}</span>
            <span>{post.likesCount ?? 0}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#999', fontSize: '14px' }}>
            <span style={{ fontSize: '16px' }}>💬</span>
            <span>{post.commentsCount ?? postComments.length}</span>
          </div>

          <button onClick={handleCollect} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: post.isCollected ? '#faad14' : '#999', fontSize: '14px',
            padding: '4px 8px', borderRadius: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>{post.isCollected ? '⭐' : '☆'}</span>
            <span>{post.collectsCount ?? 0}</span>
          </button>

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
            <div key={comment.id} style={{
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                  {comment.author?.nickname || '匿名用户'}
                </span>
                <span style={{ color: '#999', fontSize: '12px' }}>{comment.createdAt}</span>
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#555' }}>{comment.content}</p>

              {/* 右下角胶囊回复按钮 或 回复输入框 */}
              {replyingTo !== comment.id ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    onClick={() => {
                      setReplyingTo(comment.id);
                      setReplyContent('');
                    }}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      border: '1px solid #d9d9d9',
                      backgroundColor: '#fff',
                      color: '#666',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    💬 回复
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: '8px' }}>
                  <textarea
                    placeholder={`回复 @${comment.author?.nickname || '匿名用户'}：`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows="2"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '13px',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      marginBottom: '6px'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setReplyingTo(null)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        backgroundColor: '#f5f5f5',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      取消
                    </button>
                    <button
                      onClick={() => handleSubmitReply(comment.id)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: '#1890ff',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      回复
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p style={{ color: '#999', textAlign: 'center' }}>暂无评论，快来发表第一条评论吧！</p>
        )}

        {/* 发表新评论 */}
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
          <button type="submit" disabled={submittingComment} style={{
            marginTop: '10px', padding: '8px 20px',
            backgroundColor: submittingComment ? '#a0cfff' : '#1890ff',
            color: 'white',
            border: 'none', borderRadius: '20px', cursor: submittingComment ? 'not-allowed' : 'pointer', fontSize: '14px',
            float: 'right'
          }}>
            {submittingComment ? '提交中...' : '发表评论'}
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
        onClick={() => setShowReportModal(false)}
        >
          <div style={{
            backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
            width: '400px', maxWidth: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#333' }}>
              🚩 举报帖子
            </h3>

            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>请选择举报原因：</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {reportReasons.map(reason => (
                <button
                  key={reason.value}
                  onClick={() => setReportReason(reason.value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: reportReason === reason.value ? '2px solid #1890ff' : '1px solid #ddd',
                    backgroundColor: reportReason === reason.value ? '#e6f7ff' : '#fff',
                    color: reportReason === reason.value ? '#1890ff' : '#666',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                >
                  {reason.label}
                </button>
              ))}
            </div>

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
                disabled={submittingReport}
                style={{
                  padding: '8px 18px', borderRadius: '20px',
                  border: 'none',
                  backgroundColor: submittingReport ? '#ff9999' : '#ff4d4f',
                  color: 'white', cursor: submittingReport ? 'not-allowed' : 'pointer', fontSize: '14px'
                }}
              >
                {submittingReport ? '提交中...' : '提交举报'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostDetail;