<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

if (($_GET['config'] ?? '') === '1') {
    cmm_json(200, [
        'ok' => true,
        'salt' => CMM_SITE_SALT,
        'freeUses' => CMM_FREE_USES,
        'minSeconds' => CMM_MIN_SUBMIT_SECONDS,
        'configured' => CMM_SECRETS_PRESENT,
    ]);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') cmm_json(405, ['ok' => false, 'message' => 'Method not allowed.']);
$origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '' && !in_array($origin, [CMM_SITE_URL, 'https://www.cardmakermessages.com'], true)) {
    cmm_json(403, ['ok' => false, 'message' => 'This sign-up request was not accepted.']);
}
if (!CMM_SECRETS_PRESENT) {
    cmm_json(503, ['ok' => false, 'message' => 'Email verification is not configured yet. Add the private Hostinger SMTP settings, then try again.']);
}

$contentType = strtolower((string)($_SERVER['CONTENT_TYPE'] ?? ''));
if (str_contains($contentType, 'application/json')) {
    $data = json_decode((string)file_get_contents('php://input'), true);
    if (!is_array($data)) cmm_json(400, ['ok' => false, 'message' => 'Please try again.']);
} else {
    $data = $_POST;
}

$email = strtolower(trim((string)($data['email'] ?? '')));
$honeypot = trim((string)($data['website'] ?? $data['company'] ?? ''));
$timestampMs = (int)($data['ts'] ?? $data['started'] ?? 0);
$browserToken = trim((string)($data['token'] ?? ''));
$page = substr(trim((string)($data['page'] ?? '')), 0, 180);

/* Bots frequently fill hidden fields. Return a convincing fake success. */
if ($honeypot !== '') cmm_json(200, ['ok' => true, 'pending' => true]);

$elapsedMs = (int)(microtime(true) * 1000) - $timestampMs;
if ($timestampMs <= 0 || $elapsedMs < CMM_MIN_SUBMIT_SECONDS * 1000) {
    cmm_json(429, ['ok' => false, 'message' => 'Please take a moment, then try again.']);
}
$expected = cmm_hash($email . '|' . $timestampMs . '|' . CMM_SITE_SALT);
if ($browserToken === '' || !hash_equals($expected, $browserToken)) {
    cmm_json(400, ['ok' => false, 'message' => 'Please refresh the page and try again.']);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
    cmm_json(422, ['ok' => false, 'message' => 'Please enter a valid email address.']);
}

$domain = substr(strrchr($email, '@') ?: '', 1);
$blocked = [
    'mailinator.com','guerrillamail.com','10minutemail.com','tempmail.com','temp-mail.org','yopmail.com',
    'trashmail.com','sharklasers.com','getnada.com','dispostable.com','maildrop.cc','fakeinbox.com',
    'mintemail.com','throwawaymail.com','mailnesia.com','emailondeck.com','tempinbox.com'
];
if (in_array($domain, $blocked, true)) {
    cmm_json(422, ['ok' => false, 'message' => 'Please use a regular email address so you can open the verification link.']);
}
if (function_exists('checkdnsrr') && !checkdnsrr($domain, 'MX') && !checkdnsrr($domain, 'A')) {
    cmm_json(422, ['ok' => false, 'message' => 'That email domain does not appear to exist. Please check it.']);
}

try {
    $db = cmm_db();
    $ipHash = cmm_ip_hash();
    $now = time();
    $attemptQuery = $db->prepare('SELECT count, window_start FROM attempts WHERE ip_hash = ?');
    $attemptQuery->execute([$ipHash]);
    $attempt = $attemptQuery->fetch(PDO::FETCH_ASSOC);
    if ($attempt && $now - (int)$attempt['window_start'] < 3600 && (int)$attempt['count'] >= CMM_RATE_LIMIT_PER_HOUR) {
        cmm_json(429, ['ok' => false, 'message' => 'Too many verification requests from this connection. Please try again later.']);
    }
    if (!$attempt || $now - (int)$attempt['window_start'] >= 3600) {
        $db->prepare('INSERT OR REPLACE INTO attempts(ip_hash,count,window_start) VALUES(?,?,?)')->execute([$ipHash, 1, $now]);
    } else {
        $db->prepare('UPDATE attempts SET count = count + 1 WHERE ip_hash = ?')->execute([$ipHash]);
    }

    $verificationRaw = bin2hex(random_bytes(32));
    $unsubscribeRaw = bin2hex(random_bytes(32));
    $expires = $now + CMM_VERIFY_HOURS * 3600;
    $iso = gmdate('c');
    $statement = $db->prepare('INSERT INTO subscribers(email,token,page,created_at,updated_at,ip_hash,verified_at,token_expires_at,unsubscribe_token)
        VALUES(?,?,?,?,?,?,?,?,?)
        ON CONFLICT(email) DO UPDATE SET token=excluded.token,page=excluded.page,updated_at=excluded.updated_at,ip_hash=excluded.ip_hash,token_expires_at=excluded.token_expires_at,unsubscribe_token=excluded.unsubscribe_token');
    $statement->execute([$email, cmm_hash($verificationRaw), $page, $iso, $iso, $ipHash, null, $expires, cmm_hash($unsubscribeRaw)]);

    $verifyUrl = cmm_https_url('/api/verify.php?t=' . rawurlencode($verificationRaw));
    $unsubscribeUrl = cmm_https_url('/api/unsubscribe.php?email=' . rawurlencode($email) . '&token=' . rawurlencode($unsubscribeRaw));
    $subject = 'Confirm your email address';
    $body = "Hello,\n\n"
        . "Open the private link below to confirm your email and unlock unlimited Card Maker Messages use on this browser:\n\n"
        . $verifyUrl . "\n\n"
        . "The link works for " . CMM_VERIFY_HOURS . " hours. Nothing is charged and no payment-card details are requested.\n\n"
        . "If you did not request this email, ignore it and nothing will happen.\n\n"
        . "Delete this address from our records:\n" . $unsubscribeUrl . "\n\n"
        . "Card Maker Messages\n" . CMM_SITE_URL . "\n";
    if (!cmm_send_mail($email, $subject, $body)) {
        cmm_json(503, ['ok' => false, 'message' => 'The verification email could not be sent. Please check the private Hostinger SMTP settings and try again.']);
    }
    cmm_json(200, ['ok' => true, 'pending' => true, 'message' => 'Check your inbox and open the verification link. Unlimited access unlocks only after verification.']);
} catch (Throwable $error) {
    error_log('Card Maker Messages signup error: ' . $error->getMessage());
    cmm_json(500, ['ok' => false, 'message' => 'The sign-up service is temporarily unavailable. Please try again shortly.']);
}
