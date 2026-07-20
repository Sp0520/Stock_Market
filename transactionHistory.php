<?php
include_once(__DIR__ . '/includes/header.php');

$userId = $_SESSION['user_id'];
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h1 class="h3 fw-bold mb-1">Transaction History</h1>
        <p class="text-secondary mb-0 small">Audit ledger of deposits, withdrawals, and stock trades</p>
    </div>
    <a href="portfolios.php" class="btn btn-sm btn-outline-secondary" style="border-radius: 8px;"><i class="bi bi-arrow-left me-1"></i> Return to Portfolio</a>
</div>

<div class="fin-card">
    <h5 class="card-title mb-3">All Account Activity</h5>
    <div class="table-responsive">
        <table class="fin-table">
            <thead>
                <tr>
                    <th>Reference / Payment ID</th>
                    <th>Description</th>
                    <th>Credit (+)</th>
                    <th>Debit (-)</th>
                    <th>Date & Time</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $stmt = mysqli_prepare($conn, "SELECT * FROM `users_transaction` WHERE `user_id` = ? ORDER BY `payment_date` DESC");
                if ($stmt) {
                    mysqli_stmt_bind_param($stmt, "i", $userId);
                    mysqli_stmt_execute($stmt);
                    $result = mysqli_stmt_get_result($stmt);
                    
                    if (mysqli_num_rows($result) > 0) {
                        while ($row = mysqli_fetch_assoc($result)) {
                            $credit = $row['credit'];
                            $debit = $row['debit'];
                            
                            echo '<tr>';
                            echo '<td class="fw-semibold text-white">' . htmlspecialchars($row['payment_id']) . '</td>';
                            echo '<td class="text-secondary">' . htmlspecialchars($row['description']) . '</td>';
                            echo '<td class="fw-bold ' . ($credit > 0 ? 'text-up' : '') . '">' . ($credit > 0 ? '₹' . number_format($credit, 2) : '-') . '</td>';
                            echo '<td class="fw-bold ' . ($debit > 0 ? 'text-down' : '') . '">' . ($debit > 0 ? '₹' . number_format($debit, 2) : '-') . '</td>';
                            echo '<td class="text-secondary small">' . date('d M Y, h:i A', strtotime($row['payment_date'])) . '</td>';
                            echo '</tr>';
                        }
                    } else {
                        echo '<tr><td colspan="5" class="text-center py-5 text-secondary"><i class="bi bi-receipt" style="font-size: 2.5rem; display:block; margin-bottom:12px;"></i>No transaction logs found for this account.</td></tr>';
                    }
                    mysqli_stmt_close($stmt);
                } else {
                    echo '<tr><td colspan="5" class="text-center text-danger">Database error fetching transactions.</td></tr>';
                }
                ?>
            </tbody>
        </table>
    </div>
</div>

<?php include_once(__DIR__ . '/includes/footer.php'); ?>