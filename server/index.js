const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const Parser = require("rss-parser");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const parser = new Parser();

const PORT = 4000;

let lastGuids = new Set();

async function fetchFeed() {
  const feed = await parser.parseURL("https://techcrunch.com/feed/");
  const newItems = feed.items.filter((item) => !lastGuids.has(item.guid));

  newItems.forEach((item) => {
    io.emit("news", {
      title: item.title,
      link: item.link,
      date: item.pubDate,
    });
    lastGuids.add(item.guid);
  });

  // Clean up old GUIDs to avoid memory leak
  if (lastGuids.size > 100) {
    lastGuids = new Set(feed.items.map((item) => item.guid));
  }
}

setInterval(fetchFeed, 10000); // every 10 seconds

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
});
