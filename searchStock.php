<?php
require("./mainTop.php");

/* ================= GET EXCHANGE LIST ================= */
// Unused dynamic exchange list loading removed to optimize page load speeds and prevent crashes.
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

$response = @file_get_contents($url);

$stock = $response ? json_decode($response, true) : null;

if ($response === false || !$stock || !isset($stock["data"]["tickers"])) {
    echo "<tr><td colspan='4' style='text-align: center; color: #721c24;'>Search API is currently rate-limited or unavailable. Please try again later.</td></tr>";
} else {
    $count = $stock["pagination"]["count"] ?? 0;

    for($i=0; $i<$count; $i++)
    {
        $tickerData = $stock["data"]["tickers"][$i] ?? null;
        if (!$tickerData) continue;

        $symbol = $tickerData["symbol"] ?? '';
        $name = $tickerData["name"] ?? '';
        $country = $stock["data"]["country"] ?? 'India';

        echo "<tr>";
        echo "<td>
        <a href='selectedStock.php?ticker=".urlencode($symbol)."&days=15'>
        ".htmlspecialchars($symbol)."
        </a>
        </td>";
        echo "<td>".htmlspecialchars($name)."</td>";
        echo "<td>".htmlspecialchars($exchange)."</td>";
        echo "<td>".htmlspecialchars($country)."</td>";
        echo "</tr>";
    }
}
?>

</tbody>

</table>

</div>


<div class="footer">

<p>© 2022 All Rights Reserved.</p>

</div>