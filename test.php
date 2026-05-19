<?php
function getData($ticker)
{

    $json = file_get_contents('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' . $ticker . '.BSE&outputsize=full&apikey=8H9HRH3BOFZ4VX26');
    if ($json === false) {
        echo "Error";
    } else {

        $data = json_decode($json, true);
        echo $data["Meta Data"]["2. Symbol"];
        echo $data["Meta Data"]["3. Last Refreshed"];
        echo $data["Time Series (Daily)"][$data["Meta Data"]["3. Last Refreshed"]]["1. open"];
    }
}
getData("TCS");
getData("RELIANCE");
getData("INFY");
getData("SUNPHARMA");
getData("HDFC");
getData("HINDUNILVR");
