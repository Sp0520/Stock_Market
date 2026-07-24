<?php
header('Content-Type: application/json');
require_once(dirname(__DIR__) . '/config/conn.php');

$symbol = isset($_GET['symbol']) ? strtoupper(trim($_GET['symbol'])) : '';

$allNews = [
    [
        'title' => 'TCS signs multi-million dollar transformation deal with European bank.',
        'image' => 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300',
        'summary' => 'Tata Consultancy Services has secured a new strategic contract to migrate the core financial operations of a major European lender to secure cloud infrastructure.',
        'time' => '10 mins ago',
        'source' => 'Bloomberg Quint',
        'category' => 'Technology',
        'symbol' => 'TCS'
    ],
    [
        'title' => 'Reliance Jio launches new smart home routers across key cities.',
        'image' => 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300',
        'summary' => 'Jio Fibernet announced the rollout of advanced gigabit routing systems designed to boost domestic IoT device ecosystems across tier-1 subcontinental markets.',
        'time' => '45 mins ago',
        'source' => 'Economic Times',
        'category' => 'Telecom',
        'symbol' => 'RELIANCE'
    ],
    [
        'title' => 'Infosys announces collaboration with Google Cloud for AI expansion.',
        'image' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300',
        'summary' => 'Infosys Topaz platform will integrate Google Cloud AI assets to deliver bespoke generative intelligence workflows to enterprise consulting clients.',
        'time' => '2 hours ago',
        'source' => 'Reuters India',
        'category' => 'Technology',
        'symbol' => 'INFY'
    ],
    [
        'title' => 'Indian stock markets hold steady near record peaks; Nifty holds 22k.',
        'image' => 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=300',
        'summary' => 'Benchmark indexes NSE Nifty and BSE Sensex maintained structural support zones as heavy buying in IT counteracted banking correction spreads.',
        'time' => '3 hours ago',
        'source' => 'Moneycontrol',
        'category' => 'Markets',
        'symbol' => ''
    ],
    [
        'title' => 'Global commodity update: Gold trades higher amid lower dollar indexes.',
        'image' => 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=300',
        'summary' => 'Spot gold prices climbed towards ₹72,500/10g in morning trading bounds matching currency shifts and global rate adjustments.',
        'time' => '4 hours ago',
        'source' => 'Financial Express',
        'category' => 'Commodities',
        'symbol' => ''
    ]
];

$filteredNews = [];
foreach ($allNews as $news) {
    if (empty($symbol) || $news['symbol'] === $symbol) {
        $filteredNews[] = $news;
    }
}

echo json_encode([
    'success' => true,
    'news' => $filteredNews
]);
exit;
?>
