<?php
header('Content-Type: application/json');
require_once(dirname(__DIR__) . '/config/conn.php');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'User not logged in.']);
    exit;
}

$userId = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = isset($_POST['action']) ? $_POST['action'] : '';
    $symbol = isset($_POST['symbol']) ? strtoupper(trim($_POST['symbol'])) : '';
    $qty = isset($_POST['quantity']) ? intval($_POST['quantity']) : 0;
    $price = isset($_POST['price']) ? floatval($_POST['price']) : 0.0;
    $orderType = isset($_POST['order_type']) ? trim($_POST['order_type']) : 'market';
    $csrf = isset($_POST['csrf_token']) ? $_POST['csrf_token'] : '';
    
    if (!validateCsrfToken($csrf)) {
        echo json_encode(['success' => false, 'error' => 'CSRF verification failed.']);
        exit;
    }
    
    if (empty($symbol) || $qty < 1 || $price <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid order parameters.']);
        exit;
    }
    
    // Brokerage & Taxes Math
    $subtotal = $price * $qty;
    $brokerage = max(20.00, $subtotal * 0.0005); // Flat 0.05% or min ₹20
    $taxes = $subtotal * 0.0001; // 0.01% GST/Taxes
    $totalAmount = $subtotal + $brokerage + $taxes;
    
    // Fetch user available balance
    $stmt = mysqli_prepare($conn, "SELECT available_balance FROM users WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "i", $userId);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_bind_result($stmt, $balance);
    mysqli_stmt_fetch($stmt);
    mysqli_stmt_close($stmt);
    
    if ($action === 'buy') {
        if ($balance < $totalAmount) {
            echo json_encode(['success' => false, 'error' => 'Insufficient funds. Required: ₹' . number_format($totalAmount, 2) . ', Available: ₹' . number_format($balance, 2)]);
            exit;
        }
        
        mysqli_begin_transaction($conn);
        try {
            // Deduct balance
            $stmtDeduct = mysqli_prepare($conn, "UPDATE users SET available_balance = available_balance - ? WHERE id = ?");
            mysqli_stmt_bind_param($stmtDeduct, "di", $totalAmount, $userId);
            mysqli_stmt_execute($stmtDeduct);
            mysqli_stmt_close($stmtDeduct);
            
            // Insert holdings (1 row per share purchased for database compatibility)
            for ($i = 0; $i < $qty; $i++) {
                $stmtHold = mysqli_prepare($conn, "INSERT INTO stock_details (stock_name, purchase_price, user_id, status) VALUES (?, ?, ?, 1)");
                mysqli_stmt_bind_param($stmtHold, "sdi", $symbol, $price, $userId);
                mysqli_stmt_execute($stmtHold);
                mysqli_stmt_close($stmtHold);
            }
            
            // Insert transaction
            $refId = 'trade_buy_' . time();
            $stmtTx = mysqli_prepare($conn, "INSERT INTO users_transaction (debit, payment_id, description, user_id) VALUES (?, ?, ?, ?)");
            $desc = "Bought $qty shares of $symbol";
            mysqli_stmt_bind_param($stmtTx, "dssi", $totalAmount, $refId, $desc, $userId);
            mysqli_stmt_execute($stmtTx);
            mysqli_stmt_close($stmtTx);
            
            // Log Notification
            $stmtNotif = mysqli_prepare($conn, "INSERT INTO notifications (user_id, title, message) VALUES (?, 'Order Executed', ?)");
            $notifMsg = "Buy order of $qty shares of $symbol executed at ₹" . number_format($price, 2) . ". Brokerage: ₹" . number_format($brokerage, 2);
            mysqli_stmt_bind_param($stmtNotif, "is", $userId, $notifMsg);
            mysqli_stmt_execute($stmtNotif);
            mysqli_stmt_close($stmtNotif);
            
            mysqli_commit($conn);
            echo json_encode([
                'success' => true,
                'message' => "Successfully purchased $qty shares of $symbol!",
                'balance' => round($balance - $totalAmount, 2)
            ]);
        } catch (Exception $e) {
            mysqli_rollback($conn);
            echo json_encode(['success' => false, 'error' => 'Transaction failed: ' . $e->getMessage()]);
        }
        exit;
    }
    
    elseif ($action === 'sell') {
        // Find user's active holdings for this symbol
        $holdings = [];
        $stmtHold = mysqli_prepare($conn, "SELECT id FROM stock_details WHERE stock_name = ? AND user_id = ? AND status = 1 ORDER BY purchase_date ASC LIMIT ?");
        mysqli_stmt_bind_param($stmtHold, "sii", $symbol, $userId, $qty);
        mysqli_stmt_execute($stmtHold);
        $res = mysqli_stmt_get_result($stmtHold);
        while ($row = mysqli_fetch_assoc($res)) {
            $holdings[] = $row['id'];
        }
        mysqli_stmt_close($stmtHold);
        
        if (count($holdings) < $qty) {
            echo json_encode(['success' => false, 'error' => 'You do not own enough active shares of ' . htmlspecialchars($symbol) . ' to sell.']);
            exit;
        }
        
        $netCredit = $subtotal - $brokerage - $taxes;
        
        mysqli_begin_transaction($conn);
        try {
            // Add proceeds to user balance
            $stmtCredit = mysqli_prepare($conn, "UPDATE users SET available_balance = available_balance + ? WHERE id = ?");
            mysqli_stmt_bind_param($stmtCredit, "di", $netCredit, $userId);
            mysqli_stmt_execute($stmtCredit);
            mysqli_stmt_close($stmtCredit);
            
            // Mark holdings as sold
            foreach ($holdings as $id) {
                $stmtSell = mysqli_prepare($conn, "UPDATE stock_details SET status = 0, sell_price = ? WHERE id = ?");
                mysqli_stmt_bind_param($stmtSell, "di", $price, $id);
                mysqli_stmt_execute($stmtSell);
                mysqli_stmt_close($stmtSell);
            }
            
            // Insert transaction log
            $refId = 'trade_sell_' . time();
            $stmtTx = mysqli_prepare($conn, "INSERT INTO users_transaction (credit, payment_id, description, user_id) VALUES (?, ?, ?, ?)");
            $desc = "Sold $qty shares of $symbol";
            mysqli_stmt_bind_param($stmtTx, "dssi", $netCredit, $refId, $desc, $userId);
            mysqli_stmt_execute($stmtTx);
            mysqli_stmt_close($stmtTx);
            
            // Log Notification
            $stmtNotif = mysqli_prepare($conn, "INSERT INTO notifications (user_id, title, message) VALUES (?, 'Order Executed', ?)");
            $notifMsg = "Sell order of $qty shares of $symbol executed at ₹" . number_format($price, 2) . ". Brokerage: ₹" . number_format($brokerage, 2);
            mysqli_stmt_bind_param($stmtNotif, "is", $userId, $notifMsg);
            mysqli_stmt_execute($stmtNotif);
            mysqli_stmt_close($stmtNotif);
            
            mysqli_commit($conn);
            echo json_encode([
                'success' => true,
                'message' => "Successfully sold $qty shares of $symbol!",
                'balance' => round($balance + $netCredit, 2)
            ]);
        } catch (Exception $e) {
            mysqli_rollback($conn);
            echo json_encode(['success' => false, 'error' => 'Transaction failed: ' . $e->getMessage()]);
        }
        exit;
    }
}

echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
exit;
?>
