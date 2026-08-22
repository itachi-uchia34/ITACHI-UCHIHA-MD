const TOP = '╔═════════════════════════╗';
const BOTTOM = '╚═════════════════════════╝';
const SEPARATOR = '━━━━━━━━━━━━━━━━━━━━━━━━━';
const TITLE = '    👁️‍🗨️  𝗠𝗔𝗗𝗔𝗥𝗔  𝗨𝗖𝗛𝗜𝗛𝗔  👁️‍🗨️';

function jidFooter(jid, options, mode = 'both') {
    const quoted = options?.quoted;
    const sender = quoted?.key?.participant || quoted?.participant || quoted?.key?.remoteJid || 'unknown';
    const lines = ['━━━━━━━━━━━━━━━━━━━━━━━━━', '🆔 *JID FOOTER*'];
    if (mode === 'sender' || mode === 'both') lines.push(`👤 Sender: ${sender}`);
    if (mode === 'chat' || mode === 'both') lines.push(`💬 Chat: ${jid}`);
    lines.push('POWERED BY ALI HAIDER ®');
    return lines.join('\n');
}

function styleText(text, footer = '') {
    if (typeof text !== 'string' || !text.trim()) return text;
    if (text.includes('𝗠𝗔𝗗𝗔𝗥𝗔') || text.includes('COMMAND MENU') || text.includes('NEW SOUL ENTERED') || text.includes('SOUL DEPARTED')) return footer ? `${text}\n\n${footer}` : text;
    const trimmed = text.trim();
    if (trimmed.startsWith('╔') || trimmed.startsWith('╭') || trimmed.startsWith('┏')) return footer ? `${text}\n\n${footer}` : text;
    const lines = trimmed.split('\n');
    const firstLine = lines[0].trim().toLowerCase();
    const body = lines.map(line => `┃ ${line}`).join('\n');
    const title = firstLine.includes('error') || firstLine.includes('failed') ? '⚠️ 𝗠𝗔𝗗𝗔𝗥𝗔 𝗗𝗘𝗖𝗥𝗘𝗘' : TITLE;
    const styled = `${TOP}\n${title}\n${SEPARATOR}\n${body}\n${BOTTOM}`;
    return footer ? `${styled}\n\n${footer}` : styled;
}

function styleContent(content, context = {}) {
    if (!content || typeof content !== 'object') return content;
    const footer = context.footer || '';
    if (typeof content.text === 'string') return { ...content, text: styleText(content.text, footer) };
    if (typeof content.caption === 'string') return { ...content, caption: styleText(content.caption, footer) };
    return content;
}

function applyItachiStyle(sock, footerProvider = null) {
    if (!sock || sock.__itachiStyleApplied) return sock;
    const original = sock.sendMessage.bind(sock);
    sock.sendMessage = (jid, content, options) => {
        let footer = '';
        try {
            const config = typeof footerProvider === 'function' ? footerProvider(jid, options) : footerProvider;
            if (config?.enabled) footer = jidFooter(jid, options, config.mode || 'both');
        } catch (error) {}
        return original(jid, styleContent(content, { jid, options, footer }), options);
    };
    sock.__itachiStyleApplied = true;
    return sock;
}

module.exports = { TOP, BOTTOM, SEPARATOR, TITLE, jidFooter, styleText, styleContent, applyItachiStyle };
