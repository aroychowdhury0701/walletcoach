# 💸 WalletCoach- Personal Finance, Decoded.
Deployment link: https://walletcoach.onrender.com
Note: Hosted on a free tier, please allow 30 seconds for the initial load.
![Hackathon](https://img.shields.io/badge/Hackathon-Project-orange?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-Vanilla_JS_|_Express_|_Chart.js-blue?style=for-the-badge)

> **"Seize control of your financial future."** A beginner-friendly personal finance dashboard that ditches the complex jargon and guilt-tripping, acting as an objective co-pilot for young adults managing their money.

---

## 💡 The Problem
Financial literacy is a major hurdle for young adults managing money for the first time. Existing apps are often:
1. Filled with complex banking jargon (APY, Liquidity, ETFs).
2. Designed to make users feel "guilty" for overspending.
3. Too complex, requiring hours of setup before providing value.

## 🎯 Our Solution
**[Project Name]** bridges the gap between "I have money" and "I don't know where it went." Instead of acting like a strict parent, it acts like a smart financial co-pilot. We focus on behavioral psychology, clear data, and zero judgment.

---

## ✨ Key "Killer" Features

* **🛡️ Gentle Guardrails (Psychology-Driven UI):** Real-time, non-intrusive toast notifications that give objective feedback based on remaining budgets (e.g., *"₹400 left. That'll go quick if you're not careful"*). No red alerts, no guilt.
* **🔍 Hybrid Jargon Translator:** A built-in search bar that explains complex finance terms in "Plain English." It checks a curated beginner dictionary first, and gracefully falls back to a live REST API for infinite vocabulary.
* **📊 Dynamic 50/30/20 Rule Builder:** Automatically splits income into Needs, Wants, and Savings using an interactive Doughnut Chart. Users can even customize this ratio (e.g., to 60/20/20) to fit their lifestyle.
* **🔄 Monthly Reset Logic:** Automatically filters dashboard stats to focus on the *current month's* cash flow while maintaining an all-time "Total Saved" tracker.

---

## 🛠️ Tech Stack
To prioritize speed, lightweight deployment, and absolute control over the DOM, we built this using a lean stack:

* **Frontend:** Vanilla JavaScript, HTML5, Custom CSS (CSS Grid/Flexbox)
* **Backend:** Node.js with Express.js (for serving static files seamlessly)
* **Data Visualization:** Chart.js (Doughnut & Pie charts)
* **External API:** Free Dictionary API (for real-time jargon translation fallback)

---

## 🚀 Getting Started (Local Setup)

Want to run this locally? It takes less than 30 seconds.

### Prerequisites
* [Node.js](https://nodejs.org/) installed on your machine.

### Installation Steps
1. **Clone the repository:**
   ```
   git clone [https://github.com/yourusername/your-repo-name.git](https://github.com/yourusername/your-repo-name.git)
   cd your-repo-name
   ```
   Install dependencies:

```
npm install
```
Start the Express server:

```
npm start
```
Open your browser and navigate to http://localhost:3000

🔮 What's Next (Future Scope)
If we had more time, we would love to implement:

Firebase Authentication: Allowing users to create accounts and save their data permanently to a NoSQL database.

Gamified Milestones: Rewarding users with digital badges for maintaining a "Wants" budget streak for 3 consecutive months.

Receipt Scanning: Using a simple OCR API to automatically parse physical receipts into expense categories.

Created with ❤️ for HackOlympus
