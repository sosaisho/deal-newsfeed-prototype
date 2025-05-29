# Real-Time Relationship Intelligence Feed Prototype

## Overview

This project simulates a real-time relationship intelligence feed for the private capital ecosystem. It ingests news and updates from multiple RSS sources and categorizes them by event type (e.g., M&A, People Moves, Fundraising). The frontend displays a stream of these updates and allows basic user personalization.

## Features

- 🔄 Real-time streaming via Socket.IO  
- 📰 Parses and normalizes data from RSS feeds  
- 🧠 Categorizes updates by event type  
- 🔍 Keyword and category filters with localStorage persistence  
- 🎯 Clean, user-friendly interface  

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Socket.IO-client  
- **Backend:** Node.js, Express, RSS Parser, Socket.IO  
- **Other:** localStorage (for preferences), CORS (for local dev)  

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Running Locally
1. Clone the repo:
   
   ```bash
   git clone https://github.com/sosaisho/deal-newsfeed-prototype.git
   cd deal-newsfeed-prototype
   ```

2. Install dependencies:

   ```bash
   # In the root folder
   npm install

   # Navigate to the frontend directory
   cd client
   npm install
   ```
3. Start the backend server:
   
   ```bash
   # Navigate to the server directory
   cd server
   node index.js
   ```

   The backend will run on:
   ➡️ http://localhost:4000
4.  Start the frontend:
    Start a separate terminal
    ```bash
    # Navigate to the server directory
    cd client
    npm run dev
    ```
    The frontend will run on:
    ➡️ http://localhost:5173

5. Open http://localhost:5173 in your browser.

> Note:
> 
> Make sure to run the backend and frontend servers simultaneously in separate terminal windows/tabs.
> 
> To stop either server, press Ctrl + C in the terminal where it's running.

## Assumptions & Trade-offs

- No user login — personalization is stored in `localStorage` for simplicity  
- RSS feed updates are fetched periodically (e.g., every 5 minutes) rather than in real-time polling  
- No database — feed items are kept in memory to keep the prototype lightweight  
- Categorization is basic and keyword-based; more advanced classification could be added later  

## Future Improvements

- 📦 Store feed items in Redis or PostgreSQL to enable persistence, deduplication, and historical querying  
- 🔐 Add user authentication and profile-based personalization for a tailored experience  
- 🧠 Enhance categorization and event detection with NLP or machine learning models  
- 🕸 Integrate a graph database (e.g., Neo4j) to support advanced relationship intelligence and network analysis  
- 📤 Deploy the app on cloud infrastructure such as AWS, Vercel, or Render for scalability and availability  



   
