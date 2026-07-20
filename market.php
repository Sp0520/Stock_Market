<?php
include_once(__DIR__ . '/includes/header.php');

// Define Indian Market Hours status (9:15 AM to 3:30 PM IST, Monday-Friday)
date_default_timezone_set('Asia/Kolkata');
$hour = (int)date('H');
$minute = (int)date('i');
$dayOfWeek = (int)date('N'); // 1 = Mon, 7 = Sun
$currentTimeInMinutes = $hour * 60 + $minute;
$marketOpenMinutes = 9 * 60 + 15; // 9:15 AM
$marketCloseMinutes = 15 * 60 + 30; // 3:30 PM

$isMarketOpen = ($dayOfWeek >= 1 && $dayOfWeek <= 5 && $currentTimeInMinutes >= $marketOpenMinutes && $currentTimeInMinutes <= $marketCloseMinutes);

// Dummy values for Indian Indices (simulated live data)
$indices = [
    'NIFTY 50' => ['val' => 22096.75, 'change' => 184.25, 'pct' => 0.84],
    'SENSEX' => ['val' => 72708.10, 'change' => 596.30, 'pct' => 0.83],
    'BANK NIFTY' => ['val' => 46919.80, 'change' => -112.45, 'pct' => -0.24],
    'FINNIFTY' => ['val' => 20738.90, 'change' => 72.85, 'pct' => 0.35],
];

// Global Markets simulated data
$globalMarkets = [
    ['name' => 'S&P 500 (US)', 'val' => '5,117.09', 'change' => '+1.03%', 'up' => true],
    ['name' => 'Nasdaq (US)', 'val' => '16,113.62', 'change' => '+1.14%', 'up' => true],
    ['name' => 'Nikkei 225 (JP)', 'val' => '39,189.78', 'change' => '-0.45%', 'up' => false],
    ['name' => 'Gold (per 10g)', 'val' => '₹72,400', 'change' => '+0.88%', 'up' => true],
    ['name' => 'Bitcoin (USD)', 'val' => '$67,450', 'change' => '+2.30%', 'up' => true],
    ['name' => 'Ethereum (USD)', 'val' => '$3,480', 'change' => '-1.15%', 'up' => false]
];

// Market News list
$newsItems = [
    ['title' => 'TCS reports solid Q4 earnings, announces dividend of ₹28 per share.', 'source' => 'Moneycontrol', 'time' => '1 hour ago'],
    ['title' => 'Reliance Industries retail arm expands operations with new premium hubs.', 'source' => 'Economic Times', 'time' => '2 hours ago'],
    ['title' => 'US Federal Reserve hints at keeping interest rates unchanged in upcoming meeting.', 'source' => 'Reuters', 'time' => '4 hours ago'],
    ['title' => 'IPO Alerts: Multiple startup IPOs scheduled for launch next week; details here.', 'source' => 'Livemint', 'time' => '5 hours ago']
];
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h1 class="h3 fw-bold mb-1">Market Dashboard</h1>
        <p class="text-secondary mb-0 small">Welcome back, <?= htmlspecialchars($user['firstname'] ?? 'Trader') ?>. Here is today's market pulse.</p>
    </div>
    
    <div class="glass-panel py-2 px-3 d-flex align-items-center gap-2" style="border-radius: 20px;">
        <span class="market-pulse-dot <?= !$isMarketOpen ? 'closed' : '' ?>"></span>
        <span class="small fw-semibold text-secondary">
            Market Status: 
            <span class="<?= $isMarketOpen ? 'text-up' : 'text-down' ?>">
                <?= $isMarketOpen ? 'OPEN (IST)' : 'CLOSED' ?>
            </span>
        </span>
    </div>
</div>

<!-- Indices Section -->
<div class="index-widget">
    <?php foreach ($indices as $name => $data): ?>
        <?php $isUp = $data['change'] >= 0; ?>
        <div class="index-card">
            <h6 class="index-name"><?= $name ?></h6>
            <div class="index-val"><?= number_format($data['val'], 2) ?></div>
            <div class="index-change <?= $isUp ? 'text-up' : 'text-down' ?>">
                <i class="bi <?= $isUp ? 'bi-caret-up-fill' : 'bi-caret-down-fill' ?>"></i>
                <span><?= $isUp ? '+' : '' ?><?= number_format($data['change'], 2) ?> (<?= $isUp ? '+' : '' ?><?= $data['pct'] ?>%)</span>
            </div>
        </div>
    <?php endforeach; ?>
</div>

<div class="row g-4">
    <!-- Watchlist Stocks Table -->
    <div class="col-lg-8">
        <div class="fin-card h-100">
            <h5 class="card-title d-flex justify-content-between align-items-center">
                <span>Featured Stock Watch</span>
                <a href="searchStock.php" class="btn btn-sm btn-outline-secondary" style="font-size: 0.75rem; border-radius: 8px;">Explore Tickers</a>
            </h5>
            
            <div class="table-responsive mt-3">
                <table class="fin-table">
                    <thead>
                        <tr>
                            <th>Stock Ticker</th>
                            <th>Open</th>
                            <th>High</th>
                            <th>Low</th>
                            <th>Close (Current)</th>
                            <th>Volume</th>
                            <th>Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $stocksToQuery = ['TCS.BSE', 'RELIANCE.BSE'];
                        foreach ($stocksToQuery as $ticker) {
                            $data = fetchStockData($ticker);
                            $tickerClean = explode('.', $ticker)[0];
                            
                            if (isset($data['error'])) {
                                echo '<tr>';
                                echo '<td><a href="selectedStock.php?ticker=' . $tickerClean . '" class="fw-bold text-decoration-none text-white">' . $tickerClean . '</a></td>';
                                echo '<td colspan="6" class="text-muted text-center py-3">Error: ' . htmlspecialchars($data['error']) . '</td>';
                                echo '</tr>';
                            } else {
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
                                
                                $change = $close - $open;
                                $changePct = ($change / $open) * 100;
                                $isUp = $change >= 0;
                                
                                echo '<tr>';
                                echo '<td><a href="selectedStock.php?ticker=' . $tickerClean . '" class="fw-bold text-decoration-none text-white hover-blue">' . $tickerClean . ' <i class="bi bi-arrow-right-short text-secondary"></i></a></td>';
                                echo '<td>₹' . number_format($open, 2) . '</td>';
                                echo '<td class="text-up">₹' . number_format($high, 2) . '</td>';
                                echo '<td class="text-down">₹' . number_format($low, 2) . '</td>';
                                echo '<td class="fw-bold ' . ($isUp ? 'text-up' : 'text-down') . '">₹' . number_format($close, 2) . '</td>';
                                echo '<td>' . number_format($volume) . '</td>';
                                echo '<td><span class="' . ($isUp ? 'badge-up' : 'badge-down') . '">' . ($isUp ? '+' : '') . number_format($changePct, 2) . '%</span></td>';
                                echo '</tr>';
                            }
                        }
                        ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <!-- Global Commodity & Crypto Widget -->
    <div class="col-lg-4">
        <div class="fin-card h-100">
            <h5 class="card-title">Global Markets & Forex</h5>
            <div class="d-flex flex-column gap-3 mt-3">
                <?php foreach ($globalMarkets as $gm): ?>
                    <div class="d-flex justify-content-between align-items-center p-2 rounded" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color);">
                        <div>
                            <div class="fw-bold small"><?= $gm['name'] ?></div>
                            <div class="text-secondary small mt-1"><?= $gm['val'] ?></div>
                        </div>
                        <span class="<?= $gm['up'] ? 'badge-up' : 'badge-down' ?>"><?= $gm['change'] ?></span>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>

<!-- News & Economic Calendars -->
<div class="row g-4 mt-2">
    <div class="col-md-7">
        <div class="fin-card h-100">
            <h5 class="card-title"><i class="bi bi-newspaper me-2 text-primary"></i> Market News & Insights</h5>
            <div class="d-flex flex-column gap-3 mt-3">
                <?php foreach ($newsItems as $news): ?>
                    <div class="p-3 rounded" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color);">
                        <a href="#" class="text-decoration-none text-white fw-semibold small d-block mb-2 hover-blue"><?= htmlspecialchars($news['title']) ?></a>
                        <div class="d-flex justify-content-between align-items-center" style="font-size: 0.75rem;">
                            <span class="text-primary font-weight-bold"><?= $news['source'] ?></span>
                            <span class="text-secondary"><?= $news['time'] ?></span>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
    
    <div class="col-md-5">
        <div class="fin-card h-100">
            <h5 class="card-title"><i class="bi bi-calendar-event me-2 text-primary"></i> Corporate & IPO Updates</h5>
            <div class="mt-3">
                <div class="d-flex gap-3 align-items-start mb-3">
                    <div class="badge bg-primary p-2" style="border-radius: 8px;">22<br><span style="font-size: 0.65rem;">JUL</span></div>
                    <div>
                        <div class="fw-bold small">Ola Electric Mobility IPO</div>
                        <div class="text-secondary small">Issue Size: ₹6,100 Cr | Status: Upcoming</div>
                    </div>
                </div>
                <div class="d-flex gap-3 align-items-start mb-3">
                    <div class="badge bg-secondary p-2" style="border-radius: 8px;">24<br><span style="font-size: 0.65rem;">JUL</span></div>
                    <div>
                        <div class="fw-bold small">Firstcry Retail IPO</div>
                        <div class="text-secondary small">Issue Size: ₹4,200 Cr | Status: Upcoming</div>
                    </div>
                </div>
                <div class="d-flex gap-3 align-items-start">
                    <div class="badge bg-secondary p-2" style="border-radius: 8px;">28<br><span style="font-size: 0.65rem;">JUL</span></div>
                    <div>
                        <div class="fw-bold small">Tata Motors Board Meeting</div>
                        <div class="text-secondary small">Agenda: Dividend payment and Q1 results approval</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include_once(__DIR__ . '/includes/footer.php'); ?>