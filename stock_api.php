<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Map stock tickers (e.g. TCS.BSE or TCS to TCS.NS, RELIANCE.BSE to RELIANCE.BO)
function cleanTickerSymbol($ticker) {
    $ticker = strtoupper(trim($ticker));
    if (empty($ticker)) {
        return '';
    }
    // If it has .BSE, map it to .BO for Yahoo Finance
    if (str_contains($ticker, '.BSE')) {
        $ticker = str_replace('.BSE', '.BO', $ticker);
    }
    // If there is no suffix (no dot), we default to .NS (NSE is most common in India)
    if (!str_contains($ticker, '.')) {
        // Only append .NS if it seems like a normal stock ticker and not a foreign index/stock like AAPL
        $usTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC'];
        if (!in_array($ticker, $usTickers)) {
            $ticker = $ticker . '.NS';
        }
    }
    return $ticker;
}

function fetchYahooChart($ticker, $range = '1mo', $interval = '1d') {
    $ticker = cleanTickerSymbol($ticker);
    if (empty($ticker)) {
        return null;
    }

    $url = "https://query1.finance.yahoo.com/v8/finance/chart/" . urlencode($ticker) . "?range=" . urlencode($range) . "&interval=" . urlencode($interval);
    
    $options = [
        "http" => [
            "method" => "GET",
            "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36\r\n"
        ]
    ];
    $context = stream_context_create($options);
    $response = @file_get_contents($url, false, $context);
    
    if ($response === false) {
        // Fallback for Indian stocks: try .BO if .NS failed, or vice versa
        if (str_ends_with($ticker, '.NS')) {
            $fallback = substr($ticker, 0, -3) . '.BO';
            $url = "https://query1.finance.yahoo.com/v8/finance/chart/" . urlencode($fallback) . "?range=" . urlencode($range) . "&interval=" . urlencode($interval);
            $response = @file_get_contents($url, false, $context);
        } else if (str_ends_with($ticker, '.BO')) {
            $fallback = substr($ticker, 0, -3) . '.NS';
            $url = "https://query1.finance.yahoo.com/v8/finance/chart/" . urlencode($fallback) . "?range=" . urlencode($range) . "&interval=" . urlencode($interval);
            $response = @file_get_contents($url, false, $context);
        } else {
            // Try appending .NS
            $fallback = $ticker . '.NS';
            $url = "https://query1.finance.yahoo.com/v8/finance/chart/" . urlencode($fallback) . "?range=" . urlencode($range) . "&interval=" . urlencode($interval);
            $response = @file_get_contents($url, false, $context);
        }
    }
    
    if ($response !== false) {
        $data = json_decode($response, true);
        if (isset($data['chart']['result'][0])) {
            return $data['chart']['result'][0];
        }
    }
    return null;
}

$action = $_GET['action'] ?? '';
$ticker = $_GET['ticker'] ?? '';

if ($action === 'price') {
    if (empty($ticker)) {
        echo json_encode(['error' => 'Ticker symbol is required']);
        exit;
    }
    
    // Fetch 1d range for current price metrics
    $result = fetchYahooChart($ticker, '1d', '1m');
    if ($result) {
        $meta = $result['meta'] ?? [];
        $price = $meta['regularMarketPrice'] ?? 0;
        $prevClose = $meta['chartPreviousClose'] ?? $price;
        $change = $price - $prevClose;
        $changePercent = $prevClose > 0 ? ($change / $prevClose) * 100 : 0;
        
        // Find high/low/volume/open from timestamp indicators if available
        $high = $price;
        $low = $price;
        $open = $price;
        $volume = 0;
        
        if (isset($result['indicators']['quote'][0])) {
            $quote = $result['indicators']['quote'][0];
            if (!empty($quote['high'])) {
                $high = max(array_filter($quote['high'])) ?: $price;
            }
            if (!empty($quote['low'])) {
                $low = min(array_filter($quote['low'])) ?: $price;
            }
            if (!empty($quote['open'])) {
                $open = reset($quote['open']) ?: $price;
            }
            if (!empty($quote['volume'])) {
                $volume = array_sum($quote['volume']) ?: 0;
            }
        }
        
        echo json_encode([
            'symbol' => $meta['symbol'] ?? cleanTickerSymbol($ticker),
            'price' => round($price, 2),
            'prev_close' => round($prevClose, 2),
            'change' => round($change, 2),
            'change_percent' => round($changePercent, 2),
            'high' => round($high, 2),
            'low' => round($low, 2),
            'open' => round($open, 2),
            'volume' => $volume,
            'currency' => $meta['currency'] ?? 'INR',
            'exchange' => $meta['exchangeName'] ?? ''
        ]);
    } else {
        echo json_encode(['error' => 'Stock data not found']);
    }
    exit;
}

if ($action === 'history') {
    if (empty($ticker)) {
        echo json_encode(['error' => 'Ticker symbol is required']);
        exit;
    }
    
    $days = $_GET['days'] ?? '30';
    $rangeMap = [
        '5' => ['5d', '15m'],
        '15' => ['1mo', '1d'],
        '30' => ['1mo', '1d'],
        '90' => ['3mo', '1d'],
        '180' => ['6mo', '1d'],
        '360' => ['1y', '1d'],
        'all' => ['max', '1d']
    ];
    
    $mapped = $rangeMap[$days] ?? ['1mo', '1d'];
    $range = $mapped[0];
    $interval = $mapped[1];
    
    $result = fetchYahooChart($ticker, $range, $interval);
    if ($result && isset($result['timestamp'])) {
        $timestamps = $result['timestamp'];
        $closePrices = $result['indicators']['quote'][0]['close'] ?? [];
        
        $labels = [];
        $values = [];
        
        foreach ($timestamps as $index => $ts) {
            $price = $closePrices[$index] ?? null;
            if ($price !== null) {
                $labels[] = date('Y-m-d', $ts);
                $values[] = round($price, 2);
            }
        }
        
        // If we only wanted e.g. 15 days from a 1 month response
        if (is_numeric($days) && count($labels) > (int)$days) {
            $labels = array_slice($labels, -(int)$days);
            $values = array_slice($values, -(int)$days);
        }
        
        echo json_encode([
            'symbol' => $result['meta']['symbol'] ?? cleanTickerSymbol($ticker),
            'labels' => $labels,
            'values' => $values,
            'currency' => $result['meta']['currency'] ?? 'INR'
        ]);
    } else {
        echo json_encode(['error' => 'Stock history not found']);
    }
    exit;
}

if ($action === 'search') {
    $q = $_GET['q'] ?? '';
    if (empty($q)) {
        echo json_encode(['quotes' => []]);
        exit;
    }
    
    $url = "https://query1.finance.yahoo.com/v1/finance/search?q=" . urlencode($q);
    $options = [
        "http" => [
            "method" => "GET",
            "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36\r\n"
        ]
    ];
    $context = stream_context_create($options);
    $response = @file_get_contents($url, false, $context);
    
    if ($response !== false) {
        $data = json_decode($response, true);
        $quotes = [];
        if (isset($data['quotes'])) {
            foreach ($data['quotes'] as $quote) {
                // Return clean, consistent properties
                $quotes[] = [
                    'symbol' => $quote['symbol'] ?? '',
                    'name' => $quote['shortname'] ?? $quote['longname'] ?? $quote['symbol'] ?? '',
                    'exchange' => $quote['exchange'] ?? '',
                    'type' => $quote['quoteType'] ?? ''
                ];
            }
        }
        echo json_encode(['quotes' => $quotes]);
    } else {
        echo json_encode(['quotes' => []]);
    }
    exit;
}

echo json_encode(['error' => 'Invalid action']);
?>
