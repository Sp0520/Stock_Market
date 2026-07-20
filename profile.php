<?php
include_once(__DIR__ . '/includes/header.php');

$errorMsg = '';
$successMsg = '';

$userId = $_SESSION['user_id'];

// Handle profile update
if (isset($_POST['btnUpdateProfile'])) {
    if (!isset($_POST['csrf_token']) || !validateCsrfToken($_POST['csrf_token'])) {
        $errorMsg = 'CSRF validation failed.';
    } else {
        $first = trim($_POST['firstname']);
        $last = trim($_POST['lastname']);
        $addr = trim($_POST['address']);
        $mob = trim($_POST['mobile_number']);
        $pan = strtoupper(trim($_POST['pan_number']));
        
        // Handle Profile picture upload
        $avatarName = $user['profile_picture']; // Keep existing by default
        
        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['avatar']['tmp_name'];
            $fileName = $_FILES['avatar']['name'];
            $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            
            $allowedExtensions = ['png', 'jpg', 'jpeg'];
            if (in_array($fileExtension, $allowedExtensions)) {
                $uploadDir = __DIR__ . '/uploads/';
                if (!file_exists($uploadDir)) {
                    @mkdir($uploadDir, 0755, true);
                }
                
                $newFileName = 'avatar_user_' . $userId . '.' . $fileExtension;
                $destPath = $uploadDir . $newFileName;
                
                if (move_uploaded_file($fileTmpPath, $destPath)) {
                    $avatarName = $newFileName;
                } else {
                    $errorMsg = 'Error moving uploaded file.';
                }
            } else {
                $errorMsg = 'Invalid file type. Allowed: PNG, JPG, JPEG.';
            }
        }
        
        if (empty($errorMsg)) {
            $stmt = mysqli_prepare($conn, "UPDATE users SET firstname = ?, lastname = ?, address = ?, mobile_number = ?, PANCARD_number = ?, profile_picture = ? WHERE id = ?");
            mysqli_stmt_bind_param($stmt, "ssssssi", $first, $last, $addr, $mob, $pan, $avatarName, $userId);
            if (mysqli_stmt_execute($stmt)) {
                $_SESSION['firstname'] = $first;
                $successMsg = 'Profile updated successfully!';
                
                // Add notification
                $stmtNotif = mysqli_prepare($conn, "INSERT INTO notifications (user_id, title, message) VALUES (?, 'Profile Updated', 'Your profile details were updated successfully.')");
                mysqli_stmt_bind_param($stmtNotif, "i", $userId);
                mysqli_stmt_execute($stmtNotif);
                mysqli_stmt_close($stmtNotif);
                
                // Refresh local user data
                $stmtUser = mysqli_prepare($conn, "SELECT * FROM users WHERE id = ?");
                mysqli_stmt_bind_param($stmtUser, "i", $userId);
                mysqli_stmt_execute($stmtUser);
                $resUser = mysqli_stmt_get_result($stmtUser);
                $user = mysqli_fetch_assoc($resUser);
                mysqli_stmt_close($stmtUser);
            } else {
                $errorMsg = 'Error updating profile: ' . mysqli_error($conn);
            }
            mysqli_stmt_close($stmt);
        }
    }
}

// Handle password change
if (isset($_POST['btnUpdatePassword'])) {
    if (!isset($_POST['csrf_token']) || !validateCsrfToken($_POST['csrf_token'])) {
        $errorMsg = 'CSRF validation failed.';
    } else {
        $oldPass = $_POST['old_password'];
        $newPass = $_POST['new_password'];
        $confirmPass = $_POST['confirm_password'];
        
        if (password_verify($oldPass, $user['password'])) {
            if ($newPass === $confirmPass) {
                if (strlen($newPass) >= 6) {
                    $newHashed = password_hash($newPass, PASSWORD_DEFAULT);
                    $stmt = mysqli_prepare($conn, "UPDATE users SET password = ? WHERE id = ?");
                    mysqli_stmt_bind_param($stmt, "si", $newHashed, $userId);
                    if (mysqli_stmt_execute($stmt)) {
                        $successMsg = 'Password changed successfully!';
                    }
                    mysqli_stmt_close($stmt);
                } else {
                    $errorMsg = 'New password must be at least 6 characters.';
                }
            } else {
                $errorMsg = 'Confirm password does not match.';
            }
        } else {
            $errorMsg = 'Incorrect existing password.';
        }
    }
}

$userAvatar = !empty($user['profile_picture']) ? './uploads/' . htmlspecialchars($user['profile_picture']) : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h1 class="h3 fw-bold mb-1">My Profile</h1>
        <p class="text-secondary mb-0 small">Manage your account information and credentials</p>
    </div>
</div>

<?php if (!empty($successMsg)): ?>
    <div class="alert alert-success py-2 small" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i> <?= htmlspecialchars($successMsg) ?>
    </div>
<?php endif; ?>

<?php if (!empty($errorMsg)): ?>
    <div class="alert alert-danger py-2 small" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i> <?= htmlspecialchars($errorMsg) ?>
    </div>
<?php endif; ?>

<div class="row g-4">
    <div class="col-lg-8">
        <div class="fin-card">
            <h5 class="card-title mb-4">Profile Information</h5>
            
            <form action="" method="post" enctype="multipart/form-data">
                <?= getCsrfInput() ?>
                <div class="d-flex align-items-center gap-4 mb-4">
                    <img src="<?= $userAvatar ?>" alt="User Avatar" class="rounded-circle border" style="width: 80px; height: 80px; object-fit: cover; border-color: var(--color-blue) !important; border-width: 3px !important;">
                    <div>
                        <label for="avatar" class="btn btn-sm btn-outline-primary mb-2" style="border-radius: 8px;">Upload New Photo</label>
                        <input type="file" id="avatar" name="avatar" class="d-none" accept="image/png, image/jpeg, image/jpg">
                        <div class="text-secondary small">Allowed: PNG, JPG, JPEG. Max size 2MB.</div>
                    </div>
                </div>
                
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="text-secondary small fw-semibold mb-2">First Name</label>
                        <input type="text" class="form-control bg-transparent text-white border-secondary" name="firstname" value="<?= htmlspecialchars($user['firstname']) ?>" required style="border-radius: var(--border-radius);">
                    </div>
                    <div class="col-md-6">
                        <label class="text-secondary small fw-semibold mb-2">Last Name</label>
                        <input type="text" class="form-control bg-transparent text-white border-secondary" name="lastname" value="<?= htmlspecialchars($user['lastname']) ?>" required style="border-radius: var(--border-radius);">
                    </div>
                    
                    <div class="col-md-12">
                        <label class="text-secondary small fw-semibold mb-2">Email Address</label>
                        <input type="email" class="form-control bg-transparent text-white border-secondary" value="<?= htmlspecialchars($user['email']) ?>" disabled style="border-radius: var(--border-radius);">
                    </div>
                    
                    <div class="col-md-12">
                        <label class="text-secondary small fw-semibold mb-2">Address</label>
                        <textarea class="form-control bg-transparent text-white border-secondary" name="address" required style="border-radius: var(--border-radius); min-height: 80px;"><?= htmlspecialchars($user['address']) ?></textarea>
                    </div>
                    
                    <div class="col-md-6">
                        <label class="text-secondary small fw-semibold mb-2">Mobile Number</label>
                        <input type="text" class="form-control bg-transparent text-white border-secondary" name="mobile_number" value="<?= htmlspecialchars($user['mobile_number']) ?>" required pattern="^[0-9]{10}$" style="border-radius: var(--border-radius);">
                    </div>
                    
                    <div class="col-md-6">
                        <label class="text-secondary small fw-semibold mb-2">PAN Card Number</label>
                        <input type="text" class="form-control bg-transparent text-white border-secondary" name="pan_number" value="<?= htmlspecialchars($user['PANCARD_number']) ?>" required pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$" style="border-radius: var(--border-radius); text-transform: uppercase;">
                    </div>
                </div>
                
                <button type="submit" name="btnUpdateProfile" class="btn btn-primary-custom mt-4">Save Profile Changes</button>
            </form>
        </div>
    </div>
    
    <!-- Password reset panel -->
    <div class="col-lg-4">
        <div class="fin-card">
            <h5 class="card-title mb-4">Security Settings</h5>
            
            <form action="" method="post">
                <?= getCsrfInput() ?>
                <div class="mb-3">
                    <label class="text-secondary small fw-semibold mb-2">Current Password</label>
                    <input type="password" class="form-control bg-transparent text-white border-secondary" name="old_password" required style="border-radius: var(--border-radius);">
                </div>
                <div class="mb-3">
                    <label class="text-secondary small fw-semibold mb-2">New Password</label>
                    <input type="password" class="form-control bg-transparent text-white border-secondary" name="new_password" required style="border-radius: var(--border-radius);">
                </div>
                <div class="mb-4">
                    <label class="text-secondary small fw-semibold mb-2">Confirm New Password</label>
                    <input type="password" class="form-control bg-transparent text-white border-secondary" name="confirm_password" required style="border-radius: var(--border-radius);">
                </div>
                
                <button type="submit" name="btnUpdatePassword" class="btn btn-outline-secondary w-100" style="border-radius: var(--border-radius);">Change Password</button>
            </form>
        </div>
    </div>
</div>

<?php include_once(__DIR__ . '/includes/footer.php'); ?>
