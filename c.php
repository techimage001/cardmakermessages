<?php
declare(strict_types=1);
function clean(string $key, int $limit=180): string {
    $value = trim((string)($_GET[$key] ?? ''));
    $value = preg_replace('/[\x00-\x1F\x7F]/u', '', $value) ?? '';
    return mb_substr($value, 0, $limit);
}
$o=clean('o',40); $t=clean('t',30); $ol=clean('ol',60); $r=clean('r',60);
$h=clean('h',80) ?: 'A personalised card'; $m=clean('m',220); $c=clean('c',100); $s=clean('s',80);
$rf=clean('rf',24); $rs=clean('rs',12); $v=clean('v',8) ?: '24';
$params=['o'=>$o,'t'=>$t,'ol'=>$ol,'r'=>$r,'h'=>$h,'m'=>$m,'c'=>$c,'s'=>$s,'rf'=>$rf,'rs'=>$rs,'v'=>$v];
$query=http_build_query(array_filter($params, fn($x)=>$x!==''));
$scheme=(!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off')?'https':'http';
$host=$_SERVER['HTTP_HOST'] ?? 'cardmakermessages.com';
$base=$scheme.'://'.$host;
$pageUrl=$base.'/c.php?'.$query;
$ogImage=$base.'/og.php?'.$query;
$title=($ol ?: 'Personalised card').($r ? ' for '.$r : '');
$description=$m ?: 'Open this personalised card made especially for you.';
function e(string $v): string { return htmlspecialchars($v, ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8'); }
?>
<?php header('Cache-Control: public, max-age=300'); ?>
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title><?=e($title)?></title><meta name="robots" content="noindex,nofollow,noarchive">
<meta property="og:type" content="website"><meta property="og:title" content="<?=e($title)?>"><meta property="og:description" content="<?=e($description)?>"><meta property="og:url" content="<?=e($pageUrl)?>">
<meta property="og:image" content="<?=e($ogImage)?>"><meta property="og:image:secure_url" content="<?=e($ogImage)?>"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="<?=e($title)?>">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="<?=e($title)?>"><meta name="twitter:description" content="<?=e($description)?>"><meta name="twitter:image" content="<?=e($ogImage)?>">
<style>body{margin:0;background:#f5f0e8;color:#452338;font-family:Arial,sans-serif}.wrap{max-width:980px;margin:auto;padding:24px;text-align:center}.card{background:#fff;border:1px solid #ddcfc4;border-radius:24px;padding:18px;box-shadow:0 18px 50px #39251c20}.card img{display:block;width:100%;height:auto;border-radius:15px}.button{display:inline-block;margin-top:20px;padding:14px 24px;border-radius:999px;background:#77324f;color:#fff;text-decoration:none;font-weight:700}p{line-height:1.6}</style></head><body><main class="wrap"><p>A card has been sent to you</p><div class="card"><img src="<?=e($ogImage)?>" alt="<?=e($title)?>"></div><h1><?=e($title)?></h1><?php if($m):?><p><?=e($m)?></p><?php endif;?><a class="button" href="/app.html?occasion=<?=rawurlencode($o ?: 'birthday')?>">Create your own free card</a></main></body></html>
