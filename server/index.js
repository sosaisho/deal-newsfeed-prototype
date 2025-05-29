const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const Parser = require("rss-parser");

// Setup Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Setup Socket.IO server with CORS to allow connection from React dev server
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const parser = new Parser();
const PORT = 4000;

// List of RSS feed URLs to fetch news from
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

// Keep track of processed item IDs (guid/link/title) to avoid duplicates
let lastGuids = new Set();
// Cache recent news items to send to new clients on connect
let cachedNews = [];

// Fetch and parse one RSS feed URL
async function fetchFeed(url) {
  try {
    const feed = await parser.parseURL(url);
    return feed.items;
  } catch (err) {
    console.error(`Error fetching feed ${url}:`, err);
    return [];
  }
}

// Fetch all RSS feeds, identify new items, and broadcast them via socket.io
async function fetchAllFeeds() {
  try {
    console.log("Fetching all RSS feeds...");

    // Fetch feeds concurrently
    const allItemsArrays = await Promise.all(feedUrls.map(fetchFeed));
    const allItems = allItemsArrays.flat();

    // Filter out items already seen
    const newItems = allItems.filter(item => {
      const itemId = item.guid || item.link || item.title;
      return !lastGuids.has(itemId);
    });

    console.log(`Found ${newItems.length} new item(s) across all feeds`);

    newItems.forEach((item) => {
      const itemId = item.guid || item.link || item.title;

      // Create simplified news item object with needed fields
      const newsItem = {
        guid: itemId,  // store for cleanup
        title: item.title,
        link: item.link,
        date: item.pubDate,
        eventType: categorizeEvent(item),
        source: getFeedSource(item),
      };

      // Broadcast new news item to all connected clients
      io.emit("news", newsItem);

      // Add to cache and guid set
      cachedNews.unshift(newsItem);
      lastGuids.add(itemId);
    });

    // Limit cache size to last 50 items
    if (cachedNews.length > 50) {
      cachedNews = cachedNews.slice(0, 50);
    }

    // Sort cached news by date descending (newest first)
    cachedNews.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Clean up GUID set if it grows too large to prevent memory leaks
    if (lastGuids.size > 100) {
      lastGuids = new Set(cachedNews.map(item => item.guid || item.link || item.title));
    }
  } catch (err) {
    console.error("Error fetching or processing RSS feeds:", err);
  }
}

// Extract hostname domain from item's link for source display
function getFeedSource(item) {
  try {
    const url = new URL(item.link);
    return url.hostname.replace("www.", "");
  } catch {
    return "unknown";
  }
}

// Start periodic feed fetching every 10 seconds
fetchAllFeeds();
const fetchInterval = setInterval(fetchAllFeeds, 10000);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send cached recent news items to new client on connect
  cachedNews.forEach((newsItem) => {
    socket.emit("news", newsItem);
  });

  // Log client disconnects
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server listening
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

// Simple event categorization logic by keywords in title (can be expanded)
function categorizeEvent(item) {
    const title = (item.title || "").toLowerCase();
    if (title.includes("tech") || title.includes("ai") || title.includes("software")) {
      return "Tech News";
    }
    if (title.includes("deal") || title.includes("merger") || title.includes("acquisition") || title.includes("investment")) {
      return "Deal Event";
    }
    if (title.includes("advisor") || title.includes("consultant") || title.includes("partner")) {
      return "Advisor Update";
    }
    return "Other";
  }
  