const assert = require('assert');
const downloadMenu = require('../commands/downloadmenu');
const song = require('../commands/song');

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
  const menuSock = makeSock();
  await downloadMenu(menuSock, '120@g.us', { key: { id: 'quoted' } });
  assert.strictEqual(menuSock.sent.length, 1, 'download menu should send one message');
  const menuText = menuSock.sent[0].payload.text;
  for (const command of ['.song', '.play', '.ytmp3', '.ytmp4', '.video', '.youtube', '.spotify', '.spdl', '.tiktok', '.ttdl', '.insta', '.igdl', '.facebook', '.fbdown', '.pinterest', '.pindl', '.twitter', '.twtdl', '.reddit', '.reddown', '.gdrive', '.mf', '.apk', '.directdl', '.urldl', '.download']) {
    assert(menuText.includes(command), `download menu missing ${command}`);
  }
  assert(menuText.includes('POWERED BY ⚔️ ALI-HAIDER ⚔️'), 'download menu branding missing');

  const songSock = makeSock();
  await song(songSock, '120@s.whatsapp.net', { key: { id: 'song' }, message: { conversation: '.song' } });
  assert.strictEqual(songSock.sent.length, 1, 'song usage should send one message');
  assert(songSock.sent[0].payload.text.includes('Usage: .song'), 'song usage response missing');

  const quotedSongSock = makeSock();
  await song(quotedSongSock, '120@s.whatsapp.net', { key: { id: 'song2' }, message: { extendedTextMessage: { text: '.song' } } }, '');
  assert(quotedSongSock.sent[0].payload.text.includes('Usage: .song'), 'song extended-text usage response missing');

  const helpers = song._test;
  assert.strictEqual(helpers.extractQuery({ message: { conversation: '.song California Love' } }), 'California Love');
  assert.strictEqual(helpers.extractQuery({ message: { conversation: '.play California Love' } }), 'California Love');
  assert.strictEqual(helpers.extractQuery({}, 'https://youtu.be/example'), 'https://youtu.be/example');
  assert(helpers.isLikelyAudio(Buffer.concat([Buffer.from('ID3'), Buffer.alloc(4093)])), 'ID3 audio header not recognized');
  assert(!helpers.isLikelyAudio(Buffer.from('<html>not audio</html>')), 'HTML must not be accepted as audio');
  assert.strictEqual(helpers.sanitizeTitle('Bad:/Title?'), 'BadTitle');

  console.log('PASS downloadmenu and song command smoke tests');
})().catch(error => { console.error(error); process.exit(1); });
