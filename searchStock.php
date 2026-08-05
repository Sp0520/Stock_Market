<?php
include_once(__DIR__ . '/includes/header.php');

// Define a list of popular searches
$popularStocks = [
    ['symbol' => 'TCS', 'name' => 'Tata Consultancy Services', 'logo' => 'https://cdn-icons-png.flaticon.com/512/3594/3594449.png'],
    ['symbol' => 'RELIANCE', 'name' => 'Reliance Industries', 'logo' => 'https://cdn-icons-png.flaticon.com/512/3594/3594449.png'],
    ['symbol' => 'INFY', 'name' => 'Infosys Technologies', 'logo' => 'https://cdn-icons-png.flaticon.com/512/3594/3594449.png'],
    ['symbol' => 'SBIN', 'name' => 'State Bank of India', 'logo' => 'https://cdn-icons-png.flaticon.com/512/3594/3594449.png'],
    ['symbol' => 'HDFCBANK', 'name' => 'HDFC Bank Limited', 'logo' => 'https://cdn-icons-png.flaticon.com/512/3594/3594449.png'],
    ['symbol' => 'TMPV', 'name' => 'Tata Motors Passenger Vehicles', 'logo' => 'https://cdn-icons-png.flaticon.com/512/3594/3594449.png']
];
?>

<div class="row justify-content-center mt-5">
    <div class="col-lg-8 col-xl-6 text-center">
        <h1 class="fw-bold mb-3">Explore Indian Markets</h1>
        <p class="text-secondary mb-5">Search for corporate stocks, indices, commodities and view live candle charts instantly.</p>
        
        <!-- Autocomplete search bar layout -->
        <div class="search-bar w-100 position-relative mb-5" style="max-width: 600px; margin: 0 auto;">
            <i class="bi bi-search text-secondary" style="font-size: 1.25rem;"></i>
            <input type="text" class="autocomplete-search form-control py-3 ps-5 bg-transparent border-secondary text-white" placeholder="Search stock name, ticker or ISIN..." style="border-radius: 30px; font-size: 1.1rem; border-color: rgba(255,255,255,0.2) !important;">
            <div class="search-suggestions text-start" style="display:none; border-radius: 16px;"></div>
        </div>
        
        <!-- Popular Stocks Grid -->
        <div class="text-start">
            <h5 class="fw-bold mb-3 text-secondary" style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">Popular Stock Searches</h5>
            <div class="row g-3">
                <?php foreach ($popularStocks as $stock): ?>
                    <div class="col-md-6">
                        <a href="stock.php?symbol=<?= $stock['symbol'] ?>" class="text-decoration-none text-white">
                            <div class="glass-panel p-3 d-flex align-items-center justify-content-between hover-glow">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                        <i class="bi bi-graph-up text-white" style="font-size: 1.25rem;"></i>
                                    </div>
                                    <div>
                                        <div class="fw-bold"><?= $stock['symbol'] ?></div>
                                        <div class="text-secondary small"><?= $stock['name'] ?></div>
                                    </div>
                                </div>
                                <span class="badge bg-secondary">BSE</span>
                            </div>
                        </a>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>

<?php include_once(__DIR__ . '/includes/footer.php'); ?>