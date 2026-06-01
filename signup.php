<?php
require('conn.php');
?>

<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<link rel="shortcut icon" href="./assets/logo.png" type="image/x-icon" />
<link rel="stylesheet" href="style.css">

<title>Stock Market Application</title>
</head>

<body>

<div class="container">

<div class="background_img">
<img src="./assets/background.jpg" alt="">
</div>

<div class="header">
<div>
<img class="logo" src="./assets/logo.png" alt="">
</div>
<p class="title">Stock Market Application</p>
</div>

<div class="signup_body">

<form action="" method="post">

<div class="signup_content">

<h3>Sign up</h3>

<div>
<input type="text" class="name" name="firstname" placeholder="First Name" required>
<input type="text" class="name" name="lastname" placeholder="Last Name" required>
</div>

<div>
<textarea name="address" class="textarea_signup" placeholder="Address" required></textarea>
</div>

<div>
<input type="email" class="email_signup" name="email" placeholder="Email" required>
</div>

<div>
<input type="password" class="pass_signup" name="enter_password" placeholder="Enter Password" required>
</div>

<div>
<input type="password" class="pass_signup" name="confirm_password" placeholder="Re-enter Password" required>
</div>

<div>
<input type="number" class="mobileNo_signup" name="mobile_number" placeholder="Mobile No" required>
</div>

<div>
<input type="text" class="panNo_signup" name="pan_number" placeholder="Pancard No" required>
</div>

<div>
<input type="submit" class="btnSignup_singup" name="btnSignup" value="Sign up">
</div>

</div>

</form>

<?php

if(isset($_POST['btnSignup'])){

    $firstname = trim($_POST['firstname']);
    $lastname = trim($_POST['lastname']);
    $address = trim($_POST['address']);
    $email = trim($_POST['email']);
    $password = $_POST['enter_password'];
    $confirm_password = $_POST['confirm_password'];
    $mobile_number = trim($_POST['mobile_number']);
    $pan_number = trim($_POST['pan_number']);

    if($password !== $confirm_password){

        echo "<script>alert('Passwords do not match');</script>";

    } else {

        $stmt = mysqli_prepare(
            $conn,
            "SELECT id FROM users WHERE email=?"
        );

        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);

        $result = mysqli_stmt_get_result($stmt);

        if(mysqli_num_rows($result) > 0){

            echo "<script>alert('Email already registered');</script>";

        } else {

            $hashed_password = password_hash(
                $password,
                PASSWORD_DEFAULT
            );

            $stmt = mysqli_prepare(
                $conn,
                "INSERT INTO users
                (firstname, lastname, address, email, password, mobile_number, PANCARD_number)
                VALUES (?, ?, ?, ?, ?, ?, ?)"
            );

            mysqli_stmt_bind_param(
                $stmt,
                "sssssss",
                $firstname,
                $lastname,
                $address,
                $email,
                $hashed_password,
                $mobile_number,
                $pan_number
            );

            if(mysqli_stmt_execute($stmt)){

                echo "<script>
                alert('Registration Successful');
                window.location='index.php';
                </script>";
                exit();

            } else {

                echo "<script>alert('".mysqli_error($conn)."');</script>";

            }
        }
    }
}
?>
</div>

<div class="footer">
<div>
<p> © 2026 All Rights Reserved. </p>
</div>

<div>
<p>Privacy | About us</p>
</div>
</div>

</div>

</body>
</html>