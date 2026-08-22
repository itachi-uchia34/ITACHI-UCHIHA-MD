const fs = require('fs');
const song = require('../commands/song');

const query = process.argv.slice(2).join(' ') || 'California Love Cheema Y Gur Sidhu';
const output = '/tmp/play_whatsapp_probe.mp3';
const sent = [];
const sock = {
  async sendMessage(to, payload, options) {
    sent.push({ to, payload, options });
    if (payload.audio) fs.writeFileSync(output, Buffer.from(payload.audio));
    console.log(JSON.stringify({
      type: payload.audio ? 'audio' : payload.image ? 'notice-image' : 'text',
      bytes: payload.audio?.length || 0,
      mimetype: payload.mimetype || null,
      fileName: payload.fileName || null,
      text: payload.text?.slice(0, 180) || payload.caption?.slice(0, 180) || null,
      quoted: Boolean(options?.quoted)
    }));
    return { key: { id: String(sent.length) } };
  }
};

(async () => {
  await song(sock, '120@s.whatsapp.net', {
    key: { id: 'play-probe' },
    message: { conversation: `.play ${query}` }
  }, query);
  const audio = sent.find(item => item.payload.audio);
  if (!audio) throw new Error('The .play handler did not send an audio payload');
  console.log(JSON.stringify({
    status: 'PASS',
    query,
    totalMessages: sent.length,
    audioBytes: audio.payload.audio.length,
    fileName: audio.payload.fileName,
    mimetype: audio.payload.mimetype,
    ptt: audio.payload.ptt,
    output
  }, null, 2));
})().catch(error => {
  console.error(error);
  process.exit(1);
});
