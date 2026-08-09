<?php
include("./mainTop.php");
require("./conn.php");

$database = [];

$stmt = mysqli_prepare($conn, "SELECT * FROM users WHERE id = ?");
mysqli_stmt_bind_param($stmt, "i", $_SESSION['user_id']);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

while ($row = mysqli_fetch_assoc($result)) {
    $database[] = $row;
}
mysqli_stmt_close($stmt);

// Clean ticker symbol (default TCS.NS)
$ticker = strtoupper(trim($_GET["ticker"] ?? "TCS"));
if (str_contains($ticker, '.BSE')) {
    $ticker = str_replace('.BSE', '.BO', $ticker);
}
if (!str_contains($ticker, '.')) {
    $usTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC'];
    if (!in_array($ticker, $usTickers)) {
        $ticker = $ticker . '.NS';
    }
}

$days = $_GET["days"] ?? 15;
$rangeMap = [
    '5' => '5d',
    '15' => '1mo',
    '30' => '1mo',
    '90' => '3mo',
    '180' => '6mo',
    '360' => '1y',
    'all' => 'max'
];
$range = $rangeMap[$days] ?? '1mo';
$interval = ($days === '5') ? '15m' : '1d';

// Fetch from Yahoo Finance API
$url = "https://query1.finance.yahoo.com/v8/finance/chart/" . urlencode($ticker) . "?range={$range}&interval={$interval}";
$options = [
    "http" => [
        "method" => "GET",
        "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36\r\n"
    ]
];
$context = stream_context_create($options);
$response = @file_get_contents($url, false, $context);
$data = $response ? json_decode($response, true) : null;
$hasData = ($response !== false && isset($data['chart']['result'][0]));

if ($hasData) {
    $res = $data['chart']['result'][0];
    $meta = $res['meta'];
    $currentPrice = $meta['regularMarketPrice'] ?? 0;
    $prevClose = $meta['chartPreviousClose'] ?? $currentPrice;
    $change = $currentPrice - $prevClose;
    $changePercent = $prevClose > 0 ? ($change / $prevClose) * 100 : 0;
    
    $timestamps = $res['timestamp'] ?? [];
    $closes = $res['indicators']['quote'][0]['close'] ?? [];
    
    $dailyDateClose = [];
    $dailyDataClose = [];
    
    foreach ($timestamps as $idx => $ts) {
        $closeVal = $closes[$idx] ?? null;
        if ($closeVal !== null) {
            $dailyDateClose[] = date($days === '5' ? 'H:i' : 'Y-m-d', $ts);
            $dailyDataClose[] = round($closeVal, 2);
        }
    }
    
    // Slice arrays to match exact days request
    if (is_numeric($days) && count($dailyDateClose) > (int)$days) {
        $dailyDateClose = array_slice($dailyDateClose, -(int)$days);
        $dailyDataClose = array_slice($dailyDataClose, -(int)$days);
    }
} else {
    $currentPrice = 0.00;
    $change = 0;
    $changePercent = 0;
    $dailyDateClose = [];
    $dailyDataClose = [];
}
?>

<head>
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.0/dist/chart.min.js"></script>
</head>

<div class="content_selectedStock" style="max-width: 1200px; margin: 40px auto; padding: 40px;">

<?php if (!$hasData): ?>
    <div style="background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.2); padding: 40px; border-radius: 20px; text-align: center; max-width: 600px; margin: 40px auto; color: var(--text-primary);">
        <h3 style="margin-bottom: 15px; font-size: 1.5rem; font-weight: 700; color: var(--danger);">Stock Symbol Not Found</h3>
        <p style="color: var(--text-secondary); line-height: 1.6;">We could not fetch market details for ticker symbol <strong><?= htmlspecialchars($ticker) ?></strong>. This might be due to an invalid symbol, rate limits, or network connectivity issues.</p>
        <a href="market.php" class="btnBuy_" style="display: inline-block; margin-top: 25px; text-decoration: none; padding: 10px 24px; font-size: 0.9rem;">Return to Market</a>
    </div>
<?php else: ?>

<div class="data_sell" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 25px; margin-bottom: 30px; flex-wrap: wrap; gap: 20px;">
    <div class="stock_data">
        <h2 style="font-size: 2.25rem; font-weight: 800; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 12px;">
            <?= htmlspecialchars($ticker) ?>
            <span style="font-size: 0.95rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 8px;">
                <?= htmlspecialchars($meta['exchangeName'] ?? 'EQUITY') ?>
            </span>
        </h2>
        <div style="display: flex; align-items: baseline; gap: 15px; margin-top: 8px;">
            <span style="font-size: 2rem; font-weight: 800; color: var(--text-primary);">₹ <?= sprintf('%0.2f', $currentPrice) ?></span>
            <span class="<?= $change >= 0 ? 'stock-up' : 'stock-down' ?>" style="font-size: 0.95rem; padding: 2px 8px;">
                <?= $change >= 0 ? '+' : '' ?><?= sprintf('%0.2f', $change) ?> (<?= $change >= 0 ? '+' : '' ?><?= sprintf('%0.2f', $changePercent) ?>%)
            </span>
        </div>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 5px;">Currency: <?= htmlspecialchars($meta['currency'] ?? 'INR') ?> • Market Close Price</p>
    </div>

    <div class="btnBuyDiv" style="display: flex; gap: 15px; align-items: center;">
        <div style="text-align: right; margin-right: 10px;">
            <span style="color: var(--text-muted); font-size: 0.8rem; display: block;">Your Balance</span>
            <span style="font-weight: 700; color: var(--text-primary); font-size: 1.1rem;">₹ <?= number_format($database[0]['available_balance'] ?? 0, 2) ?></span>
        </div>
        <form method="post" style="margin: 0;">
            <input type="submit" value="BUY SHARE" name="btnBuy" class="btnBuy" style="padding: 14px 30px; font-size: 0.95rem;">
        </form>
    </div>
</div>

<?php
if (isset($_POST["btnBuy"])) {
    $userBalance = !empty($database) ? floatval($database[0]["available_balance"]) : 0;
    
    if ($userBalance < floatval($currentPrice)) {
        echo "<script>alert('Insufficient Balance. Please add funds to your wallet.')</script>";
    } else {
        $stmt = mysqli_prepare($conn, "UPDATE users SET available_balance = available_balance - ? WHERE id = ?");
        mysqli_stmt_bind_param($stmt, "di", $currentPrice, $_SESSION['user_id']);
        $resultUpdate = mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        
        if ($resultUpdate) {
            $stmt = mysqli_prepare($conn, "INSERT INTO stock_details (stock_name, purchase_price, user_id, status) VALUES (?, ?, ?, ?)");
            $status = 1;
            mysqli_stmt_bind_param($stmt, "sdii", $ticker, $currentPrice, $_SESSION['user_id'], $status);
            $resultInsert = mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);
            
            if ($resultInsert) {
                // Log credit/debit transaction
                $stmt = mysqli_prepare($conn, "INSERT INTO users_transaction (debit, payment_id, description, user_id) VALUES (?, ?, ?, ?)");
                $paymentId = "BUY_" . strtoupper(substr(md5(time()), 0, 10));
                $desc = "Bought " . $ticker;
                mysqli_stmt_bind_param($stmt, "dssi", $currentPrice, $paymentId, $desc, $_SESSION['user_id']);
                mysqli_stmt_execute($stmt);
                mysqli_stmt_close($stmt);
                
                echo "<script>
                    alert('Share Purchased Successfully!');
                    window.location.href = 'portfolios.php';
                </script>";
                exit();
            } else {
                echo "<script>alert('Failed to insert stock holding record.')</script>";
            }
        } else {
            echo "<script>alert('Failed to process wallet transaction.')</script>";
        }
    }
}
?>

<div class="content_" style="display: flex; flex-direction: column; gap: 25px;">
    <!-- Time Horizon Tabs -->
    <div class="btn" style="display: flex; gap: 10px; flex-wrap: wrap; height: auto; padding: 0; justify-content: flex-start; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
        <a href="?ticker=<?= urlencode($ticker) ?>&days=5" class="btnBuy_" style="padding: 8px 16px; font-size: 0.85rem; text-decoration: none; <?= $days == 5 ? '' : 'background: transparent !important; border: 1px solid var(--border-color) !important; color: var(--text-secondary) !important; box-shadow: none !important;' ?>">5 Days</a>
        <a href="?ticker=<?= urlencode($ticker) ?>&days=15" class="btnBuy_" style="padding: 8px 16px; font-size: 0.85rem; text-decoration: none; <?= $days == 15 ? '' : 'background: transparent !important; border: 1px solid var(--border-color) !important; color: var(--text-secondary) !important; box-shadow: none !important;' ?>">15 Days</a>
        <a href="?ticker=<?= urlencode($ticker) ?>&days=30" class="btnBuy_" style="padding: 8px 16px; font-size: 0.85rem; text-decoration: none; <?= $days == 30 ? '' : 'background: transparent !important; border: 1px solid var(--border-color) !important; color: var(--text-secondary) !important; box-shadow: none !important;' ?>">30 Days</a>
        <a href="?ticker=<?= urlencode($ticker) ?>&days=90" class="btnBuy_" style="padding: 8px 16px; font-size: 0.85rem; text-decoration: none; <?= $days == 90 ? '' : 'background: transparent !important; border: 1px solid var(--border-color) !important; color: var(--text-secondary) !important; box-shadow: none !important;' ?>">3 Months</a>
        <a href="?ticker=<?= urlencode($ticker) ?>&days=180" class="btnBuy_" style="padding: 8px 16px; font-size: 0.85rem; text-decoration: none; <?= $days == 180 ? '' : 'background: transparent !important; border: 1px solid var(--border-color) !important; color: var(--text-secondary) !important; box-shadow: none !important;' ?>">6 Months</a>
        <a href="?ticker=<?= urlencode($ticker) ?>&days=360" class="btnBuy_" style="padding: 8px 16px; font-size: 0.85rem; text-decoration: none; <?= $days == 360 ? '' : 'background: transparent !important; border: 1px solid var(--border-color) !important; color: var(--text-secondary) !important; box-shadow: none !important;' ?>">1 Year</a>
        <a href="?ticker=<?= urlencode($ticker) ?>&days=all" class="btnBuy_" style="padding: 8px 16px; font-size: 0.85rem; text-decoration: none; <?= $days === 'all' ? '' : 'background: transparent !important; border: 1px solid var(--border-color) !important; color: var(--text-secondary) !important; box-shadow: none !important;' ?>">All Data</a>
    </div>

    <!-- Chart Panel -->
    <div class="chart" style="width: 100%; height: 400px; background: rgba(0, 0, 0, 0.15); border-radius: 16px; padding: 20px; border: 1px solid var(--border-color); position: relative;">
        <canvas id="myChart" style="width: 100%; height: 100%;"></canvas>
    </div>
</div>
<?php endif; ?>
</div>

<script>
<?php if ($hasData): ?>
const labels = <?= json_encode($dailyDateClose) ?>;
const values = <?= json_encode($dailyDataClose) ?>;
const isProfit = <?= ($change >= 0) ? 'true' : 'false' ?>;

const accentColor = isProfit ? 'rgb(16, 185, 129)' : 'rgb(244, 63, 94)';
const glowColor = isProfit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';

const ctx = document.getElementById('myChart').getContext('2d');

// Create gradient background fill
const gradient = ctx.createLinearGradient(0, 0, 0, 360);
gradient.addColorStop(0, glowColor);
gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Close Price (INR)',
            data: values,
            borderColor: accentColor,
            borderWidth: 2.5,
            fill: true,
            backgroundColor: gradient,
            tension: 0.15,
            pointRadius: labels.length > 50 ? 0 : 3,
            pointHoverRadius: 6,
            pointBackgroundColor: accentColor,
            pointHoverBackgroundColor: '#ffffff'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#f3f4f6',
                bodyColor: '#e5e7eb',
                borderColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        return `₹ ${context.parsed.y.toFixed(2)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#9ca3af',
                    font: {
                        family: 'Outfit'
                    }
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#9ca3af',
                    font: {
                        family: 'Outfit'
                    },
                    callback: function(value) {
                        return '₹' + value;
                    }
                }
            }
        }
    }
});
<?php endif; ?>
</script>

<?php
require("./bottom.php");
?>