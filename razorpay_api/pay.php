<?php

require('config.php');
require('razorpay-php/Razorpay.php');
session_start();

// Create the Razorpay Order

use Razorpay\Api\Api;

if (empty($keyId) || empty($keySecret)) {
    die('Razorpay keyId or keySecret is empty in config.php');
}

if (!preg_match('/^rzp_(test|live)_[A-Za-z0-9]+$/', $keyId)) {
    die('Razorpay keyId is not valid format. It should be rzp_test_... or rzp_live_...');
}

$api = new Api($keyId, $keySecret);

try {
    //
    // We create a razorpay order using orders api
    // Docs: https://docs.razorpay.com/docs/orders
    //
    $orderData = [
        'receipt'         => 3456,
        'amount'          => $_COOKIE['amount'] * 100, // 2000 rupees in paise
        'currency'        => 'INR',
        'payment_capture' => 1 // auto capture
    ];

    $razorpayOrder = $api->order->create($orderData);
    $razorpayOrderId = $razorpayOrder['id'];
    $_SESSION['razorpay_order_id'] = $razorpayOrderId;
} catch (Exception $e) {
    // show the root cause, especially 401 Authentication failed
    http_response_code(500);
    echo '<h1>Razorpay API Error</h1>';
    echo '<p>' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8') . '</p>';
    echo '<pre>' . htmlspecialchars($e->getTraceAsString(), ENT_QUOTES, 'UTF-8') . '</pre>';
    exit;
}

$displayAmount = $amount = $orderData['amount'];

if ($displayCurrency !== 'INR') {
    $url = "https://api.fixer.io/latest?symbols=$displayCurrency&base=INR";
    $exchange = json_decode(file_get_contents($url), true);

    $displayAmount = $exchange['rates'][$displayCurrency] * $amount / 100;
}

// Debug data to verify correct API key used
error_log('Razorpay API KeyId: ' . $keyId);
error_log('Razorpay API KeySecret length: ' . strlen($keySecret));
$data = [
    "key"               => $keyId,
    "amount"            => $amount,
    "name"              => "STOCK MARKET APPLICATION",
    "description"       => "Payment for STOCK MARKET APPLICATION",
    "image"             => "https://s29.postimg.org/r6dj1g85z/daft_punk.jpg",
    "prefill"           => [
        "name"              => "Rushi",
        "email"             => "abc@xyz.com",
        "contact"           => "9999999999",
    ],
    "notes"             => [
        "address"           => "Hello World",
        "merchant_order_id" => "12312321",
    ],
    "theme"             => [
        "color"             => "#F37254"
    ],
    "order_id"          => $razorpayOrderId,
];

if ($displayCurrency !== 'INR') {
    $data['display_currency']  = $displayCurrency;
    $data['display_amount']    = $displayAmount;
}

$json = json_encode($data);
?>

<form action="http://localhost/stock_market_application/razorpay_api/verify.php" method="POST">

    <script src="https://checkout.razorpay.com/v1/checkout.js" data-key="<?php echo $data['key'] ?>" data-amount="<?php echo $data['amount'] ?>" data-currency="INR" data-name="<?php echo $data['name'] ?>" data-image="<?php echo $data['image'] ?>" data-description="<?php echo $data['description'] ?>" data-prefill.name="<?php echo $data['prefill']['name'] ?>" data-prefill.email="<?php echo $data['prefill']['email'] ?>" data-prefill.contact="<?php echo $data['prefill']['contact'] ?>" data-notes.shopping_order_id="3456" data-order_id="<?php echo $data['order_id'] ?>" <?php if ($displayCurrency !== 'INR') { ?> data-display_amount="<?php echo $data['display_amount'] ?>" <?php } ?> <?php if ($displayCurrency !== 'INR') { ?> data-display_currency="<?php echo $data['display_currency'] ?>" <?php } ?>>
    </script>

    <input type="hidden" name="shopping_order_id" value="3456">

</form>

<script>
    document.querySelector(".razorpay-payment-button").click();
</script>