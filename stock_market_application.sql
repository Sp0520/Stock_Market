SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE IF NOT EXISTS users (

  id INT AUTO_INCREMENT PRIMARY KEY,

  firstname VARCHAR(255) NOT NULL,

  lastname VARCHAR(255) NOT NULL,

  address TEXT NOT NULL,

  email VARCHAR(255) NOT NULL,

  enter_password VARCHAR(255) NOT NULL,

  confirm_password VARCHAR(255) NOT NULL,

  mobile_number VARCHAR(15) NOT NULL,

  PANCARD_number VARCHAR(255) NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ON UPDATE CURRENT_TIMESTAMP,

  available_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



INSERT INTO users (
firstname,
lastname,
address,
email,
enter_password,
confirm_password,
mobile_number,
PANCARD_number,
available_balance
)
VALUES (
'Rushi',
'Raval',
'Rajpardi Jhagadia Bharuch',
'rushi1234@gmail.com',
'1234',
'1234',
'1234567890',
'CSKJVC1548A',
60123.30
);



CREATE TABLE IF NOT EXISTS stock_details (

  id INT AUTO_INCREMENT PRIMARY KEY,

  stock_name VARCHAR(255) NOT NULL,

  purchase_price DECIMAL(10,2) NOT NULL,

  user_id INT NOT NULL,

  sell_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,

  status INT NOT NULL,

  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



INSERT INTO stock_details (
stock_name,
purchase_price,
user_id,
sell_price,
status
)
VALUES
('TCS',3814.65,1,0.00,1),
('RELIANCE',2331.80,1,2355.60,0),
('RELIANCE',2331.80,1,2383.95,0),
('RELIANCE',2355.60,1,2355.60,0);



CREATE TABLE IF NOT EXISTS users_transaction (

  id INT AUTO_INCREMENT PRIMARY KEY,

  credit DECIMAL(10,2) NOT NULL DEFAULT 0.00,

  debit DECIMAL(10,2) NOT NULL DEFAULT 0.00,

  payment_id VARCHAR(255) NOT NULL,

  description VARCHAR(255) NOT NULL,

  user_id INT NOT NULL,

  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



INSERT INTO users_transaction (
credit,
debit,
payment_id,
description,
user_id
)
VALUES
(140,0,'pay_IsDpa6xpi0kAwv','credit',1),
(140,0,'pay_IsDpa6xpi0kAwv','credit',1),
(10,0,'pay_IsG3FaML45RX8M','credit',1),
(3000,0,'pay_IsGjbOBBZKYGKA','credit',1),
(5000,0,'pay_IsHPTJ10SQ6bQn','credit',1);

COMMIT;