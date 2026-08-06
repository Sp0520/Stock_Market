<?php
require_once(__DIR__ . '/config/conn.php');

// Block access if reset flow wasn't verified
if (!isset($_SESSION['reset_user_id'])) {
    header("Location: forgot_pass.php");
    exit();
}

$errorMsg = '';
$successMsg = '';

if (isset($_POST['btnUpdatePass'])) {
    if (!isset($_POST['csrf_token']) || !validateCsrfToken($_POST['csrf_token'])) {
        $errorMsg = 'CSRF validation failed. Please try again.';
    } else {
        $password = $_POST['new_pass'];
        $confirm = $_POST['confirm_pass'];
        
        if ($password !== $confirm) {
            $errorMsg = 'Passwords do not match.';
        } elseif (strlen($password) < 6) {
            $errorMsg = 'Password must be at least 6 characters.';
        } else {
            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $userId = $_SESSION['reset_user_id'];
            
            $stmt = mysqli_prepare($conn, "UPDATE users SET password = ? WHERE id = ?");
            if ($stmt) {
                mysqli_stmt_bind_param($stmt, "si", $hashed, $userId);
                if (mysqli_stmt_execute($stmt)) {
                    // Success! Clean reset token
                    unset($_SESSION['reset_user_id']);
                    
                    // Create notification
                    $stmtNotif = mysqli_prepare($conn, "INSERT INTO notifications (user_id, title, message) VALUES (?, 'Password Reset Successful', 'Your account password was changed successfully.')");
                    if ($stmtNotif) {
                        mysqli_stmt_bind_param($stmtNotif, "i", $userId);
                        mysqli_stmt_execute($stmtNotif);
                        mysqli_stmt_close($stmtNotif);
                    }
                    
                    $successMsg = 'Password updated successfully! Redirecting to login...';
                    echo "<script>
                        setTimeout(() => { window.location.href = 'index.php'; }, 2000);
                    </script>";
                } else {
                    $errorMsg = 'Internal update error.';
                }
                mysqli_stmt_close($stmt);
            }
        }
    }
}

include_once(__DIR__ . '/includes/header.php');
?>

<div class="container d-flex align-items-center justify-content-center min-vh-100" style="background: var(--bg-gradient); background-attachment: fixed;">
    <div class="row w-100 justify-content-center">
        <div class="col-md-5 col-lg-4">
            <div class="glass-panel p-5 text-center fade-in-up" style="box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                <div class="mb-4">
                    <div class="d-inline-flex align-items-center justify-content-center bg-primary-transparent rounded-circle mb-3" style="width: 70px; height: 70px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2);">
                        <i class="bi bi-shield-lock-fill text-primary" style="font-size: 2.2rem;"></i>
                    </div>
                    <h3 class="mt-2 fw-bold text-white">Reset Password</h3>
                    <p class="text-secondary small">Choose a secure, strong password</p>
                </div>
                
                <?php if (!empty($errorMsg)): ?>
                    <div class="alert alert-danger py-2 small" role="alert" style="border-radius: var(--border-radius); background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #FF8A8A;">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i> <?= htmlspecialchars($errorMsg) ?>
                    </div>
                <?php endif; ?>
                
                <?php if (!empty($successMsg)): ?>
                    <div class="alert alert-success py-2 small" role="alert" style="border-radius: var(--border-radius); background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #A7F3D0;">
                        <i class="bi bi-check-circle-fill me-2"></i> <?= htmlspecialchars($successMsg) ?>
                    </div>
                <?php endif; ?>
                
                <?php if (empty($successMsg)): ?>
                    <form action="" method="post" autocomplete="off">
                        <?= getCsrfInput() ?>
                        <div class="form-floating mb-3">
                            <input type="password" class="form-control bg-transparent text-white border-secondary" id="new_pass" name="new_pass" placeholder="New Password" required style="border-radius: var(--border-radius); border-color: rgba(255,255,255,0.1) !important;">
                            <label for="new_pass" class="text-secondary">New Password</label>
                        </div>
                        <div class="form-floating mb-4">
                            <input type="password" class="form-control bg-transparent text-white border-secondary" id="confirm_pass" name="confirm_pass" placeholder="Re-enter Password" required style="border-radius: var(--border-radius); border-color: rgba(255,255,255,0.1) !important;">
                            <label for="confirm_pass" class="text-secondary">Confirm New Password</label>
                        </div>
                        
                        <button type="submit" name="btnUpdatePass" class="btn btn-primary-custom w-100 mb-3" style="border-radius: var(--border-radius); padding: 12px; font-weight: 700; font-size: 1rem;">Update Password</button>
                    </form>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php include_once(__DIR__ . '/includes/footer.php'); ?>