<?php
declare(strict_types=1);
require_once __DIR__ . '/smtp_mailer.php';

const CMM_COOKIE_NAME = 'cmm_verified_access';
const CMM_VERIFY_HOURS = 48;
const CMM_SESSION_DAYS = 365;
const CMM_SITE_URL = 'https://cardmakermessages.com';
const CMM_FREE_USES = 3;
const CMM_MIN_SUBMIT_SECONDS = 3;
const CMM_RATE_LIMIT_PER_HOUR = 3;

$CMM_SECRET_PATHS = [
    dirname(__DIR__, 2) . '/cmm_private/secrets.php',
    dirname(__DIR__) . '/../cmm_private/secrets.php',
];
$CMM_SECRETS = [
    'SITE_SALT' => '',
    'NOTIFY_EMAIL' => 'info@cardmakermessages.com',
    'smtp_host' => 'smtp.hostinger.com',
    'smtp_port' => 465,
    'smtp_user' => 'info@cardmakermessages.com',
    'smtp_pass' => '',
    'from_email' => 'info@cardmakermessages.com',
    'from_name' => 'Card Maker Messages',
];
foreach ($CMM_SECRET_PATHS as $secretPath) {
    if (!is_readable($secretPath)) continue;
    $loaded = require $secretPath;
    if (is_array($loaded)) $CMM_SECRETS = array_merge($CMM_SECRETS, $loaded);
    break;
}
define('CMM_SITE_SALT', (string)$CMM_SECRETS['SITE_SALT']);
define('CMM_NOTIFY_EMAIL', (string)$CMM_SECRETS['NOTIFY_EMAIL']);
define('CMM_SECRETS_PRESENT', CMM_SITE_SALT !== '' && (string)$CMM_SECRETS['smtp_pass'] !== '');

function cmm_json(int $status, array $payload): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function cmm_private_dir(): string {
    $dir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'cmm_private';
    if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) {
        throw new RuntimeException('Could not create private storage.');
    }
    if (!is_writable($dir)) throw new RuntimeException('Private storage is not writable.');
    return $dir;
}

function cmm_db(): PDO {
    static $db = null;
    if ($db instanceof PDO) return $db;
    $db = new PDO('sqlite:' . cmm_private_dir() . DIRECTORY_SEPARATOR . 'leads.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec('PRAGMA journal_mode=WAL');
    $db->exec('CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        token TEXT NOT NULL,
        page TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        ip_hash TEXT,
        verified_at TEXT,
        token_expires_at INTEGER,
        unsubscribe_token TEXT
    )');
    $db->exec('CREATE TABLE IF NOT EXISTS attempts (ip_hash TEXT PRIMARY KEY, count INTEGER NOT NULL, window_start INTEGER NOT NULL)');
    $db->exec('CREATE TABLE IF NOT EXISTS access_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        session_hash TEXT NOT NULL UNIQUE,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
    )');
    return $db;
}

function cmm_https_url(string $path): string {
    return CMM_SITE_URL . '/' . ltrim($path, '/');
}

function cmm_hash(string $value): string {
    return hash('sha256', $value);
}

function cmm_ip_hash(): string {
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
    return cmm_hash($ip . '|' . CMM_SITE_SALT);
}

function cmm_set_session_cookie(string $rawToken, int $expiresAt): void {
    setcookie(CMM_COOKIE_NAME, $rawToken, [
        'expires' => $expiresAt,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
}

function cmm_clear_session_cookie(): void {
    setcookie(CMM_COOKIE_NAME, '', [
        'expires' => time() - 3600,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
}

function cmm_verified_session(): ?array {
    $raw = (string)($_COOKIE[CMM_COOKIE_NAME] ?? '');
    if (!preg_match('/^[a-f0-9]{64}$/', $raw)) return null;
    $db = cmm_db();
    $stmt = $db->prepare('SELECT email, expires_at FROM access_sessions WHERE session_hash = ? LIMIT 1');
    $stmt->execute([cmm_hash($raw)]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row || (int)$row['expires_at'] < time()) return null;
    return $row;
}

function cmm_send_mail(string $to, string $subject, string $body): bool {
    global $CMM_SECRETS;
    if (!CMM_SECRETS_PRESENT) return false;
    $config = [
        'host' => $CMM_SECRETS['smtp_host'],
        'port' => $CMM_SECRETS['smtp_port'],
        'user' => $CMM_SECRETS['smtp_user'],
        'pass' => $CMM_SECRETS['smtp_pass'],
        'from' => $CMM_SECRETS['from_email'],
        'from_name' => $CMM_SECRETS['from_name'],
    ];
    $error = null;
    $sent = cmm_smtp_send($config, $to, $subject, $body, $error);
    if (!$sent) error_log('Card Maker Messages SMTP error: ' . (string)$error);
    return $sent;
}
