<?php
declare(strict_types=1);

// Stateless shared-card landing page.
// Reads the card parameters from the query string, serves matching
// Open Graph tags so WhatsApp and other platforms show a preview,
// and renders the card for a human visitor with a make-your-own call
// to action. Nothing is stored and no user photo is ever received.

function cmm_clean(string $value, int $max): string
{
    $value = strip_tags($value);
    $value = preg_replace('/[\x00-\x1F\x7F]/u', '', $value) ?? '';
    $value = trim($value);
    if (function_exists('mb_substr')) return mb_substr($value, 0, $max, 'UTF-8');
    return substr($value, 0, $max);
}

$OCCASION_LABELS = [
    'birthday' => 'Birthday', 'christmas' => 'Christmas', 'wedding' => 'Wedding',
    'anniversary' => 'Anniversary', 'easter' => 'Easter', 'thankyou' => 'Thank You',
    'congratulations' => 'Congratulations', 'newbaby' => 'New Baby', 'retirement' => 'Retirement',
    'getwell' => 'Get Well', 'valentines' => 'Valentines Day', 'graduation' => 'Graduation',
    'mothersday' => 'Mothers Day', 'fathersday' => 'Fathers Day', 'naming' => 'Naming Ceremony',
    'promotion' => 'Job Promotion', 'custom' => 'Special Occasion',
];

$o = cmm_clean($_GET['o'] ?? 'custom', 40);
$t = cmm_clean($_GET['t'] ?? 'floral', 40);
$h = cmm_clean($_GET['h'] ?? '', 60);
$m = cmm_clean($_GET['m'] ?? '', 180);

$occasionLabel = $OCCASION_LABELS[$o] ?? 'Special Occasion';
if ($h === '') $h = $occasionLabel . ' card';

$site = 'https://cardmakermessages.com';
$query = http_build_query(array_filter(['o' => $o, 't' => $t, 'h' => $h, 'm' => $m], static fn($v) => $v !== ''));
$ogImage = $site . '/api/og.php?' . $query;
$shareUrl = $site . '/c.php?' . $query;
$makeUrl = $site . '/app.html?occasion=' . rawurlencode($o);

$title = $h . ' | Card Maker Messages';
$description = $m !== '' ? $m : ('A ' . strtolower($occasionLabel) . ' card made with Card Maker Messages. Create your own free.');

$e = static fn(string $v): string => htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
?>
<!doctype html>
<html lang="en-GB" data-site-domain="cardmakermessages.com">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?= $e($title) ?></title>
<link rel="canonical" href="<?= $e($shareUrl) ?>">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Card Maker Messages">
<meta property="og:title" content="<?= $e($h) ?>">
<meta property="og:description" content="<?= $e($description) ?>">
<meta property="og:url" content="<?= $e($shareUrl) ?>">
<meta property="og:image" content="<?= $e($ogImage) ?>">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="<?= $e($h) ?>">
<meta name="twitter:description" content="<?= $e($description) ?>">
<meta name="twitter:image" content="<?= $e($ogImage) ?>">
<meta name="theme-color" content="#6d2942">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="stylesheet" href="/assets/site.css?v=20">
<style>
.shared-wrap { max-width: 720px; margin: 0 auto; padding: 48px 20px 80px; text-align: center; }
.shared-preview { margin: 24px auto 28px; border-radius: 20px; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,.22); max-width: 480px; }
.shared-preview img { display: block; width: 100%; height: auto; }
.shared-cta { display: inline-block; margin-top: 8px; padding: 16px 30px; border-radius: 999px; background: #6d2942; color: #fff; font-weight: 600; text-decoration: none; }
.shared-note { margin-top: 22px; font-size: .92rem; color: #6b6357; }
.shared-kicker { letter-spacing: .12em; text-transform: uppercase; font-size: .78rem; color: #9b6a52; margin: 0 0 6px; }
</style>
</head>
<body>
<main class="shared-wrap">
  <p class="shared-kicker">A card was shared with you</p>
  <h1><?= $e($h) ?></h1>
  <div class="shared-preview"><img src="<?= $e($ogImage) ?>" alt="<?= $e($h) ?> preview" width="1200" height="630"></div>
  <?php if ($m !== ''): ?><p style="max-width:520px;margin:0 auto 24px;font-size:1.05rem;color:#4a2837;"><?= $e($m) ?></p><?php endif; ?>
  <a class="shared-cta" href="<?= $e($makeUrl) ?>">Make your own free card</a>
  <p class="shared-note">This preview shows the card design and message. It does not include any personal photo, which stays private on the sender's device.</p>
</main>
</body>
</html>
