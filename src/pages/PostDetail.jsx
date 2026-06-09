import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { adminAPI, postAPI, reportAPI, resolveAssetUrl } from '../api';
import { useAuth } from '../context/AuthContext';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const reportId = searchParams.get('reportId');
  const isPostReview = currentUser?.role === 'ADMIN' && searchParams.get('adminReview') === 'post';
  const isAdminReview = currentUser?.role === 'ADMIN' && reportId;

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
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  // ===== 点赞/收藏状态（由后端返回，不再本地维护） =====
  const [returnPressed, setReturnPressed] = useState(false);

  // ===== 举报相关状态 =====
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState({ type: 'POST', id: null, title: '帖子' });
  const [reportReason, setReportReason] = useState('');
  const [reportDetail, setReportDetail] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [handlingAdminReport, setHandlingAdminReport] = useState(false);
  const [handlingPostReview, setHandlingPostReview] = useState(false);

  // 举报原因映射（前端显示用中文，发送给后端用英文）
  const reportReasons = [
    { label: '色情低俗', value: 'PORN' },
    { label: '垃圾广告', value: 'SPAM' },
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
      const detailId = isPostReview ? `${id}?adminReview=post` : id;
      const result = await postAPI.getDetail(detailId);
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
  }, [id, isPostReview]);

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
      const result = await postAPI.addComment(post.id, { content: newComment });
      setNewComment('');
      await fetchPostDetail();
      if (result?.status === 'PENDING_REVIEW') {
        alert('评论已提交，正在审核中');
      } else if (result?.status === 'REJECTED') {
        alert('评论未通过 AI 审核，可重新编辑或删除');
      }
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
      const result = await postAPI.addComment(post.id, { content: replyContent, parentId: commentId });
      setReplyContent('');
      setReplyingTo(null);
      await fetchPostDetail();
      if (result?.status === 'PENDING_REVIEW') {
        alert('回复已提交，正在审核中');
      } else if (result?.status === 'REJECTED') {
        alert('回复未通过 AI 审核，可重新编辑或删除');
      }
    } catch (err) {
      alert('回复失败：' + (err.message || '请稍后重试'));
    }
  };

  // ===== 打开举报弹窗 =====
  const openReportModal = (target = { type: 'POST', id: post?.id, title: '帖子' }) => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }
    setReportTarget(target);
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
        targetType: reportTarget.type,
        targetId: reportTarget.id,
        reasonType: reportReason,
        reasonDetail: reportDetail || undefined,
      });
      alert('举报已提交，我们会尽快处理');
      setShowReportModal(false);
      navigate('/');
    } catch (err) {
      alert('举报失败：' + (err.message || '请稍后重试'));
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleAdminReport = async (action) => {
    if (!isAdminReview || handlingAdminReport) return;

    setHandlingAdminReport(true);
    try {
      if (action === 'confirm') {
        await adminAPI.confirmReport(reportId);
        alert(`举报 ${reportId} 已确认，相关内容已下架/用户已处理`);
      } else {
        await adminAPI.rejectReport(reportId);
        alert(`举报 ${reportId} 已驳回（不违规）`);
      }
      navigate('/admin');
    } catch (err) {
      alert(err.message || '处理举报失败');
    } finally {
      setHandlingAdminReport(false);
    }
  };

  const handlePostReview = async (action) => {
    if (!isPostReview || handlingPostReview) return;

    setHandlingPostReview(true);
    try {
      if (action === 'approve') {
        await adminAPI.approvePost(post.id);
        alert(`帖子 ${post.id} 已通过，将正常发布`);
      } else {
        await adminAPI.rejectPost(post.id);
        alert(`帖子 ${post.id} 已打回`);
      }
      navigate('/admin');
    } catch (err) {
      alert(err.message || '复核处理失败');
    } finally {
      setHandlingPostReview(false);
    }
  };

  const handleDeletePost = async () => {
    if (!currentUser || currentUser.role !== 'ADMIN') return;
    if (!window.confirm('是否确认删除该帖子')) return;

    try {
      await adminAPI.deletePost(post.id);
      alert('帖子已删除');
      navigate('/admin');
    } catch (err) {
      alert('删除帖子失败：' + (err.message || '请稍后重试'));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('是否确认删除该评论')) return;

    try {
      await postAPI.deleteComment(post.id, commentId);
      await fetchPostDetail();
    } catch (err) {
      alert('删除评论失败：' + (err.message || '请稍后重试'));
    }
  };

  const canDeleteComment = (comment) => (
    currentUser?.role === 'ADMIN' || currentUser?.id === comment.author?.id
  );
  const canEditComment = (comment) => (
    currentUser?.id === comment.author?.id && ["PENDING_REVIEW", "REJECTED"].includes(comment.status)
  );
  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content || '');
  };
  const handleUpdateComment = async (commentId) => {
    if (!editingCommentContent.trim()) return;

    try {
      const result = await postAPI.updateComment(post.id, commentId, { content: editingCommentContent.trim() });
      setEditingCommentId(null);
      setEditingCommentContent('');
      await fetchPostDetail();
      if (result?.status === 'PENDING_REVIEW') {
        alert('评论已提交，正在审核中');
      } else if (result?.status === 'REJECTED') {
        alert('评论未通过 AI 审核，可继续编辑或删除');
      }
    } catch (err) {
      alert('编辑评论失败：' + (err.message || '请稍后重试'));
    }
  };
  const commentStatusLabel = (comment) => {
    if (comment.status === 'PENDING_REVIEW') return '审核中';
    if (comment.status === 'REJECTED') return '人工复审不通过';
    return '';
  };
  const showInteractions = !isPostReview && post?.status === 'PUBLISHED';

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

  const images = post.images || [];
  const postComments = post.comments || [];
  const renderAvatar = (author, size = 28) => (
    author?.avatar ? (
      <img
        src={resolveAssetUrl(author.avatar)}
        alt={author.nickname || '用户头像'}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flex: '0 0 auto' }}
      />
    ) : (
      <div style={{
        width: size, height: size, borderRadius: '50%', backgroundColor: '#e6f7ff',
        color: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.max(12, size - 14), flex: '0 0 auto'
      }}>
        👤
      </div>
    )
  );
  const renderAdminBadge = (author) => (
    author?.role === 'ADMIN' ? (
      <span style={{ background: '#f0fff4', border: '1px solid #9ae6b4', color: '#2f855a', borderRadius: '10px', padding: '1px 6px', fontSize: '11px', fontWeight: '600' }}>
        管理员
      </span>
    ) : null
  );

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
        {/* 作者信息（可点击跳转到用户主页） */}
        <Link
          to={isPostReview ? '#' : `/user/${post.author?.id}`}
          onClick={(e) => {
            if (isPostReview) e.preventDefault();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '12px',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          {post.author?.avatar ? (
            <img
              src={resolveAssetUrl(post.author.avatar)}
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
          {post.author?.role === 'ADMIN' && (
            <span style={{ background: '#f0fff4', border: '1px solid #9ae6b4', color: '#2f855a', borderRadius: '10px', padding: '1px 6px', fontSize: '11px', fontWeight: '600' }}>
              管理员
            </span>
          )}
        </Link>

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

        {post.category === '二手交易' && post.estimatedPrice && (
          <div style={{ color: '#b7791f', fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>
            ￥{post.estimatedPrice}
          </div>
        )}

        {/* 发帖时间 */}
        <div style={{ textAlign: 'right', color: '#999', fontSize: '12px', marginBottom: '15px' }}>
          {post.createdAt}
        </div>

        {/* 互动栏 */}
        {showInteractions && (
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

          <button onClick={() => openReportModal({ type: 'POST', id: post.id, title: '帖子' })} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#999', fontSize: '14px',
            padding: '4px 8px', borderRadius: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>🚩</span>
            <span>举报</span>
          </button>

          {currentUser?.role === 'ADMIN' && (
            <button onClick={handleDeletePost} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#e53e3e', fontSize: '14px',
              padding: '4px 8px', borderRadius: '8px'
            }}>
              🗑 删除帖子
            </button>
          )}
        </div>
        )}
      </div>

      {isPostReview && (
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid #eee',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>AI 发帖复核处理</h3>
          <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
            已查看待复核帖子，可在此选择通过或不通过。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handlePostReview('approve')}
              disabled={handlingPostReview}
              style={{
                background: handlingPostReview ? '#9ae6b4' : '#48bb78',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '30px',
                cursor: handlingPostReview ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              通过
            </button>
            <button
              onClick={() => handlePostReview('reject')}
              disabled={handlingPostReview}
              style={{
                background: handlingPostReview ? '#feb2b2' : '#f56565',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '30px',
                cursor: handlingPostReview ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              不通过
            </button>
          </div>
        </div>
      )}

      {isAdminReview && (
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid #eee',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>举报审核处理</h3>
          <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
            已查看被举报帖子，可在此处理举报 #{reportId}。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleAdminReport('confirm')}
              disabled={handlingAdminReport}
              style={{
                background: handlingAdminReport ? '#9ae6b4' : '#48bb78',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '30px',
                cursor: handlingAdminReport ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              确认违规（下架）
            </button>
            <button
              onClick={() => handleAdminReport('reject')}
              disabled={handlingAdminReport}
              style={{
                background: handlingAdminReport ? '#feb2b2' : '#f56565',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '30px',
                cursor: handlingAdminReport ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              驳回举报
            </button>
          </div>
        </div>
      )}

      {/* ==================== 评论区卡片 ==================== */}
      {showInteractions && (
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px' }}>
                {renderAvatar(comment.author)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                        {comment.author?.nickname || '匿名用户'}
                      </span>
                      {renderAdminBadge(comment.author)}
                    </span>
                    <span style={{ color: '#999', fontSize: '12px' }}>{comment.createdAt}</span>
                  </div>
                </div>
              </div>
              {editingCommentId === comment.id ? (
                <div style={{ marginBottom: '8px' }}>
                  <textarea
                    value={editingCommentContent}
                    onChange={(e) => setEditingCommentContent(e.target.value)}
                    rows="2"
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box', marginBottom: '6px' }}
                  />
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button onClick={() => setEditingCommentId(null)} style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#f5f5f5', fontSize: '12px', cursor: 'pointer' }}>取消</button>
                    <button onClick={() => handleUpdateComment(comment.id)} style={{ padding: '4px 12px', borderRadius: '4px', border: 'none', backgroundColor: '#1890ff', color: 'white', fontSize: '12px', cursor: 'pointer' }}>保存</button>
                  </div>
                </div>
              ) : (
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#555', textAlign: 'left' }}>{comment.content}</p>
              )}
              {commentStatusLabel(comment) && (
                <div style={{ display: 'inline-block', marginBottom: '8px', padding: '3px 8px', borderRadius: '12px', background: comment.status === 'REJECTED' ? '#fff1f0' : '#fffbe6', color: comment.status === 'REJECTED' ? '#cf1322' : '#d48806', border: `1px solid ${comment.status === 'REJECTED' ? '#ffa39e' : '#ffe58f'}`, fontSize: '12px' }}>
                  {commentStatusLabel(comment)}{comment.aiReview?.reason ? `：${comment.aiReview.reason}` : ''}
                </div>
              )}

              {replyingTo !== comment.id ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                  {canEditComment(comment) && (
                    <button
                      onClick={() => startEditComment(comment)}
                      style={{ padding: '3px 10px', borderRadius: '12px', border: '1px solid #91caff', backgroundColor: '#e6f4ff', color: '#1677ff', fontSize: '12px', cursor: 'pointer' }}
                    >
                      编辑
                    </button>
                  )}
                  {canDeleteComment(comment) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        border: '1px solid #fed7d7',
                        backgroundColor: '#fff5f5',
                        color: '#e53e3e',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      删除
                    </button>
                  )}
                  <button
                    onClick={() => openReportModal({ type: 'COMMENT', id: comment.id, title: '评论' })}
                    disabled={comment.status !== 'PUBLISHED'}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      border: '1px solid #ffe0b2',
                      backgroundColor: '#fffaf0',
                      color: '#b7791f',
                      fontSize: '12px',
                      cursor: comment.status === 'PUBLISHED' ? 'pointer' : 'not-allowed',
                      opacity: comment.status === 'PUBLISHED' ? 1 : 0.5
                    }}
                  >
                    举报
                  </button>
                  {comment.status === 'PUBLISHED' && (
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
                  )}
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

              {comment.replies?.length > 0 && (
                <div style={{ margin: '8px 0 8px 16px', paddingLeft: '12px', borderLeft: '2px solid #f0f0f0' }}>
                  {comment.replies.map((reply, index) => (
                    <div key={reply.id} style={{ marginBottom: '8px', position: 'relative', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '4px' }}>
                        {renderAvatar(reply.author, 24)}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                              <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#555' }}>
                                {reply.author?.nickname || '匿名用户'}
                              </span>
                              {renderAdminBadge(reply.author)}
                            </span>
                            <span style={{ color: '#aaa', fontSize: '12px' }}>{reply.createdAt}</span>
                          </div>
                        </div>
                      </div>
                      {editingCommentId === reply.id ? (
                        <div style={{ marginBottom: '8px' }}>
                          <textarea
                            value={editingCommentContent}
                            onChange={(e) => setEditingCommentContent(e.target.value)}
                            rows="2"
                            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box', marginBottom: '6px' }}
                          />
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setEditingCommentId(null)} style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#f5f5f5', fontSize: '12px', cursor: 'pointer' }}>取消</button>
                            <button onClick={() => handleUpdateComment(reply.id)} style={{ padding: '4px 12px', borderRadius: '4px', border: 'none', backgroundColor: '#1890ff', color: 'white', fontSize: '12px', cursor: 'pointer' }}>保存</button>
                          </div>
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: '13px', color: '#666', textAlign: 'left' }}>{reply.content}</p>
                      )}
                      {commentStatusLabel(reply) && (
                        <div style={{ display: 'inline-block', marginTop: '6px', padding: '3px 8px', borderRadius: '12px', background: reply.status === 'REJECTED' ? '#fff1f0' : '#fffbe6', color: reply.status === 'REJECTED' ? '#cf1322' : '#d48806', border: `1px solid ${reply.status === 'REJECTED' ? '#ffa39e' : '#ffe58f'}`, fontSize: '12px' }}>
                          {commentStatusLabel(reply)}{reply.aiReview?.reason ? `：${reply.aiReview.reason}` : ''}
                        </div>
                      )}
                      {canEditComment(reply) && (
                        <button
                          onClick={() => startEditComment(reply)}
                          style={{ position: 'absolute', right: canDeleteComment(reply) ? '108px' : '72px', bottom: 0, border: 'none', background: 'transparent', color: '#1677ff', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                        >
                          编辑
                        </button>
                      )}
                      {canDeleteComment(reply) && (
                        <button
                          onClick={() => handleDeleteComment(reply.id)}
                          style={{
                            position: 'absolute',
                            right: '38px',
                            bottom: 0,
                            border: 'none',
                            background: 'transparent',
                            color: '#e53e3e',
                            cursor: 'pointer',
                            fontSize: '12px',
                            padding: 0
                          }}
                        >
                          删除
                        </button>
                      )}
                      <button
                        onClick={() => openReportModal({ type: 'COMMENT', id: reply.id, title: '评论' })}
                        disabled={reply.status !== 'PUBLISHED'}
                        style={{
                          position: 'absolute',
                          right: canDeleteComment(reply) ? '72px' : '38px',
                          bottom: 0,
                          border: 'none',
                          background: 'transparent',
                          color: '#b7791f',
                          cursor: reply.status === 'PUBLISHED' ? 'pointer' : 'not-allowed',
                          fontSize: '12px',
                          padding: 0,
                          opacity: reply.status === 'PUBLISHED' ? 1 : 0.5
                        }}
                      >
                        举报
                      </button>
                      <span style={{ position: 'absolute', right: 0, bottom: 0, color: '#aaa', fontSize: '12px' }}>{index + 1}楼</span>
                    </div>
                  ))}
                </div>
              )}
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
      )}

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
              🚩 举报{reportTarget.title}
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
