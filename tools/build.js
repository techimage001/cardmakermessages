#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const ASSETS = path.join(ROOT, 'assets');
const configPath = path.join(ROOT, 'site.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const pagesData = JSON.parse(fs.readFileSync(path.join(SRC, 'seo-pages.json'), 'utf8'));
const toolPages = JSON.parse(fs.readFileSync(path.join(SRC, 'tool-pages.json'), 'utf8'));
const domain = config.domain.replace(/\/$/, '');
const version = config.assetVersion;
const assetSlug = String(version).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

if (!/^https:\/\//.test(domain)) throw new Error('site.config.json domain must start with https://');
if (!/^[a-f0-9]{32}$/i.test(config.indexNowKey)) throw new Error('IndexNow key must be exactly 32 hexadecimal characters.');

fs.mkdirSync(ASSETS, { recursive: true });
for (const file of ['site.css', 'site.js', 'messages.js', 'pdf.js', 'app.js']) {
  const source = path.join(SRC, file);
  fs.copyFileSync(source, path.join(ASSETS, file));
  const extension = path.extname(file);
  const basename = path.basename(file, extension);
  fs.copyFileSync(source, path.join(ASSETS, `${basename}-v${assetSlug}${extension}`));
}

const pageList = [];

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function absolute(pathname = '/') {
  return `${domain}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function brandMark() {
  return `<span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 48 48" role="presentation"><rect x="9" y="11" width="25" height="30" rx="5"></rect><rect x="15" y="7" width="25" height="30" rx="5"></rect><path d="M21 17h13M21 23h10M21 29h7"></path></svg></span>`;
}

function nav() {
  return `
    <a href="/card-maker.html">Card maker</a>
    <a href="/invitation-maker.html">Invitations</a>
    <a href="/occasions.html">Card messages</a>
    <a href="/printable-card-guide.html">Print guide</a>
    <a class="button button-primary" href="/app.html">Create free</a>`;
}

function header() {
  return `
<header class="site-header">
  <div class="container header-row">
    <a class="brand" href="/" aria-label="${escapeHtml(config.brand)} home">
      ${brandMark()}
      <span class="brand-wordmark"><strong>Card Maker</strong><em>Messages</em></span>
    </a>
    <nav class="site-nav" aria-label="Main navigation">${nav()}</nav>
    <div class="header-actions">
      <div class="account-control">
        <button class="button signup-header-button" type="button" data-signup-open aria-haspopup="dialog">Sign up</button>
        <div class="account-menu" data-account-menu hidden>
          <strong data-account-email></strong>
          <span>Unlimited free use is unlocked on this device.</span>
          <button class="button button-small" type="button" data-signout>Sign out</button>
        </div>
      </div>
      <button class="icon-button" type="button" data-theme-toggle aria-pressed="false" aria-label="Switch to dark theme">☾</button>
      <button class="icon-button menu-toggle" type="button" data-menu-toggle aria-controls="mobileMenu" aria-expanded="false" aria-label="Open menu">☰</button>
    </div>
  </div>
  <nav id="mobileMenu" class="mobile-menu" data-mobile-menu aria-label="Mobile navigation" hidden>${nav()}<button class="button button-primary mobile-signup" type="button" data-signup-open>Sign up free</button></nav>
</header>`;
}

function footer() {
  const cardLinks = [
    ['Birthday','birthday-card-maker'],['Christmas','christmas-card-maker'],['Wedding','wedding-card-maker'],['Mother’s Day','mothers-day-card-maker'],
    ['Father’s Day','fathers-day-card-maker'],['Valentine’s Day','valentines-day-card-maker'],['Graduation','graduation-card-maker'],['Retirement','retirement-card-maker'],
    ['Child naming','child-naming-ceremony-card-maker'],['Job promotion','job-promotion-card-maker'],['Custom card','custom-card-maker']
  ].map(([label,slug]) => `<a href="/${slug}.html">${label === 'Custom card' ? 'Custom card maker' : `${label} cards`}</a>`).join('');
  const messageLinksA = [
    ['Birthday','birthday-card-messages'],['Christmas','christmas-card-messages'],['Wedding','wedding-card-messages'],['Anniversary','anniversary-card-messages'],
    ['Thank you','thank-you-card-messages'],['Congratulations','congratulations-card-messages'],['New baby','new-baby-card-messages'],['Get well','get-well-card-messages']
  ].map(([label,slug]) => `<a href="/${slug}.html">${label} messages</a>`).join('');
  const messageLinksB = [
    ['Easter','easter-card-messages'],['Mother’s Day','mothers-day-card-messages'],['Father’s Day','fathers-day-card-messages'],['Valentine’s Day','valentines-card-messages'],
    ['Graduation','graduation-card-messages'],['Retirement','retirement-card-messages'],['Child naming','child-naming-ceremony-card-messages'],['Job promotion','job-promotion-card-messages']
  ].map(([label,slug]) => `<a href="/${slug}.html">${label} messages</a>`).join('');
  return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-topline">
      <div>
        <a class="brand footer-brand" href="/">${brandMark()}<span class="brand-wordmark"><strong>Card Maker</strong><em>Messages</em></span></a>
        <p>${escapeHtml(config.tagline)}. Choose the words, personalise every line and create a polished card or invitation with a few simple choices.</p>
      </div>
      <a class="button button-footer-cta" href="/app.html">Customise a card</a>
    </div>
    <div class="footer-grid footer-grid-wide">
      <div><h3>Card makers</h3>${cardLinks}</div>
      <div><h3>Popular messages</h3>${messageLinksA}</div>
      <div><h3>More occasions</h3>${messageLinksB}</div>
      <div><h3>Invitations</h3><a href="/invitation-maker.html">Invitation maker</a><a href="/birthday-invitation-maker.html">Birthday invitations</a><a href="/party-invitation-maker.html">Party invitations</a><a href="/wedding-invitation-maker.html">Wedding invitations</a><a href="/christmas-invitation-maker.html">Christmas invitations</a><a href="/digital-invitation-maker.html">Digital invitations</a><a href="/invitation-templates.html">Invitation templates</a></div>
      <div><h3>Help and company</h3><a href="/how-it-works.html">How it works</a><a href="/printable-card-guide.html">Print guide</a><a href="/methodology.html">How messages are checked</a><a href="/about.html">About</a><a href="/contact.html">Contact</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a></div>
    </div>
    <div class="footer-bottom"><span>© ${escapeHtml(config.brand)}.</span><span><a href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a></span></div>
  </div>
</footer>`;
}

function signupModal() {
  return `<div class="modal-backdrop" data-signup-modal hidden>
    <section class="signup-modal" role="dialog" aria-modal="true" aria-labelledby="signupTitle">
      <button class="modal-close" type="button" data-signup-close aria-label="Close sign-up form">×</button>
      <p class="eyebrow">Keep creating free</p><h2 id="signupTitle">Unlock unlimited cards on this device</h2>
      <p>Create and export three cards first. We then email a private verification link. Unlimited access unlocks only after that link is opened, which helps prevent automated sign-ups.</p>
      <form id="signupForm" novalidate>
        <label for="signupEmail">Email address</label><input id="signupEmail" name="email" type="email" autocomplete="email" required placeholder="you@example.com">
        <input class="honeypot" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
        <input id="signupStarted" type="hidden" name="started" value="0">
        <button class="button button-primary button-large" type="submit">Email my verification link</button>
        <p class="form-status" data-signup-status role="status" aria-live="polite"></p>
      </form>
      <p class="modal-small">Nothing is charged and no card details are requested. Access unlocks after email verification. By signing up, you agree to the <a href="/privacy.html">privacy policy</a>.</p>
    </section>
  </div>`;
}

function defaultFaq(title, pathname) {
  const subject = title.replace(/\s*\|.*$/, '').replace(/[?:].*$/, '').trim();
  const lower = subject.toLowerCase();
  return [
    [`What can I personalise on the ${lower}?`, `The ${lower} lets you change the main wording, front heading, cover line, recipient, personal detail, signature and back-cover note. The live preview updates as you type, and those fields remain editable during Message, Design and Download.`],
    [`Which output works best for the ${lower}?`, `For the ${lower}, choose a social image for WhatsApp or social media, a one-page printable PDF for a flat design, or a folded PDF when you want a traditional front, inside and back. The review screen shows the finished result before any file opens.`],
    [`Where can I find related ideas for the ${lower}?`, `The ${lower} page includes related links to matching card makers, original message collections, invitation tools and the print guide. They are grouped by purpose so you can continue without returning to the homepage.`]
  ];
}

function toolFaq(page) {
  const keyword = page.keyword;
  const lower = keyword.toLowerCase();
  const formatAnswer = page.slug.includes('invitation')
    ? `The ${lower} includes editable event wording, date, time, venue, host and RSVP details. You can export a social image or a one-page printable PDF after checking the finished layout.`
    : page.slug.includes('postcard')
      ? `The ${lower} uses a wide one-page layout suited to a photograph or short note. Choose a landscape social image or a one-page printable PDF and review the design before opening it.`
      : `The ${lower} supports social images, flat printable PDFs and folded cards. Choose the format at the final stage, select the exact size and review the finished design before the file opens.`;
  return [
    [`Can I rewrite every part of the ${lower}?`, `Yes. The ${lower} keeps the final message, front heading, short cover line, recipient, personal detail and signature editable throughout all three stages. Suggested wording is only a starting point.`],
    [`Which sizes are available in the ${lower}?`, formatAnswer],
    [`How does the ${lower} stay easy to use?`, `The ${lower} uses complete one-tap designs instead of layers, handles and free positioning. Automatic spacing, readable contrast and protected margins do the design work while you keep control of the words and colours.`]
  ];
}

function staticFaq(kind) {
  const map = {
    about: [['Why was Card Maker Messages created?', 'Card Maker Messages was created for people who need the right words and a polished card without learning professional design software. The focused workflow combines original messages, one-tap designs, full-panel review and practical print formats.'],['What makes the editor different from a blank design canvas?', 'The editor starts with complete visual systems rather than an empty page. Users choose an occasion and design, then personalise the wording, colours and photo while the layout protects spacing and readability.'],['Can the service support unusual occasions?', 'Yes. The custom card option accepts an event name written by the user, making it suitable for community celebrations, personal milestones, faith events and other occasions not listed in the main library.']],
    methodology: [['Are the card messages copied from quotations or songs?', 'No. The message library is written as original wording for this site. It does not reproduce song lyrics, branded phrases, modern poems or unattributed quotations that could create ownership or attribution problems.'],['How are visual designs kept copyright-safe?', 'Decorative elements are original procedural compositions made from geometry, type, lines, leaves, stars and abstract forms. No third-party templates, entertainment characters, logos or copied illustrations are bundled with the maker.'],['What checks are applied before a message is published?', 'Messages are checked for clarity, tone, sensitivity, suitability for the relationship and unnecessary assumptions. Religious wording is clearly labelled, and sensitive occasions receive gentler language.']],
    privacy: [['Does the website upload the photo used in a card?', 'The maker processes uploaded photos inside the browser and stores the unfinished card locally when browser storage is available. The photo is not sent to the sign-up database.'],['What information is collected when I sign up?', 'The sign-up service stores the email address, the page used and limited security information needed to reduce abuse. The browser stores the unlocked status on that device.'],['How can I remove my information?', `Use an unsubscribe link in an email or contact ${config.email}. You can remove the unfinished card from a device by choosing Start again or clearing the website data in the browser.`]],
    terms: [['May I share the cards I create?', 'You may share finished personal cards with their intended recipients and use ordinary workplace cards for colleagues or customers. You remain responsible for any names, photographs and wording you add.'],['May I upload any photograph?', 'Only upload a photograph that you own or have permission to use. Avoid private, harmful, unlawful or misleading images, and clear the saved card when using a shared device.'],['Why should I print a test copy first?', 'Printer drivers, duplex settings, paper thickness and printable margins differ. A plain-paper test confirms scale, orientation and short-edge flipping before you use card stock.']],
    contact: [['What details help with a card-maker problem?', 'Include the page address, device, browser, stage and exact button involved. A screenshot is useful when private names and photographs have been removed.'],['Can I request another occasion or card size?', 'Yes. Suggestions for missing occasions, recipient types, social sizes, print sizes and accessibility improvements can be sent to the contact email.'],['How should I report wording that needs correction?', 'Send the exact page and sentence, explain the concern and suggest the intended tone where possible. This allows the message to be reviewed without guessing.']]
  };
  return map[kind];
}

function faqMarkup(faq, heading='Frequently asked questions') {
  if (!faq.length) return '';
  return `<section class="section faq-global"><div class="narrow"><p class="eyebrow">Helpful answers</p><h2>${escapeHtml(heading)}</h2><div class="faq">${faq.map(([q,a])=>`<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join('')}</div></div></section>`;
}

function contextLinks(pathname) {
  const common = [['Create a card','/app.html'],['Browse card messages','/occasions.html'],['Printable card guide','/printable-card-guide.html'],['How the maker works','/how-it-works.html']];
  let extras = [];
  if (pathname.includes('birthday')) extras = [['Birthday card maker','/birthday-card-maker.html'],['Birthday messages','/birthday-card-messages.html']];
  else if (pathname.includes('wedding')) extras = [['Wedding card maker','/wedding-card-maker.html'],['Wedding messages','/wedding-card-messages.html']];
  else if (pathname.includes('father')) extras = [['Father’s Day card maker','/fathers-day-card-maker.html'],['Father’s Day messages','/fathers-day-card-messages.html']];
  else if (pathname.includes('valentine')) extras = [['Valentine’s Day card maker','/valentines-day-card-maker.html'],['Valentine’s messages','/valentines-card-messages.html']];
  else if (pathname.includes('graduation')) extras = [['Graduation card maker','/graduation-card-maker.html'],['Graduation messages','/graduation-card-messages.html']];
  else if (pathname.includes('retirement')) extras = [['Retirement card maker','/retirement-card-maker.html'],['Retirement messages','/retirement-card-messages.html']];
  else if (pathname.includes('invitation')) extras = [['Invitation maker','/invitation-maker.html'],['Invitation templates','/invitation-templates.html']];
  else extras = [['Custom card maker','/custom-card-maker.html'],['Digital card maker','/digital-card-maker.html']];
  const links = [...extras, ...common].filter(([,url],i,arr)=>url!==pathname && arr.findIndex(x=>x[1]===url)===i).slice(0,6);
  return `<section class="section internal-links-section"><div class="container related-panel"><div><p class="eyebrow">Continue creating</p><h2>Useful next steps</h2></div><div class="related-links">${links.map(([label,url])=>`<a href="${url}">${label}</a>`).join('')}</div></div></section>`;
}

function breadcrumb(items) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb">${items.map((item, index) => {
    if (index === items.length - 1) return `<span aria-current="page">${escapeHtml(item.name)}</span>`;
    return `<a href="${item.url}">${escapeHtml(item.name)}</a> <span aria-hidden="true">›</span>`;
  }).join(' ')}</nav>`;
}

function graphSchema({ title, description, pathname, breadcrumbs, type = 'Article', faq = [], howTo = [] }) {
  const url = absolute(pathname);
  const graph = [
    {
      '@type': 'Organization', '@id': `${domain}/#organization`, name: config.brand, url: domain,
      logo: { '@type': 'ImageObject', url: absolute('/assets/icon-512.png'), width: 512, height: 512 }
    },
    {
      '@type': 'WebSite', '@id': `${domain}/#website`, url: domain, name: config.brand,
      publisher: { '@id': `${domain}/#organization` }, inLanguage: 'en-GB'
    },
    {
      '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem', position: index + 1, name: item.name, item: absolute(item.url)
      }))
    }
  ];

  if (type === 'WebApplication') {
    graph.push({
      '@type': 'WebApplication', '@id': `${url}#app`, name: title, description, url,
      applicationCategory: 'DesignApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' }, publisher: { '@id': `${domain}/#organization` }
    });
    if (howTo.length) {
      graph.push({
        '@type': 'HowTo', '@id': `${url}#howto`, name: `How to use ${title}`, description,
        step: howTo.map((text, index) => ({ '@type': 'HowToStep', position: index + 1, name: `Step ${index + 1}`, text })),
        publisher: { '@id': `${domain}/#organization` }
      });
    }
  } else if (type === 'HowTo') {
    graph.push({
      '@type': 'HowTo', '@id': `${url}#howto`, name: title, description,
      step: howTo.map((text, index) => ({ '@type': 'HowToStep', position: index + 1, name: `Step ${index + 1}`, text })),
      publisher: { '@id': `${domain}/#organization` }
    });
  } else {
    graph.push({
      '@type': 'Article', '@id': `${url}#article`, headline: title, description, mainEntityOfPage: url,
      author: { '@id': `${domain}/#organization` }, publisher: { '@id': `${domain}/#organization` }, inLanguage: 'en-GB'
    });
  }

  if (faq.length) {
    graph.push({
      '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: faq.map(([question, answer]) => ({
        '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer }
      }))
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

function htmlPage({ pathname, title, description, body, breadcrumbs = [{ name: 'Home', url: '/' }], type = 'Article', faq = [], howTo = [], noindex = false, extraScripts = '', extraHead = '', isolatedAssets = false }) {
  const canonical = absolute(pathname);
  const fullTitle = title.includes(config.brand) ? title : `${title} | ${config.brand}`;
  const robots = noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1';
  const effectiveFaq = faq.length ? faq : (noindex ? [] : defaultFaq(title, pathname));
  const schema = graphSchema({ title, description, pathname, breadcrumbs, type, faq: effectiveFaq, howTo });
  const hasVisibleFaq = /class="[^"]*faq/.test(body);
  const autoFaq = effectiveFaq.length && !hasVisibleFaq ? faqMarkup(effectiveFaq, `Questions about ${title.replace(/\s+(for|with|and).*$/i,'')}`) : '';
  const hasRelated = body.includes('related-panel') || body.includes('internal-links-section');
  const related = noindex || pathname === '/' || pathname === '/app.html' || hasRelated ? '' : contextLinks(pathname);
  const stylesheetHref = isolatedAssets ? `/assets/site-v${assetSlug}.css` : `/assets/site.css?v=${version}`;
  const siteScriptSrc = isolatedAssets ? `/assets/site-v${assetSlug}.js` : `/assets/site.js?v=${version}`;
  const result = `<!doctype html>
<html lang="en-GB" data-site-domain="${escapeHtml(domain.replace(/^https?:\/\//, ''))}">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0"><meta name="cmm-build" content="${version}">
  <script>try{document.documentElement.dataset.theme=JSON.parse(localStorage.getItem('card-maker-messages-state-v2')||'{}').theme||'light'}catch(e){document.documentElement.dataset.theme='light'}</script>
  <title>${escapeHtml(fullTitle)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${robots}">
  <link rel="canonical" href="${canonical}"><meta name="theme-color" content="#6d2942">
  <meta property="og:type" content="website"><meta property="og:site_name" content="${escapeHtml(config.brand)}"><meta property="og:locale" content="${escapeHtml(config.defaultLocale)}">
  <meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${absolute('/assets/og-image.png')}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${absolute('/assets/og-image.png')}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png"><link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png"><link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192.png"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="${stylesheetHref}">${extraHead}<script type="application/ld+json">${schema}</script>
</head>
<body><a class="skip-link" href="#main">Skip to main content</a>${header()}<main id="main">${body}${autoFaq}${related}</main>${footer()}${signupModal()}<div id="appLiveRegion" class="skip-link" role="status" aria-live="polite" aria-atomic="true"></div><script src="${siteScriptSrc}" defer></script>${extraScripts}</body></html>`;
  pageList.push({ pathname, noindex });
  return result;
}

function writePage(filename, options) {
  fs.writeFileSync(path.join(ROOT, filename), htmlPage(options));
}

function occasionCard(page) {
  const icons = { birthday: '○', christmas: '✦', wedding: '♡', anniversary: '∞', easter: '☼', thanks: '♥', congratulations: '★', 'new-baby': '✧', retirement: '◌', 'get-well': '✿', valentine: '♥', graduation: '◆', 'mothers-day':'❀', 'fathers-day':'◇', 'child-naming':'✧', 'job-promotion':'↑' };
  return `<article class="card occasion-card">
    <span class="occasion-icon" aria-hidden="true">${icons[page.occasion] || '♡'}</span>
    <h3>${escapeHtml(page.keyword)}</h3>
    <p>${escapeHtml(page.answer.split('.').slice(0, 2).join('.') + '.')}</p>
    <div class="occasion-card-actions"><a class="button button-primary" href="/app.html?occasion=${encodeURIComponent(page.occasion)}">Customise card</a><a class="text-link" href="/${page.slug}.html">View messages</a></div>
  </article>`;
}

function homeBody() {
  const featuredSlugs = ['birthday-card-messages','wedding-card-messages','christmas-card-messages','valentines-card-messages','fathers-day-card-messages','mothers-day-card-messages','graduation-card-messages','retirement-card-messages','child-naming-ceremony-card-messages','job-promotion-card-messages','thank-you-card-messages','congratulations-card-messages'];
  const cards = featuredSlugs.map(slug => pagesData.find(page => page.slug === slug)).filter(Boolean).map(occasionCard).join('');
  return `
<section class="hero editorial-hero">
  <div class="container hero-grid"><div class="hero-copy"><p class="eyebrow">Card making, thoughtfully simplified</p><h1>Create a beautiful card without being a designer.</h1>
  <div class="answer-block answer-block-hero"><p>Choose the occasion, edit every word, tap a complete design and review the finished card before you share, print or download it.</p></div>
  <div class="button-row hero-actions"><a class="button button-hero-primary button-large" href="/app.html">Customise a card</a><a class="button button-editorial-secondary button-large" href="/occasions.html">Find the right message</a></div>
  <div class="hero-how" aria-label="How the card maker works"><strong>How it works</strong><ol><li><span>1</span>Write the message</li><li><span>2</span>Choose a size</li><li><span>3</span>Pick a design</li><li><span>4</span>Review it</li><li><span>5</span>Download or share</li></ol></div>
  <div class="trust-row editorial-trust"><span><b>✓</b> Edit every line</span><span><b>✓</b> Preview every panel</span><span><b>✓</b> Social and print sizes</span><span><b>✓</b> No watermark</span></div><div class="resume-card" data-resume-card hidden><p data-resume-text>Continue your card where you left off.</p><a class="button button-secondary" href="/app.html">Continue</a></div></div>
  <div class="stationery-stage" aria-label="Original card and invitation examples"><div class="stage-shadow"></div><article class="paper-card paper-card-invite"><span>YOU’RE INVITED</span><strong>Join us for a beautiful celebration</strong><small>Saturday · 6:00 PM</small></article><article class="paper-card paper-card-greeting"><span>HAPPY BIRTHDAY</span><strong>May your day feel every bit as special as you are.</strong><small>Made especially for Sarah</small></article><div class="paper-swatch swatch-one"></div><div class="paper-swatch swatch-two"></div></div></div>
</section>
<section class="premium-proof"><div class="container proof-row"><span>Greeting cards</span><i></i><span>Invitations</span><i></i><span>Original messages</span><i></i><span>Folded PDFs</span><i></i><span>Custom occasions</span></div></section>
<section class="section premium-section"><div class="container"><div class="section-heading split-heading"><div><p class="eyebrow">Start with the occasion</p><h2>Popular cards and messages</h2></div><p>Choose a dedicated message guide or open the card maker immediately. Existing Valentine’s Day, retirement and other pages are improved in place rather than duplicated.</p></div><div class="grid grid-4">${cards}</div><div class="centred-action"><a class="button button-secondary" href="/occasions.html">Browse every occasion</a></div></div></section>
<section class="section premium-section"><div class="container"><div class="section-heading"><p class="eyebrow">Included free</p><h2>More creative freedom without the usual upgrade prompts</h2><p>This comparison describes common category practices without naming another service.</p></div><div class="table-wrap"><table class="comparison premium-comparison"><thead><tr><th>Feature</th><th>Card Maker Messages</th><th>Typical card apps</th></tr></thead><tbody>
<tr><td>Original message choices</td><td class="check">Included free</td><td>Often limited or paid</td></tr><tr><td>Edit every message field</td><td class="check">Included free</td><td>May require a premium plan</td></tr><tr><td>Social image sizes</td><td class="check">Included free</td><td>Some sizes may be restricted</td></tr><tr><td>One-page printable PDF sizes</td><td class="check">Included free</td><td>Often limited</td></tr><tr><td>Printable folded card PDF</td><td class="check">Included free</td><td>Often paid</td></tr><tr><td>Photo cards without a watermark</td><td class="check">Included free</td><td>Watermark or upgrade may apply</td></tr><tr><td>Custom occasions</td><td class="check">Included free</td><td>May be limited to templates</td></tr><tr><td>Full front, inside and back review</td><td class="check">Included free</td><td>May be restricted</td></tr><tr><td>Payment card required</td><td>No</td><td>Sometimes</td></tr></tbody></table></div></div></section>
<section class="section premium-cta"><div class="container cta-panel"><div><p class="eyebrow eyebrow-gold">Start with three free exports</p><h2>Make something thoughtful without learning design software</h2><p>A free verified email sign-up after the third export keeps the maker unlocked on that device. No payment card is requested.</p></div><div class="button-row"><a class="button button-footer-cta button-large" href="/app.html">Customise a card</a><button class="button button-dark-outline button-large" type="button" data-signup-open>Sign up free</button></div></div></section>`;
}

function appBody() {
  const icons = { birthday:'○', christmas:'✦', wedding:'♡', anniversary:'∞', easter:'☼', thanks:'♥', congratulations:'★', 'new-baby':'✧', retirement:'◌', 'get-well':'✿', valentine:'♥', graduation:'◆', 'mothers-day':'❀', 'fathers-day':'◇', 'child-naming':'✧', 'job-promotion':'↑', custom:'+', 'birthday-invitation':'✦', 'party-invitation':'✹', 'wedding-invitation':'◇', 'christmas-invitation':'✦', postcard:'▱' };
  const cardButtons = pagesData.map(page => `<button type="button" class="choice occasion-choice" data-kind="card" data-occasion="${page.occasion}" aria-pressed="false"><span aria-hidden="true">${icons[page.occasion]||'♡'}</span><span>${escapeHtml(page.keyword.replace(/ card messages/i,''))}</span></button>`).join('') + `<button type="button" class="choice occasion-choice custom-occasion-choice" data-kind="card" data-occasion="custom" aria-pressed="false"><span aria-hidden="true">+</span><span>Custom occasion</span></button>`;
  const invitationButtons = [['birthday-invitation','Birthday'],['party-invitation','Party'],['wedding-invitation','Wedding'],['christmas-invitation','Christmas']].map(([v,l])=>`<button type="button" class="choice occasion-choice" data-kind="invitation" data-occasion="${v}" aria-pressed="false"><span aria-hidden="true">${icons[v]}</span><span>${l}</span></button>`).join('');
  const postcardButton = `<button type="button" class="choice occasion-choice" data-kind="postcard" data-occasion="postcard" aria-pressed="false"><span aria-hidden="true">▱</span><span>Postcard</span></button>`;
  const tones = [['heartfelt','Heartfelt'],['short','Short'],['funny','Funny'],['formal','Formal'],['romantic','Romantic'],['religious','Religious'],['inspirational','Inspiring'],['professional','Professional']].map(([v,l])=>`<button type="button" class="choice" data-tone="${v}" aria-pressed="false">${l}</button>`).join('');
  const presetButtons = [['floral','Elegant floral'],['minimal','Modern minimal'],['photo','Photo focus'],['bold','Bold celebration'],['luxury','Luxury dark'],['playful','Joyful colour'],['festive','Traditional festive'],['peaceful','Peaceful light'],['botanical','Botanical'],['cute','Gentle illustrated'],['ocean','Ocean blue'],['royal','Royal blue'],['sky','Sky and cloud'],['teal','Teal elegance'],['lavender','Lavender grace'],['plum','Plum evening'],['emerald','Emerald luxe'],['terracotta','Terracotta warmth'],['mono','Monochrome editorial'],['champagne','Champagne blush']].map(([v,l])=>`<button type="button" class="preset" data-preset="${v}" aria-pressed="false"><span class="preset-preview preset-${v}" aria-hidden="true"></span><span class="preset-label">${l}</span></button>`).join('');
  const editor = `<section id="persistentMessageEditor" class="control-section message-editor-card"><div class="editor-heading"><div><p class="eyebrow">Your wording</p><h2>Edit the card message</h2></div><button id="generateMessages" type="button" class="button button-secondary" aria-expanded="false" aria-controls="messageOptionsPanel">Show message choices</button></div>
    <div class="field-grid message-field-grid"><div class="field field-full"><label for="frontHeading">Front heading title</label><input id="frontHeading" placeholder="For example, Happy Birthday"></div><div class="field field-full"><label for="frontMessage">Front message</label><textarea id="frontMessage" placeholder="For example, Wishing you a day filled with happiness and wonderful memories."></textarea></div><div class="field field-full folded-wording-field" data-folded-wording><label for="mainMessage">Inner message to recipient</label><textarea id="mainMessage" placeholder="Write the longer message that appears on the inside-right panel"></textarea><span class="field-note" data-folded-note>Used for folded cards only</span></div><div class="field"><label for="recipientSelect">Recipient</label><select id="recipientSelect"></select></div><div class="field"><label for="recipientName">Recipient name</label><input id="recipientName" autocomplete="off" placeholder="For example, Sarah"></div><div class="field"><label for="senderName">Sender or signature</label><input id="senderName" placeholder="For example, James and family"></div><div class="field"><label for="coverMessage">Sender short best wishes</label><input id="coverMessage" placeholder="For example, Best wishes"></div><div class="field folded-wording-field" data-back-wording><label for="backMessage">Back-cover note, optional</label><input id="backMessage" placeholder="For example, Created especially for Sarah"><span class="field-note" data-folded-note>Used for folded cards only</span></div></div>
    <div id="messageOptionsPanel" class="message-choice-panel" hidden><h3>Choose a starting message</h3><p class="help">Selecting a suggestion never locks it. You can edit it immediately.</p><div id="messageOptions" class="message-options" aria-label="Suggested messages"></div></div></section>`;
  return `<section class="app-shell"><div class="container"><div class="app-intro"><p class="eyebrow">No design experience needed</p><h1>Create a beautiful card without being a designer</h1><p>Everything is kept simple and editable from start to finish.</p><div class="app-how" aria-label="How the card maker works"><strong>How it works</strong><ol><li><span>1</span>Write your message</li><li><span>2</span>Choose the size</li><li><span>3</span>Pick a design</li><li><span>4</span>Review the result</li><li><span>5</span>Download or share</li></ol></div></div><p id="resumeNotice" class="resume-notice" hidden>Picked up where you left off. Start again whenever you need a blank card.</p>
  <div class="step-tabs five-step-tabs" role="navigation" aria-label="Card creation steps"><button class="step-tab" type="button" data-step="1">1. Message</button><button class="step-tab" type="button" data-step="2">2. Size</button><button class="step-tab" type="button" data-step="3">3. Design</button><button class="step-tab" type="button" data-step="4">4. Review</button><button class="step-tab" type="button" data-step="5">5. Download</button></div>
  <div id="cardMakerWorkspace" class="app-grid"><aside class="preview-column"><div class="preview-card"><div class="panel-tabs" aria-label="Card panels"><button type="button" data-panel="front">Front</button><button type="button" data-panel="inside-left">Inside left</button><button type="button" data-panel="inside-right">Inside right</button><button type="button" data-panel="back">Back</button></div><div class="canvas-wrap"><canvas id="cardCanvas" role="img" aria-label="Live preview of your personalised card"></canvas></div><div class="preview-edit-strip"><p id="previewCaption" class="preview-caption">Live preview · edit anything and it updates</p><div class="preview-edit-actions"><button type="button" class="button button-small" data-jump-step="1">Edit words</button><button type="button" class="button button-small" data-jump-step="2">Change size</button><button type="button" class="button button-small" data-jump-step="3">Change design</button></div></div></div></aside>
  <section class="control-panel"><div id="stageGuardPrompt" class="stage-guard-prompt" hidden role="alert"><strong id="stageGuardTitle">Complete the previous step</strong><p id="stageGuardMessage"></p><button id="stageGuardAction" type="button" class="button button-primary">Go back</button></div><div data-step-panel="1"><div class="control-section occasion-first"><h2>What are you making?</h2><div class="creation-type-grid"><button type="button" class="creation-type" data-creation-type="card"><span>♡</span><strong>Greeting card</strong><small>Digital, flat or folded</small></button><button type="button" class="creation-type" data-creation-type="invitation"><span>✦</span><strong>Invitation</strong><small>Date, venue and RSVP</small></button><button type="button" class="creation-type" data-creation-type="postcard"><span>▱</span><strong>Postcard</strong><small>Wide photo or message</small></button></div><h3>Choose the occasion</h3><div class="occasion-choices">${cardButtons}${invitationButtons}${postcardButton}</div><div id="customOccasionField" class="field" hidden><label for="customOccasion">Type your event or occasion</label><input id="customOccasion" placeholder="For example, Church anniversary or passing a driving test"></div></div><div data-editor-slot="1"></div><div class="control-section optional-guidance"><h2>Optional message guidance</h2><div class="field field-full tone-field"><span class="field-label">Tone</span><div class="choice-grid">${tones}</div></div>
  <div id="invitationDetails" class="invitation-fields" hidden><div class="invitation-fields-heading"><strong>Event details</strong><span>These appear automatically.</span></div><div class="field-grid"><div class="field field-full"><label for="eventTitle">Event title</label><input id="eventTitle"></div><div class="field"><label for="eventDate">Date</label><input id="eventDate" type="date"></div><div class="field"><label for="eventTime">Time</label><input id="eventTime" type="time"></div><div class="field field-full"><label for="eventVenue">Venue</label><input id="eventVenue"></div><div class="field"><label for="eventRsvp">RSVP</label><input id="eventRsvp"></div><div class="field"><label for="eventHost">Hosted by, optional</label><input id="eventHost"></div></div></div></div><div class="step-footer"><button id="startAgain" class="button button-quiet" type="button">Start again</button><button class="button button-primary" type="button" data-next-step>Continue to size</button></div></div>
  <div data-step-panel="2" hidden>
    <div id="outputFormatSection" class="control-section format-before-review"><p class="eyebrow">Choose before reviewing</p><h2>Where will you use the card?</h2><p class="help">The preview changes to the exact shape you select.</p><div class="choice-grid output-mode-grid"><button type="button" class="choice" data-output-mode="digital">Digital and social</button><button type="button" class="choice" data-output-mode="single-print">One-page print</button><button type="button" class="choice" data-output-mode="folded">Folded card</button></div>
      <div id="digitalSizeOptions" class="format-options"><h3>Digital and social sizes</h3><div class="choice-grid size-choice-grid"><button type="button" class="choice" data-size="whatsapp-square">WhatsApp square · 1080 × 1080</button><button type="button" class="choice" data-size="whatsapp-portrait">WhatsApp portrait · 1080 × 1350</button><button type="button" class="choice" data-size="whatsapp-landscape">WhatsApp landscape · 1600 × 900</button><button type="button" class="choice" data-size="instagram-square">Instagram square · 1080 × 1080</button><button type="button" class="choice" data-size="instagram-portrait">Instagram portrait · 1080 × 1350</button><button type="button" class="choice" data-size="instagram-story">Instagram Story · 1080 × 1920</button><button type="button" class="choice" data-size="facebook">Facebook post · 1200 × 630</button><button type="button" class="choice" data-size="linkedin">LinkedIn post · 1200 × 627</button><button type="button" class="choice" data-size="x">X post · 1600 × 900</button><button type="button" class="choice" data-size="pinterest">Pinterest pin · 1000 × 1500</button><button type="button" class="choice" data-size="email">Email card · 1200 × 800</button><button type="button" class="choice" data-size="landscape">Digital landscape · 1600 × 900</button></div></div>
      <div id="singlePrintSizeOptions" class="format-options" hidden><h3>One-page print sizes</h3><div class="choice-grid size-choice-grid"><button type="button" class="choice" data-single-print-size="A4">A4</button><button type="button" class="choice" data-single-print-size="A5">A5</button><button type="button" class="choice" data-single-print-size="A6">A6</button><button type="button" class="choice" data-single-print-size="5x7">5 × 7 inch</button><button type="button" class="choice" data-single-print-size="4x6">4 × 6 inch postcard</button><button type="button" class="choice" data-single-print-size="square">6 × 6 inch square</button><button type="button" class="choice" data-single-print-size="Letter">US Letter</button></div></div>
      <div id="foldedSizeOptions" class="format-options" hidden><h3>Folded card sizes</h3><div class="choice-grid size-choice-grid"><button type="button" class="choice" data-paper="A4">A4 folded to A5</button><button type="button" class="choice" data-paper="A5">A5 folded to A6</button><button type="button" class="choice" data-paper="Letter">US Letter folded card</button></div><h3>Printing method</h3><div class="choice-grid"><button type="button" class="choice" data-print-quality="home">Home printer</button><button type="button" class="choice" data-print-quality="shop">Print shop</button></div><label class="toggle-row"><input id="showFoldMarks" type="checkbox">Show small fold guides for home printing</label></div>
    </div>
    <div class="step-footer"><button class="button" type="button" data-prev-step>Back to message</button><button class="button button-primary" type="button" data-next-step>Continue to design</button></div>
  </div>
  <div data-step-panel="3" hidden><div data-editor-slot="3"></div>
    <div class="control-section design-studio"><div class="editor-heading"><div><p class="eyebrow">Quick design, one tap</p><h2>Pick a complete look</h2></div><button id="surpriseDesign" type="button" class="button button-secondary">Surprise me</button></div><div class="preset-grid">${presetButtons}</div>
      <div class="design-options-visible" aria-label="Design customisation controls">
        <h3>Background</h3><div class="colour-row background-swatches" aria-label="Background colour choices"><button type="button" class="colour-swatch" data-background="#43596b" style="--swatch:#43596b" aria-label="Slate blue"></button><button type="button" class="colour-swatch" data-background="#49364f" style="--swatch:#49364f" aria-label="Deep plum"></button><button type="button" class="colour-swatch" data-background="#f7f0e7" style="--swatch:#f7f0e7" aria-label="Classic cream"></button><button type="button" class="colour-swatch" data-background="#739082" style="--swatch:#739082" aria-label="Sage green"></button><button type="button" class="colour-swatch" data-background="#60758d" style="--swatch:#60758d" aria-label="Dusty blue"></button><button type="button" class="colour-swatch" data-background="#efd3cf" style="--swatch:#efd3cf" aria-label="Soft blush"></button><button type="button" class="colour-swatch" data-background="#201d2a" style="--swatch:#201d2a" aria-label="Midnight"></button><button type="button" class="colour-swatch" data-background="#d7a457" style="--swatch:#d7a457" aria-label="Golden hour"></button><label class="custom-colour-label" for="backgroundPicker">Any colour <input class="colour-input" id="backgroundPicker" type="color"></label></div>
        <div class="field compact-colour-field"><label for="textColourPicker">Text colour</label><input class="colour-input" id="textColourPicker" type="color"></div>
        <h3>Illustration, optional</h3><div class="choice-grid"><button type="button" class="choice" data-illustration="none">None</button><button type="button" class="choice" data-illustration="heart">Heart</button><button type="button" class="choice" data-illustration="sunrise">Sunrise</button><button type="button" class="choice" data-illustration="hills">Hills</button><button type="button" class="choice" data-illustration="waves">Waves</button><button type="button" class="choice" data-illustration="botanical">Botanical</button><button type="button" class="choice" data-illustration="confetti">Confetti</button><button type="button" class="choice" data-illustration="dove">Dove</button><button type="button" class="choice" data-illustration="rainbow">Rainbow</button><button type="button" class="choice" data-illustration="paw">Paw prints</button></div>
        <h3>Frame, optional</h3><div class="choice-grid"><button type="button" class="choice" data-frame="none">None</button><button type="button" class="choice" data-frame="classic">Classic</button><button type="button" class="choice" data-frame="gold-deco">Gold deco</button><button type="button" class="choice" data-frame="arch">Soft arch</button><button type="button" class="choice" data-frame="botanical">Botanical</button><button type="button" class="choice" data-frame="ribbon">Ribbon</button><button type="button" class="choice" data-frame="inset">Minimal inset</button><button type="button" class="choice" data-frame="deco-corners">Deco corners</button><button type="button" class="choice" data-frame="wreath">Wreath</button><button type="button" class="choice" data-frame="lily">Lily corner</button><button type="button" class="choice" data-frame="paw">Paw-print corners</button><button type="button" class="choice" data-frame="rainbow">Rainbow arch</button></div>
        <h3>Little accent, optional</h3><div class="choice-grid"><button type="button" class="choice" data-accent="none">None</button><button type="button" class="choice" data-accent="heart">♥ Heart</button><button type="button" class="choice" data-accent="star">Star</button><button type="button" class="choice" data-accent="sparkles">Sparkles</button><button type="button" class="choice" data-accent="flower">Flower</button><button type="button" class="choice" data-accent="leaf">Leaf</button><button type="button" class="choice" data-accent="sun">Sun</button><button type="button" class="choice" data-accent="dove">Dove</button><button type="button" class="choice" data-accent="candle">Candle</button><button type="button" class="choice" data-accent="feather">Feather</button><button type="button" class="choice" data-accent="paw">Paw print</button></div>
        <h3>Text style, optional</h3><div class="choice-grid"><button type="button" class="choice" data-text-style="clean">Clean</button><button type="button" class="choice" data-text-style="underline">Underline</button><button type="button" class="choice" data-text-style="statement">Statement</button><button type="button" class="choice" data-text-style="quotes">Quote marks</button></div>
        <h3>Font style</h3><div class="choice-grid"><button type="button" class="choice" data-font="serif">Elegant serif</button><button type="button" class="choice" data-font="sans">Clean modern</button><button type="button" class="choice" data-font="handwritten">Soft handwritten</button></div>
        <h3>Add and position a photo</h3><div class="photo-upload-card"><div class="photo-upload-copy"><strong>Your photo appears immediately at the top of the card</strong><span>Choose a picture, then drag it directly in the live preview with your mouse or finger.</span></div><label class="button button-secondary photo-upload-button" for="photoInput">Choose photo</label><input id="photoInput" class="visually-hidden-file" type="file" accept="image/*"><button id="removePhoto" type="button" class="button button-small" hidden>Remove photo</button></div><p id="photoPositionHelp" class="photo-position-help" hidden>Drag the photo inside the top image area to position it. Pinch is not required: use the zoom control below.</p><div id="photoPositionControls" class="photo-position-controls" hidden><label class="photo-zoom-control" for="photoZoom"><span>Photo zoom</span><input id="photoZoom" type="range" min="1" max="2.5" step="0.01" value="1.08"></label><div class="photo-position-actions" aria-label="Photo position controls"><button id="centrePhoto" type="button" class="button button-small">Centre photo</button><button type="button" class="button button-small" data-photo-nudge="up" aria-label="Move photo up">↑</button><button type="button" class="button button-small" data-photo-nudge="left" aria-label="Move photo left">←</button><button type="button" class="button button-small" data-photo-nudge="right" aria-label="Move photo right">→</button><button type="button" class="button button-small" data-photo-nudge="down" aria-label="Move photo down">↓</button></div></div>
        <h3>Inside paper</h3><div class="choice-grid"><button type="button" class="choice" data-inside-paper="white">Plain white</button><button type="button" class="choice" data-inside-paper="ivory">Warm ivory</button></div><p class="help">The front and back keep the selected colour. Inside panels stay white or ivory by default for readability and easier home printing.</p>
        <h3>Inside-left panel</h3><div class="choice-grid"><button type="button" class="choice" data-inside-left="blank">Leave blank</button><button type="button" class="choice" data-inside-left="photo">Use photo</button><button type="button" class="choice" data-inside-left="quote">Add note</button><button type="button" class="choice" data-inside-left="illustration">Original botanical motif</button></div><div class="field"><label for="insideLeftText">Inside-left note</label><textarea id="insideLeftText"></textarea></div><label class="toggle-row"><input id="showWebsite" type="checkbox">Show the website address on the back</label>
      </div>
    </div>
    <div class="step-footer"><button class="button" type="button" data-prev-step>Back to size</button><button class="button button-primary" type="button" data-next-step>Continue to review</button></div>
  </div>
  <div data-step-panel="4" hidden>
    <div class="control-section review-step-card"><p class="eyebrow">Final review</p><h2>Check your card</h2><div id="noSizeReviewState" class="no-size-review" hidden><strong>No size selected</strong><p>Please go back and select a size before reviewing your card.</p><button id="chooseSizeFromReview" type="button" class="button button-primary">Choose a size</button></div><div id="reviewReadyState"><div class="selected-format-card review-selected-format"><span>Selected size and format</span><strong id="reviewStepSummary"></strong></div><p>Check the exact dimensions and finished design. You can go back to change the words, size or design before confirming.</p><div class="review-change-actions"><button type="button" class="button" data-jump-step="1">Edit words</button><button type="button" class="button" data-jump-step="2">Change size</button><button type="button" class="button" data-jump-step="3">Change design</button></div><button id="reviewCard" class="button button-primary button-large primary-download" type="button">Review selected format</button></div></div>
    <div class="step-footer"><button class="button" type="button" data-prev-step>Back to design</button><button id="reviewContinueHint" class="button button-primary" type="button">Review before download</button></div>
  </div>
  <div data-step-panel="5" hidden>
    <div class="control-section download-intro"><p class="eyebrow">Download and share</p><h2>Your reviewed card is ready</h2><p>Choose the correct download or sharing action for the format you approved.</p></div>
    <div id="downloadWorkspace" class="download-workspace" hidden><div class="download-card"><span>Reviewed format</span><strong id="downloadSummary"></strong><small>Change any size above and review again before exporting.</small></div>
      <div id="digitalActions" class="control-section download-actions export-panel export-panel-digital"><div class="export-panel-heading"><span class="export-format-icon" aria-hidden="true">▣</span><div><p class="eyebrow">Your card is ready</p><h2>Digital card</h2><p>One finished image, ready to share or save.</p></div></div><section class="export-primary-action" aria-labelledby="digitalShareHeading"><h3 id="digitalShareHeading">Share your card</h3><button id="shareImage" type="button" class="button button-large export-share-button">Share card</button><p>Opens WhatsApp, Messages, email and other supported apps on your device.</p></section><section class="export-section" aria-labelledby="digitalDownloadHeading"><h3 id="digitalDownloadHeading">Downloads</h3><div class="export-download-grid"><button id="downloadPng" type="button" class="button export-file-button"><strong>PNG</strong><span>Best quality</span></button><button id="downloadJpg" type="button" class="button export-file-button"><strong>JPEG</strong><span>Smaller file</span></button></div></section><details class="export-more-options"><summary>More options</summary><div class="export-more-grid"><button id="copyImage" class="button" type="button">Copy image</button><button id="copyMessage" class="button" type="button">Copy card wording</button><button class="button" type="button" data-copy-share-message>Copy share message</button></div></details><div class="share-message-preview"><strong>Shared with:</strong><span>I made this card on CardMakerMessages.com. Create yours too:<br>https://cardmakermessages.com</span></div><p class="export-privacy-note">Your image stays on this device. Nothing is uploaded to our server.</p></div>
      <div id="singlePrintActions" class="control-section download-actions export-panel export-panel-print" hidden><div class="export-panel-heading"><span class="export-format-icon" aria-hidden="true">▤</span><div><p class="eyebrow">Your card is ready</p><h2>Printable one-page card</h2><p>Save the approved design as a PDF or image.</p></div></div><section class="export-primary-action" aria-labelledby="singlePrintHeading"><h3 id="singlePrintHeading">Print or share</h3><button id="downloadSinglePdf" type="button" class="button button-large export-pdf-button">Download printable PDF</button><div class="export-secondary-grid"><button id="shareSingleImage" class="button export-share-button" type="button">Share card image</button><button id="shareSinglePdf" class="button" type="button">Share PDF</button></div></section><section class="export-section" aria-labelledby="singleImageHeading"><h3 id="singleImageHeading">Also save as images</h3><div class="export-download-grid"><button id="downloadSinglePng" type="button" class="button export-file-button"><strong>PNG</strong><span>Best quality</span></button><button id="downloadSingleJpeg" type="button" class="button export-file-button"><strong>JPEG</strong><span>Smaller file</span></button></div></section><button class="button export-copy-message" type="button" data-copy-share-message>Copy share message and link</button><div class="share-message-preview"><strong>Shared with:</strong><span>I made this card on CardMakerMessages.com. Create yours too:<br>https://cardmakermessages.com</span></div><p class="export-privacy-note">Your files stay on this device. Nothing is uploaded to our server.</p></div>
      <div id="foldedActions" class="control-section download-actions export-panel export-panel-folded" hidden><div class="export-panel-heading"><span class="export-format-icon" aria-hidden="true">▰</span><div><p class="eyebrow">Your folded card is ready</p><h2>Folded card</h2><p>Outside sheet and inside sheet, arranged exactly as reviewed.</p></div></div><section class="export-primary-action" aria-labelledby="foldedPrimaryHeading"><h3 id="foldedPrimaryHeading">Print or share</h3><button id="downloadPdf" type="button" class="button button-large export-pdf-button">Download folded card PDF</button><button id="shareFoldedSheets" type="button" class="button button-large export-share-button">Share both sheets</button><p>Shares the outside and inside sheets as two PNG images.</p><button id="shareFoldedPdf" class="button export-inline-button" type="button">Share folded PDF</button></section><section class="export-section folded-image-downloads" aria-labelledby="foldedImageHeading"><h3 id="foldedImageHeading">Also save as images</h3><details class="sheet-download-group"><summary><span>Save as PNG</span><small>Best quality</small></summary><div class="sheet-download-buttons"><button id="downloadFoldedOutsidePng" class="button" type="button">Outside sheet PNG</button><button id="downloadFoldedInsidePng" class="button" type="button">Inside sheet PNG</button></div></details><details class="sheet-download-group"><summary><span>Save as JPEG</span><small>Smaller files</small></summary><div class="sheet-download-buttons"><button id="downloadFoldedOutsideJpeg" class="button" type="button">Outside sheet JPEG</button><button id="downloadFoldedInsideJpeg" class="button" type="button">Inside sheet JPEG</button></div></details></section><button class="button export-copy-message" type="button" data-copy-share-message>Copy share message and link</button><div class="share-message-preview"><strong>Shared with:</strong><span>I made this card on CardMakerMessages.com. Create yours too:<br>https://cardmakermessages.com</span></div><p class="export-privacy-note">Your files stay on this device. Nothing is uploaded to our server.</p></div>
    </div>
    <div class="step-footer"><button class="button" type="button" data-jump-step="4">Back to review</button><button id="startAgainBottom" class="button button-quiet" type="button">Start another card</button></div>
  </div>
  ${editor}</section></div></div></section>
  <section class="section app-related-links"><div class="container related-panel"><div><p class="eyebrow">Need inspiration first?</p><h2>Messages, occasions and print help</h2></div><div class="related-links"><a href="/occasions.html">Browse all card messages</a><a href="/custom-card-maker.html">Create a custom occasion</a><a href="/invitation-maker.html">Make an invitation</a><a href="/printable-card-guide.html">Read the print guide</a><a href="/birthday-card-messages.html">Birthday messages</a><a href="/retirement-card-messages.html">Retirement messages</a></div></div></section>
  <div class="modal-backdrop" id="reviewModal" hidden><section class="review-modal" role="dialog" aria-modal="true" aria-labelledby="reviewTitle"><button class="modal-close" id="closeReview" type="button" aria-label="Close card review">×</button><p class="eyebrow">Final review</p><h2 id="reviewTitle" tabindex="-1">Check your card</h2><p id="reviewFormatSummary" class="review-format-summary"></p><div id="reviewSingleWrap" class="review-single"><figure><canvas data-review-single></canvas><figcaption id="reviewFigureCaption">Finished card at the selected dimensions</figcaption></figure></div><div id="reviewFoldedWrap" class="review-folded-sheets" hidden><figure><h3>Outside sheet</h3><canvas data-review-sheet="outside" aria-label="Outside sheet with back cover on the left and front cover on the right"></canvas><figcaption><strong>Back cover | Front cover</strong><span>Prints as the outside of the card. Fold on the dashed centre line.</span></figcaption></figure><figure><h3>Inside sheet</h3><canvas data-review-sheet="inside" aria-label="Inside sheet with inside-left panel on the left and inside-right message on the right"></canvas><figcaption><strong>Inside left | Inside right</strong><span>Prints as the inside of the card. Fold on the dashed centre line.</span></figcaption></figure><p class="folded-print-help">Print at Actual Size or 100%. For automatic double-sided printing, choose landscape orientation and flip on the short edge. Test on plain paper first because printer settings vary.</p></div><div class="review-modal-actions"><button class="button" id="reviewEditWords" type="button">Edit words</button><button class="button" id="editFromReview" type="button">Change size</button><button class="button" id="reviewChangeDesign" type="button">Change design</button><button class="button button-primary" id="continueFromReview" type="button">Continue to download &amp; share</button></div><p class="review-next-note">Choose PNG, JPEG, PDF or share your card on the next screen.</p></section></div>`;
}

function seoPageBody(page) {
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Messages', url: '/occasions.html' }, { name: page.keyword, url: `/${page.slug}.html` }];
  const index = pagesData.findIndex(item => item.slug === page.slug);
  const siblings = [1,2,3,-1,-2].map(offset => pagesData[(index + offset + pagesData.length) % pagesData.length]).filter(item => item && item.slug !== page.slug);
  const siblingLinks = siblings.map(item => `<a href="/${item.slug}.html">${escapeHtml(item.keyword)}</a>`).join('');
  const messages = page.messages.map(message => `<article class="message-card" data-message-card><p data-message-text>${escapeHtml(message)}</p><div class="button-row"><button type="button" class="button button-small" data-copy-message>Copy message</button><a class="button button-small button-secondary" href="/app.html?occasion=${encodeURIComponent(page.occasion)}&message=${encodeURIComponent(message)}">Customise card</a></div></article>`).join('');
  const faq = page.faqs.map(([q,a]) => `<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join('');
  const steps = page.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('');
  return { crumbs, body: `
<section class="page-hero"><div class="container">${breadcrumb(crumbs)}<p class="eyebrow">Original wording you can personalise</p><h1>${escapeHtml(page.title)}</h1><div class="answer-block"><p>${escapeHtml(page.answer)}</p></div><div class="button-row"><a class="button button-primary button-large" href="/app.html?occasion=${encodeURIComponent(page.occasion)}">Create this card</a><a class="button button-large" href="#messages">See message examples</a></div></div></section>
<section class="section"><div class="container content-layout"><article class="prose">
<h2>${escapeHtml(page.question)}</h2><p>${escapeHtml(page.sectionAnswer)}</p>
<ol>${steps}</ol>
<h2 id="messages">Which ${escapeHtml(page.keyword.toLowerCase())} can I use?</h2><p>These examples are original wording created for this site. Copy one as it is, personalise it or open it directly in the card maker.</p>
<div class="message-list">${messages}</div>
<h2>How do I turn the message into a card?</h2><p>Open the card maker with your chosen occasion, add a recipient name and sender, then tap a complete design. Digital cards can be exported as high-resolution images. Printable cards produce a two-page PDF with the outside panels arranged correctly for folding.</p>
<ol><li>Use one of the messages above or write your own.</li><li>Choose a one-tap design and optional photo.</li><li>Preview the front, inside and back panels.</li><li>Open the image or folded PDF before saving it.</li></ol>
<section class="faq"><h2>What else should I know?</h2>${faq}</section>
</article><aside class="card side-card"><h3>Create the finished card</h3><p>Your message is only the first step. Add a name, photo and complete design without learning a complicated editor.</p><a class="button button-primary" href="/app.html?occasion=${encodeURIComponent(page.occasion)}">Open card maker</a><h3 style="margin-top:24px">Related messages</h3>${siblingLinks}</aside></div></section>` };
}

function staticBody(kind) {
  const content = {
    about: {
      title: `About ${config.brand}`,
      answer: `${config.brand} is a free message-first card maker. It helps people find suitable original wording, personalise it and turn it into a digital or folded printable card. The editor avoids layers and free-positioning tools, so a complete design can be chosen with one tap and adjusted only where useful.`,
      body: `<h2>Why does this card maker exist?</h2><p>Many people know the occasion but struggle to find the right words. Others can write the message but do not want to learn a full design application for one card. This site brings those tasks together in a focused tool that runs mostly inside the browser.</p><h2>What is free?</h2><p>The message choices, design presets, photo option, image exports and folded card PDF are included free. After three exports, a free email sign-up unlocks unlimited use on that device. No payment card is requested.</p><h2>Who publishes the messages?</h2><p>The site is published by ${escapeHtml(config.brand)} as an organisation. Messages are written as original examples and checked for clarity, tone, suitability and attribution risk. Read the <a href="/methodology.html">message methodology</a> for more detail.</p>`
    },
    methodology: {
      title: 'How We Write and Check Card Messages',
      answer: `Our card messages are written as original wording rather than copied quotations, lyrics, poems or branded phrases. Each message is checked for the intended occasion, relationship and tone, then reviewed for clarity, unnecessary assumptions, insensitive promises and wording that could embarrass or pressure the recipient.`,
      body: `<h2>How are the messages created?</h2><p>Each message begins with the communication goal: celebrate, thank, comfort, welcome or encourage. We then adapt the language for relationship and tone. A professional message is restrained, a close-family message can be warmer and a religious message is offered only as a clear choice.</p><h2>How do we avoid misattribution?</h2><p>We do not label original wording as a quotation from a famous person. The site does not rely on unattributed quote lists. Well-known lyrics, poems and prayers are not reproduced merely because they are popular. This keeps the messages safer to print and share.</p><h2>How are the visual designs kept copyright-safe?</h2><p>Every decorative motif is created specifically for this site using original geometric, botanical and typographic compositions. The maker does not use third-party templates, branded characters, entertainment artwork, logos or copied illustrations.</p><h2>What quality checks are used?</h2><table><thead><tr><th>Check</th><th>What we look for</th></tr></thead><tbody><tr><td>Suitability</td><td>Does the wording fit the occasion and relationship?</td></tr><tr><td>Specificity</td><td>Can the user personalise it without rewriting everything?</td></tr><tr><td>Sensitivity</td><td>Does it avoid pressure, promises or harmful assumptions?</td></tr><tr><td>Clarity</td><td>Does it sound natural when read aloud?</td></tr><tr><td>Originality</td><td>Is it written for this site rather than copied from a creative work?</td></tr></tbody></table>`
    },
    privacy: {
      title: 'Privacy Policy',
      answer: `The card maker processes message text, settings and uploaded photos inside your browser. Your current card may be stored in local browser storage so you can resume it, but the site does not upload the photo or card content to a server. The site does not sell card content or uploaded photos to advertising networks. Email addresses entered through the sign-up form are stored for access and communication.`,
      body: `<h2>What information stays on the device?</h2><p>Card wording, names, design settings, favourites and uploaded photo data may be stored in your browser’s local storage. This allows the tool to restore an unfinished card. Use the Start again option or clear site data in your browser to remove it.</p><h2>Are photos uploaded?</h2><p>No. The card image is rendered using browser canvas on the device. Exports are created locally. Do not use a shared computer for private images unless you clear the card afterwards.</p><h2>What happens when I sign up?</h2><p>The email address is stored securely outside the public website files. A time-limited verification link must be opened before unlimited access is enabled, which helps block automated and mistyped sign-ups. You can unsubscribe using the link in an email or contact the site owner. A secure browser cookie and local device setting remember verified access.</p><h2>How can I ask a privacy question?</h2><p>Email <a href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a>.</p>`
    },
    terms: {
      title: 'Terms of Use',
      answer: `You may use the card maker to create personal digital and printable cards. The original message examples and site designs remain protected content, but the finished cards you create may be shared with their intended recipients. You are responsible for names, photos and wording that you add to the tool.`,
      body: `<h2>What may I create?</h2><p>You may create and share cards for personal, family, community and ordinary workplace use. Do not use the service to harass, impersonate, deceive or violate another person’s privacy or intellectual-property rights.</p><h2>What about uploaded photos?</h2><p>Only use images you own or have permission to use. Photos are processed locally, but you remain responsible for the content you place in the final card.</p><h2>Are print results guaranteed?</h2><p>No. Printers, paper, ink and duplex settings vary. Use plain paper for a test and follow the print guide. The print-shop option prepares a clean high-resolution PDF, but a professional printer may request additional specifications.</p><h2>Is the service always available?</h2><p>Availability, browser support and features may change. Keep a copy of any finished card you need.</p>`
    },
    contact: {
      title: 'Contact the Card Maker Team',
      answer: `Contact ${config.brand} for help with the card maker, printing guidance, accessibility issues or corrections to message wording. Include the page you were using, the device and browser and a clear description of what happened. Do not send private photos or sensitive recipient information unless it is essential to the request.`,
      body: `<h2>How can I get help?</h2><p>Email <a href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a>. For a technical problem, include the exact button you pressed and what appeared afterwards. A screenshot can help, but remove private names and images first.</p><h2>What feedback is useful?</h2><p>Suggestions for missing occasions, unclear wording, printing problems and accessibility improvements are welcome. Message corrections should identify the page and the exact sentence.</p>`
    }
  };
  return content[kind];
}

function howItWorksBody() {
  const steps = [
    'Choose an occasion, recipient and tone.',
    'Select one of the suggested original messages or write your own.',
    'Tap a complete design and optionally add a photo.',
    'Preview the front, inside-left, inside-right and back panels.',
    'Open a high-resolution image or two-page folded card PDF.'
  ];
  return { steps, body: `<section class="page-hero"><div class="narrow">${breadcrumb([{name:'Home',url:'/'},{name:'How it works',url:'/how-it-works.html'}])}<p class="eyebrow">A focused card workflow</p><h1>How Does the Free Card Maker Work?</h1><div class="answer-block"><p>The card maker uses three stages: message, design and download. You choose the occasion and recipient, select or write the wording, then tap a complete visual preset. The finished card can be opened as a high-resolution image or arranged as a two-page folded PDF for home printing.</p></div><a class="button button-primary button-large" href="/app.html">Create a card</a></div></section><section class="section"><div class="narrow prose"><h2>What are the five steps?</h2><ol>${steps.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ol><h2>Why is the editor simpler than a design canvas?</h2><p>The tool does not ask you to position every object or manage layers. Each preset sets the typography, colours, decoration and spacing together. The system also fits text, protects margins and maintains readable contrast automatically.</p><h2>Where is my card information stored?</h2><p>Your unfinished card is stored in local browser storage so the tool can resume where you stopped. Uploaded photos are converted to local browser data and are not sent to a server. Use Start again to clear the current card.</p><h2>What can I download?</h2><table><thead><tr><th>Output</th><th>Best use</th></tr></thead><tbody><tr><td>PNG</td><td>WhatsApp, email and high-quality digital sharing</td></tr><tr><td>JPG</td><td>Smaller image file for general sharing</td></tr><tr><td>Folded PDF</td><td>Home printing or taking to a print shop</td></tr></tbody></table></div></section>` };
}

function printGuideBody() {
  const steps = [
    'Choose Print and then select A4 or US Letter.',
    'Select Home printer for safe margins and optional fold marks.',
    'Open the PDF and print a test copy on ordinary paper.',
    'Use landscape orientation, Actual Size or 100% and double-sided printing.',
    'Select flip on short edge, then fold the sheet down the centre.'
  ];
  return { steps, body: `<section class="page-hero"><div class="narrow">${breadcrumb([{name:'Home',url:'/'},{name:'Printable card guide',url:'/printable-card-guide.html'}])}<p class="eyebrow">Folded PDF instructions</p><h1>How Do I Print a Folded Card PDF?</h1><div class="answer-block"><p>Print the two-page card PDF in landscape orientation at Actual Size or 100%. Use double-sided printing and select flip on the short edge. Page one places the back cover on the left and front cover on the right. Page two places the inside-left panel on the left and the main message on the right.</p></div><a class="button button-primary button-large" href="/app.html">Create a printable card</a></div></section><section class="section"><div class="narrow prose"><h2>What print settings should I use?</h2><ol>${steps.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ol><h2>How are the four card panels arranged?</h2><table><thead><tr><th>PDF page</th><th>Left half</th><th>Right half</th></tr></thead><tbody><tr><td>Outside</td><td>Back cover</td><td>Front cover</td></tr><tr><td>Inside</td><td>Inside-left panel</td><td>Main inside message</td></tr></tbody></table><h2>What paper should I use?</h2><p>Start with plain paper to confirm orientation. For the final copy, use card that your printer can feed safely. Many home printers handle 160 to 220 gsm, but the supported weight is model-specific. Check the printer manual before using heavy stock.</p><h2>What should I choose for a print shop?</h2><p>Select Print shop in the card maker. This reduces the home-print margin and removes fold marks. Tell the printer the finished folded size and ask whether they need bleed, crop marks or a different PDF specification. The exported design is raster-based, so very large resizing is not recommended.</p><h2>Why did the back print upside down?</h2><p>The duplex flip setting is the usual cause. For a landscape sheet that folds vertically, select flip on the short edge. Printer drivers sometimes describe this differently, which is why a test on ordinary paper is essential.</p></div></section>` };
}

function resolveRelated(slug) {
  const item = [...toolPages, ...pagesData].find(entry => entry.slug === slug);
  if (!item) return null;
  return { slug: item.slug, label: item.keyword || item.title };
}

function toolLandingBody(page) {
  const query = page.appQuery ? `?${page.appQuery}` : '';
  const related = (page.related || []).map(resolveRelated).filter(Boolean);
  const breadcrumbs = [{ name: 'Home', url: '/' }, { name: page.keyword, url: `/${page.slug}.html` }];
  const features = page.features.map(([name, text]) => `<article class="mini-feature"><span aria-hidden="true">✓</span><div><h3>${escapeHtml(name)}</h3><p>${escapeHtml(text)}</p></div></article>`).join('');
  const links = related.map(item => `<a href="/${item.slug}.html">${escapeHtml(item.label)}</a>`).join('');
  return { breadcrumbs, body: `<section class="tool-hero"><div class="container tool-hero-grid"><div>${breadcrumb(breadcrumbs)}<p class="eyebrow eyebrow-gold">${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.title)}</h1><div class="answer-block answer-block-hero"><p>${escapeHtml(page.answer)}</p></div><div class="button-row"><a class="button button-primary button-large" href="/app.html${query}">Open ${escapeHtml(page.keyword.toLowerCase())}</a><a class="button button-light button-large" href="#how-it-works">See how it works</a></div><div class="trust-row"><span><b>✓</b> No watermark</span><span><b>✓</b> Private photos</span><span><b>✓</b> High-resolution</span></div></div><div class="tool-mockup"><div class="mock-browser"><div class="mock-toolbar"><i></i><i></i><i></i><span>cardmakermessages.com</span></div><div class="mock-content"><div class="mock-card"><small>${escapeHtml(page.keyword.toUpperCase())}</small><strong>${escapeHtml(page.title.replace(/ with .*| for .*| and .*/i,''))}</strong><em>Beautifully made, simply personalised</em></div><div class="mock-controls"><span></span><span></span><span></span><a class="mock-design-link" href="/app.html${query}">Choose design</a></div></div></div></div></div></section><section class="section premium-section" id="how-it-works"><div class="container"><div class="section-heading split-heading"><div><p class="eyebrow">Focused and useful</p><h2>${escapeHtml(page.question)}</h2></div><p>${escapeHtml(page.sectionAnswer)}</p></div><div class="mini-feature-grid">${features}</div></div></section><section class="section section-soft premium-section"><div class="container"><div class="section-heading"><p class="eyebrow">Four simple steps</p><h2>How do I create it?</h2></div><ol class="premium-steps">${page.steps.map((step,index)=>`<li><span>${index+1}</span><p>${escapeHtml(step)}</p></li>`).join('')}</ol><div class="centred-action"><a class="button button-primary button-large" href="/app.html${query}">Start creating</a></div></div></section><section class="section"><div class="container"><div class="related-panel"><div><p class="eyebrow">Continue exploring</p><h2>Related card, message and invitation pages</h2></div><div class="related-links">${links}<a href="/occasions.html">Browse message guides</a><a href="/printable-card-guide.html">Print a folded card</a></div></div></div></section>` };
}

function occasionsBody() {
  return `<section class="page-hero"><div class="container">${breadcrumb([{name:'Home',url:'/'},{name:'All occasions',url:'/occasions.html'}])}<p class="eyebrow">Message library</p><h1>Card Messages for Every Occasion</h1><div class="answer-block"><p>Choose an occasion to find original messages organised by tone and relationship. Each page explains what to write, provides ready-to-use examples and links directly to a card maker that can turn the chosen wording into a digital image or folded printable PDF.</p></div><a class="button button-primary button-large" href="/app.html">Open the card maker</a></div></section><section class="section section-soft"><div class="container"><div class="grid grid-4">${pagesData.map(occasionCard).join('')}</div></div></section>`;
}

// Homepage
writePage('index.html', {
  pathname: '/', title: 'Card Maker Messages: Cards, Invitations and Messages',
  description: 'Card maker for personalised cards and invitations with original messages, premium designs, digital downloads and folded PDFs.',
  body: homeBody(), breadcrumbs: [{ name: 'Home', url: '/' }], type: 'WebApplication', faq: defaultFaq('Card Maker Messages', '/')
});

// App
const appSteps = ['Choose an occasion, recipient and tone.', 'Select or write the message.', 'Tap a complete design.', 'Preview every card panel.', 'Open an image or folded PDF.'];
writePage('app.html', {
  pathname: '/app.html', title: 'Card Maker and Invitation Maker',
  description: 'Card maker and invitation maker with original wording, premium one-tap designs, private photos and printable folded PDFs.',
  body: appBody(), breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Card maker', url: '/app.html' }], type: 'WebApplication', howTo: appSteps, faq: defaultFaq('Card Maker and Invitation Maker', '/app.html'),
  isolatedAssets: true,
  extraScripts: `<script src="/assets/messages-v${assetSlug}.js" defer></script><script src="/assets/pdf-v${assetSlug}.js" defer></script><script src="/assets/app-v${assetSlug}.js" defer></script>`
});

// SEO occasion pages
for (const page of pagesData) {
  const generated = seoPageBody(page);
  writePage(`${page.slug}.html`, {
    pathname: `/${page.slug}.html`, title: page.title, description: page.description, body: generated.body,
    breadcrumbs: generated.crumbs, type: 'Article', faq: page.faqs
  });
}

// Keyword-focused tool pages, each serving a distinct search intent
for (const page of toolPages) {
  const generated = toolLandingBody(page);
  writePage(`${page.slug}.html`, {
    pathname: `/${page.slug}.html`, title: page.title, description: page.description, body: generated.body,
    breadcrumbs: generated.breadcrumbs, type: 'HowTo', howTo: page.steps, faq: toolFaq(page)
  });
}

// Hubs and guides
writePage('occasions.html', {
  pathname: '/occasions.html', title: 'Card Messages for Every Occasion',
  description: 'Card messages for birthdays, weddings, Christmas, thanks, retirement and more, with original wording and free card designs.',
  body: occasionsBody(), breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'All occasions', url: '/occasions.html' }], faq: [['How do I find a message for a specific relationship?', 'Open an occasion page, then compare its heartfelt, short, formal and relationship-aware examples. Each message can be copied or opened directly in the matching card maker for further editing.'],['Can I create a card for an occasion that is not listed?', 'Yes. The custom card maker accepts your own event name, front heading, cover line and message, so the occasion library does not limit what you can create.'],['How are occasion pages connected to the maker?', 'Every occasion guide includes in-page Customise card links. The selected occasion and message are carried into the maker, where you can edit the wording and choose social, flat print or folded output.']]
});
const how = howItWorksBody();
writePage('how-it-works.html', {
  pathname: '/how-it-works.html', title: 'How the Free Card Maker Works',
  description: 'How the free card maker turns a personalised message into a digital image or printable folded card in five simple steps.',
  body: how.body, breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'How it works', url: '/how-it-works.html' }], type: 'HowTo', howTo: how.steps, faq: [['Can I edit the message after moving to Design?', 'Yes. The same wording panel moves with you through Message, Design and Review and Download. A change updates the live card without resetting the selected design.'],['Why does the maker use one-tap designs?', 'Complete presets reduce mistakes with alignment, spacing, contrast and typography. You keep creative control over wording, colours and photos without managing individual layers.'],['What happens before a file opens?', 'The final stage asks you to review the front, both inside panels and the back. After that review, the social image, one-page print and folded-card options become available.']]
});
const print = printGuideBody();
writePage('printable-card-guide.html', {
  pathname: '/printable-card-guide.html', title: 'How to Print a Folded Card PDF',
  description: 'How to print a folded card PDF using A4 or US Letter paper, double-sided settings, short-edge flipping and a test sheet.',
  body: print.body, breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Printable card guide', url: '/printable-card-guide.html' }], type: 'HowTo', howTo: print.steps, faq: [['Should I choose A4, A5 or US Letter for a folded card?', 'Choose the paper already supported by your printer. A4 folds to A5, A5 folds to A6 and US Letter folds to a half-letter card. Print a test before using card stock.'],['What is the difference between one-page and folded PDFs?', 'A one-page PDF prints only the front design as a flat page. A folded PDF contains an outside sheet and an inside sheet, arranged for double-sided printing and folding.'],['Why are the inside panels white or ivory?', 'A light interior is easier to read, uses less ink and matches common greeting-card practice. The front and back retain the selected exterior design.']]
});

for (const kind of ['about','methodology','privacy','terms','contact']) {
  const item = staticBody(kind);
  const filename = `${kind}.html`;
  const descriptions = {
    about: `About ${config.brand}, a free message-first card maker with one-tap designs and printable folded PDFs.`,
    methodology: 'How original card messages are written and checked for tone, clarity, sensitivity, suitability and attribution risk.',
    privacy: 'Privacy policy for browser-based card creation, local storage, photo processing, card exports and email sign-up.',
    terms: 'Terms for creating personal digital and printable cards, using photos and wording responsibly and testing print settings.',
    contact: `Contact ${config.brand} for card maker help, print questions, message corrections and accessibility feedback.`
  };
  const crumbs = [{ name: 'Home', url: '/' }, { name: item.title, url: `/${filename}` }];
  writePage(filename, {
    pathname: `/${filename}`, title: item.title, description: descriptions[kind],
    body: `<section class="page-hero"><div class="narrow">${breadcrumb(crumbs)}<h1>${escapeHtml(item.title)}</h1><div class="answer-block"><p>${escapeHtml(item.answer)}</p></div></div></section><section class="section"><article class="narrow prose">${item.body}</article></section>`,
    breadcrumbs: crumbs, faq: staticFaq(kind)
  });
}

// Real 404
writePage('404.html', {
  pathname: '/404.html', title: 'Page Not Found', description: 'The requested card message page could not be found.', noindex: true,
  body: `<section class="section"><div class="narrow"><p class="eyebrow">404</p><h1>That card page is not here</h1><div class="answer-block"><p>The link may be outdated or the address may have been typed incorrectly. Browse all card occasions, return to the homepage or open the card maker to continue creating your message and design.</p></div><div class="button-row"><a class="button button-primary" href="/app.html">Create a card</a><a class="button" href="/occasions.html">Browse occasions</a></div></div></section>`,
  breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Page not found', url: '/404.html' }]
});

// Indexing and platform files
const indexable = pageList.filter(page => !page.noindex);
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${indexable.map(page => {
  const image = page.pathname === '/' || page.pathname === '/app.html' ? `\n    <image:image><image:loc>${absolute('/assets/og-image.png')}</image:loc><image:title>${escapeHtml(config.brand)} card maker</image:title></image:image>` : '';
  return `  <url><loc>${absolute(page.pathname)}</loc><lastmod>${today}</lastmod>${image}\n  </url>`;
}).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

const robots = `User-agent: *\nAllow: /\nDisallow: /api/\n\nUser-agent: Googlebot\nAllow: /\nUser-agent: Bingbot\nAllow: /\nUser-agent: Slurp\nAllow: /\nUser-agent: DuckDuckBot\nAllow: /\nUser-agent: YandexBot\nAllow: /\nUser-agent: Baiduspider\nAllow: /\nUser-agent: Yeti\nAllow: /\nUser-agent: SeznamBot\nAllow: /\nUser-agent: Applebot\nAllow: /\nUser-agent: facebookexternalhit\nAllow: /\nUser-agent: Twitterbot\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\nUser-agent: ChatGPT-User\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Claude-SearchBot\nAllow: /\n\n# Training bots are allowed in this launch configuration.\nUser-agent: GPTBot\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\nUser-agent: CCBot\nAllow: /\nUser-agent: Applebot-Extended\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml')}\n`;
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);
fs.writeFileSync(path.join(ROOT, `${config.indexNowKey}.txt`), config.indexNowKey);

const manifest = {
  name: config.brand, short_name: config.shortBrand, description: config.tagline, start_url: '/app.html', scope: '/', display: 'standalone',
  background_color: '#f8f4ec', theme_color: '#7c3f55',
  icons: [
    { src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' }
  ]
};
fs.writeFileSync(path.join(ROOT, 'site.webmanifest'), JSON.stringify(manifest, null, 2));

// This release deliberately removes the old cache-first PWA behaviour. The cleanup
// worker takes control immediately, deletes prior app caches and serves same-origin GET
// requests from the network so a new deployment appears without a hard refresh.
fs.writeFileSync(path.join(ROOT, 'service-worker.js'), `const VERSION='${version}';
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('card-maker-messages-v')).map(key=>caches.delete(key)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request,{cache:'no-store'}));});
`);

const llms = `# ${config.brand}\n\n> ${config.tagline}. A simple card and invitation maker with original messages, one-tap designs and print-ready formats.\n\n## Key pages\n- ${absolute('/app.html')}: Create a personalised digital or folded printable card.\n- ${absolute('/occasions.html')}: Browse all occasion message guides.\n- ${absolute('/printable-card-guide.html')}: Print and fold the generated PDF.\n- ${absolute('/methodology.html')}: How original messages are written and checked.\n`;
fs.writeFileSync(path.join(ROOT, 'llms.txt'), llms);

const htaccess = `Options -Indexes
ErrorDocument 404 /404.html
FileETag None

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  Header unset ETag
  <FilesMatch "\.(html|css|js|json|xml|webmanifest)$">
    Header always set Cache-Control "no-cache, no-store, must-revalidate, max-age=0"
    Header always set Pragma "no-cache"
    Header always set Expires "0"
  </FilesMatch>
  <Files "service-worker.js">
    Header always set Cache-Control "no-cache, no-store, must-revalidate, max-age=0"
    Header always set Service-Worker-Allowed "/"
  </Files>
  <FilesMatch "\.(png|jpg|jpeg|webp|svg|ico)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 0 seconds"
  ExpiresByType application/javascript "access plus 0 seconds"
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^(?:src|tools|docs)/ - [F,L]
</IfModule>

<FilesMatch "^(site\.config\.json|package(?:-lock)?\.json|README\.md|DEPLOY-CHECKLIST\.txt|build\.(?:bat|sh))$">
  Require all denied
</FilesMatch>

<FilesMatch "\.(sqlite|db|env|log)$">
  Require all denied
</FilesMatch>
`;
fs.writeFileSync(path.join(ROOT, '.htaccess'), htaccess);

const copyrightSafety = `# Copyright safety\n\nCard Maker Messages uses original site wording and original procedural visual compositions. The application does not bundle third-party greeting-card templates, stock illustrations, entertainment characters, logos, branded artwork, song lyrics, modern poems or copied quotations.\n\nUsers may upload their own photographs and remain responsible for having permission to use them. System fonts are used, so no font files or external font licences are distributed.\n\nThe visual engine draws geometric, botanical and typographic motifs directly in the browser. This document describes the launch package and does not grant rights over user-uploaded material.\n`;
fs.writeFileSync(path.join(ROOT, 'COPYRIGHT-SAFETY.md'), copyrightSafety);

console.log(`Built ${pageList.length} HTML pages, ${indexable.length} indexable URLs and shared assets.`);
