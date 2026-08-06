<?php
// Indian Stock Market Platform - Route to HTML5, CSS, JS React SPA
$distIndex = __DIR__ . '/client/dist/index.html';

if (file_exists($distIndex)) {
    $content = file_get_contents($distIndex);
    $content = str_replace('./assets/', 'client/dist/assets/', $content);
    $content = str_replace('href="/assets/', 'href="client/dist/assets/', $content);
    $content = str_replace('src="/assets/', 'src="client/dist/assets/', $content);
    echo $content;
} else {
    header("Location: http://localhost:5173/");
    exit();
}
