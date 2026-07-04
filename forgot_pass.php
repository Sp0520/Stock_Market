<?php
require('conn.php');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (isset($_POST['submit'])) {

    $email = trim($_POST['email']);

    if ($email == "") {

        echo "<script>alert('Please enter your email');</script>";

    } else {

        $stmt = mysqli_prepare($conn, "SELECT id FROM users WHERE email = ?");

        if ($stmt) {

            mysqli_stmt_bind_param($stmt, "s", $email);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_bind_result($stmt, $userId);

            if (mysqli_stmt_fetch($stmt)) {

                // Keep the same session key used by reset.php.
                $_SESSION['forgot_user_id_verified'] = $userId;

                echo "<script>
                        alert('Email found. Reset your password.');
                        window.location='reset.php';
                      </script>";
                exit();

            } else {

                echo "<script>alert('Email not found');</script>";

            }

            mysqli_stmt_close($stmt);

        } else {

            echo "<script>alert('Database error');</script>";

        }
    }
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Forgot Password</title>
<link rel="stylesheet" href="forgot.css">
</head>

<body>

<form method="post">

<h2>Forgot Password</h2>

<input type="email" name="email" placeholder="Enter Email" required>

<button type="submit" name="submit">Reset Password</button>

</form>

</body>
</html>