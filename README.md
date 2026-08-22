# ITACHI UCHIHA MD
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=230&color=0:0d0000,50:8b0000,100:ff0022&text=ITACHI%20UCHIHA%20MD&fontColor=ffffff&fontSize=85&fontAlignY=40&animation=twinkling&desc=Powered%20By%20ALI%20HAIDER%20%C2%AE" />

<div style="
  margin-top: -60px;
  text-align: center;
  font-size: 32px;
  font-weight: 1000;
  letter-spacing: 3px;
  background: linear-gradient(90deg, #8b0000, #ff0022, #ff4500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow:
    0 0 12px #ff0022,
    0 0 24px #8b0000,
    0 0 36px #ff4500,
    0 0 48px #8b0000;
  padding: 12px 0;">
  🔥 WAKE UP TO REALITY 🔥
    "> Built on Baileys • Designed for Speed • Enhanced for Stability • POWERED BY ALI HAIDER ®
</div>
</div>
<div align="center">
  
![ITACHI UCHIHA MD official startup image](assets/madara_menu.png)

> **ITACHI UCHIHA MD** is a Itachi-themed WhatsApp automation bot POWERED BY **ALI HAIDER ®**. It combines group administration, moderation, media tools, AI-style chat, ranking, customizable join/leave messages, text styling, utility commands, and a structured command menu.

| Project | Details |
|---|---|
| Bot name | **ITACHI UCHIHA MD** |
| Version | **2.0.5** |
| Owner | **ALI HAIDER ®** |
| Prefix | `.` |
| Runtime | Node.js 18 or newer |
| Main entry point | `index.js` |
| License | MIT |
</div>

## Highlights

The bot uses a shared Madara Uchiha response style for outgoing text and captions. When enabled, the optional JID footer can append the sender JID, chat JID, or both to eligible text responses. Media-only payloads, stickers, reactions, deletions, and audio-only messages are preserved without unnecessary text decoration.

The official ITACHI UCHIHA MD startup artwork is bundled at `assets/madara_menu.png`. The same image is used by the web dashboard, WhatsApp startup message, Telegram startup notification, `.menu`, and `.allmenu`. Commands are displayed one per line with clear category separation. When a valid root-level `song.mp3` is present, `.menu` and `.allmenu` send it immediately after the menu image as the startup music. The bot validates the file before sending and logs a clear warning instead of attempting to deliver a corrupt or empty audio file.

## Latest updates

The current release includes the following completed updates:

| Update | Description |
|---|---|
| Fast pairing repair | Phone pairing waits for the initial QR/handshake or open transport before requesting a code, preventing the connecting-state race. Transient link interruptions retry without clearing the in-progress auth state. |
| Reliable startup | Baileys version lookup is cached, bounded by a timeout, and protected by a bundled-version fallback. Existing sessions use persistent `SESSION_DIR` storage when configured. |
| Pair-only user flow | Users need only enter a phone number or choose QR linking. No user-facing session ID is required; the internal browser-routing key is never displayed. |
| Pairing-code copy | Alphanumeric codes such as `VEHW-5KVF` are accepted and copied by tapping the code on mobile or desktop, with Clipboard API and fallback support. |
| New startup artwork | The supplied Itachi artwork is now the official dashboard, WhatsApp startup, Telegram, `.menu`, and `.allmenu` image at `assets/madara_menu.png`. |
| Startup music delivery | `.menu` and `.allmenu` send a validated root-level `song.mp3` after the image; invalid or empty audio is skipped with a visible server warning. |
| Help-menu descriptions | Newly added group, owner, identity, tool, and fun commands appear in the horizontal one-command-per-line help menu with descriptions. |
| Anti-abuse safety layer | Outbound pacing, duplicate suppression, broadcast recipient caps, rate-window limits, and an automatic circuit breaker reduce spam-like behavior. |
| Stable reconnect | Socket generations prevent stale events from closing a newer connection; transient disconnects use guarded exponential backoff and authenticated sessions are recovered without duplicate sockets. |
| Validation | The repository currently passes pairing-recovery, command-audit, module-load, menu, dispatcher, and representative smoke tests. |

## Features

### Group management

The group-management system includes administrator-protected member actions, group information, group metadata tools, structured announcements, polls, and participant utilities. Important commands include `.grouphelp`, `.admins`, `.members`, `.groupstats`, `.groupname`, `.setdesc`, `.grouplink`, `.promote`, `.demote`, `.kick`, `.add`, `.mute`, `.unmute`, `.tagall`, `.hidetag`, `.tagme`, `.mention`, and `.listonline`.

The `.tagall` response includes the Madara header, group name, total participant count, a final-decree announcement, a numbered roster, and real WhatsApp mentions. Large rosters are split into multiple messages to stay within message-size limits.

| Command | Purpose |
|---|---|
| `.grouphelp` | Show the group command guide |
| `.admins` | List group administrators with mentions |
| `.members` | List all group participants with mentions |
| `.groupstats` | Show group name, member count, admin count, and regular-member count |
| `.groupname <name>` | Change the group name; admin only |
| `.setdesc <text>` | Update the group description; admin only |
| `.grouplink` | Retrieve the group invite link; admin only where required by WhatsApp |
| `.poll Question \| Option 1 \| Option 2` | Create a single-choice group poll; admin only |
| `.tagall <message>` | Send a structured numbered mention announcement |
| `.hidetag <message>` | Mention participants without displaying the full list |
| `.promote`, `.demote`, `.kick`, `.add` | Perform protected participant actions |

Additional group controls are available to administrators:

```text
.groupopen
.groupclose
.adminsonly
.allmembers
.revokeinvite
.groupid
.chatid
.mention <text>
```

`.groupopen` allows all members to send messages, while `.groupclose` restricts sending to administrators. `.adminsonly` and `.allmembers` control who can edit group information. `.revokeinvite` invalidates the current group invite link. `.groupid`, `.chatid`, and `.mention` provide participant and chat utilities.

### Owner and bot controls

The owner-only controls provide runtime information, health checks, bot configuration, backups, broadcasts, and access to the owner command guide. These commands require the configured owner identity:

```text
.owner
.ownerhelp
.botinfo
.health
.backup
.restore
.broadcast <text>
.setchannel <jid-or-url>
.removechannel
.jidfooter on|off|sender|chat|both
.public
.private
.restart
```

`.botinfo` reports version, runtime, memory, platform, and Node.js details. `.health` checks process responsiveness and owner-control status. `.safetymode status` shows the active anti-abuse limits, `.safetymode on` enables protection, and `.safetymode off` disables it for an owner-approved diagnostic window. No session ID is exposed by the owner menu.

### Anti-abuse and ban-risk protection

The bot now uses a protective outbound guard by default. It spaces outgoing messages, suppresses duplicate payloads, limits the number of messages in a rolling window, caps `.bcall` and `.bcgc` broadcasts at 25 recipients by default, and pauses outgoing activity when rate-limit or spam-like provider errors are detected. These controls reduce risky automation patterns but cannot guarantee that WhatsApp will never restrict or ban a number; operators must still follow WhatsApp’s terms, avoid unsolicited messages, and use the bot only with permission.

```text
.safetymode status
.safetymode on
.safetymode off
.antiban status
```

The safety guard is session-local, owner-controlled, and intentionally conservative. Configure its limits through the environment variables documented below. A safety pause must be allowed to expire rather than bypassed with repeated retries.

### Moderation and protection

Anti-link and anti-spam moderation settings are stored per group. Admins may choose whether a detected violation is deleted, warned, or followed by a kick. Bot owners and group administrators are exempt from automated moderation.

```text
.antilink on
.antilink off
.antilink delete
.antilink warn
.antilink kick
.antilink allow <domain>
.antilink unallow <domain>
.antilink domains
.antilink clear
.antilinkwarn <custom warning>

.antispam on
.antispam off
.antispam delete
.antispam warn
.antispam kick
.antispamwarn <custom warning>

.moderationconfig
```

The moderation engine detects common links and repeated messages within a time window. Custom warning text supports `{user}`, `{url}`, `{domain}`, and `{count}` placeholders. The link allowlist supports exact domains and their subdomains, and the detector also normalizes common obfuscations such as `[dot]`, `(dot)`, and spaced `://` separators.

### Welcome and goodbye messages

Welcome and goodbye messages are triggered by group participant events and are configurable per group. Both message types support `{user}`, `{name}`, `{group}`, and `{count}` placeholders.

```text
.welcome on
.welcome off
.welcome text <custom welcome message>
.welcome reset

.goodbye on
.goodbye off
.goodbye text <custom goodbye message>
.goodbye reset

.welcomeconfig
```

The default welcome and goodbye templates use the Madara Uchiha visual theme, including themed headers, separators, quotations, group rules, and a powered-by footer.

### Itachi chat and auto-replies

The quote-based Madara chat system provides randomized Madara-themed responses and optional keyword-triggered replies. Auto-replies are stored per group and use a cooldown to reduce repeated responses.

```text
.madara
.madara <question or prompt>
.madaraauto on
.madaraauto off
.madaraauto text <template>
.madaraauto reset
.madaraconfig
```

Custom auto-reply templates support `{quote}` and `{user}`.

### Levels, XP, and rankings

Users earn activity XP with a cooldown. Profiles, levels, titles, progress bars, message counts, and group leaderboards are persisted by the bot. Itachi-themed titles include **Sharingan Initiate**, **Eternal Mangekyo**, **Susanoo Commander**, **Rinnegan Sovereign**, **Ghost of the Uchiha**, **Madara’s Successor**, and **Infinite Tsukuyomi Lord**.

```text
.rank
.profile
.leaderboard
.top
.level on
.level off
.levelconfig
```

### Numbered ban and unban pairs

The bot includes paired administrator commands from `.ban1`/`.unban1` through `.ban50`/`.unban50`. The base `.ban` and `.unban` commands are also available.

```text
.ban1     .unban1
.ban2     .unban2
...
.ban50    .unban50
```

These commands use protected group handlers and support a replied-to participant, a mentioned participant, or a supplied phone number where supported by the current group state.

### Auto-reactions and JID footer

Automatic reactions can be enabled persistently. The bot uses a broad emoji pool with varied per-message selection and repeat avoidance per chat.

```text
.autoreact on
.autoreact off
.autoreact status
```

The plural aliases `.autoreacts on/off/status` are also supported.

The optional JID footer is configurable by sender, chat, or both:

```text
.jidfooter on
.jidfooter off
.jidfooter sender
.jidfooter chat
.jidfooter both
.jidfooter status
```

The `.jid` alias is also available. JID footers apply to eligible outgoing text and caption responses when enabled.

### Fonts and text styling

The bot provides `.font1` through `.font50`, each using a different Unicode text style. The `.fonts` command displays the available font commands. Styles include bold, italic, script, fraktur, double-struck, monospace, decorative symbols, underlines, strike-through variants, and other Unicode designs.

```text
.fonts
.font1 <text>
.font2 <text>
...
.font50 <text>
```

### Media and sticker tools

Media commands include downloads and conversions for supported services, practical shortcut aliases, direct public-URL downloads, image transformations, text-to-speech, and sticker creation. The direct URL downloader accepts HTTP/HTTPS media and documents up to 25 MB while rejecting local and private-network addresses. The repaired `.sticker` command supports direct images, quoted images, wrapped media, short videos, and GIF-style video input. Video conversion uses FFmpeg when available and temporary files are cleaned up after processing.

| Command family | Examples |
|---|---|
| Downloads | `.song`, `.ytmp3`, `.video`, `.ytmp4`, `.youtube`, `.tiktok`, `.ttdl`, `.insta`, `.igdl`, `.facebook`, `.fbdown`, `.pinterest`, `.pindl`, `.twitter`, `.twtdl`, `.reddit`, `.reddown`, `.spotify`, `.spdl`, `.gdrive`, `.mf`, `.apk`, `.directdl`, `.urldl`, `.download`, `.customdl`, `.audiourl`, `.videourl`, `.imagedl`, `.docdl`, `.thumbnail` |
| Menu categories | `MEDIA & DOWNLOADS`, `CUSTOM DOWNLOADS`, `MEDIA UTILITIES`, `AI & FUN`, `MADARA CHAT`, `DPZ PROFILES & POETRY`, `MADARA RANKING`, `FONTS & TEXT`, `DISCOVERY & PRODUCTIVITY`, `TOOLS`, `CHANNEL SETTINGS`, `ISLAMIC` |
| Media conversion | `.sticker`, `.s`, `.toimg`, `.tomp3`, `.tts` |
| Image tools | `.blur`, `.invert`, `.crop`, `.flip`, `.grayscale`, `.removebg`, `.enlarge` |
| Search and information | `.google`, `.wiki`, `.define`, `.weather`, `.github`, `.whois`, `.dnslookup`, `.ipinfo`, `.npm`, `.yts` |

### Utility tools

The offline utility tools provide deterministic text, encoding, formatting, counting, and random-value operations without requiring an external API:

```text
.randomtool <min> <max>
.random <min> <max>
.timestamp <date>
.timecode <date>
.urlencode <text>
.urlenc <text>
.hextext <text>
.tohextext <text>
.jsonfmt <JSON text>
.jsonformat <JSON text>
.textstats <text>
.textstat <text>
.time
.date
.countdown 2026-12-31
.choose Option 1 | Option 2 | Option 3
.8ball <question>
.motivate
.password 16
.uuid
.color
.dice 20
.morse <text>
.remind <minutes> <message>
.timer <minutes>
```

`.randomtool` generates a value within a range. `.timestamp` returns ISO, Unix-seconds, and Unix-milliseconds formats. `.urlencode` safely encodes text for a URL, `.hextext` converts UTF-8 text to hexadecimal, `.jsonfmt` validates and pretty-prints JSON, and `.textstats` reports character, word, line, and byte counts.

### Madara fun commands

The fun command set is designed for lightweight entertainment and uses Madara-themed responses:

```text
.fortune
.compatibility
.madarafact
.wisdom
.battle
.shinobibattle
.prediction <question>
.predict <question>
.shinobiquiz
.quiz
.roastme
.praise
.joke
.meme
.dare
.truth
.ascii <text>
.roast <text>
.compliment <text>
.ship <user1> <user2>
.quote
.fact
.trivia
.coinflip
.roll
.8ball <question>
.choose Option 1 | Option 2
```

The fun handlers are local and safe for group use. Predictions, compatibility scores, battles, fortunes, quizzes, roasts, and praise are randomized for varied responses.

### Discovery and productivity

Additional discovery and productivity commands include `.news`, `.movie`, `.manga`, `.lyrics`, `.tagme`, `.listonline`, `.snipe`, `.editmsg`, and `.react`. Commands that contact external services may require a working network connection or provider availability.

### Islamic commands

The bot includes `.quran`, `.hadith`, `.prayer`, `.qibla`, and `.asmaulhusna` commands for Islamic information and reference utilities.

### Pairing and operation

The web pairing flow accepts a WhatsApp number with country code, normalizes formatting such as spaces, plus signs, and hyphens, rejects invalid lengths, and requests a pairing code only for unregistered credentials. The flow also supports QR linking through the **Link with QR** control.

Phone pairing now waits for Baileys to report either the initial QR/handshake signal or an open transport before calling `requestPairingCode`, which prevents the common race where a code request is sent before the socket has started its transport. The code request accepts alphanumeric WhatsApp codes, displays them in four-character groups, and supports tap-to-copy on mobile and desktop. Users do not enter or manage a session ID.

The connection layer caches the Baileys version lookup, falls back to the bundled compatible version if the remote lookup is unavailable, uses persistent `SESSION_DIR` storage, and retries transient connection failures with guarded exponential backoff. Each socket has a generation guard so stale events from an older socket cannot mark a newer connection as disconnected. During phone-code linking, temporary WhatsApp stream restarts preserve the pairing auth state and retry with the original number instead of invalidating the attempt. Pairing-code sessions are not silently restarted after expiry or a permanent logout; users receive a clear error and can request a fresh code.

For Railway or another persistent deployment, configure:

```text
SESSION_DIR=/app/session
PAIRING_CONNECTION_TIMEOUT_MS=20000
PAIRING_READY_DELAY_MS=750
```

The pairing flow reports failures without using an invalid authentication-state property.

## Cross-platform deployment and pairing

ITACHI UCHIHA MD is a server-hosted WhatsApp bot. The Node.js process runs on Railway, Docker, a VPS, or another always-on host; users do not need Node.js installed on their phone or computer. Any modern browser can open the pairing dashboard from Android, iPhone, iPad, Windows, macOS, or Linux.

| Platform | How to use the dashboard | WhatsApp linking method |
|---|---|---|
| Android phone or tablet | Open the HTTPS deployment URL in Chrome, Samsung Internet, or Firefox | Enter the phone pairing code or scan the QR code from WhatsApp Linked Devices |
| iPhone or iPad | Open the HTTPS deployment URL in Safari or Chrome | Use the copied pairing code or scan the QR code from WhatsApp Linked Devices |
| Windows | Open the HTTPS deployment URL in Chrome, Edge, or Firefox | Link the WhatsApp account using the pairing code or QR option |
| macOS | Open the HTTPS deployment URL in Safari, Chrome, or Firefox | Link the WhatsApp account using the pairing code or QR option |
| Linux | Open the HTTPS deployment URL in Firefox, Chromium, or another modern browser | Link the WhatsApp account using the pairing code or QR option |

For phone pairing, enter the number with its country code and without `+`, spaces, or hyphens. Request a fresh code, tap the displayed code to copy the clean eight-character value, and enter it immediately in **WhatsApp → Settings → Linked Devices → Link a Device**. QR linking is available when scanning is more convenient. The dashboard uses responsive layout, mobile safe-area support, touch-friendly controls, browser-compatible Clipboard fallback, Socket.IO reconnection, and installable web-app metadata.

The server must remain online for the bot to work. A phone, computer, Mac, or iPhone is only the control device used to open the dashboard; it does not replace the always-on Node.js deployment. Use HTTPS in production because browser clipboard access and reliable Socket.IO connections are restricted on insecure pages.

## Installation

Clone the repository and install the declared dependencies:

```bash
git clone https://github.com/itachi-uchia34/Madara-Uchiha-MD.git
cd Madara-Uchiha-MD
npm install
npm start
```

For development, use:

```bash
npm run dev
```

The project also includes Railway deployment configuration in `railway.toml` and a PM2-compatible `ecosystem.config.js`.

## Environment variables

Copy `.env.example` to `.env` and configure the values required by your deployment:

| Variable | Purpose |
|---|---|
| `OWNER_NUMBER` | Owner WhatsApp number, preferably with country code |
| `OWNER_TELEGRAM_ID` | Owner Telegram ID when Telegram integration is used |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token for Telegram-side features |
| `OPENAI_API_KEY` | Optional AI integration key |
| `ADMIN_PASSWORD` | Dashboard or administrative password where enabled |
| `PORT` | HTTP server port when a web service is enabled |
| `SESSION_DIR` | Persistent Baileys authentication directory; use a mounted volume in deployment |
| `PAIRING_CONNECTION_TIMEOUT_MS` | Maximum wait for the WhatsApp transport before requesting a phone pairing code |
| `PAIRING_READY_DELAY_MS` | Compatibility fallback delay when the installed Baileys build lacks a connection waiter |
| `ANTI_ABUSE_ENABLED` | Enable or disable the outbound safety guard; keep `true` for normal operation |
| `ANTI_ABUSE_MIN_DELAY_MS` | Minimum delay between ordinary outgoing messages |
| `ANTI_ABUSE_REACTION_DELAY_MS` | Minimum delay between outgoing reactions |
| `ANTI_ABUSE_WINDOW_MS` | Rolling rate-limit window |
| `ANTI_ABUSE_MAX_MESSAGES` | Maximum outgoing messages allowed within the rolling window |
| `ANTI_ABUSE_MAX_BROADCAST` | Maximum recipients allowed for owner broadcasts; default `25` |
| `ANTI_ABUSE_DUPLICATE_WINDOW_MS` | Time window for suppressing duplicate payloads |
| `ANTI_ABUSE_PAUSE_MS` | Automatic circuit-breaker pause duration after risky provider errors |

Never commit real tokens, passwords, session credentials, or private keys. Use deployment secrets or environment variables instead.

## Startup image

The `.menu` and `.allmenu` commands use the following repository asset as their startup image:

```text
assets/madara_menu.png
```

To replace the image, keep the same path and filename or update the image path in `commands/allmenu.js` and the standard `.menu` handler in `index.js`.

## Project structure

| Path | Purpose |
|---|---|
| `index.js` | Main bot process, session management, event handling, and command dispatch |
| `commands/` | Command handlers and the command menu |
| `commands/allmenu.js` | Registry-driven complete menu with one command per line |
| `madara_style.js` | Shared Madara response wrapper and optional JID footer |
| `autoreact_emojis.js` | Broad emoji pool and varied reaction selector |
| `assets/madara_menu.png` | Startup image used by `.menu` and `.allmenu` |
| `settings.js` | Bot name, owner, prefix, and channel settings |
| `lib/` | Supporting utilities for conversion, metadata, uploads, permissions, and storage |

## Security and operational notes

The bot performs administrative actions only after permission checks. Deploy it only in groups where you have authorization to moderate participants. Keep owner credentials, pairing sessions, API keys, and dashboard passwords private. Review third-party downloader and API behavior before enabling commands that contact external services.

## License

This project is released under the MIT License.

## Maintainer

**ALI HAIDER ®** powers **ITACHI UCHIHA MD**.
