const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const commandsDir = path.join(root, 'commands');
const commandFiles = fs.readdirSync(commandsDir).filter(name => name.endsWith('.js')).sort();
const indexText = fs.readFileSync(path.join(root, 'index.js'), 'utf8');
const styleText = fs.readFileSync(path.join(root, 'itachi_style.js'), 'utf8');
const registryStart = indexText.indexOf('const commands =');
const registryEnd = indexText.indexOf('\n};', registryStart);
const registryText = registryStart >= 0 && registryEnd >= 0 ? indexText.slice(registryStart, registryEnd + 3) : '';

const syntaxFailures = [];
for (const file of [path.join(root, 'index.js'), path.join(root, 'itachi_style.js'), ...commandFiles.map(f => path.join(commandsDir, f))]) {
  try { execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }); }
  catch (err) { syntaxFailures.push({ file: path.relative(root, file), error: String(err.stderr || err.message).trim() }); }
}

const requireRefs = [...registryText.matchAll(/require\(['"]\.\/commands\/([^'"]+)['"]\)/g)].map(m => m[1]);
const missingRegistryFiles = [...new Set(requireRefs.filter(ref => !fs.existsSync(path.join(commandsDir, `${ref}.js`))))];
const duplicateKeys = [];
const keyLines = registryText.split('\n').filter(line => /^\s{4,}[A-Za-z0-9_]+\s*:/.test(line));
const seenKeys = new Set();
for (const line of keyLines) {
  const key = line.trim().split(':')[0];
  if (seenKeys.has(key)) duplicateKeys.push(key); else seenKeys.add(key);
}

const exportIssues = [];
const exportSummary = [];
for (const file of commandFiles) {
  const text = fs.readFileSync(path.join(commandsDir, file), 'utf8');
  const named = [...text.matchAll(/module\.exports\s*=\s*\{([\s\S]*?)\};?/g)].flatMap(m => [...m[1].matchAll(/([A-Za-z_$][\w$]*)\s*(?=,|$)/g)].map(x => x[1]));
  const defaultExport = /module\.exports\s*=\s*(?!\{)/.test(text);
  const handlers = [...text.matchAll(/(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]);
  exportSummary.push({ file, named, defaultExport, handlers });
  if (!named.length && !defaultExport && !handlers.length) exportIssues.push({ file, issue: 'No detectable exports or functions' });
}

const styleChecks = {
  wrapperExists: /function\s+applyItachiStyle/.test(styleText),
  footerExists: /jidFooter|footer|jid/i.test(styleText),
  dispatcherUsesStyle: /applyItachiStyle/.test(indexText),
};

const result = {
  commandFileCount: commandFiles.length,
  registryRequireCount: requireRefs.length,
  syntaxFailures,
  missingRegistryFiles,
  duplicateKeys,
  exportIssues,
  styleChecks,
  exportSummary,
};
console.log(JSON.stringify(result, null, 2));
if (syntaxFailures.length || missingRegistryFiles.length || duplicateKeys.length || exportIssues.length || Object.values(styleChecks).some(v => !v)) process.exitCode = 1;
