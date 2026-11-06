<?php
/**
 * Local development router for PHP built-in server (php -S localhost:8080 router.php)
 * Prevents exposing .env and other sensitive files during local testing.
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $uri;

// 1. Block access to hidden files (e.g., .env, .git, etc.)
if (preg_match('/(^|\/)\./', $uri)) {
    http_response_code(403);
    header('Content-Type: text/plain');
    echo '403 Forbidden: Access to sensitive file is prohibited.';
    exit;
}

// 2. Block access to sensitive extensions
if (preg_match('/\.(env|log|sh|bat|exe|ps1|sql)$/i', $uri)) {
    http_response_code(403);
    header('Content-Type: text/plain');
    echo '403 Forbidden';
    exit;
}

// 3. Serve existing static files
if ($uri !== '/' && file_exists($file) && !is_dir($file)) {
    return false; // let PHP built-in server serve it
}

// 4. Default to index.html for root or directory access
if ($uri === '/' || is_dir($file)) {
    require __DIR__ . '/index.html';
    exit;
}

return false;

