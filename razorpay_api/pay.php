<?php
require_once(dirname(__DIR__) . '/config/razorpay.php');

// Create the Razorpay Order
use Razorpay\Api\Api;

if (empty($keyId) || empty($keySecret)) {
    die('Razorpay keyId or keySecret is missing in configuration.');
}

if (!preg_match('/^rzp_(test|live)_[A-Za-z0-9]+$/', $keyId)) {
    die('Razorpay keyId is not valid format.');
}

$api = new Api($keyId, $keySecret);

$amountVal = isset($_COOKIE['amount']) ? floatval($_COOKIE['amount']) : 0;
if ($amountVal <= 0) {
    die('Invalid amount. Please return to the portfolios page and enter a valid amount.');
}

try {
    $orderData = [
        'receipt'         => 'rcpt_' . time(),
        'amount'          => $amountVal * 100, // amount in paise
        'currency'        => 'INR',
        'payment_capture' => 1 // auto capture
    ];

    $razorpayOrder = $api->order->create($orderData);
    $razorpayOrderId = $razorpayOrder['id'];
    $_SESSION['razorpay_order_id'] = $razorpayOrderId;
} catch (Exception $e) {
    http_response_code(500);
    echo '<div style="background:#111827; color:#fff; font-family:sans-serif; padding:40px; text-align:center; min-height:100vh;">';
    echo '<h1>Razorpay API Error</h1>';
    echo '<p>' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8') . '</p>';
    echo '</div>';
    exit;
}

$displayAmount = $amount = $orderData['amount'];

$data = [
    "key"               => $keyId,
    "amount"            => $amount,
    "name"              => "BullVest Trading Platform",
    "description"       => "Deposit credits to your BullVest account",
    "image"             => "https://cdn-icons-png.flaticon.com/512/3594/3594449.png",
    "prefill"           => [
        "name"              => htmlspecialchars($_SESSION['firstname'] ?? 'Trader'),
        "email"             => htmlspecialchars($_SESSION['email'] ?? 'trader@bullvest.com'),
        "contact"           => "9999999999",
    ],
    "notes"             => [
        "address"           => "BullVest Platform",
        "merchant_order_id" => "order_" . time(),
    ],
    "theme"             => [
        "color"             => "#2962FF"
    ],
    "order_id"          => $razorpayOrderId,
];

$json = json_encode($data);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Processing Payment...</title>
    <style>
        body {
            background-color: #0B1220;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        .loader {
            text-align: center;
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.1);
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border-left-color: #2962FF;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="loader">
        <div class="spinner"></div>
        <h2>Redirecting to payment gateway...</h2>
        <p style="color: #9CA3AF;">Please do not refresh the page or click back.</p>
    </div>

    <form action="verify.php" method="POST" style="display: none;">
        <script src="https://checkout.razorpay.com/v1/checkout.js" 
            data-key="<?php echo $data['key'] ?>" 
            data-amount="<?php echo $data['amount'] ?>" 
            data-currency="INR" 
            data-name="<?php echo $data['name'] ?>" 
            data-image="<?php echo $data['image'] ?>" 
            data-description="<?php echo $data['description'] ?>" 
            data-prefill.name="<?php echo $data['prefill']['name'] ?>" 
            data-prefill.email="<?php echo $data['prefill']['email'] ?>" 
            data-prefill.contact="<?php echo $data['prefill']['contact'] ?>" 
            data-notes.shopping_order_id="3456" 
            data-order_id="<?php echo $data['order_id'] ?>">
        </script>
        <input type="hidden" name="shopping_order_id" value="3456">
    </form>

    <script>
        document.querySelector(".razorpay-payment-button").click();
    </script>
</body>
</html>