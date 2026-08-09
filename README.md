# ⚡ Indian Stock Market Trading Platform (NSE & BSE)

A full-stack, production-ready **Indian Stock Market Trading Platform** inspired by **Groww, Zerodha Kite, Upstox, Dhan, and TradingView**. Built with **HTML5, CSS3, JavaScript, React.js (`.jsx`/`.js`)** on the frontend and **Node.js, Express.js, and MongoDB** on the backend.

---

## 🌟 Key Features

### 1. 🇮🇳 Exclusive Indian Stock Market Standard
- **NSE & BSE Exchanges Only**: Complete market coverage for top Indian companies including `RELIANCE`, `TCS`, `INFY`, `HDFCBANK`, `ICICIBANK`, `SBIN`, `ITC`, `LT`, `BEL`, `HAL`, `ONGC`, `IOC`, `IRCTC`, `TATAMOTORS`, `PAYTM`, `ZOMATO`, `SWIGGY`, `ADANIENT`, `NTPC`, `POWERGRID`, `SUNPHARMA`, `MARUTI`, etc.
- **Strict Indian Rupee (`₹`) Currency**: Every price, profit, investment, balance, order amount, charges breakdown, and chart label displays in Indian Rupees (`₹`) with Indian number formatting (`₹12,45,680.50`, `₹20.38 Lakh Cr`).

### 2. 🌌 3D Glassmorphism Fintech Command Center UI
- **`FINANCE.hub` Terminal View**: Left search results panel, real-time price metric card, main TradingView candlestick chart, market indicators, stock profile, and live Order Book depth (`Bid` vs `Ask`).
- **`TRADEFLOW` Dashboard**: Owned stocks list, line charts with glowing trade markers (`▲ Buy` / `▼ Sell`), vibrant emerald balance card, and 3D quick action buttons.
- **Interactive 3D Elements**: Mouse-perspective 3D card tilt (`Card3D.jsx`), 3D Asset Allocation Donut Chart (`Donut3DChart.jsx`), and raised 3D Sector Market Heatmap (`MarketHeatmap3D.jsx`).

### 3. 📈 Professional Technical Charts & Order Execution
- **TradingView Charts**: Candlestick, Area, Line, Heikin-Ashi with timeframe toggles (`1D` to `MAX`), technical indicators (EMA, VWAP, Volume Overlay), and glowing crosshairs.
- **Order Ticket & Statutory Charges**: Supports Market, Limit, Stop Loss (SL), GTT, and Cover orders with real-time Indian statutory fee breakdown (Flat Brokerage ₹20, STT 0.1%, Exchange fee, GST 18%, Stamp Duty in ₹).

### 4. 💼 Portfolio, IPOs, Mutual Funds & AI Insights
- **Holdings & P&L**: Real-time portfolio tracking, average price ₹, current value ₹, today's P&L ₹ and overall return %.
- **IPO Hub**: Upcoming & listed IPOs with GMP ₹, Issue price, subscription x, and interactive PAN allotment checker.
- **Mutual Funds & SIP Wealth Calculator**: Interactive monthly SIP calculator with duration sliders and future maturity projections.
- **AI Analytics**: AI Stock Recommendations, AI Portfolio Health Checks, and Market Sentiment Index.
- **Transactions & Orders**: Filterable transaction history table matching Image 2 UI with status badges (`COMPLETED`, `EXECUTED`, `PAID`, `PENDING`).

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), React.js (`.jsx`/`.js`), Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express.js, REST API, JWT Authentication, bcrypt, Helmet, CORS, Morgan, dotenv.
- **Database**: MongoDB Atlas with Mongoose models & built-in fallback data engine.
- **Deployment**: Render.com Blueprint (`render.yaml` & `Procfile`).

---

## 🚀 Quick Start & Deployment Options

This repository contains two platforms to run the Stock Market Application:
1. **Option A (Modern)**: React + Node.js (Express) + MongoDB SPA.
2. **Option B (Traditional)**: PHP + Apache + MySQL + Yahoo Finance Live API.

---

### Option A: React + Express + MongoDB setup

#### Prerequisites
- Node.js (v18+)
- npm (v9+)

#### Installation Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sp0520/Stock_Market.git
   cd Stock_Market
   ```
2. **Install dependencies & build**:
   ```bash
   npm run build
   ```
3. **Start the Express server**:
   ```bash
   npm start
   ```
4. **Access the application**:
   - Production URL: [http://localhost:5000/](http://localhost:5000/)
   - Vite Dev Server: [http://localhost:5173/](http://localhost:5173/)

---

### Option B: PHP + MySQL + XAMPP setup (Local Windows)

#### Prerequisites
- XAMPP (Apache with PHP 7.4+ and MySQL)

#### Installation Steps
1. **Copy workspace to xampp root**:
   Place the project folder inside `C:\xampp\htdocs\stock_market\`.
2. **Set up the Database**:
   - Open XAMPP and start Apache and MySQL.
   - Go to `http://localhost/phpmyadmin` and create a database named `stock_market_application`.
   - Import the schema and seed data from [`stock_market_application.sql`](file:///c:/xampp/htdocs/stock_market/stock_market_application.sql).
3. **Configure Environment**:
   - Create a `.env` file in the root folder with your database credentials (host, user, database). Alternatively, the connection script fallback will attempt to connect using the default XAMPP user:
     ```env
     DB_HOST=127.0.0.1
     DB_USER=root
     DB_PASS=
     DB_NAME=stock_market_application
     ```
4. **Run the PHP platform**:
   - Access the PHP sign-in page at: [http://localhost/stock_market/login.php](http://localhost/stock_market/login.php)
   - Features include real-time stock prices (via Yahoo Finance proxy), holdings tracking, and Razorpay wallet simulation.

---

## 🌐 Deploy to Render.com (1-Click Blueprint)

1. Push code to your GitHub repository (`Sp0520/Stock_Market`).
2. Log into [Render.com Dashboard](https://dashboard.render.com/).
3. Click **New +** ➡️ **Blueprint**.
4. Connect repository `Sp0520/Stock_Market`.
5. Render will read `render.yaml`, execute `npm run build`, start `npm start`, and issue a live SSL `.onrender.com` URL!

---

## 📡 REST API Documentation

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/indices` | GET | Fetch live Indian benchmark indices (NIFTY 50, SENSEX, BANK NIFTY) |
| `/api/stocks` | GET | List all NSE & BSE stocks with real-time prices |
| `/api/stocks/:symbol` | GET | Detailed fundamental profile for a stock |
| `/api/stocks/:symbol/chart` | GET | OHLC candle data for chart rendering |
| `/api/orders/estimate` | POST | Calculate Indian statutory charges (Brokerage, STT, GST, Stamp Duty) |
| `/api/orders/place` | POST | Execute Buy/Sell order and update portfolio balance |
| `/api/portfolio` | GET | Fetch user portfolio, holdings, and P&L metrics |
| `/api/ipos` | GET | Fetch upcoming IPOs and GMP data |
| `/api/ipos/allotment-check` | POST | Verify allotment status for PAN number |
| `/api/mutual-funds` | GET | List top Indian mutual funds |
| `/api/ai/insights` | GET | Generate AI stock recommendations and market sentiment index |

---

## 📄 License
ISC License. Built for Production Deployment.
