<?php
require("./mainTop.php");
require("./conn.php");

$database = array();
$sql = "SELECT * FROM `users` WHERE `id`= " . $_SESSION['user_id'];
$result = mysqli_query($conn, $sql);
while ($row = mysqli_fetch_assoc($result)) {
    $database[] = $row;
}
// echo $_SESSION['user_id'];
$dataTransaction = array();
$sqlTransaction = "SELECT * FROM `users_transaction` WHERE `user_id`= " . $_SESSION['user_id'];
$resultTransaction = mysqli_query($conn, $sqlTransaction);
while ($rowTransaction = mysqli_fetch_assoc($resultTransaction)) {
    $dataTransaction[] = $rowTransaction;
}

?>
<div class="content_transactionHistory">
    <h3>Available Balance = ₹ <?= $database[0]["available_balance"] ?></h3>
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

            foreach ($dataTransaction as $value) {
                $balance = 0;
                $balance = $balance + $value['credit'] - $value['debit'];

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