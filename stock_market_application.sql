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

COMMIT;