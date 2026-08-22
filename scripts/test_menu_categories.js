const assert = require('assert');
const allMenu = require('../commands/allmenu');
const thumbnail = require('../commands/thumbnail');

const groups = allMenu.MENU_GROUPS;
for (const category of ['MEDIA & DOWNLOADS', 'CUSTOM DOWNLOADS', 'MEDIA UTILITIES']) {
  assert(Array.isArray(groups[category]), `missing menu category: ${category}`);
}
for (const command of ['directdl', 'urldl', 'download', 'customdl', 'audiourl', 'videourl', 'imagedl', 'docdl']) {
  assert(groups['CUSTOM DOWNLOADS'].includes(command), `custom download missing: ${command}`);
}
for (const command of ['thumbnail', 'lyrics', 'sticker']) {
  assert(groups['MEDIA UTILITIES'].includes(command), `media utility missing: ${command}`);
}
const menuText = allMenu.buildMenuText({}, {
  directdl: () => {}, urldl: () => {}, download: () => {}, customdl: () => {},
  audiourl: () => {}, videourl: () => {}, imagedl: () => {}, docdl: () => {},
  thumbnail: () => {}, lyrics: () => {}, sticker: () => {}
});
assert(menuText.includes('CUSTOM DOWNLOADS'));
assert(menuText.includes('.customdl'));
assert(menuText.includes('.thumbnail'));
assert(menuText.includes('POWERED BY'));
assert.strictEqual(thumbnail._test.youtubeId('https://youtu.be/jNQXAC9IVRw'), 'jNQXAC9IVRw');
assert.strictEqual(thumbnail._test.getQuery({ message: { conversation: '.thumbnail' } }), '');
console.log('PASS main menu category and custom download tests');
