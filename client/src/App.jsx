import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

function App() {
  const [newsItems, setNewsItems] = useState([]);

  useEffect(() => {
    socket.on("news", (item) => {
      setNewsItems((prev) => [item, ...prev]);
    });

    return () => socket.off("news");
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>Deal Network Newsfeed</h1>
      {newsItems.map((item, idx) => (
        <div key={idx} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #ccc" }}>
          <a href={item.link} target="_blank" rel="noreferrer">
            <h3>{item.title}</h3>
          </a>
          <p style={{ fontSize: 12, color: "#666" }}>{new Date(item.date).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
