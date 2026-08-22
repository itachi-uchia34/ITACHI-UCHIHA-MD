const assert = require('assert');
const fs = require('fs');
const source = fs.readFileSync('index.js', 'utf8');
const page = fs.readFileSync('index.html', 'utf8');
const required = [
  'pairingCodeIssuedAt',
  'clearUnregisteredAuth',
  'WhatsApp returned an invalid pairing code',
  'Pairing code expired. Request a new code.',
  'isPairingActive',
  'PAIRING_CONNECTION_CLOSED',
  'rawCode = String(rawCode || \'\').replace(/[^A-Za-z0-9]/g, \'\').toUpperCase()',
  'rawCode.match(/.{1,4}/g).join(\'-\')',
  "const QRCode = require('qrcode');",
  "QRCode.toDataURL(qr",
  "socket.on('qr-request'",
  "io.to(socketId).emit('qr', { dataUrl: qrDataUrl",
  'this.sock.waitForConnectionUpdate',
  "update => update.connection === 'open' || Boolean(update.qr)",
  'isPairingActive && isTransient',
  'Retrying without clearing auth',
 ];
for (const token of required) assert(source.includes(token), `Missing pairing safeguard: ${token}`);
for (const token of ['id="requestQr"', 'id="qrWrap"']) assert(page.includes(token), `Missing browser QR control: ${token}`);
assert(!/isPairingActive[\s\S]{0,500}setTimeout\(\(\) => this\.initialize\(\), 3/.test(source), 'Pairing-code sessions must not be auto-restarted');
assert(source.includes('this.scheduleReconnect(this.pairingNumber'), 'Pairing retry must preserve the original phone number');
assert(source.includes('this.pairingState = \'connected\';'), 'Connected state transition missing');
for (const token of ['state?.state===\'expired\'', 'state?.state===\'disconnected\'', 'state?.state===\'error\'', 'Request a fresh code', 'PAIRING_CONNECTION_CLOSED', 'socket.on(\'qr\'', 'Link with QR']) assert((source + page).includes(token), `Missing UI recovery state: ${token}`);
console.log('PASS pairing recovery safeguards');
