<?php
require('conn.php');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Only allow access if forgot-password session is set
if (empty($_SESSION['forgot_user_id_verified'])) {
    header('Location: forgot_pass.php');
    exit();
}

$userId = (int) $_SESSION['forgot_user_id_verified'];

if (isset($_POST['submit'])) {
    $password = $_POST['password'] ?? '';

    if ($password === '') {
        $msg = "Password cannot be empty.";
    } else {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        if ($stmt = mysqli_prepare($conn, "UPDATE users SET password = ? WHERE id = ?")) {
            mysqli_stmt_bind_param($stmt, "si", $hashedPassword, $userId);
            mysqli_stmt_execute($stmt);

            if (mysqli_stmt_affected_rows($stmt) > 0) {
                $msg = "Password Updated Successfully!";
                unset($_SESSION['forgot_user_id_verified']);
            } else {
                $msg = "Failed to update password.";
            }

            mysqli_stmt_close($stmt);
        } else {
            $msg = "Failed to update password.";
        }
    }
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Reset Password</title>
<link rel="stylesheet" href="reset.css">

<?php if(isset($msg) && $msg === "Password Updated Successfully!"){ ?>
<script>
setTimeout(function(){
window.location.href="index.php";  // change to your login page name
},3000);
</script>
<?php } ?>

</head>

<body>

<div class="container">

<div class="card">

<h2>Reset Password</h2>

<?php if(isset($msg)){ ?>
<p class="success"><?php echo htmlspecialchars($msg, ENT_QUOTES, 'UTF-8'); ?></p>
<?php } ?>

<form method="post">

<input type="password" name="password" placeholder="Enter New Password" required>

<button type="submit" name="submit">Reset Password</button>

</form>

</div>

</div>

</body>
</html>