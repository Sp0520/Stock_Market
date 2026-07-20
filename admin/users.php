<?php
$isSubfolder = true;
require_once(dirname(__DIR__) . '/includes/header.php');

// Enforce admin permission
if (!$user || $user['role'] !== 'admin') {
    header("Location: ../market.php");
    exit();
}

$successMsg = '';
$errorMsg = '';

// Handle role toggle
if (isset($_POST['toggle_role'])) {
    if (!isset($_POST['csrf_token']) || !validateCsrfToken($_POST['csrf_token'])) {
        $errorMsg = 'CSRF validation failed.';
    } else {
        $targetUserId = intval($_POST['user_id']);
        $newRole = $_POST['new_role'] === 'admin' ? 'admin' : 'user';
        
        if ($targetUserId === $user['id']) {
            $errorMsg = 'You cannot demote yourself!';
        } else {
            $stmt = mysqli_prepare($conn, "UPDATE users SET role = ? WHERE id = ?");
            mysqli_stmt_bind_param($stmt, "si", $newRole, $targetUserId);
            if (mysqli_stmt_execute($stmt)) {
                $successMsg = 'User role updated successfully!';
            }
            mysqli_stmt_close($stmt);
        }
    }
}

// Handle user deletion
if (isset($_POST['delete_user'])) {
    if (!isset($_POST['csrf_token']) || !validateCsrfToken($_POST['csrf_token'])) {
        $errorMsg = 'CSRF validation failed.';
    } else {
        $targetUserId = intval($_POST['user_id']);
        if ($targetUserId === $user['id']) {
            $errorMsg = 'You cannot delete yourself!';
        } else {
            $stmt = mysqli_prepare($conn, "DELETE FROM users WHERE id = ?");
            mysqli_stmt_bind_param($stmt, "i", $targetUserId);
            if (mysqli_stmt_execute($stmt)) {
                $successMsg = 'User account deleted successfully!';
            }
            mysqli_stmt_close($stmt);
        }
    }
}
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h1 class="h3 fw-bold mb-1">User Management Portal</h1>
        <p class="text-secondary mb-0 small">Moderate registered BullVest platform accounts</p>
    </div>
    <a href="dashboard.php" class="btn btn-sm btn-outline-secondary" style="border-radius: 8px;"><i class="bi bi-arrow-left me-1"></i> Admin Panel</a>
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

<div class="fin-card">
    <h5 class="card-title mb-3">Registered Users Directory</h5>
    <div class="table-responsive">
        <table class="fin-table" style="font-size: 0.85rem;">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Mobile</th>
                    <th>PAN Card</th>
                    <th>Wallet Balance</th>
                    <th>System Role</th>
                    <th class="text-end">Administrative Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $resAll = mysqli_query($conn, "SELECT * FROM users ORDER BY created_at ASC");
                while ($u = mysqli_fetch_assoc($resAll)) {
                    $isSelf = $u['id'] === $user['id'];
                    echo '<tr>';
                    echo '<td>' . htmlspecialchars($u['id']) . '</td>';
                    echo '<td class="fw-bold text-white">' . htmlspecialchars($u['firstname'] . ' ' . $u['lastname']) . ($isSelf ? ' <span class="text-secondary small">(You)</span>' : '') . '</td>';
                    echo '<td>' . htmlspecialchars($u['email']) . '</td>';
                    echo '<td>' . htmlspecialchars($u['mobile_number']) . '</td>';
                    echo '<td>' . htmlspecialchars($u['PANCARD_number']) . '</td>';
                    echo '<td class="fw-bold">₹' . number_format($u['available_balance'], 2) . '</td>';
                    echo '<td><span class="badge ' . ($u['role'] === 'admin' ? 'bg-danger' : 'bg-primary') . '">' . htmlspecialchars($u['role']) . '</span></td>';
                    echo '<td class="text-end">';
                    
                    if (!$isSelf) {
                        $newRole = $u['role'] === 'admin' ? 'user' : 'admin';
                        $roleLabel = $u['role'] === 'admin' ? 'Demote to User' : 'Promote to Admin';
                        $roleIcon = $u['role'] === 'admin' ? 'bi-shield-slash' : 'bi-shield-check';
                        
                        // Toggle Role Form
                        echo '<form action="" method="post" style="display:inline-block;" class="me-2">';
                        echo getCsrfInput();
                        echo '<input type="hidden" name="user_id" value="' . $u['id'] . '">';
                        echo '<input type="hidden" name="new_role" value="' . $newRole . '">';
                        echo '<button type="submit" name="toggle_role" class="btn btn-sm btn-outline-warning py-1" style="border-radius: 6px; font-size: 0.75rem;" title="' . $roleLabel . '">';
                        echo '<i class="bi ' . $roleIcon . ' me-1"></i> Role';
                        echo '</button>';
                        echo '</form>';
                        
                        // Delete Form
                        echo '<form action="" method="post" style="display:inline-block;" onsubmit="return confirm(\'Delete this user permanently?\')">';
                        echo getCsrfInput();
                        echo '<input type="hidden" name="user_id" value="' . $u['id'] . '">';
                        echo '<button type="submit" name="delete_user" class="btn btn-sm btn-outline-danger py-1" style="border-radius: 6px; font-size: 0.75rem;" title="Delete">';
                        echo '<i class="bi bi-trash"></i>';
                        echo '</button>';
                        echo '</form>';
                    } else {
                        echo '<span class="text-secondary small">No Actions</span>';
                    }
                    
                    echo '</td>';
                    echo '</tr>';
                }
                ?>
            </tbody>
        </table>
    </div>
</div>

<?php include_once(dirname(__DIR__) . '/includes/footer.php'); ?>
