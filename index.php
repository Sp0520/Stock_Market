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

<title>Stock Market</title>
</head>

<body>

<div class="container">

    <div class="background_img"></div>

    <div class="header">
        <div>
            <img class="logo" src="./assets/logo.png" alt="">
        </div>
        <p class="title">Stock Market</p>
    </div>

    <div class="body">

        <form action="" method="post">

            <div class="signinContent">

                <h3>Sign in</h3>

                <div>
                    <input type="email" 
                           name="txtEmail" 
                           class="txtEmail" 
                           placeholder="Email" 
                           required>
                </div>

                <div>
                    <input type="password" 
                           name="txtPass" 
                           class="txtPass" 
                           placeholder="Password" 
                           required>
                </div>

                <div class="btn">

                    <div class="buttonRow">
                        <input type="submit" 
                               value="Sign in" 
                               name="btnSignin" 
                               class="btnSignin">

                        <input type="submit" 
                               value="Sign up" 
                               name="btnSignup" 
                               class="btnSignup">
                    </div>

                    <br>

                    <a href="forgot_pass.php" class="forgot">
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

if(isset($_POST['btnSignup'])){
    echo "<script>window.location.href='signup.php';</script>";
    exit();
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