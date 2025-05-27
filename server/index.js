const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const Parser = require("rss-parser");

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const parser = new Parser();
const PORT = 4000;

let lastGuids = new Set();
let cachedNews = [];  // Keep recent news items here

async function fetchFeed() {
  try {
    console.log("Fetching RSS feed...");
    const feed = await parser.parseURL("https://techcrunch.com/feed/");
    const newItems = feed.items.filter((item) => !lastGuids.has(item.guid));

    console.log(`Found ${newItems.length} new item(s)`);

    newItems.forEach((item) => {
      const newsItem = {
        title: item.title,
        link: item.link,
        date: item.pubDate,
      };
      io.emit("news", newsItem);

      cachedNews.unshift(newsItem);  // Add new item to the start of cache
      lastGuids.add(item.guid);
    });

    // Limit cache size to last 50 items
    if (cachedNews.length > 50) {
      cachedNews = cachedNews.slice(0, 50);
    }

    // Clean up GUIDs to prevent memory leaks
    if (lastGuids.size > 100) {
      lastGuids = new Set(feed.items.map((item) => item.guid));
    }
  } catch (err) {
    console.error("Error fetching or processing RSS feed:", err);
  }
}

// Fetch initially on startup
fetchFeed();

// Poll every 10 seconds
setInterval(fetchFeed, 10000);

io.on("connection", (socket) => {
  console.log("Client connected");

  // Immediately send cached news to new client
  cachedNews.forEach((newsItem) => {
    socket.emit("news", newsItem);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
