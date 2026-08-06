<?php
require_once(__DIR__ . '/config/conn.php');

if (isset($_SESSION['user_id'])) {
    header("Location: market.php");
    exit();
}

$errorMsg = '';
$successMsg = '';

if (isset($_POST['btnSignup'])) {
    // Validate CSRF
    if (!isset($_POST['csrf_token']) || !validateCsrfToken($_POST['csrf_token'])) {
        $errorMsg = 'CSRF validation failed. Please refresh and try again.';
    } else {
        $firstname = trim($_POST['firstname']);
        $lastname = trim($_POST['lastname']);
        $address = trim($_POST['address']);
        $email = trim($_POST['email']);
        $password = $_POST['enter_password'];
        $confirm_password = $_POST['confirm_password'];
        $mobile_number = trim($_POST['mobile_number']);
        $pan_number = trim($_POST['pan_number']);

        if ($password !== $confirm_password) {
            $errorMsg = 'Passwords do not match.';
        } elseif (strlen($password) < 6) {
            $errorMsg = 'Password must be at least 6 characters long.';
        } else {
            // Check if email already exists
            $stmt = mysqli_prepare($conn, "SELECT id FROM users WHERE email=?");
            mysqli_stmt_bind_param($stmt, "s", $email);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);

            if (mysqli_num_rows($result) > 0) {
                $errorMsg = 'Email already registered.';
                mysqli_stmt_close($stmt);
            } else {
                mysqli_stmt_close($stmt);
                
                // Hash Password
                $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                $defaultBalance = 100000.00; // Give new signups 1 Lakh virtual credits!
                
                $stmt = mysqli_prepare($conn, "INSERT INTO users (firstname, lastname, address, email, password, mobile_number, PANCARD_number, available_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                if ($stmt) {
                    mysqli_stmt_bind_param($stmt, "sssssssd", $firstname, $lastname, $address, $email, $hashed_password, $mobile_number, $pan_number, $defaultBalance);
                    
                    if (mysqli_stmt_execute($stmt)) {
                        $newUserId = mysqli_insert_id($conn);
                        mysqli_stmt_close($stmt);
                        
                        // Automatically create default watchlist for new user
                        $stmtWatch = mysqli_prepare($conn, "INSERT INTO watchlists (user_id, name, is_pinned) VALUES (?, 'My Watchlist', 1)");
                        if ($stmtWatch) {
                            mysqli_stmt_bind_param($stmtWatch, "i", $newUserId);
                            mysqli_stmt_execute($stmtWatch);
                            mysqli_stmt_close($stmtWatch);
                        }
                        
                        // Create onboarding notification
                        $stmtNotif = mysqli_prepare($conn, "INSERT INTO notifications (user_id, title, message) VALUES (?, 'Registration Successful', 'Welcome to BullVest! We have credited 1 Lakh virtual credits to your portfolio. Start trading now!')");
                        if ($stmtNotif) {
                            mysqli_stmt_bind_param($stmtNotif, "i", $newUserId);
                            mysqli_stmt_execute($stmtNotif);
                            mysqli_stmt_close($stmtNotif);
                        }
                        
                        $successMsg = 'Registration successful! Redirecting to login...';
                        echo "<script>
                            setTimeout(() => { window.location.href = 'index.php'; }, 2000);
                        </script>";
                    } else {
                        $errorMsg = 'Registration failed: ' . mysqli_error($conn);
                    }
                } else {
                    $errorMsg = 'Internal server error.';
                }
            }
        }
    }
}

include_once(__DIR__ . '/includes/header.php');
?>

<div class="container d-flex align-items-center justify-content-center min-vh-100" style="background: var(--bg-gradient); background-attachment: fixed; padding: 40px 0;">
    <div class="row w-100 justify-content-center">
        <div class="col-md-7 col-lg-5">
            <div class="glass-panel p-5 fade-in-up" style="box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                <div class="text-center mb-4">
                    <div class="d-inline-flex align-items-center justify-content-center bg-primary-transparent rounded-circle mb-3" style="width: 70px; height: 70px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2);">
                        <i class="bi bi-person-plus-fill text-primary" style="font-size: 2.2rem;"></i>
                    </div>
                    <h3 class="mt-2 fw-bold text-white">Join FinNest</h3>
                    <p class="text-secondary small">Start your trading journey with virtual credit</p>
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
                
                <form action="" method="post" autocomplete="off">
                    <?= getCsrfInput() ?>
                    <div class="row g-2">
                        <div class="col-md-6 mb-3">
                            <div class="form-floating">
                                <input type="text" class="form-control bg-transparent text-white border-secondary" id="firstname" name="firstname" placeholder="First Name" required style="border-radius: var(--border-radius); border-color: rgba(255,255,255,0.1) !important;">
                                <label for="firstname" class="text-secondary">First Name</label>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="form-floating">
                                <input type="text" class="form-control bg-transparent text-white border-secondary" id="lastname" name="lastname" placeholder="Last Name" required style="border-radius: var(--border-radius); border-color: rgba(255,255,255,0.1) !important;">
                                <label for="lastname" class="text-secondary">Last Name</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-floating mb-3">
                        <textarea class="form-control bg-transparent text-white border-secondary h-auto" id="address" name="address" placeholder="Address" required style="border-radius: var(--border-radius); min-height: 80px; border-color: rgba(255,255,255,0.1) !important;"></textarea>
                        <label for="address" class="text-secondary">Full Address</label>
                    </div>
                    
                    <div class="form-floating mb-3">
                        <input type="email" class="form-control bg-transparent text-white border-secondary" id="email" name="email" placeholder="Email" required style="border-radius: var(--border-radius); border-color: rgba(255,255,255,0.1) !important;">
                        <label for="email" class="text-secondary">Email Address</label>
                    </div>
                    
                    <div class="row g-2">
                        <div class="col-md-6 mb-3">
                            <div class="form-floating">
                                <input type="password" class="form-control bg-transparent text-white border-secondary" id="enter_password" name="enter_password" placeholder="Password" required style="border-radius: var(--border-radius); border-color: rgba(255,255,255,0.1) !important;">
                                <label for="enter_password" class="text-secondary">Password</label>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="form-floating">
                                <input type="password" class="form-control bg-transparent text-white border-secondary" id="confirm_password" name="confirm_password" placeholder="Confirm Password" required style="border-radius: var(--border-radius); border-color: rgba(255,255,255,0.1) !important;">
                                <label for="confirm_password" class="text-secondary">Re-enter Password</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row g-2">
                        <div class="col-md-6 mb-3">
                            <div class="form-floating">
                                <input type="text" class="form-control bg-transparent text-white border-secondary" id="mobile_number" name="mobile_number" placeholder="Mobile" required pattern="^[0-9]{10}$" title="Please enter a valid 10-digit mobile number" style="border-radius: var(--border-radius); border-color: rgba(255,255,255,0.1) !important;">
                                <label for="mobile_number" class="text-secondary">Mobile No</label>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="form-floating">
                                <input type="text" class="form-control bg-transparent text-white border-secondary" id="pan_number" name="pan_number" placeholder="Pancard No" required pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$" title="Please enter a valid PAN card format (e.g. ABCDE1234F)" style="border-radius: var(--border-radius); border-color: rgba(255,255,255,0.1) !important;">
                                <label for="pan_number" class="text-secondary">PAN Card No</label>
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" name="btnSignup" class="btn btn-primary-custom w-100 mt-2 mb-3" style="border-radius: var(--border-radius); padding: 12px; font-weight: 700; font-size: 1rem;">Register Account</button>
                </form>
                
                <p class="text-secondary small text-center mb-0 mt-2">
                    Already have an account? <a href="index.php" class="text-primary text-decoration-none fw-bold">Sign In</a>
                </p>
            </div>
        </div>
    </div>
</div>

<?php include_once(__DIR__ . '/includes/footer.php'); ?>