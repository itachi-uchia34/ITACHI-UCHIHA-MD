const assert = require('assert');
const welcome = require('../commands/welcome');

(async () => {
    const botData = { welcomeSettings: {} };
    let saveCount = 0;
    const sent = [];
    const sock = {
        async sendMessage(jid, content, options) {
            sent.push({ jid, content, options });
        },
        async groupMetadata() {
            return {
                subject: 'Test Group',
                participants: [{ id: '111@s.whatsapp.net' }, { id: '222@s.whatsapp.net' }]
            };
        }
    };
    const groupId = '12345@g.us';

    await welcome.welcomeCommand(sock, groupId, { key: {} }, true, '', botData, () => saveCount++);
    await welcome.goodbyeCommand(sock, groupId, { key: {} }, true, 'on', botData, () => saveCount++);
    assert.strictEqual(botData.welcomeSettings[groupId].welcomeEnabled, true);
    assert.strictEqual(botData.welcomeSettings[groupId].goodbyeEnabled, true);
    assert.strictEqual(saveCount, 2);
    assert.ok(botData.welcomeSettings[groupId].welcomeText.includes('ITACHI UCHIHA MD'));
    assert.ok(botData.welcomeSettings[groupId].welcomeText.includes('POWERED BY ALI HAIDER ®'));
    assert.ok(botData.welcomeSettings[groupId].goodbyeText.includes('ITACHI UCHIHA MD'));
    assert.ok(botData.welcomeSettings[groupId].goodbyeText.includes('POWERED BY ALI HAIDER ®'));

    await welcome.handleParticipantUpdate(sock, {
        id: groupId,
        action: 'add',
        participants: [{ id: '111@s.whatsapp.net' }]
    }, botData, () => saveCount++);
    assert.strictEqual(sent.at(-1).jid, groupId);
    assert.deepStrictEqual(sent.at(-1).content.mentions, ['111@s.whatsapp.net']);
    assert.ok(sent.at(-1).content.text.includes('@111'));
    assert.ok(sent.at(-1).content.text.includes('Test Group'));
    assert.ok(sent.at(-1).content.text.includes('SHADOW REALM'));

    await welcome.handleParticipantUpdate(sock, {
        id: groupId,
        action: 'remove',
        participants: ['222@s.whatsapp.net']
    }, botData, () => saveCount++);
    assert.deepStrictEqual(sent.at(-1).content.mentions, ['222@s.whatsapp.net']);
    assert.ok(sent.at(-1).content.text.includes('@222'));
    assert.ok(sent.at(-1).content.text.toLowerCase().includes('farewell'));
    assert.ok(sent.at(-1).content.text.includes('SHADOWS'));

    const before = sent.length;
    botData.welcomeSettings[groupId].welcomeEnabled = false;
    await welcome.handleParticipantUpdate(sock, {
        id: groupId,
        action: 'add',
        participants: ['333@s.whatsapp.net']
    }, botData, () => saveCount++);
    assert.strictEqual(sent.length, before);

    const allMenu = require('../commands/allmenu');
    const menuMessages = [];
    await allMenu({
        async sendMessage(jid, content) {
            menuMessages.push({ jid, content });
        }
    }, groupId, { key: {} }, { userId: 'test' }, {});
    assert.ok(menuMessages.length >= 1);
    assert.ok(menuMessages[0].content.image);
    assert.strictEqual(menuMessages[0].content.caption, undefined);
    assert.ok(menuMessages[1].content.text.includes('COMMAND MENU'));

    console.log('welcome/goodbye and menu regression tests passed');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
