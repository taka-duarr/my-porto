<?php
// CORS Protection: Hanya izinkan domain sendiri dan local environment
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? '';

$isAllowed = false;
if (empty($origin)) {
    // Same-origin request langsung dari browser (tanpa header Origin)
    $isAllowed = true;
    header('Access-Control-Allow-Origin: *');
} else {
    $originHost = parse_url($origin, PHP_URL_HOST);
    $serverHost = parse_url('http://' . $host, PHP_URL_HOST);
    
    $isLocal = in_array($originHost, ['localhost', '127.0.0.1', '::1'], true) ||
               preg_match('/^192\.168\./', $originHost) ||
               preg_match('/^10\./', $originHost);

    if ($originHost === $serverHost || $isLocal) {
        $isAllowed = true;
        header("Access-Control-Allow-Origin: {$origin}");
    }
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!$isAllowed) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden: Cross-origin request tidak diizinkan.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

// ----------------------------------------------------------------------
// Rate Limiter Sederhana (Maksimal 30 request / menit per alamat IP)
// ----------------------------------------------------------------------
$clientIp = $_SERVER['HTTP_CF_CONNECTING_IP'] 
    ?? $_SERVER['HTTP_X_FORWARDED_FOR'] 
    ?? $_SERVER['REMOTE_ADDR'] 
    ?? '127.0.0.1';
if (strpos($clientIp, ',') !== false) {
    $clientIp = trim(explode(',', $clientIp)[0]);
}

$rateDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'porto_ratelimit';
if (!is_dir($rateDir)) {
    @mkdir($rateDir, 0777, true);
}
$rateFile = $rateDir . DIRECTORY_SEPARATOR . md5($clientIp) . '.json';
$now = time();
$window = 60; // 60 detik
$maxRequests = 30; // Max 30 request/menit

$rateData = ['reqs' => []];
if (file_exists($rateFile)) {
    $content = @file_get_contents($rateFile);
    if ($content) {
        $parsed = json_decode($content, true);
        if (is_array($parsed) && isset($parsed['reqs']) && is_array($parsed['reqs'])) {
            $rateData = $parsed;
        }
    }
}
$rateData['reqs'] = array_values(array_filter($rateData['reqs'], function($ts) use ($now, $window) {
    return ($now - $ts) < $window;
}));

if (count($rateData['reqs']) >= $maxRequests) {
    http_response_code(429);
    echo json_encode(['error' => 'Terlalu banyak permintaan (Rate limit). Silakan tunggu sebentar.']);
    exit;
}
$rateData['reqs'][] = $now;
@file_put_contents($rateFile, json_encode($rateData), LOCK_EX);

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
    echo json_encode(['error' => 'NVIDIA_API_KEY tidak ditemukan di .env atau server environment variables.']);
    exit;
}

// Batasi ukuran payload JSON (Maksimal 64 KB untuk mencegah buffer abuse)
$rawInput = file_get_contents('php://input');
if (strlen($rawInput) > 65536) {
    http_response_code(413);
    echo json_encode(['error' => 'Ukuran payload pesan terlalu besar.']);
    exit;
}

$data = json_decode($rawInput, true);

if (!$data || !isset($data['messages']) || !is_array($data['messages'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Format JSON tidak valid atau data "messages" tidak ditemukan.']);
    exit;
}

// Batasi riwayat pesan maksimal 30 pesan terakhir agar hemat token
if (count($data['messages']) > 30) {
    $data['messages'] = array_slice($data['messages'], -30);
}

// Validasi model yang diizinkan
$allowedModels = [
    'mistralai/mistral-large-4-1t-a52b',
    'meta/llama-3.1-70b-instruct',
    'meta/llama-3.3-70b-instruct'
];

$model = (isset($data['model']) && in_array($data['model'], $allowedModels, true))
    ? $data['model']
    : 'mistralai/mistral-large-4-1t-a52b';

$maxTokens = min(max(1, (int)($data['max_tokens'] ?? 2048)), 4096);
$temperature = min(max(0.0, (float)($data['temperature'] ?? 0.7)), 2.0);

$invokeUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';

$payload = [
    'model' => $model,
    'messages' => $data['messages'],
    'max_tokens' => $maxTokens,
    'temperature' => $temperature,
    'stream' => !empty($data['stream'])
];

// Limit reasoning effort
if (isset($data['reasoning_effort']) && in_array($data['reasoning_effort'], ['low', 'medium', 'high'], true)) {
    $payload['reasoning_effort'] = $data['reasoning_effort'];
}

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
