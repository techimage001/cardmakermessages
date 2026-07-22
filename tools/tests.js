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

  check(!/[—–]/.test(source), `${file}: em or en dash found`);
  check(!/\bCanva\b|Adobe Express|Greetings Island|Moonpig|Punchbowl/i.test(source), `${file}: competitor name found`);
  check(!/adsbygoogle|googlesyndication|pagead2|data-ad-client|doubleclick|googletag|amazon-adsystem/i.test(source), `${file}: advertising code found`);
  check(!/src="https?:\/\//i.test(source), `${file}: external script or image source found`);

  for (const match of source.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
    const value = match[1].split(/[?#]/)[0];
    if (!value || value === '/' || value.startsWith('/api/')) continue;
    const local = path.join(ROOT, value.replace(/^\//, ''));
    check(fs.existsSync(local), `${file}: broken internal reference ${value}`);
  }
}

check(versions.size === 1 && versions.has(config.assetVersion), `Asset version mismatch: ${[...versions].join(', ')}`);

for (const file of ['favicon.svg','favicon-48.png','favicon-96.png','favicon.ico','apple-touch-icon.png','assets/icon-192.png','assets/icon-512.png','assets/og-image.png','robots.txt','sitemap.xml','site.webmanifest','service-worker.js','llms.txt','.htaccess']) {
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
for (const id of ['cardCanvas','messageOptions','downloadPng','downloadPdf','photoInput','backgroundPicker','mainMessage','eventTitle','eventDate','eventVenue','eventRsvp']) {
  check(app.includes(`id="${id}"`), `app.html missing #${id}`);
}
for (const text of ['Folded printable card','A4 folded to A5','Photos stay in your browser']) {
  check(app.includes(text), `app.html missing required copy: ${text}`);
}
check(app.includes('data-creation-type="invitation"'), 'app.html missing invitation creation mode');
check(app.includes('data-creation-type="postcard"'), 'app.html missing postcard creation mode');
check(app.includes(config.domain), 'app.html missing configured domain');
check(fs.readFileSync(path.join(ROOT, 'contact.html'), 'utf8').includes(config.email), 'contact page email mismatch');

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

for (const js of ['assets/site.js','assets/messages.js','assets/pdf.js','assets/app.js','tools/build.js','tools/tests.js','tools/submit-index.js']) {
  const full = path.join(ROOT, js);
  check(fs.existsSync(full), `Missing JavaScript file ${js}`);
  execFileSync(process.execPath, ['--check', full], { stdio: 'pipe' });
  checks += 1;
}

console.log(`QA passed: ${checks} assertions across ${htmlFiles.length} HTML pages. Highest keyword-page similarity: ${highestSimilarity.toFixed(3)} (${highestPair}).`);
