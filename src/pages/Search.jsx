import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Search = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      performSearch(keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  const performSearch = async (kw) => {
    setLoading(true);
    // TODO: 替换成真实接口 /api/post/search?keyword=xxx
    setTimeout(() => {
      setResults([
        { id: 1, title: `关于 "${kw}" 的帖子 1`, summary: "这是搜索结果摘要..." },
        { id: 2, title: `关于 "${kw}" 的帖子 2`, summary: "另一个相关内容的描述..." },
      ]);
      setLoading(false);
    }, 300);
  };

  return (
    <div style={styles.container}>
      <h2>搜索</h2>
      <input
        type="text"
        placeholder="输入关键词..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={styles.searchInput}
      />
      {loading && <p>搜索中...</p>}
      <div style={styles.results}>
        {results.map((post) => (
          <div key={post.id} style={styles.card}>
            <Link to={`/post/${post.id}`} style={styles.link}>
              <h3>{post.title}</h3>
              <p>{post.summary}</p>
            </Link>
          </div>
        ))}
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