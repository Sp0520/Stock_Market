<?php

/**
 * Stock Market Application
 * Database Configuration
 */

$db_host = getenv("DB_HOST") ?: "sql12.freesqldatabase.com";

$db_user = getenv("DB_USER") ?: "sql12828821";

$db_pass = getenv("DB_PASS") ?: "ZFicBG7mKk";

$db_name = getenv("DB_NAME") ?: "sql12828821";

$db_port = getenv("DB_PORT") ?: "3306";


$conn = mysqli_connect(
    $db_host,
    $db_user,
    $db_pass,
    $db_name,
    $db_port
);


if (!$conn) {
    die("Database Connection Failed: " . mysqli_connect_error());
}


mysqli_set_charset($conn, "utf8mb4");

?>