<?php
/**
 * Stock data providers with file-based caching.
 * Standalone module — no DB or session dependencies.
 * Used by HTTP APIs and the CLI WebSocket server.
 */

function getStockCacheDir() {
    $cacheDir = dirname(__DIR__) . '/logs';
    if (!file_exists($cacheDir)) {
        @mkdir($cacheDir, 0755, true);
    }
    return $cacheDir;
}

function getStockCachePath($ticker) {
    $safeKey = preg_replace('/[^A-Za-z0-9_-]/', '_', strtoupper(trim($ticker)));
    return getStockCacheDir() . '/cache_' . $safeKey . '.json';
}

function readStockCache($ticker, $maxAge = null) {
    $cacheFile = getStockCachePath($ticker);
    if (!file_exists($cacheFile)) {
        return null;
    }

    if ($maxAge !== null && (time() - filemtime($cacheFile)) >= $maxAge) {
        return null;
    }

    $cacheContent = @file_get_contents($cacheFile);
    $cachedData = $cacheContent ? json_decode($cacheContent, true) : null;
    if ($cachedData && isset($cachedData['Meta Data'], $cachedData['Time Series (Daily)'])) {
        return $cachedData;
    }

    return null;
}

function writeStockCache($ticker, $data) {
    @file_put_contents(getStockCachePath($ticker), json_encode($data));
}

function getDefaultStockCacheTime() {
    $envVal = getenv('STOCK_CACHE_SECONDS');
    return ($envVal !== false && is_numeric($envVal)) ? (int)$envVal : 15;
}

function normalizeStockResponse($symbol, $open, $high, $low, $close, $volume, $prevClose, $source, $stale = false) {
    $lastRefreshedDate = date('Y-m-d');
    $meta = [
        '1. Information' => 'Daily Prices (open, high, low, close, volume) daily',
        '2. Symbol' => $symbol,
        '3. Last Refreshed' => $lastRefreshedDate,
        '4. Previous Close' => (string)$prevClose,
        '5. Data Source' => $source,
    ];

    if ($stale) {
        $meta['6. Stale'] = 'true';
    }

    return [
        'Meta Data' => $meta,
        'Time Series (Daily)' => [
            $lastRefreshedDate => [
                '1. open' => (string)$open,
                '2. high' => (string)$high,
                '3. low' => (string)$low,
                '4. close' => (string)$close,
                '5. volume' => (string)$volume,
            ],
        ],
    ];
}

function httpGetJson($url, $timeout = 5) {
    if (!function_exists('curl_init')) {
        return null;
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200 || !$response) {
        return null;
    }

    return json_decode($response, true);
}

function fetchFromYahoo($ticker) {
    $ticker = strtoupper(trim($ticker));
    $tickerClean = explode('.', $ticker)[0];

    if (strpos($ticker, '.') !== false || strpos($ticker, '^') === 0) {
        $queryTickers = [$ticker];
    } else {
        $queryTickers = [$tickerClean . '.NS', $tickerClean . '.BO', $tickerClean];
    }

    foreach ($queryTickers as $queryTicker) {
        $url = 'https://query1.finance.yahoo.com/v8/finance/chart/' . urlencode($queryTicker) . '?range=1d&interval=1m';
        $data = httpGetJson($url);

        if (!$data || !isset($data['chart']['result'][0]['meta']['regularMarketPrice'])) {
            continue;
        }

        $result = $data['chart']['result'][0];
        $meta = $result['meta'];
        $livePrice = (float)$meta['regularMarketPrice'];
        $prevClose = isset($meta['previousClose']) ? (float)$meta['previousClose'] : $livePrice;
        $dayHigh = isset($meta['regularMarketDayHigh']) ? (float)$meta['regularMarketDayHigh'] : max($livePrice, $prevClose);
        $dayLow = isset($meta['regularMarketDayLow']) ? (float)$meta['regularMarketDayLow'] : min($livePrice, $prevClose);
        $volume = isset($meta['regularMarketVolume']) ? (int)$meta['regularMarketVolume'] : 0;

        $openPrice = $prevClose;
        if (isset($result['indicators']['quote'][0]['open'])) {
            $opens = array_filter($result['indicators']['quote'][0]['open'], function ($x) {
                return !is_null($x);
            });
            if (count($opens) > 0) {
                $openPrice = (float)reset($opens);
            }
        }

        return normalizeStockResponse(
            $queryTicker,
            $openPrice,
            $dayHigh,
            $dayLow,
            $livePrice,
            $volume,
            $prevClose,
            'Yahoo Finance'
        );
    }

    return null;
}

function fetchFromAlphaVantage($ticker) {
    $apiKey = getenv('ALPHAVANTAGE_API_KEY') ?: getenv('API_KEY');
    if (!$apiKey) {
        return null;
    }

    $tickerClean = explode('.', strtoupper(trim($ticker)))[0];
    if (strpos($ticker, '^') === 0) {
        return null;
    }

    $symbols = [$tickerClean . '.BSE', $tickerClean . '.NS', $tickerClean];

    foreach ($symbols as $symbol) {
        $url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' . urlencode($symbol) . '&apikey=' . urlencode($apiKey);
        $data = httpGetJson($url, 8);

        if (!$data || !isset($data['Global Quote']['05. price']) || $data['Global Quote']['05. price'] === 'None') {
            continue;
        }

        $quote = $data['Global Quote'];
        $close = (float)$quote['05. price'];
        $prevClose = isset($quote['08. previous close']) ? (float)$quote['08. previous close'] : $close;
        $open = isset($quote['02. open']) ? (float)$quote['02. open'] : $prevClose;
        $high = isset($quote['03. high']) ? (float)$quote['03. high'] : max($close, $prevClose);
        $low = isset($quote['04. low']) ? (float)$quote['04. low'] : min($close, $prevClose);
        $volume = isset($quote['06. volume']) ? (int)$quote['06. volume'] : 0;

        return normalizeStockResponse($symbol, $open, $high, $low, $close, $volume, $prevClose, 'Alpha Vantage');
    }

    return null;
}

function fetchFromMarketstack($ticker) {
    $apiKey = getenv('MARKETSTACK_API_KEY');
    if (!$apiKey) {
        return null;
    }

    $tickerClean = explode('.', strtoupper(trim($ticker)))[0];
    if (strpos($ticker, '^') === 0) {
        return null;
    }

    $symbols = [$tickerClean . '.XBOM', $tickerClean . '.XNSE'];

    foreach ($symbols as $symbol) {
        $url = 'http://api.marketstack.com/v1/eod/latest?access_key=' . urlencode($apiKey) . '&symbols=' . urlencode($symbol);
        $data = httpGetJson($url, 8);

        if (!$data || empty($data['data'][0]['close'])) {
            continue;
        }

        $row = $data['data'][0];
        $close = (float)$row['close'];
        $open = isset($row['open']) ? (float)$row['open'] : $close;
        $high = isset($row['high']) ? (float)$row['high'] : max($close, $open);
        $low = isset($row['low']) ? (float)$row['low'] : min($close, $open);
        $volume = isset($row['volume']) ? (int)$row['volume'] : 0;
        $prevClose = $open;

        return normalizeStockResponse($symbol, $open, $high, $low, $close, $volume, $prevClose, 'Marketstack');
    }

    return null;
}

function fetchStockData($ticker, $cacheTime = null) {
    $ticker = strtoupper(trim($ticker));
    if (empty($ticker)) {
        return ['error' => 'Empty ticker symbol'];
    }

    if ($cacheTime === null) {
        $cacheTime = getDefaultStockCacheTime();
    }

    $freshCache = readStockCache($ticker, $cacheTime);
    if ($freshCache) {
        return $freshCache;
    }

    $providers = ['fetchFromYahoo', 'fetchFromAlphaVantage', 'fetchFromMarketstack'];
    foreach ($providers as $provider) {
        $result = $provider($ticker);
        if ($result) {
            writeStockCache($ticker, $result);
            return $result;
        }
    }

    $staleCache = readStockCache($ticker);
    if ($staleCache) {
        $staleCache['Meta Data']['6. Stale'] = 'true';
        return $staleCache;
    }

    return ['error' => 'Cannot retrieve live stock data for symbol ' . $ticker];
}

function stockDataToTick($data) {
    if (isset($data['error']) || !isset($data['Meta Data'], $data['Time Series (Daily)'])) {
        return null;
    }

    $meta = $data['Meta Data'];
    $timeSeries = $data['Time Series (Daily)'];
    $lastRef = $meta['3. Last Refreshed'];
    if (!isset($timeSeries[$lastRef])) {
        $lastRef = array_key_first($timeSeries);
    }
    $latest = $timeSeries[$lastRef];

    $close = (float)$latest['4. close'];
    $open = (float)$latest['1. open'];
    $high = (float)$latest['2. high'];
    $low = (float)$latest['3. low'];
    $volume = (int)$latest['5. volume'];
    $prevClose = isset($meta['4. Previous Close']) ? (float)$meta['4. Previous Close'] : $open;
    $change = $close - $prevClose;
    $changePct = $prevClose != 0 ? ($change / $prevClose) * 100 : 0;

    $symbol = $meta['2. Symbol'];
    $symbolClean = explode('.', $symbol)[0];
    if (strpos($symbol, '^') === 0) {
        $symbolClean = $symbol;
    }

    return [
        'symbol' => $symbolClean,
        'price' => round($close, 2),
        'change' => round($change, 2),
        'changePct' => round($changePct, 2),
        'open' => round($open, 2),
        'high' => round(max($high, $close), 2),
        'low' => round(min($low, $close), 2),
        'volume' => $volume,
        'timestamp' => date('Y-m-d H:i:s'),
        'stale' => isset($meta['6. Stale']),
        'source' => $meta['5. Data Source'] ?? 'Unknown',
    ];
}

function searchYahooSymbols($query, $limit = 6) {
    $query = strtoupper(trim($query));
    if (strlen($query) < 2) {
        return [];
    }

    $url = 'https://query2.finance.yahoo.com/v1/finance/search?q=' . urlencode($query) . '&quotesCount=' . (int)$limit;
    $data = httpGetJson($url);

    if (!$data || empty($data['quotes'])) {
        return [];
    }

    $results = [];
    foreach ($data['quotes'] as $quote) {
        if (empty($quote['symbol'])) {
            continue;
        }

        $exchange = $quote['exchange'] ?? '';
        if (!in_array($exchange, ['NSI', 'BSE', 'NSE', 'BOM'], true)) {
            continue;
        }

        $symbol = strtoupper(explode('.', $quote['symbol'])[0]);
        $exchangeLabel = in_array($exchange, ['NSI', 'NSE'], true) ? 'NSE' : 'BSE';

        $results[] = [
            'symbol' => $symbol,
            'name' => $quote['shortname'] ?? ($quote['longname'] ?? ($symbol . ' Ltd.')),
            'exchange' => $exchangeLabel,
        ];
    }

    return $results;
}
