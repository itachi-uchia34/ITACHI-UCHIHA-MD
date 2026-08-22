const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest.json'), 'utf8'));

for (const token of [
  'viewport-fit=cover',
  'mobile-web-app-capable',
  'apple-mobile-web-app-capable',
  'apple-mobile-web-app-title',
  'rel="manifest"',
  'safe-area-inset-top',
  'min-height:100dvh',
  "transports:['polling','websocket']",
  'reconnection:true',
  'function storageGet(key)',
  'function storageSet(key,value)',
  'id="requestPairing"',
  'id="requestQr"',
  'id="pairingCode"'
]) assert(html.includes(token), `Missing cross-platform dashboard feature: ${token}`);

assert.strictEqual(manifest.name, 'ITACHI UCHIHA MD');
assert.strictEqual(manifest.display, 'standalone');
assert.strictEqual(manifest.start_url, '/');
assert.strictEqual(manifest.orientation, 'portrait-primary');
assert(fs.existsSync(path.join(__dirname, '..', 'assets', 'madara_menu.png')), 'Startup artwork missing');

const mediaQueries = (html.match(/@media/g) || []).length;
assert(mediaQueries >= 2, 'Responsive media queries missing');
console.log('PASS cross-platform web checks: metadata, responsive layout, pairing controls, reconnection, and manifest');
