<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

/**
 * Load environment variables from .env file
 */
function loadEnvFile($filePath) {
    if (!file_exists($filePath) || !is_readable($filePath)) {
        return false;
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        // Skip comments and empty lines
        if ($line === '' || strpos($line, '#') === 0) {
            continue;
        }

        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);

            // Remove quotes if present
            if ((str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
                $value = substr($value, 1, -1);
            }

            putenv("{$name}={$value}");
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
    return true;
}

// Load .env from workspace root
$envPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';
loadEnvFile($envPath);

// Retrieve API key from environment
$apiKey = getenv('NVIDIA_API_KEY') ?: ($_ENV['NVIDIA_API_KEY'] ?? ($_SERVER['NVIDIA_API_KEY'] ?? ''));

if (empty($apiKey)) {
    http_response_code(500);
    echo json_encode(['error' => 'NVIDIA_API_KEY tidak ditemukan di .env atau server environment variables. Silakan buat file .env dengan format NVIDIA_API_KEY=...']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || !isset($data['messages'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload. "messages" array is required.']);
    exit;
}

$invokeUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';

$payload = [
    'model' => $data['model'] ?? 'moonshotai/kimi-k3',
    'messages' => $data['messages'],
    'max_tokens' => (int)($data['max_tokens'] ?? 2048),
    'temperature' => (float)($data['temperature'] ?? 0.7),
    'stream' => !empty($data['stream'])
];

$ch = curl_init($invokeUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey,
    'Accept: ' . ($payload['stream'] ? 'text/event-stream' : 'application/json')
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 180);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

if ($payload['stream']) {
    // Clean all buffers for SSE
    while (ob_get_level()) {
        ob_end_clean();
    }
    ini_set('output_buffering', 'off');
    ini_set('zlib.output_compression', false);

    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache, no-transform');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no');

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
    curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $data) {
        echo $data;
        if (function_exists('ob_flush')) {
            @ob_flush();
        }
        flush();
        return strlen($data);
    });

    curl_exec($ch);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        echo "event: error\ndata: " . json_encode(['error' => 'cURL Stream Error: ' . $curlErr]) . "\n\n";
    }
    exit;
} else {
    header('Content-Type: application/json');
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        http_response_code(500);
        echo json_encode(['error' => 'cURL Error: ' . $curlErr]);
        exit;
    }

    http_response_code($httpCode ?: 200);
    echo $response;
    exit;
}
