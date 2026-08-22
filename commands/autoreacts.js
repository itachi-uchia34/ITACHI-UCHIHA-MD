async function autoreactsCommand(sock, from, msg, isAdmin, session, args, botData, saveBotData) {
    if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only group admins or the bot owner can change auto-reactions.' }, { quoted: msg });
    const action = String(args?.[0] || '').toLowerCase();
    if (!botData.statusSettings) botData.statusSettings = {};
    if (!botData.statusSettings[session.userId]) botData.statusSettings[session.userId] = {};

    if (action === 'on' || action === 'enable') {
        session.autoReact = true;
        botData.statusSettings[session.userId].autoReact = true;
        saveBotData();
        return sock.sendMessage(from, { text: '✅ *MADARA AUTO-REACTION ENABLED*\n\nThe bot will react to incoming messages with themed reactions.' }, { quoted: msg });
    }
    if (action === 'off' || action === 'disable') {
        session.autoReact = false;
        botData.statusSettings[session.userId].autoReact = false;
        saveBotData();
        return sock.sendMessage(from, { text: '❌ *MADARA AUTO-REACTION DISABLED*\n\nAutomatic reactions have been stopped.' }, { quoted: msg });
    }
    if (action === 'status' || !action) {
        return sock.sendMessage(from, { text: `⚡ *AUTO-REACTION STATUS*\n\nStatus: ${session.autoReact ? '✅ ON' : '❌ OFF'}\n\nUsage: .autoreacts on/off` }, { quoted: msg });
    }
    return sock.sendMessage(from, { text: 'Usage: .autoreacts on | off | status' }, { quoted: msg });
}

module.exports = autoreactsCommand;
