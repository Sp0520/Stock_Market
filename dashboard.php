<?php
require('conn.php');
session_start();

if(!isset($_SESSION['user_id'])){
    header("location:index.php");
    exit();
}

$user_id = $_SESSION['user_id'];

// Example data queries (you can improve later)
$balanceQuery = mysqli_query($conn,"SELECT available_balance FROM users WHERE id='$user_id'");
$balanceData = mysqli_fetch_assoc($balanceQuery);
$balance = $balanceData['available_balance'] ?? 0;
?>

<!DOCTYPE html>
<html>
<head>
<title>Dashboard</title>
<link rel="stylesheet" href="Style.css">
<style>
.dashboard-container{
    padding:20px;
}
.card{
    background:#fff;
    padding:20px;
    margin:10px;
    border-radius:10px;
    box-shadow:0px 0px 10px rgba(0,0,0,0.1);
}
.grid{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:20px;
}
.header-bar{
    display:flex;
    justify-content:space-between;
    align-items:center;
}
.btn{
    background:#28a745;
    color:white;
    padding:10px 20px;
    border:none;
    border-radius:5px;
    cursor:pointer;
}
</style>
</head>

<body>

<div class="dashboard-container">

<div class="header-bar">
<h2>Welcome to Dashboard</h2>
<a href="signOut.php"><button class="btn">Logout</button></a>
</div>

<div class="grid">

<div class="card">
<h3>Wallet Balance</h3>
<p>₹ <?php echo $balance; ?></p>
</div>

<div class="card">
<h3>Portfolio</h3>
<p>View your holdings</p>
<a href="portfolios.php"><button class="btn">Open</button></a>
</div>

<div class="card">
<h3>Market</h3>
<p>Explore stocks</p>
<a href="market.php"><button class="btn">Open</button></a>
</div>

<div class="card">
<h3>Search Stocks</h3>
<a href="searchStock.php"><button class="btn">Search</button></a>
</div>

<div class="card">
<h3>Transactions</h3>
<a href="transactionHistory.php"><button class="btn">View</button></a>
</div>

<div class="card">
<h3>Watchlist (Coming Soon)</h3>
<p>Feature upgrade next step</p>
</div>

</div>

</div>

</body>
</html>
