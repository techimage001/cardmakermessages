<?php
declare(strict_types=1);
$email = strtolower(trim((string)($_GET['email'] ?? '')));
$token = trim((string)($_GET['token'] ?? ''));
$message = 'The unsubscribe link is not valid.';
try {
    $dbPath = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'cmm_private' . DIRECTORY_SEPARATOR . 'leads.sqlite';
    if (filter_var($email, FILTER_VALIDATE_EMAIL) && preg_match('/^[a-f0-9]{48}$/', $token) && is_file($dbPath)) {
        $db = new PDO('sqlite:' . $dbPath);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $stmt = $db->prepare('DELETE FROM subscribers WHERE email = ? AND token = ?');
        $stmt->execute([$email, $token]);
        $message = $stmt->rowCount() ? 'You have been unsubscribed.' : 'This address was already removed or the link is no longer active.';
    }
} catch (Throwable $error) {
    $message = 'We could not process the request. Please email info@cardmakermessages.com.';
}
?><!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Unsubscribe | Card Maker Messages</title><style>body{font:18px/1.6 system-ui;margin:0;background:#f8f4ec;color:#18212b}.box{max-width:640px;margin:12vh auto;padding:32px;background:white;border-radius:24px;box-shadow:0 20px 60px #0002}a{color:#6d2942}</style></head><body><main class="box"><h1>Card Maker Messages</h1><p><?=htmlspecialchars($message, ENT_QUOTES, 'UTF-8')?></p><p><a href="/">Return to the homepage</a></p></main></body></html>
