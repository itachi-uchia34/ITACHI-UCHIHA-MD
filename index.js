require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, downloadContentFromMessage, jidNormalizedUser, Browsers, delay } = require('@whiskeysockets/baileys');
const P = require('pino');
const { OpenAI } = require('openai');
const os = require('os');
const QRCode = require('qrcode');
const { applyAntiAbuse } = require('./lib/anti_abuse');
// =================== OWNER CHANNEL CONFIG ===================
// Put your own WhatsApp Channel JID here, or set OWNER_CHANNEL_JID in .env.
// Example: 120363123456789012@newsletter
const OWNER_CHANNEL_JID = process.env.OWNER_CHANNEL_JID || '';
const STARTUP_AUDIO_PATH = path.join(__dirname, 'song.mp3');

function readStartupAudio() {
    try {
        if (!fs.existsSync(STARTUP_AUDIO_PATH)) return null;
        const audio = fs.readFileSync(STARTUP_AUDIO_PATH);
        if (audio.length < 4096) return null;
        const hasId3 = audio.subarray(0, 3).toString('ascii') === 'ID3';
        const hasFrameSync = audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0;
        return hasId3 || hasFrameSync ? audio : null;
    } catch (_) {
        return null;
    }
}

// Import all commands
const commands = {
    // Media & Download
    song: require('./commands/song'),
    play: require('./commands/song'),
    downloadmenu: require('./commands/downloadmenu'),
    directdl: require('./commands/directdl'),
    urldl: require('./commands/directdl'),
    download: require('./commands/directdl'),
    customdl: require('./commands/directdl'),
    audiourl: require('./commands/directdl'),
    videourl: require('./commands/directdl'),
    imagedl: require('./commands/directdl'),
    docdl: require('./commands/directdl'),
    thumbnail: require('./commands/thumbnail'),
    ytmp3: require('./commands/song'),
    ytmp4: require('./commands/video'),
    igdl: require('./commands/insta'),
    ttdl: require('./commands/tiktok'),
    fbdown: require('./commands/facebook'),
    pindl: require('./commands/pinterest'),
    twtdl: require('./commands/twitter'),
    reddown: require('./commands/reddit'),
    spdl: require('./commands/spotify'),
    video: require('./commands/video'),
    insta: require('./commands/insta'),
    tiktok: require('./commands/tiktok'),
    facebook: require('./commands/facebook'),
    youtube: require('./commands/youtube'),
    pinterest: require('./commands/pinterest'),
    twitter: require('./commands/twitter'),
    reddit: require('./commands/reddit'),
    spotify: require('./commands/spotify'),
    mediafire: require('./commands/mf'),
    apk: require('./commands/apk'),
    gdrive: require('./commands/gdrive'),
    mf: require('./commands/mf'),
   
    // Group Management
    kick: require('./commands/kick'),
    ban: require('./commands/ban'),
    ban1: require('./commands/ban'),
    ban2: require('./commands/ban'),
    ban3: require('./commands/ban'),
    ban4: require('./commands/ban'),
    ban5: require('./commands/ban'),
    ban6: require('./commands/ban'),
    ban7: require('./commands/ban'),
    ban8: require('./commands/ban'),
    ban9: require('./commands/ban'),
    ban10: require('./commands/ban'),
    ban11: require('./commands/ban'),
    ban12: require('./commands/ban'),
    ban13: require('./commands/ban'),
    ban14: require('./commands/ban'),
    ban15: require('./commands/ban'),
    ban16: require('./commands/ban'),
    ban17: require('./commands/ban'),
    ban18: require('./commands/ban'),
    ban19: require('./commands/ban'),
    ban20: require('./commands/ban'),
    ban21: require('./commands/ban'),
    ban22: require('./commands/ban'),
    ban23: require('./commands/ban'),
    ban24: require('./commands/ban'),
    ban25: require('./commands/ban'),
    ban26: require('./commands/ban'),
    ban27: require('./commands/ban'),
    ban28: require('./commands/ban'),
    ban29: require('./commands/ban'),
    ban30: require('./commands/ban'),
    ban31: require('./commands/ban'),
    ban32: require('./commands/ban'),
    ban33: require('./commands/ban'),
    ban34: require('./commands/ban'),
    ban35: require('./commands/ban'),
    ban36: require('./commands/ban'),
    ban37: require('./commands/ban'),
    ban38: require('./commands/ban'),
    ban39: require('./commands/ban'),
    ban40: require('./commands/ban'),
    ban41: require('./commands/ban'),
    ban42: require('./commands/ban'),
    ban43: require('./commands/ban'),
    ban44: require('./commands/ban'),
    ban45: require('./commands/ban'),
    ban46: require('./commands/ban'),
    ban47: require('./commands/ban'),
    ban48: require('./commands/ban'),
    ban49: require('./commands/ban'),
    ban50: require('./commands/ban'),
    unban: require('./commands/unban'),
    unban1: require('./commands/unban'),
    unban2: require('./commands/unban'),
    unban3: require('./commands/unban'),
    unban4: require('./commands/unban'),
    unban5: require('./commands/unban'),
    unban6: require('./commands/unban'),
    unban7: require('./commands/unban'),
    unban8: require('./commands/unban'),
    unban9: require('./commands/unban'),
    unban10: require('./commands/unban'),
    unban11: require('./commands/unban'),
    unban12: require('./commands/unban'),
    unban13: require('./commands/unban'),
    unban14: require('./commands/unban'),
    unban15: require('./commands/unban'),
    unban16: require('./commands/unban'),
    unban17: require('./commands/unban'),
    unban18: require('./commands/unban'),
    unban19: require('./commands/unban'),
    unban20: require('./commands/unban'),
    unban21: require('./commands/unban'),
    unban22: require('./commands/unban'),
    unban23: require('./commands/unban'),
    unban24: require('./commands/unban'),
    unban25: require('./commands/unban'),
    unban26: require('./commands/unban'),
    unban27: require('./commands/unban'),
    unban28: require('./commands/unban'),
    unban29: require('./commands/unban'),
    unban30: require('./commands/unban'),
    unban31: require('./commands/unban'),
    unban32: require('./commands/unban'),
    unban33: require('./commands/unban'),
    unban34: require('./commands/unban'),
    unban35: require('./commands/unban'),
    unban36: require('./commands/unban'),
    unban37: require('./commands/unban'),
    unban38: require('./commands/unban'),
    unban39: require('./commands/unban'),
    unban40: require('./commands/unban'),
    unban41: require('./commands/unban'),
    unban42: require('./commands/unban'),
    unban43: require('./commands/unban'),
    unban44: require('./commands/unban'),
    unban45: require('./commands/unban'),
    unban46: require('./commands/unban'),
    unban47: require('./commands/unban'),
    unban48: require('./commands/unban'),
    unban49: require('./commands/unban'),
    unban50: require('./commands/unban'),
    add: require('./commands/add'),
    promote: require('./commands/promote'),
    demote: require('./commands/demote'),
    mute: require('./commands/mute'),
    unmute: require('./commands/unmute'),
    kickoffline: require('./commands/kickoffline'),
    hidetag: require('./commands/hidetag'),
    tagall: require('./commands/tagall'),
    admins: require('./commands/groupplus').admins,
    members: require('./commands/groupplus').members,
    groupstats: require('./commands/groupplus').groupstats,
    groupname: require('./commands/groupplus').groupname,
    setdesc: require('./commands/groupplus').setdesc,
    groupopen: require('./commands/groupplus').groupopen,
    groupclose: require('./commands/groupplus').groupclose,
    adminsonly: require('./commands/groupplus').adminsonly,
    allmembers: require('./commands/groupplus').allmembers,
    grouplink: require('./commands/groupplus').grouplink,
    revokeinvite: require('./commands/groupplus').revokeinvite,
    poll: require('./commands/groupplus').poll,
    grouphelp: require('./commands/groupplus').grouphelp,
    botinfo: require('./commands/ownerplus').botinfo,
    health: require('./commands/ownerplus').health,
    ownerhelp: require('./commands/ownerplus').ownerhelp,
    about: require('./commands/extrasplus').about,
    rules: require('./commands/extrasplus').rules,
    groupid: require('./commands/extrasplus').groupid,
    chatid: require('./commands/extrasplus').chatid,
    mention: require('./commands/extrasplus').mention,
    randomtool: require('./commands/extrasplus').randomtool,
    timestamp: require('./commands/extrasplus').timestamp,
    urlencode: require('./commands/extrasplus').urlencode,
    hextext: require('./commands/extrasplus').hextext,
    jsonfmt: require('./commands/extrasplus').jsonfmt,
    textstats: require('./commands/extrasplus').textstats,
    fortune: require('./commands/funplus').fortune,
    compatibility: require('./commands/funplus').compatibility,
    itachifact: require('./commands/funplus').itachifact,
    battle: require('./commands/funplus').battle,
    prediction: require('./commands/funplus').prediction,
    shinobiquiz: require('./commands/funplus').shinobiquiz,
    roastme: require('./commands/funplus').roastme,
    praise: require('./commands/funplus').praise,
    time: require('./commands/extras').time,
    date: require('./commands/extras').date,
    choose: require('./commands/extras').choose,
    eightball: require('./commands/extras').eightball,
    motivate: require('./commands/extras').motivate,
    password: require('./commands/extras').password,
    uuid: require('./commands/extras').uuid,
    color: require('./commands/extras').color,
    dice: require('./commands/extras').dice,
    countdown: require('./commands/extras').countdown,
    tagadmin: require('./commands/tagadmin'),
    groupinfo: require('./commands/groupinfo'),
    join: require('./commands/join'),
    leave: require('./commands/leave'),
    setppgc: require('./commands/setppgc'),
    getbio: require('./commands/getbio'),
    getdp: require('./commands/getdp'),
    accept: require('./commands/accept'),

    // Admin/Owner
    welcome: require('./commands/welcome').welcomeCommand,
    goodbye: require('./commands/welcome').goodbyeCommand,
    welcomeconfig: require('./commands/welcome').configCommand,
    private: require('./commands/private'),
    public: require('./commands/public'),
    owner: require('./commands/owner'),
    setname: require('./commands/setname'),
    block: require('./commands/block'),
    unblock: require('./commands/unblock'),
    bcgc: require('./commands/bcgc'),
    bcall: require('./commands/bcall'),
    restart: require('./commands/restart'),
    shutdown: require('./commands/shutdown'),
    mode: require('./commands/mode'),

    // Protection
    antilink: require('./commands/moderation').antiLinkCommand,
    antispam: require('./commands/moderation').antiSpamCommand,
    antilinkwarn: require('./commands/moderation').antiLinkWarningCommand,
    antispamwarn: require('./commands/moderation').antiSpamWarningCommand,
    moderationconfig: require('./commands/moderation').moderationConfig,
    anticall: require('./commands/anticall'),
    antidelete: require('./commands/antidelete'),
    antistatus: require('./commands/antistatus'),

    // Status/Auto Features
    status: require('./commands/status'),
    autostatus: require('./commands/status'),
    autoreacts: require('./commands/autoreacts'),
    jidfooter: require('./commands/jidfooter'),
    autoread: require('./commands/autoread').autoreadCommand,

    // AI
    ai: require('./commands/ai'),
    itachi: require('./commands/itachichat').itachiCommand,
    rank: require('./commands/levels').rankCommand,
    profile: require('./commands/levels').rankCommand,
    leaderboard: require('./commands/levels').leaderboardCommand,
    level: require('./commands/levels').levelCommand,
    levelconfig: require('./commands/levels').levelConfigCommand,
    itachiauto: require('./commands/itachichat').itachiAutoCommand,
    itachiconfig: require('./commands/itachichat').itachiConfig,

    // Fun
    joke: require('./commands/joke'),
    meme: require('./commands/meme'),
    dare: require('./commands/dare'),
    truth: require('./commands/truth'),
    ascii: require('./commands/ascii'),
    fonts: require('./commands/fonts').fonts,
    font1: require('./commands/fonts').font1,
    font2: require('./commands/fonts').font2,
    font3: require('./commands/fonts').font3,
    font4: require('./commands/fonts').font4,
    font5: require('./commands/fonts').font5,
    font6: require('./commands/fonts').font6,
    font7: require('./commands/fonts').font7,
    font8: require('./commands/fonts').font8,
    font9: require('./commands/fonts').font9,
    font10: require('./commands/fonts').font10,
    font11: require('./commands/fonts').font11,
    font12: require('./commands/fonts').font12,
    font13: require('./commands/fonts').font13,
    font14: require('./commands/fonts').font14,
    font15: require('./commands/fonts').font15,
    font16: require('./commands/fonts').font16,
    font17: require('./commands/fonts').font17,
    font18: require('./commands/fonts').font18,
    font19: require('./commands/fonts').font19,
    font20: require('./commands/fonts').font20,
    font21: require('./commands/fonts').font21,
    font22: require('./commands/fonts').font22,
    font23: require('./commands/fonts').font23,
    font24: require('./commands/fonts').font24,
    font25: require('./commands/fonts').font25,
    font26: require('./commands/fonts').font26,
    font27: require('./commands/fonts').font27,
    font28: require('./commands/fonts').font28,
    font29: require('./commands/fonts').font29,
    font30: require('./commands/fonts').font30,
    font31: require('./commands/fonts').font31,
    font32: require('./commands/fonts').font32,
    font33: require('./commands/fonts').font33,
    font34: require('./commands/fonts').font34,
    font35: require('./commands/fonts').font35,
    font36: require('./commands/fonts').font36,
    font37: require('./commands/fonts').font37,
    font38: require('./commands/fonts').font38,
    font39: require('./commands/fonts').font39,
    font40: require('./commands/fonts').font40,
    font41: require('./commands/fonts').font41,
    font42: require('./commands/fonts').font42,
    font43: require('./commands/fonts').font43,
    font44: require('./commands/fonts').font44,
    font45: require('./commands/fonts').font45,
    font46: require('./commands/fonts').font46,
    font47: require('./commands/fonts').font47,
    font48: require('./commands/fonts').font48,
    font49: require('./commands/fonts').font49,
    font50: require('./commands/fonts').font50,
    roast: require('./commands/roast'),
    compliment: require('./commands/compliment'),
    ship: require('./commands/ship'),
    emojimix: require('./commands/emojimix'),
    character: require('./commands/character'),
    quote: require('./commands/quote'),
    fact: require('./commands/fact'),
    trivia: require('./commands/trivia'),
    coinflip: require('./commands/coinflip'),
    roll: require('./commands/roll'),
    riddle: require('./commands/riddle'),
    wouldyourather: require('./commands/wouldyourather'),
    sadpoetry: require('./commands/poetry').sadPoetryCommand,
    romanticpoetry: require('./commands/poetry').romanticPoetryCommand,

    // Tools
    ping: require('./commands/ping'),
    dp: require('./commands/dp'),
    dpz: require('./commands/dpz').dpzCommand,
    dpzconfig: require('./commands/dpz').dpzConfigCommand,
    dpboys: require('./commands/dpz').dpBoysCommand,
    dpgirls: require('./commands/dpz').dpGirlsCommand,
    setchannel: require('./commands/channel').setChannelCommand,
    channel: require('./commands/channel').channelCommand,
    removechannel: require('./commands/channel').removeChannelCommand,
    vv: require('./commands/vv'),
    translate: require('./commands/translate').handleTranslateCommand,
    base64: require('./commands/base64'),
    qr: require('./commands/qr'),
    shorturl: require('./commands/shorturl'),
    calc: require('./commands/calc'),
    weather: require('./commands/weather'),
    github: require('./commands/github'),
    ipinfo: require('./commands/ipinfo'),
    tempmail: require('./commands/tempmail'),
    fakeinfo: require('./commands/fakeinfo'),
    binlookup: require('./commands/binlookup'),
    whois: require('./commands/whois'),
    dnslookup: require('./commands/dnslookup'),
    screenshot: require('./commands/screenshot'),
    define: require('./commands/define'),
    google: require('./commands/google'),
    wiki: require('./commands/wiki'),
    yts: require('./commands/yts'),
    playstore: require('./commands/playstore'),
    npm: require('./commands/npm'),
    sticker: require('./commands/sticker'),
    toimg: require('./commands/toimg'),
    tomp3: require('./commands/tomp3'),
    tts: require('./commands/tts'),
    blur: require('./commands/blur'),
    invert: require('./commands/invert'),
    crop: require('./commands/crop'),
    flip: require('./commands/flip'),
    grayscale: require('./commands/grayscale'),
    removebg: require('./commands/removebg'),
    enlarge: require('./commands/enlarge'),

    // Dangerous / Khatarnak
    hack: require('./commands/hack'),
    repo: require('./commands/repo'),
    ghostmode: require('./commands/ghostmode'),
    antibug: require('./commands/antibug'),

    // Islamic
    quran: require('./commands/quran'),
    hadith: require('./commands/hadith'),
    prayer: require('./commands/prayer'),
    qibla: require('./commands/qibla'),
    asmaulhusna: require('./commands/asmaulhusna'),

    // System Info
    uptime: require('./commands/uptime'),
    serverinfo: require('./commands/serverinfo'),
    speedtest: require('./commands/speedtest'),
    device: require('./commands/device'),
    runtime: require('./commands/runtime'),

    // Other
    remind: require('./commands/remind'),
    timer: require('./commands/timer'),
    morse: require('./commands/morse'),
    binary: require('./commands/binary'),
    hex: require('./commands/hex'),
    pastebin: require('./commands/pastebin'),
    news: require('./commands/news'),
    crypto: require('./commands/crypto'),
    movie: require('./commands/movie'),
    anime: require('./commands/anime'),
    manga: require('./commands/manga'),
    lyrics: require('./commands/lyrics'),
    chatbot: require('./commands/chatbot'),
    snipe: require('./commands/snipe'),
    editmsg: require('./commands/editmsg'),
    react: require('./commands/react'),
    send: require('./commands/send'),
    forward: require('./commands/forward'),
    clear: require('./commands/clear'),
    save: require('./commands/save'),
    get: (sock, from, msg) => sock.sendMessage(from, { text: "❌ The 'get' command is not implemented yet." }, { quoted: msg }),
    backup: require('./commands/backup'),
    restore: require('./commands/restore'),
    clone: require('./commands/clone'),
    tagme: require('./commands/tagme'),
    everyonemsg: require('./commands/everyonemsg'),
    listonline: require('./commands/listonline'),
    mycmd: require('./commands/mycmd'),
    gali: require('./commands/gali'),
    safetymode: require('./commands/antisafety').safetymode,
};

const { handleAutoread } = require('./commands/autoread');
const { handleStatusUpdate } = require('./commands/autostatus');
const { storeMessage, handleMessageRevocation, handleSnipe } = require('./commands/antidelete');

const app = express();
const server = http.createServer(app);

// Telegram Bot Setup (optional; WhatsApp pairing does not depend on it)
const telegramEnabled = String(process.env.TELEGRAM_NOTIFY_ENABLED || 'true').toLowerCase() !== 'false';
const tgToken = telegramEnabled ? process.env.TELEGRAM_BOT_TOKEN : null;
if (telegramEnabled && !tgToken) {
    console.warn('[Optional] Telegram notifications disabled: TELEGRAM_BOT_TOKEN is not configured.');
}

const tgBot = tgToken ? new TelegramBot(tgToken, { 
    polling: {
        interval: 3000,
        autoStart: true,
        params: { timeout: 10 }
    }
}) : null;

if (tgBot) {
    tgBot.on('polling_error', (error) => {
        console.log('Telegram polling error:', error.message);
        if (error.message && (error.message.includes('409') || error.message.includes('Conflict'))) {
            console.log('Another instance detected. Stopping this instance...');
            tgBot.stopPolling();
        }
        if (error.message && error.message.includes('401')) {
            console.log('Telegram Token is invalid (401 Unauthorized).');
            tgBot.stopPolling();
        }
    });
}

// Import settings
const settings = require('./settings');
const { applyItachiStyle } = require('./itachi_style');

// Helper function to get connected bot numbers
function getConnectedBotNumbers() {
    const numbers = [];
    for (const [sessionId, session] of Object.entries(sessions)) {
        if (session.sock && session.sock.user) {
            const num = jidNormalizedUser(session.sock.user.id).split('@')[0];
            numbers.push(num);
        }
    }
    return numbers;
}

// Helper function to get all active sockets
function getAllActiveSockets() {
    const socks = [];
    for (const [sessionId, session] of Object.entries(sessions)) {
        if (session.sock && session.isConnected) {
            socks.push({ sock: session.sock, sessionId, phoneNumber: session.phoneNumber });
        }
    }
    return socks;
}

// Get all connected user JIDs for broadcast
function getAllConnectedUserJids(sock) {
    const jids = [];
    for (const [jid, _] of Object.entries(sock.chats || {})) {
        if (jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us')) {
            jids.push(jid);
        }
    }
    return jids;
}

// Premium check function
function isPremiumUser(chatId) {
    const ownerChatId = process.env.OWNER_TELEGRAM_ID || settings.tgOwnerId;
    if (chatId.toString() === ownerChatId) return true;
    if (settings.premiumUsers && settings.premiumUsers.includes(chatId.toString())) return true;
    return false;
}

// Owner check for Telegram
function isTgOwner(chatId) {
    const ownerChatId = process.env.OWNER_TELEGRAM_ID || settings.tgOwnerId;
    return chatId.toString() === ownerChatId;
}

// =================== TELEGRAM BOT (ONLY PAIRING + PREMIUM + OWNER-ONLY STATUS) ===================
if (tgBot) {
    tgBot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const isOwner = isTgOwner(chatId);
        
        const welcomeMessage = 
            `\u{25EC}\u{2501}\u{2501}\u{2501}\u{3008} *ITACHI UCHIHA MD* \u{3009}\u{2501}\u{2501}\u{2501}\u{25EC}\n\n` +
            `*\u{1F311} LUXURY WHATSAPP AUTOMATION* \u{1F311}\n\n` +
            `Welcome to the most premium WhatsApp bot experience.\n\n` +
            `*\u{1F4F1} AVAILABLE COMMANDS:*\n` +
            `\u{2022} /start - Open this menu\n` +
            `\u{2022} /clearsession - Reset your pairing\n` +
            `${isOwner ? `\u{2022} /status - Bot overall status\n` : ''}` +
            `${isOwner ? `\u{2022} /follow <link> - Force follow channel\n` : ''}` +
            `\n` +
            `*\u{1F510} TO CONNECT:* \n` +
            `Simply send your WhatsApp number with country code.\n` +
            `Example: \`923271054080\`\n\n` +
            `> © POWERED BY ALI HAIDER ®`;

        try {
            await tgBot.sendPhoto(chatId, settings.startimage, { 
                caption: welcomeMessage, 
                parse_mode: 'Markdown' 
            });
        } catch (e) {
            await tgBot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
        }
    });

    // Clear Session Command
    tgBot.onText(/\/clearsession/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = `tg_${chatId}`;
        
        if (sessions[userId]) {
            if (sessions[userId].sock) {
                try { await sessions[userId].sock.logout(); } catch(e) {}
            }
            const authPath = sessions[userId].authPath;
            if (fs.existsSync(authPath)) {
                fs.removeSync(authPath);
            }
            delete sessions[userId];
            await tgBot.sendMessage(chatId, `\u{1F5D1}\u{FE0F} *Session cleared!* You can now pair a new number.`, { parse_mode: 'Markdown' });
        } else {
            await tgBot.sendMessage(chatId, `\u{26A0}\u{FE0F} No active session found to clear.`, { parse_mode: 'Markdown' });
        }
    });

    // Follow Command - OWNER ONLY
    tgBot.onText(/\/follow (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!isTgOwner(chatId)) return;
        
        const channelLink = match[1].trim();
        const activeSocks = getAllActiveSockets();
        
        await tgBot.sendMessage(chatId, `\u{1F504} *Initiating Mass Follow...*\nTarget: ${channelLink}\nBots: ${activeSocks.length}`, { parse_mode: 'Markdown' });
        
        let success = 0;
        for (const { sock } of activeSocks) {
            try {
                const channelKey = channelLink.split('/channel/')[1] || channelLink.split('/').pop();
                const metadata = await sock.newsletterMetadata('invite', channelKey, 'GUEST');
                if (metadata && metadata.id) {
                    await sock.newsletterFollow(metadata.id);
                    success++;
                }
            } catch (e) {}
        }
        
        await tgBot.sendMessage(chatId, `\u{2705} *Mass Follow Complete!*\nSuccessfully followed: ${success}/${activeSocks.length}`, { parse_mode: 'Markdown' });
    });

    // Status command - OWNER ONLY
    tgBot.onText(/\/status/, async (msg) => {
        const chatId = msg.chat.id;
        
        if (!isTgOwner(chatId)) {
            return tgBot.sendMessage(chatId, "\u{274C} *Owner only command!*", { parse_mode: 'Markdown' });
        }
        
        const connectedCount = Object.values(sessions).filter(s => s.isConnected).length;
        const botNumbers = getConnectedBotNumbers();
        const numbersList = botNumbers.length > 0 ? botNumbers.join('\n') : 'None';

        const statusMsg = 
            `\u{25EC}\u{2501}\u{2501}\u{2501}\u{3008} *ITACHI UCHIHA MD STATUS* \u{3009}\u{2501}\u{2501}\u{2501}\u{25EC}\n\n` +
            `\u{1F4F1} *Connected Bots:* ${connectedCount}\n` +
            `\u{26A1} *Total Sessions:* ${Object.keys(sessions).length}\n\n` +
            `\u{1F522} *Active Numbers:*\n\`${numbersList}\`\n\n` +
            `> © POWERED BY ALI HAIDER ®`;

        await tgBot.sendMessage(chatId, statusMsg, { parse_mode: 'Markdown' });
    });

    tgBot.onText(/\/addpremium (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!isTgOwner(chatId)) {
            return tgBot.sendMessage(chatId, "\u{274C} *Owner only command!*", { parse_mode: 'Markdown' });
        }
        const targetId = match[1].trim();
        if (!settings.premiumUsers.includes(targetId)) {
            settings.premiumUsers.push(targetId);
            await tgBot.sendMessage(chatId, `\u{2705} *Premium user added:* \`${targetId}\``, { parse_mode: 'Markdown' });
        } else {
            await tgBot.sendMessage(chatId, `\u{26A0}\u{FE0F} User already premium: \`${targetId}\``, { parse_mode: 'Markdown' });
        }
    });

    tgBot.onText(/\/removepremium (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!isTgOwner(chatId)) {
            return tgBot.sendMessage(chatId, "\u{274C} *Owner only command!*", { parse_mode: 'Markdown' });
        }
        const targetId = match[1].trim();
        const idx = settings.premiumUsers.indexOf(targetId);
        if (idx > -1) {
            settings.premiumUsers.splice(idx, 1);
            await tgBot.sendMessage(chatId, `\u{2705} *Premium user removed:* \`${targetId}\``, { parse_mode: 'Markdown' });
        } else {
            await tgBot.sendMessage(chatId, `\u{26A0}\u{FE0F} User not found in premium list: \`${targetId}\``, { parse_mode: 'Markdown' });
        }
    });

    tgBot.onText(/\/listpremium/, async (msg) => {
        const chatId = msg.chat.id;
        if (!isTgOwner(chatId)) {
            return tgBot.sendMessage(chatId, "\u{274C} *Owner only command!*", { parse_mode: 'Markdown' });
        }
        const list = settings.premiumUsers.length > 0 ? settings.premiumUsers.join('\n') : 'None';
        await tgBot.sendMessage(chatId, `\u{1F451} *Premium Users:*\n\n${list}`, { parse_mode: 'Markdown' });
    });

    // Pairing handler - when user sends a number
    tgBot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (!text || text.startsWith('/')) return;

        if (/^\d+$/.test(text)) {
            const userId = chatId.toString();
            if (!sessions[userId]) {
                sessions[userId] = new BotSession(userId);
            }

            if (!botData.statusSettings[userId]) {
                botData.statusSettings[userId] = { 
                    autoStatus: false,
                    autoSeen: false,
                    autoLike: false,
                    autoDownload: false,
                    isPublic: false
                };
                saveBotData();
            }

            const initMsg = 
                `\u{25EC}\u{2501}\u{2501}\u{2501}\u{3008} *ITACHI UCHIHA MD PAIRING* \u{3009}\u{2501}\u{2501}\u{2501}\u{25EC}\n\n` +
                `*\u{1F504} REQUESTING CODE...*\n` +
                `Target Number: \`${text}\`\n\n` +
                `_Please wait a few seconds..._`;

            await tgBot.sendMessage(chatId, initMsg, { parse_mode: 'Markdown' });
            sessions[userId].tgChatId = chatId;
            await sessions[userId].initialize(text);
        }
    });
}


// =================== WEB DASHBOARD SOCKET.IO ===================
const io = socketIo(server, {
    cors: { origin: "*" },
    transports: ['websocket', 'polling']
});

let openai = null;
if (process.env.OPENAI_API_KEY) {
    try {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1"
        });
    } catch (e) {}
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const AUTH_DIR = process.env.SESSION_DIR || './auth_info';
const DATA_FILE = './data/bot_data.json';
fs.ensureDirSync(AUTH_DIR);

// Cache the Baileys version across sessions so a deployment with multiple accounts
// does not perform a slow version lookup for every socket initialization.
// This matches the version bundled with the installed Baileys release and keeps
// pairing usable even when the remote version endpoint is unavailable.
const LOCAL_BAILEYS_VERSION = [2, 3000, 1035194821];
let cachedBaileysVersion = null;
let baileysVersionRequest = null;
async function getBaileysVersion() {
    if (cachedBaileysVersion) return cachedBaileysVersion;
    if (!baileysVersionRequest) {
        const lookup = Promise.race([
            fetchLatestBaileysVersion(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Baileys version lookup timed out')), 4000))
        ]).then(result => result.version).catch(error => {
            console.warn(`[System] ${error.message}; using bundled Baileys version.`);
            return LOCAL_BAILEYS_VERSION;
        });
        baileysVersionRequest = lookup.then(version => {
            cachedBaileysVersion = version;
            return version;
        }).finally(() => { baileysVersionRequest = null; });
    }
    return baileysVersionRequest;
}
fs.ensureDirSync('./data');

let botData = { antilinkGroups: {}, moderationGroups: {}, itachiAutoReplies: {}, levelSettings: {}, levelProfiles: {}, jidFooters: {}, totalBots: 0, registeredBots: [], statusSettings: {}, antiDelete: {}, userNames: {}, antiCall: {}, welcomeSettings: {}, dpzSettings: {}, channelSettings: {}, broadcastHistory: [] };
if (fs.existsSync(DATA_FILE)) {
    try { botData = fs.readJsonSync(DATA_FILE); } catch (e) {}
}

function saveBotData() {
    fs.writeJsonSync(DATA_FILE, botData);
}

const sessions = {}; 
const userSockets = {}; 
const messageLogs = {}; 

// Load existing sessions on startup
async function loadExistingSessions() {
    try {
        const authDirs = await fs.readdir(AUTH_DIR);
        for (const userId of authDirs) {
            const authPath = path.join(AUTH_DIR, userId);
            const stats = await fs.stat(authPath);
            if (stats.isDirectory()) {
                const credsFile = path.join(authPath, 'creds.json');
                if (fs.existsSync(credsFile)) {
                    console.log(`[System] Found existing session for: ${userId}. Initializing...`);
                    if (!sessions[userId]) {
                        sessions[userId] = new BotSession(userId);
                        sessions[userId].initialize().catch(err => {
                            console.error(`[System] Failed to auto-initialize session ${userId}:`, err.message);
                        });
                    }
                }
            }
        }
    } catch (err) {
        console.error('[System] Error loading existing sessions:', err.message);
    }
}

// Bold font converter
const toBold = (text) => {
    const boldChars = {
        'a': '\u{1D5EE}', 'b': '\u{1D5EF}', 'c': '\u{1D5F0}', 'd': '\u{1D5F1}', 'e': '\u{1D5F2}', 'f': '\u{1D5F3}', 'g': '\u{1D5F4}', 'h': '\u{1D5F5}', 'i': '\u{1D5F6}', 'j': '\u{1D5F7}', 'k': '\u{1D5F8}', 'l': '\u{1D5F9}', 'm': '\u{1D5FA}', 'n': '\u{1D5FB}', 'o': '\u{1D5FC}', 'p': '\u{1D5FD}', 'q': '\u{1D5FE}', 'r': '\u{1D5FF}', 's': '\u{1D600}', 't': '\u{1D601}', 'u': '\u{1D602}', 'v': '\u{1D603}', 'w': '\u{1D604}', 'x': '\u{1D605}', 'y': '\u{1D606}', 'z': '\u{1D607}',
        'A': '\u{1D5D4}', 'B': '\u{1D5D5}', 'C': '\u{1D5D6}', 'D': '\u{1D5D7}', 'E': '\u{1D5D8}', 'F': '\u{1D5D9}', 'G': '\u{1D5DA}', 'H': '\u{1D5DB}', 'I': '\u{1D5DC}', 'J': '\u{1D5DD}', 'K': '\u{1D5DE}', 'L': '\u{1D5DF}', 'M': '\u{1D5E0}', 'N': '\u{1D5E1}', 'O': '\u{1D5E2}', 'P': '\u{1D5E3}', 'Q': '\u{1D5E4}', 'R': '\u{1D5E5}', 'S': '\u{1D5E6}', 'T': '\u{1D5E7}', 'U': '\u{1D5E8}', 'V': '\u{1D5E9}', 'W': '\u{1D5EA}', 'X': '\u{1D5EB}', 'Y': '\u{1D5EC}', 'Z': '\u{1D5ED}',
        '0': '\u{1D7EC}', '1': '\u{1D7ED}', '2': '\u{1D7EE}', '3': '\u{1D7EF}', '4': '\u{1D7F0}', '5': '\u{1D7F1}', '6': '\u{1D7F2}', '7': '\u{1D7F3}', '8': '\u{1D7F4}', '9': '\u{1D7F5}'
    };
    return text.split('').map(c => boldChars[c] || c).join('');
};

// Italic font converter
const toItalic = (text) => {
    const italicChars = {
        'a': '\u{1D608}', 'b': '\u{1D609}', 'c': '\u{1D60A}', 'd': '\u{1D60B}', 'e': '\u{1D60C}', 'f': '\u{1D60D}', 'g': '\u{1D60E}', 'h': '\u{1D60F}', 'i': '\u{1D610}', 'j': '\u{1D611}', 'k': '\u{1D612}', 'l': '\u{1D613}', 'm': '\u{1D614}', 'n': '\u{1D615}', 'o': '\u{1D616}', 'p': '\u{1D617}', 'q': '\u{1D618}', 'r': '\u{1D619}', 's': '\u{1D61A}', 't': '\u{1D61B}', 'u': '\u{1D61C}', 'v': '\u{1D61D}', 'w': '\u{1D61E}', 'x': '\u{1D61F}', 'y': '\u{1D620}', 'z': '\u{1D621}',
        'A': '\u{1D5CE}', 'B': '\u{1D5CF}', 'C': '\u{1D5D0}', 'D': '\u{1D5D1}', 'E': '\u{1D5D2}', 'F': '\u{1D5D3}'
    };
    return text.split('').map(c => italicChars[c] || c).join('');
};

class BotSession {
    constructor(userId) {
        this.userId = userId;
        this.sock = null;
        this.isConnected = false;
        this.aiEnabled = false; 
        this.autoReact = botData.statusSettings[userId]?.autoReact || false;
        this.isPublic = botData.statusSettings[userId]?.isPublic !== undefined ? botData.statusSettings[userId].isPublic : true; 
        this.authPath = path.join(AUTH_DIR, userId);
        this.processedMessages = new Set();
        this.activeInterval = null;
        this.isInitializing = false;
        this.userChats = {}; 
        this.lastConnectMessageTime = null;
        this.phoneNumber = null;
        this.ghostMode = false;
        this.pairingState = 'idle';
        this.pairingNumber = null;
        this.pairingStartedAt = null;
        this.pairingExpiryTimer = null;
        this.pairingCodeIssuedAt = null;
        this.pairingCode = null;
        this.reconnectTimer = null;
        this.reconnectAttempt = 0;
        this.socketGeneration = 0;
    }

    clearPairingTimers() {
        if (this.pairingExpiryTimer) clearTimeout(this.pairingExpiryTimer);
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.pairingExpiryTimer = null;
        this.reconnectTimer = null;
    }

    async closeActiveSocket(reason = 'Restarting pairing session') {
        if (!this.sock) return;
        const oldSocket = this.sock;
        this.sock = null;
        try {
            if (typeof oldSocket.end === 'function') oldSocket.end(new Error(reason));
        } catch (error) {
            this.sendLog(`Previous socket cleanup warning: ${error.message}`, 'warning');
        }
    }

    scheduleReconnect(pairingNumber = null, reason = 'connection recovery') {
        if (this.reconnectTimer || this.isInitializing || this.isConnected) return;
        this.reconnectAttempt = Math.min(this.reconnectAttempt + 1, 6);
        const baseDelay = Math.min(30000, 1000 * (2 ** (this.reconnectAttempt - 1)));
        const jitter = Math.floor(Math.random() * 500);
        const waitMs = baseDelay + jitter;
        this.sendLog(`Scheduling ${reason} in ${waitMs} ms (attempt ${this.reconnectAttempt}).`, 'warning');
        this.reconnectTimer = setTimeout(async () => {
            this.reconnectTimer = null;
            try {
                await this.initialize(pairingNumber);
            } catch (error) {
                this.isInitializing = false;
                this.sendLog(`Reconnect attempt failed: ${error.message}`, 'error');
                this.scheduleReconnect(pairingNumber, 'retry after initialization failure');
            }
        }, waitMs);
    }

    async clearUnregisteredAuth() {
        try {
            if (this.authPath && fs.existsSync(this.authPath)) {
                fs.removeSync(this.authPath);
                this.sendLog('Cleared expired pairing credentials. A fresh request can now be made.', 'info');
            }
        } catch (error) {
            this.sendLog(`Could not clear stale pairing credentials: ${error.message}`, 'warning');
        }
    }

    sendLog(message, type = 'info') {
        const logEntry = { timestamp: new Date().toLocaleTimeString(), message, type };
        const socketId = userSockets[this.userId];
        if (socketId) io.to(socketId).emit('console', logEntry);
        console.log(`[${this.userId}] ${message}`);
    }

    emitPairState(state, extra = {}) {
        const socketId = userSockets[this.userId];
        if (socketId) io.to(socketId).emit('pair-state', { state, user: this.userId, ...extra });
    }

    emitPairError(message, code = 'PAIRING_ERROR') {
        this.pairingState = 'error';
        this.clearPairingTimers();
        this.pairingCode = null;
        this.emitPairState('error', { code, message });
        const socketId = userSockets[this.userId];
        if (socketId) io.to(socketId).emit('pair-error', message);
    }

    sendConnectionStatus() {
        const socketId = userSockets[this.userId];
        if (socketId) {
            io.to(socketId).emit('connection-status', {
                connected: this.isConnected,
                user: this.userId
            });
        }
        io.emit('total-active', Object.values(sessions).filter(s => s.isConnected).length);
    }

    async getAIResponse(userJid, userMessage, systemPrompt = "Helpful assistant.") {
        try {
            // Using a more reliable AI API endpoint
            const apiUrl = `https://api.siputzx.my.id/api/ai/chatgpt?prompt=${encodeURIComponent(systemPrompt)}&text=${encodeURIComponent(userMessage)}`;
            const response = await axios.get(apiUrl);
            
            if (response.data && response.data.status) {
                return response.data.data;
            } else {
                // Fallback to another API if the first one fails
                const fallbackUrl = `https://widipe.com/openai?text=${encodeURIComponent(userMessage)}`;
                const fallbackRes = await axios.get(fallbackUrl);
                if (fallbackRes.data && fallbackRes.data.result) {
                    return fallbackRes.data.result;
                }
                throw new Error("Invalid API response from all sources");
            }
        } catch (error) {
            return "\u{274C} AI Error: " + error.message;
        }
    }

    startActiveCheck() {
        if (this.activeInterval) clearInterval(this.activeInterval);
        this.activeInterval = setInterval(async () => {
            if (this.isConnected && this.sock?.user) {
                try {
                    const botNumber = jidNormalizedUser(this.sock.user.id);
                    await this.sock.sendMessage(botNumber, { 
                        text: "ALI HAIDER ®\n\n_24/7 Active System Working..._"
                    });
                    this.sendLog("24/7 Keep-alive message sent to own DM. \u{2705}", "success");
                } catch (e) {
                    this.sendLog("Keep-alive failed: " + e.message, "error");
                }
            }
        }, 60 * 60 * 1000);
    }

    async initialize(pairingNumber = null) {
        if (this.isInitializing) {
            this.emitPairError('A pairing request is already in progress. Please wait for it to finish.', 'PAIRING_IN_PROGRESS');
            return false;
        }
        if (this.isConnected) {
            this.emitPairError('This device is already connected. Disconnect it before pairing again.', 'ALREADY_CONNECTED');
            return false;
        }
        await this.closeActiveSocket();
        this.isInitializing = true;
        this.pairingState = 'initializing';
        this.pairingCode = null;
        this.pairingCodeIssuedAt = null;
        this.clearPairingTimers();
        this.pairingNumber = pairingNumber ? String(pairingNumber).replace(/\D/g, '') : null;
        this.pairingStartedAt = Date.now();
        this.emitPairState('initializing');
        try {
            const version = await getBaileysVersion();
            const { state, saveCreds } = await useMultiFileAuthState(this.authPath);

            this.sock = makeWASocket({
                version,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: P({ level: 'fatal' }),
                browser: Browsers.ubuntu('Chrome'),
                syncFullHistory: false,
                shouldSyncHistoryMessage: () => false,
                markOnlineOnConnect: true,
                keepAliveIntervalMs: 30000,
                connectTimeoutMs: 30000,
                defaultQueryTimeoutMs: 30000,
                emitOwnEvents: true,
                retryRequestDelayMs: 1000,
                maxMsgRetryCount: 5,
                linkPreviewImageThumbnailWidth: 192,
                transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 3000 },
                getMessage: async (key) => {
                    if (messageLogs[key.id]) {
                        return { conversation: messageLogs[key.id].text };
                    }
                    return { conversation: 'Bot is active' };
                },
                patchMessageBeforeSending: (message) => {
                    const requiresPatch = !!(message.buttonsMessage || message.templateMessage || message.listMessage);
                    if (requiresPatch) {
                        return {
                            viewOnceMessage: {
                                message: {
                                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                                    ...message
                                }
                            }
                        };
                    }
                    return message;
                },
                generateHighQualityLinkPreview: true,
            });
            const socket = this.sock;
            const socketGeneration = ++this.socketGeneration;
            const isCurrentSocket = () => this.sock === socket && this.socketGeneration === socketGeneration;

            // Apply anti-abuse protection before any session output is sent.
            applyAntiAbuse(this.sock);

            // Apply the Itachi Uchiha visual style to all outgoing command text and captions.
            applyItachiStyle(this.sock, () => (botData.jidFooters && botData.jidFooters[this.userId]) || { enabled: false, mode: 'both' });

            const normalizedPairingNumber = pairingNumber ? String(pairingNumber).replace(/\D/g, '') : '';
            if (normalizedPairingNumber && (normalizedPairingNumber.length < 8 || normalizedPairingNumber.length > 15)) {
                this.emitPairError('Pairing number must contain 8–15 digits with country code.', 'INVALID_NUMBER');
                return false;
            }
            if (normalizedPairingNumber && !state.creds.registered) {
                if (normalizedPairingNumber.length < 8 || normalizedPairingNumber.length > 15) {
                    this.sendLog('❌ Pairing number must contain 8–15 digits with country code.', 'error');
                } else {
                    // Wait for an open authenticated transport or the initial QR/handshake
                    // signal. Phone pairing must be requested before open because the open
                    // state is reached only after the phone completes linking.
                    if (typeof this.sock.waitForConnectionUpdate === 'function') {
                        await this.sock.waitForConnectionUpdate(
                            async update => update.connection === 'open' || Boolean(update.qr),
                            Number(process.env.PAIRING_CONNECTION_TIMEOUT_MS || 20000)
                        );
                    } else {
                        await delay(Number(process.env.PAIRING_READY_DELAY_MS || 750));
                    }
                    try {
                        const pairingPromise = this.sock.requestPairingCode(normalizedPairingNumber);
                        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Pairing service timed out. Please retry.')), 30000));
                        let rawCode = await Promise.race([pairingPromise, timeoutPromise]);
                        rawCode = String(rawCode || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                        if (rawCode.length !== 8) throw new Error('WhatsApp returned an invalid pairing code. Please retry.');
                        const code = rawCode.match(/.{1,4}/g).join('-');
                        this.pairingCode = rawCode;
                        this.pairingCodeIssuedAt = Date.now();
                        this.sendLog(`\u{1F511} Pairing Code: ${code} (valid for 60 seconds)`, 'success');

                        if (this.tgChatId && tgBot) {
                            const codeMsg = 
                                `\u{25EC}\u{2501}\u{2501}\u{2501}\u{3008} *ITACHI UCHIHA MD CODE* \u{3009}\u{2501}\u{2501}\u{2501}\u{25EC}\n\n` +
                                `*\u{1F511} YOUR PAIRING CODE:* \`${code}\`\n\n` +
                                `_Enter this code in your WhatsApp Linked Devices section._\n\n` +
                                `> © POWERED BY ALI HAIDER ®`;
                            await tgBot.sendMessage(this.tgChatId, codeMsg, { parse_mode: 'Markdown' });
                        }

                        this.pairingState = 'code';
                        this.clearPairingTimers();
                        this.pairingExpiryTimer = setTimeout(async () => {
                            if (!this.isConnected && this.pairingState === 'code') {
                                this.isInitializing = false;
                                this.pairingState = 'idle';
                                this.pairingCode = null;
                                await this.clearUnregisteredAuth();
                                this.emitPairState('expired', { message: 'Pairing code expired. Request a new code.' });
                            }
                        }, 60000);
                        this.emitPairState('code', { expiresIn: 60 });
                        const socketId = userSockets[this.userId];
                        if (socketId) io.to(socketId).emit('pairing-code', code);
                    } catch (err) {
                        this.isInitializing = false;
                        this.pairingCode = null;
                        await this.clearUnregisteredAuth();
                        this.emitPairError(`Pairing failed: ${err.message}`, 'PAIRING_FAILED');
                        this.sendLog(`\u{274C} Pairing error: ${err.message}`, 'error');
                        if (this.tgChatId && tgBot) {
                            await tgBot.sendMessage(this.tgChatId, "\u{274C} Pairing Error: " + err.message);
                        }
                    }
                }
            }

            socket.ev.on('creds.update', async update => {
                if (!isCurrentSocket()) return;
                await saveCreds(update);
            });

            socket.ev.on('call', async (calls) => {
                if (!isCurrentSocket()) return;
                if (botData.antiCall[this.userId]) {
                    for (const call of calls) {
                        if (call.status === 'offer') {
                            try {
                                // Properly reject call
                                await this.sock.rejectCall(call.id, call.from);
                                
                                // Send professional rejection message
                                await this.sock.sendMessage(call.from, { 
                                    text: `*\u{26A0}\uFE0F} ANTI-CALL SYSTEM ACTIVE* \n\n` +
                                          `I am a bot and cannot receive calls. \n` +
                                          `Please send a text message instead. \n\n` +
                                          `> © POWERED BY ALI HAIDER ® `
                                });
                            } catch (e) {}
                        }
                    }
                }
            });

            socket.ev.on('group-participants.update', async (update) => {
                if (!isCurrentSocket()) return;
                try {
                    const welcome = require('./commands/welcome');
                    await welcome.handleParticipantUpdate(this.sock, update, botData, saveBotData);
                } catch (error) {
                    this.sendLog(`Welcome/goodbye handler error: ${error.message}`, 'error');
                }
            });
            socket.ev.on('messages.upsert', async (m) => {
                if (!isCurrentSocket() || m.type !== 'notify') return;

                await Promise.all(m.messages.map(async (msg) => {
                    if (msg.messageStubType === 1 || msg.messageStubType === 2) {
                        this.sendLog('Received an undecryptable message. This might be due to a session conflict.', 'warning');
                    }

                    try {
                        const from = msg.key.remoteJid;
                        const isMe = msg.key.fromMe;
                        const isGroup = from.endsWith('@g.us');
                        const isStatus = from === 'status@broadcast';

                        const messageContent = msg.message?.ephemeralMessage?.message || msg.message?.viewOnceMessage?.message || msg.message?.viewOnceMessageV2?.message || msg.message;
                        if (!messageContent) return;

                        let type = Object.keys(messageContent)[0];
                        const text = (messageContent.conversation || messageContent.extendedTextMessage?.text || messageContent.imageMessage?.caption || messageContent.videoMessage?.caption || '').trim();

                        // Handle snipe for deleted messages
                        if (!isMe && !isStatus) {
                            await handleAutoread(this.sock, msg);
                            await storeMessage(msg);
                            handleSnipe(msg);
                        }

                        if (msg.message?.protocolMessage?.type === 0) {
                            await handleMessageRevocation(this.sock, msg);
                            return;
                        }

                        const msgId = msg.key.id;
                        if (this.processedMessages.has(msgId)) return;
                        this.processedMessages.add(msgId);
                        if (this.processedMessages.size > 1000) this.processedMessages.delete(this.processedMessages.values().next().value);

                        if (!isStatus) {
                            let logEntry = { text, type };
                            if (['imageMessage', 'videoMessage', 'audioMessage'].includes(type)) {
                                try {
                                    const mContent = messageContent[type];
                                    if (mContent && (mContent.directPath || mContent.url)) {
                                        const stream = await downloadContentFromMessage(mContent, type.replace('Message', ''));
                                        let buffer = Buffer.from([]);
                                        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                                        logEntry.buffer = buffer;
                                    }
                                } catch (e) {}
                            }
                            logEntry.pushName = msg.pushName || 'User';
                            messageLogs[msgId] = logEntry;
                            if (Object.keys(messageLogs).length > 2000) delete messageLogs[Object.keys(messageLogs)[0]];
                        }

                        // Auto-react
                        if (this.autoReact && !isMe && !isStatus) {
                            const { nextReaction } = require('./autoreact_emojis');
                            const reaction = nextReaction(from, msg.key.id);
                            try { await this.sock.sendMessage(from, { react: { text: reaction, key: msg.key } }); } catch (e) {}
                        }

                        // Award XP for normal group activity
                        if (!text.startsWith('.')) {
                            try {
                                const levels = require('./commands/levels');
                                await levels.handleActivity(this.sock, from, msg, sender, isGroup, isMe, text, botData, saveBotData);
                            } catch (e) {
                                console.error('Level tracking error:', e);
                            }
                        }

                        // Itachi keyword auto-reply for enabled groups
                        if (!text.startsWith('.')) {
                            try {
                                const itachiChat = require('./commands/itachichat');
                                if (await itachiChat.handleAutoReply(this.sock, from, msg, text, sender, isGroup, isAdmin, isOwner, botData)) return;
                            } catch (e) {
                                console.error('Itachi Auto-Reply Error:', e);
                            }
                        }

                        // AI auto-reply
                        if (this.aiEnabled && !isMe && !isGroup && text && !text.startsWith('.')) {
                            try {
                                const aiResponse = await this.getAIResponse(from, text);
                                await this.sock.sendMessage(from, { text: aiResponse }, { quoted: msg });
                            } catch (e) {
                                console.error("AI Auto-Reply Error:", e);
                            }
                        }

                        // Status handling
                        if (isStatus && !isMe) {
                            await handleStatusUpdate(this.sock, m, botData, this.userId);
                            return;
                        }

                        // =================== AUTHORIZATION FIX ===================
                        // THE FIX: Bot now works in ALL chats - personal, group, self
                        
                        const botNumber = jidNormalizedUser(this.sock.user.id);
                        const botNumberClean = botNumber.split('@')[0];

                        const sender = msg.key.participant || from;
                        const senderClean = sender.split('@')[0];

                        const ownerNumbers = String(settings.ownerNumber).split(',').map(n => n.replace(/\D/g, ''));
                        const isOwner = isMe || ownerNumbers.some(on => senderClean === on) || senderClean === botNumberClean;

                        const isSessionUser = senderClean === this.phoneNumber || senderClean === this.userId || senderClean === botNumberClean;

                        // PRIORITY FIX: Bot must work in DM/Private Chats
                        // isAuthorized determines if the bot should respond to commands
                        const isAuthorized = this.isPublic || isOwner || isSessionUser || isMe;

                        let isAdmin = isOwner;
                        if (!isAdmin && isGroup) {
                            try {
                                const groupMetadata = await this.sock.groupMetadata(from);
                                const participant = groupMetadata.participants.find(p => p.id === sender);
                                isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
                            } catch (e) {
                                isAdmin = false;
                            }
                        }

                        // Anti-status in groups
                        if (isGroup && botData.antiStatusGroups && botData.antiStatusGroups[from] && !isAdmin) {
                            const isStatusMsg = msg.message?.protocolMessage?.type === 0 || 
                                           msg.message?.viewOnceMessage || 
                                           msg.message?.viewOnceMessageV2 ||
                                           msg.message?.viewOnceMessageV2Extension ||
                                           (text && (text.includes('whatsapp.com/channel/') || text.includes('status@broadcast')));

                            if (msg.message?.forwardingScore > 0 || isStatusMsg) {
                                try {
                                    await this.sock.sendMessage(from, { delete: msg.key });
                                    return;
                                } catch (e) {}
                            }
                        }

                        // Combined anti-link and anti-spam moderation
                        if (isGroup && !isAdmin && !isOwner) {
                            const moderation = require('./commands/moderation');
                            if (await moderation.handleMessage(this.sock, from, msg, text, sender, isGroup, isAdmin, isOwner, botData)) return;
                        }

                        // Ghost mode - only restrict if enabled and NOT owner/session user
                        if (this.ghostMode && !isOwner && !isSessionUser) {
                            return;
                        }

                        // PRIORITY FIX: Ensure bot responds in DM to EVERYONE if in Public Mode
                        // If in Private Mode, only respond to Owner/Session User
                        if (!this.isPublic && !isAuthorized) {
                            // If it's a command and not authorized, don't return here yet, let it pass through
                            // but mark it so we can skip command execution later if needed
                        }

                        // Process commands
                        if (text.toLowerCase().startsWith('.')) {
                            // Re-check authorization for commands
                            if (!this.isPublic && !isAuthorized) return;
                            const cmd = text.toLowerCase();
                            const args = text.split(' ').slice(1);
                            const q = args.join(' ');
                            const commandName = cmd.slice(1).split(' ')[0];

                            (async () => {
                                try {
                                    // =================== 120+ COMMAND SWITCH ===================
                                    switch (commandName) {
                                        // ===== MENU =====
                                        case 'menu': {
                                            const allMenuCmd = require('./commands/allmenu');
                                            await allMenuCmd(this.sock, from, msg, this, commands);

                                            // Send the validated repository startup song after the Itachi menu text.
                                            const startupAudio = readStartupAudio();
                                            if (startupAudio) {
                                                try {
                                                    await this.sock.sendMessage(from, {
                                                        audio: startupAudio,
                                                        mimetype: 'audio/mpeg',
                                                        fileName: 'ITACHI-UCHIHA-MD-STARTUP.mp3',
                                                        ptt: false
                                                    }, { quoted: msg });
                                                    this.sendLog('Startup music sent with the menu. ✅', 'success');
                                                } catch (e) {
                                                    this.sendLog(`Startup music delivery failed: ${e.message}`, 'warning');
                                                }
                                            } else {
                                                this.sendLog('Startup music skipped: song.mp3 is missing or not a valid MP3 file.', 'warning');
                                            }
                                            break;
                                        }
                                        case 'allmenu': {
                                            const allMenuCmd = require('./commands/allmenu');
                                            await allMenuCmd(this.sock, from, msg, this, commands);
                                            const startupAudio = readStartupAudio();
                                            if (startupAudio) {
                                                try {
                                                    await this.sock.sendMessage(from, {
                                                        audio: startupAudio,
                                                        mimetype: 'audio/mpeg',
                                                        fileName: 'ITACHI-UCHIHA-MD-STARTUP.mp3',
                                                        ptt: false
                                                    }, { quoted: msg });
                                                    this.sendLog('Startup music sent with the all-menu. ✅', 'success');
                                                } catch (e) {
                                                    this.sendLog(`Startup music delivery failed: ${e.message}`, 'warning');
                                                }
                                            } else {
                                                this.sendLog('Startup music skipped: song.mp3 is missing or not a valid MP3 file.', 'warning');
                                            }
                                            break;
                                        }
                                        case 'ownermenu': {
                                            const text = `*\u{1F451} OWNER MENU*\n\n\u{25FB} .public\n\u{25FB} .private\n\u{25FB} .block\n\u{25FB} .unblock\n\u{25FB} .restart\n\u{25FB} .shutdown\n\u{25FB} .bcall\n\u{25FB} .bcgc`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }
                                        case 'groupmenu': {
                                            const text = `*\u{1F465} GROUP MENU*\n\n\u{25FB} .kick\n\u{25FB} .add\n\u{25FB} .promote\n\u{25FB} .demote\n\u{25FB} .mute\n\u{25FB} .unmute\n\u{25FB} .tagall\n\u{25FB} .hidetag\n\u{25FB} .grouplink\n\u{25FB} .groupinfo`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }
                                        case 'downloadmenu': {
                                            await commands.downloadmenu(this.sock, from, msg);
                                            break;
                                        }
                                        case 'aimenu': {
                                            const text = `*\u{1F916} AI MENU*\n\n\u{25FB} .ai\n\u{25FB} .chatbot\n\u{25FB} .gali`;
                                            await this.sock.sendMessage(from, { text }, { quoted: msg });
                                            break;
                                        }

                                        // ===== MEDIA & DOWNLOAD =====
                                        case 'song': case 'play': case 'ytmp3': await commands.song(this.sock, from, msg, q); break;
                                        case 'video': case 'ytmp4': await commands.video(this.sock, from, msg, q); break;
                                        case 'insta': case 'ig': case 'igdl': await commands.insta(this.sock, from, msg, q); break;
                                        case 'tiktok': case 'tt': case 'ttdl': await commands.tiktok(this.sock, from, msg, q); break;
                                        case 'facebook': case 'fb': case 'fbdown': await commands.facebook(this.sock, from, msg, q); break;
                                        case 'youtube': case 'yt': await commands.youtube(this.sock, from, msg, q); break;
                                        case 'pinterest': case 'pin': case 'pindl': await commands.pinterest(this.sock, from, msg, q); break;
                                        case 'twitter': case 'x': case 'twit': case 'twtdl': await commands.twitter(this.sock, from, msg, q); break;
                                        case 'reddit': case 'reddown': await commands.reddit(this.sock, from, msg, q); break;
                                        case 'spotify': case 'spot': case 'spdl': await commands.spotify(this.sock, from, msg, q); break;
                                        case 'mediafire': case 'mf': await commands.mf(this.sock, from, msg, q); break;
                                        case 'gdrive': await commands.gdrive(this.sock, from, msg, q); break;
                                        case 'apk': await commands.apk(this.sock, from, msg); break;
                                        case 'directdl': case 'urldl': case 'download': case 'customdl': case 'audiourl': case 'videourl': case 'imagedl': case 'docdl': await commands.directdl(this.sock, from, msg, q); break;
                                        case 'thumbnail': case 'thumb': await commands.thumbnail(this.sock, from, msg, q); break;

                                        // ===== GROUP MANAGEMENT =====
                                        case 'kick': await commands.kick(this.sock, from, msg, isAdmin); break;
                                        case 'ban': await commands.ban(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban1': await commands.ban1(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban2': await commands.ban2(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban3': await commands.ban3(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban4': await commands.ban4(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban5': await commands.ban5(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban6': await commands.ban6(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban7': await commands.ban7(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban8': await commands.ban8(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban9': await commands.ban9(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban10': await commands.ban10(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban11': await commands.ban11(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban12': await commands.ban12(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban13': await commands.ban13(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban14': await commands.ban14(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban15': await commands.ban15(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban16': await commands.ban16(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban17': await commands.ban17(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban18': await commands.ban18(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban19': await commands.ban19(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban20': await commands.ban20(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban21': await commands.ban21(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban22': await commands.ban22(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban23': await commands.ban23(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban24': await commands.ban24(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban25': await commands.ban25(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban26': await commands.ban26(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban27': await commands.ban27(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban28': await commands.ban28(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban29': await commands.ban29(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban30': await commands.ban30(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban31': await commands.ban31(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban32': await commands.ban32(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban33': await commands.ban33(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban34': await commands.ban34(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban35': await commands.ban35(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban36': await commands.ban36(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban37': await commands.ban37(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban38': await commands.ban38(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban39': await commands.ban39(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban40': await commands.ban40(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban41': await commands.ban41(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban42': await commands.ban42(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban43': await commands.ban43(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban44': await commands.ban44(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban45': await commands.ban45(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban46': await commands.ban46(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban47': await commands.ban47(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban48': await commands.ban48(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban49': await commands.ban49(this.sock, from, msg, isAdmin, q); break;
                                        case 'ban50': await commands.ban50(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban': await commands.unban(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban1': await commands.unban1(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban2': await commands.unban2(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban3': await commands.unban3(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban4': await commands.unban4(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban5': await commands.unban5(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban6': await commands.unban6(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban7': await commands.unban7(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban8': await commands.unban8(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban9': await commands.unban9(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban10': await commands.unban10(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban11': await commands.unban11(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban12': await commands.unban12(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban13': await commands.unban13(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban14': await commands.unban14(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban15': await commands.unban15(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban16': await commands.unban16(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban17': await commands.unban17(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban18': await commands.unban18(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban19': await commands.unban19(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban20': await commands.unban20(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban21': await commands.unban21(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban22': await commands.unban22(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban23': await commands.unban23(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban24': await commands.unban24(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban25': await commands.unban25(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban26': await commands.unban26(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban27': await commands.unban27(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban28': await commands.unban28(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban29': await commands.unban29(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban30': await commands.unban30(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban31': await commands.unban31(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban32': await commands.unban32(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban33': await commands.unban33(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban34': await commands.unban34(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban35': await commands.unban35(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban36': await commands.unban36(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban37': await commands.unban37(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban38': await commands.unban38(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban39': await commands.unban39(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban40': await commands.unban40(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban41': await commands.unban41(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban42': await commands.unban42(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban43': await commands.unban43(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban44': await commands.unban44(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban45': await commands.unban45(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban46': await commands.unban46(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban47': await commands.unban47(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban48': await commands.unban48(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban49': await commands.unban49(this.sock, from, msg, isAdmin, q); break;
                                        case 'unban50': await commands.unban50(this.sock, from, msg, isAdmin, q); break;
                                        case 'add': await commands.add(this.sock, from, msg, isAdmin, q); break;
                                        case 'promote': await commands.promote(this.sock, from, msg, isAdmin); break;
                                        case 'demote': await commands.demote(this.sock, from, msg, isAdmin); break;
                                        case 'gclink': await commands.grouplink(this.sock, from, msg, isAdmin); break;
                                        case 'mute': await commands.mute(this.sock, from, msg, isAdmin); break;
                                        case 'unmute': await commands.unmute(this.sock, from, msg, isAdmin); break;
                                        case 'join': await commands.join(this.sock, from, msg, q); break;
                                        case 'leave': await commands.leave(this.sock, from, msg, isAdmin); break;
                                        case 'setppgc': await commands.setppgc(this.sock, from, msg, isAdmin); break;
                                        case 'getbio': await commands.getbio(this.sock, from, msg, q); break;
                                        case 'getdp': await commands.getdp(this.sock, from, msg, q); break;
                                        case 'tagadmin': await commands.tagadmin(this.sock, from, msg, isAdmin); break;
                                        case 'kickoffline': await commands.kickoffline(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'hidetag': await commands.hidetag(this.sock, from, msg, isAdmin, q); break;
                                        case 'tagall': await commands.tagall(this.sock, from, msg, isAdmin, q); break;
                                        case 'admins': await commands.admins(this.sock, from, msg); break;
                                        case 'members': await commands.members(this.sock, from, msg); break;
                                        case 'groupstats': case 'gstats': await commands.groupstats(this.sock, from, msg); break;
                                        case 'groupname': await commands.groupname(this.sock, from, msg, isAdmin, q); break;
                                        case 'setdesc': case 'groupdesc': await commands.setdesc(this.sock, from, msg, isAdmin, q); break;
                                        case 'groupopen': case 'open': await commands.groupopen(this.sock, from, msg, isAdmin); break;
                                        case 'groupclose': case 'close': await commands.groupclose(this.sock, from, msg, isAdmin); break;
                                        case 'adminsonly': await commands.adminsonly(this.sock, from, msg, isAdmin); break;
                                        case 'allmembers': await commands.allmembers(this.sock, from, msg, isAdmin); break;
                                        case 'grouplink': case 'invite': await commands.grouplink(this.sock, from, msg, isAdmin); break;
                                        case 'revokeinvite': await commands.revokeinvite(this.sock, from, msg, isAdmin); break;
                                        case 'poll': await commands.poll(this.sock, from, msg, isAdmin, q); break;
                                        case 'grouphelp': await commands.grouphelp(this.sock, from, msg); break;
                                        case 'botinfo': await commands.botinfo(this.sock, from, msg, isOwner); break;
                                        case 'health': case 'bothealth': await commands.health(this.sock, from, msg, isOwner); break;
                                        case 'ownerhelp': await commands.ownerhelp(this.sock, from, msg, isOwner); break;
                                        case 'safetymode': case 'antiban': await commands.safetymode(this.sock, from, msg, isOwner, q, this); break;
                                        case 'about': await commands.about(this.sock, from, msg); break;
                                        case 'rules': await commands.rules(this.sock, from, msg); break;
                                        case 'groupid': await commands.groupid(this.sock, from, msg); break;
                                        case 'chatid': await commands.chatid(this.sock, from, msg); break;
                                        case 'mention': case 'mentionme': await commands.mention(this.sock, from, msg, q); break;
                                        case 'random': case 'randomtool': await commands.randomtool(this.sock, from, msg, q); break;
                                        case 'timestamp': case 'timecode': await commands.timestamp(this.sock, from, msg, q); break;
                                        case 'urlencode': case 'urlenc': await commands.urlencode(this.sock, from, msg, q); break;
                                        case 'hextext': case 'tohextext': await commands.hextext(this.sock, from, msg, q); break;
                                        case 'jsonfmt': case 'jsonformat': await commands.jsonfmt(this.sock, from, msg, q); break;
                                        case 'textstats': case 'textstat': await commands.textstats(this.sock, from, msg, q); break;
                                        case 'fortune': case 'itachifortune': await commands.fortune(this.sock, from, msg); break;
                                        case 'compatibility': case 'compat': await commands.compatibility(this.sock, from, msg); break;
                                        case 'itachifact': case 'wisdom': await commands.itachifact(this.sock, from, msg); break;
                                        case 'battle': case 'shinobibattle': await commands.battle(this.sock, from, msg); break;
                                        case 'prediction': case 'predict': await commands.prediction(this.sock, from, msg, q); break;
                                        case 'shinobiquiz': case 'quiz': await commands.shinobiquiz(this.sock, from, msg); break;
                                        case 'roastme': await commands.roastme(this.sock, from, msg); break;
                                        case 'praise': await commands.praise(this.sock, from, msg); break;
                                        case 'time': await commands.time(this.sock, from, msg); break;
                                        case 'date': await commands.date(this.sock, from, msg); break;
                                        case 'choose': await commands.choose(this.sock, from, msg, q); break;
                                        case '8ball': case 'eightball': await commands.eightball(this.sock, from, msg, q); break;
                                        case 'motivate': await commands.motivate(this.sock, from, msg); break;
                                        case 'password': case 'passgen': await commands.password(this.sock, from, msg, q); break;
                                        case 'uuid': await commands.uuid(this.sock, from, msg); break;
                                        case 'color': case 'colour': await commands.color(this.sock, from, msg); break;
                                        case 'dice': await commands.dice(this.sock, from, msg, q); break;
                                        case 'countdown': await commands.countdown(this.sock, from, msg, q); break;
                                        case 'groupinfo': case 'ginfo': await commands.groupinfo(this.sock, from, msg); break;
                                        case 'accept': await commands.accept(this.sock, from, msg, isAdmin); break;
                                        case 'everyonemsg': await commands.everyonemsg(this.sock, from, msg, isAdmin, q); break;
                                        case 'listonline': await commands.listonline(this.sock, from, msg); break;

                                        // ===== ADMIN / OWNER =====
                                        case 'welcome': await commands.welcome(this.sock, from, msg, isAdmin, q, botData, saveBotData); break;
                                        case 'goodbye': await commands.goodbye(this.sock, from, msg, isAdmin, q, botData, saveBotData); break;
                                        case 'welcomeconfig': await commands.welcomeconfig(this.sock, from, msg, isAdmin, botData); break;
                                        case 'private': 
                                            await commands.private(this.sock, from, msg, isAdmin, this); 
                                            if (!botData.statusSettings[this.userId]) botData.statusSettings[this.userId] = {};
                                            botData.statusSettings[this.userId].isPublic = false;
                                            saveBotData();
                                            break;
                                        case 'public': 
                                            await commands.public(this.sock, from, msg, isAdmin, this); 
                                            if (!botData.statusSettings[this.userId]) botData.statusSettings[this.userId] = {};
                                            botData.statusSettings[this.userId].isPublic = true;
                                            saveBotData();
                                            break;
                                        case 'owner': await commands.owner(this.sock, from, msg); break;
                                        case 'setname': await commands.setname(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, q); break;
                                        case 'block': await commands.block(this.sock, from, msg, isOwner, q); break;
                                        case 'unblock': await commands.unblock(this.sock, from, msg, isOwner, q); break;
                                        case 'bcgc': await commands.bcgc(this.sock, from, msg, isOwner, q); break;
                                        case 'bcall': await commands.bcall(this.sock, from, msg, isOwner, q); break;
                                        case 'restart': await commands.restart(this.sock, from, msg, isOwner); break;
                                        case 'shutdown': await commands.shutdown(this.sock, from, msg, isOwner); break;
                                        case 'mode': await commands.mode(this.sock, from, msg, isOwner, this); break;
                                        case 'clone': await commands.clone(this.sock, from, msg, isOwner, q); break;

                                        // ===== PROTECTION =====
                                        case 'antilink': await commands.antilink(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'antispam': await commands.antispam(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'antilinkwarn': await commands.antilinkwarn(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'antispamwarn': await commands.antispamwarn(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'moderationconfig': await commands.moderationconfig(this.sock, from, msg, isAdmin, botData); break;
                                        case 'anticall': await commands.anticall(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, args); break;
                                        case 'antidelete': await commands.antidelete(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, args); break;
                                        case 'antistatus': await commands.antistatus(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'antibug': await commands.antibug(this.sock, from, msg, isOwner, botData, saveBotData, args); break;

                                        // ===== STATUS / AUTO =====
                                        case 'status': 
                                        case 'autostatus': await commands.autostatus(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, args); break;
                                        case 'autoreact': case 'autoreacts': await commands.autoreacts(this.sock, from, msg, isAdmin, this, args, botData, saveBotData); break;
                                        case 'jidfooter': case 'jid': await commands.jidfooter(this.sock, from, msg, isAdmin, q, botData, saveBotData, this.userId); break;
                                        case 'autoread': await commands.autoread(this.sock, from, msg); break;

                                        // ===== AI =====
                                        case 'ai': await commands.ai(this.sock, from, msg, isAdmin, this, args); break;
                                        case 'itachi': await commands.itachi(this.sock, from, msg, q); break;
                                        case 'rank': await commands.rank(this.sock, from, msg, q, botData, sender); break;
                                        case 'profile': await commands.profile(this.sock, from, msg, q, botData, sender); break;
                                        case 'leaderboard': case 'top': await commands.leaderboard(this.sock, from, msg, botData); break;
                                        case 'level': await commands.level(this.sock, from, msg, isAdmin, q, botData, saveBotData); break;
                                        case 'levelconfig': await commands.levelconfig(this.sock, from, msg, isAdmin, botData); break;
                                        case 'itachiauto': await commands.itachiauto(this.sock, from, msg, isAdmin, q, botData, saveBotData); break;
                                        case 'itachiconfig': await commands.itachiconfig(this.sock, from, msg, isAdmin, botData); break;
                                        case 'chatbot': await commands.chatbot(this.sock, from, msg, this, args); break;
                                        case 'gali': await commands.gali(this.sock, from, msg, this, args); break;

                                        // ===== FUN =====
                                        case 'joke': await commands.joke(this.sock, from, msg); break;
                                        case 'meme': await commands.meme(this.sock, from, msg); break;
                                        case 'dare': await commands.dare(this.sock, from, msg); break;
                                        case 'truth': await commands.truth(this.sock, from, msg); break;
                                        case 'ascii': await commands.ascii(this.sock, from, msg, q); break;
                                        case 'fonts': await commands.fonts(this.sock, from, msg); break;
                                        case 'font1': await commands.font1(this.sock, from, msg, q); break;
                                        case 'font2': await commands.font2(this.sock, from, msg, q); break;
                                        case 'font3': await commands.font3(this.sock, from, msg, q); break;
                                        case 'font4': await commands.font4(this.sock, from, msg, q); break;
                                        case 'font5': await commands.font5(this.sock, from, msg, q); break;
                                        case 'font6': await commands.font6(this.sock, from, msg, q); break;
                                        case 'font7': await commands.font7(this.sock, from, msg, q); break;
                                        case 'font8': await commands.font8(this.sock, from, msg, q); break;
                                        case 'font9': await commands.font9(this.sock, from, msg, q); break;
                                        case 'font10': await commands.font10(this.sock, from, msg, q); break;
                                        case 'font11': await commands.font11(this.sock, from, msg, q); break;
                                        case 'font12': await commands.font12(this.sock, from, msg, q); break;
                                        case 'font13': await commands.font13(this.sock, from, msg, q); break;
                                        case 'font14': await commands.font14(this.sock, from, msg, q); break;
                                        case 'font15': await commands.font15(this.sock, from, msg, q); break;
                                        case 'font16': await commands.font16(this.sock, from, msg, q); break;
                                        case 'font17': await commands.font17(this.sock, from, msg, q); break;
                                        case 'font18': await commands.font18(this.sock, from, msg, q); break;
                                        case 'font19': await commands.font19(this.sock, from, msg, q); break;
                                        case 'font20': await commands.font20(this.sock, from, msg, q); break;
                                        case 'font21': await commands.font21(this.sock, from, msg, q); break;
                                        case 'font22': await commands.font22(this.sock, from, msg, q); break;
                                        case 'font23': await commands.font23(this.sock, from, msg, q); break;
                                        case 'font24': await commands.font24(this.sock, from, msg, q); break;
                                        case 'font25': await commands.font25(this.sock, from, msg, q); break;
                                        case 'font26': await commands.font26(this.sock, from, msg, q); break;
                                        case 'font27': await commands.font27(this.sock, from, msg, q); break;
                                        case 'font28': await commands.font28(this.sock, from, msg, q); break;
                                        case 'font29': await commands.font29(this.sock, from, msg, q); break;
                                        case 'font30': await commands.font30(this.sock, from, msg, q); break;
                                        case 'font31': await commands.font31(this.sock, from, msg, q); break;
                                        case 'font32': await commands.font32(this.sock, from, msg, q); break;
                                        case 'font33': await commands.font33(this.sock, from, msg, q); break;
                                        case 'font34': await commands.font34(this.sock, from, msg, q); break;
                                        case 'font35': await commands.font35(this.sock, from, msg, q); break;
                                        case 'font36': await commands.font36(this.sock, from, msg, q); break;
                                        case 'font37': await commands.font37(this.sock, from, msg, q); break;
                                        case 'font38': await commands.font38(this.sock, from, msg, q); break;
                                        case 'font39': await commands.font39(this.sock, from, msg, q); break;
                                        case 'font40': await commands.font40(this.sock, from, msg, q); break;
                                        case 'font41': await commands.font41(this.sock, from, msg, q); break;
                                        case 'font42': await commands.font42(this.sock, from, msg, q); break;
                                        case 'font43': await commands.font43(this.sock, from, msg, q); break;
                                        case 'font44': await commands.font44(this.sock, from, msg, q); break;
                                        case 'font45': await commands.font45(this.sock, from, msg, q); break;
                                        case 'font46': await commands.font46(this.sock, from, msg, q); break;
                                        case 'font47': await commands.font47(this.sock, from, msg, q); break;
                                        case 'font48': await commands.font48(this.sock, from, msg, q); break;
                                        case 'font49': await commands.font49(this.sock, from, msg, q); break;
                                        case 'font50': await commands.font50(this.sock, from, msg, q); break;
                                        case 'roast': await commands.roast(this.sock, from, msg); break;
                                        case 'compliment': await commands.compliment(this.sock, from, msg); break;
                                        case 'ship': await commands.ship(this.sock, from, msg); break;
                                        case 'emojimix': await commands.emojimix(this.sock, from, msg); break;
                                        case 'character': await commands.character(this.sock, from, msg); break;
                                        case 'quote': await commands.quote(this.sock, from, msg); break;
                                        case 'fact': await commands.fact(this.sock, from, msg); break;
                                        case 'trivia': await commands.trivia(this.sock, from, msg); break;
                                        case 'coinflip': case 'cf': await commands.coinflip(this.sock, from, msg); break;
                                        case 'roll': await commands.roll(this.sock, from, msg, q); break;
                                        case 'riddle': await commands.riddle(this.sock, from, msg); break;
                                        case 'wyr': case 'wouldyourather': await commands.wouldyourather(this.sock, from, msg); break;
                                        case 'sadpoetry': case 'sadpoem': case 'sadshayari': await commands.sadpoetry(this.sock, from, msg); break;
                                        case 'romanticpoetry': case 'romanticpoem': case 'lovepoem': await commands.romanticpoetry(this.sock, from, msg); break;

                                        // ===== TOOLS =====
                                        case 'ping': await commands.ping(this.sock, from, msg); break;
                                        case 'dp': await commands.dp(this.sock, from, msg); break;
                                        case 'dpz': await commands.dpz(this.sock, from, msg, q, botData, saveBotData); break;
                                        case 'dpzconfig': case 'dpzsettings': await commands.dpzconfig(this.sock, from, msg, isAdmin, q, botData, saveBotData); break;
                                        case 'dpboys': case 'boysdp': case 'boysdpz': await commands.dpboys(this.sock, from, msg, q, botData, saveBotData); break;
                                        case 'dpgirls': case 'girlsdp': case 'girlsdpz': await commands.dpgirls(this.sock, from, msg, q, botData, saveBotData); break;
                                        case 'setchannel': await commands.setchannel(this.sock, from, msg, isOwner, q, botData, saveBotData, this.userId); break;
                                        case 'channel': await commands.channel(this.sock, from, msg, isOwner, botData, this.userId); break;
                                        case 'removechannel': case 'clearchannel': await commands.removechannel(this.sock, from, msg, isOwner, botData, saveBotData, this.userId); break;
                                        case 'vv': await commands.vv(this.sock, from, msg); break;
                                        case 'translate': case 'trt': await commands.translate(this.sock, from, msg, q); break;
                                        case 'base64': await commands.base64(this.sock, from, msg, q); break;
                                        case 'qr': await commands.qr(this.sock, from, msg, q); break;
                                        case 'shorturl': case 'tinyurl': await commands.shorturl(this.sock, from, msg, q); break;
                                        case 'calc': case 'math': await commands.calc(this.sock, from, msg, q); break;
                                        case 'weather': await commands.weather(this.sock, from, msg, q); break;
                                        case 'github': case 'gh': await commands.github(this.sock, from, msg, q); break;
                                        case 'ipinfo': await commands.ipinfo(this.sock, from, msg, q); break;
                                        case 'tempmail': await commands.tempmail(this.sock, from, msg); break;
                                        case 'fakeinfo': await commands.fakeinfo(this.sock, from, msg); break;
                                        case 'binlookup': await commands.binlookup(this.sock, from, msg, q); break;
                                        case 'whois': await commands.whois(this.sock, from, msg, q); break;
                                        case 'dnslookup': case 'dns': await commands.dnslookup(this.sock, from, msg, q); break;
                                        case 'screenshot': case 'ss': await commands.screenshot(this.sock, from, msg, q); break;
                                        case 'define': case 'dictionary': await commands.define(this.sock, from, msg, q); break;
                                        case 'google': case 'gsearch': await commands.google(this.sock, from, msg, q); break;
                                        case 'wiki': case 'wikipedia': await commands.wiki(this.sock, from, msg, q); break;
                                        case 'yts': case 'ytsearch': await commands.yts(this.sock, from, msg, q); break;
                                        case 'playstore': case 'ps': await commands.playstore(this.sock, from, msg, q); break;
                                        case 'npm': await commands.npm(this.sock, from, msg, q); break;
                                        case 'sticker': case 's': await commands.sticker(this.sock, from, msg); break;
                                        case 'toimg': case 'img': await commands.toimg(this.sock, from, msg); break;
                                        case 'tomp3': case 'mp3': await commands.tomp3(this.sock, from, msg); break;
                                        case 'tts': await commands.tts(this.sock, from, msg, q); break;
                                        case 'blur': await commands.blur(this.sock, from, msg); break;
                                        case 'invert': await commands.invert(this.sock, from, msg); break;
                                        case 'crop': await commands.crop(this.sock, from, msg); break;
                                        case 'flip': await commands.flip(this.sock, from, msg); break;
                                        case 'grayscale': case 'grey': await commands.grayscale(this.sock, from, msg); break;
                                        case 'removebg': case 'nobg': await commands.removebg(this.sock, from, msg); break;
                                        case 'enlarge': case 'upscale': await commands.enlarge(this.sock, from, msg); break;

                                        case 'ghostmode': case 'ghost': await commands.ghostmode(this.sock, from, msg, isOwner, this, args); break;

                                        // ===== ISLAMIC =====
                                        case 'quran': await commands.quran(this.sock, from, msg, q); break;
                                        case 'hadith': await commands.hadith(this.sock, from, msg, q); break;
                                        case 'prayer': case 'salah': await commands.prayer(this.sock, from, msg, q); break;
                                        case 'qibla': await commands.qibla(this.sock, from, msg, q); break;
                                        case 'asmaulhusna': case 'asma': await commands.asmaulhusna(this.sock, from, msg, q); break;

                                        // ===== SYSTEM INFO =====
                                        case 'uptime': await commands.uptime(this.sock, from, msg); break;
                                        case 'serverinfo': case 'si': await commands.serverinfo(this.sock, from, msg); break;
                                        case 'speedtest': case 'speed': await commands.speedtest(this.sock, from, msg); break;
                                        case 'device': case 'dev': await commands.device(this.sock, from, msg); break;
                                        case 'runtime': case 'rt': await commands.runtime(this.sock, from, msg); break;

                                        // ===== UTILITIES =====
                                        case 'timer': await commands.timer(this.sock, from, msg, q); break;
                                        case 'pass': await commands.password(this.sock, from, msg, q); break;
                                        case 'morse': await commands.morse(this.sock, from, msg, q); break;
                                        case 'binary': case 'bin': await commands.binary(this.sock, from, msg, q); break;
                                        case 'hex': await commands.hex(this.sock, from, msg, q); break;
                                        case 'pastebin': case 'paste': await commands.pastebin(this.sock, from, msg, q); break;
                                        case 'news': await commands.news(this.sock, from, msg, q); break;
                                        case 'crypto': case 'coin': await commands.crypto(this.sock, from, msg, q); break;
                                        case 'movie': case 'imdb': await commands.movie(this.sock, from, msg, q); break;
                                        case 'anime': await commands.anime(this.sock, from, msg, q); break;
                                        case 'manga': await commands.manga(this.sock, from, msg, q); break;
                                        case 'lyrics': await commands.lyrics(this.sock, from, msg, q); break;
                                        case 'remind': case 'reminder': await commands.remind(this.sock, from, msg, q); break;
                                        case 'tagme': await commands.tagme(this.sock, from, msg); break;
                                        case 'snipe': await commands.snipe(this.sock, from, msg); break;
                                        case 'editmsg': await commands.editmsg(this.sock, from, msg, q); break;
                                        case 'react': await commands.react(this.sock, from, msg, q); break;
                                        case 'send': await commands.send(this.sock, from, msg, isOwner, q); break;
                                        case 'forward': case 'fwd': await commands.forward(this.sock, from, msg, isOwner, q); break;
                                        case 'clear': await commands.clear(this.sock, from, msg); break;
                                        case 'save': await commands.save(this.sock, from, msg); break;
                                        case 'backup': await commands.backup(this.sock, from, msg, isOwner); break;
                                        case 'restore': await commands.restore(this.sock, from, msg, isOwner); break;
                                        case 'mycmd': case 'mycommands': await commands.mycmd(this.sock, from, msg); break;
                                    }
                                } catch (e) {
                                    this.sendLog(`Command error (${commandName}): ` + e.message, 'error');
                                }
                            })();
                        }
                    } catch (e) {
                        console.error('Message Processing Error:', e);
                    }
                }));
            });

            socket.ev.on('connection.update', async (update) => {
                if (!isCurrentSocket()) return;
                const { connection, lastDisconnect, qr } = update;
                if (qr) {
                    const socketId = userSockets[this.userId];
                    if (socketId) {
                        try {
                            const qrDataUrl = await QRCode.toDataURL(qr, { errorCorrectionLevel: 'M', margin: 2, width: 360 });
                            io.to(socketId).emit('qr', { dataUrl: qrDataUrl, expiresIn: 60 });
                        } catch (qrError) {
                            this.sendLog(`QR rendering failed: ${qrError.message}`, 'error');
                            io.to(socketId).emit('pair-error', 'QR could not be rendered. Use phone-number pairing instead.');
                        }
                    }
                }

                if (connection === 'close') {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const isPairingActive = this.pairingState === 'code' || this.pairingState === 'initializing';
                    const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
                    const isTransient = [
                        DisconnectReason.restartRequired,
                        DisconnectReason.connectionLost,
                        DisconnectReason.connectionClosed,
                        DisconnectReason.timedOut,
                        408,
                        428,
                        499,
                        515
                    ].includes(statusCode);
                    const shouldReconnect = !isLoggedOut;
                    this.isConnected = false;
                    this.isInitializing = false;
                    this.clearPairingTimers();
                    if (this.pairingState !== 'idle') this.pairingState = 'disconnected';
                    this.emitPairState('disconnected', { retrying: shouldReconnect });
                    this.sendLog(`Connection closed (${statusCode || 'unknown'}). Reconnecting: ${shouldReconnect}`, 'warning');
                    this.sendConnectionStatus();
                    if (isLoggedOut) {
                        this.sendLog('Session expired or logged out. Clearing auth data...', 'error');
                        try {
                            if (fs.existsSync(this.authPath)) {
                                const backupPath = `${this.authPath}_backup_${Date.now()}`;
                                fs.moveSync(this.authPath, backupPath);
                                this.sendLog(`Corrupted session backed up to ${backupPath}`, 'info');
                            }
                        } catch (e) {
                            if (fs.existsSync(this.authPath)) fs.removeSync(this.authPath);
                        }
                        delete sessions[this.userId];
                        this.sendConnectionStatus();
                    } else if (isPairingActive && isTransient) {
                        // WhatsApp commonly closes/restarts the companion stream during
                        // phone-code linking. Keep auth state and retry the handshake;
                        // clearing it here invalidates an otherwise valid pairing attempt.
                        this.pairingState = 'initializing';
                        this.pairingCode = null;
                        this.emitPairState('initializing', { retrying: true });
                        this.sendLog(`Pairing handshake interrupted (${statusCode || 'connection issue'}). Retrying without clearing auth...`, 'warning');
                        this.scheduleReconnect(this.pairingNumber, 'pairing handshake recovery');
                    } else if (isPairingActive) {
                        this.pairingState = 'error';
                        this.pairingCode = null;
                        await this.clearUnregisteredAuth();
                        this.emitPairError(`WhatsApp closed the pairing session (${statusCode || 'connection error'}). Request a new code.`, 'PAIRING_CONNECTION_CLOSED');
                    } else if (isTransient) {
                        this.sendLog(`Transient connection issue (${statusCode}). Restarting shortly...`, 'warning');
                        this.scheduleReconnect(null, `transient connection recovery (${statusCode})`);
                    } else {
                        this.sendLog(`Connection closed (${statusCode}). Reconnecting shortly...`, 'info');
                        this.scheduleReconnect(null, `connection recovery (${statusCode || 'unknown'})`);
                    }
                } else if (connection === 'open') {
                    this.isConnected = true;
                    this.isInitializing = false;
                    this.reconnectAttempt = 0;
                    this.clearPairingTimers();
                    this.pairingCode = null;
                    this.pairingState = 'connected';
                    this.emitPairState('connected');
                    this.sendLog('Connected successfully! \u{2705}', 'success');
                    this.sendConnectionStatus();
                    this.startActiveCheck();

                    const botNumber = jidNormalizedUser(this.sock.user.id);
                    const botNumberClean = botNumber.split('@')[0];
                    this.phoneNumber = botNumberClean;

                    if (!settings.connectedBots.includes(botNumberClean)) {
                        settings.connectedBots.push(botNumberClean);
                    }

                    const botName = botData.userNames[this.userId] || (this.sock.user && this.sock.user.name) || this.userId;

                    if (this.tgChatId && tgBot) {
                        const successMsg = 
                            `\u{25EC}\u{2501}\u{2501}\u{2501}\u{3008} *ITACHI UCHIHA MD* \u{3009}\u{2501}\u{2501}\u{2501}\u{25EC}\n\n` +
                            `*\u{2705} CONNECTION SUCCESSFUL!* \n\n` +
                            `Your WhatsApp number has been successfully linked.\n` +
                            `You can now use all commands in your WhatsApp.\n\n` +
                            `> © POWERED BY ALI HAIDER ®`;
                        await tgBot.sendMessage(this.tgChatId, successMsg, { parse_mode: 'Markdown' });
                    }

                    this.sendLog(`Bot ${botName} is online.`, 'success');

                    setTimeout(async () => {
                        try {
                            await this.sock.query({
                                tag: 'iq',
                                attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'status' },
                                content: [{ tag: 'status', attrs: {}, content: Buffer.from("ITACHI UCHIHA MD v2.0.5 - 120+ Commands | POWERED BY ALI HAIDER ®", 'utf-8') }]
                            });
                            this.sendLog("Bio updated successfully! \u{2705}", "success");
                        } catch (e) {
                            this.sendLog("Bio update failed: " + e.message, "error");
                        }
                    }, 5000);

                    if (!this.lastConnectMessageTime || (Date.now() - this.lastConnectMessageTime > 60 * 60 * 1000)) {
                        const welcomeText = `\u{25EC}\u{2501}\u{2501}\u{2501}\u{3008} *ITACHI UCHIHA MD* \u{3009}\u{2501}\u{2501}\u{2501}\u{25EC}\n\n` +
                            `*\u{1F311} CONNECTED SUCCESSFULLY* \u{2705}\n\n` +
                            `Your WhatsApp has been linked to the most powerful automation system.\n\n` +
                            `*\u{1F4F1} BOT INFORMATION:*\n` +
                            `\u{2022} *User:* ${botName}\n` +
                            `\u{2022} *Status:* 24/7 Active\n` +
                            `\u{2022} *Commands:* 150+ Advanced Tools\n\n` +
                            `*\u{1F3B5} CURRENT SONG:*\n` +
                            `> [SONG_PLACEHOLDER]\n\n` +
                            `Type *.menu* to explore all features.\n\n` +
                            `> © POWERED BY ALI HAIDER ®`;

                        await this.sock.sendMessage(botNumber, { 
                            image: { url: settings.startimage },
                            caption: welcomeText 
                        });

                        try {
                            const channelLink = settings.whatsappChannel;
                            if (channelLink) {
                                const channelKey = channelLink.split('/channel/')[1];
                                if (channelKey) {
                                    const metadata = await this.sock.newsletterMetadata('invite', channelKey, 'GUEST');
                                    if (metadata && metadata.id) {
                                        await this.sock.newsletterFollow(metadata.id);
                                        console.log(`\u{2705} Auto-followed channel: ${metadata.id}`);
                                    }
                                }
                            }
                        } catch (channelErr) {
                            console.log('Channel follow error:', channelErr.message);
                        }
                        this.lastConnectMessageTime = Date.now();
                    }
                }
            });

        } catch (err) {
            this.isInitializing = false;
            this.pairingState = 'error';
            this.emitPairError(`Initialization failed: ${err.message}. Please retry.`, 'INITIALIZATION_FAILED');
            this.sendLog(`Initialization failed: ${err.message}. Retrying with backoff...`, 'error');
            if (!this.pairingNumber) this.scheduleReconnect(null, 'initialization recovery');
        }
    }
}


// =================== MENU GENERATOR ===================
function generateMenuText(userName, session) {
    const s = botData.statusSettings[session.userId] || {};
        const mode = session.isPublic ? 'Public' : 'Private';
    const channel = botData.channelSettings?.[session.userId];
    const channelLabel = channel?.jid || OWNER_CHANNEL_JID || settings.whatsappChannel || 'Not configured';
    return `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   💀  *ITACHI UCHIHA MD*  💀      ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🤖 *BOT NAME*  : ITACHI UCHIHA MD    ┃
┃  👤 *OWNER*     : ${settings.ownerName || 'ALI HAIDER ®'}
┃  📦 *VERSION*   : ${settings.version}
┃  ⚙️ *MODE*      : ${mode}
┃  📡 *CHANNEL*   : ${channelLabel}
┃  🔑 *PREFIX*    : ${settings.prefix}
┃  👥 *USER*      : ${userName}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📋 *CATEGORIES*                ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  ✨ .allmenu              ┃
┃  👑 .ownermenu              ┃
┃  👥 .groupmenu            ┃
┃  🤖 .aimenu                    ┃
┃  ⬇️ .downloadmenu     ┃
┃  🛠️ .toolsmenu           ┃
┃  🎉 .funmenu          ┃
┃  🎮 .gamemenu           ┃
┃  🎌 .animemenu                 ┃
┃  🏷️ .stickermenu             ┃
┃  🖼️ .imagemenu                ┃
┃  ✏️ .textmakermenu       ┃
┃  🏢 .logomenu         ┃
┃  🕌 .islamicmenu          ┃
┃  🎯 .miscmenu                 ┃
┃  📡 .channel                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
☠️  *POWERED BY : ALI HAIDER ®*  ☠️`;
}


// =================== SOCKET.IO ===================
io.on('connection', (socket) => {
    // Admin auth
    socket.on('admin-auth', (password) => {
        const adminPass = process.env.ADMIN_PASSWORD || 'ITACHI UCHIHA MD';
        if (password === adminPass) {
            socket.authenticated = true;
            socket.emit('admin-auth-success');
        } else {
            socket.emit('admin-auth-fail');
        }
    });

    socket.on('set-user', (userId) => {
        const safeUserId = String(userId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
        if (!safeUserId) return socket.emit('pair-error', 'Invalid pairing session. Please refresh and try again.');
        socket.userId = safeUserId;
        userSockets[safeUserId] = socket.id;
        if (!sessions[safeUserId]) sessions[safeUserId] = new BotSession(safeUserId);
        sessions[safeUserId].sendConnectionStatus();
    });

    // Pair request - still available via web for web users
    socket.on('pair-request', async ({ userId, number }) => {
        const safeUserId = String(userId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
        const normalizedNumber = String(number || '').replace(/\D/g, '');
        if (!safeUserId || socket.userId !== safeUserId) return socket.emit('pair-error', 'Invalid pairing session. Please start again.');
        if (normalizedNumber.length < 8 || normalizedNumber.length > 15) return socket.emit('pair-error', 'Pairing number must contain 8–15 digits with country code.');
        if (!sessions[safeUserId]) sessions[safeUserId] = new BotSession(safeUserId);
        const session = sessions[safeUserId];
        if (session.isInitializing) return session.emitPairError('A pairing request is already in progress. Please wait.', 'PAIRING_IN_PROGRESS');
        if (session.isConnected) return session.emitPairError('This device is already connected.', 'ALREADY_CONNECTED');
        if (!botData.statusSettings[safeUserId]) {
            botData.statusSettings[safeUserId] = { autoStatus: false, autoSeen: false, autoLike: false, autoDownload: false, isPublic: true };
            saveBotData();
        }
        session.tgChatId = null;
        await session.initialize(normalizedNumber);
    });

    // QR linking fallback for browsers that prefer scanning from WhatsApp Linked Devices.
    socket.on('qr-request', async ({ userId }) => {
        const safeUserId = String(userId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
        if (!safeUserId || socket.userId !== safeUserId) return socket.emit('pair-error', 'Invalid linking session. Please start again.');
        if (!sessions[safeUserId]) sessions[safeUserId] = new BotSession(safeUserId);
        const session = sessions[safeUserId];
        if (session.isInitializing) return session.emitPairError('A linking request is already in progress. Please wait.', 'LINK_IN_PROGRESS');
        if (session.isConnected) return session.emitPairError('This device is already connected.', 'ALREADY_CONNECTED');
        session.tgChatId = null;
        await session.initialize(null);
    });

    // BROADCAST MESSAGE - Send to all connected users
    socket.on('broadcast', async ({ message }) => {
        if (!socket.authenticated) return;
        
        const activeBots = getAllActiveSockets();
        let totalSent = 0;
        let totalChats = 0;

        for (const bot of activeBots) {
            try {
                // Get all chats for this bot
                const allChats = Object.keys(bot.sock.chats || {});
                const personalChats = allChats.filter(jid => jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us'));
                
                for (const jid of personalChats) {
                    try {
                        await bot.sock.sendMessage(jid, { 
                            text: `\u{1F4E2} *BROADCAST MESSAGE* \u{1F4E2}\n\n${message}\n\n_From: ITACHI UCHIHA MD Bot Admin_`
                        });
                        totalSent++;
                    } catch (e) {}
                }
                totalChats += personalChats.length;
            } catch (e) {
                console.error('Broadcast error:', e.message);
            }
        }

        // Save to history
        botData.broadcastHistory.unshift({
            message,
            timestamp: new Date().toISOString(),
            totalSent,
            totalBots: activeBots.length
        });
        if (botData.broadcastHistory.length > 50) botData.broadcastHistory.pop();
        saveBotData();

        socket.emit('broadcast-result', { totalSent, totalBots: activeBots.length, totalChats });
    });

    // STOP BOT - Disconnect a specific bot
    socket.on('stop-bot', async ({ sessionId }) => {
        if (!socket.authenticated) return;
        
        if (sessions[sessionId] && sessions[sessionId].sock) {
            try {
                await sessions[sessionId].sock.logout();
                sessions[sessionId].isConnected = false;
                delete sessions[sessionId];
                socket.emit('bot-stopped', { sessionId, success: true });
            } catch (e) {
                socket.emit('bot-stopped', { sessionId, success: false, error: e.message });
            }
        }
    });

    // STOP ALL BOTS
    socket.on('stop-all-bots', async () => {
        if (!socket.authenticated) return;
        
        let stopped = 0;
        for (const [sessionId, session] of Object.entries(sessions)) {
            try {
                if (session.sock) {
                    await session.sock.logout();
                    session.isConnected = false;
                    stopped++;
                }
            } catch (e) {}
        }
        socket.emit('all-bots-stopped', { stopped });
    });

    // GET CONNECTED BOTS LIST
    socket.on('get-bots-list', () => {
        if (!socket.authenticated) return;
        
        const bots = [];
        for (const [sessionId, session] of Object.entries(sessions)) {
            if (session.sock && session.sock.user) {
                bots.push({
                    sessionId,
                    phoneNumber: session.phoneNumber,
                    isConnected: session.isConnected,
                    userName: botData.userNames[sessionId] || 'Unknown'
                });
            }
        }
        socket.emit('bots-list', bots);
    });

    // GET BROADCAST HISTORY
    socket.on('get-broadcast-history', () => {
        if (!socket.authenticated) return;
        socket.emit('broadcast-history', botData.broadcastHistory || []);
    });

    socket.on('disconnect', () => {
        for (const [userId, socketId] of Object.entries(userSockets)) {
            if (socketId === socket.id) {
                delete userSockets[userId];
                break;
            }
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
    console.log(`\u{1F311} ITACHI UCHIHA MD v${settings.version} Server running on port ${PORT}`);
    console.log(`\u{1F4E1} Total commands loaded: 120+`);
    console.log(`\u{1F310} Web Dashboard: http://localhost:${PORT}`);
    await loadExistingSessions();
});
