<?php

// Load environment variables from .env file if it exists (for local development)
if (file_exists(__DIR__ . '/.env')) {
    $env_lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
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
if (!$db_host) {
    $missing_vars[] = 'DB_HOST or MYSQL_HOST';
}
if (!$db_user) {
    $missing_vars[] = 'DB_USER or MYSQL_USER';
}
if ($db_pass === null) {
    $missing_vars[] = 'DB_PASS or MYSQL_PASSWORD';
}
if (!$db_name) {
    $missing_vars[] = 'DB_NAME or MYSQL_DATABASE';
}

if (!empty($missing_vars)) {
    error_log("Database configuration error: " . implode(', ', $missing_vars));
    die("Database configuration error. Please set the missing environment variables: " . implode(', ', $missing_vars));
}

// Establish database connection
try {
    $conn = mysqli_connect(
        $db_host,
        $db_user,
        $db_pass,
        $db_name,
        (int)$db_port
    );
    if (!$conn) {
        throw new Exception(mysqli_connect_error());
    }
} catch (Throwable $e) {
    error_log("Database Connection Error: " . $e->getMessage());
    error_log("Attempted connection to: " . $db_host . " with user: " . $db_user);
    die("Database Connection Failed. Please check the server logs for details.");
}

mysqli_set_charset($conn, "utf8mb4");

// Auto-initialize database tables if they do not exist
try {
    $tableCheck = mysqli_query($conn, "SHOW TABLES LIKE 'users'");
    if ($tableCheck && mysqli_num_rows($tableCheck) === 0) {
        $schemaPath = __DIR__ . '/stock_market_application.sql';
        if (file_exists($schemaPath)) {
            $sqlContent = file_get_contents($schemaPath);
            
            // Remove comments and empty lines
            $sqlContent = preg_replace('/--.*\n/', '', $sqlContent);
            $sqlContent = preg_replace('/\/\*.*?\*\//s', '', $sqlContent);
            
            // Split by semicolon (safe as there are no semicolons inside text literals in our schema)
            $queries = explode(';', $sqlContent);
            
            mysqli_query($conn, "SET FOREIGN_KEY_CHECKS = 0");
            
            $success = true;
            foreach ($queries as $query) {
                $query = trim($query);
                if (!empty($query)) {
                    if (!mysqli_query($conn, $query)) {
                        error_log("Database initialization error on query: " . substr($query, 0, 100) . "... Error: " . mysqli_error($conn));
                        $success = false;
                    }
                }
            }
            
            mysqli_query($conn, "SET FOREIGN_KEY_CHECKS = 1");
            
            if ($success) {
                error_log("Database tables initialized successfully from stock_market_application.sql");
            }
        }
    }
} catch (Throwable $e) {
    error_log("Database auto-initialization error: " . $e->getMessage());
}
?>