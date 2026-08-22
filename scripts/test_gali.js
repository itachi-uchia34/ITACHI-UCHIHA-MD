const assert = require('assert');
const gali = require('../commands/gali');

function makeTransport() {
  const messages = [];
  return {
    messages,
    async sendMessage(to, payload) {
      messages.push({ to, payload });
      return { key: { id: String(messages.length) } };
    }
  };
}

(async () => {
  assert.strictEqual(gali.count, 100, 'gali must expose exactly 100 roast lines');

  const usageSock = makeTransport();
  await gali(usageSock, 'chat@s.whatsapp.net', { key: { id: 'usage' } }, null, []);
  assert.strictEqual(usageSock.messages.length, 1, 'usage should send one message');
  assert(usageSock.messages[0].payload.text.includes('100 playful roast styles'), 'usage should mention the 100 styles');

  const target = '923001234567@s.whatsapp.net';
  const replySock = makeTransport();
  await gali(replySock, 'chat@s.whatsapp.net', {
    key: { id: 'reply', participant: target },
    quoted: { sender: target }
  }, null, []);
  assert.strictEqual(replySock.messages.length, 2, 'target gali should react and send a reply');
  const reply = replySock.messages[1].payload;
  assert(reply.text.includes('ITACHI GALI ARENA'), 'reply should use Itachi branding');
  assert(reply.mentions.includes(target), 'reply should mention the quoted user');
  assert(reply.text.includes('@923001234567'), 'reply should include the target label');

  const customSock = makeTransport();
  await gali(customSock, 'chat@s.whatsapp.net', { key: { id: 'custom' } }, null, ['shinobi']);
  assert.strictEqual(customSock.messages.length, 2, 'custom gali should react and send a reply');
  assert(customSock.messages[1].payload.text.includes('shinobi'), 'custom label should appear in the reply');

  console.log('PASS gali smoke tests: 100 lines, usage, mention, custom label');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
