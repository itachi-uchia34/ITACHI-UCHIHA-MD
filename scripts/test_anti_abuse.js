const assert = require('assert');
const { AntiAbuseGuard, applyAntiAbuse } = require('../lib/anti_abuse');

(async () => {
  const guard = new AntiAbuseGuard();
  guard.minDelayMs = 0;
  guard.reactionDelayMs = 0;
  guard.maxMessagesPerWindow = 3;
  guard.maxBroadcastRecipients = 2;
  guard.pauseMs = 1000;

  const sent = [];
  const raw = async (jid, payload) => {
    sent.push({ jid, payload });
    return { ok: true };
  };

  await guard.sendMessage(raw, 'chat@s.whatsapp.net', { text: 'one' });
  await assert.rejects(() => guard.sendMessage(raw, 'chat@s.whatsapp.net', { text: 'one' }), /Duplicate outgoing message/);
  await guard.sendMessage(raw, 'chat@s.whatsapp.net', { text: 'two' });
  await guard.sendMessage(raw, 'chat@s.whatsapp.net', { text: 'three' });
  await assert.rejects(() => guard.sendMessage(raw, 'chat@s.whatsapp.net', { text: 'four' }), /Anti-abuse safety pause/);
  assert.strictEqual(sent.length, 3, 'only three messages should pass');
  assert.throws(() => guard.assertBroadcastAllowed(3), /broadcast capped/);

  const sock = { sendMessage: raw };
  applyAntiAbuse(sock);
  assert(sock.antiAbuse, 'guard should attach to socket');
  assert.strictEqual(typeof sock.safeSendMessage, 'function');
  console.log('PASS anti-abuse tests: duplicate suppression, rate limit, broadcast cap, circuit breaker, wrapper');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
