import React, { useState, useEffect, useRef, useCallback } from "react";

const App = () => {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  // Fetch news from backend
  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/news?page=${page}`);
      const data = await response.json();
      setNews((prev) => [...prev, ...data]);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Infinite scroll observer
  const lastNewsRef = useRef();
  useEffect(() => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    });
    if (lastNewsRef.current) observer.current.observe(lastNewsRef.current);
  }, [loading]);

  // Like a news article
  const handleLike = async (id) => {
    const response = await fetch(`http://localhost:5000/news/${id}/like`, {
      method: "POST",
    });
    const data = await response.json();
    setNews((prevNews) =>
      prevNews.map((article) =>
        article.id === id ? { ...article, likes: data.likes } : article
      )
    );
  };

  // Dislike a news article
  const handleDislike = async (id) => {
    const response = await fetch(`http://localhost:5000/news/${id}/dislike`, {
      method: "POST",
    });
    const data = await response.json();
    setNews((prevNews) =>
      prevNews.map((article) =>
        article.id === id ? { ...article, likes: data.likes } : article
      )
    );
  };

  // Create new news
  const handleCreateNews = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent)
      return alert("Title and content are required");

    const response = await fetch(`http://localhost:5000/news`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, content: newContent }),
    });

    const newArticle = await response.json();
    setNews((prevNews) => [newArticle, ...prevNews]);
    setNewTitle("");
    setNewContent("");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>News Feed</h1>

      {/* Create News Form */}
      <form onSubmit={handleCreateNews} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
          style={{
            display: "block",
            width: "100%",
            marginBottom: "10px",
            padding: "8px",
          }}
        />
        <textarea
          placeholder="Content"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          required
          style={{
            display: "block",
            width: "100%",
            marginBottom: "10px",
            padding: "8px",
          }}
        />
        <button type="submit">Create News</button>
      </form>

      {/* News List */}
      {news.map((article, index) => (
        <div
          key={article.id}
          ref={index === news.length - 1 ? lastNewsRef : null}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <h2>{article.title}</h2>
          <p>{article.content}</p>
          <button onClick={() => handleLike(article.id)}>
            👍 Like ({article.likes})
          </button>
          <button
            onClick={() => handleDislike(article.id)}
            style={{ marginLeft: "10px" }}
          >
            👎 Dislike
          </button>
        </div>
      ))}

      {loading && <p>Loading more news...</p>}
    </div>
  );
};

export default App;
