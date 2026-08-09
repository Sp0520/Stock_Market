# Stock Market Application - Production Setup Guide

## Project Overview
A PHP-based stock market trading application with real-time stock data integration, secure payment processing via Razorpay, and user portfolio management.

## Requirements Met
✅ All SQL injection vulnerabilities fixed (prepared statements)  
✅ Proper error handling and logging  
✅ Environment variable configuration  
✅ Docker containerization for Render  
✅ Security headers and .htaccess configuration  
✅ Null/empty checks on all array accesses  
✅ Session management and authentication  
✅ Database error handling  

## Local Setup Instructions

### Prerequisites
- PHP 8.2+
- MySQL 5.7+ or MariaDB
- Apache with mod_rewrite enabled
- Composer (optional)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Sp0520/Stock_Market.git
cd Stock_Market
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your local database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=stock_market
DB_PORT=3306
```

### Step 3: Create Database
```bash
mysql -u root -p < stock_market_application.sql
```

### Step 4: Run Locally with XAMPP
1. Copy the project to `C:\xampp\htdocs\stock_market`
2. Start Apache and MySQL from XAMPP Control Panel
3. Visit `http://localhost/stock_market`

### Step 5: Run with Docker Locally
```bash
docker build -t stock-market-app .
docker run -p 8080:80 \
  -e DB_HOST=localhost \
  -e DB_USER=root \
  -e DB_PASS=password \
  -e DB_NAME=stock_market \
  stock-market-app
```

## Render.com Deployment

### Prerequisites
- GitHub account with repository access
- Render.com account
- MySQL database (Render, AWS RDS, DigitalOcean, etc.)

### Step 1: Push to GitHub
Ensure all changes are committed and pushed:
```bash
git add .
git commit -m "Production ready - all security fixes applied"
git push origin main
```

### Step 2: Create MySQL Database on Render
1. Log in to Render Dashboard
2. Click **"New+"** → **"MySQL"**
3. Configure:
   - Name: `stock-market-db`
   - Database Name: `stock_market`
   - Create strong username and password
4. Copy the connection string

### Step 3: Deploy Web Service
1. Go to **"New+"** → **"Web Service"**
2. Select your GitHub repository
3. Configure:
   - **Name**: `stock-market-app`
   - **Environment**: `Docker`
   - **Region**: Select your region
   - **Plan**: Starter (free tier)

### Step 4: Add Environment Variables
In Render dashboard, add under "Advanced":
```
DB_HOST=<your-mysql-host>
DB_USER=<your-database-user>
DB_PASS=<your-secure-password>
DB_NAME=stock_market
DB_PORT=3306
RAZORPAY_KEY_ID=<your-razorpay-key>
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
```

### Step 5: Deploy
- Click **"Create Web Service"**
- Monitor deployment in **"Logs"**
- Once deployed, your app is available at `https://your-app.onrender.com`

### Step 6: Initialize Database
Import the schema into your Render database:
```bash
mysql -h <render-host> -u <user> -p<password> <database> < stock_market_application.sql
```

## File Structure
```
stock_market_application/
├── index.php                 # Login page
├── signup.php                # User registration
├── market.php                # Stock market view
├── portfolios.php            # User portfolio management
├── dashboard.php             # User dashboard
├── selectedStock.php         # Individual stock details
├── transactionHistory.php    # Transaction logs
├── forgot_pass.php           # Password recovery
├── reset.php                 # Password reset
├── conn.php                  # Database connection (SECURE)
├── mainTop.php               # Navigation header
├── searchStock.php           # Stock search
├── Style.css                 # Main styles
├── Dockerfile                # Docker configuration
├── render.yaml               # Render deployment config
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── .htaccess                 # Apache security config
├── RENDER_DEPLOYMENT.md      # Deployment guide
├── stock_market_application.sql # Database schema
└── assets/
    ├── razorpay/             # Razorpay payment integration
    └── logo.png
```

## Security Features
✅ **SQL Injection Prevention**: All queries use prepared statements  
✅ **Password Security**: Password hashing with `password_hash()`  
✅ **Session Management**: Proper session validation on all protected pages  
✅ **Error Handling**: Errors logged, not displayed to users  
✅ **Input Validation**: All user inputs validated and sanitized  
✅ **HTTPS**: Configured in .htaccess for production  
✅ **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.  

## API Integration
- **Stock Data**: AlphaVantage API (5 requests/minute on free tier)
- **Payments**: Razorpay Payment Gateway
- **Authentication**: Custom PHP sessions

## Database Schema
The `stock_market_application.sql` file includes tables for:
- `users` - User accounts and authentication
- `stock_details` - User's stock holdings
- `users_transaction` - Transaction history

## Troubleshooting

### Database Connection Failed
1. Verify all environment variables are set correctly
2. Check database is accessible from Render's IP
3. Confirm credentials are correct
4. Check network firewall rules

### Payment Integration Issues
1. Verify Razorpay keys are correct
2. Ensure payment amount is valid
3. Check cookies are enabled on client

### API Rate Limits
- AlphaVantage: 5 requests per minute (free tier)
- Solution: Upgrade API key or implement caching

### Static Files Not Loading
1. Check Apache mod_rewrite is enabled
2. Verify .htaccess file exists
3. Check file permissions (755)

## Performance Optimization
- Database queries use prepared statements (prevents N+1 queries)
- Stock data cached where possible
- Error logging enabled for monitoring
- .htaccess configured for compression

## Support
For issues:
1. Check Render logs: `https://dashboard.render.com`
2. Verify database connection
3. Review error logs in `/logs/` directory
4. Check environment variables in Render dashboard

## License
© 2026 Stock Market Application. All rights reserved.

## Last Updated
2026-07-04
