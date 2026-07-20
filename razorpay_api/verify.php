<?php
require_once(dirname(__DIR__) . '/config/razorpay.php');

use Razorpay\Api\Api;
use Razorpay\Api\Errors\SignatureVerificationError;

$success = true;
$error = "Payment Failed";

if (empty($_POST['razorpay_payment_id']) === false) {
    $api = new Api($keyId, $keySecret);

    try {
        $attributes = array(
            'razorpay_order_id' => $_SESSION['razorpay_order_id'],
            'razorpay_payment_id' => $_POST['razorpay_payment_id'],
            'razorpay_signature' => $_POST['razorpay_signature']
        );

        $api->utility->verifyPaymentSignature($attributes);
    } catch (SignatureVerificationError $e) {
        $success = false;
        $error = 'Signature Error: ' . $e->getMessage();
    }
} else {
    $success = false;
}

if ($success === true) {
    $amount = isset($_COOKIE["amount"]) ? floatval($_COOKIE["amount"]) : 0;
    $paymentId = isset($_POST["razorpay_payment_id"]) ? trim($_POST["razorpay_payment_id"]) : '';
    $userId = isset($_SESSION["user_id"]) ? intval($_SESSION["user_id"]) : 0;

    if ($amount <= 0 || empty($paymentId) || $userId <= 0) {
        echo "<script>alert('Invalid payment data...'); window.location.href = '../portfolios.php';</script>";
        exit();
    }

    // Insert transaction
    $stmt = mysqli_prepare($conn, "INSERT INTO `users_transaction` (`credit`, `payment_id`, `description`, `user_id`) VALUES (?, ?, ?, ?)");
    $description = 'deposit';
    mysqli_stmt_bind_param($stmt, "dssi", $amount, $paymentId, $description, $userId);
    $result = mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);

    if ($result) {
        // Update user balance
        $stmt = mysqli_prepare($conn, "UPDATE `users` SET `available_balance` = `available_balance` + ? WHERE `id` = ?");
        mysqli_stmt_bind_param($stmt, "di", $amount, $userId);
        $result_update = mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        
        if ($result_update) {
            // Add notification
            $stmtNotif = mysqli_prepare($conn, "INSERT INTO `notifications` (`user_id`, `title`, `message`) VALUES (?, 'Funds Deposited', ?)");
            $notifMsg = "Successfully deposited ₹" . number_format($amount, 2) . " to your wallet. Ref: " . $paymentId;
            mysqli_stmt_bind_param($stmtNotif, "is", $userId, $notifMsg);
            mysqli_stmt_execute($stmtNotif);
            mysqli_stmt_close($stmtNotif);
            
            // Clear payment amount cookie
            setcookie('amount', '', time() - 3600, '/');
            
            echo "<script>
                alert('Payment Successful! ₹" . number_format($amount, 2) . " credited to your portfolio.');
                window.location.href = '../portfolios.php';
            </script>";
            exit();
        } else {
            echo "<script>alert('Error updating balance.'); window.location.href = '../portfolios.php';</script>";
        }
    } else {
        echo "<script>alert('Payment registration failed.'); window.location.href = '../portfolios.php';</script>";
    }
} else {
    echo "<div style='background:#111827; color:#fff; font-family:sans-serif; padding:40px; text-align:center; min-height:100vh;'>";
    echo "<h2 style='color:#FF3D57;'>Payment Signature Verification Failed</h2>";
    echo "<p>" . htmlspecialchars($error) . "</p>";
    echo "<a href='../portfolios.php' style='color:#2962FF; text-decoration:none; font-weight:bold;'>Return to Portfolios</a>";
    echo "</div>";
}
?>
