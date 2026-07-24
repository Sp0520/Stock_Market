<?php
header('Content-Type: application/json');
require_once(dirname(__DIR__) . '/config/conn.php');

$symbol = isset($_GET['symbol']) ? strtoupper(trim($_GET['symbol'])) : 'TCS';

// Set up company metadata mapping for popular tickers
$companyMetadata = [
    'TCS' => [
        'name' => 'Tata Consultancy Services Ltd.',
        'ceo' => 'K. Krithivasan',
        'founded' => 1968,
        'headquarters' => 'Mumbai, India',
        'employees' => '601,546',
        'industry' => 'IT Services & Consulting',
        'sector' => 'Information Technology',
        'website' => 'https://www.tcs.com',
        'description' => 'Tata Consultancy Services is an IT services, consulting and business solutions organization that has been partnering with many of the world’s largest businesses in their transformation journeys for over 50 years.'
    ],
    'RELIANCE' => [
        'name' => 'Reliance Industries Ltd.',
        'ceo' => 'Mukesh Ambani',
        'founded' => 1973,
        'headquarters' => 'Mumbai, India',
        'employees' => '389,414',
        'industry' => 'Conglomerate (Oil, Retail, Telecom)',
        'sector' => 'Energy & Utilities',
        'website' => 'https://www.ril.com',
        'description' => 'Reliance Industries Limited is a Fortune 500 company and the largest private sector corporation in India. It has evolved from being a textiles and polyester company into an energy, materials, retail, entertainment and digital services behemoth.'
    ],
    'INFY' => [
        'name' => 'Infosys Ltd.',
        'ceo' => 'Salil Parekh',
        'founded' => 1981,
        'headquarters' => 'Bengaluru, India',
        'employees' => '322,900',
        'industry' => 'IT Services & Consulting',
        'sector' => 'Information Technology',
        'website' => 'https://www.infosys.com',
        'description' => 'Infosys is a global leader in next-generation digital services and consulting. We enable clients in more than 56 countries to navigate their digital transformation.'
    ]
];

// Fallback metadata generator if ticker not in mapping
$metadata = $companyMetadata[$symbol] ?? [
    'name' => $symbol . ' Holdings Ltd.',
    'ceo' => 'Director Board',
    'founded' => 2005,
    'headquarters' => 'Mumbai, India',
    'employees' => '12,450',
    'industry' => 'Industrial Goods & Trade',
    'sector' => 'Industrial Materials',
    'website' => 'https://www.google.com',
    'description' => $symbol . ' is an industrial leader specializing in retail manufacturing, trade services, and asset allocation across Indian subcontinental sectors.'
];

// Generate Ratios
$ratios = [
    'market_cap' => '₹8.45 Lakh Cr',
    'pe' => '28.45',
    'eps' => '₹124.50',
    'book_value' => '₹410.20',
    'div_yield' => '1.15%',
    'face_value' => '₹1.00',
    'roe' => '42.15%',
    'roce' => '51.30%',
    'debt_equity' => '0.04'
];

// Income Statement & Balance Sheet
$financials = [
    'quarters' => [
        'Q1 2026' => ['revenue' => 61237, 'profit' => 12040, 'margin' => 19.6],
        'Q2 2026' => ['revenue' => 62150, 'profit' => 12450, 'margin' => 20.0],
        'Q3 2026' => ['revenue' => 63580, 'profit' => 12900, 'margin' => 20.2],
        'Q4 2026' => ['revenue' => 64120, 'profit' => 13150, 'margin' => 20.5]
    ],
    'annual' => [
        '2023' => ['revenue' => 225458, 'profit' => 42147, 'margin' => 18.7],
        '2024' => ['revenue' => 240893, 'profit' => 46099, 'margin' => 19.1],
        '2025' => ['revenue' => 251230, 'profit' => 49540, 'margin' => 19.7]
    ],
    'balance_sheet' => [
        'liabilities' => [
            'Share Capital' => 366,
            'Reserves & Surplus' => 98450,
            'Long Term Borrowings' => 0,
            'Current Liabilities' => 12450
        ],
        'assets' => [
            'Fixed Assets' => 22450,
            'Investments' => 41230,
            'Cash & Bank' => 18500,
            'Other Assets' => 29086
        ]
    ]
];

// Shareholding Pattern
$shareholders = [
    'promoters' => 72.30,
    'fii' => 12.45,
    'dii' => 10.15,
    'public' => 5.10
];

// Corporate Actions
$actions = [
    'dividends' => [
        ['type' => 'Final', 'amount' => '₹28.00 per share', 'date' => '2026-06-18'],
        ['type' => 'Interim', 'amount' => '₹9.00 per share', 'date' => '2026-01-22'],
        ['type' => 'Interim', 'amount' => '₹9.00 per share', 'date' => '2025-10-15']
    ],
    'bonus' => [
        ['ratio' => '1:1', 'date' => '2018-05-31']
    ],
    'splits' => [
        ['ratio' => '10 to 1', 'date' => '2015-06-03']
    ]
];

echo json_encode([
    'success' => true,
    'symbol' => $symbol,
    'profile' => $metadata,
    'ratios' => $ratios,
    'financials' => $financials,
    'shareholders' => $shareholders,
    'actions' => $actions
]);
exit;
?>
