<?php
// Start secure session if not already active
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    
    // Set secure flag if HTTPS is enabled
    $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443;
    ini_set('session.cookie_secure', $isSecure ? 1 : 0);
    
    session_start();
}

// Generate CSRF token if not exists
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Load environment variables from .env file if it exists (for local development)
if (file_exists(dirname(__DIR__) . '/.env')) {
    $env_lines = file(dirname(__DIR__) . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($env_lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            if (!getenv($key)) {
                putenv("$key=$value");
            }
        }
    }
}

// Get database credentials from environment variables
$envSources = [
    'DB_HOST' => ['DB_HOST', 'MYSQL_HOST'],
    'DB_USER' => ['DB_USER', 'MYSQL_USER'],
    'DB_PASS' => ['DB_PASS', 'MYSQL_PASSWORD'],
    'DB_NAME' => ['DB_NAME', 'MYSQL_DATABASE'],
];

$db_host = null;
$db_user = null;
$db_pass = null;
$db_name = null;

foreach ($envSources as $key => $variants) {
    foreach ($variants as $variant) {
        $value = getenv($variant);
        if ($value !== false && $value !== '') {
            ${strtolower($key)} = $value;
            break;
        }
    }
}

$db_port = getenv('DB_PORT') ?: getenv('MYSQL_PORT') ?: '3306';

// Support Render's DATABASE_URL if standard vars are not set.
if ((!$db_host || !$db_user || !$db_name) && getenv('DATABASE_URL')) {
    $databaseUrl = getenv('DATABASE_URL');
    $parts = parse_url($databaseUrl);

    if ($parts !== false) {
        if (!$db_host && !empty($parts['host'])) {
            $db_host = $parts['host'];
        }
        if (!$db_user && !empty($parts['user'])) {
            $db_user = $parts['user'];
        }
        if (!$db_pass && isset($parts['pass'])) {
            $db_pass = $parts['pass'];
        }
        if (!$db_name && !empty($parts['path'])) {
            $db_name = ltrim($parts['path'], '/');
        }
        if ($db_port === '3306' && !empty($parts['port'])) {
            $db_port = $parts['port'];
        }
    }
}

// Validate that required database configuration is set
$missing_vars = [];
if (!$db_host) $missing_vars[] = 'DB_HOST';
if (!$db_user) $missing_vars[] = 'DB_USER';
if ($db_pass === null) $missing_vars[] = 'DB_PASS';
if (!$db_name) $missing_vars[] = 'DB_NAME';

if (!empty($missing_vars)) {
    error_log("Database configuration error: " . implode(', ', $missing_vars));
    die("Database configuration error. Please check your environment configuration.");
}

// Establish database connection
try {
    $conn = mysqli_connect($db_host, $db_user, $db_pass, $db_name, (int)$db_port);
    if (!$conn) {
        throw new Exception(mysqli_connect_error());
    }
    mysqli_set_charset($conn, "utf8mb4");
} catch (Throwable $e) {
    error_log("Database Connection Error: " . $e->getMessage());
    die("Database Connection Failed. Please check the server logs.");
}

// Automatic Schema Migration & Updates
try {
    // 1. If core users table is missing, run the entire schema initialization
    $usersCheck = mysqli_query($conn, "SHOW TABLES LIKE 'users'");
    if ($usersCheck && mysqli_num_rows($usersCheck) === 0) {
        $schemaPath = dirname(__DIR__) . '/stock_market_application.sql';
        if (file_exists($schemaPath)) {
            $sqlContent = file_get_contents($schemaPath);
            $sqlContent = preg_replace('/--.*\n/', '', $sqlContent);
            $sqlContent = preg_replace('/\/\*.*?\*\//s', '', $sqlContent);
            $queries = explode(';', $sqlContent);
            
            mysqli_query($conn, "SET FOREIGN_KEY_CHECKS = 0");
            foreach ($queries as $query) {
                $query = trim($query);
                if (!empty($query)) {
                    mysqli_query($conn, $query);
                }
            }
            mysqli_query($conn, "SET FOREIGN_KEY_CHECKS = 1");
            error_log("Database schema initialized successfully.");
        }
    } else {
        // 2. Core tables exist, check and create newer tables if missing
        
        // Check watchlists
        $wlCheck = mysqli_query($conn, "SHOW TABLES LIKE 'watchlists'");
        if ($wlCheck && mysqli_num_rows($wlCheck) === 0) {
            mysqli_query($conn, "CREATE TABLE IF NOT EXISTS watchlists (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              name VARCHAR(100) NOT NULL DEFAULT 'My Watchlist',
              is_pinned TINYINT(1) DEFAULT 0,
              created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              UNIQUE KEY uq_user_watchlist (user_id, name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
            error_log("Migration: Created watchlists table.");
        }
        
        // Check watchlist_stocks
        $wlsCheck = mysqli_query($conn, "SHOW TABLES LIKE 'watchlist_stocks'");
        if ($wlsCheck && mysqli_num_rows($wlsCheck) === 0) {
            mysqli_query($conn, "CREATE TABLE IF NOT EXISTS watchlist_stocks (
              watchlist_id INT NOT NULL,
              stock_name VARCHAR(50) NOT NULL,
              added_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
              PRIMARY KEY (watchlist_id, stock_name),
              FOREIGN KEY (watchlist_id) REFERENCES watchlists(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
            error_log("Migration: Created watchlist_stocks table.");
        }
        
        // Check notifications
        $notifCheck = mysqli_query($conn, "SHOW TABLES LIKE 'notifications'");
        if ($notifCheck && mysqli_num_rows($notifCheck) === 0) {
            mysqli_query($conn, "CREATE TABLE IF NOT EXISTS notifications (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              title VARCHAR(255) NOT NULL,
              message TEXT NOT NULL,
              is_read TINYINT(1) DEFAULT 0,
              created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
            error_log("Migration: Created notifications table.");
        }
        
        // Upgrade existing users table for roles/avatars
        $columnsCheck = mysqli_query($conn, "SHOW COLUMNS FROM `users` LIKE 'role'");
        if ($columnsCheck && mysqli_num_rows($columnsCheck) === 0) {
            mysqli_query($conn, "ALTER TABLE `users` ADD COLUMN `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user'");
            mysqli_query($conn, "ALTER TABLE `users` ADD COLUMN `profile_picture` VARCHAR(255) DEFAULT NULL");
            // Add default admin user if not present
            mysqli_query($conn, "INSERT INTO users (firstname, lastname, address, email, password, mobile_number, PANCARD_number, role, available_balance)
                                 VALUES ('Admin', 'User', 'Fintech HQ', 'admin@stockapp.com', '$2y$10$tZ2y10B/79N26VpB0h2/G.qY3K.k7bQ/jWb5Jk.FwE8NqH3K8882O', '9999999999', 'ADMINPAN12A', 'admin', 500000.00)
                                 ON DUPLICATE KEY UPDATE email=email");
            error_log("Upgraded database schema for users roles.");
        }
    }
} catch (Throwable $e) {
    error_log("Database migration error: " . $e->getMessage());
}

// CSRF Protection Utilities
function validateCsrfToken($token) {
    return !empty($token) && hash_equals($_SESSION['csrf_token'], $token);
}

function getCsrfInput() {
    return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars($_SESSION['csrf_token']) . '">';
}

/**
 * Fetches stock data from AlphaVantage with file-based caching.
 * Cache is stored in the logs/ directory and is valid for 1 hour.
 * Falls back to expired cache if API is rate-limited.
 */
function fetchStockData($ticker) {
    $ticker = strtoupper(trim($ticker));
    if (empty($ticker)) {
        return ['error' => 'Empty ticker symbol'];
    }
    
    // Automatically append .BSE if no suffix is provided
    if (strpos($ticker, '.') === false) {
        $ticker .= '.BSE';
    }
    
    $cacheDir = dirname(__DIR__) . '/logs';
    if (!file_exists($cacheDir)) {
        @mkdir($cacheDir, 0755, true);
    }
    
    $cacheFile = $cacheDir . '/cache_' . preg_replace('/[^A-Za-z0-9_-]/', '_', $ticker) . '.json';
    $cacheTime = 3600; // 1 hour cache duration
    
    // Check if cache is fresh
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
        $cacheContent = @file_get_contents($cacheFile);
        $cachedData = $cacheContent ? json_decode($cacheContent, true) : null;
        if ($cachedData && isset($cachedData['Meta Data'], $cachedData['Time Series (Daily)'])) {
            return $cachedData;
        }
    }
    
    // Cache is expired or missing, call API
    $apiKey = getenv("ALPHAVANTAGE_API_KEY") ?: getenv("API_KEY") ?: "1DBYP9NP4ZDVPWI6";
    $url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" . urlencode($ticker) . "&apikey={$apiKey}";
    
    $json = @file_get_contents($url);
    if ($json !== false) {
        $data = json_decode($json, true);
        if (is_array($data)) {
            if (isset($data['Meta Data'], $data['Time Series (Daily)'])) {
                @file_put_contents($cacheFile, $json);
                return $data;
            }
            
            $errorMsg = 'Unknown error';
            if (isset($data['Note'])) {
                $errorMsg = $data['Note'];
            } elseif (isset($data['Information'])) {
                $errorMsg = $data['Information'];
            } elseif (isset($data['Error Message'])) {
                return ['error' => 'Invalid Stock Symbol'];
            }
            
            // If rate-limited, try to return expired cache if it exists
            if (file_exists($cacheFile)) {
                $cacheContent = @file_get_contents($cacheFile);
                $cachedData = $cacheContent ? json_decode($cacheContent, true) : null;
                if ($cachedData && isset($cachedData['Meta Data'], $cachedData['Time Series (Daily)'])) {
                    return $cachedData; 
                }
            }
            
            return ['error' => 'API Rate Limit: ' . $errorMsg];
        }
    }
    
    // Network failure, try to return expired cache
    if (file_exists($cacheFile)) {
        $cacheContent = @file_get_contents($cacheFile);
        $cachedData = $cacheContent ? json_decode($cacheContent, true) : null;
        if ($cachedData && isset($cachedData['Meta Data'], $cachedData['Time Series (Daily)'])) {
            return $cachedData;
        }
    }
    
    return ['error' => 'Cannot connect to Stock API'];
}
?>
