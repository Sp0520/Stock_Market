<?php
require('conn.php');

$sqlPath = __DIR__ . '/stock_market_application.sql';
if (!file_exists($sqlPath)) {
    die("❌ Schema file not found at " . $sqlPath);
}

$sqlContent = file_get_contents($sqlPath);

echo "<h2>Migrating database schema...</h2>";

if (mysqli_multi_query($conn, $sqlContent)) {
    do {
        // Store first result set
        if ($result = mysqli_store_result($conn)) {
            mysqli_free_result($result);
        }
    } while (mysqli_next_result($conn));

    echo "<h3>✅ Database Schema Imported and Seeded Successfully!</h3>";
    echo "<p>All tables (users, stock_details, orders, users_transaction, watchlist) have been created.</p>";
    echo "<p><strong>Security Tip:</strong> Please delete or rename <code>init_db.php</code> after this operation.</p>";
} else {
    echo "<h3>❌ Database Import Failed</h3>";
    echo "<p>Error: " . mysqli_error($conn) . "</p>";
}
?>
