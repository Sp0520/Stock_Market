SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- =========================================
-- TABLE: users
-- =========================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(15) NOT NULL,
  PANCARD_number VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  profile_picture VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  available_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- SAMPLE USER DATA (Admin & User)
-- =========================================
INSERT INTO users (firstname, lastname, address, email, password, mobile_number, PANCARD_number, role, available_balance)
VALUES 
('Admin', 'User', 'Fintech HQ Mumbai', 'admin@stockapp.com', '$2y$10$tZ2y10B/79N26VpB0h2/G.qY3K.k7bQ/jWb5Jk.FwE8NqH3K8882O', '9999999999', 'ADMINPAN12A', 'admin', 500000.00),
('Rushi', 'Raval', 'Rajpardi Jhagadia Bharuch', 'rushi1234@gmail.com', '$2y$10$tZ2y10B/79N26VpB0h2/G.qY3K.k7bQ/jWb5Jk.FwE8NqH3K8882O', '1234567890', 'CSKJVC1548A', 'user', 60123.30)
ON DUPLICATE KEY UPDATE email=email;

-- =========================================
-- TABLE: stock_details
-- =========================================
CREATE TABLE IF NOT EXISTS stock_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stock_name VARCHAR(255) NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  user_id INT NOT NULL,
  sell_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status INT NOT NULL, -- 1 = active / holding, 0 = sold
  purchase_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_stock_user ON stock_details(user_id);
CREATE INDEX idx_stock_name ON stock_details(stock_name);

-- =========================================
-- SAMPLE STOCK DATA
-- =========================================
INSERT INTO stock_details (stock_name, purchase_price, user_id, sell_price, status)
VALUES
('TCS', 3814.65, 2, 0.00, 1),
('RELIANCE', 2331.80, 2, 2355.60, 0),
('RELIANCE', 2331.80, 2, 2383.95, 0),
('RELIANCE', 2355.60, 2, 2355.60, 0);

-- =========================================
-- TABLE: users_transaction
-- =========================================
CREATE TABLE IF NOT EXISTS users_transaction (
  id INT AUTO_INCREMENT PRIMARY KEY,
  credit DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  debit DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_id VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  payment_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_transaction_user ON users_transaction(user_id);

-- =========================================
-- SAMPLE TRANSACTION DATA
-- =========================================
INSERT INTO users_transaction (credit, debit, payment_id, description, user_id)
VALUES
(140.00, 0.00, 'pay_IsDpa6xpi0kAwv', 'deposit', 2),
(10.00, 0.00, 'pay_IsG3FaML45RX8M', 'deposit', 2),
(3000.00, 0.00, 'pay_IsGjbOBBZKYGKA', 'deposit', 2),
(5000.00, 0.00, 'pay_IsHPTJ10SQ6bQn', 'deposit', 2);

-- =========================================
-- TABLE: watchlists
-- =========================================
CREATE TABLE IF NOT EXISTS watchlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL DEFAULT 'My Watchlist',
  is_pinned TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_watchlist (user_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- TABLE: watchlist_stocks
-- =========================================
CREATE TABLE IF NOT EXISTS watchlist_stocks (
  watchlist_id INT NOT NULL,
  stock_name VARCHAR(50) NOT NULL,
  added_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (watchlist_id, stock_name),
  FOREIGN KEY (watchlist_id) REFERENCES watchlists(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- TABLE: notifications
-- =========================================
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- DEFAULT SAMPLE WATCHLISTS & NOTIFICATIONS
-- =========================================
INSERT INTO watchlists (user_id, name, is_pinned) VALUES (2, 'My Watchlist', 1) ON DUPLICATE KEY UPDATE name=name;
INSERT INTO watchlist_stocks (watchlist_id, stock_name) VALUES (1, 'TCS'), (1, 'RELIANCE') ON DUPLICATE KEY UPDATE stock_name=stock_name;
INSERT INTO notifications (user_id, title, message, is_read) VALUES (2, 'Welcome to Stock Market App', 'Start trading today with virtual credits.', 0) ON DUPLICATE KEY UPDATE title=title;

COMMIT;