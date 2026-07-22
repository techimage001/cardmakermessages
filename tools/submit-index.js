#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const domain = config.domain.replace(/\/$/, '');
const host = new URL(domain).host;
const requested = process.argv.slice(2);
let urlList;

if (requested.length) {
  urlList = requested.map(item => new URL(item, `${domain}/`).toString());
} else {
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]).filter(url => !url.includes('/assets/'));
}

const payload = JSON.stringify({
  host,
  key: config.indexNowKey,
  keyLocation: `${domain}/${config.indexNowKey}.txt`,
  urlList
});

const request = https.request({
  hostname: 'api.indexnow.org',
  path: '/IndexNow',
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(payload) }
}, response => {
  let body = '';
  response.on('data', chunk => { body += chunk; });
  response.on('end', () => {
    console.log(`IndexNow response: ${response.statusCode}`);
    if (body) console.log(body);
    if (response.statusCode < 200 || response.statusCode >= 300) process.exitCode = 1;
  });
});
request.on('error', error => { console.error(error.message); process.exitCode = 1; });
request.write(payload);
request.end();
