# @xrelly-stack/bails

Modified Bailyez, Connection Botz — Complete xrl API, updated with latest methods from `@vansnowi/baileys` and advanced anti-ban system from `baron-baileys-v2`.

## Install

```json
"dependencies": {
  "@xrelly-stack/bails": "^2.3.0"
}
```

## Import

```javascript
import makeWASocket, { useMultiFileAuthState, wrapSocket, AntiBan } from '@xrelly-stack/bails';
```

## Fitur & Pembaruan Utama

- **ES Modules Support:** Menggunakan standar `import`/`export` modern (`"type": "module"`).
- **Advanced Anti-Ban System (`antiban.js`):** Integrasi sistem pelindung sesi dari `baron-baileys-v2` (Rate Limiter, Message Queue, Content Variator, Presence Choreographer, dan Session Health Monitor).
- **Rich Menu Helper (`richMenu`):** Dukungan helper pengiriman menu interaktif dengan header, disclaimer, gambar, tombol interaktif, dan section berbasis GenAI.
- **Optimized Performance:** Fix memory leak & CPU (mutex + offline batching + WeakMap cache).
- **Protokol WA Terbaru:** LID mapping, TC Tokens, App State sync, Newsletter v2, dan Album message.

### Shortcut Helpers

- `sendText`, `sendImage`, `sendVideo`, `sendAudio`, `sendDocument`
- `sendPoll`, `sendQuiz`, `sendLocation`, `sendPtv`
- `richMenu`, `statusMention`

## Contoh Penggunaan Rich Menu Interaktif & Anti-Ban

```javascript
import makeWASocket, { useMultiFileAuthState, wrapSocket } from '@xrelly-stack/bails';

async function startSock() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state });

    // Membungkus socket dengan sistem anti-ban
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
            
            // Kirim Rich Menu Interaktif dengan Tombol
            await protectedSock.richMenu('628xxx@s.whatsapp.net', {
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
                    text: 'Silakan pilih salah satu opsi tombol interaktif di bawah ini:'
                },
                footer: {
                    text: 'Powered by Xrelly-stack'
                },
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
        }
    });
}

startSock();
```

## Requirements

- Node.js **>= 20**
