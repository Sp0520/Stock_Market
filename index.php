<?php
require_once(__DIR__ . '/config/conn.php');

// Redirect to dashboard if already logged in
if (isset($_SESSION['user_id'])) {
    header("Location: market.php");
    exit();
}

$errorMsg = '';

if (isset($_POST['btnSignin'])) {
    // Validate CSRF token
    if (!isset($_POST['csrf_token']) || !validateCsrfToken($_POST['csrf_token'])) {
        $errorMsg = 'CSRF validation failed. Please refresh the page and try again.';
    } else {
        $email = trim($_POST['txtEmail']);
        $password = $_POST['txtPass'];

        $stmt = mysqli_prepare($conn, "SELECT * FROM users WHERE email=?");
        if ($stmt) {
            mysqli_stmt_bind_param($stmt, "s", $email);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);

            if (mysqli_num_rows($result) > 0) {
                $row = mysqli_fetch_assoc($result);

                if (password_verify($password, $row['password'])) {
                    // Prevent session fixation
                    session_regenerate_id(true);
                    
                    $_SESSION['user_id'] = $row['id'];
                    $_SESSION['firstname'] = $row['firstname'];
                    $_SESSION['email'] = $row['email'];
                    $_SESSION['role'] = $row['role'];

                    header("Location: market.php");
                    exit();
                } else {
                    $errorMsg = 'Invalid password.';
                }
            } else {
                $errorMsg = 'Email not found.';
            }
            mysqli_stmt_close($stmt);
        } else {
            $errorMsg = 'Internal database error.';
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
                    <h2 class="mt-2 fw-bold text-white tracking-tight">FinNest Portal</h2>
                    <p class="text-secondary small">Smart FinTech Stock Trading Platform</p>
                </div>
                
                <?php if (!empty($errorMsg)): ?>
                    <div class="alert alert-danger py-2 small" role="alert" style="border-radius: var(--border-radius); background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #FF8A8A;">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i> <?= htmlspecialchars($errorMsg) ?>
                    </div>
                <?php endif; ?>
                
                <form action="" method="post" autocomplete="off">
                    <?= getCsrfInput() ?>
                    <div class="form-floating mb-3">
                        <input type="email" class="form-control bg-transparent text-white border-secondary" id="txtEmail" name="txtEmail" placeholder="name@example.com" required style="border-radius: var(--border-radius); border-color: rgba(255,255,255,0.1) !important;">
                        <label for="txtEmail" class="text-secondary">Email Address</label>
                    </div>
                    <div class="form-floating mb-3">
                        <input type="password" class="form-control bg-transparent text-white border-secondary" id="txtPass" name="txtPass" placeholder="Password" required style="border-radius: var(--border-radius); border-color: rgba(255,255,255,0.1) !important;">
                        <label for="txtPass" class="text-secondary">Password</label>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <div class="form-check text-start">
                            <input class="form-check-input bg-transparent" type="checkbox" value="" id="rememberMe" style="border-color: rgba(255,255,255,0.2);">
                            <label class="form-check-label text-secondary small" for="rememberMe">
                                Remember Me
                            </label>
                        </div>
                        <a href="forgot_pass.php" class="text-decoration-none small text-primary fw-semibold">Forgot Password?</a>
                    </div>
                    
                    <button type="submit" name="btnSignin" class="btn btn-primary-custom w-100 mb-3" style="border-radius: var(--border-radius); padding: 12px; font-weight: 700; font-size: 1rem;">Secure Sign In</button>
                </form>
                
                <div class="position-relative my-4">
                    <hr style="border-color: rgba(255,255,255,0.15);">
                    <span class="position-absolute top-50 start-50 translate-middle px-2 small text-secondary" style="background-color: var(--bg-card-opaque); border-radius: 4px;">OR</span>
                </div>
                
                <!-- Google login mockup -->
                <button class="btn btn-outline-secondary w-100 mb-3 d-flex align-items-center justify-content-center gap-2" style="border-radius: var(--border-radius); padding: 10px; border-color: rgba(255,255,255,0.1);" onclick="alert('Google authentication placeholder')">
                    <i class="bi bi-google text-danger"></i>
                    <span class="text-white small">Continue with Google</span>
                </button>
                
                <p class="text-secondary small mb-0 mt-3">
                    New to BullVest? <a href="signup.php" class="text-primary text-decoration-none fw-bold">Create Account</a>
                </p>
            </div>
        </div>
    </div>
</div>

<?php include_once(__DIR__ . '/includes/footer.php'); ?>