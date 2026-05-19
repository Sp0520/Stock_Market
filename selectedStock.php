<?php
include("./mainTop.php");
require("./conn.php");

$database = [];

$sql = "SELECT * FROM users WHERE id=" . $_SESSION['user_id'];
$result = mysqli_query($conn, $sql);

while ($row = mysqli_fetch_assoc($result)) {
    $database[] = $row;
}

$ticker = strtoupper(explode(".", $_GET["ticker"] ?? "TCS")[0]);

$apiKey = "1DBYP9NP4ZDVPWI6";

$url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={$ticker}.BSE&outputsize=compact&apikey={$apiKey}";

$json = @file_get_contents($url);

if ($json === false) {
    echo "<h3>Unable to connect to stock server.</h3>";
    return;
}

$data = json_decode($json, true);

if (!isset($data['Meta Data']) || !isset($data['Time Series (Daily)'])) {
    echo "<h3>Stock data unavailable (API limit reached or invalid symbol).</h3>";
    return;
}

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

$days = $_GET["days"] ?? 15;
?>

<head>
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.0/dist/chart.min.js"></script>
</head>


<div class="content_selectedStock">

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

$sqlupdate = "UPDATE users SET available_balance = available_balance - {$currentPrice} WHERE id=" . $_SESSION['user_id'];

$result = mysqli_query($conn,$sqlupdate);

if ($result) {

$sqlInsert = "INSERT INTO stock_details (stock_name,purchase_price,user_id,status)

VALUES('$ticker','$currentPrice','".$_SESSION['user_id']."',1)";

$result = mysqli_query($conn,$sqlInsert);

if ($result) {

echo "<script>alert('Transaction Successful')</script>";

header("Location: portfolios.php");

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