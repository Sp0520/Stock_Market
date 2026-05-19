<?php
require("./mainTop.php");

/* ================= GET EXCHANGE LIST ================= */

$json = file_get_contents("http://api.marketstack.com/v1/exchanges?access_key=51fcbd147239c10f7d16498134336532");

$data = json_decode($json, true);

sort($data["data"]);

?>

<div class="content">

<h2>Stock Tickers & Exchanges</h2>

<p>Search stock ticker symbols from exchanges supported by Marketstack API</p>

</div>


<div class="filter">

<form method="POST">

<div class="form_row">

<label>Stock Ticker</label>

<input type="search" name="ticker" placeholder="Example: TCS">

</div>


<div class="form_row">

<label>Stock Exchange</label>

<select name="exchanges">

<option value="XBOM">BSE (India)</option>

<option value="XNSE">NSE (India)</option>

</select>

</div>


<div class="form_row">

<input type="submit" name="btnSearchStock" value="Search Stock" class="btnSearchStock">

</div>

</form>

</div>


<div class="search">

<table>

<thead>

<tr>

<th>Symbol</th>

<th>Name</th>

<th>Exchange</th>

<th>Country</th>

</tr>

</thead>


<tbody>

<?php

/* ================= SEARCH STOCK ================= */

$exchange = "XBOM"; // default BSE

if(isset($_POST["btnSearchStock"]))
{
$exchange = $_POST["exchanges"];
}

$url = "http://api.marketstack.com/v1/exchanges/".$exchange."/tickers?access_key=51fcbd147239c10f7d16498134336532";

$response = file_get_contents($url);

$stock = json_decode($response,true);

$count = $stock["pagination"]["count"] ?? 0;


for($i=0; $i<$count; $i++)
{

$symbol = $stock["data"]["tickers"][$i]["symbol"];

$name = $stock["data"]["tickers"][$i]["name"];

$country = $stock["data"]["country"];

echo "<tr>";

echo "<td>
<a href='selectedStock.php?ticker=".$symbol."&days=15'>
".$symbol."
</a>
</td>";

echo "<td>".$name."</td>";

echo "<td>".$exchange."</td>";

echo "<td>".$country."</td>";

echo "</tr>";

}

?>

</tbody>

</table>

</div>


<div class="footer">

<p>© 2022 All Rights Reserved.</p>

</div>