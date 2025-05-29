import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

const eventStyles = {
  "Tech News": { icon: "📰" },
  "Deal Event": { icon: "💼" },
  "Advisor Update": { icon: "👥" },
  default: { icon: "❓" },
};

function App() {
  const defaultFilters = {
    "Tech News": true,
    "Deal Event": true,
    "Advisor Update": true,
  };

  const [newsItems, setNewsItems] = useState([]);
  const [filters, setFilters] = useState(() => {
    const stored = localStorage.getItem("filters");
    return stored ? JSON.parse(stored) : defaultFilters;
  });
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem("searchTerm") || "";
  });

  useEffect(() => {
    socket.on("news", (item) => {
      setNewsItems((prev) => {
        const combined = [item, ...prev];

        const seen = new Set();
        const filtered = combined.filter(news => {
          const id = news.link || news.title;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });

        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        return filtered.slice(0, 100); // keep max 100 items client-side
      });
    });

    return () => socket.off("news");
  }, []);

  // Persist filters and search term
  useEffect(() => {
    localStorage.setItem("filters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem("searchTerm", searchTerm);
  }, [searchTerm]);

  function toggleFilter(type) {
    setFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }

  const filteredItems = newsItems.filter(
    (item) =>
      filters[item.eventType] &&
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        fontFamily: "'Georgia', serif",
        minHeight: "100vh",
        backgroundColor: "#fff",
        color: "#111",
        padding: "40px 5vw",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          maxWidth: 1200,
          width: "100%",
          gap: 32,
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            flexBasis: "28%",
            borderRight: "1px solid #ccc",
            paddingRight: 24,
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: 24 }}>
            Filters & Search
          </h2>

          {/* Search Box */}
          <div style={{ marginBottom: 36 }}>
            <label
              htmlFor="search"
              style={{
                fontWeight: "bold",
                display: "block",
                marginBottom: 8,
                fontSize: 15,
              }}
            >
              Search Articles
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. AI, M&A..."
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "16px",
                border: "1px solid #aaa",
                borderRadius: 4,
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Event Filters */}
          <div>
            <strong style={{ display: "block", marginBottom: 16 }}>Categories</strong>
            {Object.keys(eventStyles)
              .filter((type) => type !== "default")
              .map((type) => (
                <label
                  key={type}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 14,
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filters[type]}
                    onChange={() => toggleFilter(type)}
                    style={{ marginRight: 10 }}
                  />
                  {type}
                </label>
              ))}
          </div>
        </aside>

        {/* News Feed */}
        <main style={{ flexBasis: "72%" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: 32 }}>
            Deal Network News
          </h1>

          {filteredItems.length === 0 && (
            <p style={{ fontStyle: "italic", color: "#666" }}>
              No news found for your criteria.
            </p>
          )}

          {filteredItems.map((item, idx) => {
            const style = eventStyles[item.eventType] || eventStyles.default;
            return (
              <article
                key={idx}
                style={{
                  borderBottom: "1px solid #ddd",
                  paddingBottom: 24,
                  marginBottom: 32,
                }}
              >
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#111",
                  }}
                >
                  <h2 style={{ fontSize: "1.75rem", marginBottom: 8 }}>
                    {style.icon} {item.title}
                  </h2>
                </a>
                <p style={{ fontSize: "0.9rem", color: "#666" }}>
                  {new Date(item.date).toLocaleString()} &nbsp; | &nbsp; {item.eventType}
                </p>
              </article>
            );
          })}
        </main>
      </div>
    </div>
  );
}

export default App;
