<?php
/**
 * Standalone WebSocket Server in PHP
 * Listens on port 8080 (or argv[1]) and streams live stock market price updates.
 * Execute via PHP CLI: php api/websocket_server.php
 */

set_time_limit(0);
ob_implicit_flush();

$port = isset($argv[1]) ? (int)$argv[1] : 8080;
$address = '0.0.0.0';

// Create a TCP/IP Stream socket
$serverSocket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
if ($serverSocket === false) {
    echo "socket_create() failed: reason: " . socket_strerror(socket_last_error()) . "\n";
    exit(1);
}

socket_set_option($serverSocket, SOL_SOCKET, SO_REUSEADDR, 1);

if (socket_bind($serverSocket, $address, $port) === false) {
    echo "socket_bind() failed: reason: " . socket_strerror(socket_last_error($serverSocket)) . "\n";
    exit(1);
}

if (socket_listen($serverSocket, 10) === false) {
    echo "socket_listen() failed: reason: " . socket_strerror(socket_last_error($serverSocket)) . "\n";
    exit(1);
}

echo "WebSocket Server started on $address:$port\n";
echo "Waiting for connections...\n";

$clients = [];
$handshakes = [];
$subscriptions = []; // socket_id => ['type' => 'symbol'|'dashboard', 'symbol' => 'TCS']
$activePriceStates = [];

function getSocketId($socket) {
    return (int)$socket;
}

// Perform WebSocket Handshake
function performHandshake($clientSocket, $headers) {
    if (preg_match("/Sec-WebSocket-Key: (.*)\r\n/", $headers, $matches)) {
        $key = trim($matches[1]);
        $accept = base64_encode(sha1($key . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', true));
        $response = "HTTP/1.1 101 Switching Protocols\r\n" .
                    "Upgrade: websocket\r\n" .
                    "Connection: Upgrade\r\n" .
                    "Sec-WebSocket-Accept: $accept\r\n\r\n";
        socket_write($clientSocket, $response, strlen($response));
        return true;
    }
    return false;
}

// Decode WebSocket Frame
function decode($frame) {
    if (strlen($frame) < 2) return null;
    $length = ord($frame[1]) & 127;
    
    if ($length == 126) {
        if (strlen($frame) < 8) return null;
        $masks = substr($frame, 4, 4);
        $data = substr($frame, 8);
    } elseif ($length == 127) {
        if (strlen($frame) < 14) return null;
        $masks = substr($frame, 10, 4);
        $data = substr($frame, 14);
    } else {
        $masks = substr($frame, 2, 4);
        $data = substr($frame, 6);
    }
    
    $text = "";
    for ($i = 0; $i < strlen($data); ++$i) {
        $text .= $data[$i] ^ $masks[$i % 4];
    }
    return $text;
}

// Encode WebSocket Frame
function encode($payload) {
    $b1 = 0x80 | (0x1 & 0x0f);
    $length = strlen($payload);
    
    if ($length <= 125) {
        $header = pack('CC', $b1, $length);
    } elseif ($length > 125 && $length < 65536) {
        $header = pack('CCn', $b1, 126, $length);
    } else {
        $header = pack('CCNN', $b1, 127, $length >> 32, $length);
    }
    return $header . $payload;
}

// Helper to fetch cached prices or default values
function getCachedStockPrice($symbol) {
    $symbol = strtoupper(trim($symbol));
    $cacheFile = __DIR__ . '/../logs/cache_' . preg_replace('/[^A-Za-z0-9_-]/', '_', $symbol) . '.json';
    
    if (file_exists($cacheFile)) {
        $content = @file_get_contents($cacheFile);
        $data = $content ? json_decode($content, true) : null;
        if ($data && isset($data['Time Series (Daily)'], $data['Meta Data'])) {
            $lastRef = $data['Meta Data']['3. Last Refreshed'];
            if (isset($data['Time Series (Daily)'][$lastRef])) {
                $latest = $data['Time Series (Daily)'][$lastRef];
                return [
                    'price' => (float)$latest['4. close'],
                    'open' => (float)$latest['1. open'],
                    'high' => (float)$latest['2. high'],
                    'low' => (float)$latest['3. low'],
                    'volume' => (int)$latest['5. volume'],
                    'prevClose' => isset($data['Meta Data']['4. Previous Close']) ? (float)$data['Meta Data']['4. Previous Close'] : (float)$latest['1. open']
                ];
            }
        }
    }
    
    // Fallback static quotes
    $fallbacks = [
        'TCS' => ['price' => 3835.45, 'open' => 3800.00, 'high' => 3850.00, 'low' => 3790.00, 'volume' => 123456, 'prevClose' => 3800.00],
        'INFY' => ['price' => 1620.10, 'open' => 1600.00, 'high' => 1630.00, 'low' => 1595.00, 'volume' => 234567, 'prevClose' => 1600.00],
        'SBIN' => ['price' => 745.20, 'open' => 740.00, 'high' => 750.00, 'low' => 738.00, 'volume' => 345678, 'prevClose' => 740.00],
        'RELIANCE' => ['price' => 2428.15, 'open' => 2450.00, 'high' => 2460.00, 'low' => 2420.00, 'volume' => 456789, 'prevClose' => 2450.00],
        'TATAMOTORS' => ['price' => 920.40, 'open' => 935.00, 'high' => 940.00, 'low' => 918.00, 'volume' => 567890, 'prevClose' => 935.00],
        'HDFCBANK' => ['price' => 1412.30, 'open' => 1420.00, 'high' => 1425.00, 'low' => 1408.00, 'volume' => 678901, 'prevClose' => 1420.00],
        '^NSEI' => ['price' => 23771.30, 'open' => 23800.00, 'high' => 23850.00, 'low' => 23700.00, 'volume' => 1000000, 'prevClose' => 23869.60],
        '^BSESN' => ['price' => 75921.78, 'open' => 76000.00, 'high' => 76200.00, 'low' => 75800.00, 'volume' => 500000, 'prevClose' => 76391.39],
        '^NSEBANK' => ['price' => 56613.50, 'open' => 56500.00, 'high' => 56800.00, 'low' => 56400.00, 'volume' => 300000, 'prevClose' => 56592.00],
        'NIFTY_FIN_SERVICE.NS' => ['price' => 25929.40, 'open' => 26000.00, 'high' => 26100.00, 'low' => 25850.00, 'volume' => 200000, 'prevClose' => 25992.05]
    ];
    
    return $fallbacks[strtoupper($symbol)] ?? ['price' => 100.00, 'open' => 98.00, 'high' => 102.00, 'low' => 97.00, 'volume' => 10000, 'prevClose' => 98.00];
}

// Generate price tick with micro-fluctuations
function generateLiveTick($symbol, &$states) {
    if (!isset($states[$symbol])) {
        $states[$symbol] = getCachedStockPrice($symbol);
    }
    
    // Smooth random walk: +/- 0.04%
    $changePct = (rand(-40, 40) / 100000); 
    $states[$symbol]['price'] = $states[$symbol]['price'] * (1 + $changePct);
    $states[$symbol]['high'] = max($states[$symbol]['high'], $states[$symbol]['price']);
    $states[$symbol]['low'] = min($states[$symbol]['low'], $states[$symbol]['price']);
    
    $change = $states[$symbol]['price'] - $states[$symbol]['prevClose'];
    $pct = ($change / $states[$symbol]['prevClose']) * 100;
    
    return [
        'symbol' => strtoupper($symbol),
        'price' => round($states[$symbol]['price'], 2),
        'change' => round($change, 2),
        'changePct' => round($pct, 2),
        'open' => round($states[$symbol]['open'], 2),
        'high' => round($states[$symbol]['high'], 2),
        'low' => round($states[$symbol]['low'], 2),
        'volume' => $states[$symbol]['volume'],
        'timestamp' => date('Y-m-d H:i:s')
    ];
}

$lastBroadcastTime = microtime(true);

while (true) {
    // Prepare socket select array
    $readSockets = array_merge([$serverSocket], $clients);
    $write = NULL;
    $except = NULL;
    
    // Select with 0.5s timeout for fast responses
    $changed = @socket_select($readSockets, $write, $except, 0, 500000);
    
    if ($changed === false) {
        break;
    }
    
    // 1. Handle new connections
    if (in_array($serverSocket, $readSockets)) {
        $newSocket = socket_accept($serverSocket);
        if ($newSocket !== false) {
            $clients[] = $newSocket;
            $sid = getSocketId($newSocket);
            $handshakes[$sid] = false;
            echo "New client connected: ID $sid\n";
        }
        $key = array_search($serverSocket, $readSockets);
        unset($readSockets[$key]);
    }
    
    // 2. Handle client data
    foreach ($readSockets as $clientSocket) {
        $sid = getSocketId($clientSocket);
        $bytes = @socket_recv($clientSocket, $buffer, 2048, 0);
        
        if ($bytes === 0 || $bytes === false) {
            // Disconnected
            echo "Client disconnected: ID $sid\n";
            unset($clients[array_search($clientSocket, $clients)]);
            unset($handshakes[$sid]);
            unset($subscriptions[$sid]);
            @socket_close($clientSocket);
        } else {
            if (!$handshakes[$sid]) {
                // Handshake phase
                if (performHandshake($clientSocket, $buffer)) {
                    $handshakes[$sid] = true;
                    echo "Handshake successful with client ID $sid\n";
                }
            } else {
                // Parse WS Frame
                $message = decode($buffer);
                if ($message) {
                    $data = json_decode($message, true);
                    if ($data && isset($data['type'])) {
                        if ($data['type'] === 'subscribe') {
                            $symbol = isset($data['symbol']) ? strtoupper(trim($data['symbol'])) : '';
                            if ($symbol) {
                                $subscriptions[$sid] = [
                                    'type' => ($symbol === 'DASHBOARD') ? 'dashboard' : 'symbol',
                                    'symbol' => $symbol
                                ];
                                echo "Client $sid subscribed to $symbol\n";
                                
                                // Send immediate first tick response
                                if ($symbol === 'DASHBOARD') {
                                    $initialMsg = json_encode([
                                        'type' => 'dashboard',
                                        'indices' => [
                                            'NIFTY 50' => ['val' => 23771.30, 'change' => -98.30, 'pct' => -0.41],
                                            'SENSEX' => ['val' => 75921.78, 'change' => -469.61, 'pct' => -0.61],
                                            'BANK NIFTY' => ['val' => 56613.50, 'change' => 21.50, 'pct' => 0.04],
                                            'FINNIFTY' => ['val' => 25929.40, 'change' => -62.65, 'pct' => -0.24]
                                        ],
                                        'gainers' => [],
                                        'losers' => []
                                    ]);
                                    @socket_write($clientSocket, encode($initialMsg), strlen(encode($initialMsg)));
                                } else {
                                    $tick = generateLiveTick($symbol, $activePriceStates);
                                    $initialMsg = json_encode([
                                        'type' => 'tick',
                                        'data' => $tick
                                    ]);
                                    @socket_write($clientSocket, encode($initialMsg), strlen(encode($initialMsg)));
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // 3. Broadcast real-time stock ticks every 1.5 seconds
    $now = microtime(true);
    if ($now - $lastBroadcastTime >= 1.5) {
        $lastBroadcastTime = $now;
        
        foreach ($clients as $clientSocket) {
            $sid = getSocketId($clientSocket);
            if (isset($handshakes[$sid]) && $handshakes[$sid] && isset($subscriptions[$sid])) {
                $sub = $subscriptions[$sid];
                if ($sub['type'] === 'symbol') {
                    $tick = generateLiveTick($sub['symbol'], $activePriceStates);
                    $payload = json_encode([
                        'type' => 'tick',
                        'data' => $tick
                    ]);
                    @socket_write($clientSocket, encode($payload), strlen(encode($payload)));
                } elseif ($sub['type'] === 'dashboard') {
                    // Update index updates
                    $nifty = generateLiveTick('^NSEI', $activePriceStates);
                    $sensex = generateLiveTick('^BSESN', $activePriceStates);
                    $banknifty = generateLiveTick('^NSEBANK', $activePriceStates);
                    $finnifty = generateLiveTick('NIFTY_FIN_SERVICE.NS', $activePriceStates);
                    
                    // Update popular stock updates
                    $movers = ['TCS', 'INFY', 'SBIN', 'RELIANCE', 'TATAMOTORS', 'HDFCBANK'];
                    $quotes = [];
                    foreach ($movers as $m) {
                        $quotes[] = generateLiveTick($m, $activePriceStates);
                    }
                    
                    // Sort popular quotes
                    usort($quotes, function($a, $b) {
                        return $b['changePct'] <=> $a['changePct'];
                    });
                    
                    $gainers = array_slice($quotes, 0, 3);
                    $losers = array_slice($quotes, 3, 3);
                    
                    $payload = json_encode([
                        'type' => 'dashboard',
                        'indices' => [
                            'NIFTY 50' => ['val' => $nifty['price'], 'change' => $nifty['change'], 'pct' => $nifty['changePct']],
                            'SENSEX' => ['val' => $sensex['price'], 'change' => $sensex['change'], 'pct' => $sensex['changePct']],
                            'BANK NIFTY' => ['val' => $banknifty['price'], 'change' => $banknifty['change'], 'pct' => $banknifty['changePct']],
                            'FINNIFTY' => ['val' => $finnifty['price'], 'change' => $finnifty['change'], 'pct' => $finnifty['changePct']]
                        ],
                        'gainers' => array_map(function($g) {
                            return ['symbol' => $g['symbol'], 'name' => $g['symbol'] . ' Ltd.', 'price' => $g['price'], 'pct' => $g['changePct']];
                        }, $gainers),
                        'losers' => array_map(function($l) {
                            return ['symbol' => $l['symbol'], 'name' => $l['symbol'] . ' Ltd.', 'price' => $l['price'], 'pct' => $l['changePct']];
                        }, $losers),
                        // Add raw quotes for individual featured rows update
                        'quotes' => $quotes
                    ]);
                    @socket_write($clientSocket, encode($payload), strlen(encode($payload)));
                }
            }
        }
    }
}

socket_close($serverSocket);
?>
