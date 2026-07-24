<?php
header('Content-Type: application/json');
require_once(dirname(__DIR__) . '/config/conn.php');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$userId = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $csrf = isset($_POST['csrf_token']) ? $_POST['csrf_token'] : '';
    
    if (!validateCsrfToken($csrf)) {
        echo json_encode(['success' => false, 'error' => 'CSRF verification failed.']);
        exit;
    }
    
    $first = trim($_POST['firstname'] ?? '');
    $last = trim($_POST['lastname'] ?? '');
    $addr = trim($_POST['address'] ?? '');
    $mob = trim($_POST['mobile_number'] ?? '');
    $pan = strtoupper(trim($_POST['pan_number'] ?? ''));
    
    if (empty($first) || empty($last) || empty($addr) || empty($mob) || empty($pan)) {
        echo json_encode(['success' => false, 'error' => 'All profile fields are required.']);
        exit;
    }
    
    // Fetch current user details to get existing avatar path
    $stmtUser = mysqli_prepare($conn, "SELECT profile_picture FROM users WHERE id = ?");
    mysqli_stmt_bind_param($stmtUser, "i", $userId);
    mysqli_stmt_execute($stmtUser);
    mysqli_stmt_bind_result($stmtUser, $existingAvatar);
    mysqli_stmt_fetch($stmtUser);
    mysqli_stmt_close($stmtUser);
    
    $avatarName = $existingAvatar;
    
    // Handle Profile picture upload
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['avatar']['tmp_name'];
        $fileName = $_FILES['avatar']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        
        $allowedExtensions = ['png', 'jpg', 'jpeg'];
        if (in_array($fileExtension, $allowedExtensions)) {
            $uploadDir = dirname(__DIR__) . '/uploads/';
            if (!file_exists($uploadDir)) {
                @mkdir($uploadDir, 0755, true);
            }
            
            $newFileName = 'avatar_user_' . $userId . '.' . $fileExtension;
            $destPath = $uploadDir . $newFileName;
            
            if (move_uploaded_file($fileTmpPath, $destPath)) {
                $avatarName = $newFileName;
            } else {
                echo json_encode(['success' => false, 'error' => 'Error moving uploaded avatar file.']);
                exit;
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Invalid file format. Only PNG, JPG, and JPEG allowed.']);
            exit;
        }
    }
    
    // Update db
    $stmt = mysqli_prepare($conn, "UPDATE users SET firstname = ?, lastname = ?, address = ?, mobile_number = ?, PANCARD_number = ?, profile_picture = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "ssssssi", $first, $last, $addr, $mob, $pan, $avatarName, $userId);
    if (mysqli_stmt_execute($stmt)) {
        $_SESSION['firstname'] = $first;
        
        // Log notification
        $stmtNotif = mysqli_prepare($conn, "INSERT INTO notifications (user_id, title, message) VALUES (?, 'Profile Updated', 'Your profile details were updated successfully.')");
        mysqli_stmt_bind_param($stmtNotif, "i", $userId);
        mysqli_stmt_execute($stmtNotif);
        mysqli_stmt_close($stmtNotif);
        
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully!',
            'avatar' => $avatarName ? './uploads/' . $avatarName : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Database update error: ' . mysqli_error($conn)]);
    }
    mysqli_stmt_close($stmt);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
exit;
?>
