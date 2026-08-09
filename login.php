<?php
require('conn.php');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<link rel="shortcut icon" href="./assets/logo.png" type="image/x-icon" />
<link rel="stylesheet" href="Style.css">
<link rel="stylesheet" href="Style_Custom.css">

<title>Stock Market - Sign In</title>
</head>

<body>

<div class="container" style="background-color: var(--bg-primary); display: flex; align-items: center; justify-content: center; height: 100vh;">

    <div class="background_img" style="filter: brightness(0.25);"></div>

    <div class="header" style="background: rgba(11, 15, 25, 0.8); backdrop-filter: var(--glass-blur); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; padding: 15px 30px; position: fixed; top: 0; left: 0; width: 100%; z-index: 100;">
        <img class="logo" src="./assets/logo.png" alt="" style="height: 1.8rem; width: 1.8rem; margin-right: 10px;">
        <span class="title" style="font-weight: 700; color: var(--text-primary);">Stock Market Application</span>
    </div>

    <div class="body" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding-top: 80px;">

        <form action="" method="post" style="z-index: 10;">

            <div class="signinContent" style="padding: 40px; width: min(420px, calc(100vw - 30px)); height: auto; gap: 20px; border-radius: 24px; background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: var(--shadow-premium);">

                <h3 style="color: var(--text-primary); font-size: 1.75rem; font-weight: 700; text-align: center; margin-bottom: 10px;">Sign in</h3>

                <div style="width: 100%;">
                    <input type="email" 
                           name="txtEmail" 
                           class="txtEmail" 
                           placeholder="Email Address" 
                           style="width: 100%;"
                           required>
                </div>

                <div style="width: 100%;">
                    <input type="password" 
                           name="txtPass" 
                           class="txtPass" 
                           placeholder="Password" 
                           style="width: 100%;"
                           required>
                </div>

                <div class="btn" style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 15px; height: auto; padding: 0;">

                    <div class="buttonRow" style="display: flex; width: 100%; gap: 12px; justify-content: center;">
                        <input type="submit" 
                               value="Sign in" 
                               name="btnSignin" 
                               class="btnSignin"
                               style="flex: 1; margin: 0;">

                        <input type="button" 
                               value="Sign up" 
                               class="btnSignup" 
                               style="flex: 1; margin: 0; background: transparent !important; border: 1px solid var(--border-color) !important; color: var(--text-primary) !important; box-shadow: none !important;"
                               onclick="window.location.href='signup.php'">
                    </div>

                    <a href="forgot_pass.php" class="forgot" style="color: var(--accent); text-decoration: none; font-weight: 500; font-size: 0.9rem; transition: var(--transition-smooth);">
                        Forgot Password?
                    </a>

                </div>

            </div>

        </form>

   <?php

if (isset($_POST['btnSignin'])) {

    $email = trim($_POST['txtEmail']);
    $password = $_POST['txtPass'];

    $stmt = mysqli_prepare(
        $conn,
        "SELECT * FROM users WHERE email=?"
    );

    mysqli_stmt_bind_param(
        $stmt,
        "s",
        $email
    );

    mysqli_stmt_execute($stmt);

    $result = mysqli_stmt_get_result($stmt);

    if(mysqli_num_rows($result) > 0){

        $row = mysqli_fetch_assoc($result);

        if(password_verify($password, $row['password'])){

            $_SESSION['user_id'] = $row['id'];
            $_SESSION['firstname'] = $row['firstname'];
            $_SESSION['email'] = $row['email'];

            echo "<script>
            alert('Login Successful');
            window.location='market.php';
            </script>";
            exit();

        }else{

            echo "<script>alert('Invalid Password');</script>";

        }

    }else{

        echo "<script>alert('Email not found');</script>";

    }
}

?>

    </div>

    <div class="footer">

        <div>
            <p>© 2026 All Rights Reserved.</p>
        </div>

        <div>
            <p>Privacy | About us</p>
        </div>

    </div>

</div>

</body>
</html>
