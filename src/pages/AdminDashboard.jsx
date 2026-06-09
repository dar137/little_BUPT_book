// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminAPI, fetchProtectedAsset } from "../api";

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("ai_review");
  const [pendingPosts, setPendingPosts] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [postReports, setPostReports] = useState([]);
  const [commentReports, setCommentReports] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [cardPreviewUrl, setCardPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reportReasonLabels = {
    PORN: "色情低俗",
    SPAM: "垃圾广告",
    AD: "广告营销",
    ABUSE: "人身攻击",
    FALSE_INFO: "虚假信息",
    ILLEGAL: "违法违规",
    OTHER: "其他",
  };

  const reportTargetLabels = {
    POST: "帖子",
    COMMENT: "评论",
    USER: "用户",
  };

  const aiReviewBadge = (review) => {
    const result = review?.result;
    const config = {
      PASS: { label: "AI 合规", background: "#f6ffed", color: "#389e0d", border: "#b7eb8f" },
      NEED_HUMAN: { label: "AI 可疑", background: "#fffbe6", color: "#d48806", border: "#ffe58f" },
      REJECT: { label: "AI 不合规", background: "#fff1f0", color: "#cf1322", border: "#ffa39e" },
    }[result] || { label: "AI 未审核", background: "#f5f5f5", color: "#666", border: "#d9d9d9" };

    return (
      <span
        title={review?.reason || config.label}
        style={{
          background: config.background,
          color: config.color,
          border: `1px solid ${config.border}`,
          padding: "4px 8px",
          borderRadius: "20px",
          fontSize: "12px",
          whiteSpace: "nowrap",
        }}
      >
        {config.label}
      </span>
    );
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== "ADMIN") return;

    const loadAdminData = async () => {
      setLoading(true);
      setError("");
      try {
        const [postsData, commentsData, postReportsData, commentReportsData] = await Promise.all([
          adminAPI.getPendingPosts(),
          adminAPI.getPendingComments(),
          adminAPI.getReports({ targetType: "POST" }),
          adminAPI.getReports({ targetType: "COMMENT" }),
        ]);
        setPendingPosts(postsData.list || []);
        setPendingComments(commentsData.list || []);
        setPostReports(postReportsData.list || []);
        setCommentReports(commentReportsData.list || []);
        try {
          const registrationsData = await adminAPI.getRegistrations();
          setRegistrations(registrationsData.list || []);
        } catch {
          setRegistrations([]);
        }
      } catch (err) {
        setError(err.message || "加载管理数据失败");
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [currentUser]);

  useEffect(() => {
    let objectUrl = "";

    const loadCardPreview = async () => {
      if (!selectedRegistration?.student_card_url) {
        setCardPreviewUrl("");
        return;
      }

      try {
        objectUrl = await fetchProtectedAsset(selectedRegistration.student_card_url);
        setCardPreviewUrl(objectUrl);
      } catch (err) {
        setError(err.message || "学生证图片加载失败");
        setCardPreviewUrl("");
      }
    };

    loadCardPreview();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedRegistration]);

  const handleRegistrationDecision = async (registration, decision) => {
    try {
      if (decision === "approve") {
        await adminAPI.approveRegistration(registration.id);
      } else {
        await adminAPI.rejectRegistration(registration.id);
      }
      setRegistrations(prev => prev.filter(item => item.id !== registration.id));
      setSelectedRegistration(null);
    } catch (err) {
      alert("处理失败：" + (err.message || "请稍后重试"));
    }
  };

  const handleCommentReview = async (comment, decision) => {
    try {
      if (decision === "approve") {
        await adminAPI.approveComment(comment.id);
      } else {
        await adminAPI.rejectComment(comment.id);
      }
      setPendingComments(prev => prev.filter(item => item.id !== comment.id));
    } catch (err) {
      alert("处理失败：" + (err.message || "请稍后重试"));
    }
  };

  if (!currentUser) {
    return (
      <div style={{ maxWidth: "720px", margin: "48px auto", padding: "24px", textAlign: "center" }}>
        <h2>请先登录</h2>
        <p style={{ color: "#666", margin: "12px 0 20px" }}>管理员后台需要登录后访问。</p>
        <Link to="/login" style={{ color: "#1677ff" }}>去登录</Link>
      </div>
    );
  }

  if (currentUser.role !== "ADMIN") {
    return (
      <div style={{ maxWidth: "720px", margin: "48px auto", padding: "24px", textAlign: "center" }}>
        <h2>无管理员权限</h2>
        <p style={{ color: "#666", margin: "12px 0 20px" }}>当前账号不能访问管理员后台。</p>
        <Link to="/" style={{ color: "#1677ff" }}>返回首页</Link>
      </div>
    );
  }

  return (
    <div className="admin-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>管理后台</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>欢迎回来，{currentUser?.nickname || currentUser?.username || "管理员"}</p>
      {loading && <p style={{ color: "#666" }}>正在加载管理数据...</p>}
      {error && <p style={{ color: "#f56565" }}>{error}</p>}

      {/* Tab 切换栏 */}
      <div className="admin-tabs" style={{ display: "flex", gap: "16px", borderBottom: "1px solid #e2e8f0", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("registrations")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: activeTab === "registrations" ? "600" : "400",
            color: activeTab === "registrations" ? "#ff6b6b" : "#4a5568",
            borderBottom: activeTab === "registrations" ? "2px solid #ff6b6b" : "none",
            background: "none",
            cursor: "pointer",
          }}
        >
          注册审核 ({registrations.length})
        </button>
        <button
          onClick={() => setActiveTab("ai_review")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: activeTab === "ai_review" ? "600" : "400",
            color: activeTab === "ai_review" ? "#ff6b6b" : "#4a5568",
            borderBottom: activeTab === "ai_review" ? "2px solid #ff6b6b" : "none",
            background: "none",
            cursor: "pointer",
          }}
        >
          AI发帖复核 ({pendingPosts.length})
        </button>
        <button
          onClick={() => setActiveTab("post_reports")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: activeTab === "post_reports" ? "600" : "400",
            color: activeTab === "post_reports" ? "#ff6b6b" : "#4a5568",
            borderBottom: activeTab === "post_reports" ? "2px solid #ff6b6b" : "none",
            background: "none",
            cursor: "pointer",
          }}
        >
          帖子审核 ({postReports.length})
        </button>
        <button
          onClick={() => setActiveTab("comment_ai_review")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: activeTab === "comment_ai_review" ? "600" : "400",
            color: activeTab === "comment_ai_review" ? "#ff6b6b" : "#4a5568",
            borderBottom: activeTab === "comment_ai_review" ? "2px solid #ff6b6b" : "none",
            background: "none",
            cursor: "pointer",
          }}
        >
          评论人工复核 ({pendingComments.length})
        </button>
        <button
          onClick={() => setActiveTab("comment_reports")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: activeTab === "comment_reports" ? "600" : "400",
            color: activeTab === "comment_reports" ? "#ff6b6b" : "#4a5568",
            borderBottom: activeTab === "comment_reports" ? "2px solid #ff6b6b" : "none",
            background: "none",
            cursor: "pointer",
          }}
        >
          评论审核 ({commentReports.length})
        </button>
      </div>

      {activeTab === "registrations" && (
        <div className="admin-registration-list">
          {registrations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#a0aec0" }}>暂无待审核注册申请</div>
          ) : (
            registrations.map((registration) => (
              <div
                key={registration.id}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: "1px solid #edf2f7",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>{registration.nickname}</h3>
                    <p style={{ margin: "4px 0", color: "#4a5568" }}>学号：{registration.username}</p>
                    {registration.email && <p style={{ margin: "4px 0", color: "#4a5568" }}>邮箱：{registration.email}</p>}
                    <p style={{ margin: "4px 0", color: "#718096", fontSize: "13px" }}>提交时间：{registration.created_at}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRegistration(registration)}
                    style={{
                      height: "36px",
                      padding: "0 18px",
                      border: "1px solid #1677ff",
                      color: "#1677ff",
                      background: "#e6f4ff",
                      borderRadius: "18px",
                      cursor: "pointer",
                    }}
                  >
                    查看详情
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* AI 发帖复核列表 */}
      {activeTab === "ai_review" && (
        <div className="admin-posts-list">
          {pendingPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#a0aec0" }}>🎉 暂无待复核的帖子</div>
          ) : (
            pendingPosts.map((post) => (
              <div
                key={post.id}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: "1px solid #edf2f7",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>{post.title}</h3>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {aiReviewBadge(post.ai_review)}
                    <span
                      style={{
                        background: "#fed7d7",
                        color: "#c53030",
                        padding: "4px 8px",
                        borderRadius: "20px",
                        fontSize: "12px",
                      }}
                    >
                      {post.status}
                    </span>
                  </div>
                </div>
                <p style={{ color: "#4a5568", marginBottom: "12px" }}>{post.content}</p>
                {post.ai_review?.reason && (
                  <p style={{ color: "#718096", fontSize: "13px", marginBottom: "12px" }}>
                    AI 审核：{post.ai_review.reason}
                  </p>
                )}
                <div style={{ fontSize: "13px", color: "#718096", marginBottom: "16px" }}>
                  作者：{post.nickname || post.user_id} · 创建时间：{post.created_at}
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <Link
                    to={`/post/${post.id}?adminReview=post`}
                    style={{
                      background: "#edf2f7",
                      color: "#2d3748",
                      textDecoration: "none",
                      padding: "8px 20px",
                      borderRadius: "30px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "14px",
                    }}
                  >
                    查看帖子
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* AI 评论复核列表 */}
      {activeTab === "comment_ai_review" && (
        <div className="admin-comments-list">
          {pendingComments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#a0aec0" }}>暂无待复核的评论</div>
          ) : (
            pendingComments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: "1px solid #edf2f7",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px", marginBottom: "10px" }}>
                  <strong>评论 #{comment.id}</strong>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {aiReviewBadge(comment.ai_review)}
                    <span style={{ background: "#fed7d7", color: "#c53030", padding: "4px 8px", borderRadius: "20px", fontSize: "12px" }}>
                      {comment.status}
                    </span>
                  </div>
                </div>
                <p style={{ color: "#4a5568", marginBottom: "12px" }}>{comment.content}</p>
                {comment.ai_review?.reason && (
                  <p style={{ color: "#718096", fontSize: "13px", marginBottom: "12px" }}>
                    AI 审核：{comment.ai_review.reason}
                  </p>
                )}
                <div style={{ fontSize: "13px", color: "#718096", marginBottom: "16px" }}>
                  作者：{comment.nickname || comment.user_id} · 所属帖子：{comment.post_title || comment.post_id} · 创建时间：{comment.created_at}
                </div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <Link
                    to={`/post/${comment.post_id}`}
                    style={{ background: "#edf2f7", color: "#2d3748", textDecoration: "none", padding: "8px 20px", borderRadius: "30px", fontSize: "14px" }}
                  >
                    查看评论所在帖子
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleCommentReview(comment, "approve")}
                    style={{ border: "none", background: "#48bb78", color: "white", padding: "8px 20px", borderRadius: "30px", cursor: "pointer", fontSize: "14px" }}
                  >
                    通过
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCommentReview(comment, "reject")}
                    style={{ border: "none", background: "#f56565", color: "white", padding: "8px 20px", borderRadius: "30px", cursor: "pointer", fontSize: "14px" }}
                  >
                    不通过
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 举报审核列表 */}
      {["post_reports", "comment_reports"].includes(activeTab) && (
        <div className="admin-reports-list">
          {(activeTab === "post_reports" ? postReports : commentReports).length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#a0aec0" }}>🎉 暂无待处理的举报</div>
          ) : (
            (activeTab === "post_reports" ? postReports : commentReports).map((report) => (
              <div
                key={report.id}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: "1px solid #edf2f7",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "600" }}>
                    举报 #{report.id} · {reportTargetLabels[report.target_type] || report.target_type}
                  </span>
                  <span style={{ fontSize: "12px", color: "#a0aec0" }}>{report.created_at}</span>
                </div>
                <p>
                  <strong>被举报内容：</strong> {report.target_title || "内容不存在或已删除"}
                </p>
                {report.target_type === "COMMENT" && (
                  <p>
                    <strong>评论所在帖子：</strong> {report.target_post_title || report.target_post_id || "未知"}
                  </p>
                )}
                <p>
                  <strong>举报原因：</strong> {reportReasonLabels[report.reason_type] || report.reason_type}
                </p>
                <p>
                  <strong>详细描述：</strong> {report.reason_detail || "无"}
                </p>
                <p>
                  <strong>举报人：</strong> {report.reporter_nickname || report.reporter_id}
                </p>
                <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
                  <Link
                    to={`${report.target_type === "COMMENT" ? `/post/${report.target_post_id || report.target_id}` : `/post/${report.target_id}`}?reportId=${report.id}`}
                    style={{
                      background: "#edf2f7",
                      color: "#2d3748",
                      textDecoration: "none",
                      padding: "8px 20px",
                      borderRadius: "30px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    {report.target_type === "COMMENT" ? "查看评论所在帖子" : "查看被举报帖子"}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedRegistration && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "12px", maxWidth: "760px", width: "100%", maxHeight: "90vh", overflow: "auto", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: 0 }}>注册申请详情</h3>
                <p style={{ color: "#666", margin: "6px 0 0" }}>{selectedRegistration.nickname} · {selectedRegistration.username}</p>
              </div>
              <button type="button" onClick={() => setSelectedRegistration(null)} style={{ border: "none", background: "#edf2f7", borderRadius: "16px", height: "32px", padding: "0 14px", cursor: "pointer" }}>关闭</button>
            </div>
            {cardPreviewUrl ? (
              <img src={cardPreviewUrl} alt="学生证或学生卡" style={{ width: "100%", maxHeight: "56vh", objectFit: "contain", background: "#f7fafc", borderRadius: "8px" }} />
            ) : (
              <div style={{ padding: "48px", textAlign: "center", color: "#999", background: "#f7fafc", borderRadius: "8px" }}>图片加载中...</div>
            )}
            <div style={{ display: "flex", gap: "12px", marginTop: "20px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => handleRegistrationDecision(selectedRegistration, "reject")}
                style={{ padding: "9px 18px", border: "1px solid #ff7875", color: "#cf1322", background: "#fff1f0", borderRadius: "20px", cursor: "pointer" }}
              >
                否决：图片无法验证身份
              </button>
              <button
                type="button"
                onClick={() => handleRegistrationDecision(selectedRegistration, "approve")}
                style={{ padding: "9px 18px", border: "1px solid #52c41a", color: "white", background: "#52c41a", borderRadius: "20px", cursor: "pointer" }}
              >
                通过
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
