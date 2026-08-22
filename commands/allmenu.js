const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const menuImagePath = path.join(__dirname, '../assets/itachi_menu.png');

function getMenuImage() {
    return fs.existsSync(menuImagePath) ? fs.readFileSync(menuImagePath) : { url: settings.startimage };
}

const MENU_GROUPS = {
    'OWNER & BOT': ['owner', 'ownerhelp', 'botinfo', 'health', 'safetymode', 'public', 'private', 'mode', 'setname', 'autoreact', 'autoreacts', 'jidfooter', 'block', 'unblock', 'backup', 'restore', 'restart'],
    'GROUP MANAGEMENT': ['grouphelp', 'admins', 'members', 'groupstats', 'groupid', 'kick', 'add', 'promote', 'demote', 'mute', 'unmute', 'tagall', 'hidetag', 'mention', 'groupinfo', 'grouplink', 'revokeinvite', 'groupname', 'setdesc', 'groupopen', 'groupclose', 'adminsonly', 'allmembers', 'setppgc', 'poll', 'antilink', 'antidelete', 'anticall', 'antistatus'],
    'MODERATION': ['antilink', 'antilinkwarn', 'antispam', 'antispamwarn', 'moderationconfig'],
    'WELCOME & GOODBYE': ['welcome', 'goodbye', 'welcomeconfig'],
    'NUMBERED BAN / UNBAN PAIRS': ['ban', 'unban', 'ban1', 'unban1', 'ban2', 'unban2', 'ban3', 'unban3', 'ban4', 'unban4', 'ban5', 'unban5', 'ban6', 'unban6', 'ban7', 'unban7', 'ban8', 'unban8', 'ban9', 'unban9', 'ban10', 'unban10', 'ban11', 'unban11', 'ban12', 'unban12', 'ban13', 'unban13', 'ban14', 'unban14', 'ban15', 'unban15', 'ban16', 'unban16', 'ban17', 'unban17', 'ban18', 'unban18', 'ban19', 'unban19', 'ban20', 'unban20', 'ban21', 'unban21', 'ban22', 'unban22', 'ban23', 'unban23', 'ban24', 'unban24', 'ban25', 'unban25', 'ban26', 'unban26', 'ban27', 'unban27', 'ban28', 'unban28', 'ban29', 'unban29', 'ban30', 'unban30', 'ban31', 'unban31', 'ban32', 'unban32', 'ban33', 'unban33', 'ban34', 'unban34', 'ban35', 'unban35', 'ban36', 'unban36', 'ban37', 'unban37', 'ban38', 'unban38', 'ban39', 'unban39', 'ban40', 'unban40', 'ban41', 'unban41', 'ban42', 'unban42', 'ban43', 'unban43', 'ban44', 'unban44', 'ban45', 'unban45', 'ban46', 'unban46', 'ban47', 'unban47', 'ban48', 'unban48', 'ban49', 'unban49', 'ban50', 'unban50'],

    'MEDIA & DOWNLOADS': ['song', 'play', 'ytmp3', 'video', 'ytmp4', 'insta', 'igdl', 'tiktok', 'ttdl', 'facebook', 'fbdown', 'youtube', 'pinterest', 'pindl', 'twitter', 'twtdl', 'reddit', 'reddown', 'spotify', 'spdl', 'mf', 'apk', 'gdrive'],
    'CUSTOM DOWNLOADS': ['downloadmenu', 'directdl', 'urldl', 'download', 'customdl', 'audiourl', 'videourl', 'imagedl', 'docdl'],
    'MEDIA UTILITIES': ['thumbnail', 'lyrics', 'sticker', 'toimg', 'tomp3', 'shorturl'],
    'AI & FUN': ['ai', 'itachi', 'about', 'rules', 'fortune', 'compatibility', 'itachifact', 'battle', 'prediction', 'shinobiquiz', 'roastme', 'praise', 'gali', 'joke', 'meme', 'dare', 'truth', 'ascii', 'roast', 'compliment', 'ship', 'quote', 'fact', 'trivia', 'coinflip', 'roll', '8ball', 'choose', 'motivate'],
    'ITACHI CHAT': ['itachi', 'itachiauto', 'itachiconfig'],
    'DPZ PROFILES & POETRY': ['dpz', 'dpboys', 'dpgirls', 'dpzconfig', 'sadpoetry', 'romanticpoetry'],
    'ITACHI RANKING': ['rank', 'profile', 'leaderboard', 'level', 'levelconfig'],
    'FONTS & TEXT': ['fonts', 'font1', 'font2', 'font3', 'font4', 'font5', 'font6', 'font7', 'font8', 'font9', 'font10', 'font11', 'font12', 'font13', 'font14', 'font15', 'font16', 'font17', 'font18', 'font19', 'font20', 'font21', 'font22', 'font23', 'font24', 'font25', 'font26', 'font27', 'font28', 'font29', 'font30', 'font31', 'font32', 'font33', 'font34', 'font35', 'font36', 'font37', 'font38', 'font39', 'font40', 'font41', 'font42', 'font43', 'font44', 'font45', 'font46', 'font47', 'font48', 'font49', 'font50'],
    'DISCOVERY & PRODUCTIVITY': ['news', 'movie', 'manga', 'lyrics', 'morse', 'remind', 'timer', 'tagme', 'listonline', 'snipe', 'editmsg', 'react'],
    'TOOLS': ['ping', 'time', 'date', 'chatid', 'randomtool', 'timestamp', 'urlencode', 'hextext', 'jsonfmt', 'textstats', 'countdown', 'password', 'uuid', 'color', 'dice', 'dp', 'vv', 'translate', 'base64', 'qr', 'shorturl', 'calc', 'weather', 'github', 'ipinfo', 'whois', 'dnslookup', 'screenshot', 'define', 'google', 'wiki', 'yts', 'playstore', 'npm', 'sticker', 'toimg', 'tomp3', 'tts', 'runtime', 'uptime', 'serverinfo', 'speedtest'],
    'CHANNEL SETTINGS': ['channel', 'setchannel', 'removechannel', 'clearchannel'],
    'ISLAMIC': ['quran', 'hadith', 'prayer', 'qibla', 'asmaulhusna']
};

const COMMAND_DESCRIPTIONS = {
    ownerhelp: 'Show owner-only commands',
    botinfo: 'Show bot runtime and system details',
    health: 'Check bot health and response status',
    safetymode: 'View or control anti-abuse protection',
    setdesc: 'Change the group description',
    groupopen: 'Allow all members to send messages',
    groupclose: 'Restrict group messages to admins',
    adminsonly: 'Restrict group-info edits to admins',
    allmembers: 'Allow members to edit group info',
    grouplink: 'Generate the group invite link',
    revokeinvite: 'Revoke the current group invite link',
    groupid: 'Show the current group JID',
    mention: 'Mention a user with a custom message',
    about: 'Show bot identity and Itachi branding',
    rules: 'Display the Itachi realm rules',
    chatid: 'Show the current chat JID',
    randomtool: 'Generate a random number in a range',
    timestamp: 'Convert a date to Unix and ISO time',
    urlencode: 'URL-encode text for safe links',
    hextext: 'Convert text into hexadecimal',
    jsonfmt: 'Validate and format JSON text',
    textstats: 'Count text characters, words, lines, and bytes',
    fortune: 'Receive a Itachi-themed fortune',
    compatibility: 'Check your shinobi compatibility score',
    itachifact: 'Receive Itachi-themed wisdom',
    battle: 'Start a random shinobi battle',
    prediction: 'Ask the realm for a prediction',
    shinobiquiz: 'Get a Itachi-themed shinobi quiz',
    roastme: 'Receive a playful Itachi roast',
    praise: 'Receive Itachi-themed praise',
    gali: 'Send one of 100 playful Itachi roast lines',
    song: 'Download audio as MP3',
    play: 'Search and download music as MP3',
    ytmp3: 'YouTube audio shortcut',
    video: 'Download video media',
    ytmp4: 'YouTube video shortcut',
    insta: 'Download Instagram media',
    igdl: 'Instagram download shortcut',
    tiktok: 'Download TikTok media',
    ttdl: 'TikTok download shortcut',
    facebook: 'Download Facebook media',
    fbdown: 'Facebook download shortcut',
    youtube: 'Download YouTube media',
    pinterest: 'Search and download Pinterest images',
    pindl: 'Pinterest download shortcut',
    twitter: 'Download X/Twitter media',
    twtdl: 'X/Twitter download shortcut',
    reddit: 'Download Reddit media',
    reddown: 'Reddit download shortcut',
    spotify: 'Download Spotify audio',
    spdl: 'Spotify download shortcut',
    mf: 'Download MediaFire files',
    apk: 'Search and download APK files',
    gdrive: 'Download Google Drive files',
    directdl: 'Download a public direct media URL',
    urldl: 'Direct URL download shortcut',
    download: 'Direct URL download shortcut',
    downloadmenu: 'Show the complete download arsenal',
    customdl: 'Custom direct media downloader',
    audiourl: 'Download a public audio URL',
    videourl: 'Download a public video URL',
    imagedl: 'Download a public image URL',
    docdl: 'Download a public document URL',
    thumbnail: 'Download a YouTube thumbnail',
    lyrics: 'Find song lyrics',
    sticker: 'Create a sticker from media',
    toimg: 'Convert media to image',
    tomp3: 'Convert media to MP3',
    shorturl: 'Shorten a long URL'
};

function formatCommands(commands) {
    return commands.map(command => `┃ .${command}`).join('\n');
}

function buildMenuText(session, registeredCommands = {}) {
    const sections = [];
    let total = 0;

    for (const [title, candidates] of Object.entries(MENU_GROUPS)) {
        const available = candidates.filter(command => typeof registeredCommands[command] === 'function');
        if (!available.length) continue;
        total += available.length;
        sections.push(`┏━━ ${title} ━━┓\n${formatCommands(available)}\n┗━━━━━━━━━━━━┛`);
    }

    return [
        `╭━━━〔 *${settings.botName}* 〕━━━╮`,
        '┃ *COMMAND MENU*',
        `┃ Prefix: ${settings.prefix}`,
        `┃ Active commands: ${total}`,
        '╰━━━━━━━━━━━━━━━━━━━━╯',
        '',
        ...sections,
        '',
        `Use *${settings.prefix}help* for guidance.`,
        `Owner: *${settings.ownerName}*`,
        `POWERED BY ${settings.poweredBy}`
    ].join('\n\n');
}

async function allMenu(sock, from, msg, session, registeredCommands = {}) {
    const menuText = buildMenuText(session, registeredCommands);
    const image = getMenuImage();
    try {
        // Send the startup artwork first, then the complete command list below it.
        await sock.sendMessage(from, { image }, { quoted: msg });
        await sock.sendMessage(from, { text: menuText }, { quoted: msg });
    } catch (error) {
        await sock.sendMessage(from, { text: menuText }, { quoted: msg });
    }
}

module.exports = allMenu;
module.exports.MENU_GROUPS = MENU_GROUPS;
module.exports.buildMenuText = buildMenuText;
