<?php
require("./mainTop.php");
require("./conn.php");

$database = array();
$stmt = mysqli_prepare($conn, "SELECT * FROM `users` WHERE `id` = ?");
mysqli_stmt_bind_param($stmt, "i", $_SESSION['user_id']);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
while ($row = mysqli_fetch_assoc($result)) {
    $database[] = $row;
}
mysqli_stmt_close($stmt);

// Handle Sell request from query string
if (isset($_GET["id"])) {
    $sell_id = (int)$_GET["id"];
    $stmt = mysqli_prepare($conn, "SELECT * FROM `stock_details` WHERE `id` = ? AND `user_id` = ? AND `status` = 1");
    mysqli_stmt_bind_param($stmt, "ii", $sell_id, $_SESSION['user_id']);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $stockToSell = mysqli_fetch_assoc($res);
    mysqli_stmt_close($stmt);

    if ($stockToSell) {
        $ticker_sym = $stockToSell["stock_name"];
        if (str_contains($ticker_sym, '.BSE')) {
            $ticker_sym = str_replace('.BSE', '.BO', $ticker_sym);
        }
        if (!str_contains($ticker_sym, '.')) {
            $usTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC'];
            if (!in_array($ticker_sym, $usTickers)) {
                $ticker_sym = $ticker_sym . '.NS';
            }
        }
        
        $url = "https://query1.finance.yahoo.com/v8/finance/chart/" . urlencode($ticker_sym) . "?range=1d&interval=1m";
        $options = [
            "http" => [
                "method" => "GET",
                "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36\r\n"
            ]
        ];
        $context = stream_context_create($options);
        $response = @file_get_contents($url, false, $context);
        
        $price = floatval($stockToSell["purchase_price"]); // fallback
        if ($response !== false) {
            $jsonData = json_decode($response, true);
            if (isset($jsonData['chart']['result'][0]['meta']['regularMarketPrice'])) {
                $price = floatval($jsonData['chart']['result'][0]['meta']['regularMarketPrice']);
            }
        }
        
        $price = round($price, 2);
        
        $stmt = mysqli_prepare($conn, "UPDATE `users` SET `available_balance` = `available_balance` + ? WHERE `id` = ?");
        mysqli_stmt_bind_param($stmt, "di", $price, $_SESSION['user_id']);
        $result_update = mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        
        if ($result_update) {
            $stmt = mysqli_prepare($conn, "UPDATE `stock_details` SET `status` = 0, `sell_price` = ? WHERE `id` = ?");
            mysqli_stmt_bind_param($stmt, "di", $price, $sell_id);
            $resultUpdateStatus = mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);
            
            if ($resultUpdateStatus) {
                $stmt = mysqli_prepare($conn, "INSERT INTO `users_transaction` (`credit`, `payment_id`, `description`, `user_id`) VALUES (?, ?, ?, ?)");
                $paymentId = "SELL_" . strtoupper(substr(md5(time()), 0, 10));
                $desc = "Sold " . $stockToSell["stock_name"];
                mysqli_stmt_bind_param($stmt, "dssi", $price, $paymentId, $desc, $_SESSION['user_id']);
                mysqli_stmt_execute($stmt);
                mysqli_stmt_close($stmt);
                
                echo "<script>alert('Stock Sold Successfully for ₹ " . $price . "'); window.location.href='portfolios.php';</script>";
                exit();
            } else {
                echo "<script>alert('Stock status update failed.');</script>";
            }
        } else {
            echo "<script>alert('Wallet balance update failed.');</script>";
        }
    }
}
?>

<div class="content_portfolios" style="max-width: 1200px; margin: 40px auto; padding: 40px;">
    <!-- Wallet Section -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; width: 100%; margin-bottom: 30px;">
        
        <!-- Wallet Balance Card -->
        <div class="card-premium" style="padding: 25px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">Available Balance</span>
                <h3 style="color: var(--text-primary); font-size: 2rem; font-weight: 700; margin: 10px 0;">₹ <?= number_format($database[0]["available_balance"] ?? 0, 2) ?></h3>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button type="button" id="btnWithdraw" class="btnWithdraw" style="flex: 1; padding: 10px; border-radius: 10px; font-weight: 600;">Withdraw</button>
                <a href="transactionHistory.php" class="btnHistory" style="flex: 1; text-align: center; border: 1px solid var(--border-color); padding: 10px; border-radius: 10px; font-weight: 600;">Transaction History</a>
            </div>
        </div>

        <!-- Add Money Card -->
        <div class="card-premium" style="padding: 25px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">Add Funds to Wallet</span>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 5px;">Add money securely via UPI, Card or Net Banking using Razorpay.</p>
            </div>
            <form action="" method="post" style="display: flex; gap: 10px; margin-top: 15px;">
                <input type="number" min="1" class="txtAmount" id="txtAmount" name="txtAmount" placeholder="Amount (INR)" style="flex: 1; padding: 10px; border-radius: 10px;" required>
                <button type="submit" id="btnAddMoney" name="btnAddMoney" class="btnAddMoney" style="padding: 10px 20px; font-size: 0.9rem; border-radius: 10px;">Add Funds</button>
            </form>
        </div>

        <!-- Portfolio Live Valuation Card -->
        <?php if (!isset($_GET["sell"])): ?>
        <div class="card-premium" id="portfolio-summary-card" style="padding: 25px; display: none;">
            <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">Holding Summary</span>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                <div>
                    <span style="color: var(--text-muted); font-size: 0.75rem; display: block;">Invested Value</span>
                    <span id="summary-invested" style="font-weight: 700; color: var(--text-primary);">₹ 0.00</span>
                </div>
                <div>
                    <span style="color: var(--text-muted); font-size: 0.75rem; display: block;">Current Value</span>
                    <span id="summary-current" style="font-weight: 700; color: var(--text-primary);">₹ 0.00</span>
                </div>
            </div>
            <div style="border-top: 1px solid var(--border-color); margin-top: 15px; padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-secondary); font-size: 0.85rem;">Total Profit / Loss</span>
                <span id="summary-pl">Evaluating...</span>
            </div>
        </div>
        <?php endif; ?>
    </div>

    <!-- Toggle bought / sold assets tab links -->
    <div style="margin-bottom: 25px; display: flex; gap: 12px;">
        <?php if (isset($_GET["sell"])): ?>
            <a href="portfolios.php" class="btnBuyStock" style="text-decoration: none; padding: 8px 16px; font-size: 0.85rem;">Show Active Holdings</a>
            <span style="color: var(--text-primary); font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; margin-left: 10px;">Closed Positions</span>
        <?php else: ?>
            <a href="portfolios.php?sell=true" class="btnSoldStock" style="text-decoration: none; padding: 8px 16px; font-size: 0.85rem;">Show Closed Positions</a>
            <span style="color: var(--text-primary); font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; margin-left: 10px;">Active Holdings</span>
        <?php endif; ?>
    </div>

    <!-- Portfolio Table -->
    <div class="stocks" style="width: 100%;">
        <table style="width: 100%;">
            <thead>
                <tr>
                    <th>Stock Ticker</th>
                    <th>Quantity</th>
                    <th><?php echo (isset($_GET["sell"])) ? "Sold Price" : "Purchase Price"; ?></th>
                    <th><?php echo (isset($_GET["sell"])) ? "Purchase Price" : "Current Price"; ?></th>
                    <th>Net Profit/Loss</th>
                    <th><?php echo (isset($_GET["sell"])) ? "Sold Date" : "Purchase Date"; ?></th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php
                if (isset($_GET["sell"])) {
                    $stockDataSell = array();
                    $stmt = mysqli_prepare($conn, "SELECT * FROM `stock_details` WHERE `status` = 0 AND `user_id` = ?");
                    mysqli_stmt_bind_param($stmt, "i", $_SESSION['user_id']);
                    mysqli_stmt_execute($stmt);
                    $result = mysqli_stmt_get_result($stmt);
                    while ($row = mysqli_fetch_assoc($result)) {
                        $stockDataSell[] = $row;
                    }
                    mysqli_stmt_close($stmt);
                    
                    if (!empty($stockDataSell)) {
                        foreach ($stockDataSell as $value) {
                            $ticker = htmlspecialchars($value["stock_name"]);
                            $sellPrice = floatval($value["sell_price"]);
                            $purchasePrice = floatval($value["purchase_price"]);
                            $qty = intval($value["qty"] ?? 1);
                            $netPL = ($sellPrice - $purchasePrice) * $qty;
                            $plClass = $netPL >= 0 ? "stock-up" : "stock-down";
                            $plSign = $netPL >= 0 ? "+" : "";
                            
                            echo "<tr>";
                            echo "<td style='font-weight: 700; color: var(--text-primary);'>{$ticker}</td>";
                            echo "<td style='color: var(--text-secondary);'>{$qty}</td>";
                            echo "<td style='color: var(--text-secondary);'>₹ " . number_format($sellPrice, 2) . "</td>";
                            echo "<td style='color: var(--text-secondary);'>₹ " . number_format($purchasePrice, 2) . "</td>";
                            echo "<td><span class='{$plClass}'>{$plSign}₹ " . number_format($netPL, 2) . "</span></td>";
                            echo "<td style='color: var(--text-muted); font-size: 0.85rem;'>{$value["updated_at"]}</td>";
                            echo '<td><a href="selectedStock.php?ticker=' . urlencode($ticker) . '&days=15" class="btnBuy_" style="padding: 6px 14px; font-size: 0.8rem; text-decoration: none;">BUY AGAIN</a></td>';
                            echo "</tr>";
                        }
                    } else {
                        echo "<tr><td colspan='7' style='text-align: center; color: var(--text-muted); padding: 30px;'>You haven't sold any stocks yet.</td></tr>";
                    }
                } else {
                    $stockData = array();
                    $status = 1;
                    $stmt = mysqli_prepare($conn, "SELECT * FROM `stock_details` WHERE `status` = ? AND `user_id` = ?");
                    mysqli_stmt_bind_param($stmt, "ii", $status, $_SESSION['user_id']);
                    mysqli_stmt_execute($stmt);
                    $result = mysqli_stmt_get_result($stmt);
                    while ($row = mysqli_fetch_assoc($result)) {
                        $stockData[] = $row;
                    }
                    mysqli_stmt_close($stmt);

                    if (!empty($stockData)) {
                        foreach ($stockData as $value) {
                            $ticker = htmlspecialchars($value["stock_name"]);
                            $purchasePrice = floatval($value["purchase_price"]);
                            $qty = intval($value["qty"] ?? 1);
                            
                            echo "<tr class='portfolio-row' data-symbol='{$ticker}' data-purchase-price='{$purchasePrice}' data-qty='{$qty}'>";
                            echo "<td style='font-weight: 700; color: var(--text-primary);'>{$ticker}</td>";
                            echo "<td style='color: var(--text-secondary);'>{$qty}</td>";
                            echo "<td style='color: var(--text-secondary);'>₹ " . number_format($purchasePrice, 2) . "</td>";
                            echo "<td class='col-current-price' style='color: var(--text-secondary); font-weight: 500;'>Evaluating...</td>";
                            echo "<td class='col-profit-loss'>Evaluating...</td>";
                            echo "<td style='color: var(--text-muted); font-size: 0.85rem;'>{$value["purchase_date"]}</td>";
                            echo '<td><a href="portfolios.php?id=' . $value["id"] . '" class="btnSell_" style="padding: 6px 14px; font-size: 0.8rem; text-decoration: none;" onclick="return confirm(\'Are you sure you want to sell ' . $ticker . ' at the current market price?\')">SELL</a></td>';
                            echo "</tr>";
                        }
                    } else {
                        echo "<tr><td colspan='7' style='text-align: center; color: var(--text-muted); padding: 30px;'>You do not own any active stock holdings.</td></tr>";
                    }
                }
                ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Razorpay Confirmation Modal -->
<div class="modal" id="modal" style="display: none; align-items: center; justify-content: center; z-index: 1000; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;">
    <form method="post" id="myForm" style="margin: 0;">
        <div class="modal_content">
            <div class="modal-header">
                <h2 class="modal-title">Deposit Details</h2>
                <button type="button" id="btnClose" class="close">×</button>
            </div>
            <div class="modal-body" style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                    <span class="lbl">Account Name:</span>
                    <span style="color: var(--text-primary); font-weight: 600;"><?= htmlspecialchars($database[0]["firstname"] . " " . $database[0]["lastname"]) ?></span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                    <span class="lbl">Email:</span>
                    <span style="color: var(--text-primary);"><?= htmlspecialchars($database[0]["email"]) ?></span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                    <span class="lbl">Mobile No:</span>
                    <span style="color: var(--text-primary);"><?= htmlspecialchars($database[0]["mobile_number"]) ?></span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 5px;">
                    <span class="lbl" style="font-size: 1.1rem; color: var(--accent);">Deposit Amount:</span>
                    <span style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary);">₹ <span id="lblamount">0</span></span>
                </div>
            </div>
            <div class="modal-footer" style="display: flex; justify-content: flex-end; margin-top: 20px;">
                <button type="button" id="payNow" name="payNow" class="payNow" style="background: var(--success) !important; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25) !important; padding: 12px 24px; font-weight: 600; color: white; border: none; border-radius: 12px; cursor: pointer; transition: var(--transition-smooth);">Process Deposit</button>
            </div>
        </div>
    </form>
</div>

<!-- Withdraw Modal -->
<div id="modalWithdraw" class="modalWithdraw" style="display: none; align-items: center; justify-content: center; z-index: 1000; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;">
    <div class="modal_content" style="max-width: 480px;">
        <div class="modal-header">
            <h2 class="modal-title">Withdraw Funds</h2>
            <button type="button" id="btnCloseWithdraw" class="close">×</button>
        </div>
        <form action="" method="post" style="margin: 0;">
            <div class="modal-body" style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <label class="lbl">Withdrawal Amount (₹)</label>
                    <input type="number" min="1" step="0.01" name="amount" id="amount" style="width: 100%;" required>
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px; position: relative;">
                    <label class="lbl">Bank Account Number</label>
                    <input type="password" minlength="9" maxlength="18" name="accountNo" id="accountNo" oninput="myFunctionAcct(this.value)" style="width: 100%; padding-right: 40px;" required>
                    <div style="position: absolute; right: 12px; bottom: 12px;">
                        <img src="./assets/check.png" class="checkAct" alt="" style="display: none; width: 16px; height: 16px;">
                        <img src="./assets/cancel.png" class="cancelAct" alt="" style="display: none; width: 16px; height: 16px;">
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px; position: relative;">
                    <label class="lbl">IFSC Code</label>
                    <input type="text" name="ifscCode" id="ifscCode" oninput="myFunctionIfsc(this.value)" style="width: 100%; text-transform: uppercase; padding-right: 40px;" required>
                    <div style="position: absolute; right: 12px; bottom: 12px;">
                        <img src="./assets/check.png" class="check" alt="" style="display: none; width: 16px; height: 16px;">
                        <img src="./assets/cancel.png" class="cancel" alt="" style="display: none; width: 16px; height: 16px;">
                    </div>
                </div>
            </div>
            <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                <input type="submit" value="Confirm Withdrawal" id="btnWithdrawModal" name="btnWithdrawModal" class="btnWithdrawModal" style="padding: 12px 24px; border-radius: 12px; cursor: pointer;">
            </div>
        </form>
        
        <?php
        if (isset($_POST["btnWithdrawModal"])) {
            $withdrawAmount = floatval($_POST["amount"]);
            if ($withdrawAmount > $database[0]["available_balance"]) {
                echo "<script>alert('Insufficient Balance');</script>";
            } else {
                $stmt = mysqli_prepare($conn, "UPDATE `users` SET `available_balance` = `available_balance` - ? WHERE `id` = ?");
                mysqli_stmt_bind_param($stmt, "di", $withdrawAmount, $_SESSION['user_id']);
                $result_withdraw = mysqli_stmt_execute($stmt);
                mysqli_stmt_close($stmt);
                
                if ($result_withdraw) {
                    $stmt = mysqli_prepare($conn, "INSERT INTO `users_transaction` (`debit`, `payment_id`, `description`, `user_id`) VALUES (?, ?, ?, ?)");
                    $description = 'withdraw';
                    $accountNo = trim($_POST["accountNo"]);
                    mysqli_stmt_bind_param($stmt, "dssi", $withdrawAmount, $accountNo, $description, $_SESSION['user_id']);
                    $result = mysqli_stmt_execute($stmt);
                    mysqli_stmt_close($stmt);
                    
                    if ($result) {
                        echo "<script>alert('Withdrawal Request Submitted. Funds will be transferred in 3-5 business days.'); window.location.href='portfolios.php';</script>";
                    } else {
                        echo "<script>alert('Failed to log withdrawal transaction.');</script>";
                    }
                } else {
                    echo "<script>alert('Failed to update balance.');</script>";
                }
            }
        }
        ?>
    </div>
</div>

<script>
    // Deposit Modal Javascript
    const modal = document.querySelector('#modal');
    const btnAddMoney = document.querySelector('#btnAddMoney');
    const payNow = document.querySelector('#payNow');
    const btnClose = document.querySelector('#btnClose');
    const txtAmount = document.getElementById('txtAmount');
    const lblamount = document.querySelector('#lblamount');

    if (payNow) {
        payNow.addEventListener('click', () => {
            location.href = "./razorpay_api/pay.php";
        });
    }

    if (btnAddMoney) {
        btnAddMoney.addEventListener('click', function(e) {
            const amountVal = parseFloat(txtAmount.value);
            if (isNaN(amountVal) || amountVal <= 0) {
                alert("Please enter a valid amount");
            } else {
                document.cookie = "amount=" + amountVal + "; path=/";
                lblamount.innerHTML = amountVal.toFixed(2);
                modal.style.display = 'flex';
                txtAmount.value = "";
            }
            e.preventDefault();
        });
    }

    if (btnClose) {
        btnClose.addEventListener('click', function(e) {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', function(e) {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Withdrawal Modal Javascript
    const modalWithdraw = document.querySelector('#modalWithdraw');
    const btnWithdraw = document.querySelector('#btnWithdraw');
    const btnCloseWithdraw = document.querySelector('#btnCloseWithdraw');

    if (btnWithdraw) {
        btnWithdraw.addEventListener('click', function(e) {
            modalWithdraw.style.display = 'flex';
            e.preventDefault();
        });
    }

    if (btnCloseWithdraw) {
        btnCloseWithdraw.addEventListener('click', function(e) {
            modalWithdraw.style.display = 'none';
        });
    }

    window.addEventListener('click', function(e) {
        if (e.target == modalWithdraw) {
            modalWithdraw.style.display = 'none';
        }
    });

    function myFunctionIfsc(val) {
        const cleanVal = val.trim().toUpperCase();
        if (cleanVal.length !== 11) {
            document.querySelector('.check').style.display = 'none';
            document.querySelector('.cancel').style.display = 'block';
            return;
        }
        $.ajax({
            url: 'https://ifsc.razorpay.com/' + cleanVal,
            type: 'GET',
            success: function(data) {
                if (data.BRANCH) {
                    document.querySelector('.check').style.display = 'block';
                    document.querySelector('.cancel').style.display = 'none';
                }
            },
            error: function() {
                document.querySelector('.check').style.display = 'none';
                document.querySelector('.cancel').style.display = 'block';
            }
        });
    }

    function myFunctionAcct(acctNumber) {
        const cleanNum = acctNumber.trim();
        if (cleanNum.length >= 9 && cleanNum.length <= 18) {
            document.querySelector('.checkAct').style.display = 'block';
            document.querySelector('.cancelAct').style.display = 'none';
        } else {
            document.querySelector('.checkAct').style.display = 'none';
            document.querySelector('.cancelAct').style.display = 'block';
        }
    }

    // Portfolio Real-time Valuation Logic
    document.addEventListener("DOMContentLoaded", function() {
        const rows = document.querySelectorAll(".portfolio-row");
        if (rows.length === 0) return;

        let totalInvested = 0;
        let totalCurrent = 0;
        let processedCount = 0;

        const summaryCard = document.getElementById("portfolio-summary-card");
        const summaryInvested = document.getElementById("summary-invested");
        const summaryCurrent = document.getElementById("summary-current");
        const summaryPL = document.getElementById("summary-pl");

        rows.forEach(row => {
            const symbol = row.getAttribute("data-symbol");
            const purchasePrice = parseFloat(row.getAttribute("data-purchase-price"));
            const qty = parseInt(row.getAttribute("data-qty") || "1", 10);
            const rowInvested = purchasePrice * qty;
            totalInvested += rowInvested;

            fetch(`stock_api.php?action=price&ticker=${symbol}`)
                .then(res => res.json())
                .then(data => {
                    processedCount++;
                    if (data.error) {
                        row.querySelector(".col-current-price").textContent = "N/A";
                        row.querySelector(".col-profit-loss").textContent = "N/A";
                        totalCurrent += rowInvested; // fallback
                        checkCompletion();
                        return;
                    }

                    const currentPrice = data.price;
                    const rowCurrent = currentPrice * qty;
                    totalCurrent += rowCurrent;

                    const pl = rowCurrent - rowInvested;
                    const plPercent = rowInvested > 0 ? (pl / rowInvested) * 100 : 0;
                    
                    const plClass = pl >= 0 ? "stock-up" : "stock-down";
                    const plSign = pl >= 0 ? "+" : "";

                    row.querySelector(".col-current-price").textContent = `₹ ${currentPrice.toFixed(2)}`;
                    row.querySelector(".col-profit-loss").innerHTML = `<span class="${plClass}">${plSign}₹ ${pl.toFixed(2)} (${plSign}${plPercent.toFixed(2)}%)</span>`;
                    
                    checkCompletion();
                })
                .catch(err => {
                    processedCount++;
                    console.error("Error fetching live price for " + symbol, err);
                    row.querySelector(".col-current-price").textContent = "N/A";
                    row.querySelector(".col-profit-loss").textContent = "N/A";
                    totalCurrent += purchasePrice;
                    checkCompletion();
                });
        });

        function checkCompletion() {
            if (processedCount === rows.length) {
                if (summaryInvested && summaryCurrent && summaryPL) {
                    summaryInvested.textContent = `₹ ${totalInvested.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                    summaryCurrent.textContent = `₹ ${totalCurrent.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                    
                    const overallPL = totalCurrent - totalInvested;
                    const overallPercent = totalInvested > 0 ? (overallPL / totalInvested) * 100 : 0;
                    
                    const isUp = overallPL >= 0;
                    const sign = isUp ? "+" : "";
                    
                    summaryPL.textContent = `${sign}₹ ${overallPL.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${sign}${overallPercent.toFixed(2)}%)`;
                    summaryPL.className = isUp ? "stock-up" : "stock-down";
                    summaryPL.style.fontSize = "1.1rem";
                    summaryPL.style.fontWeight = "700";
                    summaryPL.style.padding = "4px 10px";
                    
                    if (summaryCard) {
                        summaryCard.style.display = "flex";
                        summaryCard.style.flexDirection = "column";
                        summaryCard.style.justifyContent = "space-between";
                    }
                }
            }
        }
    });
</script>
</body>
</html>