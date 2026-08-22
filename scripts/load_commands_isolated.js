const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'commands');
const failures = [];
const loaded = [];
for (const name of fs.readdirSync(dir).filter(n => n.endsWith('.js')).sort()) {
  const file = path.join(dir, name);
  const code = `try { const m=require(${JSON.stringify(file)}); console.log(JSON.stringify({type:typeof m,keys:m&&typeof m==='object'?Object.keys(m):[]})); process.exit(0); } catch (e) { console.error(e.stack||String(e)); process.exit(1); }`;
  const result = spawnSync(process.execPath, ['-e', code], { encoding: 'utf8', timeout: 4000, killSignal: 'SIGKILL' });
  if (result.error || result.status !== 0) {
    failures.push({ name, error: result.error ? result.error.message : (result.stderr || `exit ${result.status}`).trim() });
  } else {
    try { loaded.push({ name, ...JSON.parse(result.stdout.trim().split('\n').pop()) }); }
    catch { failures.push({ name, error: `Invalid loader output: ${result.stdout}` }); }
  }
}
console.log(JSON.stringify({ count: loaded.length, failures, loaded }, null, 2));
if (failures.length) process.exitCode = 1;
