const assert = require('assert');
const fs = require('fs');
const source = fs.readFileSync('index.js', 'utf8');

for (const token of [
  'this.reconnectAttempt = 0',
  'this.socketGeneration = 0',
  'scheduleReconnect(pairingNumber = null',
  'Math.min(30000, 1000 * (2 ** (this.reconnectAttempt - 1)))',
  'const socketGeneration = ++this.socketGeneration',
  'const isCurrentSocket = () => this.sock === socket && this.socketGeneration === socketGeneration',
  'if (!isCurrentSocket()) return;',
  'this.scheduleReconnect(this.pairingNumber,',
  'this.scheduleReconnect(null,',
  'this.reconnectAttempt = 0;'
]) assert(source.includes(token), `Missing connection-stability safeguard: ${token}`);

assert(!/this\.reconnectTimer\s*=\s*setTimeout\(\(\)\s*=>\s*this\.initialize/.test(source), 'Direct reconnect timers remain');
assert(!/if \(!this\.pairingNumber\) setTimeout\(\(\) => this\.initialize/.test(source), 'Unbounded initialization timer remains');
assert(source.includes("DisconnectReason.loggedOut || statusCode === 401"), 'Permanent logout handling missing');
assert(source.includes('this.clearUnregisteredAuth()'), 'Stale auth cleanup missing');
console.log('PASS connection stability checks: socket ownership, guarded backoff, stale-auth handling');
