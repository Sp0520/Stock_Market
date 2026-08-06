<?php
include_once(__DIR__ . '/includes/header.php');
require_once(__DIR__ . '/config/stock_api.php');

$symbol = isset($_GET['symbol']) ? strtoupper(trim($_GET['symbol'])) : 'TCS';
$symbolClean = explode('.', $symbol)[0];

// Check if stock is in user watchlist
$inWatchlist = false;
if ($user) {
    $stmt = mysqli_prepare($conn, "SELECT ws.stock_name FROM watchlist_stocks ws 
                                  JOIN watchlists w ON ws.watchlist_id = w.id 
                                  WHERE w.user_id = ? AND ws.stock_name = ?");
    mysqli_stmt_bind_param($stmt, "is", $user['id'], $symbolClean);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);
    if (mysqli_stmt_num_rows($stmt) > 0) {
        $inWatchlist = true;
    }
    mysqli_stmt_close($stmt);
}

// Fetch initial stock details for server rendering
$stockData = fetchStockData($symbolClean);
$hasStockData = ($stockData && !isset($stockData['error']));

$initialPrice = 0.00;
$initialChange = 0.00;
$initialChangePct = 0.00;
$initialTimestamp = '--:--:--';
$isPriceUp = true;

if ($hasStockData) {
    $tick = stockDataToTick($stockData);
    if ($tick) {
        $initialPrice = $tick['price'];
        $initialChange = $tick['change'];
        $initialChangePct = $tick['changePct'];
        $initialTimestamp = explode(' ', $tick['timestamp'])[1];
        $isPriceUp = $initialChange >= 0;
    }
}
?>

<!-- Stock Page Main Wrapper -->
<div class="row g-4 mt-2">
    <!-- Left Column: Details & Tabs -->
    <div class="col-lg-8">
        <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
                <div class="d-flex align-items-center gap-3">
                    <!-- Dynamic mockup logo -->
                    <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style="width: 48px; height: 48px; font-size: 1.25rem;">
                        <?= substr($symbolClean, 0, 2) ?>
                    </div>
                    <div>
                        <h1 class="h3 fw-bold mb-1" id="company-name"><?= $symbolClean ?></h1>
                        <span class="badge bg-secondary" style="font-size: 0.75rem;">BSE: <?= $symbolClean ?></span>
                    </div>
                </div>
            </div>
            
            <div class="d-flex gap-2">
                <button class="btn btn-outline-primary d-flex align-items-center gap-2" id="btn-watchlist-toggle" data-ticker="<?= $symbolClean ?>" style="border-radius: 20px;">
                    <i class="bi <?= $inWatchlist ? 'bi-bookmark-star-fill text-warning' : 'bi-bookmark-star' ?>"></i>
                    <span><?= $inWatchlist ? 'Watchlisted' : 'Add to Watchlist' ?></span>
                </button>
            </div>
        </div>
        
        <!-- Live Price Info -->
        <div class="glass-panel p-4 mb-4">
            <div class="row align-items-center">
                <div class="col-sm-6">
                    <div class="d-flex align-items-center gap-2 mb-1">
                        <span class="text-secondary small">Live Share Price</span>
                        <div id="ws-status-badge" class="ws-badge polling">
                            <span class="pulse-dot"></span>
                            <span class="badge-text">REST Polling</span>
                        </div>
                    </div>
                    <h2 class="fw-bold mb-1" id="live-price" style="font-size: 2.25rem;">₹<?= number_format($initialPrice, 2) ?></h2>
                    <div id="live-change-container" class="fw-semibold small <?= $isPriceUp ? 'text-up' : 'text-down' ?>">
                        <span id="live-change"><?= ($isPriceUp ? '+' : '') ?>₹<?= number_format($initialChange, 2) ?> (<?= ($isPriceUp ? '+' : '') ?><?= number_format($initialChangePct, 2) ?>%)</span>
                    </div>
                </div>
                <div class="col-sm-6 text-sm-end mt-3 mt-sm-0">
                    <span class="text-secondary small d-block">Last Refreshed</span>
                    <span class="fw-bold text-white" id="live-timestamp"><?= htmlspecialchars($initialTimestamp) ?></span>
                </div>
            </div>
        </div>

        <!-- TradingView Chart Widget -->
        <div class="glass-panel p-0 mb-4" style="height: 450px; overflow: hidden; border-radius: var(--border-radius);">
            <div id="tradingview_stock_chart" style="height: 100%; width: 100%;"></div>
            <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
            <script type="text/javascript">
                new TradingView.widget({
                    "width": "100%",
                    "height": "100%",
                    "symbol": "BSE:<?= $symbolClean ?>",
                    "interval": "D",
                    "timezone": "Asia/Kolkata",
                    "theme": localStorage.getItem("theme") || "dark",
                    "style": "1",
                    "locale": "en",
                    "toolbar_bg": "#f1f3f6",
                    "enable_publishing": false,
                    "hide_side_toolbar": false,
                    "allow_symbol_change": true,
                    "container_id": "tradingview_stock_chart"
                });
            </script>
        </div>

        <!-- Tabs Container -->
        <div class="glass-panel p-4 mb-4">
            <ul class="nav nav-pills mb-4 gap-2" id="stockTabs" role="tablist" style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
                <li class="nav-item">
                    <button class="nav-link active btn-sm" id="profile-tab" data-bs-toggle="pill" data-bs-target="#profile" type="button" role="tab">Overview</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link btn-sm" id="financials-tab" data-bs-toggle="pill" data-bs-target="#financials" type="button" role="tab">Financials</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link btn-sm" id="shareholding-tab" data-bs-toggle="pill" data-bs-target="#shareholding" type="button" role="tab">Shareholding</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link btn-sm" id="actions-tab" data-bs-toggle="pill" data-bs-target="#actions" type="button" role="tab">Corporate Actions</button>
                </li>
            </ul>
            
            <div class="tab-content" id="stockTabsContent">
                <!-- Overview Tab -->
                <div class="tab-pane fade show active" id="profile" role="tabpanel">
                    <h5 class="fw-bold mb-3 text-white">About Company</h5>
                    <p class="text-secondary small leading-relaxed mb-4" id="company-desc">Loading description...</p>
                    
                    <div class="row g-3" style="font-size: 0.875rem;">
                        <div class="col-md-6 border-bottom pb-2" style="border-color: var(--border-color) !important;">
                            <span class="text-secondary d-block">Managing Director & CEO</span>
                            <span class="fw-bold text-white" id="company-ceo">--</span>
                        </div>
                        <div class="col-md-6 border-bottom pb-2" style="border-color: var(--border-color) !important;">
                            <span class="text-secondary d-block">Corporate Headquarters</span>
                            <span class="fw-bold text-white" id="company-hq">--</span>
                        </div>
                        <div class="col-md-6 border-bottom pb-2" style="border-color: var(--border-color) !important;">
                            <span class="text-secondary d-block">Industry</span>
                            <span class="fw-bold text-white" id="company-industry">--</span>
                        </div>
                        <div class="col-md-6 border-bottom pb-2" style="border-color: var(--border-color) !important;">
                            <span class="text-secondary d-block">Founded</span>
                            <span class="fw-bold text-white" id="company-founded">--</span>
                        </div>
                    </div>
                </div>
                
                <!-- Financials Tab -->
                <div class="tab-pane fade" id="financials" role="tabpanel">
                    <h5 class="fw-bold mb-3 text-white">Quarterly Performance</h5>
                    <div class="table-responsive mb-4">
                        <table class="fin-table" style="font-size: 0.85rem;">
                            <thead>
                                <tr>
                                    <th>Quarter</th>
                                    <th>Revenue (₹ Cr)</th>
                                    <th>Net Profit (₹ Cr)</th>
                                    <th>Profit Margin (%)</th>
                                </tr>
                            </thead>
                            <tbody id="financials-quarters-body">
                                <!-- Dynamic rows -->
                            </tbody>
                        </table>
                    </div>
                    
                    <h5 class="fw-bold mb-3 text-white">Balance Sheet Summary</h5>
                    <div class="row g-4">
                        <div class="col-md-6">
                            <div class="p-3 rounded" style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color);">
                                <h6 class="fw-bold text-primary mb-2">Liabilities</h6>
                                <div id="balance-sheet-liabilities" class="small"></div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="p-3 rounded" style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color);">
                                <h6 class="fw-bold text-success mb-2">Assets</h6>
                                <div id="balance-sheet-assets" class="small"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Shareholding Tab -->
                <div class="tab-pane fade" id="shareholding" role="tabpanel">
                    <h5 class="fw-bold mb-3 text-white">Equity Shareholding Pattern</h5>
                    <div class="d-flex flex-column gap-3 mt-3" id="shareholders-bars">
                        <!-- Dynamic Progress Bars -->
                    </div>
                </div>
                
                <!-- Corporate Actions Tab -->
                <div class="tab-pane fade" id="actions" role="tabpanel">
                    <h5 class="fw-bold mb-3 text-white">Dividends History</h5>
                    <div class="table-responsive mb-3">
                        <table class="fin-table" style="font-size: 0.85rem;">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Record Date</th>
                                </tr>
                            </thead>
                            <tbody id="corporate-dividends-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Right Column: Buy / Sell Drawer Panel -->
    <div class="col-lg-4">
        <div class="glass-panel p-4 position-sticky" style="top: 90px;">
            <h5 class="fw-bold text-white mb-3">Place Trade Order</h5>
            
            <ul class="nav nav-tabs nav-fill mb-3" style="border-bottom: 1px solid var(--border-color);">
                <li class="nav-item">
                    <button class="nav-link active text-success fw-bold bg-transparent border-0" id="btn-trade-buy" onclick="setTradeMode('buy')">BUY</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link text-secondary fw-bold bg-transparent border-0" id="btn-trade-sell" onclick="setTradeMode('sell')">SELL</button>
                </li>
            </ul>
            
            <form id="tradeForm" autocomplete="off">
                <input type="hidden" name="action" id="trade-action" value="buy">
                <input type="hidden" name="symbol" value="<?= htmlspecialchars($symbolClean) ?>">
                
                <div class="mb-3">
                    <label class="text-secondary small fw-semibold mb-2">Order Pricing Type</label>
                    <select class="form-select bg-transparent text-white border-secondary" id="trade-order-type" name="order_type" style="border-radius: var(--border-radius);">
                        <option value="market" class="text-dark">Market Price (Instant)</option>
                        <option value="limit" class="text-dark">Limit Price (Locked)</option>
                    </select>
                </div>
                
                <!-- Price Input (Hidden/Readonly by default for Market orders) -->
                <div class="mb-3" id="trade-price-group" style="display:none;">
                    <label class="text-secondary small fw-semibold mb-2">Limit Price (₹)</label>
                    <input type="number" step="0.01" class="form-control bg-transparent text-white border-secondary" id="trade-limit-price" name="price" style="border-radius: var(--border-radius);">
                </div>
                
                <div class="mb-3">
                    <label class="text-secondary small fw-semibold mb-2">Share Quantity</label>
                    <input type="number" class="form-control bg-transparent text-white border-secondary" id="trade-qty" name="quantity" value="1" min="1" required style="border-radius: var(--border-radius);" oninput="recalcEstimatedCost()">
                </div>
                
                <div class="p-3 mb-4 rounded" style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color);">
                    <div class="d-flex justify-content-between small text-secondary mb-2">
                        <span>Unit Share Price</span>
                        <span id="summary-share-price">₹0.00</span>
                    </div>
                    <div class="d-flex justify-content-between small text-secondary mb-2">
                        <span>Est. Brokerage Fee (0.05%)</span>
                        <span id="summary-brokerage">₹0.00</span>
                    </div>
                    <div class="d-flex justify-content-between small text-secondary mb-2">
                        <span>Taxes & GST (0.01%)</span>
                        <span id="summary-taxes">₹0.00</span>
                    </div>
                    <hr class="text-secondary my-2">
                    <div class="d-flex justify-content-between fw-bold">
                        <span>Total Est. Cost</span>
                        <span class="text-primary" id="summary-total">₹0.00</span>
                    </div>
                </div>
                
                <button type="submit" id="btn-submit-order" class="btn btn-buy">BUY SHARES</button>
            </form>
        </div>
    </div>
</div>

<!-- =========================================
  TRADE CONFIRMATION MODAL
========================================= -->
<div class="modal fade" id="orderConfirmModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-panel" style="background-color: var(--bg-card); color: var(--text-primary);">
            <div class="modal-header border-bottom border-secondary text-center justify-content-center">
                <h5 class="modal-title fw-bold" id="confirm-modal-title">Trade Successful</h5>
            </div>
            <div class="modal-body text-center p-4">
                <div class="text-success mb-3" style="font-size: 3.5rem;" id="confirm-modal-icon">
                    <i class="bi bi-check-circle-fill"></i>
                </div>
                <h5 class="fw-bold" id="confirm-modal-msg">Order Executed successfully!</h5>
                <p class="text-secondary small mt-2">Your portfolio and transactions history have been updated.</p>
            </div>
            <div class="modal-footer border-top border-secondary text-center justify-content-center">
                <button type="button" class="btn btn-primary-custom" data-bs-dismiss="modal" onclick="window.location.reload()">Done</button>
            </div>
        </div>
    </div>
</div>

<!-- Page Real-time Polling Logic -->
<script>
    let currentLivePrice = <?= $initialPrice ?>;
    let ws = null;
    let pollingInterval = null;
    let wsConnectAttempts = 0;
    
    $(document).ready(function() {
        // Load initial company details
        fetchCompanyDetails();
        recalcEstimatedCost();
        
        // Start WebSocket stream. Fallback is handled automatically if WS server is offline.
        connectWebSocket();
        
        // In case WebSocket doesn't connect in 2 seconds, trigger fallback as initial load safety
        setTimeout(function() {
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                startRestFallback();
            }
        }, 2000);
        
        // Handle limit order display toggle
        $('#trade-order-type').change(function() {
            if ($(this).val() === 'limit') {
                $('#trade-price-group').show();
                $('#trade-limit-price').attr('required', true).val(currentLivePrice.toFixed(2));
            } else {
                $('#trade-price-group').hide();
                $('#trade-limit-price').removeAttr('required');
            }
            recalcEstimatedCost();
        });
        
        // Handle order form submission
        $('#tradeForm').submit(function(e) {
            e.preventDefault();
            
            const submitBtn = $('#btn-submit-order');
            submitBtn.attr('disabled', true).text('Processing Order...');
            
            const action = $('#trade-action').val();
            const qty = parseInt($('#trade-qty').val()) || 1;
            const orderType = $('#trade-order-type').val();
            const orderPrice = orderType === 'limit' ? parseFloat($('#trade-limit-price').val()) : currentLivePrice;
            
            $.ajax({
                url: './api/order.php',
                type: 'POST',
                data: {
                    action: action,
                    symbol: '<?= $symbolClean ?>',
                    quantity: qty,
                    price: orderPrice,
                    order_type: orderType,
                    csrf_token: '<?= $_SESSION['csrf_token'] ?? '' ?>'
                },
                dataType: 'json',
                success: function(res) {
                    submitBtn.removeAttr('disabled');
                    if (res.success) {
                        $('#confirm-modal-title').text('Trade Successful');
                        $('#confirm-modal-msg').text(res.message);
                        $('#confirm-modal-icon').html('<i class="bi bi-check-circle-fill text-success"></i>');
                        
                        const modal = new bootstrap.Modal(document.getElementById('orderConfirmModal'));
                        modal.show();
                    } else {
                        alert('Order failed: ' + res.error);
                        submitBtn.text(action === 'buy' ? 'BUY SHARES' : 'SELL SHARES');
                    }
                },
                error: function() {
                    submitBtn.removeAttr('disabled').text(action === 'buy' ? 'BUY SHARES' : 'SELL SHARES');
                    alert('Network error placing order.');
                }
            });
        });
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
            pollStockPrice();
            pollingInterval = setInterval(pollStockPrice, 5000);
        }
    }
    
    function connectWebSocket() {
        const wsUrl = "ws://" + window.location.hostname + ":8080";
        console.log("Connecting to WebSocket: " + wsUrl);
        ws = new WebSocket(wsUrl);
        
        ws.onopen = function() {
            console.log("WebSocket connection established!");
            wsConnectAttempts = 0;
            updateStatusBadge("connected");
            
            // Subscribe to current stock
            ws.send(JSON.stringify({
                type: 'subscribe',
                symbol: '<?= $symbolClean ?>'
            }));
            
            // Clear REST fallback polling if active
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
            }
        };
        
        ws.onmessage = function(event) {
            try {
                const response = JSON.parse(event.data);
                if (response.type === 'tick' && response.data) {
                    updatePriceUI(response.data);
                }
            } catch(e) {
                console.error("Error decoding WebSocket frame data:", e);
            }
        };
        
        ws.onclose = function() {
            console.log("WebSocket connection lost.");
            startRestFallback();
            
            // Exponential backoff reconnect
            wsConnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, wsConnectAttempts), 30000);
            updateStatusBadge("disconnected");
            setTimeout(connectWebSocket, delay);
        };
        
        ws.onerror = function(err) {
            console.error("WebSocket error occurred:", err);
            ws.close();
        };
    }
    
    function updatePriceUI(data) {
        const oldPrice = currentLivePrice;
        currentLivePrice = data.price;
        
        const priceEl = $('#live-price');
        priceEl.text('₹' + data.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
        
        // Visual green/red flash update
        if (oldPrice > 0 && oldPrice !== data.price) {
            priceEl.removeClass('flash-green flash-red');
            void priceEl[0].offsetWidth; // trigger layout reflow to restart animation
            priceEl.addClass(data.price > oldPrice ? 'flash-green' : 'flash-red');
        }
        
        const changeVal = data.change;
        const changePct = data.changePct;
        const isUp = changeVal >= 0;
        
        const changeHtml = (isUp ? '+' : '') + '₹' + changeVal.toFixed(2) + ' (' + (isUp ? '+' : '') + changePct.toFixed(2) + '%)';
        $('#live-change').text(changeHtml);
        $('#live-change-container').removeClass('text-up text-down').addClass(isUp ? 'text-up' : 'text-down');
        
        $('#live-timestamp').text(data.timestamp.split(' ')[1]);
        
        if ($('#trade-order-type').val() === 'market') {
            recalcEstimatedCost();
        }
    }
    
    function setTradeMode(mode) {
        const actionInput = document.getElementById('trade-action');
        const submitBtn = document.getElementById('btn-submit-order');
        const buyTab = document.getElementById('btn-trade-buy');
        const sellTab = document.getElementById('btn-trade-sell');
        
        if (mode === 'buy') {
            actionInput.value = 'buy';
            submitBtn.innerText = 'BUY SHARES';
            submitBtn.className = 'btn btn-buy';
            buyTab.classList.add('active', 'text-success');
            sellTab.classList.remove('active', 'text-danger');
            sellTab.classList.add('text-secondary');
        } else {
            actionInput.value = 'sell';
            submitBtn.innerText = 'SELL SHARES';
            submitBtn.className = 'btn btn-sell';
            sellTab.classList.add('active', 'text-danger');
            buyTab.classList.remove('active', 'text-success');
            buyTab.classList.add('text-secondary');
        }
        recalcEstimatedCost();
    }
    
    function pollStockPrice() {
        $.ajax({
            url: './api/market.php',
            type: 'GET',
            data: { symbol: '<?= $symbolClean ?>' },
            dataType: 'json',
            success: function(res) {
                if (res.success) {
                    updatePriceUI(res);
                }
            }
        });
    }
    
    function recalcEstimatedCost() {
        const qty = parseInt($('#trade-qty').val()) || 1;
        const price = $('#trade-order-type').val() === 'limit' ? parseFloat($('#trade-limit-price').val()) : currentLivePrice;
        
        const subtotal = price * qty;
        const brokerage = Math.max(20.00, subtotal * 0.0005);
        const taxes = subtotal * 0.0001;
        const total = subtotal + brokerage + taxes;
        
        $('#summary-share-price').text('₹' + price.toLocaleString('en-IN', {minimumFractionDigits: 2}));
        $('#summary-brokerage').text('₹' + brokerage.toFixed(2));
        $('#summary-taxes').text('₹' + taxes.toFixed(2));
        $('#summary-total').text('₹' + total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
    }
    
    function fetchCompanyDetails() {
        $.ajax({
            url: './api/company.php',
            type: 'GET',
            data: { symbol: '<?= $symbolClean ?>' },
            dataType: 'json',
            success: function(res) {
                if (res.success) {
                    $('#company-name').text(res.profile.name);
                    $('#company-desc').text(res.profile.description);
                    $('#company-ceo').text(res.profile.ceo);
                    $('#company-hq').text(res.profile.headquarters);
                    $('#company-industry').text(res.profile.industry);
                    $('#company-founded').text(res.profile.founded);
                    
                    // Financial Statement rows
                    let quartersHtml = '';
                    for (const [quarter, data] of Object.entries(res.financials.quarters)) {
                        quartersHtml += `<tr>
                            <td class="fw-bold text-white">${quarter}</td>
                            <td>₹${data.revenue.toLocaleString()} Cr</td>
                            <td class="text-up">₹${data.profit.toLocaleString()} Cr</td>
                            <td>${data.margin}%</td>
                        </tr>`;
                    }
                    $('#financials-quarters-body').html(quartersHtml);
                    
                    // Balance sheet components
                    let liabilitiesHtml = '';
                    for (const [key, val] of Object.entries(res.financials.balance_sheet.liabilities)) {
                        liabilitiesHtml += `<div class="d-flex justify-content-between border-bottom py-1 border-secondary border-opacity-25">
                            <span class="text-secondary">${key}</span>
                            <span class="fw-bold text-white">₹${val.toLocaleString()} Cr</span>
                        </div>`;
                    }
                    $('#balance-sheet-liabilities').html(liabilitiesHtml);
                    
                    let assetsHtml = '';
                    for (const [key, val] of Object.entries(res.financials.balance_sheet.assets)) {
                        assetsHtml += `<div class="d-flex justify-content-between border-bottom py-1 border-secondary border-opacity-25">
                            <span class="text-secondary">${key}</span>
                            <span class="fw-bold text-white">₹${val.toLocaleString()} Cr</span>
                        </div>`;
                    }
                    $('#balance-sheet-assets').html(assetsHtml);
                    
                    // Shareholder Progress bars
                    let shareholdersHtml = '';
                    const shMapping = {
                        'promoters': { label: 'Promoters Holdings', color: 'bg-primary' },
                        'fii': { label: 'Foreign Institutional Investors (FII)', color: 'bg-success' },
                        'dii': { label: 'Domestic Institutional Investors (DII)', color: 'bg-warning' },
                        'public': { label: 'Retail & Public holdings', color: 'bg-info' }
                    };
                    for (const [key, val] of Object.entries(res.shareholders)) {
                        const m = shMapping[key];
                        shareholdersHtml += `<div class="small">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="text-secondary">${m.label}</span>
                                <span class="fw-bold text-white">${val}%</span>
                            </div>
                            <div class="progress bg-transparent border border-secondary border-opacity-25" style="height: 8px; border-radius: 4px;">
                                <div class="progress-bar ${m.color}" role="progressbar" style="width: ${val}%;" aria-valuenow="${val}" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                        </div>`;
                    }
                    $('#shareholders-bars').html(shareholdersHtml);
                    
                    // Dividends actions
                    let dividendsHtml = '';
                    res.actions.dividends.forEach(div => {
                        dividendsHtml += `<tr>
                            <td class="fw-semibold text-white">${div.type}</td>
                            <td class="text-up">${div.amount}</td>
                            <td>${div.date}</td>
                        </tr>`;
                    });
                    $('#corporate-dividends-body').html(dividendsHtml);
                }
            }
        });
    }

    // Toggle watchlist button event listener
    document.getElementById('btn-watchlist-toggle').addEventListener('click', function() {
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
                }
            }
        });
    });
</script>

<?php include_once(__DIR__ . '/includes/footer.php'); ?>
