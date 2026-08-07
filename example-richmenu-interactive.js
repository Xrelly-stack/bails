import makeWASocket, { useMultiFileAuthState, wrapSocket } from './lib/index.js';

async function startSock() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state });

    const protectedSock = wrapSocket(sock, {
        maxPerMinute: 10,
        minDelayMs: 1500
    });

    protectedSock.ev.on('creds.update', saveCreds);

    protectedSock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('Connected to WhatsApp!');
            
            const jid = '628xxx@s.whatsapp.net'; // Ganti dengan JID tujuan

            // Contoh penggunaan richMenu dengan header, body, footer, dan tombol interaktif
            try {
                await protectedSock.richMenu(jid, {
                    header: {
                        title: '🤖 Menu Bot Interaktif',
                        disclaimer: true,
                        disclaimerText: 'Layanan Otomatis WhatsApp Bot',
                        image: {
                            url: 'https://example.com/banner.jpg',
                            mime_type: 'image/jpeg',
                            width: 800,
                            height: 400
                        }
                    },
                    body: {
                        text: 'Silakan pilih salah satu opsi tombol interaktif di bawah ini untuk melanjutkan transaksi atau informasi bot:'
                    },
                    footer: {
                        text: 'Powered by Xrelly-stack & Baron Engine'
                    },
                    // Contoh struktur tombol / interactive actions jika didukung oleh helper
                    nativeFlowButtons: [
                        {
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📌 Cek Status',
                                id: 'status_menu'
                            })
                        },
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '🌐 Kunjungi Website',
                                url: 'https://github.com/Xrelly-stack/bails'
                            })
                        }
                    ]
                });
                console.log('Interactive RichMenu sent successfully!');
            } catch (error) {
                console.error('Failed to send interactive richMenu:', error);
            }
        }
    });
}

// startSock();
console.log('Interactive richMenu example created successfully.');
