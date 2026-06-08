// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaTrash, FaEye } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

// 模拟 AI 标记的可疑帖子数据（实际应从后端获取）
const mockAIPosts = [
  {
    id: 101,
    title: "免费送演唱会门票",
    content: "点击链接领取，先到先得 http://fake.com",
    author: "可疑用户001",
    createdAt: "2024-06-01 10:23",
    aiScore: 0.95,
  },
  {
    id: 102,
    title: "兼职日入500",
    content: "加微信 xxxx 咨询，日结轻松赚钱",
    author: "广告哥",
    createdAt: "2024-06-02 14:15",
    aiScore: 0.98,
  },
  {
    id: 103,
    title: "求购二手自行车",
    content: "想买一辆二手自行车，价格好商量",
    author: "小明",
    createdAt: "2024-06-03 09:00",
    aiScore: 0.12, // 低分，表示AI认为正常
  },
];

// 模拟举报数据
const mockReports = [
  {
    id: 1,
    targetType: "post",
    targetId: 101,
    reason: "垃圾广告",
    description: "帖子中含有外部链接，疑似诈骗",
    reporter: "热心同学",
    createdAt: "2024-06-01 11:20",
  },
  {
    id: 2,
    targetType: "user",
    targetId: 5,
    reason: "人身攻击",
    description: "该用户在评论区辱骂他人",
    reporter: "李华",
    createdAt: "2024-06-02 08:45",
  },
];

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ai_review");
  const [pendingPosts, setPendingPosts] = useState(mockAIPosts);
  const [reports, setReports] = useState(mockReports);

  // 非管理员直接跳转首页
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/");
    }
  }, [currentUser, navigate]);

  // ---------- AI发帖复核处理 ----------
  const handleApprovePost = (postId) => {
    setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
    alert(`帖子 ${postId} 已通过，将正常发布`);
    // TODO: 调用后端 API /api/admin/approve-post
  };

  const handleDeletePost = (postId) => {
    setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
    alert(`帖子 ${postId} 已删除`);
    // TODO: 调用后端 API /api/admin/delete-post
  };

  // ---------- 举报审核处理 ----------
  const handleConfirmReport = (reportId) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    alert(`举报 ${reportId} 已确认，相关内容已下架/用户已处理`);
    // TODO: 调用后端 API /api/admin/confirm-report
  };

  const handleRejectReport = (reportId) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    alert(`举报 ${reportId} 已驳回（不违规）`);
    // TODO: 调用后端 API /api/admin/reject-report
  };

  return (
    <div className="admin-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>管理后台</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>欢迎回来，{currentUser?.name || "管理员"}</p>

      {/* Tab 切换栏 */}
      <div className="admin-tabs" style={{ display: "flex", gap: "16px", borderBottom: "1px solid #e2e8f0", marginBottom: "24px" }}>
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
          🤖 AI发帖复核 ({pendingPosts.length})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: activeTab === "reports" ? "600" : "400",
            color: activeTab === "reports" ? "#ff6b6b" : "#4a5568",
            borderBottom: activeTab === "reports" ? "2px solid #ff6b6b" : "none",
            background: "none",
            cursor: "pointer",
          }}
        >
          🚨 举报审核 ({reports.length})
        </button>
      </div>

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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>{post.title}</h3>
                  <span
                    style={{
                      background: post.aiScore > 0.7 ? "#fed7d7" : "#c6f6d5",
                      color: post.aiScore > 0.7 ? "#c53030" : "#276749",
                      padding: "4px 8px",
                      borderRadius: "20px",
                      fontSize: "12px",
                    }}
                  >
                    AI可疑度: {(post.aiScore * 100).toFixed(0)}%
                  </span>
                </div>
                <p style={{ color: "#4a5568", marginBottom: "12px" }}>{post.content}</p>
                <div style={{ fontSize: "13px", color: "#718096", marginBottom: "16px" }}>
                  作者：{post.author} · 发布时间：{post.createdAt}
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => handleApprovePost(post.id)}
                    style={{
                      background: "#48bb78",
                      color: "white",
                      border: "none",
                      padding: "8px 20px",
                      borderRadius: "30px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <FaCheckCircle /> 通过
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    style={{
                      background: "#f56565",
                      color: "white",
                      border: "none",
                      padding: "8px 20px",
                      borderRadius: "30px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <FaTrash /> 删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 举报审核列表 */}
      {activeTab === "reports" && (
        <div className="admin-reports-list">
          {reports.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#a0aec0" }}>🎉 暂无待处理的举报</div>
          ) : (
            reports.map((report) => (
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
                    举报 #{report.id} · 目标类型: {report.targetType === "post" ? "帖子" : "用户"}
                  </span>
                  <span style={{ fontSize: "12px", color: "#a0aec0" }}>{report.createdAt}</span>
                </div>
                <p>
                  <strong>目标ID：</strong> {report.targetId}
                </p>
                <p>
                  <strong>举报原因：</strong> {report.reason}
                </p>
                <p>
                  <strong>详细描述：</strong> {report.description}
                </p>
                <p>
                  <strong>举报人：</strong> {report.reporter}
                </p>
                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  <button
                    onClick={() => handleConfirmReport(report.id)}
                    style={{
                      background: "#48bb78",
                      color: "white",
                      border: "none",
                      padding: "8px 20px",
                      borderRadius: "30px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <FaCheckCircle /> 确认违规（下架/封禁）
                  </button>
                  <button
                    onClick={() => handleRejectReport(report.id)}
                    style={{
                      background: "#f56565",
                      color: "white",
                      border: "none",
                      padding: "8px 20px",
                      borderRadius: "30px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <FaTimesCircle /> 驳回举报
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;