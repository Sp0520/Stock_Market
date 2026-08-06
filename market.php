<?php
include_once(__DIR__ . '/includes/header.php');
require_once(__DIR__ . '/config/stock_api.php');

// Define Indian Market Hours status (9:15 AM to 3:30 PM IST, Monday-Friday)
date_default_timezone_set('Asia/Kolkata');
$hour = (int)date('H');
$minute = (int)date('i');
$dayOfWeek = (int)date('N'); // 1 = Mon, 7 = Sun
$currentTimeInMinutes = $hour * 60 + $minute;
$marketOpenMinutes = 9 * 60 + 15; // 9:15 AM
$marketCloseMinutes = 15 * 60 + 30; // 3:30 PM
$isMarketOpen = ($dayOfWeek >= 1 && $dayOfWeek <= 5 && $currentTimeInMinutes >= $marketOpenMinutes && $currentTimeInMinutes <= $marketCloseMinutes);

// Pre-seeded popular stock lists
$popularList = [
    ['symbol' => 'TCS', 'name' => 'Tata Consultancy Services', 'sector' => 'IT'],
    ['symbol' => 'RELIANCE', 'name' => 'Reliance Industries', 'sector' => 'Energy'],
    ['symbol' => 'INFY', 'name' => 'Infosys Ltd.', 'sector' => 'IT'],
    ['symbol' => 'SBIN', 'name' => 'State Bank of India', 'sector' => 'Banking']
];

// Pre-fetch initial popular stocks data
$popularData = [];
foreach ($popularList as $p) {
    $data = fetchStockData($p['symbol']);
    $tick = stockDataToTick($data);
    if ($tick) {
        $popularData[$p['symbol']] = $tick;
    }
}

// Pre-fetch initial indices data
$indicesList = [
    'NIFTY 50' => '^NSEI',
    'SENSEX' => '^BSESN',
    'BANK NIFTY' => '^NSEBANK',
    'FINNIFTY' => 'NIFTY_FIN_SERVICE.NS',
];
$initialIndices = [];
foreach ($indicesList as $name => $ticker) {
    $idxData = fetchStockData($ticker);
    $tick = stockDataToTick($idxData);
    if ($tick) {
        $initialIndices[$name] = [
            'val' => $tick['price'],
            'change' => $tick['change'],
            'pct' => $tick['changePct'],
            'stale' => $tick['stale'],
        ];
    }
}
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <div class="d-flex align-items-center gap-2 mb-1">
            <h1 class="h3 fw-bold mb-0">Market Overview</h1>
            <div id="ws-status-badge" class="ws-badge polling">
                <span class="pulse-dot"></span>
                <span class="badge-text">REST Polling</span>
            </div>
        </div>
        <p class="text-secondary mb-0 small">Welcome back, <?= htmlspecialchars($user['firstname'] ?? 'Trader') ?>. Live financial updates refreshed in real time.</p>
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

<!-- Live Indices Section -->
<div class="index-widget" id="indices-container">
    <?php if (count($initialIndices) > 0): ?>
        <?php foreach ($initialIndices as $name => $index): 
            $isUp = $index['change'] >= 0;
        ?>
            <div class="index-card">
                <h6 class="index-name"><?= htmlspecialchars($name) ?></h6>
                <div class="index-val">₹<?= number_format($index['val'], 2) ?></div>
                <div class="index-change <?= $isUp ? 'text-up' : 'text-down' ?>">
                    <i class="bi <?= $isUp ? 'bi-caret-up-fill' : 'bi-caret-down-fill' ?>"></i>
                    <span><?= $isUp ? '+' : '' ?><?= number_format($index['change'], 2) ?> (<?= $isUp ? '+' : '' ?><?= number_format($index['pct'], 2) ?>%)</span>
                </div>
            </div>
        <?php endforeach; ?>
    <?php else: ?>
        <div class="index-card skeleton" style="height: 90px; flex: 0 0 220px;"></div>
        <div class="index-card skeleton" style="height: 90px; flex: 0 0 220px;"></div>
        <div class="index-card skeleton" style="height: 90px; flex: 0 0 220px;"></div>
        <div class="index-card skeleton" style="height: 90px; flex: 0 0 220px;"></div>
    <?php endif; ?>
</div>

<div class="row g-4 mb-4">
    <!-- Featured Stock Watch -->
    <div class="col-lg-8">
        <div class="fin-card">
            <h5 class="card-title mb-3 d-flex justify-content-between align-items-center">
                <span>Featured Stock Watch</span>
                <a href="searchStock.php" class="btn btn-sm btn-outline-secondary" style="font-size: 0.75rem; border-radius: 8px;">Explore Tickers</a>
            </h5>
            
            <div class="table-responsive">
                <table class="fin-table">
                    <thead>
                        <tr>
                            <th>Stock Ticker</th>
                            <th>Sector</th>
                            <th>Current Price</th>
                            <th>High</th>
                            <th>Low</th>
                            <th>Change</th>
                        </tr>
                    </thead>
                    <tbody id="featured-stocks-body">
                        <?php foreach ($popularList as $p): 
                            $tick = $popularData[$p['symbol']] ?? null;
                            $price = $tick ? $tick['price'] : 0.00;
                            $high = $tick ? $tick['high'] : 0.00;
                            $low = $tick ? $tick['low'] : 0.00;
                            $changePct = $tick ? $tick['changePct'] : 0.00;
                            $change = $tick ? $tick['change'] : 0.00;
                            $isUp = $change >= 0;
                        ?>
                            <tr id="featured-row-<?= $p['symbol'] ?>">
                                <td>
                                    <a href="stock.php?symbol=<?= $p['symbol'] ?>" class="fw-bold text-white text-decoration-none hover-blue">
                                        <?= $p['symbol'] ?> <i class="bi bi-arrow-right-short text-secondary"></i>
                                    </a>
                                </td>
                                <td><span class="text-secondary small"><?= $p['sector'] ?></span></td>
                                <td class="fw-bold index-val">₹<?= number_format($price, 2) ?></td>
                                <td class="text-up">₹<?= number_format($high, 2) ?></td>
                                <td class="text-down">₹<?= number_format($low, 2) ?></td>
                                <td><span class="<?= $isUp ? 'badge-up' : 'badge-down' ?>"><?= ($isUp ? '+' : '') ?><?= number_format($changePct, 2) ?>%</span></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Global Commodity & Crypto Widget -->
    <div class="col-lg-4">
        <div class="fin-card h-100">
            <h5 class="card-title">Global Markets & Commodities</h5>
            <div class="d-flex flex-column gap-3 mt-3" id="global-commodities">
                <!-- Seeded indicators -->
                <div class="d-flex justify-content-between align-items-center p-2 rounded" style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color);">
                    <div>
                        <div class="fw-bold small text-white">S&P 500 (US)</div>
                        <div class="text-secondary small mt-1">5,117.09</div>
                    </div>
                    <span class="badge-up">+1.03%</span>
                </div>
                <div class="d-flex justify-content-between align-items-center p-2 rounded" style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color);">
                    <div>
                        <div class="fw-bold small text-white">Gold (per 10g)</div>
                        <div class="text-secondary small mt-1">₹72,400</div>
                    </div>
                    <span class="badge-up">+0.88%</span>
                </div>
                <div class="d-flex justify-content-between align-items-center p-2 rounded" style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color);">
                    <div>
                        <div class="fw-bold small text-white">Bitcoin (USD)</div>
                        <div class="text-secondary small mt-1">$67,450</div>
                    </div>
                    <span class="badge-up">+2.30%</span>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Heatmap & Gainers/Losers -->
<div class="row g-4 mb-4">
    <!-- Top Gainers / Losers Tabs -->
    <div class="col-lg-6">
        <div class="fin-card h-100">
            <ul class="nav nav-pills mb-3 gap-2" id="moversTabs" role="tablist" style="border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <li class="nav-item">
                    <button class="nav-link active btn-sm text-success" id="gainers-tab" data-bs-toggle="pill" data-bs-target="#gainers" type="button" role="tab">Top Gainers</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link btn-sm text-danger" id="losers-tab" data-bs-toggle="pill" data-bs-target="#losers" type="button" role="tab">Top Losers</button>
                </li>
            </ul>
            
            <div class="tab-content" id="moversTabsContent">
                <div class="tab-pane fade show active" id="gainers" role="tabpanel">
                    <div id="gainers-list" class="d-flex flex-column gap-2 mt-2"></div>
                </div>
                <div class="tab-pane fade" id="losers" role="tabpanel">
                    <div id="losers-list" class="d-flex flex-column gap-2 mt-2"></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Heatmap Grid -->
    <div class="col-lg-6">
        <div class="fin-card h-100">
            <h5 class="card-title">Sector Performance Heatmap</h5>
            <p class="text-secondary small mb-3">Live color-coded sector valuation indexes</p>
            <div class="row g-2" style="font-size: 0.85rem;">
                <div class="col-6">
                    <div class="p-3 text-center rounded text-success" style="background: rgba(0, 200, 83, 0.12); border: 1.5px solid var(--color-green);">
                        <div class="fw-bold">Technology (IT)</div>
                        <div class="mt-1 small fw-semibold">+2.15%</div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="p-3 text-center rounded text-success" style="background: rgba(0, 200, 83, 0.08); border: 1px solid var(--color-green); opacity: 0.85;">
                        <div class="fw-bold text-white">Financials</div>
                        <div class="mt-1 small fw-semibold text-success">+0.84%</div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="p-3 text-center rounded text-danger" style="background: rgba(255, 61, 87, 0.1); border: 1px solid var(--color-red); opacity: 0.85;">
                        <div class="fw-bold text-white">Energy & Oil</div>
                        <div class="mt-1 small fw-semibold text-danger">-0.55%</div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="p-3 text-center rounded text-success" style="background: rgba(0, 200, 83, 0.05); border: 1.5px solid var(--border-color);">
                        <div class="fw-bold text-white">Automotive</div>
                        <div class="mt-1 small fw-semibold text-success">+0.32%</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Market News -->
<div class="row g-4">
    <div class="col-md-7">
        <div class="fin-card h-100">
            <h5 class="card-title mb-3"><i class="bi bi-newspaper me-2 text-primary"></i> Market News Insights</h5>
            <div class="d-flex flex-column gap-3" id="live-news-container">
                <!-- News loaded dynamically -->
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
                        <div class="fw-bold small text-white">Ola Electric Mobility IPO</div>
                        <div class="text-secondary small">Issue Size: ₹6,100 Cr | Status: Open</div>
                    </div>
                </div>
                <div class="d-flex gap-3 align-items-start mb-3">
                    <div class="badge bg-secondary p-2" style="border-radius: 8px;">24<br><span style="font-size: 0.65rem;">JUL</span></div>
                    <div>
                        <div class="fw-bold small text-white">Firstcry Retail IPO</div>
                        <div class="text-secondary small">Issue Size: ₹4,200 Cr | Status: Upcoming</div>
                    </div>
                </div>
                <div class="d-flex gap-3 align-items-start">
                    <div class="badge bg-secondary p-2" style="border-radius: 8px;">28<br><span style="font-size: 0.65rem;">JUL</span></div>
                    <div>
                        <div class="fw-bold small text-white">Tata Motors Board Meeting</div>
                        <div class="text-secondary small">Agenda: Dividend payment and Q1 results approval</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Real-time polling & WebSocket streaming script -->
<script>
    let ws = null;
    let pollingInterval = null;
    let wsConnectAttempts = 0;
    
    let prevIndexPrices = {};
    let prevFeaturedPrices = {};

    $(document).ready(function() {
        // Initialize dashboard updates
        connectWebSocket();
        pollMarketNews();
        
        // News updates every 15 seconds
        setInterval(pollMarketNews, 15000);
        
        // Safety Fallback Trigger (if WS doesn't connect in 2 seconds)
        setTimeout(function() {
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                startRestFallback();
            }
        }, 2000);
    });
    
    function updateStatusBadge(status) {
        const badge = $('#ws-status-badge');
        const text = badge.find('.badge-text');
        badge.removeClass('connected polling disconnected');
        
        if (status === "connected") {
            badge.addClass('connected');
            text.text("Live (WS)");
        } else if (status === "polling") {
            badge.addClass('polling');
            text.text("Live (REST)");
        } else {
            badge.addClass('disconnected');
            text.text("Reconnecting...");
        }
    }
    
    function startRestFallback() {
        if (!pollingInterval) {
            updateStatusBadge("polling");
            pollMarketDashboardFallback();
            pollingInterval = setInterval(pollMarketDashboardFallback, 5000);
        }
    }
    
    function connectWebSocket() {
        const wsUrl = "ws://" + window.location.hostname + ":8080";
        console.log("Connecting dashboard to WebSocket: " + wsUrl);
        ws = new WebSocket(wsUrl);
        
        ws.onopen = function() {
            console.log("Dashboard WebSocket connected!");
            wsConnectAttempts = 0;
            updateStatusBadge("connected");
            
            // Subscribe to dashboard stream
            ws.send(JSON.stringify({
                type: 'subscribe',
                symbol: 'DASHBOARD'
            }));
            
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
            }
        };
        
        ws.onmessage = function(event) {
            try {
                const response = JSON.parse(event.data);
                if (response.type === 'dashboard') {
                    updateDashboardUI(response);
                }
            } catch(e) {
                console.error("Error parsing dashboard WebSocket message", e);
            }
        };
        
        ws.onclose = function() {
            console.log("Dashboard WebSocket disconnected.");
            startRestFallback();
            
            // Exponential backoff reconnect
            wsConnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, wsConnectAttempts), 30000);
            updateStatusBadge("disconnected");
            setTimeout(connectWebSocket, delay);
        };
        
        ws.onerror = function(err) {
            console.error("Dashboard WebSocket error:", err);
            ws.close();
        };
    }
    
    function updateDashboardUI(res) {
        // 1. Update index cards
        let indicesHtml = '';
        for (const [name, index] of Object.entries(res.indices)) {
            const isUp = index.change >= 0;
            const oldVal = prevIndexPrices[name];
            let flashClass = '';
            
            if (oldVal && oldVal !== index.val) {
                flashClass = index.val > oldVal ? 'flash-green' : 'flash-red';
            }
            prevIndexPrices[name] = index.val;
            
            indicesHtml += `<div class="index-card">
                <h6 class="index-name">${name}</h6>
                <div class="index-val ${flashClass}">₹${index.val.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                <div class="index-change ${isUp ? 'text-up' : 'text-down'}">
                    <i class="bi ${isUp ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}"></i>
                    <span>${isUp ? '+' : ''}${index.change.toFixed(2)} (${isUp ? '+' : ''}${index.pct.toFixed(2)}%)</span>
                </div>
            </div>`;
        }
        $('#indices-container').html(indicesHtml);
        
        // 2. Update Gainers list
        let gainersHtml = '';
        res.gainers.forEach(g => {
            gainersHtml += `<a href="stock.php?symbol=${g.symbol}" class="d-flex justify-content-between align-items-center p-2 rounded text-decoration-none" style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color);">
                <div>
                    <span class="fw-bold text-white">${g.symbol}</span>
                    <span class="text-secondary small ms-2 d-none d-sm-inline">${g.name}</span>
                </div>
                <div class="text-end">
                    <div class="fw-bold text-white">₹${g.price.toFixed(2)}</div>
                    <span class="badge-up font-weight-bold">+${g.pct.toFixed(2)}%</span>
                </div>
            </a>`;
        });
        $('#gainers-list').html(gainersHtml);
        
        // 3. Update Losers list
        let losersHtml = '';
        res.losers.forEach(l => {
            losersHtml += `<a href="stock.php?symbol=${l.symbol}" class="d-flex justify-content-between align-items-center p-2 rounded text-decoration-none" style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color);">
                <div>
                    <span class="fw-bold text-white">${l.symbol}</span>
                    <span class="text-secondary small ms-2 d-none d-sm-inline">${l.name}</span>
                </div>
                <div class="text-end">
                    <div class="fw-bold text-white">₹${l.price.toFixed(2)}</div>
                    <span class="badge-down font-weight-bold">${l.pct.toFixed(2)}%</span>
                </div>
            </a>`;
        });
        $('#losers-list').html(losersHtml);
        
        // 4. Update Featured stock list
        if (res.quotes) {
            res.quotes.forEach(q => {
                updateTickerRow(q);
            });
        }
    }
    
    function updateTickerRow(res) {
        const symbol = res.symbol;
        const row = $('#featured-row-' + symbol);
        if (row.length) {
            const valEl = row.find('.index-val');
            const oldVal = prevFeaturedPrices[symbol];
            
            valEl.text('₹' + res.price.toLocaleString('en-IN', {minimumFractionDigits: 2}));
            row.find('.text-up').text('₹' + res.high.toLocaleString('en-IN', {minimumFractionDigits: 2}));
            row.find('.text-down').text('₹' + res.low.toLocaleString('en-IN', {minimumFractionDigits: 2}));
            
            if (oldVal && oldVal !== res.price) {
                valEl.removeClass('flash-green flash-red');
                void valEl[0].offsetWidth; // trigger reflow
                valEl.addClass(res.price > oldVal ? 'flash-green' : 'flash-red');
            }
            prevFeaturedPrices[symbol] = res.price;
            
            const isUp = res.change >= 0;
            const badge = row.find('span.badge-up, span.badge-down');
            
            badge.removeClass('badge-up badge-down').addClass(isUp ? 'badge-up' : 'badge-down');
            badge.text((isUp ? '+' : '') + res.changePct.toFixed(2) + '%');
        }
    }
    
    function pollMarketDashboardFallback() {
        $.ajax({
            url: './api/market.php',
            type: 'GET',
            dataType: 'json',
            success: function(res) {
                if (res.success) {
                    // Adapt REST response to the dashboard UI
                    // Construct quotes array from gainers and losers
                    const restData = {
                        type: 'dashboard',
                        indices: res.indices,
                        gainers: res.gainers,
                        losers: res.losers,
                        quotes: []
                    };
                    
                    // Trigger asynchronous REST polling for the individual featured rows
                    const featuredTickers = ['TCS', 'RELIANCE', 'INFY', 'SBIN'];
                    featuredTickers.forEach(t => {
                        $.ajax({
                            url: './api/market.php',
                            type: 'GET',
                            data: { symbol: t },
                            dataType: 'json',
                            success: function(singleQuote) {
                                if (singleQuote.success) {
                                    updateTickerRow(singleQuote);
                                }
                            }
                        });
                    });
                    
                    updateDashboardUI(restData);
                }
            }
        });
    }
    
    function pollMarketNews() {
        $.ajax({
            url: './api/news.php',
            type: 'GET',
            dataType: 'json',
            success: function(res) {
                if (res.success && res.news.length > 0) {
                    let newsHtml = '';
                    res.news.forEach(item => {
                        newsHtml += `<div class="p-3 rounded d-flex gap-3" style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color);">
                            <img src="${item.image}" alt="News image" class="rounded" style="width: 80px; height: 60px; object-fit: cover;">
                            <div class="flex-grow-1">
                                <a href="#" class="text-decoration-none text-white fw-semibold small d-block mb-1 hover-blue">${item.title}</a>
                                <div class="d-flex justify-content-between align-items-center" style="font-size: 0.75rem;">
                                    <span class="text-primary font-weight-bold">${item.source}</span>
                                    <span class="text-secondary">${item.time}</span>
                                </div>
                            </div>
                        </div>`;
                    });
                    $('#live-news-container').html(newsHtml);
                }
            }
        });
    }
</script>

<?php include_once(__DIR__ . '/includes/footer.php'); ?>