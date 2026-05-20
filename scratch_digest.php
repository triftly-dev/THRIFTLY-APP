<?php
$urls = [
    'https://thriftly-app-frontend.vercel.app',
    'https://thrifty-marketplace.vercel.app'
];

foreach ($urls as $frontendUrl) {
    $body = [
        'order' => [
            'amount' => 10000,
            'invoice_number' => 'TRF-1779264428-15',
            'callback_url' => $frontendUrl . '/payment/success/TRF-1779264428-15',
            'auto_redirect' => true
        ],
        'payment' => [
            'payment_due_date' => 60
        ]
    ];

    $jsonBody = json_encode($body, JSON_UNESCAPED_SLASHES);
    $digest = base64_encode(hash('sha256', $jsonBody, true));
    echo "URL: $frontendUrl" . PHP_EOL;
    echo "  Digest Unescaped: $digest" . PHP_EOL;

    $jsonBodyEsc = json_encode($body);
    $digestEsc = base64_encode(hash('sha256', $jsonBodyEsc, true));
    echo "  Digest Escaped:   $digestEsc" . PHP_EOL;
}
