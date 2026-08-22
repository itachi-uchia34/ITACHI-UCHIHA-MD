const assert = require('assert');
const extra = require('../commands/extrasplus');

function sock() {
  const s = { sent: [], async sendMessage(to, payload) { s.sent.push({ to, payload }); } };
  return s;
}
const msg = { key: { remoteJid: '123@g.us', participant: '555@s.whatsapp.net' } };
(async () => {
  for (const [name, fn, from, args, expected] of [
    ['about', extra.about, '123@s.whatsapp.net', [], 'ABOUT'],
    ['rules', extra.rules, '123@g.us', [], 'REALM RULES'],
    ['groupid', extra.groupid, '123@g.us', [], 'GROUP ID'],
    ['chatid', extra.chatid, '123@s.whatsapp.net', [], 'CHAT JID'],
    ['mention', extra.mention, '123@g.us', ['test'], '@555'],
  ]) {
    const s = sock(); await fn(s, from, msg, ...args); assert(s.sent.length === 1, `${name} did not respond`); assert(s.sent[0].payload.text.includes(expected), `${name} response mismatch`);
  }
  const denied = sock(); await extra.groupid(denied, '123@s.whatsapp.net', msg); assert(denied.sent[0].payload.text.includes('only in groups'), 'groupid denial failed');
  for (const [name, fn, q, expected] of [
    ['randomtool', extra.randomtool, '10 20', 'RANDOM VALUE'],
    ['timestamp', extra.timestamp, '2026-08-20T12:00:00Z', 'TIMESTAMP'],
    ['urlencode', extra.urlencode, 'Madara Uchiha', 'URL ENCODED'],
    ['hextext', extra.hextext, 'Madara', 'HEX RESULT'],
    ['jsonfmt', extra.jsonfmt, '{"a":1}', 'FORMATTED JSON'],
    ['textstats', extra.textstats, 'one two three', 'TEXT STATISTICS']
  ]) {
    const s = sock(); await fn(s, '123@s.whatsapp.net', msg, q); assert(s.sent.length === 1, `${name} did not respond`); assert(s.sent[0].payload.text.includes(expected), `${name} response mismatch`);
  }
  console.log('PASS extrasplus smoke tests');
})().catch(err => { console.error(err); process.exit(1); });
