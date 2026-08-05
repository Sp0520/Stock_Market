<?php
header('Content-Type: application/json');
require_once(dirname(__DIR__) . '/config/conn.php');

$symbol = isset($_GET['symbol']) ? strtoupper(trim($_GET['symbol'])) : '';

if (!empty($symbol)) {
    $symbolClean = explode('.', $symbol)[0];
    $data = fetchStockData($symbolClean, 2);

    if (isset($data['error'])) {
        echo json_encode(['success' => false, 'error' => $data['error']]);
        exit;
    }

    $tick = stockDataToTick($data);
    if (!$tick) {
        echo json_encode(['success' => false, 'error' => 'Unable to parse stock data for ' . $symbolClean]);
        exit;
    }

    echo json_encode(array_merge(['success' => true], $tick));
    exit;
}

$indicesList = [
    'NIFTY 50' => '^NSEI',
    'SENSEX' => '^BSESN',
    'BANK NIFTY' => '^NSEBANK',
    'FINNIFTY' => 'NIFTY_FIN_SERVICE.NS',
];

$indices = [];
$partial = false;

foreach ($indicesList as $name => $ticker) {
    $idxData = fetchStockData($ticker, 15);
    $tick = stockDataToTick($idxData);
    if ($tick) {
        $indices[$name] = [
            'val' => $tick['price'],
            'change' => $tick['change'],
            'pct' => $tick['changePct'],
            'stale' => $tick['stale'],
        ];
    } else {
        $partial = true;
    }
}

$moverTickers = ['TCS', 'INFY', 'SBIN', 'RELIANCE', 'TATAMOTORS', 'HDFCBANK'];
$nameMapping = [
    'TCS' => 'Tata Consultancy Services',
    'INFY' => 'Infosys Ltd.',
    'SBIN' => 'State Bank of India',
    'RELIANCE' => 'Reliance Industries',
    'TATAMOTORS' => 'Tata Motors',
    'HDFCBANK' => 'HDFC Bank Ltd.',
];

$popularQuotes = [];
foreach ($moverTickers as $ticker) {
    $quoteData = fetchStockData($ticker, 15);
    $tick = stockDataToTick($quoteData);
    if ($tick) {
        $popularQuotes[] = [
            'symbol' => $ticker,
            'name' => $nameMapping[$ticker] ?? ($ticker . ' Ltd.'),
            'price' => $tick['price'],
            'pct' => $tick['changePct'],
            'stale' => $tick['stale'],
        ];
    } else {
        $partial = true;
    }
}

usort($popularQuotes, function ($a, $b) {
    return $b['pct'] <=> $a['pct'];
});

$gainers = array_slice($popularQuotes, 0, 3);
$losers = array_slice(array_reverse($popularQuotes), 0, 3);

$response = [
    'success' => count($indices) > 0 || count($popularQuotes) > 0,
    'indices' => $indices,
    'gainers' => $gainers,
    'losers' => $losers,
];

if ($partial) {
    $response['partial'] = true;
}

if (!$response['success']) {
    $response['error'] = 'Unable to fetch live market data. Check your internet connection and try again.';
}

echo json_encode($response);
exit;
