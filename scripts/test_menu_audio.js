const assert = require('assert');
const fs = require('fs');
const path = require('path');
const allMenu = require('../commands/allmenu');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
const audioPath = path.join(__dirname, '..', 'song.mp3');
const audio = fs.readFileSync(audioPath);

for (const token of [
  "const STARTUP_AUDIO_PATH = path.join(__dirname, 'song.mp3')",
  'function readStartupAudio()',
  'audio.length < 4096',
  'hasId3',
  'hasFrameSync',
  'Startup music sent with the menu',
  'Startup music sent with the all-menu',
  'Startup music skipped: song.mp3 is missing or not a valid MP3 file.',
  "fileName: 'ITACHI-UCHIHA-MD-STARTUP.mp3'"
]) assert(source.includes(token), `Missing menu audio safeguard: ${token}`);

assert(audio.length >= 4096, 'The startup song must be a real MP3 asset');
const hasId3 = audio.subarray(0, 3).toString('ascii') === 'ID3';
const hasFrameSync = audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0;
assert(hasId3 || hasFrameSync, 'The startup song must contain an MP3 header');
assert(source.includes("case 'menu':"), 'Menu route missing');
assert(source.includes("case 'allmenu':"), 'All-menu route missing');

(async () => {
  const sent = [];
  const registeredCommands = {};
  for (const command of new Set(Object.values(allMenu.MENU_GROUPS).flat())) {
    registeredCommands[command] = () => {};
  }

  await allMenu({
    async sendMessage(chatId, payload, options) {
      sent.push({ chatId, payload, options });
      return { key: { id: String(sent.length) } };
    }
  }, '120@s.whatsapp.net', { key: { id: 'menu' } }, { userId: 'test-session' }, registeredCommands);

  assert(sent.length >= 1, 'menu sender did not send a payload');
  assert(Buffer.isBuffer(sent[0].payload.image), 'first payload must be an image buffer');
  assert(sent[0].payload.image.length > 10000, 'startup image buffer is unexpectedly small');
  assert(!sent[0].payload.caption, 'startup image should be sent without menu caption');
  assert.strictEqual(sent[0].options.quoted.key.id, 'menu');

  const menuTextPayload = sent.find(item => typeof item.payload.text === 'string');
  if (menuTextPayload) {
    assert(menuTextPayload.payload.text.includes('COMMAND MENU'), 'menu text must include command menu heading');
    assert(menuTextPayload.payload.text.includes('.song'), 'menu text must include song command');
    assert(!menuTextPayload.payload.text.includes(' — '), 'menu text must not include command descriptions');
    assert(!menuTextPayload.payload.text.includes('Newsletter code'), 'menu text must not include newsletter code');
    assert(!menuTextPayload.payload.text.includes('@newsletter'), 'menu text must not include newsletter JID');
  }

  assert(sent[0].payload.image && menuTextPayload, 'menu must send image first and command list below it');
  assert.strictEqual(sent.indexOf(menuTextPayload), 1, 'command list must be sent immediately after the image');
  console.log(`PASS menu audio checks: playable MP3 detected (${audio.length} bytes), image-first/menu-text path verified`);
})().catch(error => { console.error(error); process.exit(1); });
