const assert = require('assert');
const group = require('../commands/groupplus');
const owner = require('../commands/ownerplus');

function makeSock(metadata = null) {
  const sent = [];
  const sock = {
    sent,
    async sendMessage(to, payload) { sent.push({ to, payload }); return { key: { id: 'test' } }; },
    async groupMetadata() { return metadata; },
    async groupUpdateDescription() { sock.updatedDescription = true; },
    async groupSettingUpdate(_, setting) { sock.setting = setting; },
    async groupInviteCode() { return 'TESTINVITE'; },
    async groupRevokeInvite() { sock.revoked = true; }
  };
  return sock;
}
const msg = { key: { remoteJid: '120@g.us' } };
(async () => {
  const metadata = { subject: 'Uchiha Realm', participants: [{ id: '1@s.whatsapp.net', admin: 'admin' }, { id: '2@s.whatsapp.net' }] };
  for (const [name, fn, args, check] of [
    ['setdesc', group.setdesc, [true, 'New decree'], s => s.updatedDescription],
    ['groupopen', group.groupopen, [true], s => s.setting === 'not_announcement'],
    ['groupclose', group.groupclose, [true], s => s.setting === 'announcement'],
    ['adminsonly', group.adminsonly, [true], s => s.setting === 'locked'],
    ['allmembers', group.allmembers, [true], s => s.setting === 'unlocked'],
    ['grouplink', group.grouplink, [true], s => /chat\.whatsapp\.com\/TESTINVITE/.test(s.sent.at(-1).payload.text)],
    ['revokeinvite', group.revokeinvite, [true], s => s.revoked]
  ]) {
    const sock = makeSock(metadata); await fn(sock, '120@g.us', msg, ...args); assert(check(sock), `${name} failed`);
  }
  const deniedGroup = makeSock(metadata); await group.groupclose(deniedGroup, '120@g.us', msg, false); assert(/Only group admins/.test(deniedGroup.sent[0].payload.text), 'group admin denial failed');
  const deniedPrivate = makeSock(metadata); await group.groupopen(deniedPrivate, '2@s.whatsapp.net', msg, true); assert(/only available in groups/.test(deniedPrivate.sent[0].payload.text), 'private chat denial failed');
  for (const [name, fn, text] of [['botinfo', owner.botinfo], ['health', owner.health], ['ownerhelp', owner.ownerhelp]]) {
    const sock = makeSock(); await fn(sock, '2@s.whatsapp.net', msg, true); assert(sock.sent.length === 1, `${name} owner response failed`); assert(/POWERED BY ⚔️ ALI-HAIDER ⚔️/.test(sock.sent[0].payload.text), `${name} branding missing`);
  }
  const deniedOwner = makeSock(); await owner.botinfo(deniedOwner, '2@s.whatsapp.net', msg, false); assert(/restricted to the bot owner/.test(deniedOwner.sent[0].payload.text), 'owner denial failed');
  console.log('PASS group and owner command smoke tests');
})().catch(error => { console.error(error); process.exit(1); });
