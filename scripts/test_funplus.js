const assert = require('assert');
const fun = require('../commands/funplus');

function sock() {
  const s = { sent: [], async sendMessage(to, payload) { s.sent.push({ to, payload }); } };
  return s;
}
const msg = { key: { remoteJid: '123@g.us', participant: '555@s.whatsapp.net' } };
(async () => {
  const tests = [
    ['fortune', fun.fortune, [], 'MADARA FORTUNE'],
    ['compatibility', fun.compatibility, [], 'COMPATIBILITY'],
    ['madarafact', fun.madarafact, [], 'MADARA WISDOM'],
    ['battle', fun.battle, [], 'SHINOBI BATTLE'],
    ['prediction', fun.prediction, ['Will I win?'], 'MADARA PREDICTION'],
    ['shinobiquiz', fun.shinobiquiz, [], 'SHINOBI QUIZ'],
    ['roastme', fun.roastme, [], 'MADARA ROAST'],
    ['praise', fun.praise, [], 'SHINOBI PRAISE']
  ];
  for (const [name, fn, args, expected] of tests) {
    const s = sock(); await fn(s, '123@g.us', msg, ...args); assert.strictEqual(s.sent.length, 1, `${name} did not respond`); assert(s.sent[0].payload.text.includes(expected), `${name} response mismatch`);
  }
  console.log('PASS funplus smoke tests');
})().catch(error => { console.error(error); process.exit(1); });
