<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Clear all session variables
$_SESSION = array();

// Destroy session cookie if set
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Clear payment/amount cookies
if (isset($_COOKIE['amount'])) {
    setcookie('amount', '', time() - 3600, '/');
}

// Destroy session
session_destroy();

header("Location: index.php");
exit();
?>
