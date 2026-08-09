# @xrelly-stack/bails

Modified Bailyez, Connection Botz — Complete xrl API, updated with latest methods from `@vansnowi/baileys` and advanced anti-ban system from `baron-baileys-v2`.

## Instalasi

Gunakan versi terbaru dari npm:

```bash
npm install @xrelly-stack/bails@2.3.9
```

Atau tambahkan dependency secara manual:

```json
{
  "dependencies": {
    "@xrelly-stack/bails": "^2.3.9"
  }
}
```

Setelah memperbarui dari versi sebelumnya, disarankan memasang ulang dependency agar bundle CommonJS terbaru terambil:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Kompatibilitas Module

Paket ini menyediakan entry point CommonJS melalui `lib/index.cjs`, sehingga dapat digunakan dengan `require()` pada bot Node.js yang menggunakan CommonJS.

### CommonJS

```javascript
const makeWASocket = require('@xrelly-stack/bails').default;
const {
  useMultiFileAuthState,
  wrapSocket,
  AntiBan
} = require('@xrelly-stack/bails');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const sock = makeWASocket({ auth: state });

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') {
      console.log('Bot connected');
    }
  });
}

startBot().catch(console.error);
```

`makeWASocket` merupakan default export. Pada CommonJS, gunakan `.default` untuk mengambil fungsi tersebut, sedangkan helper lainnya diambil sebagai named export.

### ES Modules

```javascript
import makeWASocket, {
  useMultiFileAuthState,
  wrapSocket,
  AntiBan
} from '@xrelly-stack/bails';
```

Pastikan proyek ESM memiliki konfigurasi berikut pada `package.json`:

```json
{
  "type": "module"
}
```

## Perbaikan Kompatibilitas CommonJS

Mulai versi **2.3.8**, seluruh pemakaian `NodeCache` menggunakan named export agar konstruktor tidak berubah menjadi objek ketika dibundle ke CommonJS:

```javascript
import { NodeCache } from '@cacheable/node-cache';
```

Perubahan ini memperbaiki error berikut pada saat pembuatan socket:

```text
TypeError: import_node_cache2.default is not a constructor
```

Versi **2.3.9** juga memperbaiki integrasi `cache-manager`. Adapter internal menggunakan named export `createCache` dan menjembatani API store lama yang menggunakan `del` serta `keys`:

```javascript
import { createCache } from 'cache-manager';

const databaseConn = createCache({
  stores: [cacheStore]
});
```

Dengan demikian, penggunaan `MakeCacheManagerStore` pada bundle CommonJS tidak lagi bergantung pada `cacheManager.caching()` atau default export yang tidak tersedia pada `cache-manager` v7.

## Migrasi dari Versi Sebelumnya

Jika bot sebelumnya mengalami error `is not a constructor` atau error import `cache-manager`, perbarui paket ke versi 2.3.9 dan instal ulang dependency:

```bash
npm uninstall @xrelly-stack/bails
npm install @xrelly-stack/bails@2.3.9
```

Pastikan kode CommonJS menggunakan pola berikut:

```javascript
const bails = require('@xrelly-stack/bails');
const makeWASocket = bails.default;
```

Jangan menggunakan `require('@xrelly-stack/bails')` langsung sebagai fungsi tanpa `.default`, kecuali aplikasi Anda memang membungkus atau menormalisasi default export sendiri.

## Fitur & Pembaruan Utama

- **CommonJS Support:** Menyediakan bundle `lib/index.cjs` yang dapat dimuat dengan `require()`.
- **Cache Compatibility:** `NodeCache` dan `cache-manager` telah diperbaiki agar kompatibel dengan interop CommonJS.
- **Advanced Anti-Ban System (`antiban.js`):** Integrasi sistem pelindung sesi dari `baron-baileys-v2`, termasuk Rate Limiter, Message Queue, Content Variator, Presence Choreographer, dan Session Health Monitor.
- **Rich Menu Helper (`richMenu`):** Dukungan helper pengiriman menu interaktif dengan header, disclaimer, gambar, tombol interaktif, dan section berbasis GenAI.
- **Optimized Performance:** Perbaikan memory leak dan CPU melalui mutex, offline batching, serta WeakMap cache.
- **Protokol WA Terbaru:** LID mapping, TC Tokens, App State sync, Newsletter v2, dan Album message.

### Shortcut Helpers

- `sendText`, `sendImage`, `sendVideo`, `sendAudio`, `sendDocument`
- `sendPoll`, `sendQuiz`, `sendLocation`, `sendPtv`
- `richMenu`, `statusMention`

## Contoh Penggunaan Rich Menu Interaktif & Anti-Ban

```javascript
import makeWASocket, {
  useMultiFileAuthState,
  wrapSocket
} from '@xrelly-stack/bails';

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({ auth: state });

  const protectedSock = wrapSocket(sock, {
    maxPerMinute: 10,
    minDelayMs: 1500,
    enableWarmUp: true
  });

  protectedSock.ev.on('creds.update', saveCreds);

  protectedSock.ev.on('connection.update', async ({ connection }) => {
    if (connection !== 'open') return;

    console.log('Connected with AntiBan protection active!');

    await protectedSock.richMenu('628xxx@s.whatsapp.net', {
      header: {
        title: 'Menu Bot Interaktif',
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
            display_text: 'Cek Status',
            id: 'status_menu'
          })
        },
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: 'Kunjungi Website',
            url: 'https://github.com/Xrelly-stack/bails'
          })
        }
      ]
    });
  });
}

startSock().catch(console.error);
```

## Troubleshooting CommonJS

Jika error lama masih muncul setelah instalasi, pastikan Node.js menggunakan versi paket yang benar:

```bash
npm list @xrelly-stack/bails
npm view @xrelly-stack/bails version
```

Output yang diharapkan adalah `2.3.9`. Jika versi masih lebih lama, hapus `node_modules` dan `package-lock.json`, lalu jalankan `npm install` kembali. Error `NodeCache is not a constructor` pada versi lama tidak dapat diperbaiki hanya dengan mengubah file bot; bundle paket perlu diperbarui.

## Requirements

- Node.js **>= 20**
- Node.js **>= 22** direkomendasikan untuk dependency cache terbaru

## Repository

- GitHub: <https://github.com/Xrelly-stack/bails>
- npm: <https://www.npmjs.com/package/@xrelly-stack/bails>
