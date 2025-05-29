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

const feedUrls = [
  "https://www.altassets.net/feed",
  "https://privateequityinfo.com/blog/rss.xml",
  "https://peprofessional.com/feed",
  "https://www.nytimes.com/svc/collections/v1/publish/http://www.nytimes.com/topic/subject/private-equity/rss.xml",
  "https://mattturck.com/feed",
  "https://nvca.org/feed",
  "https://pe-insights.com/feed",
  "https://chiefoutsiders.com/private-equity/rss.xml",
  "https://investmentcouncil.org/content/rss/",
  "https://www.ft.com/private-equity?format=rss",
  "https://angelassociation.co.nz/blog/rss/",
  "https://thisisgoingtobebig.com/blog?format=rss",
  "https://asimplemodel.com/insights/feed"
];

let lastGuids = new Set();
let cachedNews = [];

async function fetchFeed(url) {
  try {
    const feed = await parser.parseURL(url);
    return feed.items;
  } catch (err) {
    console.error(`Error fetching feed ${url}:`, err);
    return [];
  }
}

async function fetchAllFeeds() {
  try {
    console.log("Fetching all RSS feeds...");

    const allItemsArrays = await Promise.all(feedUrls.map(fetchFeed));
    const allItems = allItemsArrays.flat();

    const newItems = allItems.filter(item => {
      const itemId = item.guid || item.link || item.title;
      return !lastGuids.has(itemId);
    });

    console.log(`Found ${newItems.length} new item(s) across all feeds`);

    newItems.forEach((item) => {
      const itemId = item.guid || item.link || item.title;

      const newsItem = {
        guid: itemId,  // store for cleanup
        title: item.title,
        link: item.link,
        date: item.pubDate,
        eventType: categorizeEvent(item),
        source: getFeedSource(item),
      };

      io.emit("news", newsItem);

      cachedNews.unshift(newsItem);
      lastGuids.add(itemId);
    });

    // Limit cache size to last 50 items
    if (cachedNews.length > 50) {
      cachedNews = cachedNews.slice(0, 50);
    }

    // Sort cachedNews by date descending (newest first)
    cachedNews.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Clean up GUIDs to prevent memory leaks
    if (lastGuids.size > 100) {
      lastGuids = new Set(cachedNews.map(item => item.guid || item.link || item.title));
    }
  } catch (err) {
    console.error("Error fetching or processing RSS feeds:", err);
  }
}

function getFeedSource(item) {
  try {
    const url = new URL(item.link);
    return url.hostname.replace("www.", "");
  } catch {
    return "unknown";
  }
}

fetchAllFeeds();
const fetchInterval = setInterval(fetchAllFeeds, 10000);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  cachedNews.forEach((newsItem) => {
    socket.emit("news", newsItem);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

function shutdown() {
  console.log("Shutting down server...");

  clearInterval(fetchInterval);

  for (const [id, socket] of io.sockets.sockets) {
    socket.disconnect(true);
  }

  io.close(() => {
    console.log("Socket.IO server closed.");

    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function categorizeEvent(item) {
  const title = item.title ? item.title.toLowerCase() : "";

  if (title.includes("deal") || title.includes("funding") || title.includes("investment")) {
    return "Deal Event";
  }
  if (title.includes("advisor") || title.includes("joined") || title.includes("partner")) {
    return "Advisor Update";
  }
  return "Tech News";
}
