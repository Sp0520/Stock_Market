<?php
require("./mainTop.php");
require("./conn.php");

$user_id = $_SESSION['user_id'];

// Get user profile details from database loaded in mainTop.php
$userData = $database[0];
$balance = $userData['available_balance'] ?? 0;

// Fetch number of active stocks in portfolio
$stmt = mysqli_prepare($conn, "SELECT COUNT(*) as active_count FROM stock_details WHERE status = 1 AND user_id = ?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);
$activeRow = mysqli_fetch_assoc($res);
$holdingsCount = $activeRow['active_count'] ?? 0;
mysqli_stmt_close($stmt);

// Fetch transaction count
$stmt = mysqli_prepare($conn, "SELECT COUNT(*) as txn_count FROM users_transaction WHERE user_id = ?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);
$txnRow = mysqli_fetch_assoc($res);
$txnsCount = $txnRow['txn_count'] ?? 0;
mysqli_stmt_close($stmt);
?>

<div class="content_dashboard" style="max-width: 1200px; margin: 40px auto; padding: 0 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 15px;">
        <div>
            <h1 style="color: var(--text-primary); font-size: 2.25rem; font-weight: 700; margin: 0;">Welcome back, <?= htmlspecialchars($userData['firstname']) ?>!</h1>
            <p style="color: var(--text-secondary); margin-top: 5px; font-size: 1rem;">Here is a quick overview of your trading account today.</p>
        </div>
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 10px 20px; border-radius: 12px; font-size: 0.9rem; color: var(--success); font-weight: 600; display: flex; align-items: center; gap: 8px;">
            Market Live <span style="display: inline-block; width: 8px; height: 8px; background: var(--success); border-radius: 50%; animation: pulse 1.5s infinite;"></span>
        </div>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
        <!-- Card 1: Wallet Balance -->
        <div class="card-premium" style="padding: 30px; display: flex; flex-direction: column; justify-content: space-between; height: 200px;">
            <div>
                <span style="color: var(--text-muted); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Available Wallet Balance</span>
                <h2 style="color: var(--text-primary); font-size: 2.25rem; font-weight: 700; margin: 15px 0 5px 0;">₹ <?= number_format($balance, 2) ?></h2>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 15px;">
                <span style="font-size: 0.9rem; color: var(--text-secondary);">Fund account instantly</span>
                <a href="portfolios.php" class="btnBuy_" style="padding: 8px 16px; font-size: 0.85rem; text-decoration: none;">Manage Funds</a>
            </div>
        </div>
        
        <!-- Card 2: Holdings -->
        <div class="card-premium" style="padding: 30px; display: flex; flex-direction: column; justify-content: space-between; height: 200px;">
            <div>
                <span style="color: var(--text-muted); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Portfolio Holdings</span>
                <h2 style="color: var(--text-primary); font-size: 2.25rem; font-weight: 700; margin: 15px 0 5px 0;"><?= $holdingsCount ?> <span style="font-size: 1rem; color: var(--text-secondary); font-weight: 400;">Active Stocks</span></h2>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 15px;">
                <span style="font-size: 0.9rem; color: var(--text-secondary);">View active assets</span>
                <a href="portfolios.php" class="btnBuy_" style="padding: 8px 16px; font-size: 0.85rem; text-decoration: none;">View Holdings</a>
            </div>
        </div>
        
        <!-- Card 3: Quick Links -->
        <div class="card-premium" style="padding: 30px; display: flex; flex-direction: column; justify-content: space-between; height: 200px;">
            <div>
                <span style="color: var(--text-muted); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Quick Actions</span>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <a href="market.php" class="btnBuy_" style="flex: 1; text-align: center; text-decoration: none; padding: 10px 5px; font-size: 0.85rem;">Explore Market</a>
                    <a href="searchStock.php" class="btnBuy_" style="flex: 1; text-align: center; text-decoration: none; padding: 10px 5px; font-size: 0.85rem; background: transparent !important; border: 1px solid var(--border-color) !important; color: var(--text-primary) !important; box-shadow: none !important;">Search Stocks</a>
                </div>
            </div>
            <div style="border-top: 1px solid var(--border-color); padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.9rem; color: var(--text-secondary);">Transactions logged</span>
                <span style="font-size: 0.9rem; color: var(--text-primary); font-weight: 600;"><?= $txnsCount ?> total</span>
            </div>
        </div>
    </div>
    
    <!-- Watchlist/Featured Market Trends -->
    <div class="card-premium" style="margin-top: 30px; padding: 30px;">
        <h3 style="color: var(--text-primary); font-size: 1.25rem; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
            Featured Stock Performance
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;" id="featured-stocks-container">
            <div style="text-align: center; padding: 20px; color: var(--text-secondary); width: 100%; grid-column: 1 / -1;">Loading real-time prices...</div>
        </div>
    </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function() {
    const featuredTickers = ["TCS.NS", "RELIANCE.NS", "AAPL", "MSFT"];
    const container = document.getElementById("featured-stocks-container");
    
    if (!container) return;
    
    // Clear container
    container.innerHTML = "";
    
    featuredTickers.forEach(ticker => {
        fetch(`stock_api.php?action=price&ticker=${ticker}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) return;
                
                const isUp = data.change >= 0;
                const changeClass = isUp ? "stock-up" : "stock-down";
                const changeSign = isUp ? "+" : "";
                
                const card = document.createElement("div");
                card.className = "card-premium";
                card.style.padding = "20px";
                card.style.background = "rgba(255, 255, 255, 0.02)";
                card.style.display = "flex";
                card.style.flexDirection = "column";
                card.style.gap = "10px";
                card.style.cursor = "pointer";
                card.style.transition = "var(--transition-smooth)";
                
                card.onmouseover = () => {
                    card.style.background = "rgba(255, 255, 255, 0.05)";
                    card.style.transform = "translateY(-2px)";
                };
                card.onmouseout = () => {
                    card.style.background = "rgba(255, 255, 255, 0.02)";
                    card.style.transform = "translateY(0)";
                };
                
                card.onclick = function() {
                    window.location.href = `selectedStock.php?ticker=${data.symbol}&days=15`;
                };
                
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 700; color: var(--text-primary); font-size: 1.1rem;">${data.symbol}</span>
                        <span class="${changeClass}" style="font-size: 0.8rem; padding: 2px 6px;">${changeSign}${data.change_percent.toFixed(2)}%</span>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">${data.exchange || 'EQUITY'}</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-top: 5px;">₹ ${data.price.toFixed(2)}</div>
                `;
                
                container.appendChild(card);
            })
            .catch(err => {
                console.error("Error loading featured stock " + ticker, err);
            });
    });
});
</script>

<?php
require("./bottom.php");
?>
