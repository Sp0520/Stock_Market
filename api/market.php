<?php
header('Content-Type: application/json');
require_once(dirname(__DIR__) . '/config/conn.php');

$symbol = isset($_GET['symbol']) ? strtoupper(trim($_GET['symbol'])) : '';

// Smooth sine wave offset generator based on timestamp to simulate live ticking fluctuations
$timeSec = time();
$offset = sin($timeSec * 0.2) * 0.0006; // +/- 0.06% smooth swing

if (!empty($symbol)) {
    // Clean symbol suffix if provided
    $symbolClean = explode('.', $symbol)[0];
    $data = fetchStockData($symbolClean);
    
    if (isset($data['error'])) {
        echo json_encode(['success' => false, 'error' => $data['error']]);
        exit;
    }
    
    $meta = $data['Meta Data'];
    $timeSeries = $data['Time Series (Daily)'];
    $lastRef = $meta['3. Last Refreshed'];
    if (!isset($timeSeries[$lastRef])) {
        $lastRef = array_key_first($timeSeries);
    }
    $latest = $timeSeries[$lastRef];
    
    $open = (float)$latest['1. open'];
    $high = (float)$latest['2. high'];
    $low = (float)$latest['3. low'];
    $close = (float)$latest['4. close'];
    $volume = (int)$latest['5. volume'];
    
    // Simulate live ticking price
    $livePrice = $close * (1 + $offset);
    $change = $livePrice - $open;
    $changePct = ($change / $open) * 100;
    
    echo json_encode([
        'success' => true,
        'symbol' => $symbolClean,
        'price' => round($livePrice, 2),
        'change' => round($change, 2),
        'changePct' => round($changePct, 2),
        'open' => round($open, 2),
        'high' => round(max($high, $livePrice), 2),
        'low' => round(min($low, $livePrice), 2),
        'volume' => $volume,
        'lastRef' => $lastRef,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// Otherwise, return general market indexes, gainers, losers, and actives
$niftyVal = 22096.75 * (1 + $offset * 0.5);
$sensexVal = 72708.10 * (1 + $offset * 0.5);
$bankNiftyVal = 46919.80 * (1 - $offset * 0.3);
$finniftyVal = 20738.90 * (1 + $offset * 0.2);

echo json_encode([
    'success' => true,
    'indices' => [
        'NIFTY 50' => ['val' => round($niftyVal, 2), 'change' => round($niftyVal - 21912.50, 2), 'pct' => round((($niftyVal - 21912.50) / 21912.50) * 100, 2)],
        'SENSEX' => ['val' => round($sensexVal, 2), 'change' => round($sensexVal - 72111.80, 2), 'pct' => round((($sensexVal - 72111.80) / 72111.80) * 100, 2)],
        'BANK NIFTY' => ['val' => round($bankNiftyVal, 2), 'change' => round($bankNiftyVal - 47032.25, 2), 'pct' => round((($bankNiftyVal - 47032.25) / 47032.25) * 100, 2)],
        'FINNIFTY' => ['val' => round($finniftyVal, 2), 'change' => round($finniftyVal - 20666.05, 2), 'pct' => round((($finniftyVal - 20666.05) / 20666.05) * 100, 2)]
    ],
    'gainers' => [
        ['symbol' => 'TCS', 'name' => 'Tata Consultancy Services', 'price' => round(3835.45 * (1 + $offset), 2), 'pct' => round(1.24 + $offset * 100, 2)],
        ['symbol' => 'INFY', 'name' => 'Infosys Ltd.', 'price' => round(1620.10 * (1 + $offset * 1.2), 2), 'pct' => round(2.05 + $offset * 120, 2)],
        ['symbol' => 'SBIN', 'name' => 'State Bank of India', 'price' => round(745.20 * (1 + $offset * 0.8), 2), 'pct' => round(0.85 + $offset * 80, 2)]
    ],
    'losers' => [
        ['symbol' => 'RELIANCE', 'name' => 'Reliance Industries', 'price' => round(2428.15 * (1 - $offset * 0.9), 2), 'pct' => round(-0.95 - $offset * 90, 2)],
        ['symbol' => 'TATAMOTORS', 'name' => 'Tata Motors', 'price' => round(920.40 * (1 - $offset * 1.5), 2), 'pct' => round(-1.40 - $offset * 150, 2)],
        ['symbol' => 'HDFCBANK', 'name' => 'HDFC Bank Ltd.', 'price' => round(1412.30 * (1 - $offset * 0.7), 2), 'pct' => round(-0.54 - $offset * 70, 2)]
    ]
]);
exit;
?>
