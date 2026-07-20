<?php
header('Content-Type: application/json');
require_once(dirname(__DIR__) . '/config/conn.php');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = isset($_POST['action']) ? $_POST['action'] : '';
    $csrf = isset($_POST['csrf_token']) ? $_POST['csrf_token'] : '';
    
    if (!validateCsrfToken($csrf)) {
        echo json_encode(['success' => false, 'error' => 'CSRF verification failed']);
        exit;
    }
    
    if ($action === 'mark_all_read') {
        $stmt = mysqli_prepare($conn, "UPDATE `notifications` SET `is_read` = 1 WHERE `user_id` = ?");
        mysqli_stmt_bind_param($stmt, "i", $_SESSION['user_id']);
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => mysqli_error($conn)]);
        }
        mysqli_stmt_close($stmt);
        exit;
    }
}

echo json_encode(['success' => false, 'error' => 'Invalid Request']);
exit;
?>
