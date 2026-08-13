<?php
require('conn.php');
require_once('otp_service.php');
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

<title>Stock Market - Sign Up</title>
</head>

<body>

<div class="container" style="background-color: var(--bg-primary); display: flex; align-items: center; justify-content: center; height: auto; min-height: 100vh;">

<div class="background_img" style="filter: brightness(0.25);"></div>

<div class="header" style="background: rgba(11, 15, 25, 0.8); backdrop-filter: var(--glass-blur); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; padding: 15px 30px; position: fixed; top: 0; left: 0; width: 100%; z-index: 100;">
<img class="logo" src="./assets/logo.png" alt="" style="height: 1.8rem; width: 1.8rem; margin-right: 10px;">
<span class="title" style="font-weight: 700; color: var(--text-primary);">Stock Market Application</span>
</div>

<div class="signup_body" style="display: flex; align-items: center; justify-content: center; width: 100%; padding-top: 100px; padding-bottom: 80px;">
  <div class="signup_card" style="padding: 40px 30px; width: min(460px, calc(100vw - 30px)); border-radius: 24px; background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: var(--shadow-premium); margin: 0; z-index: 10;">
    <form action="" method="post" style="display: flex; flex-direction: column; gap: 15px;">
      <h3 style="color: var(--text-primary); font-size: 1.75rem; font-weight: 700; text-align: center; margin-bottom: 10px;">Sign up</h3>
      <div class="name_row" style="display: flex; gap: 12px; width: 100%;">
        <input type="text" class="name" name="firstname" placeholder="First Name" style="flex: 1;" required>
        <input type="text" class="name" name="lastname" placeholder="Last Name" style="flex: 1;" required>
      </div>
      <textarea name="address" class="textarea_signup" placeholder="Address" style="width: 100%; min-height: 80px;" required></textarea>
      <input type="email" class="email_signup" name="email" placeholder="Email" style="width: 100%;" required>
      <input type="password" class="pass_signup" name="enter_password" placeholder="Enter Password" style="width: 100%;" required>
      <input type="password" class="pass_signup" name="confirm_password" placeholder="Re-enter Password" style="width: 100%;" required>
      <input type="number" class="email_signup" name="mobile_number" placeholder="Mobile No" style="width: 100%;" required>
      <input type="text" class="email_signup" name="pan_number" placeholder="Pancard No" style="width: 100%;" required>
      <input type="submit" class="btnSignup_singup" name="btnSignup" value="Sign up" style="width: 100%; margin-top: 10px;">
      
      <p style="text-align: center; margin-top: 5px; font-size: 0.9rem; color: var(--text-secondary);">
        Already have an account? <a href="login.php" style="color: var(--accent); text-decoration: none; font-weight: 500;">Sign in</a>
      </p>
    </form>
  </div>

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
    } else if (strlen($password) < 6) {
        echo "<script>alert('Password must be at least 6 characters long');</script>";
    } else {
        $stmt = mysqli_prepare(
            $conn,
            "SELECT email, mobile_number, PANCARD_number FROM users WHERE email=? OR mobile_number=? OR PANCARD_number=?"
        );

        mysqli_stmt_bind_param($stmt, "sss", $email, $mobile_number, $pan_number);
        mysqli_stmt_execute($stmt);

        $result = mysqli_stmt_get_result($stmt);

        if(mysqli_num_rows($result) > 0){
            $row = mysqli_fetch_assoc($result);
            if ($row['email'] === $email) {
                echo "<script>alert('Email already registered');</script>";
            } else if ($row['mobile_number'] === $mobile_number) {
                echo "<script>alert('Mobile number already registered');</script>";
            } else if ($row['PANCARD_number'] === $pan_number) {
                echo "<script>alert('PAN Card number already registered');</script>";
            }
        } else {

            $hashed_password = password_hash(
                $password,
                PASSWORD_DEFAULT
            );

            // Store pending registration data in session
            $_SESSION['pending_signup'] = [
                'firstname' => $firstname,
                'lastname' => $lastname,
                'address' => $address,
                'email' => $email,
                'password' => $hashed_password,
                'mobile_number' => $mobile_number,
                'pan_number' => $pan_number
            ];

            // Send OTP
            $otpRes = createAndSendOtp($conn, $email, 'signup');

            if ($otpRes['success']) {
                echo "<script>
                        alert('An OTP has been sent to your email. Please verify to complete registration.');
                        window.location='verify_otp.php?purpose=signup';
                      </script>";
                exit();
            } else {
                echo "<script>alert('" . addslashes($otpRes['message']) . "');</script>";
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