<?php

require('config.php');
require('../conn.php');

session_start();

require('razorpay-php/Razorpay.php');

use Razorpay\Api\Api;
use Razorpay\Api\Errors\SignatureVerificationError;

$success = true;

$error = "Payment Failed";

if (empty($_POST['razorpay_payment_id']) === false) {
    $api = new Api($keyId, $keySecret);

    try {
        // Please note that the razorpay order ID must
        // come from a trusted source (session here, but
        // could be database or something else)
        $attributes = array(
            'razorpay_order_id' => $_SESSION['razorpay_order_id'],
            'razorpay_payment_id' => $_POST['razorpay_payment_id'],
            'razorpay_signature' => $_POST['razorpay_signature']
        );

        $api->utility->verifyPaymentSignature($attributes);
    } catch (SignatureVerificationError $e) {
        $success = false;
        $error = 'Razorpay Error : ' . $e->getMessage();
    }
}

if ($success === true) {
    // $html = "<p>Your payment was successful</p>
    //          <p>Payment ID: {$_POST['razorpay_payment_id']}</p>";
    // echo "<script>alert('Payment Sucessfull...')</script>";

    $amount = isset($_COOKIE["amount"]) ? floatval($_COOKIE["amount"]) : 0;
    $paymentId = isset($_POST["razorpay_payment_id"]) ? trim($_POST["razorpay_payment_id"]) : '';
    $userId = isset($_SESSION["user_id"]) ? intval($_SESSION["user_id"]) : 0;

    if ($amount <= 0 || empty($paymentId) || $userId <= 0) {
        echo "<script>alert('Invalid payment data...');</script>";
        exit();
    }

    $stmt = mysqli_prepare($conn, "INSERT INTO `users_transaction` (`credit`, `payment_id`, `description`, `user_id`) VALUES (?, ?, ?, ?)");
    $description = 'deposit';
    mysqli_stmt_bind_param($stmt, "dssi", $amount, $paymentId, $description, $userId);
    $result = mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);

    if ($result) {
        $stmt = mysqli_prepare($conn, "UPDATE `users` SET `available_balance` = `available_balance` + ? WHERE `id` = ?");
        mysqli_stmt_bind_param($stmt, "di", $amount, $userId);
        $result_update = mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        if ($result_update) {
            echo "<script>
                alert('Payment Successful...');
                window.location.href = '../portfolios.php';
            </script>";
            exit();
        } else {
            echo "<script>alert('Error while updating available balance...');</script>";
        }
    } else {
        echo "<script>alert('Payment Failed...');</script>";
    }
} else {
    $html = "<p>Your payment failed</p>
             <p>{$error}</p>";
    echo $html;
}
