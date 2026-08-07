import makeWASocket, { useMultiFileAuthState } from './lib/index.js';

async function startSock() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('Connected to WhatsApp!');
            
            const jid = '628xxx@s.whatsapp.net'; // Ganti dengan JID tujuan

            // Contoh penggunaan fungsi richMenu
            try {
                await sock.richMenu(jid, {
                    header: {
                        title: 'Menu Utama Bot',
                        disclaimer: true,
                        disclaimerText: 'Pesan otomatis dari sistem',
                        image: {
                            url: 'https://example.com/image.jpg',
                            mime_type: 'image/jpeg',
                            width: 500,
                            height: 500
                        }
                    },
                    body: {
                        text: 'Silakan pilih opsi di bawah ini:'
                    },
                    footer: {
                        text: 'Powered by Xrelly-stack'
                    }
                });
                console.log('RichMenu sent successfully!');
            } catch (error) {
                console.error('Failed to send richMenu:', error);
            }
        }
    });
}

// startSock();
console.log('Example script created successfully.');
