#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const htmlFiles = fs.readdirSync(ROOT).filter(file => file.endsWith('.html')).sort();
let checks = 0;
const seenTitles = new Set();
const seenDescriptions = new Set();
const versions = new Set();
const seenFaqQuestions = new Map();
const seenFaqAnswers = new Map();

function check(condition, message) {
  checks += 1;
  assert.ok(condition, message);
}

function firstMatch(source, regex) {
  return (source.match(regex) || [])[1] || '';
}

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const title = firstMatch(source, /<title>([^<]+)<\/title>/i);
  const description = firstMatch(source, /<meta name="description" content="([^"]+)"/i);
  const canonical = firstMatch(source, /<link rel="canonical" href="([^"]+)"/i);
  check(Boolean(title), `${file}: missing title`);
  check(Boolean(description), `${file}: missing description`);
  check(description.length <= 155, `${file}: description exceeds 155 characters (${description.length})`);
  check(!seenTitles.has(title), `${file}: duplicate title`);
  check(!seenDescriptions.has(description), `${file}: duplicate description`);
  seenTitles.add(title); seenDescriptions.add(description);
  check(canonical.startsWith('https://'), `${file}: canonical must be absolute HTTPS`);
  check(source.includes('name="robots"'), `${file}: missing robots meta`);
  check(source.includes('property="og:title"'), `${file}: missing Open Graph title`);
  check(source.includes('name="twitter:card"'), `${file}: missing Twitter card`);
  check(source.includes('name="theme-color"'), `${file}: missing theme colour`);
  check(source.includes('data-menu-toggle'), `${file}: missing mobile menu button`);
  check(source.includes('data-theme-toggle'), `${file}: missing theme toggle`);
  check(source.includes('class="skip-link"'), `${file}: missing skip link`);
  check(source.includes('/favicon.svg'), `${file}: missing SVG favicon declaration`);
  check(source.includes('/favicon-48.png'), `${file}: missing 48 favicon declaration`);
  check(source.includes('/favicon-96.png'), `${file}: missing 96 favicon declaration`);
  check(source.includes('/favicon.ico'), `${file}: missing ICO favicon declaration`);
  check(source.includes('/apple-touch-icon.png'), `${file}: missing Apple touch icon`);
  check(source.includes('/assets/site.js?v='), `${file}: shared script not loaded`);
  const versionMatches = [...source.matchAll(/\/assets\/[a-z-]+\.(?:css|js)\?v=([0-9]+)/g)];
  versionMatches.forEach(match => versions.add(match[1]));

  const schemaBlocks = [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  check(schemaBlocks.length >= 1, `${file}: missing JSON-LD`);
  schemaBlocks.forEach(block => {
    const parsed = JSON.parse(block[1]);
    check(parsed['@context'] === 'https://schema.org', `${file}: invalid schema context`);
    const types = JSON.stringify(parsed);
    check(types.includes('Organization'), `${file}: schema missing Organization`);
    check(types.includes('WebSite'), `${file}: schema missing WebSite`);
    check(types.includes('BreadcrumbList'), `${file}: schema missing BreadcrumbList`);
  });

  if (file !== '404.html') {
    const faqPairs = [...source.matchAll(/<details><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)];
    check(faqPairs.length >= 3, `${file}: every indexable page needs at least three visible FAQs`);
    faqPairs.forEach(match => {
      const question = match[1].replace(/<[^>]+>/g, '').trim();
      const answer = match[2].replace(/<[^>]+>/g, '').trim();
      check(!seenFaqQuestions.has(question), `${file}: repeated FAQ question also used on ${seenFaqQuestions.get(question)}: ${question}`);
      check(!seenFaqAnswers.has(answer), `${file}: repeated FAQ answer also used on ${seenFaqAnswers.get(answer)}`);
      seenFaqQuestions.set(question, file);
      seenFaqAnswers.set(answer, file);
    });
    const main = firstMatch(source, /<main id="main">([\s\S]*?)<\/main>/i);
    const internalMainLinks = new Set([...main.matchAll(/href="(\/[^"#?]*)/g)].map(match => match[1]));
    check(internalMainLinks.size >= 3, `${file}: needs at least three distinct internal links in the main content`);
  }

  check(!/[—–]/.test(source), `${file}: em or en dash found`);
  check(!/\bCanva\b|Adobe Express|Greetings Island|Moonpig|Punchbowl/i.test(source), `${file}: competitor name found`);
  check(!/adsbygoogle|googlesyndication|pagead2|data-ad-client|doubleclick|googletag|amazon-adsystem/i.test(source), `${file}: advertising code found`);
  check(!/No adverts\. No paid API\. Photos stay in your browser\.|code-drawn designs?/i.test(source), `${file}: unwanted technical footer wording found`);
  check(!/src="https?:\/\//i.test(source), `${file}: external script or image source found`);

  for (const match of source.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
    const value = match[1].split(/[?#]/)[0];
    if (!value || value === '/' || value.startsWith('/api/')) continue;
    const local = path.join(ROOT, value.replace(/^\//, ''));
    check(fs.existsSync(local), `${file}: broken internal reference ${value}`);
  }
}

check(versions.size === 1 && versions.has(config.assetVersion), `Asset version mismatch: ${[...versions].join(', ')}`);

for (const file of ['favicon.svg','favicon-48.png','favicon-96.png','favicon.ico','apple-touch-icon.png','assets/icon-192.png','assets/icon-512.png','assets/og-image.png','robots.txt','sitemap.xml','site.webmanifest','service-worker.js','llms.txt','.htaccess','COPYRIGHT-SAFETY.md','EMAIL-VERIFICATION-SETUP.md','CMM-SECRETS-TEMPLATE.php']) {
  check(fs.existsSync(path.join(ROOT, file)), `Missing required file: ${file}`);
}

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]).filter(url => !url.includes('/assets/'));
const indexableCount = htmlFiles.filter(file => file !== '404.html').length;
check(sitemapUrls.length === indexableCount, `Sitemap has ${sitemapUrls.length} page URLs but ${indexableCount} indexable pages exist`);
check(!sitemap.includes('/404.html'), '404 page must not be in sitemap');
check(sitemap.includes('<lastmod>'), 'Sitemap must include lastmod');

const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
for (const bot of ['Googlebot','Bingbot','OAI-SearchBot','ChatGPT-User','PerplexityBot','Claude-SearchBot']) {
  check(robots.includes(bot), `robots.txt missing ${bot}`);
}
check(robots.includes(`Sitemap: ${config.domain.replace(/\/$/, '')}/sitemap.xml`), 'robots.txt sitemap URL mismatch');

const keyFile = path.join(ROOT, `${config.indexNowKey}.txt`);
check(fs.existsSync(keyFile), 'IndexNow key file missing');
check(fs.readFileSync(keyFile, 'utf8').trim() === config.indexNowKey, 'IndexNow key file content mismatch');

const css = fs.readFileSync(path.join(ROOT, 'assets/site.css'), 'utf8');
check(css.includes('overflow-x: clip'), 'CSS missing overflow-x: clip');
check(css.includes('@supports not (overflow-x: clip)'), 'CSS missing overflow fallback');
check(!/html[^}]*overflow-x:\s*hidden/i.test(css), 'Sticky-breaking overflow hidden found on html');
check(css.includes('min-height: 44px'), 'CSS missing 44px tap targets');

const app = fs.readFileSync(path.join(ROOT, 'app.html'), 'utf8');
for (const id of ['cardCanvas','messageOptions','messageOptionsPanel','downloadPng','downloadPdf','reviewCard','photoInput','photoPositionControls','photoZoom','centrePhoto','backgroundPicker','mainMessage','frontHeading','backMessage','customOccasion','eventTitle','eventDate','eventVenue','eventRsvp','downloadSinglePdf','downloadWorkspace','signupForm']) {
  check(app.includes(`id="${id}"`), `app.html missing #${id}`);
}
for (const text of ['Folded card','A4 folded to A5','A5 folded to A6','Review selected format','Instagram square','5 × 7 inch','Show message choices','WhatsApp square','LinkedIn post','4 × 6 inch postcard','6 × 6 inch square']) {
  check(app.includes(text), `app.html missing required copy: ${text}`);
}

check(app.indexOf('id="outputFormatSection"') < app.indexOf('id="reviewCard"'), 'Size and format choices must appear before review');
check(app.includes('id="reviewSingleWrap"') && app.includes('id="reviewFoldedWrap"'), 'app.html missing exact-format review views');
check(app.includes('id="facebookShare"') && app.includes('id="linkedinShare"') && app.includes('id="pinterestShare"'), 'app.html missing social share choices');
check(app.includes('id="cardMakerWorkspace"'), 'app.html missing workspace scroll target');
check(app.includes('data-signup-open'), 'app.html missing sign-up control');
check(app.includes('data-inside-paper="white"') && app.includes('data-inside-paper="ivory"'), 'app.html missing light inside-paper choices');
check(app.includes('data-creation-type="invitation"'), 'app.html missing invitation creation mode');
check(app.includes('data-creation-type="postcard"'), 'app.html missing postcard creation mode');
check(app.includes(config.domain), 'app.html missing configured domain');

check(app.includes('class="design-options-visible"'), 'app.html must keep the full design studio visible');
check(!app.includes('<details class="more-options"'), 'app.html must not hide design controls in a More design options disclosure');
for (const selectorText of ['data-frame="wreath"','data-frame="lily"','data-frame="paw"','data-frame="rainbow"','data-illustration="heart"','data-illustration="dove"','data-illustration="rainbow"','data-illustration="paw"','data-accent="dove"','data-accent="paw"','data-text-style="quotes"','data-font="handwritten"']) {
  check(app.includes(selectorText), `app.html missing robust design control ${selectorText}`);
}
check(app.includes('id="floatingPreviewDock"') && app.includes('id="floatingCardCanvas"'), 'app.html missing persistent floating card preview');
const invitationTemplates = fs.readFileSync(path.join(ROOT, 'invitation-templates.html'), 'utf8');
check(/class="mock-design-link" href="\/app\.html/.test(invitationTemplates), 'Invitation template Choose design control must be a real app link');
const serviceWorker = fs.readFileSync(path.join(ROOT, 'service-worker.js'), 'utf8');
check(serviceWorker.includes("cache:'no-store'"), 'Service worker must use fresh network requests');
check(!serviceWorker.includes('caches.match(event.request)'), 'Cache-first service-worker response found');
const htaccess = fs.readFileSync(path.join(ROOT, '.htaccess'), 'utf8');
check(htaccess.includes('no-cache, no-store, must-revalidate, max-age=0'), '.htaccess missing deployment freshness headers');
check(css.includes('.design-options-visible { display: block !important; }'), 'CSS must keep full design controls visible');
check(css.includes('.mock-controls .mock-design-link') && css.includes('pointer-events: auto'), 'Choose design link needs an interactive CSS layer');
check(css.includes('.floating-preview-dock'), 'CSS missing persistent footer preview');
for (const file of ['api/bootstrap.php','api/verify.php','api/status.php','api/logout.php','api/smtp_mailer.php']) check(fs.existsSync(path.join(ROOT,file)), `Missing verified-email access file: ${file}`);
const subscribeSource = fs.readFileSync(path.join(ROOT, 'api/subscribe.php'), 'utf8');
const verifySource = fs.readFileSync(path.join(ROOT, 'api/verify.php'), 'utf8');
check(subscribeSource.includes('verification link') && subscribeSource.includes('honeypot'), 'Signup must use email verification and bot protection');
check(subscribeSource.includes("hash_equals($expected") && subscribeSource.includes('checkdnsrr') && subscribeSource.includes('CMM_MIN_SUBMIT_SECONDS'), 'Signup must use the browser token, mail-domain checks and timing protection');
check(verifySource.includes('cmm_set_session_cookie') && verifySource.includes('verified_at'), 'Verification endpoint must unlock only a verified email session');
const bootstrapSource = fs.readFileSync(path.join(ROOT, 'api/bootstrap.php'), 'utf8');
const smtpSource = fs.readFileSync(path.join(ROOT, 'api/smtp_mailer.php'), 'utf8');
check(bootstrapSource.includes("cmm_private/secrets.php") && bootstrapSource.includes('CMM_SECRETS_PRESENT'), 'Email secrets must load from private storage outside public_html');
check(smtpSource.includes('AUTH LOGIN') && smtpSource.includes('smtp.hostinger.com'), 'Email verification must use authenticated Hostinger SMTP');

check(fs.readFileSync(path.join(ROOT, 'contact.html'), 'utf8').includes(config.email), 'contact page email mismatch');
for (const file of ['api/subscribe.php','api/unsubscribe.php','fathers-day-card-maker.html','valentines-day-card-maker.html','graduation-card-maker.html','retirement-card-maker.html','child-naming-ceremony-card-maker.html','job-promotion-card-maker.html']) check(fs.existsSync(path.join(ROOT,file)), `Missing launch file: ${file}`);

// Keyword landing pages must be genuinely distinct, not synonym duplicates.
const toolPages = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/tool-pages.json'), 'utf8'));
function tokens(page) {
  const text = [page.answer, page.sectionAnswer, ...(page.steps || []), ...(page.features || []).flat()].join(' ').toLowerCase();
  return new Set((text.match(/[a-z0-9]+/g) || []).filter(word => word.length > 2));
}
function jaccard(a, b) {
  const intersection = [...a].filter(value => b.has(value)).length;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}
let highestSimilarity = 0;
let highestPair = '';
for (let i = 0; i < toolPages.length; i += 1) {
  for (let j = i + 1; j < toolPages.length; j += 1) {
    const score = jaccard(tokens(toolPages[i]), tokens(toolPages[j]));
    if (score > highestSimilarity) {
      highestSimilarity = score;
      highestPair = `${toolPages[i].slug} / ${toolPages[j].slug}`;
    }
    check(score <= 0.72, `Keyword pages too similar (${score.toFixed(3)}): ${toolPages[i].slug} / ${toolPages[j].slug}`);
  }
}

const appSource = fs.readFileSync(path.join(ROOT, 'src/app.js'), 'utf8');
check(appSource.includes('All visual motifs are original procedural canvas drawings'), 'Copyright-safety declaration missing from visual engine');
check(appSource.includes("canvas.addEventListener('pointerdown'") && appSource.includes('data-photo-nudge') && appSource.includes('photoZoom'), 'Photo must support direct pointer dragging, nudging and zoom');
check(appSource.includes('Photo added at the top of the card') && appSource.includes('drawPhotoTopArea'), 'Uploaded photo must appear immediately in the card top area');
check(css.includes('#cardCanvas.photo-draggable') && css.includes('touch-action: none'), 'Photo dragging CSS must support mouse and touch');
check(!/@font-face|fonts\.googleapis|cdnjs|unpkg|jsdelivr/i.test(css + appSource), 'External font or asset dependency found');
const copyrightSafety = fs.readFileSync(path.join(ROOT, 'COPYRIGHT-SAFETY.md'), 'utf8');
check(copyrightSafety.includes('does not bundle third-party greeting-card templates'), 'Copyright safety document is incomplete');

for (const js of ['assets/site.js','assets/messages.js','assets/pdf.js','assets/app.js','tools/build.js','tools/tests.js','tools/submit-index.js']) {
  const full = path.join(ROOT, js);
  check(fs.existsSync(full), `Missing JavaScript file ${js}`);
  execFileSync(process.execPath, ['--check', full], { stdio: 'pipe' });
  checks += 1;
}

console.log(`QA passed: ${checks} assertions across ${htmlFiles.length} HTML pages. Highest keyword-page similarity: ${highestSimilarity.toFixed(3)} (${highestPair}).`);
