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
$db_host = getenv("DB_HOST");
$db_user = getenv("DB_USER");
$db_pass = getenv("DB_PASS");
$db_name = getenv("DB_NAME");
$db_port = getenv("DB_PORT") ?: "3306";

// Validate that required environment variables are set
$required_vars = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];
$missing_vars = [];

foreach ($required_vars as $var) {
    if (!getenv($var)) {
        $missing_vars[] = $var;
    }
}

if (!empty($missing_vars)) {
    error_log("Missing required environment variables: " . implode(', ', $missing_vars));
    die("Database configuration error. Please set required environment variables: " . implode(', ', $missing_vars));
}

// Establish database connection
$conn = mysqli_connect(
    $db_host,
    $db_user,
    $db_pass,
    $db_name,
    (int)$db_port
);

if (!$conn) {
    error_log("Database Connection Error: " . mysqli_connect_error());
    error_log("Attempted connection to: " . $db_host . " with user: " . $db_user);
    die("Database Connection Failed: " . mysqli_connect_error());
}

mysqli_set_charset($conn, "utf8mb4");
?>