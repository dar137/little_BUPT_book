import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { categoryAPI, postAPI } from "../api";

const Search = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 分类筛选
  const [categories, setCategories] = useState(["全部"]);
  const [activeCate, setActiveCate] = useState("全部");

  // 搜索历史
  const [history, setHistory] = useState([]);

  // 初始化读取历史
  useEffect(() => {
    const saved = localStorage.getItem("searchHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryAPI.getList();
        const names = (data.list || []).map((item) => item.name).filter(Boolean);
        setCategories(["全部", ...names]);
      } catch {
        setCategories(["全部"]);
      }
    };

    fetchCategories();
  }, []);

  // 保存历史
  const saveHistory = (kw) => {
    if (!kw.trim()) return;
    let newHistory = [kw, ...history.filter((h) => h !== kw)];
    if (newHistory.length > 10) newHistory = newHistory.slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  // 删除单条历史
  const removeHistory = (kw) => {
    const newHistory = history.filter((h) => h !== kw);
    setHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  // 清空全部历史
  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem("searchHistory");
  };

  // 搜索（关键词 + 分类）
  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    const timer = setTimeout(() => {
      performSearch(keyword, activeCate);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword, activeCate]);

  const performSearch = async (kw, cate) => {
    setLoading(true);
    setError(null);
    try {
      const params = { keyword: kw };
      if (cate && cate !== "全部") params.category = cate;

      const data = await postAPI.search(params);
      setResults(data.list || []);
      saveHistory(kw);
    } catch (err) {
      console.error("搜索失败:", err);
      setError("搜索失败，请稍后重试");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 点击历史记录快速搜索
  const handleHistoryClick = (kw) => {
    setKeyword(kw);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🔍 搜索帖子</h2>
        <p style={styles.subTitle}>输入关键词查找你感兴趣的内容</p>
      </div>

      {/* 搜索框 */}
      <input
        type="text"
        placeholder="输入标题、内容关键词..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={styles.searchInput}
        autoFocus
      />

      {/* 分类筛选 */}
      <div style={styles.cateWrap}>
        {categories.map((c) => (
          <div
            key={c}
            onClick={() => setActiveCate(c)}
            style={{
              ...styles.cateItem,
              backgroundColor: activeCate === c ? "#1677ff" : "#f5f5f5",
              color: activeCate === c ? "#fff" : "#333",
            }}
          >
            {c}
          </div>
        ))}
      </div>

      {/* 搜索历史 */}
      {keyword.trim() === "" && history.length > 0 && (
        <div style={styles.historySection}>
          <div style={styles.historyHeader}>
            <span>🕓 最近搜索</span>
            <span onClick={clearAllHistory} style={styles.clearAll}>
              清空全部
            </span>
          </div>
          <div style={styles.historyList}>
            {history.map((kw, idx) => (
              <div key={idx} style={styles.historyItem}>
                <span onClick={() => handleHistoryClick(kw)} style={styles.hText}>
                  {kw}
                </span>
                <span onClick={() => removeHistory(kw)} style={styles.hDel}>
                  ✕
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 加载 & 错误 */}
      {loading && <div style={styles.tip}>🔍 正在搜索中...</div>}
      {error && <div style={styles.tipError}>{error}</div>}

      {/* 结果 */}
      <div style={styles.results}>
        {results.map((post) => (
          <div key={post.id} style={styles.card}>
            <Link to={`/post/${post.id}`} style={styles.link}>
              {post.coverImage && <img src={post.coverImage} alt="" style={styles.cover} />}
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{post.title}</h3>
                <p style={styles.cardSummary}>
                  {post.summary || post.content?.slice(0, 100) + "..."}
                </p>
                <div style={styles.cardFooter}>
                  <span>{post.author?.nickname || "匿名"}</span>
                  <span>{post.createdAt}</span>
                  <span style={{ color: "#1677ff" }}>{post.category}</span>
                </div>
              </div>
            </Link>
          </div>
        ))}

        {!loading && !error && keyword.trim() && results.length === 0 && (
          <div style={styles.empty}>😶‍🌫️ 暂无相关结果</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" },
  header: { textAlign: "center", marginBottom: "1rem" },
  title: { fontSize: "22px", fontWeight: 600, margin: "0 0 4px 0" },
  subTitle: { fontSize: "14px", color: "#888", margin: 0 },

  searchInput: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #eee",
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "10px",
  },

  // 分类
  cateWrap: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  cateItem: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "14px",
    cursor: "pointer",
  },

  // 历史记录
  historySection: { marginBottom: "20px" },
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#666",
    marginBottom: "8px",
  },
  clearAll: { color: "#1677ff", cursor: "pointer" },
  historyList: { display: "flex", flexWrap: "wrap", gap: "8px" },
  historyItem: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f7f8fa",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "14px",
    gap: "6px",
  },
  hText: { cursor: "pointer" },
  hDel: { color: "#999", cursor: "pointer", fontSize: "12px" },

  tip: { textAlign: "center", color: "#666", margin: "10px 0" },
  tipError: { textAlign: "center", color: "#ff4d4f", margin: "10px 0" },

  // 结果卡片
  results: { marginTop: "10px" },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    display: "flex",
    gap: "10px",
  },
  link: { display: "flex", gap: "10px", textDecoration: "none", color: "inherit", flex: 1 },
  cover: { width: "80px", height: "60px", objectFit: "cover", borderRadius: "8px" },
  cardBody: { flex: 1, justifyContent: "center" },
  cardTitle: { fontSize: "16px", fontWeight: 600, margin: "0 0 4px 0" },
  cardSummary: { fontSize: "14px", color: "#666", margin: "0 0 4px 0" },
  cardFooter: { fontSize: "12px", color: "#999", display: "flex", gap: "10px" },

  empty: { textAlign: "center", color: "#999", padding: "40px 0" },
};

export default Search;
