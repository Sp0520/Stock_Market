<?php
include_once(__DIR__ . '/includes/header.php');

$errorMsg = '';
$successMsg = '';

$userId = $_SESSION['user_id'];

// =========================================
// ORDER ROUTERS (Buy, Sell, Deposit, Withdraw)
// =========================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = isset($_POST['action']) ? $_POST['action'] : '';
    $csrf = isset($_POST['csrf_token']) ? $_POST['csrf_token'] : '';

    if (!validateCsrfToken($csrf)) {
        $errorMsg = 'CSRF validation failed.';
    } else {
        // 1. ADD FUNDS (Deposit Initiation)
        if ($action === 'deposit') {
            $amount = floatval($_POST['amount'] ?? 0);
            if ($amount <= 0) {
                $errorMsg = 'Please enter a valid amount to deposit.';
            } else {
                // Set amount cookie for Razorpay verification lookup
                setcookie('amount', $amount, time() + 600, '/');
                echo "<script>
                    window.location.href = './razorpay_api/pay.php';
                </script>";
                exit;
            }
        }
        
        // 2. WITHDRAW FUNDS
        elseif ($action === 'withdraw') {
            $amount = floatval($_POST['amount'] ?? 0);
            $ifsc = strtoupper(trim($_POST['ifsc'] ?? ''));
            $accNo = trim($_POST['accountNo'] ?? '');
            
            // Fetch available balance
            $stmt = mysqli_prepare($conn, "SELECT available_balance FROM users WHERE id = ?");
            mysqli_stmt_bind_param($stmt, "i", $userId);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_bind_result($stmt, $balance);
            mysqli_stmt_fetch($stmt);
            mysqli_stmt_close($stmt);
            
            if ($amount <= 0 || $amount > $balance) {
                $errorMsg = 'Insufficient balance or invalid amount.';
            } elseif (empty($accNo) || empty($ifsc)) {
                $errorMsg = 'Please provide complete bank details.';
            } else {
                // Process withdrawal
                mysqli_begin_transaction($conn);
                try {
                    // Deduct balance
                    $stmtDeduct = mysqli_prepare($conn, "UPDATE users SET available_balance = available_balance - ? WHERE id = ?");
                    mysqli_stmt_bind_param($stmtDeduct, "di", $amount, $userId);
                    mysqli_stmt_execute($stmtDeduct);
                    mysqli_stmt_close($stmtDeduct);
                    
                    // Log transaction
                    $stmtTx = mysqli_prepare($conn, "INSERT INTO users_transaction (debit, payment_id, description, user_id) VALUES (?, ?, 'withdrawal', ?)");
                    mysqli_stmt_bind_param($stmtTx, "dsi", $amount, $accNo, $userId);
                    mysqli_stmt_execute($stmtTx);
                    mysqli_stmt_close($stmtTx);
                    
                    // Log notification
                    $stmtNotif = mysqli_prepare($conn, "INSERT INTO notifications (user_id, title, message) VALUES (?, 'Withdrawal Request', ?)");
                    $notifMsg = "Withdrawal of ₹" . number_format($amount, 2) . " initiated to account " . substr($accNo, -4) . ".";
                    mysqli_stmt_bind_param($stmtNotif, "is", $userId, $notifMsg);
                    mysqli_stmt_execute($stmtNotif);
                    mysqli_stmt_close($stmtNotif);
                    
                    mysqli_commit($conn);
                    $successMsg = 'Withdrawal processed successfully!';
                } catch (Exception $e) {
                    mysqli_rollback($conn);
                    $errorMsg = 'Withdrawal failed: ' . $e->getMessage();
                }
            }
        }
        
        // 3. BUY STOCK ORDER
        elseif ($action === 'buy_stock') {
            $stockName = strtoupper(trim($_POST['stock_name'] ?? ''));
            $qty = intval($_POST['quantity'] ?? 0);
            $price = floatval($_POST['purchase_price'] ?? 0);
            
            if ($qty < 1 || $price <= 0 || empty($stockName)) {
                $errorMsg = 'Invalid stock order parameters.';
            } else {
                $subtotal = $price * $qty;
                $brokerage = max(20, $subtotal * 0.0005);
                $totalCost = $subtotal + $brokerage;
                
                // Fetch balance
                $stmt = mysqli_prepare($conn, "SELECT available_balance FROM users WHERE id = ?");
                mysqli_stmt_bind_param($stmt, "i", $userId);
                mysqli_stmt_execute($stmt);
                mysqli_stmt_bind_result($stmt, $balance);
                mysqli_stmt_fetch($stmt);
                mysqli_stmt_close($stmt);
                
                if ($balance < $totalCost) {
                    $errorMsg = 'Insufficient balance to place buy order (Cost: ₹' . number_format($totalCost, 2) . ').';
                } else {
                    mysqli_begin_transaction($conn);
                    try {
                        // Deduct balance
                        $stmtDeduct = mysqli_prepare($conn, "UPDATE users SET available_balance = available_balance - ? WHERE id = ?");
                        mysqli_stmt_bind_param($stmtDeduct, "di", $totalCost, $userId);
                        mysqli_stmt_execute($stmtDeduct);
                        mysqli_stmt_close($stmtDeduct);
                        
                        // Insert stock holdings rows (one row per share)
                        for ($i = 0; $i < $qty; $i++) {
                            $stmtHold = mysqli_prepare($conn, "INSERT INTO stock_details (stock_name, purchase_price, user_id, status) VALUES (?, ?, ?, 1)");
                            mysqli_stmt_bind_param($stmtHold, "sdi", $stockName, $price, $userId);
                            mysqli_stmt_execute($stmtHold);
                            mysqli_stmt_close($stmtHold);
                        }
                        
                        // Log transaction
                        $refId = 'trade_buy_' . time();
                        $stmtTx = mysqli_prepare($conn, "INSERT INTO users_transaction (debit, payment_id, description, user_id) VALUES (?, ?, ?, ?)");
                        $desc = "Bought $qty shares of $stockName";
                        mysqli_stmt_bind_param($stmtTx, "dssi", $totalCost, $refId, $desc, $userId);
                        mysqli_stmt_execute($stmtTx);
                        mysqli_stmt_close($stmtTx);
                        
                        // Log notification
                        $stmtNotif = mysqli_prepare($conn, "INSERT INTO notifications (user_id, title, message) VALUES (?, 'Order Executed', ?)");
                        $notifMsg = "Buy order of $qty shares of $stockName completed at ₹" . number_format($price, 2);
                        mysqli_stmt_bind_param($stmtNotif, "is", $userId, $notifMsg);
                        mysqli_stmt_execute($stmtNotif);
                        mysqli_stmt_close($stmtNotif);
                        
                        mysqli_commit($conn);
                        $successMsg = "Successfully purchased $qty shares of $stockName!";
                    } catch (Exception $e) {
                        mysqli_rollback($conn);
                        $errorMsg = 'Buy order execution failed: ' . $e->getMessage();
                    }
                }
            }
        }
        
        // 4. SELL STOCK ORDER
        elseif ($action === 'sell_stock') {
            $stockName = strtoupper(trim($_POST['stock_name'] ?? ''));
            $qty = intval($_POST['quantity'] ?? 0);
            $price = floatval($_POST['sell_price'] ?? 0);
            
            if ($qty < 1 || $price <= 0 || empty($stockName)) {
                $errorMsg = 'Invalid stock order parameters.';
            } else {
                // Find active holdings of this stock
                $holdings = [];
                $stmtHold = mysqli_prepare($conn, "SELECT id, purchase_price FROM stock_details WHERE stock_name = ? AND user_id = ? AND status = 1 ORDER BY purchase_date ASC LIMIT ?");
                mysqli_stmt_bind_param($stmtHold, "sii", $stockName, $userId, $qty);
                mysqli_stmt_execute($stmtHold);
                $res = mysqli_stmt_get_result($stmtHold);
                while ($row = mysqli_fetch_assoc($res)) {
                    $holdings[] = $row;
                }
                mysqli_stmt_close($stmtHold);
                
                if (count($holdings) < $qty) {
                    $errorMsg = 'You do not own enough active shares of ' . htmlspecialchars($stockName) . ' to sell.';
                } else {
                    $proceeds = $price * $qty;
                    $brokerage = max(20, $proceeds * 0.0005);
                    $netCredit = $proceeds - $brokerage;
                    
                    mysqli_begin_transaction($conn);
                    try {
                        // Add proceeds to balance
                        $stmtCredit = mysqli_prepare($conn, "UPDATE users SET available_balance = available_balance + ? WHERE id = ?");
                        mysqli_stmt_bind_param($stmtCredit, "di", $netCredit, $userId);
                        mysqli_stmt_execute($stmtCredit);
                        mysqli_stmt_close($stmtCredit);
                        
                        // Mark stock holdings as sold
                        foreach ($holdings as $holding) {
                            $stmtSell = mysqli_prepare($conn, "UPDATE stock_details SET status = 0, sell_price = ? WHERE id = ?");
                            mysqli_stmt_bind_param($stmtSell, "di", $price, $holding['id']);
                            mysqli_stmt_execute($stmtSell);
                            mysqli_stmt_close($stmtSell);
                        }
                        
                        // Log transaction
                        $refId = 'trade_sell_' . time();
                        $stmtTx = mysqli_prepare($conn, "INSERT INTO users_transaction (credit, payment_id, description, user_id) VALUES (?, ?, ?, ?)");
                        $desc = "Sold $qty shares of $stockName";
                        mysqli_stmt_bind_param($stmtTx, "dssi", $netCredit, $refId, $desc, $userId);
                        mysqli_stmt_execute($stmtTx);
                        mysqli_stmt_close($stmtTx);
                        
                        // Log notification
                        $stmtNotif = mysqli_prepare($conn, "INSERT INTO notifications (user_id, title, message) VALUES (?, 'Order Executed', ?)");
                        $notifMsg = "Sell order of $qty shares of $stockName completed at ₹" . number_format($price, 2);
                        mysqli_stmt_bind_param($stmtNotif, "is", $userId, $notifMsg);
                        mysqli_stmt_execute($stmtNotif);
                        mysqli_stmt_close($stmtNotif);
                        
                        mysqli_commit($conn);
                        $successMsg = "Successfully sold $qty shares of $stockName!";
                    } catch (Exception $e) {
                        mysqli_rollback($conn);
                        $errorMsg = 'Sell order execution failed: ' . $e->getMessage();
                    }
                }
            }
        }
    }
}

// =========================================
// FETCH USER DATA & PORTFOLIO HOLDINGS
// =========================================
$stmt = mysqli_prepare($conn, "SELECT available_balance FROM users WHERE id = ?");
mysqli_stmt_bind_param($stmt, "i", $userId);
mysqli_stmt_execute($stmt);
mysqli_stmt_bind_result($stmt, $balance);
mysqli_stmt_fetch($stmt);
mysqli_stmt_close($stmt);

$showSold = isset($_GET['sell']) && $_GET['sell'] === 'true';
$holdingsStatus = $showSold ? 0 : 1;

$holdings = [];
$stmtHold = mysqli_prepare($conn, "SELECT * FROM stock_details WHERE status = ? AND user_id = ? ORDER BY purchase_date DESC");
mysqli_stmt_bind_param($stmtHold, "ii", $holdingsStatus, $userId);
mysqli_stmt_execute($stmtHold);
$res = mysqli_stmt_get_result($stmtHold);
while ($row = mysqli_fetch_assoc($res)) {
    $holdings[] = $row;
}
mysqli_stmt_close($stmtHold);

// Calculate Portfolio Values
$totalInvestment = 0;
$totalCurrentValue = 0;
$allocationData = []; // Ticker => value

foreach ($holdings as $holding) {
    $totalInvestment += $holding['purchase_price'];
    
    if (!$showSold) {
        $ticker = $holding['stock_name'];
        $data = fetchStockData($ticker);
        
        $currentPrice = $holding['purchase_price']; // fallback
        if ($data && !isset($data['error'])) {
            $meta = $data['Meta Data'];
            $timeSeries = $data['Time Series (Daily)'];
            $lastRef = $meta['3. Last Refreshed'];
            if (!isset($timeSeries[$lastRef])) {
                $lastRef = array_key_first($timeSeries);
            }
            $currentPrice = (float)$timeSeries[$lastRef]['4. close'];
        }
        
        $totalCurrentValue += $currentPrice;
        $allocationData[$ticker] = ($allocationData[$ticker] ?? 0) + $currentPrice;
    } else {
        $totalCurrentValue += $holding['sell_price'];
    }
}

$overallReturn = $totalCurrentValue - $totalInvestment;
$overallReturnPct = $totalInvestment > 0 ? ($overallReturn / $totalInvestment) * 100 : 0;
$isUp = $overallReturn >= 0;
?>

<!-- Info Alerts -->
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

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h1 class="h3 fw-bold mb-1">My Portfolios</h1>
        <p class="text-secondary mb-0 small">Manage your assets, balances, and investments</p>
    </div>
</div>

<div class="row g-4 mb-4">
    <!-- Balance Card -->
    <div class="col-md-6 col-lg-3">
        <div class="fin-card">
            <div class="card-title">Available Balance</div>
            <div class="card-value">₹<span class="counter-animate" data-target="<?= $balance ?>" data-decimals="2">0.00</span></div>
            <div class="d-flex gap-2 mt-2">
                <button class="btn btn-sm btn-outline-primary" style="border-radius: 8px;" onclick="showModal('depositModal')">Add Funds</button>
                <button class="btn btn-sm btn-outline-secondary" style="border-radius: 8px;" onclick="showModal('withdrawModal')">Withdraw</button>
            </div>
        </div>
    </div>
    
    <!-- Total Investment Card -->
    <div class="col-md-6 col-lg-3">
        <div class="fin-card">
            <div class="card-title">Total Invested</div>
            <div class="card-value">₹<?= number_format($totalInvestment, 2) ?></div>
            <div class="text-secondary small mt-1">Capital deployed in assets</div>
        </div>
    </div>
    
    <!-- Current Holdings Value Card -->
    <div class="col-md-6 col-lg-3">
        <div class="fin-card">
            <div class="card-title"><?= $showSold ? 'Total Sold Value' : 'Current Value' ?></div>
            <div class="card-value">₹<?= number_format($totalCurrentValue, 2) ?></div>
            <div class="text-secondary small mt-1">Valuation at active prices</div>
        </div>
    </div>
    
    <!-- Profit/Loss returns card -->
    <div class="col-md-6 col-lg-3">
        <div class="fin-card">
            <div class="card-title">Overall Returns</div>
            <div class="card-value <?= $isUp ? 'text-up' : 'text-down' ?>">
                ₹<?= number_format($overallReturn, 2) ?>
            </div>
            <span class="<?= $isUp ? 'badge-up' : 'badge-down' ?>">
                <?= $isUp ? '+' : '' ?><?= number_format($overallReturnPct, 2) ?>%
            </span>
        </div>
    </div>
</div>

<div class="row g-4 mb-4">
    <!-- Allocation Chart -->
    <div class="col-lg-4">
        <div class="fin-card h-100">
            <h5 class="card-title">Asset Allocation</h5>
            <?php if (empty($allocationData)): ?>
                <div class="text-center py-5 text-secondary">
                    <i class="bi bi-pie-chart" style="font-size: 3rem; display:block; margin-bottom:10px;"></i>
                    No active holdings to chart.
                </div>
            <?php else: ?>
                <div style="max-height: 240px; margin-top:20px;">
                    <canvas id="allocationChart"></canvas>
                </div>
            <?php endif; ?>
        </div>
    </div>
    
    <!-- Holdings / Sold Tickers List -->
    <div class="col-lg-8">
        <div class="fin-card h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="card-title m-0"><?= $showSold ? 'Sold Transactions' : 'Current Holdings' ?></h5>
                <a href="portfolios.php<?= $showSold ? '' : '?sell=true' ?>" class="btn btn-sm btn-outline-primary" style="border-radius: 8px;">
                    <?= $showSold ? 'Show Holdings' : 'Show Sold History' ?>
                </a>
            </div>
            
            <div class="table-responsive">
                <table class="fin-table">
                    <thead>
                        <tr>
                            <th>Ticker</th>
                            <th>Purchase Price</th>
                            <th><?= $showSold ? 'Sold Price' : 'Current Price' ?></th>
                            <th>Profit / Loss</th>
                            <th>Purchase Date</th>
                            <?php if (!$showSold): ?>
                                <th class="text-end">Actions</th>
                            <?php endif; ?>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($holdings)): ?>
                            <tr>
                                <td colspan="<?= $showSold ? '5' : '6' ?>" class="text-center py-4 text-secondary">
                                    No records found in this segment.
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($holdings as $value): ?>
                                <?php
                                $price = $value['purchase_price']; // fallback
                                if (!$showSold) {
                                    $data = fetchStockData($value['stock_name']);
                                    if ($data && !isset($data['error'])) {
                                        $meta = $data['Meta Data'];
                                        $timeSeries = $data['Time Series (Daily)'];
                                        $lastRef = $meta['3. Last Refreshed'];
                                        if (!isset($timeSeries[$lastRef])) {
                                            $lastRef = array_key_first($timeSeries);
                                        }
                                        $price = (float)$timeSeries[$lastRef]['4. close'];
                                    }
                                } else {
                                    $price = $value['sell_price'];
                                }
                                
                                $pl = $price - $value['purchase_price'];
                                $isPlUp = $pl >= 0;
                                ?>
                                <tr>
                                    <td><a href="selectedStock.php?ticker=<?= $value['stock_name'] ?>" class="text-white fw-bold text-decoration-none hover-blue"><?= htmlspecialchars($value['stock_name']) ?></a></td>
                                    <td>₹<?= number_format($value['purchase_price'], 2) ?></td>
                                    <td>₹<?= number_format($price, 2) ?></td>
                                    <td class="<?= $isPlUp ? 'text-up' : 'text-down' ?>">
                                        <?= $isPlUp ? '+' : '' ?>₹<?= number_format($pl, 2) ?>
                                    </td>
                                    <td><?= date('d M Y, h:i A', strtotime($value['purchase_date'])) ?></td>
                                    <?php if (!$showSold): ?>
                                        <td class="text-end">
                                            <!-- Sell Form Action Button -->
                                            <form action="" method="post" style="display:inline;" onsubmit="return confirm('Confirm selling 1 share of <?= $value['stock_name'] ?>?')">
                                                <?= getCsrfInput() ?>
                                                <input type="hidden" name="action" value="sell_stock">
                                                <input type="hidden" name="stock_name" value="<?= htmlspecialchars($value['stock_name']) ?>">
                                                <input type="hidden" name="quantity" value="1">
                                                <input type="hidden" name="sell_price" value="<?= $price ?>">
                                                <button type="submit" class="btn btn-sm btn-sell py-1 px-3" style="width: auto; font-size:0.75rem; border-radius:6px;">SELL</button>
                                            </form>
                                        </td>
                                    <?php endif; ?>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- =========================================
  MODAL DIALOGS (Deposit, Withdraw)
========================================= -->
<!-- Deposit Modal -->
<div class="modal fade" id="depositModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-panel" style="background-color: var(--bg-card); color: var(--text-primary);">
            <div class="modal-header border-bottom border-secondary">
                <h5 class="modal-title fw-bold">Deposit Funds</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="" method="post">
                <?= getCsrfInput() ?>
                <input type="hidden" name="action" value="deposit">
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="depositAmount" class="text-secondary small fw-semibold mb-2">Amount to Add (INR)</label>
                        <input type="number" class="form-control bg-transparent text-white border-secondary" id="depositAmount" name="amount" min="1" placeholder="Enter Amount" required style="border-radius: var(--border-radius);">
                    </div>
                    <p class="small text-secondary mb-0">Payments are processed securely via Razorpay payment gateway.</p>
                </div>
                <div class="modal-footer border-top border-secondary">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary-custom">Proceed to Pay</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Withdraw Modal -->
<div class="modal fade" id="withdrawModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-panel" style="background-color: var(--bg-card); color: var(--text-primary);">
            <div class="modal-header border-bottom border-secondary">
                <h5 class="modal-title fw-bold">Withdraw Funds</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="" method="post">
                <?= getCsrfInput() ?>
                <input type="hidden" name="action" value="withdraw">
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="withdrawAmount" class="text-secondary small fw-semibold mb-2">Amount to Withdraw</label>
                        <input type="number" class="form-control bg-transparent text-white border-secondary" id="withdrawAmount" name="amount" min="1" max="<?= $balance ?>" placeholder="Enter Amount" required style="border-radius: var(--border-radius);">
                    </div>
                    <div class="mb-3">
                        <label for="accountNo" class="text-secondary small fw-semibold mb-2">Bank Account Number</label>
                        <input type="text" class="form-control bg-transparent text-white border-secondary" id="accountNo" name="accountNo" placeholder="Enter Account Number" required style="border-radius: var(--border-radius);">
                    </div>
                    <div class="mb-3">
                        <label for="ifsc" class="text-secondary small fw-semibold mb-2">IFSC Code</label>
                        <div class="input-group">
                            <input type="text" class="form-control bg-transparent text-white border-secondary" id="ifsc" name="ifsc" placeholder="IFSC" required style="border-radius: var(--border-radius); text-transform: uppercase;" oninput="validateIFSC(this)">
                            <span class="input-group-text bg-transparent border-secondary text-secondary" id="ifsc-status">
                                <i class="bi bi-question-circle"></i>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-top border-secondary">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-sell">Withdraw Funds</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- allocation chart script -->
<?php if (!empty($allocationData)): ?>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", () => {
        const ctx = document.getElementById('allocationChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: <?= json_encode(array_keys($allocationData)) ?>,
                datasets: [{
                    data: <?= json_encode(array_values($allocationData)) ?>,
                    backgroundColor: ['#2962FF', '#00C853', '#FF3D57', '#FFD600', '#AA00FF', '#00E5FF'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#9CA3AF',
                            font: { family: 'Outfit', size: 11 }
                        }
                    }
                }
            }
        });
    });
</script>
<?php endif; ?>

<script>
    function showModal(id) {
        const modal = new bootstrap.Modal(document.getElementById(id));
        modal.show();
    }
    
    function validateIFSC(input) {
        const code = input.value.toUpperCase().trim();
        const statusSpan = document.getElementById("ifsc-status");
        
        if (code.length === 11) {
            statusSpan.innerHTML = '<i class="bi bi-hourglass-split text-warning"></i>';
            $.ajax({
                url: "https://ifsc.razorpay.com/" + encodeURIComponent(code),
                success: function() {
                    statusSpan.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i>';
                },
                error: function() {
                    statusSpan.innerHTML = '<i class="bi bi-x-circle-fill text-danger"></i>';
                }
            });
        } else {
            statusSpan.innerHTML = '<i class="bi bi-question-circle text-secondary"></i>';
        }
    }
</script>

<?php include_once(__DIR__ . '/includes/footer.php'); ?>