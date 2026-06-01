<?php
require("./conn.php");
session_start();
if (!isset($_SESSION["user_id"])) {
    header("Location: index.php");
    exit();
}
$database = array();

$sql = "SELECT * FROM `users` WHERE `id`= " . $_SESSION['user_id'];
$result = mysqli_query($conn, $sql);
while ($row = mysqli_fetch_assoc($result)) {
    $database[] = $row;
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="./assets/logo.png" type="image/x-icon" />

    <title>Stock Market Application</title>
    <link rel="stylesheet" href="./market.css">
    <link rel="stylesheet" href="./searchStock.css">
    <link rel="stylesheet" href="./selectedStock.css">
    <link rel="stylesheet" href="./portfolios.css">
    <link rel="stylesheet" href="./transactionHistory.css">
    <script src="demo.js"></script>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

</head>

<body>

    <div class="container">
        <nav class="navbar">
            <div class="title_logo">
                <img class="logo" src="./assets/logo.png" alt="">
                <p class="title"><a href="./market.php">Stock Market Application</a></p>
            </div>
            <div>
                <ul>
                    <li><a href="./portfolios.php">Portfolios</a></li>
                    <li><a href="./market.php">Market</a></li>
                    <li><a href="./searchStock.php">Stock Search</a></li>
                    <div class="dropdown">
                        <li><button onclick="myFunction()" class="dropbtn">Hello, <?= $database[0]["firstname"] ?></button></li>
                        <div id="myDropdown" class="dropdown_content">
                            <a href="./signOut.php" class="">Sign out</a>
                        </div>
                    </div>
                </ul>
            </div>
        </nav>