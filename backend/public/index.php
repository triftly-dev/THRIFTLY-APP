<?php

/**
 * Laravel - A PHP Framework For Web Artisans
 *
 * @package  Laravel
 * @author   Taylor Otwell <taylor@laravel.com>
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// TES LOG LANGSUNG: Jika ini tidak muncul di tail, berarti kita cek file log yang salah!
file_put_contents(__DIR__.'/../storage/logs/laravel.log', '['.date('Y-m-d H:i:s').'] DEBUG: REQUEST MASUK KE INDEX.PHP'."\n", FILE_APPEND);

define('LARAVEL_START', microtime(true));

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
)->send();

$kernel->terminate($request, $response);
