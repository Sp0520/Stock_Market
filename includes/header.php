<?php
require_once(dirname(__DIR__) . '/config/conn.php');

$basePath = (isset($isSubfolder) && $isSubfolder) ? '../' : './';

// Force redirect to login if not logged in and not on authentication pages
$currentPage = basename($_SERVER['PHP_SELF']);
$authPages = ['index.php', 'signup.php', 'forgot_pass.php', 'reset.php'];

if (!isset($_SESSION['user_id']) && !in_array($currentPage, $authPages)) {
    header("Location: " . $basePath . "index.php");
    exit();
}

$user = null;
if (isset($_SESSION['user_id'])) {
    $stmt = mysqli_prepare($conn, "SELECT * FROM `users` WHERE `id` = ?");
    mysqli_stmt_bind_param($stmt, "i", $_SESSION['user_id']);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $user = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);
}

// Fetch unread notifications count
$unreadNotifications = 0;
if ($user) {
    $stmt = mysqli_prepare($conn, "SELECT COUNT(*) as count FROM `notifications` WHERE `user_id` = ? AND `is_read` = 0");
    mysqli_stmt_bind_param($stmt, "i", $user['id']);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($res);
    $unreadNotifications = $row['count'] ?? 0;
    mysqli_stmt_close($stmt);
}
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BullVest Trading Platform</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css" rel="stylesheet">
    <!-- Custom Theme Styling -->
    <link rel="stylesheet" href="<?= $basePath ?>assets/css/custom.css">
    
    <!-- jQuery (Loaded early to support inline page scripts) -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    
    <script>
        // Apply theme early to prevent background flash
        const savedTheme = localStorage.getItem("theme") || "dark";
        document.documentElement.setAttribute("data-theme", savedTheme);
    </script>
</head>
<body>
    <div class="app-container">
        <?php if (!in_array($currentPage, $authPages)): ?>
            <!-- Sidebar Panel Include -->
            <?php include_once(dirname(__DIR__) . '/includes/sidebar.php'); ?>
            
            <!-- Header Panel -->
            <header class="top-navbar">
                <div class="d-flex align-items-center gap-3">
                    <button class="action-btn toggle-sidebar-btn" id="sidebar-toggle" style="display: none;">
                        <i class="bi bi-list"></i>
                    </button>
                    <!-- Global Search Bar with suggestions -->
                    <div class="search-bar">
                        <i class="bi bi-search"></i>
                        <input type="text" class="autocomplete-search" placeholder="Search Company, Ticker (e.g. TCS)...">
                    </div>
                </div>
                
                <div class="nav-actions">
                    <!-- Theme Toggle -->
                    <button class="action-btn" id="theme-toggle" title="Toggle Theme">
                        <i class="bi bi-sun-fill"></i>
                    </button>
                    
                    <!-- Notification Bell Dropdown -->
                    <div class="dropdown">
                        <button class="action-btn position-relative dropbtn" id="notification-btn" title="Notifications">
                            <i class="bi bi-bell"></i>
                            <?php if ($unreadNotifications > 0): ?>
                                <span class="badge-dot"></span>
                            <?php endif; ?>
                        </button>
                        <div class="dropdown_content notification-dropdown" style="right: 0;">
                            <div class="dropdown-header d-flex justify-content-between align-items-center">
                                <span>Notifications</span>
                                <?php if ($unreadNotifications > 0): ?>
                                    <button class="btn btn-sm btn-link text-decoration-none" onclick="markAllNotificationsRead()" style="font-size: 0.75rem;">Clear All</button>
                                <?php endif; ?>
                            </div>
                            <div class="notifications-list" style="max-height: 250px; overflow-y: auto;">
                                <?php
                                $stmt = mysqli_prepare($conn, "SELECT * FROM `notifications` WHERE `user_id` = ? ORDER BY `created_at` DESC LIMIT 4");
                                mysqli_stmt_bind_param($stmt, "i", $user['id']);
                                mysqli_stmt_execute($stmt);
                                $res = mysqli_stmt_get_result($stmt);
                                if (mysqli_num_rows($res) > 0) {
                                    while ($n = mysqli_fetch_assoc($res)) {
                                        $unreadClass = $n['is_read'] == 0 ? 'style="background: rgba(41, 98, 255, 0.05);"' : '';
                                        echo '<div class="notification-item" ' . $unreadClass . '>';
                                        echo '<div class="title">' . htmlspecialchars($n['title']) . '</div>';
                                        echo '<div class="desc">' . htmlspecialchars($n['message']) . '</div>';
                                        echo '</div>';
                                    }
                                } else {
                                    echo '<div style="padding: 20px; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">No new notifications</div>';
                                }
                                mysqli_stmt_close($stmt);
                                ?>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            <main class="main-wrapper">
        <?php endif; ?>
