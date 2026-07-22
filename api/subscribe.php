<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

$email = strtolower(trim((string)($_POST['email'] ?? '')));
$honeypot = trim((string)($_POST['company'] ?? ''));
$started = (int)($_POST['started'] ?? 0);
$page = substr(trim((string)($_POST['page'] ?? '')), 0, 180);

if ($honeypot !== '') respond(200, ['ok' => true]);
if ($started > 0 && (int)(microtime(true) * 1000) - $started < 1200) respond(429, ['ok' => false, 'message' => 'Please wait a moment and try again.']);
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) respond(422, ['ok' => false, 'message' => 'Please enter a valid email address.']);

try {
    $privateDir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'cmm_private';
    if (!is_dir($privateDir) && !mkdir($privateDir, 0700, true) && !is_dir($privateDir)) {
        throw new RuntimeException('Could not create private storage.');
    }
    $db = new PDO('sqlite:' . $privateDir . DIRECTORY_SEPARATOR . 'leads.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec('CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        token TEXT NOT NULL,
        page TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        ip_hash TEXT
    )');
    $db->exec('CREATE TABLE IF NOT EXISTS attempts (ip_hash TEXT PRIMARY KEY, count INTEGER NOT NULL, window_start INTEGER NOT NULL)');

    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $ipHash = hash('sha256', $ip . '|' . __FILE__);
    $now = time();
    $row = $db->prepare('SELECT count, window_start FROM attempts WHERE ip_hash = ?');
    $row->execute([$ipHash]);
    $attempt = $row->fetch(PDO::FETCH_ASSOC);
    if ($attempt && $now - (int)$attempt['window_start'] < 3600 && (int)$attempt['count'] >= 12) {
        respond(429, ['ok' => false, 'message' => 'Too many attempts. Please try again later.']);
    }
    if (!$attempt || $now - (int)$attempt['window_start'] >= 3600) {
        $stmt = $db->prepare('INSERT OR REPLACE INTO attempts(ip_hash,count,window_start) VALUES(?,?,?)');
        $stmt->execute([$ipHash, 1, $now]);
    } else {
        $stmt = $db->prepare('UPDATE attempts SET count = count + 1 WHERE ip_hash = ?');
        $stmt->execute([$ipHash]);
    }

    $token = bin2hex(random_bytes(24));
    $timestamp = gmdate('c');
    $stmt = $db->prepare('INSERT INTO subscribers(email,token,page,created_at,updated_at,ip_hash) VALUES(?,?,?,?,?,?)
        ON CONFLICT(email) DO UPDATE SET token=excluded.token, page=excluded.page, updated_at=excluded.updated_at, ip_hash=excluded.ip_hash');
    $stmt->execute([$email, $token, $page, $timestamp, $timestamp, $ipHash]);

    $host = preg_replace('/[^a-z0-9.-]/i', '', (string)($_SERVER['HTTP_HOST'] ?? 'cardmakermessages.com'));
    $unsubscribe = 'https://' . $host . '/api/unsubscribe.php?email=' . rawurlencode($email) . '&token=' . rawurlencode($token);
    $headers = "From: Card Maker Messages <info@cardmakermessages.com>\r\n";
    $headers .= "Reply-To: info@cardmakermessages.com\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    @mail($email, 'Your Card Maker Messages access is unlocked', "Thank you for signing up. Unlimited use is now unlocked on this device.\n\nUnsubscribe: {$unsubscribe}\n", $headers);
    @mail('info@cardmakermessages.com', 'New Card Maker Messages signup', "Email: {$email}\nPage: {$page}\nTime: {$timestamp}\n", $headers);

    respond(200, ['ok' => true, 'message' => 'Access unlocked.']);
} catch (Throwable $error) {
    error_log('Card Maker Messages signup error: ' . $error->getMessage());
    respond(500, ['ok' => false, 'message' => 'The sign-up service is temporarily unavailable. Please try again shortly.']);
}
