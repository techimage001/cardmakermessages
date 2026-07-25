<?php
declare(strict_types=1);
ini_set('display_errors','0'); error_reporting(0);
function txt(string $k,int $n): string { $v=trim((string)($_GET[$k]??'')); $v=preg_replace('/[\x00-\x1F\x7F]/u','',$v)??''; return mb_substr($v,0,$n); }
if (!extension_loaded('gd') || !function_exists('imagecreatetruecolor')) { header('Location: /assets/og-image.png', true, 302); exit; }
$W=1200;$H=630;$im=imagecreatetruecolor($W,$H); imagealphablending($im,true); imagesavealpha($im,true);
$palette=[
'floral'=>[[248,241,232],[74,40,55],[184,106,118]],'minimal'=>[[244,241,234],[23,42,58],[181,140,75]],'luxury'=>[[25,29,42],[255,250,240],[216,170,78]],'bold'=>[[216,77,101],[255,255,255],[255,213,106]],'festive'=>[[23,74,58],[255,250,240],[213,69,69]]];
[$bgv,$inkv,$accv]=$palette[txt('t',30)]??$palette['floral'];
$bg=imagecolorallocate($im,...$bgv);$ink=imagecolorallocate($im,...$inkv);$accent=imagecolorallocate($im,...$accv); imagefilledrectangle($im,0,0,$W,$H,$bg);
imagesetthickness($im,3); imagerectangle($im,42,42,$W-42,$H-42,$accent);
$ol=txt('ol',60)?:'SPECIAL OCCASION';$r=txt('r',60);$h=txt('h',80)?:'A Personalised Card';$m=txt('m',220);$c=txt('c',100);$s=txt('s',80);
$fontCandidates=['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','/usr/share/fonts/truetype/liberation2/LiberationSerif-Regular.ttf'];
$boldCandidates=['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','/usr/share/fonts/truetype/liberation2/LiberationSerif-Bold.ttf'];
$font=current(array_filter($fontCandidates,'is_file'))?:'';$bold=current(array_filter($boldCandidates,'is_file'))?:$font;
function centre($im,$text,$size,$y,$colour,$font,$max=1050){ if($font&&function_exists('imagettfbbox')){ while($size>16){$b=imagettfbbox($size,0,$font,$text);if(($b[2]-$b[0])<=$max)break;$size-=2;} $b=imagettfbbox($size,0,$font,$text);$x=(imagesx($im)-($b[2]-$b[0]))/2;imagettftext($im,$size,0,(int)$x,$y,$colour,$font,$text);}else{imagestring($im,5,(imagesx($im)-imagefontwidth(5)*strlen($text))/2,$y-18,$text,$colour);} }
function wrapped($im,$text,$size,$y,$colour,$font,$maxWidth=850,$gap=8){$words=preg_split('/\s+/',$text);$lines=[];$line='';foreach($words as $w){$test=trim($line.' '.$w);if($font&&function_exists('imagettfbbox')){$b=imagettfbbox($size,0,$font,$test);$wide=$b[2]-$b[0];}else{$wide=strlen($test)*12;}if($wide>$maxWidth&&$line){$lines[]=$line;$line=$w;}else{$line=$test;}}if($line)$lines[]=$line;foreach(array_slice($lines,0,3) as $i=>$ln) centre($im,$ln,$size,$y+$i*($size+$gap),$colour,$font,$maxWidth);}
centre($im,mb_strtoupper($ol),22,120,$accent,$bold); if($r) centre($im,'To '.$r,34,178,$accent,$font); centre($im,$h,52,285,$ink,$bold); if($m) wrapped($im,$m,27,380,$ink,$font,900,10); if($c) centre($im,$c,20,525,$ink,$font); if($s) centre($im,$s,19,570,$ink,$font);
header('Content-Type: image/png'); header('Cache-Control: public,max-age=86400'); imagepng($im,null,7); imagedestroy($im);
