-- =========================================
-- TABLE: otp_verifications
-- =========================================
CREATE TABLE IF NOT EXISTS otp_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  identifier VARCHAR(150) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  purpose ENUM('signup', 'login', 'password_reset') NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  is_used TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_identifier_purpose (identifier, purpose),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
