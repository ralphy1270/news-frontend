import React, { useState, useEffect, useRef, useCallback } from "react";

const App = () => {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("All");
  const observer = useRef();
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Headlines");

  const CATEGORIES = ["All", "Sports", "Headlines", "Entertainment"];

  /
  const fetchNews = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/news?page=${reset ? 1 : page}`
        );
        const data = await response.json();

        console.log("Fetched News:", data); 

     
        const filteredData =
          category === "All"
            ? data
            : data.filter(
                (n) => n.tag?.toLowerCase() === category.toLowerCase()
              );

        setNews(
          reset ? filteredData : [...new Set([...news, ...filteredData])]
        ); 
      } catch (error) {
        console.error("Error fetching news:", error);
      }
      setLoading(false);
    },
    [page, category]
  );

 
  useEffect(() => {
    fetchNews(true);
  }, [category]);

  useEffect(() => {
    if (page > 1) fetchNews();
  }, [page]);


  const handleCategoryChange = (newCategory) => {
    if (newCategory !== category) {
      setCategory(newCategory);
      setPage(1);
      setNews([]);
    }
  };

  
  useEffect(() => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    });
    if (news.length > 0)
      observer.current.observe(document.querySelector("#lastNews"));
  }, [loading, news]);

 
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


  const handleDeleteNews = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news?")) return;

    try {
      const response = await fetch(`http://localhost:5000/news/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNews((prevNews) => prevNews.filter((article) => article.id !== id));
      } else {
        alert("Failed to delete news.");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
    }
  };

  
  const handleCreateNews = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent || !newCategory)
      return alert("Title, content, and category are required");

    const response = await fetch(`http://localhost:5000/news`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        content: newContent,
        tag: newCategory,
      }),
    });

    const newArticle = await response.json();
    console.log("New article created:", newArticle); 

    if (
      category === "All" ||
      category.toLowerCase() === newCategory.toLowerCase()
    ) {
      setNews((prevNews) => [newArticle, ...prevNews]);
    }

    setNewTitle("");
    setNewContent("");
    setNewCategory("Headlines");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>News Feed</h1>

    
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            style={{
              marginRight: "10px",
              padding: "10px",
              background: category === cat ? "#007bff" : "#ddd",
              color: category === cat ? "#fff" : "#000",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>


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
       
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          required
          style={{
            display: "block",
            width: "100%",
            marginBottom: "10px",
            padding: "8px",
          }}
        >
          {CATEGORIES.slice(1).map(
            (
              category 
            ) => (
              <option key={category} value={category}>
                {category}
              </option>
            )
          )}
        </select>
        <button type="submit">Create News</button>
      </form>

     
      {news.map((article, index) => (
        <div
          key={article.id}
          id={index === news.length - 1 ? "lastNews" : ""}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <h2>{article.title}</h2>
          <p>{article.content}</p>
          <p>
            <strong>Category:</strong> {article.tag}
          </p>
          <button onClick={() => handleLike(article.id)}>
            👍 Like ({article.likes})
          </button>
          <button
            onClick={() => handleDislike(article.id)}
            style={{ marginLeft: "10px" }}
          >
            👎 Dislike
          </button>
          <button
            onClick={() => handleDeleteNews(article.id)}
            style={{ marginLeft: "10px", background: "red", color: "white" }}
          >
            🗑 Delete
          </button>
        </div>
      ))}

      {loading && <p>Loading more news...</p>}
    </div>
  );
};

export default App;
