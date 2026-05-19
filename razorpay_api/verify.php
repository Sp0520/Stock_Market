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

    $sql = "INSERT INTO `users_transaction` (`amount`,`payment_id`, `user_id`) VALUES (" . $_COOKIE["amount"] . ",'" . $_POST["razorpay_payment_id"] . "', " . $_SESSION["user_id"] . ")";
    $result = mysqli_query($conn, $sql);

    if ($result) {
        $sql_update = "UPDATE `users` SET `available_balance` = `available_balance` + " . $_COOKIE["amount"] . " WHERE `id` = " . $_SESSION["user_id"];
        $result_update = mysqli_query($conn, $sql_update);
        if ($result_update) {
            echo "<script>alert('Payment Sucessfull...')</script>";
            header("Location:http://localhost/stock_market_application/portfolios.php");
        } else {
            echo "<script>alert('Error while updating available balance...')</script>";
        }
    } else {
        echo "<script>alert('Payment Failed...')</script>" . mysqli_error($conn);
    }
} else {
    $html = "<p>Your payment failed</p>
             <p>{$error}</p>";
    echo $html;
}
