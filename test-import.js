import makeWASocket, { DisconnectReason, useMultiFileAuthState, makeInMemoryStore } from './lib/index.js';

console.log('Testing Baileys module import...');
console.log('makeWASocket:', typeof makeWASocket);
console.log('DisconnectReason:', typeof DisconnectReason);
console.log('useMultiFileAuthState:', typeof useMultiFileAuthState);
console.log('makeInMemoryStore:', typeof makeInMemoryStore);

if (typeof makeWASocket === 'function' && typeof useMultiFileAuthState === 'function') {
    console.log('SUCCESS: All core Baileys methods loaded successfully!');
} else {
    console.error('ERROR: Some core functions are missing or not a function.');
    process.exit(1);
}
