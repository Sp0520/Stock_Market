<?php
require("./mainTop.php");

?>
<div class="content_market">
    <div class="filter">
        <form method="post">
            <div class="form_row">
                <label for="tickers">Search Stock</label>
                <input type="search" name="ticker" id="ticker" placeholder="Example: TCS">
            </div>
            <div class="form_row">
                <input type="submit" value="Get Stock" class="btnGetStockDetails" name="btnGetStockDetails">
            </div>
        </form>
    </div>



    <table>
        <thead>
            <tr>
                <th>
                    <p>Stock Ticker</p>
                </th>
                <th>
                    <p>Last Refreshed</p>
                </th>
                <th>
                    <p>Open</p>
                </th>
                <th>
                    <p>High</p>
                </th>
                <th>
                    <p>Low</p>
                </th>
                <th>
                    <p>Close</p>
                </th>
                <th>
                    <p>Volume</p>
                </th>
            </tr>
        </thead>
        <tbody>
            <?php

            function renderStockRow($data)
            {
                if (empty($data) || !is_array($data) || !isset($data['Meta Data'], $data['Time Series (Daily)'])) {
                    echo "<tr><td colspan='7'>Error: no valid data returned by the API (possible limit or network issue).</td></tr>";
                    return;
                }

                $meta = $data['Meta Data'];
                $timeSeries = $data['Time Series (Daily)'];

                if (!isset($meta['2. Symbol'], $meta['3. Last Refreshed'])) {
                    echo "<tr><td colspan='7'>Error: invalid API response structure.</td></tr>";
                    return;
                }

                $ticker = htmlspecialchars($meta['2. Symbol']);
                $lastRefreshed = $meta['3. Last Refreshed'];

                if (!isset($timeSeries[$lastRefreshed])) {
                    $lastRefreshed = array_key_first($timeSeries);
                }

                if (!isset($timeSeries[$lastRefreshed])) {
                    echo "<tr><td colspan='7'>Error: no time-series data for last refresh.</td></tr>";
                    return;
                }

                $row = $timeSeries[$lastRefreshed];

                $open = isset($row['1. open']) ? sprintf('%0.2f', round((float)$row['1. open'], 2)) : 'N/A';
                $high = isset($row['2. high']) ? sprintf('%0.2f', round((float)$row['2. high'], 2)) : 'N/A';
                $low = isset($row['3. low']) ? sprintf('%0.2f', round((float)$row['3. low'], 2)) : 'N/A';
                $close = isset($row['4. close']) ? sprintf('%0.2f', round((float)$row['4. close'], 2)) : 'N/A';
                $volume = $row['5. volume'] ?? 'N/A';

                echo "<tr class='tr'>";
                echo '<td class="td"><a href="selectedStock.php?ticker=' . urlencode($ticker) . '&days=15">' . $ticker . '</a></td>';
                echo '<td>' . htmlspecialchars($lastRefreshed) . '</td>';
                echo '<td>' . $open . '</td>';
                echo '<td>' . $high . '</td>';
                echo '<td>' . $low . '</td>';
                echo '<td>' . $close . '</td>';
                echo '<td>' . htmlspecialchars($volume) . '</td>';
                echo "</tr>";
            }

            function getData($ticker)
{
    $apiKey = getenv("ALPHAVANTAGE_API_KEY") ?: getenv("API_KEY") ?: "1DBYP9NP4ZDVPWI6";

    $url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" . urlencode($ticker) . "&apikey=$apiKey";

    $json = @file_get_contents($url);

    if ($json === false) {
        echo "<tr><td colspan='7'>Error: Cannot connect to AlphaVantage API.</td></tr>";
        return;
    }

    $data = json_decode($json, true);

    if (!is_array($data)) {
        echo "<tr><td colspan='7'>Error: Invalid API response.</td></tr>";
        return;
    }

    if (isset($data['Note'])) {
        echo "<tr><td colspan='7'>API LIMIT REACHED. Wait 1 minute and try again.</td></tr>";
        return;
    }

    if (isset($data['Error Message'])) {
        echo "<tr><td colspan='7'>Invalid Stock Symbol.</td></tr>";
        return;
    }

    renderStockRow($data);
}

            getData("TCS.BSE");
           getData("RELIANCE.BSE");
            // getData("INFY");
            // getData("SUNPHARMA");
            // getData("HDFC");
            // getData("HINDUNILVR");
            // getData("TECHM");
            // getData("ITC");
            // getData("HDFCBANK");
            // getData("MARUTI");
            // getData("BAJFINANCE");

            if (isset($_POST['btnGetStockDetails'])) {
                $ticker = strtoupper(trim($_POST['ticker'] ?? ''));

                if ($ticker === '') {
                    echo "<tr><td colspan='7'>Please enter a ticker symbol.</td></tr>";
                } else {
                    // Automatically append .BSE if no exchange suffix is provided
                    if (strpos($ticker, '.') === false) {
                        $ticker .= '.BSE';
                    }
                    getData($ticker);
                }
            }

            ?>
        </tbody>
    </table>
</div>
</div>
</body>

</html>