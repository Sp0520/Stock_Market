<?php
require_once(__DIR__ . '/config/conn.php');

$errorMsg = '';
$successMsg = '';
$resetLink = '';

if (isset($_POST['btnReset'])) {
    if (!isset($_POST['csrf_token']) || !validateCsrfToken($_POST['csrf_token'])) {
        $errorMsg = 'CSRF validation failed. Please refresh and try again.';
    } else {
        $email = trim($_POST['email']);
        
        $stmt = mysqli_prepare($conn, "SELECT id, firstname FROM users WHERE email = ?");
        if ($stmt) {
            mysqli_stmt_bind_param($stmt, "s", $email);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            
            if (mysqli_num_rows($result) > 0) {
                $row = mysqli_fetch_assoc($result);
                // Simulate password recovery token
                $_SESSION['reset_user_id'] = $row['id'];
                
                $successMsg = 'Recovery request verified! Reset link generated successfully.';
                $resetLink = 'reset.php';
            } else {
                $errorMsg = 'Email address not found in our records.';
            }
            mysqli_stmt_close($stmt);
        } else {
            $errorMsg = 'Database connection error.';
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
                        <i class="bi bi-shield-fill-question text-primary" style="font-size: 2.2rem;"></i>
                    </div>
                    <h3 class="mt-2 fw-bold text-white">Recover Access</h3>
                    <p class="text-secondary small">Enter your email to verify your identity</p>
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
                    <?php if (!empty($resetLink)): ?>
                        <div class="mb-4 mt-2">
                            <a href="<?= $resetLink ?>" class="btn btn-warning w-100 text-dark fw-bold" style="border-radius: var(--border-radius); padding: 12px;">
                                <i class="bi bi-shield-lock-fill me-2"></i> Go to Reset Password
                            </a>
                        </div>
                    <?php endif; ?>
                <?php endif; ?>
                
                <?php if (empty($resetLink)): ?>
                    <form action="" method="post" autocomplete="off">
                        <?= getCsrfInput() ?>
                        <div class="form-floating mb-4">
                            <input type="email" class="form-control bg-transparent text-white border-secondary" id="email" name="email" placeholder="name@example.com" required style="border-radius: var(--border-radius); border-color: rgba(255,255,255,0.1) !important;">
                            <label for="email" class="text-secondary">Registered Email Address</label>
                        </div>
                        
                        <button type="submit" name="btnReset" class="btn btn-primary-custom w-100 mb-3" style="border-radius: var(--border-radius); padding: 12px; font-weight: 700; font-size: 1rem;">Verify Identity</button>
                    </form>
                <?php endif; ?>
                
                <p class="text-secondary small mb-0 mt-3">
                    Remember password? <a href="index.php" class="text-primary text-decoration-none fw-bold">Sign In</a>
                </p>
            </div>
        </div>
    </div>
</div>


<?php include_once(__DIR__ . '/includes/footer.php'); ?>