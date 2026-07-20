<?php
include_once(__DIR__ . '/includes/header.php');

$successMsg = '';
$errorMsg = '';

// Fetch default watchlist ID
$watchlistId = null;
$stmt = mysqli_prepare($conn, "SELECT id FROM watchlists WHERE user_id = ? AND name = 'My Watchlist'");
mysqli_stmt_bind_param($stmt, "i", $_SESSION['user_id']);
mysqli_stmt_execute($stmt);
mysqli_stmt_bind_result($stmt, $watchlistId);
mysqli_stmt_fetch($stmt);
mysqli_stmt_close($stmt);

// Handle manual stock removal from watchlist
if (isset($_POST['remove_stock'])) {
    if (!isset($_POST['csrf_token']) || !validateCsrfToken($_POST['csrf_token'])) {
        $errorMsg = 'CSRF validation failed.';
    } else {
        $stockToRemove = strtoupper(trim($_POST['stock_name']));
        $stmtDel = mysqli_prepare($conn, "DELETE FROM watchlist_stocks WHERE watchlist_id = ? AND stock_name = ?");
        mysqli_stmt_bind_param($stmtDel, "is", $watchlistId, $stockToRemove);
        if (mysqli_stmt_execute($stmtDel)) {
            $successMsg = "Successfully removed $stockToRemove from your watchlist.";
        }
        mysqli_stmt_close($stmtDel);
    }
}
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h1 class="h3 fw-bold mb-1">My Watchlist</h1>
        <p class="text-secondary mb-0 small">Keep track of your favorite stock assets</p>
    </div>
</div>

<?php if (!empty($successMsg)): ?>
    <div class="alert alert-success py-2 small" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i> <?= htmlspecialchars($successMsg) ?>
    </div>
<?php endif; ?>

<?php if (!empty($errorMsg)): ?>
    <div class="alert alert-danger py-2 small" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i> <?= htmlspecialchars($errorMsg) ?>
    </div>
<?php endif; ?>

<div class="row g-4">
    <div class="col-lg-12">
        <div class="fin-card">
            <div class="table-responsive">
                <table class="fin-table">
                    <thead>
                        <tr>
                            <th>Stock Ticker</th>
                            <th>Company Name</th>
                            <th>Current Price</th>
                            <th>High</th>
                            <th>Low</th>
                            <th>Volume</th>
                            <th>Trend</th>
                            <th class="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $watchlistStocks = [];
                        if ($watchlistId) {
                            $stmtList = mysqli_prepare($conn, "SELECT stock_name FROM watchlist_stocks WHERE watchlist_id = ? ORDER BY added_at DESC");
                            mysqli_stmt_bind_param($stmtList, "i", $watchlistId);
                            mysqli_stmt_execute($stmtList);
                            $res = mysqli_stmt_get_result($stmtList);
                            while ($row = mysqli_fetch_assoc($res)) {
                                $watchlistStocks[] = $row['stock_name'];
                            }
                            mysqli_stmt_close($stmtList);
                        }

                        if (empty($watchlistStocks)) {
                            echo '<tr><td colspan="8" class="text-center text-secondary py-5"><i class="bi bi-bookmark-star" style="font-size: 2.5rem; display:block; margin-bottom:12px;"></i>Your watchlist is currently empty. Start adding tickers from the <a href="searchStock.php" class="text-primary text-decoration-none fw-bold">Stock Search</a> page.</td></tr>';
                        } else {
                            foreach ($watchlistStocks as $ticker) {
                                $data = fetchStockData($ticker);
                                $tickerClean = explode('.', $ticker)[0];
                                
                                if (isset($data['error'])) {
                                    echo '<tr>';
                                    echo '<td><a href="selectedStock.php?ticker=' . $tickerClean . '" class="fw-bold text-decoration-none text-white">' . $tickerClean . '</a></td>';
                                    echo '<td colspan="6" class="text-muted small">Data unavailable: ' . htmlspecialchars($data['error']) . '</td>';
                                    echo '<td class="text-end">';
                                    echo '<form action="" method="post" onsubmit="return confirm(\'Remove this stock?\')">';
                                    echo getCsrfInput();
                                    echo '<input type="hidden" name="stock_name" value="' . htmlspecialchars($ticker) . '">';
                                    echo '<button type="submit" name="remove_stock" class="btn btn-sm btn-link text-danger text-decoration-none"><i class="bi bi-trash"></i></button>';
                                    echo '</form>';
                                    echo '</td>';
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
                                    echo '<td><span class="text-secondary small">' . $tickerClean . ' Holdings Asset</span></td>';
                                    echo '<td class="fw-bold ' . ($isUp ? 'text-up' : 'text-down') . '">₹' . number_format($close, 2) . '</td>';
                                    echo '<td class="text-up">₹' . number_format($high, 2) . '</td>';
                                    echo '<td class="text-down">₹' . number_format($low, 2) . '</td>';
                                    echo '<td>' . number_format($volume) . '</td>';
                                    echo '<td><span class="' . ($isUp ? 'badge-up' : 'badge-down') . '">' . ($isUp ? '+' : '') . number_format($changePct, 2) . '%</span></td>';
                                    echo '<td class="text-end">';
                                    echo '<form action="" method="post" style="display:inline-block;" onsubmit="return confirm(\'Remove this stock?\')">';
                                    echo getCsrfInput();
                                    echo '<input type="hidden" name="stock_name" value="' . htmlspecialchars($ticker) . '">';
                                    echo '<button type="submit" name="remove_stock" class="btn btn-sm btn-link text-danger text-decoration-none" title="Remove"><i class="bi bi-trash" style="font-size:1.1rem;"></i></button>';
                                    echo '</form>';
                                    echo '</td>';
                                    echo '</tr>';
                                }
                            }
                        }
                        ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<?php include_once(__DIR__ . '/includes/footer.php'); ?>
