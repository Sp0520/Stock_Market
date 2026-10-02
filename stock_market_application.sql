SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+05:30";

-- =========================================
-- TABLE: users
-- =========================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(15) NOT NULL,
  PANCARD_number VARCHAR(10) NOT NULL,
  available_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_email (email),
  UNIQUE KEY unique_mobile (mobile_number),
  UNIQUE KEY unique_pan (PANCARD_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- SAMPLE USER DATA (Password is 'password123')
-- =========================================
INSERT INTO users (firstname, lastname, address, email, password, mobile_number, PANCARD_number, available_balance)
VALUES (
  'Rahul',
  'Sharma',
  'A-404, Tech Park Heights, Bandra Kurla Complex, Mumbai, Maharashtra - 400051',
  'rahul.sharma@investor.in',
  '$2y$10$9.j1fFms4w7c29gQ4UeIWe77N2kM2r8qA/wW13QpC.EwDozOspq5G',
  '9876543210',
  'ABCDE1234F',
  125000.00
) ON DUPLICATE KEY UPDATE id=id;

-- =========================================
-- TABLE: stock_details (PHP & React Portfolio Holdings)
-- =========================================
CREATE TABLE IF NOT EXISTS stock_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stock_name VARCHAR(50) NOT NULL,
  purchase_price DECIMAL(15,2) NOT NULL,
  user_id INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  sell_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  status INT NOT NULL DEFAULT 1, -- 1 = Holding/Active, 0 = Sold
  purchase_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- SAMPLE STOCK DATA
-- =========================================
INSERT INTO stock_details (stock_name, purchase_price, user_id, qty, sell_price, status)
VALUES
('TCS.NS', 3550.00, 1, 120, 0.00, 1),
('RELIANCE.NS', 2820.00, 1, 85, 0.00, 1),
('HDFCBANK.NS', 1510.00, 1, 120, 0.00, 1)
ON DUPLICATE KEY UPDATE id=id;

-- =========================================
-- TABLE: orders
-- =========================================
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  symbol VARCHAR(50) NOT NULL,
  exchange VARCHAR(10) NOT NULL DEFAULT 'NSE',
  type VARCHAR(10) NOT NULL, -- BUY, SELL
  order_category VARCHAR(15) NOT NULL, -- MARKET, LIMIT, SL
  qty INT NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  status VARCHAR(15) NOT NULL, -- OPEN, EXECUTED, CANCELLED, REJECTED
  time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  executed_price DECIMAL(15,2) NULL,
  charges DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- SAMPLE ORDERS DATA
-- =========================================
INSERT INTO orders (user_id, symbol, exchange, type, order_category, qty, price, status, executed_price, charges)
VALUES
(1, 'RELIANCE.NS', 'NSE', 'BUY', 'LIMIT', 85, 2820.00, 'EXECUTED', 2820.00, 25.50),
(1, 'TCS.NS', 'NSE', 'BUY', 'MARKET', 120, 3550.00, 'EXECUTED', 3550.00, 18.20)
ON DUPLICATE KEY UPDATE id=id;

-- =========================================
-- TABLE: users_transaction (Cash Transactions)
-- =========================================
CREATE TABLE IF NOT EXISTS users_transaction (
  id INT AUTO_INCREMENT PRIMARY KEY,
  credit DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  debit DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  payment_id VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  status VARCHAR(15) NOT NULL DEFAULT 'COMPLETED', -- COMPLETED, PENDING, FAILED
  payment_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- SAMPLE TRANSACTION DATA
-- =========================================
INSERT INTO users_transaction (credit, debit, payment_id, description, user_id, status)
VALUES
(750000.00, 0.00, 'pay_DEP10001', 'Deposit from Bank Account (Razorpay Simulation)', 1, 'COMPLETED'),
(0.00, 239725.50, 'pay_BUY10001', 'Bought 85 shares of RELIANCE.NS', 1, 'COMPLETED'),
(0.00, 426018.20, 'pay_BUY10002', 'Bought 120 shares of TCS.NS', 1, 'COMPLETED')
ON DUPLICATE KEY UPDATE id=id;

-- =========================================
-- =========================================
-- TABLE: watchlist
-- =========================================
CREATE TABLE IF NOT EXISTS watchlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  symbol VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_symbol (user_id, symbol),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- SAMPLE WATCHLIST DATA
-- =========================================
INSERT INTO watchlist (user_id, symbol)
VALUES
(1, 'RELIANCE'),
(1, 'TCS'),
(1, 'INFY'),
(1, 'HDFCBANK'),
(1, 'ICICIBANK')
ON DUPLICATE KEY UPDATE id=id;

-- =========================================
-- TABLE: stocks (Master Indian Equities)
-- =========================================
CREATE TABLE IF NOT EXISTS stocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  symbol VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  exchange VARCHAR(10) NOT NULL DEFAULT 'NSE',
  sector VARCHAR(80) NOT NULL,
  industry VARCHAR(80) NULL,
  face_value DECIMAL(10,2) DEFAULT 10.00,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO stocks (symbol, name, exchange, sector, industry, face_value)
VALUES
('RELIANCE', 'Reliance Industries Ltd', 'NSE', 'Oil & Gas / Conglomerate', 'Refineries', 10.00),
('TCS', 'Tata Consultancy Services Ltd', 'NSE', 'Information Technology', 'IT Services', 1.00),
('INFY', 'Infosys Limited', 'NSE', 'Information Technology', 'IT Services', 5.00),
('HDFCBANK', 'HDFC Bank Limited', 'NSE', 'Financial Services', 'Private Bank', 1.00),
('ICICIBANK', 'ICICI Bank Limited', 'NSE', 'Financial Services', 'Private Bank', 2.00),
('SBIN', 'State Bank of India', 'NSE', 'Financial Services', 'Public Bank', 1.00),
('LT', 'Larsen & Toubro Ltd', 'NSE', 'Construction & Engineering', 'Infrastructure', 2.00),
('ZOMATO', 'Eternal Ltd (Zomato)', 'NSE', 'Consumer Tech', 'E-Commerce Delivery', 1.00)
ON DUPLICATE KEY UPDATE id=id;

-- =========================================
-- TABLE: ipos (Indian Initial Public Offerings)
-- =========================================
CREATE TABLE IF NOT EXISTS ipos (
  id VARCHAR(50) PRIMARY KEY,
  company VARCHAR(150) NOT NULL,
  ipo_name VARCHAR(150) NOT NULL,
  symbol VARCHAR(30) NOT NULL,
  logo VARCHAR(10) DEFAULT '🚀',
  issue_price VARCHAR(50) NOT NULL,
  min_price DECIMAL(15,2) NOT NULL,
  max_price DECIMAL(15,2) NOT NULL,
  lot_size INT NOT NULL,
  min_investment DECIMAL(15,2) NOT NULL,
  gmp VARCHAR(50) DEFAULT 'N/A',
  gmp_note VARCHAR(255) DEFAULT 'Market sentiment tracker; not an exchange metric',
  status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING', -- UPCOMING, OPEN, CLOSED, LISTED
  retail_sub VARCHAR(30) DEFAULT 'N/A',
  qib_sub VARCHAR(30) DEFAULT 'N/A',
  nii_sub VARCHAR(30) DEFAULT 'N/A',
  employee_sub VARCHAR(30) DEFAULT 'N/A',
  total_sub VARCHAR(30) DEFAULT 'N/A',
  open_date VARCHAR(30) NOT NULL,
  close_date VARCHAR(30) NOT NULL,
  listing_date VARCHAR(30) NOT NULL,
  listing_price DECIMAL(15,2) DEFAULT NULL,
  current_price DECIMAL(15,2) DEFAULT NULL,
  issue_size VARCHAR(50) NOT NULL,
  fresh_issue VARCHAR(50) NOT NULL,
  ofs VARCHAR(50) NOT NULL,
  rating VARCHAR(20) DEFAULT '4.0 / 5',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO ipos (id, company, ipo_name, symbol, logo, issue_price, min_price, max_price, lot_size, min_investment, gmp, status, retail_sub, qib_sub, nii_sub, total_sub, open_date, close_date, listing_date, listing_price, current_price, issue_size, fresh_issue, ofs, rating, description)
VALUES
('ipo-1', 'Swiggy Limited', 'Swiggy IPO', 'SWIGGY', '🍔', '₹371 - ₹390', 371.00, 390.00, 38, 14820.00, '+₹25.00 (6.4%)', 'LISTED', '1.14x', '6.02x', '0.41x', '3.59x', '06 Nov 2024', '08 Nov 2024', '13 Nov 2024', 420.00, 448.50, '₹11,327 Cr', '₹4,499 Cr', '₹6,828 Cr', '4.3 / 5', 'Leading consumer tech platform operating India food delivery and quick commerce.'),
('ipo-2', 'NTPC Green Energy Ltd', 'NTPC Green Energy IPO', 'NTPCGREEN', '⚡', '₹102 - ₹108', 102.00, 108.00, 138, 14904.00, '+₹14.00 (13.0%)', 'OPEN', '3.42x', '3.85x', '2.10x', '2.85x', '19 Nov 2026', '22 Nov 2026', '27 Nov 2026', NULL, NULL, '₹10,000 Cr', '₹10,000 Cr', '₹0 Cr', '4.6 / 5', 'Wholly owned renewable arm of Maharatna PSU NTPC Limited.'),
('ipo-3', 'Acme Solar Holdings Ltd', 'Acme Solar IPO', 'ACMESOLAR', '☀️', '₹275 - ₹289', 275.00, 289.00, 51, 14739.00, '+₹18.00 (6.2%)', 'UPCOMING', 'Pending', 'Pending', 'Pending', 'Bidding Soon', '05 Dec 2026', '08 Dec 2026', '13 Dec 2026', NULL, NULL, '₹2,900 Cr', '₹2,395 Cr', '₹505 Cr', '4.0 / 5', 'Pure-play renewable independent power producer (IPP) across India.'),
('ipo-4', 'Bajaj Housing Finance Ltd', 'Bajaj Housing Finance IPO', 'BAJAJHFL', '🏠', '₹66 - ₹70', 66.00, 70.00, 214, 14980.00, '+₹82.00 (117.1%)', 'LISTED', '7.41x', '209.36x', '41.51x', '63.61x', '09 Sep 2024', '11 Sep 2024', '16 Sep 2024', 150.00, 132.80, '₹6,560 Cr', '₹3,560 Cr', '₹3,000 Cr', '4.9 / 5', 'Housing finance giant backed by Bajaj Group.')
ON DUPLICATE KEY UPDATE id=id;

-- =========================================
-- TABLE: ipo_applications (Simulated ASBA/UPI Applications)
-- =========================================
CREATE TABLE IF NOT EXISTS ipo_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_no VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  ipo_id VARCHAR(50) NOT NULL,
  company VARCHAR(150) NOT NULL,
  investor_category VARCHAR(30) NOT NULL DEFAULT 'RETAIL', -- RETAIL, HNI, EMPLOYEE
  lots INT NOT NULL DEFAULT 1,
  bid_price DECIMAL(15,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  upi_id VARCHAR(100) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'APPLIED', -- APPLIED, ALLOTTED, NOT_ALLOTTED, CANCELLED
  allotted_shares INT NOT NULL DEFAULT 0,
  refund_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ipo_id) REFERENCES ipos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO ipo_applications (application_no, user_id, ipo_id, company, investor_category, lots, bid_price, total_amount, upi_id, status, allotted_shares)
VALUES
('IPO-APP-2026-1001', 1, 'ipo-1', 'Swiggy Limited', 'RETAIL', 1, 390.00, 14820.00, 'rahul@okaxis', 'ALLOTTED', 38)
ON DUPLICATE KEY UPDATE id=id;

-- =========================================
-- TABLE: mutual_funds (Indian Mutual Funds)
-- =========================================
CREATE TABLE IF NOT EXISTS mutual_funds (
  id VARCHAR(50) PRIMARY KEY,
  scheme_code INT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  fund_house VARCHAR(150) NOT NULL,
  category VARCHAR(80) NOT NULL,
  main_category VARCHAR(80) NOT NULL,
  nav DECIMAL(15,4) NOT NULL,
  nav_date VARCHAR(30) NOT NULL,
  return_1d DECIMAL(8,2) DEFAULT 0.00,
  return_1y DECIMAL(8,2) DEFAULT 0.00,
  return_3y DECIMAL(8,2) DEFAULT 0.00,
  return_5y DECIMAL(8,2) DEFAULT 0.00,
  rating INT DEFAULT 5,
  expense_ratio VARCHAR(20) DEFAULT '0.65%',
  aum VARCHAR(50) DEFAULT '₹10,000 Cr',
  risk_level VARCHAR(80) DEFAULT 'Very High Risk',
  min_sip DECIMAL(15,2) DEFAULT 500.00,
  min_lumpsum DECIMAL(15,2) DEFAULT 1000.00,
  exit_load TEXT,
  benchmark VARCHAR(150),
  fund_manager VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO mutual_funds (id, scheme_code, name, fund_house, category, main_category, nav, nav_date, return_1d, return_1y, return_3y, return_5y, rating, expense_ratio, aum, risk_level, min_sip, min_lumpsum, benchmark, fund_manager)
VALUES
('mf-1', 122639, 'Parag Parikh Flexi Cap Fund Direct-Growth', 'PPFAS Mutual Fund', 'Flexi Cap', 'Equity Funds', 88.2500, '01-Oct-2026', 0.62, 28.45, 22.80, 23.50, 5, '0.62%', '₹74,850 Cr', 'Very High Risk', 1000.00, 1000.00, 'NIFTY 500 TRI', 'Rajeev Thakkar & Raunak Onkar'),
('mf-2', 118834, 'Mirae Asset Large Cap Fund Direct-Growth', 'Mirae Asset Mutual Fund', 'Large Cap', 'Equity Funds', 118.4000, '01-Oct-2026', 0.45, 24.10, 17.60, 18.90, 4, '0.52%', '₹39,200 Cr', 'Very High Risk', 1000.00, 5000.00, 'NIFTY 100 TRI', 'Gaurav Misra'),
('mf-3', 118989, 'HDFC Mid-Cap Opportunities Fund Direct-Growth', 'HDFC Mutual Fund', 'Mid Cap', 'Equity Funds', 184.6000, '01-Oct-2026', 0.88, 38.50, 29.40, 27.20, 5, '0.78%', '₹68,100 Cr', 'Very High Risk', 1000.00, 1000.00, 'NIFTY Midcap 150 TRI', 'Chirag Setalvad'),
('mf-4', 120828, 'Quant Small Cap Fund Direct-Growth', 'Quant Mutual Fund', 'Small Cap', 'Equity Funds', 268.9000, '01-Oct-2026', 1.15, 44.80, 34.20, 39.10, 5, '0.75%', '₹24,300 Cr', 'Very High Risk', 1000.00, 5000.00, 'NIFTY Smallcap 250 TRI', 'Sandeep Tandon'),
('mf-5', 119598, 'SBI Nifty 50 Index Fund Direct-Growth', 'SBI Mutual Fund', 'Index Funds', 'Index Funds', 218.4500, '01-Oct-2026', 0.54, 22.80, 16.90, 17.50, 4, '0.18%', '₹14,200 Cr', 'Very High Risk', 500.00, 5000.00, 'NIFTY 50 TRI', 'Raviprakash Sharma'),
('mf-6', 120503, 'Axis ELSS Tax Saver Fund Direct-Growth', 'Axis Mutual Fund', 'ELSS', 'ELSS', 104.2000, '01-Oct-2026', 0.38, 21.60, 15.80, 16.70, 4, '0.68%', '₹34,800 Cr', 'Very High Risk (3-Yr Lock-in)', 500.00, 500.00, 'NIFTY 500 TRI', 'Shreyash Devalkar'),
('mf-7', 120366, 'ICICI Prudential Equity & Debt Fund Direct-Growth', 'ICICI Prudential Mutual Fund', 'Hybrid Funds', 'Hybrid Funds', 362.8000, '01-Oct-2026', 0.28, 26.90, 21.40, 20.80, 5, '0.85%', '₹36,700 Cr', 'Very High Risk', 1000.00, 5000.00, 'CRISIL Hybrid 35+65 Aggressive', 'Sankaran Naren'),
('mf-8', 119062, 'HDFC Corporate Bond Fund Direct-Growth', 'HDFC Mutual Fund', 'Debt Funds', 'Debt Funds', 32.4000, '01-Oct-2026', 0.03, 7.85, 6.95, 7.20, 4, '0.29%', '₹28,900 Cr', 'Moderate Risk', 1000.00, 5000.00, 'NIFTY Corporate Bond B-III', 'Anupam Joshi'),
('mf-9', 119800, 'Nippon India Liquid Fund Direct-Growth', 'Nippon India Mutual Fund', 'Liquid Funds', 'Liquid Funds', 6150.8000, '01-Oct-2026', 0.02, 7.25, 6.30, 5.85, 4, '0.19%', '₹34,100 Cr', 'Low to Moderate Risk', 1000.00, 1000.00, 'CRISIL Liquid Debt A-I', 'Anju Chhajer')
ON DUPLICATE KEY UPDATE id=id;

-- =========================================
-- TABLE: mutual_fund_holdings (Lumpsum & Consolidated MF Portfolio)
-- =========================================
CREATE TABLE IF NOT EXISTS mutual_fund_holdings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  fund_id VARCHAR(50) NOT NULL,
  fund_name VARCHAR(255) NOT NULL,
  category VARCHAR(80) NOT NULL,
  folio_number VARCHAR(50) NOT NULL,
  units DECIMAL(15,4) NOT NULL,
  invested_amount DECIMAL(15,2) NOT NULL,
  average_nav DECIMAL(15,4) NOT NULL,
  current_nav DECIMAL(15,4) NOT NULL,
  current_value DECIMAL(15,2) NOT NULL,
  unrealized_profit DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  unrealized_profit_pct DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO mutual_fund_holdings (user_id, fund_id, fund_name, category, folio_number, units, invested_amount, average_nav, current_nav, current_value, unrealized_profit, unrealized_profit_pct)
VALUES
(1, 'mf-1', 'Parag Parikh Flexi Cap Fund Direct-Growth', 'Flexi Cap', 'FOLIO-PPF-88219', 339.9433, 25000.00, 73.5400, 88.2500, 30000.00, 5000.00, 20.00),
(1, 'mf-5', 'SBI Nifty 50 Index Fund Direct-Growth', 'Index Funds', 'FOLIO-SBI-44129', 102.5641, 20000.00, 195.0000, 218.4500, 22405.13, 2405.13, 12.03)
ON DUPLICATE KEY UPDATE id=id;

-- =========================================
-- TABLE: sip_plans (Systematic Investment Plans)
-- =========================================
CREATE TABLE IF NOT EXISTS sip_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sip_code VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  fund_id VARCHAR(50) NOT NULL,
  fund_name VARCHAR(255) NOT NULL,
  frequency VARCHAR(20) NOT NULL DEFAULT 'MONTHLY', -- MONTHLY, WEEKLY, QUARTERLY
  installment_amount DECIMAL(15,2) NOT NULL,
  sip_day INT NOT NULL DEFAULT 5,
  duration_months INT NOT NULL DEFAULT 36,
  expected_return DECIMAL(5,2) DEFAULT 12.00,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PAUSED, CANCELLED, COMPLETED
  installments_paid INT NOT NULL DEFAULT 1,
  total_invested DECIMAL(15,2) NOT NULL,
  units_allocated DECIMAL(15,4) NOT NULL DEFAULT 0.0000,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  next_installment_date DATE NOT NULL,
  last_installment_date TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO sip_plans (sip_code, user_id, fund_id, fund_name, frequency, installment_amount, sip_day, duration_months, expected_return, status, installments_paid, total_invested, units_allocated, next_installment_date)
VALUES
('SIP-PPF-001', 1, 'mf-1', 'Parag Parikh Flexi Cap Fund Direct-Growth', 'MONTHLY', 5000.00, 10, 36, 15.00, 'ACTIVE', 6, 30000.00, 365.1250, '2026-11-10'),
('SIP-SBI-002', 1, 'mf-5', 'SBI Nifty 50 Index Fund Direct-Growth', 'MONTHLY', 3000.00, 15, 60, 13.00, 'ACTIVE', 4, 12000.00, 56.4020, '2026-11-15')
ON DUPLICATE KEY UPDATE id=id;

-- =========================================
-- TABLE: sip_transactions (SIP Installment Records)
-- =========================================
CREATE TABLE IF NOT EXISTS sip_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sip_id INT NOT NULL,
  user_id INT NOT NULL,
  installment_no INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  nav DECIMAL(15,4) NOT NULL,
  units_allotted DECIMAL(15,4) NOT NULL,
  transaction_ref VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'EXECUTED',
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sip_id) REFERENCES sip_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO sip_transactions (sip_id, user_id, installment_no, amount, nav, units_allotted, transaction_ref, status)
VALUES
(1, 1, 1, 5000.00, 80.5000, 62.1118, 'SIP_TXN_101', 'EXECUTED'),
(1, 1, 2, 5000.00, 81.2000, 61.5763, 'SIP_TXN_102', 'EXECUTED'),
(1, 1, 3, 5000.00, 83.1000, 60.1684, 'SIP_TXN_103', 'EXECUTED'),
(1, 1, 4, 5000.00, 84.4000, 59.2417, 'SIP_TXN_104', 'EXECUTED'),
(1, 1, 5, 5000.00, 86.0000, 58.1395, 'SIP_TXN_105', 'EXECUTED'),
(1, 1, 6, 5000.00, 88.2500, 56.6572, 'SIP_TXN_106', 'EXECUTED')
ON DUPLICATE KEY UPDATE id=id;

-- =========================================
-- TABLE: announcements (Platform & Market Announcements)
-- =========================================
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'MARKET_ALERT',
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'INFO', -- INFO, WARNING, SUCCESS, DANGER
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO announcements (title, category, message, severity, is_active)
VALUES
('Muhurat Trading Scheduled', 'MARKET_SCHEDULE', 'Diwali Muhurat Trading session will be conducted on NSE & BSE from 6:15 PM to 7:15 PM IST.', 'SUCCESS', 1),
('SEBI Index Derivative Framework', 'REGULATORY', 'Revised minimum contract size of ₹15 Lakhs for equity index derivatives effective this month.', 'INFO', 1)
ON DUPLICATE KEY UPDATE id=id;

COMMIT;