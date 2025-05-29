# Real-Time Relationship Intelligence Feed Prototype

## Overview

This prototype demonstrates a real-time news feed system tailored for the private capital ecosystem. It aggregates news and updates from multiple RSS feeds, processes and categorizes the information, and streams it live to a React frontend using WebSockets (Socket.IO).

The goal is to simulate relationship intelligence by:

- **Aggregating diverse data sources:** Pulling in updates from multiple RSS feeds covering private equity, deal activity, and advisory news.

- **Real-time streaming:** Using Socket.IO to instantly push updates to connected clients for a real-time feed experience.

- **Categorization:** Classifying news items into event types like Deal Events, Advisor Updates, and Tech News using keyword matching for simple but effective filtering.

- **Personalization:** Allowing users to filter by category and search terms, with preferences saved in `localStorage` for persistence across sessions.

- **Lightweight and extensible:** The backend is stateless and stores data in memory, making it easy to extend with databases, user authentication, or advanced analytics in the future.

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

## Project Structure

- `/server` — backend Node.js server and RSS polling logic  
- `/client` — React frontend with real-time feed UI  

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
   # From root:
   npm install          # installs root dependencies (if any)
   cd client
   npm install          # installs frontend dependencies
   cd ../server
   npm install          # installs backend dependencies (if applicable)
   ```
3. Start the backend server:
   
   ```bash
   # Navigate to the server directory
   cd server
   node index.js
   ```

   The backend will run on http://localhost:4000
4.  Start the frontend:
    Open a new terminal window or tab
    ```bash
    # Navigate to the client directory
    cd client
    npm run dev
    ```
    The frontend will run on http://localhost:5173

5. Open http://localhost:5173 in your browser.

> Note:
> 
> Make sure to run the backend and frontend servers simultaneously in separate terminal windows/tabs.
> 
> To stop either server, press Ctrl + C in the terminal where it's running.

## Contributing / Extending

- To add more RSS feeds, update the `feedUrls` array in `server/index.js`.
- The categorization logic in `categorizeEvent` can be enhanced for more accuracy.
- Currently, data is stored in memory only; adding a database would enable persistence.

## Known Limitations

- No user authentication; filters and search terms are stored only in localStorage.
- RSS polling interval is set to 10 seconds to simulate real-time behavior in demos. For production, this should be increased (e.g., to 3–5 minutes) to reduce load and respect external source limits.
- Categorization relies on simple keyword matching and might misclassify some news items.

## Assumptions & Trade-offs

- No user authentication — user preferences are stored locally via localStorage for simplicity
- RSS feed updates are fetched every 10 seconds to simulate real-time behavior; a longer interval (e.g., every 5 minutes) would be more appropriate in production. 
- No database — feed items are kept in memory to keep the prototype lightweight  
- Categorization is basic and keyword-based; more advanced classification could be added later  

## Future Improvements

- 📦 Store feed items in Redis or PostgreSQL to enable persistence, deduplication, and historical querying  
- 🔐 Add user authentication and profile-based personalization for a tailored experience  
- 🧠 Enhance categorization and event detection with NLP or machine learning models  
- 🕸 Integrate a graph database (e.g., Neo4j) to support advanced relationship intelligence and network analysis  
- 📤 Deploy the app on cloud infrastructure such as AWS, Vercel, or Render for scalability and availability
- 🧪 Add unit and integration tests to improve reliability and maintainability

