<?php
// Photo-free Open Graph card renderer.
// Draws a simple preview of a card from URL parameters only.
// Stores nothing, receives no user photo. Renders on the fly and caches to a
// short-lived temp file keyed by a hash of the params.
//
// This endpoint is written to NEVER return a 500. Any failure at all falls back
// to a 302 redirect to the static brand image, so shared links always show a
// preview. Add ?debug=1 to see the underlying error as plain text instead.

const OG_W = 1200;
const OG_H = 630;
const OG_CACHE_TTL = 86400;
const OG_FALLBACK = 'https://cardmakermessages.com/assets/og-image.png';

$OG_DEBUG = isset($_GET['debug']) && $_GET['debug'] === '1';

// Never let a warning print into the image byte stream. Errors are still
// captured by the shutdown guard and the try/catch below.
if (!$OG_DEBUG) { @ini_set('display_errors', '0'); }
error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE & ~E_WARNING);

function og_fail($fallback, $debug, $context) {
    if ($debug) {
        header('Content-Type: text/plain; charset=utf-8', true, 200);
        echo "OG DEBUG\n";
        echo 'PHP version: ' . PHP_VERSION . "\n";
        echo 'GD loaded: ' . (function_exists('imagecreatetruecolor') ? 'yes' : 'no') . "\n";
        echo 'imagettftext: ' . (function_exists('imagettftext') ? 'yes' : 'no') . "\n";
        echo 'Reason: ' . $context . "\n";
        exit;
    }
    if (!headers_sent()) header('Location: ' . $fallback, true, 302);
    exit;
}

// Catch fatal errors and warnings so they become a clean fallback, not a 500.
register_shutdown_function(function () use ($OG_DEBUG) {
    $e = error_get_last();
    if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        og_fail(OG_FALLBACK, $OG_DEBUG, 'fatal: ' . $e['message'] . ' @ line ' . $e['line']);
    }
});

try {
    if (!function_exists('imagecreatetruecolor')) {
        og_fail(OG_FALLBACK, $OG_DEBUG, 'GD extension not available');
    }

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

    $clean = function ($value, $max) {
        $value = strip_tags((string) $value);
        $value = preg_replace('/[\x00-\x1F\x7F]/u', '', $value);
        if ($value === null) $value = '';
        $value = trim($value);
        return function_exists('mb_substr') ? mb_substr($value, 0, $max, 'UTF-8') : substr($value, 0, $max);
    };

    $occasionKey = $clean($_GET['o'] ?? 'custom', 40);
    $templateKey = $clean($_GET['t'] ?? 'floral', 40);
    $headline    = $clean($_GET['h'] ?? '', 60);
    $message     = $clean($_GET['m'] ?? '', 180);

    $preset = $PRESETS[$templateKey] ?? $PRESETS['floral'];
    $occasion = $OCCASIONS[$occasionKey] ?? $OCCASIONS['custom'];
    if ($headline === '') $headline = $occasion['front'];

    // Cache
    $cacheKey = hash('sha256', $occasionKey . '|' . $templateKey . '|' . $headline . '|' . $message);
    $cacheDir = sys_get_temp_dir() . '/cmm_og';
    $cacheFile = $cacheDir . '/' . $cacheKey . '.png';
    if (!$OG_DEBUG && is_file($cacheFile) && (time() - filemtime($cacheFile)) < OG_CACHE_TTL) {
        header('Content-Type: image/png');
        header('Cache-Control: public, max-age=86400');
        readfile($cacheFile);
        exit;
    }

    $hex = function ($img, $hex) {
        $hex = ltrim((string) $hex, '#');
        if (strlen($hex) !== 6) $hex = 'cccccc';
        $r = intval(substr($hex, 0, 2), 16);
        $g = intval(substr($hex, 2, 2), 16);
        $b = intval(substr($hex, 4, 2), 16);
        return imagecolorallocate($img, $r, $g, $b);
    };

    $img = imagecreatetruecolor(OG_W, OG_H);
    imagealphablending($img, true);

    $bg = $hex($img, $preset['bg']);
    $ink = $hex($img, $preset['ink']);
    $accent = $hex($img, $preset['accent']);

    imagefilledrectangle($img, 0, 0, OG_W, OG_H, $bg);

    $pad = 60;
    imagesetthickness($img, 6);
    imagerectangle($img, $pad, $pad, OG_W - $pad, OG_H - $pad, $accent);

    imagesetthickness($img, 8);
    $tick = 46;
    $corners = [[$pad, $pad, 1, 1], [OG_W - $pad, $pad, -1, 1], [$pad, OG_H - $pad, 1, -1], [OG_W - $pad, OG_H - $pad, -1, -1]];
    foreach ($corners as $c) {
        imageline($img, $c[0], $c[1], $c[0] + $tick * $c[2], $c[1], $accent);
        imageline($img, $c[0], $c[1], $c[0], $c[1] + $tick * $c[3], $accent);
    }

    $centre = intval(OG_W / 2);

    // Prefer TrueType only if a font is bundled AND FreeType actually works.
    // function_exists is not enough: some GD builds expose imagettftext but were
    // compiled without FreeType, so it exists yet always fails. Probe it once.
    $fontDir = __DIR__ . '/fonts';
    $fontBold = $fontDir . '/DejaVuSans-Bold.ttf';
    $fontReg = $fontDir . '/DejaVuSans.ttf';
    $useTtf = false;
    if (function_exists('imagettftext') && is_file($fontReg) && is_file($fontBold)) {
        $probe = @imagettfbbox(12, 0, $fontReg, 'A');
        $useTtf = is_array($probe) && !empty($probe);
    }

    $centreText = function ($size, $font, $text, $y, $colour) use ($img, $centre) {
        $box = imagettfbbox($size, 0, $font, $text);
        $w = abs($box[2] - $box[0]);
        imagettftext($img, $size, 0, intval($centre - $w / 2), $y, $colour, $font, $text);
    };
    $centreBitmap = function ($fontIdx, $text, $y, $colour) use ($img, $centre) {
        $w = imagefontwidth($fontIdx) * strlen($text);
        imagestring($img, $fontIdx, intval($centre - $w / 2), $y, $text, $colour);
    };

    $eyebrow = strtoupper($occasion['label']);

    if ($useTtf) {
        $centreText(24, $fontBold, $eyebrow, 200, $accent);
        $hlLines = explode("\n", wordwrap($headline, 22, "\n", true));
        $y = 300;
        foreach (array_slice($hlLines, 0, 3) as $line) {
            $centreText(52, $fontBold, $line, $y, $ink);
            $y += 70;
        }
        if ($message !== '') {
            $mLines = array_slice(explode("\n", wordwrap($message, 46, "\n", true)), 0, 3);
            $y += 20;
            foreach ($mLines as $line) {
                $centreText(26, $fontReg, $line, $y, $ink);
                $y += 40;
            }
        }
        $centreText(24, $fontReg, 'cardmakermessages.com', OG_H - 90, $accent);
    } else {
        $centreBitmap(4, $eyebrow, 150, $accent);
        $hlLines = explode("\n", wordwrap($headline, 26, "\n", true));
        $y = 240;
        foreach (array_slice($hlLines, 0, 3) as $line) {
            $centreBitmap(5, $line, $y, $ink);
            $y += 42;
        }
        if ($message !== '') {
            $mLines = array_slice(explode("\n", wordwrap($message, 52, "\n", true)), 0, 3);
            $y += 26;
            foreach ($mLines as $line) {
                $centreBitmap(3, $line, $y, $ink);
                $y += 26;
            }
        }
        $centreBitmap(3, 'cardmakermessages.com', OG_H - 130, $accent);
    }

    if (!is_dir($cacheDir)) @mkdir($cacheDir, 0700, true);
    if (is_dir($cacheDir)) @imagepng($img, $cacheFile);

    if ($OG_DEBUG) {
        header('Content-Type: text/plain; charset=utf-8');
        echo "OG DEBUG\n";
        echo 'PHP version: ' . PHP_VERSION . "\n";
        echo 'GD loaded: yes' . "\n";
        echo 'imagettftext: ' . (function_exists('imagettftext') ? 'yes' : 'no') . "\n";
        echo 'TrueType font used: ' . ($useTtf ? 'yes' : 'no (bitmap fallback)') . "\n";
        echo 'Render: success' . "\n";
        imagedestroy($img);
        exit;
    }

    header('Content-Type: image/png');
    header('Cache-Control: public, max-age=86400');
    imagepng($img);
    imagedestroy($img);
} catch (Throwable $e) {
    og_fail(OG_FALLBACK, $OG_DEBUG, 'exception: ' . $e->getMessage() . ' @ line ' . $e->getLine());
}
