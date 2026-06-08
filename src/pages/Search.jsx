import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { postAPI } from "../api";

const Search = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(keyword);
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword]);

  const performSearch = async (kw) => {
    setLoading(true);
    setError(null);
    try {
      const data = await postAPI.search({ keyword: kw });
      setResults(data.list || []);
    } catch (err) {
      console.error("搜索失败:", err);
      setError(err.message || "搜索失败，请稍后重试");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>🔍 搜索</h2>
      <input
        type="text"
        placeholder="输入关键词..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={styles.searchInput}
      />
      {loading && <p style={{ color: '#999' }}>搜索中...</p>}
      {error && <p style={{ color: '#ff4d4f' }}>{error}</p>}
      <div style={styles.results}>
        {results.map((post) => (
          <div key={post.id} style={styles.card}>
            <Link to={`/post/${post.id}`} style={styles.link}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{post.title}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{post.summary || post.content?.slice(0, 100)}</p>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                {post.author?.nickname} · {post.createdAt}
              </div>
            </Link>
          </div>
        ))}
        {!loading && !error && keyword.trim() && results.length === 0 && (
          <p style={{ color: '#999', textAlign: 'center' }}>暂无搜索结果</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: "800px", margin: "0 auto", padding: "1rem" },
  searchInput: { width: "100%", padding: "0.75rem", fontSize: "1rem", border: "1px solid #ddd", borderRadius: "8px" },
  results: { marginTop: "1rem" },
  card: { padding: "1rem", borderBottom: "1px solid #eee" },
  link: { textDecoration: "none", color: "#333" },
};

export default Search;