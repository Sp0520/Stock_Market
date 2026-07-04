# Stock Market Application - Render Deployment Guide

## Overview
This guide helps you deploy the Stock Market Application to Render.com with proper database configuration.

## Prerequisites
1. GitHub account with your code repository
2. Render.com account (free tier available)
3. A MySQL database (you can use Render's MySQL or external service)

## Step 1: Set Up MySQL Database

### Option A: Using Render's MySQL Database
1. Go to https://dashboard.render.com
2. Click "New+" → "MySQL"
3. Fill in the details:
   - **Name**: `stock-market-db` (or your choice)
   - **Database Name**: `stock_market`
   - **Username**: Create a strong username
   - **Password**: Create a strong password
4. Click "Create Database"
5. Copy the connection details (you'll need these for environment variables)

### Option B: Using External MySQL Service
If using an external service like:
- AWS RDS
- DigitalOcean Managed Databases
- Aiven
- Planet Scale

Get the following details:
- Host (Database URL)
- Username
- Password
- Database Name
- Port (usually 3306)

## Step 2: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git push -u origin main
```

## Step 3: Connect Repository to Render

1. Go to https://dashboard.render.com
2. Click "New+" → "Web Service"
3. Select "Deploy from a Git repository"
4. Connect your GitHub account and select your repository
5. Fill in the configuration:
   - **Name**: `stock-market-app`
   - **Runtime**: `Docker`
   - **Region**: Choose closest to your users (Singapore, etc.)
   - **Plan**: Starter (free tier)

## Step 4: Set Environment Variables

In the Render dashboard, add the following environment variables under "Environment":

```
DB_HOST=<your-database-host>
DB_USER=<your-database-username>
DB_PASS=<your-database-password>
DB_NAME=<your-database-name>
DB_PORT=3306
```

**Example values:**
```
DB_HOST=dpg-abc123xyz.oregon-postgres.render.com
DB_USER=admin_user
DB_PASS=your-secure-password-here
DB_NAME=stock_market
DB_PORT=3306
```

## Step 5: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Monitor the deployment in the "Logs" tab
4. Once deployed, your app will be available at `https://stock-market-app.onrender.com`

## Troubleshooting

### "Database Connection Failed" Error

**Solution:**
1. Verify all environment variables are set correctly in Render dashboard
2. Check that the database host, username, and password are correct
3. Ensure the database is accessible from your Render instance
4. For MySQL on Render, allow all connections or whitelist Render's IP

### Application Timeout

**Solution:**
1. This is often due to the free tier resources
2. Consider upgrading to a paid plan
3. Or use a different hosting provider with better PHP support

### AlphaVantage API Rate Limits

The application uses AlphaVantage API for stock data (limited to 5 requests/minute on free tier).

**Solution:**
1. Upgrade your API key at https://www.alphavantage.co/
2. Add your API key to environment variables
3. Update `selectedStock.php` to use the environment variable

## Database Initialization

After deploying, you need to run the SQL schema:

1. Download the `stock_market_application.sql` file
2. Import it into your database using:
   - MySQL client: `mysql -h <host> -u <user> -p <database> < stock_market_application.sql`
   - Or use your database provider's import tool

## Local Development

To test locally:

1. Create a `.env` file in the root directory:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=stock_market
DB_PORT=3306
```

2. Run with XAMPP or Docker:
```bash
docker-compose up
```

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to GitHub
- Use strong passwords for database
- Keep API keys secret
- Use HTTPS (Render provides this automatically)
- Enable HTTP/HTTPS redirect

## Support

For issues:
1. Check Render logs
2. Verify database connection
3. Check if environment variables are set
4. Ensure database is initialized with schema

---
**Last Updated:** 2026-07-04
