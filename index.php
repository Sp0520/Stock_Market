<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// If user is already authenticated via session, go to market dashboard
if (isset($_SESSION['user_id'])) {
    header("Location: market.php");
    exit();
}

// If unauthenticated, redirect to login.php for secure credentials & OTP 2FA verification
header("Location: login.php");
exit();
?>
