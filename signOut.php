<?php
session_start();
session_destroy();
header("Location:http://localhost/stock_market_application/");
