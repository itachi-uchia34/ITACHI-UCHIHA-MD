const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.js'), 'utf8');
const start = index.indexOf('const commands =');
const registry = index.slice(start, index.indexOf('\n};', start) + 3);
const registrations = [];
for (const line of registry.split('\n')) {
  const match = line.match(/^\s*([A-Za-z0-9_]+):\s*require\(['"](\.\/commands\/[^'"]+)['"]\)(?:\.([A-Za-z0-9_$]+))?,?/);
  if (!match) continue;
  const [, key, request, property] = match;
  const file = path.join(root, request.replace(/^\.\//, '') + '.js');
  const expression = property ? `m[${JSON.stringify(property)}]` : 'm';
  const code = `try { const m=require(${JSON.stringify(file)}); process.stdout.write(JSON.stringify({callable:typeof ${expression}==='function'})); process.exit(0); } catch (e) { process.stderr.write(e.stack||String(e)); process.exit(1); }`;
  const result = spawnSync(process.execPath, ['-e', code], { encoding: 'utf8', timeout: 4000, killSignal: 'SIGKILL' });
  let callable = false;
  let error;
  if (result.status === 0) { try { callable = JSON.parse(result.stdout).callable; } catch { error = 'Invalid child output'; } }
  else error = result.error ? result.error.message : (result.stderr || `exit ${result.status}`).trim();
  registrations.push({ key, request, property: property || 'default', callable, ...(error ? { error } : {}) });
}
const keys = new Set(registrations.filter(r => r.callable).map(r => r.key));
const caseTargets = [];
for (const line of index.split('\n')) {
  if (!line.includes('case ') || !line.includes('commands.')) continue;
  const labels = [...line.matchAll(/case\s+'([^']+)'/g)].map(m => m[1]);
  const target = line.match(/commands\.([A-Za-z0-9_]+)/)?.[1];
  if (target) caseTargets.push({ labels, target });
}
const unresolvedTargets = [...new Set(caseTargets.map(x => x.target).filter(t => !keys.has(t)))].sort();
const duplicateTargetLabels = caseTargets.flatMap(x => x.labels).filter((label, i, arr) => arr.indexOf(label) !== i);
console.log(JSON.stringify({ registrations: registrations.length, callableRegistrations: registrations.filter(r => r.callable).length, missingHandlers: registrations.filter(r => !r.callable), unresolvedTargets, duplicateTargetLabels: [...new Set(duplicateTargetLabels)].sort() }, null, 2));
if (registrations.some(r => !r.callable) || unresolvedTargets.length || duplicateTargetLabels.length) process.exitCode = 1;
