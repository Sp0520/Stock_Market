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
<link rel="stylesheet" href="Style.css">
<link rel="stylesheet" href="Style_Custom.css">

<?php if(isset($msg) && $msg === "Password Updated Successfully!"){ ?>
<script>
setTimeout(function(){
window.location.href="index.php";
},3000);
</script>
<?php } ?>

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
                <h2 style="color: var(--text-primary); font-size: 1.75rem; font-weight: 700; text-align: center; margin-bottom: 10px;">Reset Password</h2>
                
                <?php if(isset($msg)){ ?>
                <p style="color: var(--success); font-weight: 600; text-align: center; font-size: 0.95rem; margin: 0;"><?php echo htmlspecialchars($msg, ENT_QUOTES, 'UTF-8'); ?></p>
                <?php } ?>

                <div style="width: 100%;">
                    <input type="password" name="password" placeholder="Enter New Password" style="width: 100%;" required>
                </div>
                <div class="btn" style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 15px; height: auto; padding: 0;">
                    <button type="submit" name="submit" class="btnSignup_singup" style="width: 100%;">Update Password</button>
                    <a href="index.php" style="color: var(--accent); text-decoration: none; font-weight: 500; font-size: 0.9rem;">Back to Sign In</a>
                </div>
            </div>
        </form>
    </div>
</div>

</body>
</html>