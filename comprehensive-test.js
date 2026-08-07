import makeWASocket, { 
    DisconnectReason, 
    useMultiFileAuthState, 
    makeInMemoryStore, 
    Browsers, 
    generateWAMessageFromContent,
    jidNormalizedUser,
    isJidGroup,
    proto
} from './lib/index.js';

console.log('=== STARTING COMPREHENSIVE BAILEYS MODULE TEST ===');

try {
    console.log('[1/4] Testing module imports...');
    assert(typeof makeWASocket === 'function', 'makeWASocket must be a function');
    assert(typeof useMultiFileAuthState === 'function', 'useMultiFileAuthState must be a function');
    assert(typeof makeInMemoryStore === 'function', 'makeInMemoryStore must be a function');
    assert(typeof jidNormalizedUser === 'function', 'jidNormalizedUser must be a function');
    assert(typeof isJidGroup === 'function', 'isJidGroup must be a function');
    console.log('-> All core imports verified successfully.');

    console.log('[2/4] Testing utility functions...');
    const normalized = jidNormalizedUser('628123456789@s.whatsapp.net');
    assert(normalized === '628123456789@s.whatsapp.net', 'jidNormalizedUser failed');
    
    const isGroup = isJidGroup('123456789-group@g.us');
    assert(isGroup === true, 'isJidGroup failed for group');
    
    const isNotGroup = isJidGroup('628123456789@s.whatsapp.net');
    assert(isNotGroup === false, 'isJidGroup failed for user');
    console.log('-> Utility functions verified successfully.');

    console.log('[3/4] Testing store creation...');
    const store = makeInMemoryStore({});
    assert(store && typeof store.bind === 'function', 'makeInMemoryStore should return a store object with bind method');
    console.log('-> Store creation verified successfully.');

    console.log('[4/4] Testing socket initialization (offline config check)...');
    // We test creating socket instance configuration without actual network connection
    const sock = makeWASocket({
        printQRInTerminal: false,
        browser: Browsers.macOS('Desktop'),
        auth: {
            creds: {
                noiseKey: { private: Buffer.alloc(32), public: Buffer.alloc(32) },
                pairingEphemeralKeyPair: { private: Buffer.alloc(32), public: Buffer.alloc(32) },
                signedIdentityKey: { private: Buffer.alloc(32), public: Buffer.alloc(32) },
                signedPreKey: { keyPair: { private: Buffer.alloc(32), public: Buffer.alloc(32) }, signature: Buffer.alloc(64), keyId: 1 },
                registrationId: 123,
                advSecretKey: 'test',
                processedHistoryMessages: [],
                nextPreKeyId: 1,
                firstUnuploadedPreKeyId: 1,
                accountSettings: { unarchiveChats: false }
            },
            keys: {
                get: async () => ({}),
                set: async () => {}
            }
        }
    });

    assert(sock && typeof sock.sendMessage === 'function', 'Socket must have sendMessage method');
    assert(sock && typeof sock.richMenu === 'function', 'Socket must have richMenu method');
    assert(sock && typeof sock.relayMessage === 'function', 'Socket must have relayMessage method');
    console.log('-> Socket methods and helpers verified successfully.');

    console.log('=== ALL COMPREHENSIVE TESTS PASSED SUCCESSFULLY! ===');
} catch (error) {
    console.error('TEST FAILED:', error);
    process.exit(1);
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}
