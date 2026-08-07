import makeWASocket, { useMultiFileAuthState, wrapSocket, AntiBan } from './lib/index.js';

async function startSock() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    // Inisialisasi socket Baileys standar
    const sock = makeWASocket({ auth: state });

    // Membungkus socket dengan sistem anti-ban dari baron-baileys-v2
    const protectedSock = wrapSocket(sock, {
        maxPerMinute: 10,
        minDelayMs: 1500,
        enableWarmUp: true
    });

    protectedSock.ev.on('creds.update', saveCreds);

    protectedSock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('Connected with AntiBan protection active!');
            
            // Pengiriman pesan otomatis aman dengan rate limiter & queue
            await protectedSock.sendText('628xxx@s.whatsapp.net', 'Halo, pesan ini dikirim dengan perlindungan Anti-ban!');
        }
    });
}

// startSock();
console.log('Example antiban integration script created successfully.');
