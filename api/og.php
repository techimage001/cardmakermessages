<?php
declare(strict_types=1);

// Photo-free Open Graph card renderer.
// Draws a simplified preview of a card from URL parameters only.
// Stores nothing, receives no user photo. Renders on the fly and
// caches to a short-lived temp file keyed by a hash of the params.
// Fails safe: if GD is unavailable, redirects to the static brand image.

const OG_W = 1200;
const OG_H = 630;
const OG_CACHE_TTL = 86400; // 1 day
const OG_FALLBACK = 'https://cardmakermessages.com/assets/og-image.png';

// Template palettes mirror the presets in the front-end app.
$PRESETS = [
    'floral'     => ['bg' => 'f8f1e8', 'ink' => '4a2837', 'accent' => 'b86a76'],
    'minimal'    => ['bg' => 'f4f1ea', 'ink' => '172a3a', 'accent' => 'b58c4b'],
    'photo'      => ['bg' => '293744', 'ink' => 'ffffff', 'accent' => 'f1c478'],
    'bold'       => ['bg' => 'd84d65', 'ink' => 'ffffff', 'accent' => 'ffd56a'],
    'luxury'     => ['bg' => '191d2a', 'ink' => 'fffaf0', 'accent' => 'd8aa4e'],
    'playful'    => ['bg' => 'fff1dc', 'ink' => '3e3151', 'accent' => 'f16f67'],
    'festive'    => ['bg' => '174a3a', 'ink' => 'fffaf0', 'accent' => 'd54545'],
    'peaceful'   => ['bg' => 'edf4f4', 'ink' => '334f55', 'accent' => 'c99b66'],
    'botanical'  => ['bg' => 'dfe6d6', 'ink' => '33412e', 'accent' => '8b5f46'],
    'cute'       => ['bg' => 'ffe8e2', 'ink' => '5b3851', 'accent' => 'e88975'],
    'ocean'      => ['bg' => '0e4f6f', 'ink' => 'f6fbff', 'accent' => '54c2d4'],
    'royal'      => ['bg' => '233a84', 'ink' => 'fffdf5', 'accent' => 'e4bd58'],
    'sky'        => ['bg' => 'dceffc', 'ink' => '24445f', 'accent' => '75a9d1'],
    'teal'       => ['bg' => '146b6f', 'ink' => 'f8fffd', 'accent' => 'd6b978'],
    'lavender'   => ['bg' => 'eee8f7', 'ink' => '49355f', 'accent' => '8f73b5'],
    'plum'       => ['bg' => '4b254b', 'ink' => 'fff7f2', 'accent' => 'd9a6bf'],
    'emerald'    => ['bg' => '114d3b', 'ink' => 'fffaf0', 'accent' => 'd7b766'],
    'terracotta' => ['bg' => 'b85f49', 'ink' => 'fff7ed', 'accent' => 'f0c087'],
    'mono'       => ['bg' => 'f3f1ed', 'ink' => '1d1d1d', 'accent' => '777777'],
    'champagne'  => ['bg' => 'f5e6df', 'ink' => '5a3441', 'accent' => 'c99a62'],
];

// Occasion default front lines mirror the front-end occasion data.
$OCCASIONS = [
    'birthday'      => ['label' => 'Birthday', 'front' => 'Happy Birthday'],
    'christmas'     => ['label' => 'Christmas', 'front' => 'Merry Christmas'],
    'wedding'       => ['label' => 'Wedding', 'front' => 'Congratulations'],
    'anniversary'   => ['label' => 'Anniversary', 'front' => 'Happy Anniversary'],
    'easter'        => ['label' => 'Easter', 'front' => 'Happy Easter'],
    'thankyou'      => ['label' => 'Thank You', 'front' => 'Thank You'],
    'congratulations' => ['label' => 'Congratulations', 'front' => 'Well Done'],
    'newbaby'       => ['label' => 'New Baby', 'front' => 'Welcome, Little One'],
    'retirement'    => ['label' => 'Retirement', 'front' => 'Happy Retirement'],
    'getwell'       => ['label' => 'Get Well', 'front' => 'Thinking of You'],
    'valentines'    => ['label' => 'Valentines Day', 'front' => 'Happy Valentines Day'],
    'graduation'    => ['label' => 'Graduation', 'front' => 'Congratulations, Graduate'],
    'mothersday'    => ['label' => 'Mothers Day', 'front' => 'For a Wonderful Mum'],
    'fathersday'    => ['label' => 'Fathers Day', 'front' => 'Happy Fathers Day'],
    'naming'        => ['label' => 'Child Naming Ceremony', 'front' => 'Welcome, Little One'],
    'promotion'     => ['label' => 'Job Promotion', 'front' => 'Congratulations on Your Promotion'],
    'custom'        => ['label' => 'Special Occasion', 'front' => 'A Special Message'],
];

function og_clean(string $value, int $max): string
{
    $value = strip_tags($value);
    $value = preg_replace('/[\x00-\x1F\x7F]/u', '', $value) ?? '';
    $value = trim($value);
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $max, 'UTF-8');
    }
    return substr($value, 0, $max);
}

function og_hex(int $img, string $hex)
{
    $hex = ltrim($hex, '#');
    if (strlen($hex) !== 6) $hex = 'cccccc';
    return imagecolorallocate(
        $img,
        (int) hexdec(substr($hex, 0, 2)),
        (int) hexdec(substr($hex, 2, 2)),
        (int) hexdec(substr($hex, 4, 2))
    );
}

$occasionKey = og_clean($_GET['o'] ?? 'custom', 40);
$templateKey = og_clean($_GET['t'] ?? 'floral', 40);
$headline    = og_clean($_GET['h'] ?? '', 60);
$message     = og_clean($_GET['m'] ?? '', 180);

$preset = $PRESETS[$templateKey] ?? $PRESETS['floral'];
$occasion = $OCCASIONS[$occasionKey] ?? $OCCASIONS['custom'];
if ($headline === '') $headline = $occasion['front'];

// Fail safe: no GD, hand off to the static brand image.
if (!function_exists('imagecreatetruecolor')) {
    header('Location: ' . OG_FALLBACK, true, 302);
    exit;
}

// Serve from cache when a fresh render exists.
$cacheKey = hash('sha256', $occasionKey . '|' . $templateKey . '|' . $headline . '|' . $message);
$cacheDir = sys_get_temp_dir() . '/cmm_og';
$cacheFile = $cacheDir . '/' . $cacheKey . '.png';
if (is_file($cacheFile) && (time() - filemtime($cacheFile)) < OG_CACHE_TTL) {
    header('Content-Type: image/png');
    header('Cache-Control: public, max-age=86400');
    readfile($cacheFile);
    exit;
}

$img = imagecreatetruecolor(OG_W, OG_H);
imagealphablending($img, true);

$bg = og_hex($img, $preset['bg']);
$ink = og_hex($img, $preset['ink']);
$accent = og_hex($img, $preset['accent']);
imagefilledrectangle($img, 0, 0, OG_W, OG_H, $bg);

// Inner card panel with an accent border.
$pad = 60;
imagefilledrectangle($img, $pad, $pad, OG_W - $pad, OG_H - $pad, $bg);
imagesetthickness($img, 6);
imagerectangle($img, $pad, $pad, OG_W - $pad, OG_H - $pad, $accent);

// Corner accent ticks.
imagesetthickness($img, 8);
$tick = 46;
foreach ([[$pad, $pad, 1, 1], [OG_W - $pad, $pad, -1, 1], [$pad, OG_H - $pad, 1, -1], [OG_W - $pad, OG_H - $pad, -1, -1]] as $c) {
    imageline($img, $c[0], $c[1], $c[0] + $tick * $c[2], $c[1], $accent);
    imageline($img, $c[0], $c[1], $c[0], $c[1] + $tick * $c[3], $accent);
}

$centre = (int) (OG_W / 2);

// Occasion eyebrow.
$eyebrow = strtoupper($occasion['label']);
$ew = imagefontwidth(4) * strlen($eyebrow);
imagestring($img, 4, $centre - (int) ($ew / 2), 150, $eyebrow, $accent);

// Headline, wrapped and scaled with the built-in largest font.
$hl = wordwrap($headline, 26, "\n", true);
$hlLines = explode("\n", $hl);
$y = 240;
foreach ($hlLines as $line) {
    $lw = imagefontwidth(5) * strlen($line);
    imagestring($img, 5, $centre - (int) ($lw / 2), $y, $line, $ink);
    $y += 42;
}

// Optional short message.
if ($message !== '') {
    $mw = wordwrap($message, 52, "\n", true);
    $mLines = array_slice(explode("\n", $mw), 0, 3);
    $y += 26;
    foreach ($mLines as $line) {
        $lw = imagefontwidth(3) * strlen($line);
        imagestring($img, 3, $centre - (int) ($lw / 2), $y, $line, $ink);
        $y += 26;
    }
}

// Footer brand line.
$brand = 'cardmakermessages.com';
$bw = imagefontwidth(3) * strlen($brand);
imagestring($img, 3, $centre - (int) ($bw / 2), OG_H - 130, $brand, $accent);

// Write cache then stream.
if (!is_dir($cacheDir)) @mkdir($cacheDir, 0700, true);
if (is_dir($cacheDir)) @imagepng($img, $cacheFile);

header('Content-Type: image/png');
header('Cache-Control: public, max-age=86400');
imagepng($img);
imagedestroy($img);
