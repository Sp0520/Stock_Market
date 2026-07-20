<?php
header('Content-Type: application/json');
require_once(dirname(__DIR__) . '/config/conn.php');

$query = isset($_GET['q']) ? strtoupper(trim($_GET['q'])) : '';

if (empty($query) || strlen($query) < 2) {
    echo json_encode([]);
    exit;
}

// Predefined list of popular liquid stocks for instant lookup without API overhead
$popularStocks = [
    ['symbol' => 'TCS', 'name' => 'Tata Consultancy Services Ltd.', 'exchange' => 'BSE'],
    ['symbol' => 'RELIANCE', 'name' => 'Reliance Industries Ltd.', 'exchange' => 'BSE'],
    ['symbol' => 'INFY', 'name' => 'Infosys Ltd.', 'exchange' => 'BSE'],
    ['symbol' => 'HDFCBANK', 'name' => 'HDFC Bank Ltd.', 'exchange' => 'BSE'],
    ['symbol' => 'ICICIBANK', 'name' => 'ICICI Bank Ltd.', 'exchange' => 'BSE'],
    ['symbol' => 'SBIN', 'name' => 'State Bank of India', 'exchange' => 'BSE'],
    ['symbol' => 'AXISBANK', 'name' => 'Axis Bank Ltd.', 'exchange' => 'BSE'],
    ['symbol' => 'WIPRO', 'name' => 'Wipro Ltd.', 'exchange' => 'BSE'],
    ['symbol' => 'LT', 'name' => 'Larsen & Toubro Ltd.', 'exchange' => 'BSE'],
    ['symbol' => 'ITC', 'name' => 'ITC Ltd.', 'exchange' => 'BSE'],
    ['symbol' => 'TATAMOTORS', 'name' => 'Tata Motors Ltd.', 'exchange' => 'BSE'],
    ['symbol' => 'HINDUNILVR', 'name' => 'Hindustan Unilever Ltd.', 'exchange' => 'BSE'],
    ['symbol' => 'BAJFINANCE', 'name' => 'Bajaj Finance Ltd.', 'exchange' => 'BSE'],
    ['symbol' => 'MARUTI', 'name' => 'Maruti Suzuki India Ltd.', 'exchange' => 'BSE'],
    ['symbol' => 'TECHM', 'name' => 'Tech Mahindra Ltd.', 'exchange' => 'BSE'],
    ['symbol' => 'SUNPHARMA', 'name' => 'Sun Pharmaceutical Industries Ltd.', 'exchange' => 'BSE']
];

$results = [];

// Filter popular stocks first
foreach ($popularStocks as $stock) {
    if (strpos($stock['symbol'], $query) !== false || strpos(strtoupper($stock['name']), $query) !== false) {
        $results[] = $stock;
    }
}

// Check local stock transaction details to query items user has held
$stmt = mysqli_prepare($conn, "SELECT DISTINCT stock_name FROM stock_details WHERE stock_name LIKE ? LIMIT 5");
if ($stmt) {
    $likeQuery = "%" . $query . "%";
    mysqli_stmt_bind_param($stmt, "s", $likeQuery);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    while ($row = mysqli_fetch_assoc($res)) {
        $symbol = strtoupper($row['stock_name']);
        
        // Avoid duplicates
        $found = false;
        foreach ($results as $item) {
            if ($item['symbol'] === $symbol) {
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            $results[] = [
                'symbol' => $symbol,
                'name' => $symbol . ' Holding Stock',
                'exchange' => 'BSE'
            ];
        }
    }
    mysqli_stmt_close($stmt);
}

// Slice to maximum 6 results for clean UI dropdown
echo json_encode(array_slice($results, 0, 6));
exit;
?>
