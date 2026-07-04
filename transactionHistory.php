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
// echo $_SESSION['user_id'];
$dataTransaction = array();
$stmt = mysqli_prepare($conn, "SELECT * FROM `users_transaction` WHERE `user_id` = ?");
mysqli_stmt_bind_param($stmt, "i", $_SESSION['user_id']);
mysqli_stmt_execute($stmt);
$resultTransaction = mysqli_stmt_get_result($stmt);
while ($rowTransaction = mysqli_fetch_assoc($resultTransaction)) {
    $dataTransaction[] = $rowTransaction;
}
mysqli_stmt_close($stmt);

?>
<div class="content_transactionHistory">
    <?php
    $balance = (!empty($database) && isset($database[0]["available_balance"])) 
        ? htmlspecialchars($database[0]["available_balance"], ENT_QUOTES, 'UTF-8')
        : 0;
    ?>
    <h3>Available Balance = ₹ <?= $balance ?></h3>
    <table>
        <thead>
            <tr>
                <th>
                    <p>Date</p>
                </th>
                <th>
                    <p>Debit (₹)</p>
                </th>
                <th>
                    <p>Credit (₹)</p>
                </th>
                <th>
                    <p>Balance (₹)</p>
                </th>
            </tr>
        </thead>
        <tbody>

            <?php
            // $balance = $balance + $value['credit'] - $value['debit'];

            $balance = 0;
            foreach ($dataTransaction as $value) {
                $balance = $balance + (float)$value['credit'] - (float)$value['debit'];

                echo  "<tr>";
                echo "<td><p>" . $value['payment_date'] . "</p></td>";
                echo "<td><p>" . $value['debit'] . "</p></td>";
                echo "<td><p>" . $value['credit'] . "</p></td>";
                echo "<td><p>" . $balance . "</p></td>";
                echo  "</tr>";
            }
            ?>
    </table>
</div>
</div>
</body>

</html>