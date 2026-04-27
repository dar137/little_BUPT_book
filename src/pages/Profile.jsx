import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    } else {
      setUserInfo({ studentId: "20240001", name: "测试用户" });
    }
    // TODO: 替换成真实接口 /api/user/my-posts
    setMyPosts([
      { id: 1, title: "我的第一篇帖子", createdAt: "2024-01-01" },
      { id: 2, title: "求助：React 问题", createdAt: "2024-01-15" },
    ]);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  if (!userInfo) return <div>加载中...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>个人中心</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>退出登录</button>
      </div>
      <div style={styles.infoCard}>
        <p><strong>姓名：</strong>{userInfo.name}</p>
        <p><strong>学号：</strong>{userInfo.studentId}</p>
      </div>
      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(activeTab === "posts" ? styles.activeTab : {}) }} onClick={() => setActiveTab("posts")}>我的帖子</button>
        <button style={{ ...styles.tab, ...(activeTab === "favorites" ? styles.activeTab : {}) }} onClick={() => setActiveTab("favorites")}>我的收藏</button>
      </div>
      {activeTab === "posts" && (
        <div>
          {myPosts.length === 0 ? <p>暂无帖子</p> : myPosts.map(post => (
            <div key={post.id} style={styles.postItem}>
              <h4>{post.title}</h4>
              <small>{post.createdAt}</small>
            </div>
          ))}
        </div>
      )}
      {activeTab === "favorites" && <div style={styles.placeholder}>收藏功能开发中...</div>}
    </div>
  );
};

const styles = {
  container: { maxWidth: "600px", margin: "0 auto", padding: "1rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  logoutBtn: { padding: "0.5rem 1rem", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  infoCard: { backgroundColor: "#f8f9fa", padding: "1rem", borderRadius: "8px", margin: "1rem 0" },
  tabs: { display: "flex", gap: "1rem", borderBottom: "1px solid #ddd", marginBottom: "1rem" },
  tab: { padding: "0.5rem 1rem", background: "none", border: "none", cursor: "pointer" },
  activeTab: { borderBottom: "2px solid #007bff", color: "#007bff" },
  postItem: { padding: "0.75rem 0", borderBottom: "1px solid #eee" },
  placeholder: { color: "#999", textAlign: "center", padding: "2rem" },
};

export default Profile;