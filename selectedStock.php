<?php
include("./mainTop.php");
require("./conn.php");

$database = [];

$stmt = mysqli_prepare($conn, "SELECT * FROM users WHERE id = ?");
mysqli_stmt_bind_param($stmt, "i", $_SESSION['user_id']);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

while ($row = mysqli_fetch_assoc($result)) {
    $database[] = $row;
}
mysqli_stmt_close($stmt);

$ticker = strtoupper(explode(".", $_GET["ticker"] ?? "TCS")[0]);

$apiKey = "1DBYP9NP4ZDVPWI6";

$url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={$ticker}.BSE&outputsize=compact&apikey={$apiKey}";

$json = @file_get_contents($url);

$data = $json ? json_decode($json, true) : null;
$hasData = ($json !== false && isset($data['Meta Data'], $data['Time Series (Daily)']));

if ($hasData) {
    $meta = $data['Meta Data'];
    $timeSeries = $data['Time Series (Daily)'];

    $lastRefreshed = $meta["3. Last Refreshed"];

    if (!isset($timeSeries[$lastRefreshed])) {
        $lastRefreshed = array_key_first($timeSeries);
    }

    $currentPrice = $timeSeries[$lastRefreshed]["4. close"];

    $dailyData = [];
    $dailyDate = [];

    foreach ($timeSeries as $date => $values) {
        $dailyData[] = $values["4. close"];
        $dailyDate[] = $date;
    }

    $dailyDataClose = array_reverse($dailyData);
    $dailyDateClose = array_reverse($dailyDate);
} else {
    $lastRefreshed = date("Y-m-d");
    $currentPrice = 0.00;
    $dailyDataClose = [];
    $dailyDateClose = [];
}

$days = $_GET["days"] ?? 15;
?>

<head>
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.0/dist/chart.min.js"></script>
</head>


<div class="content_selectedStock">

<?php if (!$hasData): ?>
    <div style="background: rgba(220,53,69,0.1); border: 1px solid rgba(220,53,69,0.2); padding: 30px; border-radius: 8px; text-align: center; width: 100%; margin: 20px auto; max-width: 600px; color: #721c24; font-family: sans-serif;">
        <h3 style="margin-bottom: 10px;">Stock Data Unavailable</h3>
        <p>We are unable to load data for ticker <strong><?= htmlspecialchars($ticker) ?></strong> at this time. This may be due to an invalid symbol, network issues, or AlphaVantage API rate limits (5 requests/minute).</p>
        <a href="market.php" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #02283e; color: #fff; text-decoration: none; border-radius: 4px;">Return to Market</a>
    </div>
<?php else: ?>

<div class="data_sell">

<div class="stock_data">
<h2><?= $ticker ?></h2>

<span>₹ <?= sprintf('%0.2f', round($currentPrice,2)) ?></span>

<p>Last Refreshed : <?= $lastRefreshed ?></p>
</div>


<div class="btnBuyDiv">
<form method="post">
<input type="submit" value="BUY" name="btnBuy" class="btnBuy">
</form>
</div>


<?php

if (isset($_POST["btnBuy"])) {

if ($database[0]["available_balance"] < $currentPrice) {

echo "<script>alert('Insufficient Balance')</script>";

} else {

$stmt = mysqli_prepare($conn, "UPDATE users SET available_balance = available_balance - ? WHERE id = ?");
mysqli_stmt_bind_param($stmt, "di", $currentPrice, $_SESSION['user_id']);
$result = mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

if ($result) {

$stmt = mysqli_prepare($conn, "INSERT INTO stock_details (stock_name, purchase_price, user_id, status) VALUES (?, ?, ?, ?)");
$status = 1;
mysqli_stmt_bind_param($stmt, "sdii", $ticker, $currentPrice, $_SESSION['user_id'], $status);
$result = mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

if ($result) {
echo "<script>
    alert('Transaction Successful');
    window.location.href = 'portfolios.php';
</script>";
exit();
} else {

echo "<script>alert('Insert Failed')</script>";

}

} else {

echo "<script>alert('Balance Update Failed')</script>";

}

}

}

?>

</div>


<div class="content_">

<div class="btn">

<a href="?ticker=<?= $ticker ?>&days=15">15 Days</a>

<a href="?ticker=<?= $ticker ?>&days=30">30 Days</a>

<a href="?ticker=<?= $ticker ?>&days=90">90 Days</a>

<a href="?ticker=<?= $ticker ?>&days=180">6 Months</a>

<a href="?ticker=<?= $ticker ?>&days=360">1 Year</a>

<a href="?ticker=<?= $ticker ?>&days=all">All Data</a>

</div>


<div class="chart">

<canvas id="myChart"></canvas>

</div>

</div>
<?php endif; ?>
</div>


<script>

let labels =
<?php

if($days=='all')

echo json_encode($dailyDateClose);

else

echo json_encode(array_slice($dailyDateClose,-$days));

?>;


let values =
<?php

if($days=='all')

echo json_encode($dailyDataClose);

else

echo json_encode(array_slice($dailyDataClose,-$days));

?>;


new Chart(document.getElementById('myChart'),{

type:'line',

data:{

labels:labels,

datasets:[{

label:'Stock Price (INR)',

data:values,

borderColor:'#02283e',

backgroundColor:'rgb(0,99,132)',

borderWidth:2

}]

}

});

</script>