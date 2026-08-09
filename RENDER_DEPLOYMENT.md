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
