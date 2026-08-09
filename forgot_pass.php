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
<link rel="stylesheet" href="Style.css">
<link rel="stylesheet" href="Style_Custom.css">
</head>

<body>

<div class="container" style="background-color: var(--bg-primary); display: flex; align-items: center; justify-content: center; height: 100vh;">

    <div class="background_img" style="filter: brightness(0.25);"></div>

    <div class="header" style="background: rgba(11, 15, 25, 0.8); backdrop-filter: var(--glass-blur); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; padding: 15px 30px; position: fixed; top: 0; left: 0; width: 100%; z-index: 100;">
        <img class="logo" src="./assets/logo.png" alt="" style="height: 1.8rem; width: 1.8rem; margin-right: 10px;">
        <span class="title" style="font-weight: 700; color: var(--text-primary);">Stock Market Application</span>
    </div>

    <div class="body" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding-top: 80px;">
        <form method="post" style="z-index: 10;">
            <div class="signinContent" style="padding: 40px; width: min(420px, calc(100vw - 30px)); height: auto; gap: 20px; border-radius: 24px; background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: var(--shadow-premium);">
                <h2 style="color: var(--text-primary); font-size: 1.75rem; font-weight: 700; text-align: center; margin-bottom: 10px;">Forgot Password</h2>
                <div style="width: 100%;">
                    <input type="email" name="email" placeholder="Enter Email" style="width: 100%;" required>
                </div>
                <div class="btn" style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 15px; height: auto; padding: 0;">
                    <button type="submit" name="submit" class="btnSignup_singup" style="width: 100%;">Find Email</button>
                    <a href="index.php" style="color: var(--accent); text-decoration: none; font-weight: 500; font-size: 0.9rem;">Back to Sign In</a>
                </div>
            </div>
        </form>
    </div>
</div>

</body>
</html>