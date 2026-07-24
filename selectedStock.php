<?php
include_once(__DIR__ . '/includes/header.php');

$ticker = strtoupper(explode(".", $_GET["ticker"] ?? "TCS")[0]);

$data = fetchStockData($ticker);
$hasData = ($data && !isset($data['error']) && isset($data['Meta Data'], $data['Time Series (Daily)']));
$errorMessage = isset($data['error']) ? $data['error'] : 'Unknown error';

$open = 0; $high = 0; $low = 0; $close = 0; $volume = 0;
$change = 0; $changePct = 0; $isUp = true;

if ($hasData) {
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
    
    $prevClose = isset($meta['4. Previous Close']) ? (float)$meta['4. Previous Close'] : $open;
    $change = $close - $prevClose;
    $changePct = ($change / $prevClose) * 100;
    $isUp = $change >= 0;
}

// Generate Mock Fundamental Metrics
$mcap = ($close * 10000000) / 10000000; // Mock calculation
$mcapFormatted = number_format($close * 18.5, 2) . ' Cr';
$peRatio = number_format(25.4 + ($close / 400), 2);
$eps = number_format($close / 28, 2);
$divYield = number_format(1.2 + ($close / 3000), 2) . '%';
$roe = number_format(18.2 + ($close / 1000), 2) . '%';
$yearHigh = number_format($close * 1.15, 2);
$yearLow = number_format($close * 0.85, 2);

// Check if this stock is in the user's pinned watchlist
$inWatchlist = false;
if ($user) {
    $stmt = mysqli_prepare($conn, "SELECT ws.stock_name FROM watchlist_stocks ws 
                                  JOIN watchlists w ON ws.watchlist_id = w.id 
                                  WHERE w.user_id = ? AND ws.stock_name = ?");
    mysqli_stmt_bind_param($stmt, "is", $user['id'], $ticker);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);
    if (mysqli_stmt_num_rows($stmt) > 0) {
        $inWatchlist = true;
    }
    mysqli_stmt_close($stmt);
}
?>

<div class="d-flex justify-content-between align-items-start mb-4">
    <div>
        <div class="d-flex align-items-center gap-2">
            <h1 class="h3 fw-bold mb-1"><?= $ticker ?></h1>
            <span class="badge bg-secondary" style="font-size: 0.75rem;">BSE</span>
        </div>
        <p class="text-secondary mb-0 small">BSE Stock Performance & Analysis</p>
    </div>
    
    <!-- Watchlist Add/Remove Toggle Button -->
    <button class="btn btn-outline-primary d-flex align-items-center gap-2" id="btn-toggle-watchlist" data-ticker="<?= $ticker ?>" style="border-radius: 20px; font-size: 0.9rem;">
        <i class="bi <?= $inWatchlist ? 'bi-bookmark-star-fill text-warning' : 'bi-bookmark-star' ?>"></i>
        <span><?= $inWatchlist ? 'Watchlisted' : 'Add to Watchlist' ?></span>
    </button>
</div>

<?php if (!$hasData): ?>
    <div class="glass-panel p-5 text-center my-4">
        <div class="text-danger mb-3" style="font-size: 3rem;"><i class="bi bi-exclamation-octagon"></i></div>
        <h4 class="fw-bold">Stock Data Unavailable</h4>
        <p class="text-secondary max-width-600 mx-auto">Reason: <?= htmlspecialchars($errorMessage) ?>. AlphaVantage API standard rate limits may have been reached, or the stock symbol is invalid. Try again in a minute.</p>
        <a href="market.php" class="btn btn-primary-custom mt-3">Return to Market</a>
    </div>
<?php else: ?>
    <!-- Price & Change Cards -->
    <div class="row g-4 mb-4">
        <div class="col-md-6 col-lg-3">
            <div class="fin-card">
                <div class="card-title">Current Price</div>
                <div class="card-value">₹<?= number_format($close, 2) ?></div>
                <div class="<?= $isUp ? 'text-up' : 'text-down' ?> fw-semibold small">
                    <i class="bi <?= $isUp ? 'bi-arrow-up' : 'bi-arrow-down' ?>"></i>
                    <span><?= $isUp ? '+' : '' ?>₹<?= number_format($change, 2) ?> (<?= $isUp ? '+' : '' ?><?= number_format($changePct, 2) ?>%)</span>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-lg-3">
            <div class="fin-card">
                <div class="card-title">Day High / Low</div>
                <div class="card-value" style="font-size: 1.5rem; margin-top: 6px;">₹<?= number_format($high, 2) ?> <span class="text-secondary" style="font-size: 1rem;">/</span> ₹<?= number_format($low, 2) ?></div>
                <div class="text-secondary small mt-1">Intraday fluctuation spread</div>
            </div>
        </div>
        <div class="col-md-6 col-lg-3">
            <div class="fin-card">
                <div class="card-title">Market Cap</div>
                <div class="card-value"><?= $mcapFormatted ?></div>
                <div class="text-secondary small">Estimated value of total shares</div>
            </div>
        </div>
        <div class="col-md-6 col-lg-3">
            <div class="fin-card">
                <div class="card-title">Volume (Shares Traded)</div>
                <div class="card-value"><?= number_format($volume) ?></div>
                <div class="text-secondary small">Total intraday trading volume</div>
            </div>
        </div>
    </div>

    <!-- Live Chart section (TradingView widget) -->
    <div class="row g-4 mb-4">
        <div class="col-lg-8">
            <div class="fin-card p-0" style="height: 480px; overflow: hidden;">
                <!-- TradingView Widget BEGIN -->
                <div class="tradingview-widget-container" style="height: 100%; width: 100%;">
                    <div id="tradingview_chart" style="height: calc(100% - 32px);"></div>
                    <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
                    <script type="text/javascript">
                    new TradingView.widget({
                        "width": "100%",
                        "height": "100%",
                        "symbol": "BSE:<?= $ticker ?>",
                        "interval": "D",
                        "timezone": "Asia/Kolkata",
                        "theme": localStorage.getItem("theme") || "dark",
                        "style": "1",
                        "locale": "en",
                        "enable_publishing": false,
                        "allow_symbol_change": true,
                        "container_id": "tradingview_chart"
                    });
                    </script>
                </div>
                <!-- TradingView Widget END -->
            </div>
        </div>
        
        <!-- Buy/Sell Form Drawer -->
        <div class="col-lg-4">
            <div class="fin-card">
                <h5 class="card-title">Place Order</h5>
                
                <ul class="nav nav-tabs nav-fill mb-3" style="border-bottom: 1px solid var(--border-color);">
                    <li class="nav-item">
                        <button class="nav-link active text-success fw-bold bg-transparent border-0" id="tab-buy" onclick="setOrderMode('buy')">BUY</button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link text-secondary fw-bold bg-transparent border-0" id="tab-sell" onclick="setOrderMode('sell')">SELL</button>
                    </li>
                </ul>
                
                <form id="orderForm" action="portfolios.php" method="post">
                    <input type="hidden" name="action" id="order-action" value="buy_stock">
                    <input type="hidden" name="stock_name" value="<?= htmlspecialchars($ticker) ?>">
                    <input type="hidden" name="purchase_price" value="<?= $close ?>">
                    <input type="hidden" name="sell_price" value="<?= $close ?>">
                    
                    <div class="mb-3">
                        <label class="text-secondary small fw-semibold mb-2">Ticker Symbol</label>
                        <input type="text" class="form-control bg-transparent text-white border-secondary" value="<?= $ticker ?>" disabled style="border-radius: var(--border-radius);">
                    </div>
                    
                    <div class="mb-3">
                        <label class="text-secondary small fw-semibold mb-2">Order Type</label>
                        <select class="form-select bg-transparent text-white border-secondary" style="border-radius: var(--border-radius);">
                            <option value="market" class="text-dark">Market Price (Instant)</option>
                            <option value="limit" class="text-dark" disabled>Limit Price (Locked)</option>
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label class="text-secondary small fw-semibold mb-2">Quantity</label>
                        <input type="number" class="form-control bg-transparent text-white border-secondary" name="quantity" id="order-qty" value="1" min="1" required style="border-radius: var(--border-radius);" oninput="recalcOrderTotal()">
                    </div>
                    
                    <div class="p-3 mb-4 rounded" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between small text-secondary mb-2">
                            <span>Share Price</span>
                            <span>₹<?= number_format($close, 2) ?></span>
                        </div>
                        <div class="d-flex justify-content-between small text-secondary mb-2">
                            <span>Charges (GST/Brokerage)</span>
                            <span id="order-charges">₹0.00</span>
                        </div>
                        <hr class="text-secondary my-2">
                        <div class="d-flex justify-content-between fw-bold">
                            <span>Estimated Total</span>
                            <span class="text-primary" id="order-total">₹<?= number_format($close, 2) ?></span>
                        </div>
                    </div>
                    
                    <button type="submit" id="order-submit-btn" class="btn btn-buy">BUY SHARES</button>
                </form>
            </div>
        </div>
    </div>

    <!-- Fundamentals Section -->
    <div class="row g-4">
        <div class="col-lg-6">
            <div class="fin-card h-100">
                <h5 class="card-title">Stock Fundamentals</h5>
                <div class="row g-3 mt-1">
                    <div class="col-6 border-bottom pb-2" style="border-color: var(--border-color) !important;">
                        <span class="text-secondary small d-block">Open Price</span>
                        <span class="fw-bold">₹<?= number_format($open, 2) ?></span>
                    </div>
                    <div class="col-6 border-bottom pb-2" style="border-color: var(--border-color) !important;">
                        <span class="text-secondary small d-block">Previous Close</span>
                        <span class="fw-bold">₹<?= number_format($close - $change, 2) ?></span>
                    </div>
                    <div class="col-6 border-bottom pb-2" style="border-color: var(--border-color) !important;">
                        <span class="text-secondary small d-block">P/E Ratio</span>
                        <span class="fw-bold"><?= $peRatio ?></span>
                    </div>
                    <div class="col-6 border-bottom pb-2" style="border-color: var(--border-color) !important;">
                        <span class="text-secondary small d-block">Earnings Per Share (EPS)</span>
                        <span class="fw-bold">₹<?= $eps ?></span>
                    </div>
                    <div class="col-6 border-bottom pb-2" style="border-color: var(--border-color) !important;">
                        <span class="text-secondary small d-block">Dividend Yield</span>
                        <span class="fw-bold"><?= $divYield ?></span>
                    </div>
                    <div class="col-6 border-bottom pb-2" style="border-color: var(--border-color) !important;">
                        <span class="text-secondary small d-block">ROE</span>
                        <span class="fw-bold"><?= $roe ?></span>
                    </div>
                    <div class="col-6">
                        <span class="text-secondary small d-block">52-Week High</span>
                        <span class="fw-bold text-up">₹<?= $yearHigh ?></span>
                    </div>
                    <div class="col-6">
                        <span class="text-secondary small d-block">52-Week Low</span>
                        <span class="fw-bold text-down">₹<?= $yearLow ?></span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-lg-6">
            <div class="fin-card h-100">
                <h5 class="card-title">Corporate Information</h5>
                <p class="text-secondary small mt-2 leading-relaxed">
                    <?= $ticker ?> Ltd. is one of the premier organizations operating in the industrial and financial segments, catering to millions of global consumers. Led by professional directors, it has consistently delivered superior equity returns and maintained solid corporate governance standards over past decades.
                </p>
                <div class="row g-3 mt-2" style="font-size: 0.85rem;">
                    <div class="col-md-6">
                        <span class="text-secondary d-block">Managing Director & CEO</span>
                        <span class="fw-bold text-white">N. Chandrasekaran</span>
                    </div>
                    <div class="col-md-6">
                        <span class="text-secondary d-block">Corporate Headquarters</span>
                        <span class="fw-bold text-white">Mumbai, Maharashtra, India</span>
                    </div>
                    <div class="col-md-6">
                        <span class="text-secondary d-block">Sectors / Industry</span>
                        <span class="fw-bold text-white">Information Technology / Consulting</span>
                    </div>
                    <div class="col-md-6">
                        <span class="text-secondary d-block">Official Website</span>
                        <a href="https://www.google.com" target="_blank" class="fw-bold text-primary text-decoration-none">Visit Company Site</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
<?php endif; ?>

<!-- Client-side calculations & Watchlist Toggle AJAX logic -->
<script>
    const sharePrice = <?= $close ?>;
    
    function setOrderMode(mode) {
        const actionInput = document.getElementById('order-action');
        const submitBtn = document.getElementById('order-submit-btn');
        const buyTab = document.getElementById('tab-buy');
        const sellTab = document.getElementById('tab-sell');
        
        if (mode === 'buy') {
            actionInput.value = 'buy_stock';
            submitBtn.innerText = 'BUY SHARES';
            submitBtn.className = 'btn btn-buy';
            buyTab.classList.add('active', 'text-success');
            sellTab.classList.remove('active', 'text-danger');
            sellTab.classList.add('text-secondary');
        } else {
            actionInput.value = 'sell_stock';
            submitBtn.innerText = 'SELL SHARES';
            submitBtn.className = 'btn btn-sell';
            sellTab.classList.add('active', 'text-danger');
            buyTab.classList.remove('active', 'text-success');
            buyTab.classList.add('text-secondary');
        }
        recalcOrderTotal();
    }
    
    function recalcOrderTotal() {
        const qty = parseInt(document.getElementById('order-qty').value) || 1;
        const subtotal = sharePrice * qty;
        
        // Brokerage charge: flat 0.05% or min ₹20
        const brokerage = Math.max(20, subtotal * 0.0005);
        const total = subtotal + brokerage;
        
        document.getElementById('order-charges').innerText = '₹' + brokerage.toFixed(2);
        document.getElementById('order-total').innerText = '₹' + total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }

    // Toggle watchlist AJAX handler
    document.getElementById('btn-toggle-watchlist').addEventListener('click', function() {
        const btn = this;
        const ticker = btn.getAttribute('data-ticker');
        const icon = btn.querySelector('i');
        const label = btn.querySelector('span');
        
        $.ajax({
            url: './api/watchlist.php',
            type: 'POST',
            data: {
                action: 'toggle',
                ticker: ticker,
                csrf_token: '<?= $_SESSION['csrf_token'] ?? '' ?>'
            },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    if (response.status === 'added') {
                        icon.className = 'bi bi-bookmark-star-fill text-warning';
                        label.innerText = 'Watchlisted';
                    } else {
                        icon.className = 'bi bi-bookmark-star';
                        label.innerText = 'Add to Watchlist';
                    }
                } else {
                    alert('Watchlist update failed: ' . response.error);
                }
            },
            error: function() {
                alert('Connection failure updating watchlist.');
            }
        });
    });
</script>

<?php include_once(__DIR__ . '/includes/footer.php'); ?>