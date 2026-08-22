const EMOJIS = [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💖', '💗', '💓', '💞', '💕', '💘', '💝', '💟',
    '👍', '👎', '👏', '🙌', '🫶', '🤝', '🤲', '🙏', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '💪', '🫡',
    '🔥', '✨', '⭐', '🌟', '💫', '⚡', '💥', '🌈', '☀️', '🌙', '🌑', '🌕', '☄️', '🌪️', '❄️', '☔',
    '😂', '🤣', '😅', '😆', '😉', '😊', '😎', '😍', '🥰', '😘', '😜', '🤪', '🤩', '😇', '🙂', '🙃',
    '😮', '😲', '😳', '🤯', '😱', '😨', '😰', '😢', '😭', '😤', '😡', '🤬', '🤔', '🧐', '🤨', '😏',
    '👀', '👁️', '🫣', '🧠', '💡', '🎯', '✅', '❌', '⚠️', '❗', '❓', '‼️', '⁉️', '💯', '💢', '💤',
    '🎉', '🎊', '🥳', '🎈', '🎁', '🏆', '🥇', '👑', '💎', '🪙', '🎵', '🎶', '📌', '📣', '📢', '🔔',
    '⚔️', '🗡️', '🛡️', '🏯', '🥷', '👻', '☠️', '💀', '👹', '👺', '🐉', '🦅', '🐺', '🦁', '🐍', '🦂',
    '🍀', '🌹', '🌸', '🌺', '🌻', '🌿', '🍂', '🌊', '🍕', '🍔', '🍟', '🍿', '☕', '🍵', '🍰', '🍫',
    '🚀', '✈️', '🏁', '🎮', '🎲', '🎸', '🎬', '📸', '💻', '📱', '🔒', '🔑', '🧿', '🌀', '♾️', '☯️'
];
const lastByChat = new Map();

function nextReaction(chatId, messageId = '') {
    let seed = 0;
    for (const character of `${chatId}:${messageId}`) seed = (seed * 31 + character.codePointAt(0)) >>> 0;
    let index = seed % EMOJIS.length;
    const previous = lastByChat.get(chatId);
    if (EMOJIS.length > 1 && EMOJIS[index] === previous) index = (index + 1) % EMOJIS.length;
    const reaction = EMOJIS[index];
    lastByChat.set(chatId, reaction);
    return reaction;
}

module.exports = { EMOJIS, nextReaction };
