<?php
// Load database connection to ensure environment variables are loaded
require_once(__DIR__ . '/conn.php');

$keyId = getenv("RAZORPAY_KEY_ID") ?: 'rzp_test_aZQTHNzbyHIfjy';
$keySecret = getenv("RAZORPAY_KEY_SECRET") ?: 'ZOYXEMFHFSrcq43wQ9JnimfV';
$displayCurrency = 'INR';

// Load Razorpay PHP Library
$sdkPath = dirname(__DIR__) . '/razorpay_api/razorpay-php/Razorpay.php';
if (file_exists($sdkPath)) {
    require_once($sdkPath);
}

// Error reporting settings
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__DIR__) . '/logs/error.log');
?>
