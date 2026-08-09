<?php
require("./mainTop.php");
require("./conn.php");

$database = array();
$stmt = mysqli_prepare($conn, "SELECT * FROM `users` WHERE `id` = ?");
mysqli_stmt_bind_param($stmt, "i", $_SESSION['user_id']);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
while ($row = mysqli_fetch_assoc($result)) {
    $database[] = $row;
}
mysqli_stmt_close($stmt);

$dataTransaction = array();
$stmt = mysqli_prepare($conn, "SELECT * FROM `users_transaction` WHERE `user_id` = ? ORDER BY `payment_date` DESC");
mysqli_stmt_bind_param($stmt, "i", $_SESSION['user_id']);
mysqli_stmt_execute($stmt);
$resultTransaction = mysqli_stmt_get_result($stmt);
while ($rowTransaction = mysqli_fetch_assoc($resultTransaction)) {
    $dataTransaction[] = $rowTransaction;
}
mysqli_stmt_close($stmt);
?>

<div class="content_transactionHistory" style="max-width: 1200px; margin: 40px auto; padding: 40px;">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; margin-bottom: 30px; flex-wrap: wrap; gap: 15px;">
        <div>
            <h2 style="color: var(--text-primary); font-size: 1.75rem; font-weight: 700; margin: 0;">Transaction History</h2>
            <p style="color: var(--text-secondary); margin-top: 5px; font-size: 0.95rem;">Review all historical deposits, withdrawals, buys, and sells.</p>
        </div>
        
        <div class="card-premium" style="padding: 15px 30px; border-radius: 12px; margin: 0;">
            <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; display: block;">Available Balance</span>
            <span style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">₹ <?= number_format($database[0]["available_balance"] ?? 0, 2) ?></span>
        </div>
    </div>

    <table style="width: 100%;">
        <thead>
            <tr>
                <th>Date & Time</th>
                <th>Transaction ID / ID</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
            </tr>
        </thead>
        <tbody>
            <?php
            if (!empty($dataTransaction)) {
                foreach ($dataTransaction as $value) {
                    $debit = floatval($value['debit']);
                    $credit = floatval($value['credit']);
                    
                    echo "<tr>";
                    echo "<td style='color: var(--text-secondary); font-size: 0.9rem;'>" . htmlspecialchars($value['payment_date']) . "</td>";
                    echo "<td style='color: var(--text-muted); font-size: 0.85rem; font-family: monospace !important;'>" . htmlspecialchars($value['payment_id']) . "</td>";
                    echo "<td style='font-weight: 500; color: var(--text-primary);'>" . htmlspecialchars($value['description']) . "</td>";
                    
                    if ($debit > 0) {
                        echo "<td><span class='stock-down' style='font-size: 0.85rem;'>- ₹ " . number_format($debit, 2) . "</span></td>";
                    } else {
                        echo "<td style='color: var(--text-muted);'>—</td>";
                    }
                    
                    if ($credit > 0) {
                        echo "<td><span class='stock-up' style='font-size: 0.85rem;'>+ ₹ " . number_format($credit, 2) . "</span></td>";
                    } else {
                        echo "<td style='color: var(--text-muted);'>—</td>";
                    }
                    
                    echo "</tr>";
                }
            } else {
                echo "<tr><td colspan='5' style='text-align: center; color: var(--text-muted); padding: 30px;'>No transactions recorded on this account.</td></tr>";
            }
            ?>
        </tbody>
    </table>
</div>

<?php
require("./bottom.php");
?>