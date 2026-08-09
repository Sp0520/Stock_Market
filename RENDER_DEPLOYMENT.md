# Deployment Guide for Render.com

This repository is pre-configured for 1-click or automated deployment on **Render.com** (Free / Starter Tier).

---

## 🚀 Deployment Instructions (Step-by-Step)

### Option 1: Automatic Blueprint Deployment (Recommended)

1. **Push your code to GitHub** (already pushed to `https://github.com/Sp0520/Stock_Market.git`).
2. Log into [Render.com Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub Repository (`Sp0520/Stock_Market`).
5. Render will automatically detect `render.yaml` and configure:
   - **Name**: `indian-stock-market-app`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
6. Click **Apply**. Render will automatically build the React frontend, package the Express server, and issue a live `.onrender.com` SSL URL!

---

### Option 2: Manual Web Service Setup

If you prefer manual configuration:
1. On Render Dashboard, click **New +** -> **Web Service**.
2. Select repository: `Sp0520/Stock_Market`.
3. Configure settings:
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Click **Create Web Service**.

---

## 🛠️ Build & Runtime Architecture

- `npm run build` runs:
  1. `npm install --prefix client`
  2. `npm run build --prefix client` (compiles 3D React TypeScript app into `client/dist`)
  3. `npm install --prefix server`
- `npm start` launches `server/server.js`, which serves both:
  - **REST API Endpoints**: `/api/stocks`, `/api/indices`, `/api/orders`, `/api/ai/insights`
  - **Single-Page Application (SPA)**: Serves static 3D UI assets from `client/dist`

---

## 💾 Connecting the Database on Render

### Option A: MongoDB for the React + Node.js Platform (Default)

The Node.js server looks for a `MONGO_URI` environment variable. If not provided, it falls back to a temporary in-memory store. To connect a persistent database:

1. **Create a Free MongoDB Cluster**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free shared cluster.
   - Under **Database Access**, create a user with read/write privileges.
   - Under **Network Access**, whitelist `0.0.0.0/0` (allow access from anywhere) so Render's dynamic IP addresses can connect.
   - Click **Connect** -> **Connect your application** and copy the connection string:
     `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/stock_market?retryWrites=true&w=majority`
2. **Add Environment Variable on Render**:
   - Go to your Render Web Service dashboard.
   - Click **Environment** in the sidebar.
   - Click **Add Environment Variable**:
     - **Key**: `MONGO_URI`
     - **Value**: `mongodb+srv://yourUsername:yourPassword@cluster0...` (replace with your actual connection string).
   - Click **Save Changes**. Render will automatically redeploy the service with the live database connected!

---

### Option B: MySQL for the PHP + XAMPP Platform

If you deploy the PHP platform on a PHP-compatible cloud environment or container:

1. **Provision a MySQL Database**:
   - Create a MySQL instance on a cloud provider like Aiven, Clever Cloud, or PlanetScale.
   - Copy the Host, Username, Password, Database Name, and Port details.
2. **Configure Environment Variables**:
   - In your Render Environment settings, configure the following keys:
     - `DB_HOST`: Your cloud database host url.
     - `DB_USER`: Your database username.
     - `DB_PASS`: Your database password.
     - `DB_NAME`: Your database name.
     - `DB_PORT`: `3306` (or database port).
   - Alternatively, you can combine these into a single `DATABASE_URL` environment variable:
     `mysql://username:password@host:port/database_name`
   - [`conn.php`](file:///c:/xampp/htdocs/stock_market/conn.php) will automatically parse `DATABASE_URL` to establish the connection.
