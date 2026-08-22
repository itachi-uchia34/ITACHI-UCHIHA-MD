const assert = require('assert');
const directDownload = require('../commands/directdl');

function makeSock() {
  const sent = [];
  return {
    sent,
    async sendMessage(to, payload, options) {
      sent.push({ to, payload, options });
      return { key: { id: 'test' } };
    }
  };
}

(async () => {
  const usageSock = makeSock();
  await directDownload(usageSock, '120@s.whatsapp.net', { key: { id: 'usage' }, message: { conversation: '.directdl' } });
  assert.strictEqual(usageSock.sent.length, 1);
  assert(usageSock.sent[0].payload.text.includes('Usage: .directdl'));

  const invalidSock = makeSock();
  await directDownload(invalidSock, '120@s.whatsapp.net', { key: { id: 'invalid' }, message: { conversation: '.directdl http://127.0.0.1/file.mp3' } }, 'http://127.0.0.1/file.mp3');
  assert(invalidSock.sent[0].payload.text.includes('valid public HTTP or HTTPS'));

  const helpers = directDownload._test;
  assert.strictEqual(helpers.classify('image/png', 'anything.bin'), 'image');
  assert.strictEqual(helpers.classify('application/octet-stream', 'clip.mp4'), 'video');
  assert.strictEqual(helpers.classify('audio/mpeg', 'anything.bin'), 'audio');
  assert.strictEqual(helpers.classify('application/pdf', 'document.pdf'), 'document');
  assert(helpers.isBlockedHost('localhost'));
  assert(helpers.isBlockedHost('192.168.1.1'));
  assert(!helpers.isBlockedHost('example.com'));

  console.log('PASS direct URL download command tests');
})().catch(error => { console.error(error); process.exit(1); });
