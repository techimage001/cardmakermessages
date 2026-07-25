'use strict';
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'src/app.js'), 'utf8');

function extractFunction(name) {
  const plain = `  function ${name}(`;
  const asyncMarker = `  async function ${name}(`;
  let start = src.indexOf(plain);
  if (start < 0) start = src.indexOf(asyncMarker);
  assert(start >= 0, `Missing function ${name}`);
  const brace = src.indexOf('{', start);
  let depth = 0, quote = null, template = false, escape = false;
  for (let i = brace; i < src.length; i++) {
    const ch = src[i];
    if (escape) { escape = false; continue; }
    if (quote) {
      if (ch === '\\') { escape = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (template) {
      if (ch === '\\') { escape = true; continue; }
      if (ch === '`') template = false;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '`') { template = true; continue; }
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return src.slice(start + 2, i + 1);
    }
  }
  throw new Error(`Unclosed function ${name}`);
}

const code = [
  'shareWebsiteUrl','shareCaption','shareMessage','canSharePayload','bestFileSharePayload','runShareFallback','sharePreparedFiles'
].map(extractFunction).join('\n');

let calls = [];
let announcements = [];
let fallbackCount = 0;
const context = {
  navigator: {
    canShare(payload) { return Boolean(payload.files?.length); },
    share(payload) { calls.push(payload); return Promise.resolve(); }
  },
  Promise,
  announce(msg) { announcements.push(msg); },
  copyShareMessage: async () => true,
  console,
};
vm.createContext(context);
vm.runInContext(code, context);

const files = [{name:'birthday-card.png', type:'image/png'}];
const payload = context.bestFileSharePayload(files, 'Birthday card');
assert.strictEqual(payload.files, files);
assert.strictEqual(payload.text, 'I made this card on CardMakerMessages.com. Create yours too:');
assert.strictEqual(payload.url, 'https://cardmakermessages.com');

const promise = context.sharePreparedFiles(files, 'Birthday card', async () => { fallbackCount++; });
assert.strictEqual(calls.length, 1, 'navigator.share must be called immediately');
assert.strictEqual(calls[0].url, 'https://cardmakermessages.com');
assert.strictEqual(calls[0].files[0].name, 'birthday-card.png');
promise.then(() => {
  assert(announcements.some(x => x.includes('website link')));
  // Browser rejects URL+file but accepts file+full text.
  calls = [];
  context.navigator.canShare = p => Boolean(p.files?.length && !('url' in p));
  const p2 = context.bestFileSharePayload(files, 'Birthday card');
  assert(!('url' in p2));
  assert(p2.text.includes('https://cardmakermessages.com'));
  context.sharePreparedFiles(files, 'Birthday card', async () => { fallbackCount++; });
  assert.strictEqual(calls.length, 1);
  assert(calls[0].text.includes('https://cardmakermessages.com'));
  console.log('GPT20 native share unit QA passed.');
}).catch(err => { console.error(err); process.exit(1); });
