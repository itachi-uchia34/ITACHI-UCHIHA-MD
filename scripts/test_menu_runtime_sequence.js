const assert = require('assert');
const fs = require('fs');
const path = require('path');
const allMenu = require('../commands/allmenu');
const settings = require('../settings');

function readStartupAudio() {
  const audio = fs.readFileSync(path.join(__dirname, '..', 'song.mp3'));
  const hasId3 = audio.subarray(0, 3).toString('ascii') === 'ID3';
  const hasFrameSync = audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0;
  assert(audio.length >= 4096, 'startup audio is too small');
  assert(hasId3 || hasFrameSync, 'startup audio header is invalid');
  return audio;
}

(async () => {
  const sent = [];
  const sock = {
    async sendMessage(chatId, payload, options) {
      sent.push({ chatId, payload, options });
      return { key: { id: String(sent.length) } };
    }
  };
  const image = fs.readFileSync(path.join(__dirname, '..', 'assets', 'madara_menu.png'));
  const menuText = allMenu.buildMenuText({ userId: 'test-session' }, {
    song: () => {}, ytmp3: () => {}, video: () => {}, ytmp4: () => {},
    directdl: () => {}, urldl: () => {}, download: () => {}
  });
  const audio = readStartupAudio();

  await sock.sendMessage('120@s.whatsapp.net', { image }, { quoted: { key: { id: 'menu' } } });
  await sock.sendMessage('120@s.whatsapp.net', { text: menuText }, { quoted: { key: { id: 'menu' } } });
  await sock.sendMessage('120@s.whatsapp.net', {
    audio,
    mimetype: 'audio/mpeg',
    fileName: 'ITACHI-UCHIHA-MD-STARTUP.mp3',
    ptt: false
  }, { quoted: { key: { id: 'menu' } } });

  assert.strictEqual(sent.length, 3, 'menu should send exactly three payloads');
  assert(Buffer.isBuffer(sent[0].payload.image), 'first payload must be an image buffer');
  assert(sent[0].payload.image.length > 10000, 'startup image buffer is unexpectedly small');
  assert(typeof sent[1].payload.text === 'string' && sent[1].payload.text.includes('COMMAND MENU'), 'second payload must be the menu text');
  assert(sent[1].payload.text.includes('.song'), 'menu text must include song command');
  assert(sent[1].payload.text.includes('POWERED BY'), 'menu text must include powered-by branding');
  assert(Buffer.isBuffer(sent[2].payload.audio), 'third payload must be audio');
  assert.strictEqual(sent[2].payload.mimetype, 'audio/mpeg');
  assert.strictEqual(sent[2].payload.fileName, 'ITACHI-UCHIHA-MD-STARTUP.mp3');
  assert(sent[2].payload.audio.length >= 4096, 'audio payload is unexpectedly small');
  assert(sent[0].options.quoted && sent[1].options.quoted && sent[2].options.quoted, 'all payloads should quote the menu command');
  assert(settings.botName === 'ITACHI UCHIHA MD', 'bot branding mismatch');

  console.log(JSON.stringify({
    status: 'PASS',
    sequence: ['image', 'menu-text', 'startup-audio'],
    imageBytes: sent[0].payload.image.length,
    menuTextChars: sent[1].payload.text.length,
    audioBytes: sent[2].payload.audio.length,
    audioFileName: sent[2].payload.fileName
  }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
