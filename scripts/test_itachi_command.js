const assert = require('assert');
const { itachiCommand } = require('../commands/madarachat');

function makeSock() {
  const sent = [];
  return {
    sent,
    async sendMessage(to, payload, options) {
      sent.push({ to, payload, options });
      return { key: { id: 'itachi-test' } };
    }
  };
}

(async () => {
  const sock = makeSock();
  await itachiCommand(sock, '120@s.whatsapp.net', { key: { id: 'quoted' } }, '');
  assert.strictEqual(sock.sent.length, 1, 'itachi command should send one response');
  assert(sock.sent[0].payload.text.includes('Use .itachi <your question>'), 'itachi help guidance missing');
  assert(sock.sent[0].payload.text.includes('𝗜𝗧𝗔𝗖𝗛𝗜 𝗨𝗖𝗛𝗜𝗛𝗔'), 'itachi response header missing');
  console.log('PASS .itachi command smoke test');
})().catch(error => { console.error(error); process.exit(1); });
