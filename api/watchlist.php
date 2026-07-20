<?php
header('Content-Type: application/json');
require_once(dirname(__DIR__) . '/config/conn.php');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = isset($_POST['action']) ? $_POST['action'] : '';
    $ticker = isset($_POST['ticker']) ? strtoupper(trim($_POST['ticker'])) : '';
    $csrf = isset($_POST['csrf_token']) ? $_POST['csrf_token'] : '';
    
    if (!validateCsrfToken($csrf)) {
        echo json_encode(['success' => false, 'error' => 'CSRF verification failed']);
        exit;
    }
    
    if (empty($ticker)) {
        echo json_encode(['success' => false, 'error' => 'Invalid ticker symbol']);
        exit;
    }
    
    // Ensure default watchlist exists
    $watchlistId = null;
    $stmt = mysqli_prepare($conn, "SELECT id FROM watchlists WHERE user_id = ? AND name = 'My Watchlist'");
    mysqli_stmt_bind_param($stmt, "i", $_SESSION['user_id']);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_bind_result($stmt, $watchlistId);
    mysqli_stmt_fetch($stmt);
    mysqli_stmt_close($stmt);
    
    if (!$watchlistId) {
        $stmtCreate = mysqli_prepare($conn, "INSERT INTO watchlists (user_id, name, is_pinned) VALUES (?, 'My Watchlist', 1)");
        mysqli_stmt_bind_param($stmtCreate, "i", $_SESSION['user_id']);
        mysqli_stmt_execute($stmtCreate);
        $watchlistId = mysqli_insert_id($conn);
        mysqli_stmt_close($stmtCreate);
    }
    
    if ($action === 'toggle') {
        // Check if ticker is already in this watchlist
        $inWatchlist = false;
        $stmtCheck = mysqli_prepare($conn, "SELECT watchlist_id FROM watchlist_stocks WHERE watchlist_id = ? AND stock_name = ?");
        mysqli_stmt_bind_param($stmtCheck, "is", $watchlistId, $ticker);
        mysqli_stmt_execute($stmtCheck);
        mysqli_stmt_store_result($stmtCheck);
        if (mysqli_stmt_num_rows($stmtCheck) > 0) {
            $inWatchlist = true;
        }
        mysqli_stmt_close($stmtCheck);
        
        if ($inWatchlist) {
            // Remove
            $stmtDel = mysqli_prepare($conn, "DELETE FROM watchlist_stocks WHERE watchlist_id = ? AND stock_name = ?");
            mysqli_stmt_bind_param($stmtDel, "is", $watchlistId, $ticker);
            mysqli_stmt_execute($stmtDel);
            mysqli_stmt_close($stmtDel);
            echo json_encode(['success' => true, 'status' => 'removed']);
        } else {
            // Add
            $stmtAdd = mysqli_prepare($conn, "INSERT INTO watchlist_stocks (watchlist_id, stock_name) VALUES (?, ?)");
            mysqli_stmt_bind_param($stmtAdd, "is", $watchlistId, $ticker);
            mysqli_stmt_execute($stmtAdd);
            mysqli_stmt_close($stmtAdd);
            echo json_encode(['success' => true, 'status' => 'added']);
        }
        exit;
    }
}

echo json_encode(['success' => false, 'error' => 'Invalid Request']);
exit;
?>
