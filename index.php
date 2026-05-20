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

<div class="background_img">

</div>

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
<input type="text" name="txtEmail" class="txtEmail" placeholder="Email">
</div>

<div>
<input type="password" name="txtPass" class="txtPass" placeholder="Password">
</div>

<div class="btn"><br>

<div class="buttonRow">
<input type="submit" value="Sign in" name="btnSignin" class="btnSignin">
<input type="submit" value="Sign up" name="btnSignup" class="btnSignup"><br><br>
</div>
<a href="forgot_pass.php" class="forgot">Forgot Password?</a>

</div>

</div>

</form>

<?php

if (isset($_POST['btnSignin'])) {

$email = trim($_POST['txtEmail']);
$password = $_POST['txtPass'];

if ($email == "" || $password == "") {

echo "<script>alert('Please enter email and password');</script>";

} else {

$sql = "SELECT * FROM users WHERE email='$email'";
$result = mysqli_query($conn,$sql);

if(mysqli_num_rows($result) > 0){

$row = mysqli_fetch_assoc($result);

if(password_verify($password,$row['password'])){

$_SESSION['user_id'] = $row['id'];
header('location:market.php');

} else {

echo "<script>alert('Invalid email or password');</script>";

}

} else {

echo "<script>alert('Email not found');</script>";

}

}

}

if (isset($_POST['btnSignup'])) {

header("Location: signup.php");

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