<?php
$currentPage = basename($_SERVER['PHP_SELF']);
$userAvatar = !empty($user['profile_picture']) ? $basePath . 'uploads/' . htmlspecialchars($user['profile_picture']) : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
?>
<aside class="sidebar" id="sidebar">
    <a href="<?= $basePath ?>market.php" class="logo-area">
        <img src="<?= $basePath ?>assets/logo.png" alt="Fintech Logo" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3594/3594449.png'">
        <span>BullVest</span>
    </a>
    
    <ul class="nav-links">
        <li class="<?= $currentPage === 'market.php' ? 'active' : '' ?>">
            <a href="<?= $basePath ?>market.php">
                <i class="bi bi-house-door"></i>
                <span>Market Dashboard</span>
            </a>
        </li>
        <li class="<?= $currentPage === 'portfolios.php' ? 'active' : '' ?>">
            <a href="<?= $basePath ?>portfolios.php">
                <i class="bi bi-wallet2"></i>
                <span>Portfolios</span>
            </a>
        </li>
        <li class="<?= $currentPage === 'searchStock.php' ? 'active' : '' ?>">
            <a href="<?= $basePath ?>searchStock.php">
                <i class="bi bi-search"></i>
                <span>Stock Search</span>
            </a>
        </li>
        <li class="<?= $currentPage === 'watchlist.php' ? 'active' : '' ?>">
            <a href="<?= $basePath ?>watchlist.php">
                <i class="bi bi-bookmark-star"></i>
                <span>Watchlists</span>
            </a>
        </li>
        <li class="<?= $currentPage === 'profile.php' ? 'active' : '' ?>">
            <a href="<?= $basePath ?>profile.php">
                <i class="bi bi-person"></i>
                <span>My Profile</span>
            </a>
        </li>
        
        <?php if ($user && $user['role'] === 'admin'): ?>
            <li class="mt-4 mb-1 text-muted text-uppercase fw-bold" style="font-size: 0.75rem; padding-left: 16px;">
                <span>Admin Settings</span>
            </li>
            <li class="<?= strpos($_SERVER['PHP_SELF'], '/admin/') !== false ? 'active' : '' ?>">
                <a href="<?= $basePath ?>admin/dashboard.php">
                    <i class="bi bi-speedometer2"></i>
                    <span>Admin Panel</span>
                </a>
            </li>
        <?php endif; ?>
    </ul>
    
    <!-- User profile widget -->
    <div class="user-profile-widget mt-auto">
        <a href="<?= $basePath ?>profile.php" class="d-flex align-items-center gap-2 text-decoration-none">
            <img src="<?= $userAvatar ?>" alt="User Avatar">
            <div class="user-info text-truncate" style="max-width: 140px;">
                <span class="name"><?= htmlspecialchars($user['firstname'] . ' ' . $user['lastname']) ?></span>
                <span class="role text-capitalize"><?= htmlspecialchars($user['role']) ?></span>
            </div>
        </a>
        <a href="<?= $basePath ?>signOut.php" class="ms-auto text-danger" title="Sign Out">
            <i class="bi bi-box-arrow-right" style="font-size: 1.2rem;"></i>
        </a>
    </div>
</aside>
