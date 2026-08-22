const assert = require('assert');
const allMenu = require('../commands/allmenu');

const sent = [];
const sock = { sendMessage: async (...args) => { sent.push(args); } };
const registered = {};
for (const command of Object.values(allMenu.MENU_GROUPS).flat()) registered[command] = () => {};

(async () => {
  await allMenu(sock, '123@s.whatsapp.net', { key: { id: 'layout-test' } }, {}, registered);
  const menu = sent[0][1].caption;
  const commandLines = menu.split('\n').filter(line => /^┃ \.\S+/.test(line));
  assert(commandLines.length > 100, `Expected a large one-command-per-line menu, got ${commandLines.length}`);
  for (const line of commandLines) {
    assert.strictEqual((line.match(/\.\S+/g) || []).length, 1, `Multiple commands share a line: ${line}`);
  }
  assert(menu.includes('DPZ PROFILES & POETRY'));
  assert(menu.includes('┃ .dpz'));
  assert(menu.includes('┃ .sadpoetry'));
  assert(menu.includes('┃ .romanticpoetry'));
  assert(menu.includes('CHANNEL SETTINGS'));
  assert(menu.includes('┃ .channel'));
  assert(menu.includes('┃ .setchannel'));
  console.log(`PASS horizontal menu layout: ${commandLines.length} commands, one per line`);
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
