<?php
require("./mainTop.php");
?>

<div class="content_market" style="max-width: 1200px; margin: 40px auto; padding: 40px;">
    <div style="margin-bottom: 30px;">
        <h2 style="color: var(--text-primary); font-size: 1.75rem; font-weight: 700; margin: 0;">Stock Search</h2>
        <p style="color: var(--text-secondary); margin-top: 5px; font-size: 0.95rem;">Search and discover stock symbols, indices, ETFs, and mutual funds globally.</p>
    </div>

    <!-- Search Input Bar -->
    <div style="margin-bottom: 40px; position: relative;">
        <div style="display: flex; gap: 15px; width: 100%;">
            <div style="flex-grow: 1; position: relative;">
                <input type="text" id="searchInput" placeholder="Search by name or ticker (e.g. Reliance, Apple, TCS)" style="width: 100%; padding: 14px 20px; font-size: 1rem; border-radius: 12px;">
                <span id="search-spinner" style="display: none; position: absolute; right: 20px; top: 15px; width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.1); border-radius: 50%; border-top-color: var(--accent); animation: spin 0.8s linear infinite;"></span>
            </div>
        </div>
    </div>

    <!-- Search Results Table -->
    <div class="search-results-container">
        <h3 style="color: var(--text-primary); font-size: 1.2rem; font-weight: 600; margin-bottom: 15px;" id="results-title">Popular Stocks</h3>
        <table style="width: 100%;">
            <thead>
                <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Exchange</th>
                    <th>Asset Type</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody id="search-results-tbody">
                <!-- Javascript will load rows here -->
            </tbody>
        </table>
    </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("searchInput");
    const tbody = document.getElementById("search-results-tbody");
    const resultsTitle = document.getElementById("results-title");
    const spinner = document.getElementById("search-spinner");
    
    let debounceTimer;
    
    // Default popular suggestions
    const popularQuotes = [
        { symbol: "TCS.NS", name: "Tata Consultancy Services Limited", exchange: "NSE", type: "EQUITY" },
        { symbol: "RELIANCE.NS", name: "Reliance Industries Limited", exchange: "NSE", type: "EQUITY" },
        { symbol: "INFY.NS", name: "Infosys Limited", exchange: "NSE", type: "EQUITY" },
        { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", type: "EQUITY" },
        { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", type: "EQUITY" }
    ];
    
    function renderRows(quotes) {
        tbody.innerHTML = "";
        
        if (quotes.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5' style='text-align: center; color: var(--text-secondary); padding: 30px;'>No symbols match your query.</td></tr>";
            return;
        }
        
        quotes.forEach(quote => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight: 700; color: var(--accent);">${quote.symbol}</td>
                <td style="color: var(--text-primary); font-weight: 500;">${quote.name}</td>
                <td style="color: var(--text-muted); font-size: 0.85rem;"><span style="background: rgba(255,255,255,0.04); padding: 3px 8px; border-radius: 6px; border: 1px solid var(--border-color);">${quote.exchange}</span></td>
                <td style="color: var(--text-secondary); font-size: 0.85rem;">${quote.type || 'EQUITY'}</td>
                <td>
                    <a href="selectedStock.php?ticker=${encodeURIComponent(quote.symbol)}&days=15" class="btnBuy_" style="padding: 6px 14px; font-size: 0.8rem; text-decoration: none;">Analyze</a>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    // Initial render
    renderRows(popularQuotes);
    
    searchInput.addEventListener("input", function() {
        clearTimeout(debounceTimer);
        const query = searchInput.value.trim();
        
        if (query === "") {
            resultsTitle.textContent = "Popular Stocks";
            renderRows(popularQuotes);
            spinner.style.display = "none";
            return;
        }
        
        spinner.style.display = "inline-block";
        resultsTitle.textContent = `Search Results for "${query}"`;
        
        debounceTimer = setTimeout(() => {
            fetch(`stock_api.php?action=search&q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    spinner.style.display = "none";
                    if (data.quotes) {
                        renderRows(data.quotes);
                    }
                })
                .catch(err => {
                    spinner.style.display = "none";
                    console.error("Search fetch error:", err);
                    tbody.innerHTML = "<tr><td colspan='5' style='text-align: center; color: var(--danger); padding: 30px;'>An error occurred during search.</td></tr>";
                });
        }, 300); // 300ms debounce
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