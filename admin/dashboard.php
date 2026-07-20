<?php
$isSubfolder = true;
require_once(dirname(__DIR__) . '/includes/header.php');

// Enforce admin permission
if (!$user || $user['role'] !== 'admin') {
    header("Location: ../market.php");
    exit();
}

// Fetch Admin Stats
// 1. Total users
$resUsers = mysqli_query($conn, "SELECT COUNT(*) as count, SUM(available_balance) as balances FROM users");
$userData = mysqli_fetch_assoc($resUsers);
$totalUsers = $userData['count'] ?? 0;
$totalBalances = $userData['balances'] ?? 0;

// 2. Active stock holdings count
$resHold = mysqli_query($conn, "SELECT COUNT(*) as count FROM stock_details WHERE status = 1");
$holdData = mysqli_fetch_assoc($resHold);
$totalHoldings = $holdData['count'] ?? 0;

// 3. Transactions volume
$resTx = mysqli_query($conn, "SELECT COUNT(*) as count, SUM(credit) as creditTotal, SUM(debit) as debitTotal FROM users_transaction");
$txData = mysqli_fetch_assoc($resTx);
$totalTx = $txData['count'] ?? 0;
$creditVolume = $txData['creditTotal'] ?? 0;
$debitVolume = $txData['debitTotal'] ?? 0;
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h1 class="h3 fw-bold mb-1">Administrative Dashboard</h1>
        <p class="text-secondary mb-0 small">Platform-wide statistics and management logs</p>
    </div>
    
    <div class="d-flex gap-2">
        <a href="users.php" class="btn btn-sm btn-outline-primary" style="border-radius: 8px;"><i class="bi bi-people me-1"></i> Manage Users</a>
        <a href="settings.php" class="btn btn-sm btn-outline-secondary" style="border-radius: 8px;"><i class="bi bi-gear me-1"></i> Settings</a>
    </div>
</div>

<!-- Admin Stats Cards -->
<div class="row g-4 mb-4">
    <div class="col-md-6 col-lg-3">
        <div class="fin-card">
            <div class="card-title">Registered Accounts</div>
            <div class="card-value"><?= number_format($totalUsers) ?></div>
            <div class="text-secondary small mt-1">Platform user registrations</div>
        </div>
    </div>
    <div class="col-md-6 col-lg-3">
        <div class="fin-card">
            <div class="card-title">Cumulative User Funds</div>
            <div class="card-value">₹<?= number_format($totalBalances, 2) ?></div>
            <div class="text-secondary small mt-1">Total deposited available funds</div>
        </div>
    </div>
    <div class="col-md-6 col-lg-3">
        <div class="fin-card">
            <div class="card-title">Active holdings</div>
            <div class="card-value"><?= number_format($totalHoldings) ?> Shares</div>
            <div class="text-secondary small mt-1">Shares currently held by users</div>
        </div>
    </div>
    <div class="col-md-6 col-lg-3">
        <div class="fin-card">
            <div class="card-title">Total Trade volume</div>
            <div class="card-value"><?= number_format($totalTx) ?> txs</div>
            <div class="text-secondary small mt-1">Deposits & withdrawals logs count</div>
        </div>
    </div>
</div>

<div class="row g-4">
    <!-- User Registration Table -->
    <div class="col-lg-6">
        <div class="fin-card h-100">
            <h5 class="card-title mb-3">Recent User Signups</h5>
            <div class="table-responsive">
                <table class="fin-table" style="font-size: 0.85rem;">
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Email Address</th>
                            <th>Wallet Balance</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $resRecentUsers = mysqli_query($conn, "SELECT firstname, lastname, email, available_balance, role FROM users ORDER BY created_at DESC LIMIT 5");
                        if (mysqli_num_rows($resRecentUsers) > 0) {
                            while ($u = mysqli_fetch_assoc($resRecentUsers)) {
                                echo '<tr>';
                                echo '<td class="fw-bold text-white">' . htmlspecialchars($u['firstname'] . ' ' . $u['lastname']) . '</td>';
                                echo '<td>' . htmlspecialchars($u['email']) . '</td>';
                                echo '<td>₹' . number_format($u['available_balance'], 2) . '</td>';
                                echo '<td><span class="badge ' . ($u['role'] === 'admin' ? 'bg-danger' : 'bg-primary') . '">' . htmlspecialchars($u['role']) . '</span></td>';
                                echo '</tr>';
                            }
                        } else {
                            echo '<tr><td colspan="4" class="text-center text-secondary">No signups found.</td></tr>';
                        }
                        ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <!-- User Transactions Table -->
    <div class="col-lg-6">
        <div class="fin-card h-100">
            <h5 class="card-title mb-3">Global Transaction Log</h5>
            <div class="table-responsive">
                <table class="fin-table" style="font-size: 0.85rem;">
                    <thead>
                        <tr>
                            <th>Ref ID / Payment ID</th>
                            <th>Description</th>
                            <th>Credit / Debit</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $resRecentTx = mysqli_query($conn, "SELECT credit, debit, payment_id, description, payment_date FROM users_transaction ORDER BY payment_date DESC LIMIT 5");
                        if (mysqli_num_rows($resRecentTx) > 0) {
                            while ($tx = mysqli_fetch_assoc($resRecentTx)) {
                                $isCredit = $tx['credit'] > 0;
                                echo '<tr>';
                                echo '<td class="text-white fw-semibold">' . htmlspecialchars($tx['payment_id']) . '</td>';
                                echo '<td class="text-secondary">' . htmlspecialchars($tx['description']) . '</td>';
                                echo '<td class="' . ($isCredit ? 'text-up' : 'text-down') . '">';
                                echo $isCredit ? '+₹' . number_format($tx['credit'], 2) : '-₹' . number_format($tx['debit'], 2);
                                echo '</td>';
                                echo '<td>' . date('d M H:i', strtotime($tx['payment_date'])) . '</td>';
                                echo '</tr>';
                            }
                        } else {
                            echo '<tr><td colspan="4" class="text-center text-secondary">No transactions found.</td></tr>';
                        }
                        ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<?php include_once(dirname(__DIR__) . '/includes/footer.php'); ?>
