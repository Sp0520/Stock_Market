<?php
require_once('conn.php');
require_once('otp_service.php');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$purpose = $_GET['purpose'] ?? 'signup';
$allowed_purposes = ['signup', 'login', 'password_reset'];
if (!in_array($purpose, $allowed_purposes)) {
    $purpose = 'signup';
}

$identifier = '';
$userId = null;

if ($purpose === 'signup') {
    if (empty($_SESSION['pending_signup'])) {
        header('Location: signup.php');
        exit();
    }
    $identifier = $_SESSION['pending_signup']['email'];
} elseif ($purpose === 'login') {
    if (empty($_SESSION['pending_2fa'])) {
        header('Location: login.php');
        exit();
    }
    $identifier = $_SESSION['pending_2fa']['email'];
    $userId = $_SESSION['pending_2fa']['id'];
} elseif ($purpose === 'password_reset') {
    if (empty($_SESSION['pending_forgot_email'])) {
        header('Location: forgot_pass.php');
        exit();
    }
    $identifier = $_SESSION['pending_forgot_email'];
}

$error_msg = '';
$success_msg = '';

// Helper function to mask email/phone for UI
function maskIdentifier($id) {
    if (filter_var($id, FILTER_VALIDATE_EMAIL)) {
        $parts = explode('@', $id);
        $name = $parts[0];
        $domain = $parts[1];
        $maskedName = strlen($name) > 2 ? substr($name, 0, 2) . str_repeat('*', max(1, strlen($name) - 3)) . substr($name, -1) : $name . '***';
        return $maskedName . '@' . $domain;
    } else {
        return strlen($id) >= 10 ? substr($id, 0, 2) . str_repeat('*', 6) . substr($id, -2) : '***';
    }
}

// Handle Resend OTP Request
if (isset($_POST['btnResend'])) {
    $resendResult = createAndSendOtp($conn, $identifier, $purpose, $userId);
    if ($resendResult['success']) {
        $success_msg = $resendResult['message'];
    } else {
        $error_msg = $resendResult['message'];
    }
}

// Handle OTP Verification Submit
if (isset($_POST['btnVerify'])) {
    $otpInput = trim($_POST['otp_code'] ?? '');
    
    if (empty($otpInput)) {
        $error_msg = "Please enter the 6-digit OTP code.";
    } else {
        $verifyRes = verifyOtp($conn, $identifier, $otpInput, $purpose);
        
        if ($verifyRes['success']) {
            if ($purpose === 'signup') {
                $p = $_SESSION['pending_signup'];
                
                // Insert new user into database
                $stmt = mysqli_prepare(
                    $conn,
                    "INSERT INTO users (firstname, lastname, address, email, password, mobile_number, PANCARD_number)
                     VALUES (?, ?, ?, ?, ?, ?, ?)"
                );
                if ($stmt) {
                    mysqli_stmt_bind_param(
                        $stmt,
                        "sssssss",
                        $p['firstname'],
                        $p['lastname'],
                        $p['address'],
                        $p['email'],
                        $p['password'],
                        $p['mobile_number'],
                        $p['pan_number']
                    );

                    if (mysqli_stmt_execute($stmt)) {
                        $new_id = mysqli_insert_id($conn);
                        $_SESSION['user_id'] = $new_id;
                        $_SESSION['firstname'] = $p['firstname'];
                        $_SESSION['email'] = $p['email'];
                        unset($_SESSION['pending_signup']);

                        echo "<script>
                                alert('OTP Verified! Registration Successful.');
                                window.location='market.php';
                              </script>";
                        exit();
                    } else {
                        $error_msg = "Registration failed: " . mysqli_error($conn);
                    }
                    mysqli_stmt_close($stmt);
                } else {
                    $error_msg = "Database error inserting user.";
                }
            } elseif ($purpose === 'login') {
                $u = $_SESSION['pending_2fa'];
                $_SESSION['user_id'] = $u['id'];
                $_SESSION['firstname'] = $u['firstname'];
                $_SESSION['email'] = $u['email'];
                unset($_SESSION['pending_2fa']);

                echo "<script>
                        alert('2FA OTP Verified! Login Successful.');
                        window.location='market.php';
                      </script>";
                exit();
            } elseif ($purpose === 'password_reset') {
                // Fetch user ID for email
                $stmt = mysqli_prepare($conn, "SELECT id FROM users WHERE email = ?");
                if ($stmt) {
                    mysqli_stmt_bind_param($stmt, "s", $identifier);
                    mysqli_stmt_execute($stmt);
                    mysqli_stmt_bind_result($stmt, $foundId);
                    if (mysqli_stmt_fetch($stmt)) {
                        $_SESSION['forgot_user_id_verified'] = $foundId;
                    }
                    mysqli_stmt_close($stmt);
                }
                
                unset($_SESSION['pending_forgot_email']);
                echo "<script>
                        alert('OTP Verified! Please set your new password.');
                        window.location='reset.php';
                      </script>";
                exit();
            }
        } else {
            $error_msg = $verifyRes['message'];
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<link rel="shortcut icon" href="./assets/logo.png" type="image/x-icon" />
<link rel="stylesheet" href="Style_Custom.css">

<title>Stock Market - Verify OTP</title>
</head>

<body>

<div class="container" style="background-color: var(--bg-primary); display: flex; align-items: center; justify-content: center; min-height: 100vh;">

    <div class="background_img" style="filter: brightness(0.25);"></div>

    <div class="header" style="background: rgba(11, 15, 25, 0.8); backdrop-filter: var(--glass-blur); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; padding: 15px 30px; position: fixed; top: 0; left: 0; width: 100%; z-index: 100;">
        <img class="logo" src="./assets/logo.png" alt="" style="height: 1.8rem; width: 1.8rem; margin-right: 10px;">
        <span class="title" style="font-weight: 700; color: var(--text-primary);">Stock Market Application</span>
    </div>

    <div class="body" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding-top: 80px;">

        <form action="" method="post" style="z-index: 10;">

            <div class="signinContent" style="padding: 40px 35px; width: min(440px, calc(100vw - 30px)); height: auto; gap: 20px; border-radius: 24px; background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: var(--shadow-premium);">

                <div style="text-align: center; margin-bottom: 10px;">
                    <div style="width: 50px; height: 50px; border-radius: 16px; background: rgba(34, 211, 238, 0.15); border: 1px solid rgba(34, 211, 238, 0.3); display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto; color: var(--glow-blue); font-size: 24px; font-weight: 800;">
                        🔐
                    </div>
                    <h3 style="color: var(--text-primary); font-size: 1.6rem; font-weight: 700; margin: 0;">Verification Code</h3>
                    <p style="color: var(--text-secondary); font-size: 0.88rem; margin-top: 8px; line-height: 1.4;">
                        Enter the 6-digit OTP sent to<br>
                        <strong style="color: var(--glow-blue);"><?php echo htmlspecialchars(maskIdentifier($identifier)); ?></strong>
                    </p>
                </div>

                <?php if (!empty($error_msg)): ?>
                    <div style="background: rgba(255, 59, 92, 0.15); border: 1px solid rgba(255, 59, 92, 0.4); color: var(--danger); font-size: 0.85rem; padding: 12px; border-radius: 10px; text-align: center; font-weight: 600;">
                        ⚠️ <?php echo htmlspecialchars($error_msg); ?>
                    </div>
                <?php endif; ?>

                <?php if (!empty($success_msg)): ?>
                    <div style="background: rgba(0, 227, 138, 0.15); border: 1px solid rgba(0, 227, 138, 0.4); color: var(--success); font-size: 0.85rem; padding: 12px; border-radius: 10px; text-align: center; font-weight: 600;">
                        ✓ <?php echo htmlspecialchars($success_msg); ?>
                    </div>
                <?php endif; ?>

                <?php if (isset($_SESSION['last_otp_dev'])): ?>
                    <div style="background: rgba(34, 211, 238, 0.12); border: 2px solid var(--glow-blue); color: #ffffff; font-size: 0.95rem; padding: 12px 16px; border-radius: 12px; text-align: center; margin-top: 5px; box-shadow: 0 0 15px rgba(34, 211, 238, 0.2);">
                        🔑 <span style="font-weight: 600;">Your OTP Code:</span> 
                        <strong id="demoOtpValue" style="color: #00e38a; font-size: 1.25rem; letter-spacing: 3px; font-family: monospace; margin: 0 8px;"><?php echo $_SESSION['last_otp_dev']; ?></strong>
                        <button type="button" 
                                onclick="document.querySelector('input[name=otp_code]').value='<?php echo $_SESSION['last_otp_dev']; ?>';" 
                                style="background: var(--glow-blue); color: #000000; border: none; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.75rem; cursor: pointer; margin-left: 5px;">
                            Auto-Fill
                        </button>
                    </div>
                <?php endif; ?>

                <div style="width: 100%; margin-top: 10px;">
                    <input type="text" 
                           name="otp_code" 
                           class="txtEmail" 
                           placeholder="Enter 6-digit OTP" 
                           maxlength="6"
                           pattern="\d{6}"
                           autocomplete="one-time-code"
                           style="width: 100%; text-align: center; letter-spacing: 6px; font-size: 1.4rem; font-weight: 700; background: #ffffff !important; color: #000000 !important;"
                           required 
                           autofocus>
                </div>

                <div class="btn" style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 15px; height: auto; padding: 0; margin-top: 10px;">
                    <input type="submit" 
                           value="Verify OTP" 
                           name="btnVerify" 
                           class="btnSignin"
                           style="width: 100%; margin: 0; font-size: 1rem;">

                    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; font-size: 0.85rem; color: var(--text-muted); margin-top: 5px;">
                        <span>Didn't receive code?</span>
                        <button type="submit" 
                                name="btnResend" 
                                id="btnResend"
                                style="background: none; border: none; color: var(--accent); font-weight: 600; cursor: pointer; text-decoration: underline; font-size: 0.85rem; padding: 0;">
                            Resend OTP <span id="cooldownTimer"></span>
                        </button>
                    </div>
                </div>

            </div>

        </form>

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

<script>
// Resend Cooldown Timer Logic (30 seconds)
(function() {
    var cooldown = 30;
    var timerSpan = document.getElementById('cooldownTimer');
    var resendBtn = document.getElementById('btnResend');

    if (timerSpan && resendBtn) {
        resendBtn.disabled = true;
        resendBtn.style.opacity = '0.5';
        resendBtn.style.cursor = 'not-allowed';

        var interval = setInterval(function() {
            timerSpan.textContent = '(' + cooldown + 's)';
            cooldown--;

            if (cooldown < 0) {
                clearInterval(interval);
                timerSpan.textContent = '';
                resendBtn.disabled = false;
                resendBtn.style.opacity = '1';
                resendBtn.style.cursor = 'pointer';
            }
        }, 1000);
    }
})();
</script>

</body>
</html>
