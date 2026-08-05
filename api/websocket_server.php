<?php
/**
 * Standalone WebSocket Server in PHP
 * Listens on port 8080 (or argv[1]) and streams live stock market price updates.
 * Execute via PHP CLI: php api/websocket_server.php
 */

set_time_limit(0);
ob_implicit_flush();

require_once(__DIR__ . '/../config/stock_api.php');

if (file_exists(dirname(__DIR__) . '/.env')) {
    $envLines = file(dirname(__DIR__) . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envLines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            if (!getenv($key)) {
                putenv("$key=$value");
            }
        }
    }
}

$port = isset($argv[1]) ? (int)$argv[1] : 8080;
$address = '0.0.0.0';

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
$subscriptions = [];
$lastKnownTicks = [];
$lastFetchTimes = [];

function getSocketId($socket) {
    return (int)$socket;
}

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

function fetchLiveTick($symbol, &$lastKnownTicks, &$lastFetchTimes) {
    $symbol = strtoupper(trim($symbol));
    $now = microtime(true);
    $refreshInterval = 10;

    if (!isset($lastFetchTimes[$symbol]) || ($now - $lastFetchTimes[$symbol]) >= $refreshInterval) {
        $data = fetchStockData($symbol, 10);
        $tick = stockDataToTick($data);
        if ($tick) {
            $lastKnownTicks[$symbol] = $tick;
            $lastFetchTimes[$symbol] = $now;
        }
    }

    return $lastKnownTicks[$symbol] ?? null;
}

function buildDashboardPayload(&$lastKnownTicks, &$lastFetchTimes) {
    $indicesList = [
        'NIFTY 50' => '^NSEI',
        'SENSEX' => '^BSESN',
        'BANK NIFTY' => '^NSEBANK',
        'FINNIFTY' => 'NIFTY_FIN_SERVICE.NS',
    ];

    $movers = ['TCS', 'INFY', 'SBIN', 'RELIANCE', 'TMPV', 'HDFCBANK'];
    $nameMapping = [
        'TCS' => 'Tata Consultancy Services',
        'INFY' => 'Infosys Ltd.',
        'SBIN' => 'State Bank of India',
        'RELIANCE' => 'Reliance Industries',
        'TMPV' => 'Tata Motors Passenger Vehicles',
        'TMCV' => 'Tata Motors Commercial Vehicles',
        'HDFCBANK' => 'HDFC Bank Ltd.',
    ];

    $indices = [];
    foreach ($indicesList as $name => $ticker) {
        $tick = fetchLiveTick($ticker, $lastKnownTicks, $lastFetchTimes);
        if ($tick) {
            $indices[$name] = [
                'val' => $tick['price'],
                'change' => $tick['change'],
                'pct' => $tick['changePct'],
            ];
        }
    }

    $quotes = [];
    foreach ($movers as $m) {
        $tick = fetchLiveTick($m, $lastKnownTicks, $lastFetchTimes);
        if ($tick) {
            $quotes[] = $tick;
        }
    }

    usort($quotes, function ($a, $b) {
        return $b['changePct'] <=> $a['changePct'];
    });

    $gainers = array_slice($quotes, 0, 3);
    $losers = array_slice(array_reverse($quotes), 0, 3);

    return [
        'type' => 'dashboard',
        'indices' => $indices,
        'gainers' => array_map(function ($g) use ($nameMapping) {
            return [
                'symbol' => $g['symbol'],
                'name' => $nameMapping[$g['symbol']] ?? ($g['symbol'] . ' Ltd.'),
                'price' => $g['price'],
                'pct' => $g['changePct'],
            ];
        }, $gainers),
        'losers' => array_map(function ($l) use ($nameMapping) {
            return [
                'symbol' => $l['symbol'],
                'name' => $nameMapping[$l['symbol']] ?? ($l['symbol'] . ' Ltd.'),
                'price' => $l['price'],
                'pct' => $l['changePct'],
            ];
        }, $losers),
        'quotes' => $quotes,
    ];
}

$lastBroadcastTime = microtime(true);

while (true) {
    $readSockets = array_merge([$serverSocket], $clients);
    $write = NULL;
    $except = NULL;

    $changed = @socket_select($readSockets, $write, $except, 0, 500000);

    if ($changed === false) {
        break;
    }

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

    foreach ($readSockets as $clientSocket) {
        $sid = getSocketId($clientSocket);
        $bytes = @socket_recv($clientSocket, $buffer, 2048, 0);

        if ($bytes === 0 || $bytes === false) {
            echo "Client disconnected: ID $sid\n";
            unset($clients[array_search($clientSocket, $clients)]);
            unset($handshakes[$sid]);
            unset($subscriptions[$sid]);
            @socket_close($clientSocket);
        } else {
            if (!$handshakes[$sid]) {
                if (performHandshake($clientSocket, $buffer)) {
                    $handshakes[$sid] = true;
                    echo "Handshake successful with client ID $sid\n";
                }
            } else {
                $message = decode($buffer);
                if ($message) {
                    $data = json_decode($message, true);
                    if ($data && isset($data['type']) && $data['type'] === 'subscribe') {
                        $symbol = isset($data['symbol']) ? strtoupper(trim($data['symbol'])) : '';
                        if ($symbol) {
                            $subscriptions[$sid] = [
                                'type' => ($symbol === 'DASHBOARD') ? 'dashboard' : 'symbol',
                                'symbol' => $symbol,
                            ];
                            echo "Client $sid subscribed to $symbol\n";

                            if ($symbol === 'DASHBOARD') {
                                $payload = json_encode(buildDashboardPayload($lastKnownTicks, $lastFetchTimes));
                            } else {
                                $tick = fetchLiveTick($symbol, $lastKnownTicks, $lastFetchTimes);
                                $payload = json_encode([
                                    'type' => 'tick',
                                    'data' => $tick,
                                ]);
                            }

                            if ($payload) {
                                @socket_write($clientSocket, encode($payload), strlen(encode($payload)));
                            }
                        }
                    }
                }
            }
        }
    }

    $now = microtime(true);
    if ($now - $lastBroadcastTime >= 5) {
        $lastBroadcastTime = $now;

        foreach ($clients as $clientSocket) {
            $sid = getSocketId($clientSocket);
            if (!isset($handshakes[$sid]) || !$handshakes[$sid] || !isset($subscriptions[$sid])) {
                continue;
            }

            $sub = $subscriptions[$sid];
            if ($sub['type'] === 'symbol') {
                $tick = fetchLiveTick($sub['symbol'], $lastKnownTicks, $lastFetchTimes);
                if (!$tick) {
                    continue;
                }
                $payload = json_encode([
                    'type' => 'tick',
                    'data' => $tick,
                ]);
            } else {
                $payload = json_encode(buildDashboardPayload($lastKnownTicks, $lastFetchTimes));
            }

            @socket_write($clientSocket, encode($payload), strlen(encode($payload)));
        }
    }
}

socket_close($serverSocket);
