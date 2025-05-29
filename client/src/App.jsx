import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Initialize socket.io client connecting to backend
const socket = io("http://localhost:4000");

// Map event types to display icons
const eventStyles = {
  "Tech News": { icon: "📰" },
  "Deal Event": { icon: "💼" },
  "Advisor Update": { icon: "👥" },
  default: { icon: "❓" },
};

function App() {
  // Default filter settings (all enabled)
  const defaultFilters = {
    "Tech News": true,
    "Deal Event": true,
    "Advisor Update": true,
  };

  // State to hold news items received from socket
  const [newsItems, setNewsItems] = useState([]);

  // Filters state, initialized from localStorage or defaults
  const [filters, setFilters] = useState(() => {
    const stored = localStorage.getItem("filters");
    return stored ? JSON.parse(stored) : defaultFilters;
  });

  // Search term state, initialized from localStorage or empty string
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem("searchTerm") || "";
  });

  // Effect: subscribe to socket "news" events and update state
  useEffect(() => {
    socket.on("news", (item) => {
      setNewsItems((prev) => {
        // Add new item to front of list
        const combined = [item, ...prev];

        // Remove duplicates based on link or title
        const seen = new Set();
        const filtered = combined.filter(news => {
          const id = news.link || news.title;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });

        // Sort by date descending (newest first)
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Keep max 100 items client-side to limit memory usage
        return filtered.slice(0, 100);
      });
    });

    // Cleanup subscription on component unmount
    return () => socket.off("news");
  }, []);

  // Persist filters to localStorage whenever filters change
  useEffect(() => {
    localStorage.setItem("filters", JSON.stringify(filters));
  }, [filters]);

  // Persist search term to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("searchTerm", searchTerm);
  }, [searchTerm]);

  // Toggle filter state for given event type
  function toggleFilter(type) {
    setFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }

  // Apply filters and search term to news items before rendering
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
        {/* Sidebar for Filters and Search */}
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

          {/* Filters checkboxes */}
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

        {/* Main news feed */}
        <main style={{ flexBasis: "72%" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: 32 }}>
            Deal Network News
          </h1>

          {/* Show placeholder if no news matches filter */}
          {filteredItems.length === 0 && (
            <p style={{ fontStyle: "italic", color: "#666" }}>
              No news found for your criteria.
            </p>
          )}

          {/* Render filtered news articles */}
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
