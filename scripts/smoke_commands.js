const assert = require('assert');
const extras = require('../commands/extras');
const groupplus = require('../commands/groupplus');
const fonts = require('../commands/fonts');
const levels = require('../commands/levels');
const binary = require('../commands/binary');
const morse = require('../commands/morse');
const dpz = require('../commands/dpz');
const poetry = require('../commands/poetry');
const channel = require('../commands/channel');

function mockSocket() {
  const sent = [];
  return { sent, sendMessage: async (...args) => { sent.push(args); return { key: { id: String(sent.length) } }; } };
}
async function run(name, fn, check) {
  const sock = mockSocket();
  await fn(sock);
  assert(sock.sent.length > 0, `${name} emitted no messages`);
  if (check) check(sock.sent);
  console.log(`PASS ${name}: ${sock.sent.length} message(s)`);
}
(async () => {
  await run('extras.password', s => extras.password(s, '123@g.us', { key: { id: 'm1' } }, '16'), sent => assert(/SECRET SEAL GENERATED/.test(sent[0][1].text)));
  await run('extras.dice', s => extras.dice(s, '123@s.whatsapp.net', { key: { id: 'm2' } }, '6'), sent => assert(/BATTLEFIELD DICE/.test(sent[0][1].text)));
  await run('extras.binary', s => binary(s, '123@s.whatsapp.net', { key: { id: 'm3' } }, 'Madara'), sent => assert(/Binary/.test(sent[0][1].text)));
  await run('extras.morse', s => morse(s, '123@s.whatsapp.net', { key: { id: 'm4' } }, 'madara'), sent => assert(/Morse Code/.test(sent[0][1].text)));
  await run('groupplus.poll', s => groupplus.poll(s, '123@g.us', { key: { id: 'm5' } }, true, 'Battle | Fire | Water'), sent => assert(sent[0][1].poll && sent[0][1].poll.values.length === 2));
  await run('groupplus.poll denial', s => groupplus.poll(s, '123@s.whatsapp.net', { key: { id: 'm6' } }, true, 'Battle | Fire | Water'), sent => assert(/group/i.test(sent[0][1].text)));
  await run('fonts.font1', s => fonts.font1(s, '123@s.whatsapp.net', { key: { id: 'm7' } }, 'Madara'), sent => assert(sent[0][1].text));
  await run('levels.rank', s => levels.rankCommand(s, '123@g.us', { key: { id: 'm8', participant: '456@s.whatsapp.net' }, pushName: 'Shinobi' }, '', {}, '456@s.whatsapp.net'), sent => assert(sent[0][1].text));
  const boyPayloads = [];
  for (let i = 0; i < 10; i++) await run(`dpz boys ${i + 1}`, s => dpz.dpzCommand(s, '123@s.whatsapp.net', { key: { id: `m${9 + i}` } }, 'boys'), sent => { assert(Buffer.isBuffer(sent[0][1].image)); assert(/BOYS DPZ/.test(sent[0][1].caption)); boyPayloads.push(sent[0][1].image); });
  assert.strictEqual(new Set(boyPayloads.map(buffer => buffer.length)).size, 10, 'boys DPZ rotation repeated an image payload');
  const girlPayloads = [];
  for (let i = 0; i < 10; i++) await run(`dpz girls ${i + 1}`, s => dpz.dpGirlsCommand(s, '123@s.whatsapp.net', { key: { id: `m${19 + i}` } }), sent => { assert(Buffer.isBuffer(sent[0][1].image)); assert(/GIRLS DPZ/.test(sent[0][1].caption)); girlPayloads.push(sent[0][1].image); });
  assert.strictEqual(new Set(girlPayloads.map(buffer => buffer.length)).size, 10, 'girls DPZ rotation repeated an image payload');
  await run('sad poetry', s => poetry.sadPoetryCommand(s, '123@s.whatsapp.net', { key: { id: 'm11' } }), sent => assert(/SAD POETRY/.test(sent[0][1].text)));
  await run('romantic poetry', s => poetry.romanticPoetryCommand(s, '123@s.whatsapp.net', { key: { id: 'm12' } }), sent => assert(/ROMANTIC POETRY/.test(sent[0][1].text)));
  const dpzData = {};
  let saved = false;
  const saveDpz = () => { saved = true; };
  await run('dpz config add trusted URL', s => dpz.dpzConfigCommand(s, '123@g.us', { key: { id: 'm13' } }, true, 'add boys https://example.com/boys-dp.jpg', dpzData, saveDpz), sent => assert(/Trusted custom URLs:.*1/.test(sent[0][1].text)));
  assert(saved && dpzData.dpzSettings['123@g.us'].customBoys.length === 1);
  await run('dpz custom boys image', s => dpz.dpzCommand(s, '123@g.us', { key: { id: 'm14' } }, 'boys', dpzData, saveDpz), sent => assert(sent[0][1].image && sent[0][1].image.url === 'https://example.com/boys-dp.jpg'));
  await run('dpz config denied outside admin', s => dpz.dpzConfigCommand(s, '123@g.us', { key: { id: 'm15' } }, false, 'off', dpzData, saveDpz), sent => assert(/Only group admins/.test(sent[0][1].text)));
  const channelData = { channelSettings: {} };
  let channelSaved = false;
  const saveChannel = () => { channelSaved = true; };
  assert(channel.parseChannel('120363123456789012@newsletter'));
  assert(channel.parseChannel('https://whatsapp.com/channel/MadaraRealm'));
  assert.strictEqual(channel.parseChannel('https://example.com/channel/MadaraRealm'), null);
  await run('channel set owner JID', s => channel.setChannelCommand(s, '123@s.whatsapp.net', { key: { id: 'm16' } }, true, '120363123456789012@newsletter', channelData, saveChannel, 'bot-1'), sent => assert(/Menu channel saved/.test(sent[0][1].text)));
  assert(channelSaved && channelData.channelSettings['bot-1'].jid === '120363123456789012@newsletter');
  await run('channel show', s => channel.channelCommand(s, '123@s.whatsapp.net', { key: { id: 'm17' } }, false, channelData, 'bot-1'), sent => assert(/120363123456789012@newsletter/.test(sent[0][1].text)));
  await run('channel update denied', s => channel.setChannelCommand(s, '123@s.whatsapp.net', { key: { id: 'm18' } }, false, '120363999999999999@newsletter', channelData, saveChannel, 'bot-1'), sent => assert(/Only the bot owner/.test(sent[0][1].text)));
  await run('channel remove owner', s => channel.removeChannelCommand(s, '123@s.whatsapp.net', { key: { id: 'm19' } }, true, channelData, saveChannel, 'bot-1'), sent => assert(/default repository channel/.test(sent[0][1].text)));
  console.log('All representative command smoke tests passed.');
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
