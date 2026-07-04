<?php

$keyId = getenv("RAZORPAY_KEY_ID") ?: 'rzp_test_aZQTHNzbyHIfjy';
$keySecret = getenv("RAZORPAY_KEY_SECRET") ?: 'ZOYXEMFHFSrcq43wQ9JnimfV';
$displayCurrency = 'INR';

// Error reporting - only log errors, don't display them in production
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/error.log');
?>
