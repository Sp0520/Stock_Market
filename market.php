<?php
require("./mainTop.php");
?>

<div class="content_market">
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 30px; flex-wrap: wrap; gap: 15px;">
        <div>
            <h2 style="color: var(--text-primary); font-size: 1.75rem; font-weight: 700; margin: 0;">Market Overview</h2>
            <p style="color: var(--text-secondary); margin-top: 5px; font-size: 0.95rem;">Track and trade popular domestic and international tickers in real-time.</p>
        </div>
        
        <div class="filter" style="margin: 0;">
            <form action="selectedStock.php" method="get" style="display: flex; gap: 10px; align-items: center;">
                <input type="search" name="ticker" id="ticker" placeholder="Search Ticker (e.g. TCS)" style="padding: 10px 16px; min-width: 250px;" required>
                <input type="hidden" name="days" value="15">
                <input type="submit" value="Analyze Stock" class="btnGetStockDetails" style="margin: 0; padding: 10px 20px; font-size: 0.9rem;">
            </form>
        </div>
    </div>

    <table style="width: 100%;">
        <thead>
            <tr>
                <th><p>Stock Ticker</p></th>
                <th><p>Exchange</p></th>
                <th><p>Open</p></th>
                <th><p>High</p></th>
                <th><p>Low</p></th>
                <th><p>Current Price</p></th>
                <th><p>Daily Change</p></th>
                <th><p>Action</p></th>
            </tr>
        </thead>
        <tbody id="market-table-body">
            <!-- Table rows will be populated dynamically via JavaScript -->
            <tr id="loading-row">
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <div style="display: inline-block; width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.1); border-radius: 50%; border-top-color: var(--accent); animation: spin 1s ease-in-out infinite; margin-bottom: 10px;"></div>
                    <p>Loading real-time stock prices...</p>
                </td>
            </tr>
        </tbody>
    </table>
</div>

<script>
document.addEventListener("DOMContentLoaded", function() {
    const tickers = ["TCS.NS", "RELIANCE.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS", "AAPL", "MSFT", "GOOGL"];
    const tbody = document.getElementById("market-table-body");
    const loadingRow = document.getElementById("loading-row");
    
    let loadedCount = 0;
    
    // Clear loading row if tickers fetch is running
    const fetchPromises = tickers.map(ticker => {
        return fetch(`stock_api.php?action=price&ticker=${ticker}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.error(`Error loading ${ticker}:`, data.error);
                    return null;
                }
                return data;
            })
            .catch(err => {
                console.error(`Network error loading ${ticker}:`, err);
                return null;
            });
    });
    
    Promise.all(fetchPromises).then(results => {
        // Clear loading state
        if (loadingRow) {
            loadingRow.remove();
        }
        
        const validResults = results.filter(r => r !== null);
        if (validResults.length === 0) {
            tbody.innerHTML = "<tr><td colspan='8' style='text-align: center; color: var(--danger); padding: 30px;'>Failed to load stock data. Please check connection.</td></tr>";
            return;
        }
        
        validResults.forEach(data => {
            const isUp = data.change >= 0;
            const changeClass = isUp ? "stock-up" : "stock-down";
            const changeSign = isUp ? "+" : "";
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight: 700; color: var(--text-primary);">
                    <a href="selectedStock.php?ticker=${data.symbol}&days=15" style="text-decoration: none; color: var(--accent); transition: var(--transition-smooth); display: flex; flex-direction: column;">
                        <span>${data.symbol}</span>
                    </a>
                </td>
                <td style="color: var(--text-muted); font-size: 0.85rem; font-weight: 500;">${data.exchange || 'EQUITY'}</td>
                <td style="color: var(--text-secondary);">₹ ${data.open.toFixed(2)}</td>
                <td style="color: var(--success); font-weight: 500;">₹ ${data.high.toFixed(2)}</td>
                <td style="color: var(--danger); font-weight: 500;">₹ ${data.low.toFixed(2)}</td>
                <td style="font-weight: 700; color: var(--text-primary);">₹ ${data.price.toFixed(2)}</td>
                <td>
                    <span class="${changeClass}">
                        ${changeSign}${data.change.toFixed(2)} (${changeSign}${data.change_percent.toFixed(2)}%)
                    </span>
                </td>
                <td>
                    <a href="selectedStock.php?ticker=${data.symbol}&days=15" class="btnBuy_" style="padding: 6px 14px; font-size: 0.8rem; text-decoration: none;">Trade</a>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
});
</script>

<style>
@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>

<?php
require("./bottom.php");
?>