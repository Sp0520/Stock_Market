<!-- Key id = rzp_test_aZQTHNzbyHIfjy -->
<!-- Key Secret : ZOYXEMFHFSrcq43wQ9JnimfV -->
<?php
require("./mainTop.php");
require("./conn.php");
// echo "<script>alert(" . $_SESSION["user_id"] . ")</script>";


// setcookie("amount", "1");

$database = array();
// session_start();
$stmt = mysqli_prepare($conn, "SELECT * FROM `users` WHERE `id` = ?");
mysqli_stmt_bind_param($stmt, "i", $_SESSION['user_id']);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
while ($row = mysqli_fetch_assoc($result)) {
    $database[] = $row;
}
mysqli_stmt_close($stmt);

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
// print_r($database);
?>

<div class="content_portfolios">
    <div class="addAmount">
        <div class="balance_history">
            <?php
            $balance = (!empty($database) && isset($database[0]["available_balance"])) 
                ? htmlspecialchars($database[0]["available_balance"], ENT_QUOTES, 'UTF-8')
                : 0;
            echo "<h4>Available Balance : ₹ " . $balance . "</h4>";
            ?>
            <div class="btnHistoryDiv">
                <div>
                    <button type="submit" id="btnWithdraw" class="btnWithdraw">Withdraw</button>
                </div>
                <div>
                    <a href="transactionHistory.php" class="btnHistory">History</a>
                </div>
            </div>

        </div>
        <div class="form">
            <!-- ./razorpay_api//verify.php -->
            <form action="" method="post">
                <div class="txtAmountDiv">
                    <input type="text" class="txtAmount" id="txtAmount" name="txtAmount" placeholder=" Enter Money">
                </div>
                <div class="btnAddDiv">
                    <button type="submit" id="btnAddMoney" name="btnAddMoney" class="btnAddMoney">Add Money</button>
                </div>
            </form>

        </div>
        <div>
            <?php
            echo (isset($_REQUEST["sell"])) ? '<a href="./portfolios.php" class="btnBuyStock">Show All Buy Stocks</a>' : '<a href="./portfolios.php?sell=true" class="btnSoldStock">Show All Sold Stocks</a>';
            ?>
        </div>
    </div>
    <div class="stocks">
        <table>
            <thead>
                <tr>
                    <th>
                        <p>Stock Ticker</p>
                    </th>
                    <th>
                        <?php
                        echo (isset($_REQUEST["sell"])) ? "<p>Sold Price</p>" : "<p>Purchase Price</p>";
                        ?>
                        <!-- <p>Purchase Price</p> -->
                    </th>
                    <th>
                        <?php
                        echo (isset($_REQUEST["sell"])) ? "<p>Purchase Price</p>" : "<p>Current Price</p>";
                        ?>
                        <!-- <p>Current Price</p> -->
                    </th>
                    <th>
                        <p>Credit</p>
                    </th>
                    <th>
                        <?php
                        echo (isset($_REQUEST["sell"])) ? "<p>Sold Date</p>" : "<p>Purchase Date</p>";
                        ?>
                        <!-- <p>Purchase Date</p> -->
                    </th>
                    <th>
                        <p>Action</p>
                    </th>

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
                        foreach ($stockDataSell as $key => $value) {
                            echo "<tr>";
                            echo "<td>" . $value["stock_name"] . "</td>";
                            echo "<td>" . $value["sell_price"] . "</td>";
                            echo "<td>" . $value["purchase_price"] . "</td>";
                            echo "<td>" . $value["purchase_price"] - $value["sell_price"] . "</td>";
                            echo "<td>" . $value["updated_at"] . "</td>";
                            echo '<td class="btn"><form method="POST"><input type="submit" value="BUY" name="btnBuy" id="btnBuy" class="btnBuy_"></form></td>';
                            echo "</tr>";
                        }
                    } else {
                        echo "<tr>";
                        echo '<td class="td">' . "N/A" . '</td>';
                        echo '<td>' . "N/A" . '</td>';
                        echo '<td>' . "N/A" . '</td>';
                        echo '<td>' . "N/A" . '</td>';
                        echo '<td>' . "N/A" . '</td>';
                        echo '<td>' . "N/A" . '</td>';
                        echo "</tr>";
                        // echo "<h5>You haven't buy any Stock.</h5>";
                    }
                } else {
                    if (!empty($stockData)) {
                        $currentPrice = array();
                        foreach ($stockData as $key => $value) {
                            $ticker_sym = urlencode($value["stock_name"]);
                            $apiKey = getenv("ALPHAVANTAGE_API_KEY") ?: getenv("API_KEY") ?: "1DBYP9NP4ZDVPWI6";
                            $json = @file_get_contents("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={$ticker_sym}.BSE&outputsize=compact&apikey={$apiKey}");
                            $data = $json ? json_decode($json, true) : null;

                            $price = $value["purchase_price"]; // default fallback
                            if ($data && isset($data["Time Series (Daily)"], $data["Meta Data"])) {
                                $lastRef = $data["Meta Data"]["3. Last Refreshed"];
                                if (!isset($data["Time Series (Daily)"][$lastRef])) {
                                    $lastRef = array_key_first($data["Time Series (Daily)"]);
                                }
                                if (isset($data["Time Series (Daily)"][$lastRef]["4. close"])) {
                                    $price = sprintf('%0.2f', round((float)$data["Time Series (Daily)"][$lastRef]["4. close"], 2));
                                }
                            }

                            array_push($currentPrice, array($value["id"] => $price));

                            echo "<tr>";
                            echo "<td>" . htmlspecialchars($value["stock_name"]) . "</td>";
                            echo "<td>" . htmlspecialchars($value["purchase_price"]) . "</td>";
                            echo "<td>" . htmlspecialchars($price) . "</td>";
                            echo "<td>" . sprintf('%0.2f', (float)$price - (float)$value["purchase_price"]) . "</td>";
                            echo "<td>" . htmlspecialchars($value["purchase_date"]) . "</td>";
                            echo '<td><a href="portfolios.php?id=' . $value["id"] . '" class="btnSell_">SELL</a></td>';
                            echo "</tr>";
                        }
                    } else {
                        echo "<tr>";
                        echo '<td class="td">' . "N/A" . '</td>';
                        echo '<td>' . "N/A" . '</td>';
                        echo '<td>' . "N/A" . '</td>';
                        echo '<td>' . "N/A" . '</td>';
                        echo '<td>' . "N/A" . '</td>';
                        echo '<td>' . "N/A" . '</td>';
                        echo "</tr>";
                        // echo "<h5>You haven't buy any Stock.</h5>";
                    }
                }
                ?>
            </tbody>
            <?php

            if (isset($_REQUEST["id"])) {
                for ($i = 0; $i < count($currentPrice); $i++) {
                    foreach ($currentPrice[$i] as $key => $value) {
                        if ($key == $_REQUEST["id"]) {
                            $stockSoldPrice = $value;
                            // echo "<script>alert('" . $stockSoldPrice . "')</script>";
                        }
                    }
                }
                $stmt = mysqli_prepare($conn, "UPDATE `users` SET `available_balance` = `available_balance` + ? WHERE `id` = ?");
                mysqli_stmt_bind_param($stmt, "di", $stockSoldPrice, $_SESSION['user_id']);
                $result_update = mysqli_stmt_execute($stmt);
                mysqli_stmt_close($stmt);
                if ($result_update) {
                    // echo "<script>alert('Stock Sold Successfully')</script>";

                    $stmt = mysqli_prepare($conn, "UPDATE `stock_details` SET `status` = 0, `sell_price` = ? WHERE `id` = ?");
                    mysqli_stmt_bind_param($stmt, "di", $stockSoldPrice, $_REQUEST["id"]);
                    $resultUpdateStatus = mysqli_stmt_execute($stmt);
                    mysqli_stmt_close($stmt);
                    if ($resultUpdateStatus) {
                        echo "<script>alert('Stock Sold Successfully')</script>";
                        echo "<script>window.location.href='portfolios.php'</script>";
                    } else {
                        echo "<script>alert('Stock Sold Failed')</script>";
                    }
                } else {
                    echo "<script>alert('Stock Not sold')</script>";
                }
            }
            if (isset($_POST["btnBuy"])) {
                echo "<script>window.location.href='selectedStock.php?ticker=" . $value["stock_name"] . "&days=15'</script>";
            }
            ?>
        </table>
        <?php
        if (isset($_GET["sell"])) {
            if (empty($stockDataSell)) {
                echo "<h5>You haven't sold any Stock.</h5>";
            }
        } else {
            if (empty($stockData)) {
                echo "<h5>You haven't buy any Stock.</h5>";
            }
        }
        ?>
    </div>
</div>

<div class="modal" id="modal">
    <form method="post" id="myForm">
        <div class="modal_content">
            <div class="modal-header">
                <h2 class="modal-title">User Details</h2>
                <button type="button" id="btnClose" class="close">X</button>

            </div>

            <div class="modal-body">
                <div class="name">
                    <label class="lbl">Name </label> : <?php echo $database[0]["firstname"];
                                                        echo $database[0]["lastname"]; ?><br>
                </div>
                <div class="email">
                    <label class="lbl">Email</label> : <?php echo $database[0]["email"]; ?> <br>
                </div>
                <div class="mobileNo">
                    <label class="lbl">Mobile No</label> : <?php echo $database[0]["mobile_number"]; ?> <br>
                </div>
                <div class="amount">
                    <label class="lbl">Amount</label> : <label for="" id="lblamount"></label>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" id="payNow" name="payNow" class="payNow">Pay Now
                </button>
            </div>

        </div>
    </form>
</div>
<div id="modalWithdraw" class="modalWithdraw">
    <div class="modal_content">
        <div class="modal-header">
            <h2 class="modal-title">Withdraw</h2>
            <button type="button" id="btnCloseWithdraw" class="close">X</button>

        </div>
        <form action="" method="post">
            <div class="modal-body">
                <div class="">
                    <label class="lbl">Amount </label> : <input type="number" min="0" name="amount" id="amount" class="amount" required>
                </div>
                <div class="">
                    <label class="lbl">Account No</label> : <input type="number" min="0" maxlength="14" name="accountNo" id="accountNo" class="accountNo" oninput="myFunctionAcct(this.value)" pattern="^[0-9]{14}$" title="Please Enter the 14 digit valid Account Number" required><img src="./assets/check.png" class="checkAct" alt=""><img src="./assets//cancel.png" class="cancelAct" alt="">
                </div>
                <div class="">
                    <label class="lbl">IFSC Code</label> : <input type="text" name="ifscCode" id="ifscCode" class="ifscCode" oninput="myFunctionIfsc(this.value)" pattern="^[A-Z]{4}0[A-Z0-9]{6}$" title="Please Enter the valid IFSC Code" required><img src="./assets/check.png" class="check" alt=""><img src="./assets//cancel.png" class="cancel" alt="">
                </div>
            </div>
            <div class="modal-footer">
                <input type="submit" value="Withdraw" id="btnWithdrawModal" name="btnWithdrawModal" class="btnWithdrawModal">
            </div>
        </form>
        <?php

        if (isset($_POST["btnWithdrawModal"])) {
            if ($_POST["amount"] > $database[0]["available_balance"]) {
                echo "<script>alert('Insufficient Balance')</script>";
            } else {
                $stmt = mysqli_prepare($conn, "UPDATE `users` SET `available_balance` = `available_balance` - ? WHERE `id` = ?");
                mysqli_stmt_bind_param($stmt, "di", $_POST["amount"], $_SESSION['user_id']);
                $result_withdraw = mysqli_stmt_execute($stmt);
                mysqli_stmt_close($stmt);
                if ($result_withdraw) {
                    $stmt = mysqli_prepare($conn, "INSERT INTO `users_transaction` (`debit`, `payment_id`, `description`, `user_id`) VALUES (?, ?, ?, ?)");
                    $description = 'withdraw';
                    mysqli_stmt_bind_param($stmt, "dssi", $_POST["amount"], $_POST["accountNo"], $description, $_SESSION['user_id']);
                    $result = mysqli_stmt_execute($stmt);
                    mysqli_stmt_close($stmt);
                    if ($result) {
                        echo "<script>alert('Your money will be transferred to your account in 3-5 working days.')</script>";
                        echo "<script>window.location.href='portfolios.php'</script>";
                    } else {
                        echo "<script>alert('Withdraw Request Failed while inserting record')</script>";
                    }
                } else {
                    echo "<script>alert('Withdraw Failed updating Available balance.')</script>";
                }
            }
        }
        ?>
    </div>
</div>
</div>
<script>
    const modal = document.querySelector('#modal')

    const btnAddMoney = document.querySelector('#btnAddMoney')
    const payNow = document.querySelector('#payNow')
    const btnClose = document.querySelector('#btnClose')

    const txtAmount = document.getElementById('txtAmount')
    const lblamount = document.querySelector('#lblamount')

    const btnPay = document.querySelector(".razorpay-payment-button")

    const btnRayzorpay = document.querySelector('#btnRayzorpay')

    payNow.addEventListener('click', () => {
        location.href = "./razorpay_api/pay.php"
        // btnPay.click()
    })
    btnAddMoney.addEventListener('click', function(e) {
        if (txtAmount.value == "") {
            alert("Please Enter Amount");
        } else {
            document.cookie = "amount=" + txtAmount.value;
            lblamount.innerHTML = txtAmount.value;
            modal.style.display = 'flex';
            txtAmount.value = "";
        }
        e.preventDefault();
    })
    btnClose.addEventListener('click', function(e) {
        modal.style.display = 'none';
    })

    window.addEventListener('click', function(e) {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    })
    const modalWithdraw = document.querySelector('#modalWithdraw')
    const btnWithdraw = document.querySelector('#btnWithdraw')
    const btnWithdrawModal = document.querySelector('#btnWithdrawModal')
    const btnCloseWithdraw = document.querySelector('#btnCloseWithdraw')

    function myFunctionIfsc(val) {
        // alert("The input value has changed. The new value is: " + val);
        $.ajax({
            url: 'https://ifsc.razorpay.com/' + val.toUpperCase(),
            type: 'GET',
            success: function(data) {
                // console.log(data);
                if (data.BRANCH) {
                    // alert("Correct IFSC Code");
                    $('.check').css('display', 'block');
                    $('.cancel').css('display', 'none');
                }
            },
            error: function() {
                $('.check').css('display', 'none');
                $('.cancel').css('display', 'block');
                // alert('Invalid IFSC Code');
            }
        });
    }

    function myFunctionAcct(acctNumber) {
        // alert("The input value has changed. The new value is: " + val);
        if (acctNumber.length == 14) {
            $('.checkAct').css('display', 'block');
            $('.cancelAct').css('display', 'none');
        } else {
            $('.checkAct').css('display', 'none');
            $('.cancelAct').css('display', 'block');
        }
    }

    btnWithdraw.addEventListener('click', function(e) {
        modalWithdraw.style.display = 'flex';
        e.preventDefault();
    })
    // btnWithdrawModal.addEventListener('click', function(e) {
    //     if (document.querySelector('.amount').value == "") {
    //         alert("Please Enter Amount");
    //     } else if (document.querySelector('.accountNo').value == "") {
    //         alert("Please Enter Account No");
    //     } else if (document.querySelector('.ifscCode').value == "") {
    //         alert("Please Enter IFSC Code");
    //     } else {
    //         // document.cookie = "amount=" + document.querySelector('.amount').value;
    //         // document.cookie = "accountNo=" + document.querySelector('.accountNo').value;
    //         // document.cookie = "ifscCode=" + document.querySelector('.ifscCode').value;

    //         <?php
                //         // $sql = "INSERT INTO `users_transaction` (`debit`, `payment_id`, `description`) VALUES (" . $_COOKIE['amount'] . ", '" . $_COOKIE['accountNo'] . "', 'withdraw')";
                //         // $result = mysqli_query($conn, $sql);
                //         // if ($result) {
                //         //     echo "window.location.href = './portfolios.php'";
                //         //     echo "alert('Withdraw Successfully')";
                //         // } else {
                //         //     echo "alert('Withdraw Failed')";
                //         // }
                //         
                ?>
    //         // alert("Your money will be transferred to your account in 3-5 working days.");
    //     }
    //     e.preventDefault();
    // })
    btnCloseWithdraw.addEventListener('click', function(e) {
        modalWithdraw.style.display = 'none';
    })
    window.addEventListener('click', function(e) {
        if (e.target == modalWithdraw) {
            modalWithdraw.style.display = 'none';
        }
    })
</script>
</body>

</html>