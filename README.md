# @xrelly-stack/bails

Modified Bailyez, Connection Botz — Complete xrl API, updated with latest methods from `@vansnowi/baileys` and advanced anti-ban system from `baron-baileys-v2`.

## Instalasi

Gunakan versi terbaru dari npm:

```bash
npm install @xrelly-stack/bails@2.3.12
```

Atau tambahkan dependency secara manual:

```json
{
  "dependencies": {
    "@xrelly-stack/bails": "^2.3.12"
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

Versi **2.3.11 atau lebih** juga memperbaiki integrasi `cache-manager`. Adapter internal menggunakan named export `createCache` dan menjembatani API store lama yang menggunakan `del` serta `keys`:

```javascript
import { createCache } from 'cache-manager';

const databaseConn = createCache({
  stores: [cacheStore]
});
```

Dengan demikian, penggunaan `MakeCacheManagerStore` pada bundle CommonJS tidak lagi bergantung pada `cacheManager.caching()` atau default export yang tidak tersedia pada `cache-manager` v7.

## Migrasi dari Versi Sebelumnya

Jika bot sebelumnya mengalami error `is not a constructor` atau error import `cache-manager`, perbarui paket ke versi 2.3.12 dan instal ulang dependency:

```bash
npm uninstall @xrelly-stack/bails
npm install @xrelly-stack/bails@2.3.12
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

## Contoh Penggunaan Rich Menu Carousel & Anti-Ban

Contoh berikut menggunakan format `carousel` dengan beberapa kartu, tiga tombol pada setiap kartu, footer dengan URL dan gambar, serta `contextInfo` untuk pesan yang dikutip.

```javascript
import makeWASocket, {
  useMultiFileAuthState,
  wrapSocket
} from '@xrelly-stack/bails';

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({ auth: state });

  const snowi = wrapSocket(sock, {
    maxPerMinute: 10,
    minDelayMs: 1500,
    enableWarmUp: true
  });

  snowi.ev.on('creds.update', saveCreds);

  snowi.ev.on('connection.update', async ({ connection }) => {
    if (connection !== 'open') return;

    const from = '628xxx@s.whatsapp.net';

    await snowi.richMenu(from, {
      header: {
        disclaimer: true,
        disclaimerText: 'x',
        title: 'rich',
        image: {
          url: 'https://example.com/image.jpg',
          mime_type: 'image/jpeg'
          /*
          Inline rendering is only in white, so it is recommended
          only for transparent logos.
          inline: false,
          width: 100,
          height: 100
          */
        }
      },
      body: {
        carousel: true,
        cards: [
          {
            title: 'Menu1',
            buttons: [
              'menu2',
              'menu3',
              'rich3'
            ],
            toast: 'jaja'
          },
          {
            title: 'Menu2',
            buttons: [
              'test',
              'me',
              'rich2'
            ],
            toast: 'jaja'
          }
        ]
      },
      footer: {
        text: 'Telegram channel',
        url: 'https://t.me/jspacker',
        image: {
          url: 'https://example.com/image.png',
          height: 100,
          width: 100
        }
      },
      contextInfo: {
        quotedMessage: {
          stickerPackMessage: {
            name: 'A. x'
          }
        },
        remoteJid: 'status@broadcast',
        participant: ''
      }
    });
  });
}

startSock().catch(console.error);
```

Properti `body.carousel` harus bernilai `true`, sedangkan setiap elemen `body.cards` memiliki `title`, array `buttons`, dan `toast`. Sesuaikan `from`, URL gambar, serta isi tombol dengan kebutuhan bot Anda.

## Product Message

Versi terbaru mendukung pengiriman katalog produk melalui alias `productMessage` pada CommonJS. API ini menerima format flat yang lebih mudah digunakan.

```javascript
await sock.sendMessage(jid, {
  productMessage: {
    title: 'Produk Contoh',
    description: 'Deskripsi produk',
    thumbnail: {
      url: 'https://example.com/product.jpg'
    },
    productId: 'PROD001',
    retailerId: 'RETAIL001',
    url: 'https://example.com/product/PROD001',
    body: 'Detail produk',
    footer: 'Harga spesial',
    priceAmount1000: 50000,
    currencyCode: 'IDR',
    businessOwnerJid: '628123456789@s.whatsapp.net',
    buttons: [
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: 'Beli Sekarang',
          url: 'https://example.com/buy/PROD001'
        })
      }
    ]
  }
}, { quoted: m });
```

Properti `thumbnail` atau `product.productImage` harus berupa URL publik, buffer, atau sumber media yang didukung helper media. URL gambar sebaiknya menggunakan skema `https://` dan dapat diakses oleh proses bot. `priceAmount1000` mengikuti format WhatsApp dengan nilai harga dikalikan 1.000; untuk harga Rp50.000 gunakan `50000` jika implementasi Anda memang mengharapkan nilai nominal langsung, atau sesuaikan dengan format katalog Anda sebelum dikirim.

## Troubleshooting CommonJS

Jika error lama masih muncul setelah instalasi, pastikan Node.js menggunakan versi paket yang benar:

```bash
npm list @xrelly-stack/bails
npm view @xrelly-stack/bails version
```

Output yang diharapkan adalah `2.3.12`. Jika versi masih lebih lama, hapus `node_modules` dan `package-lock.json`, lalu jalankan `npm install` kembali. Error `NodeCache is not a constructor` pada versi lama tidak dapat diperbaiki hanya dengan mengubah file bot; bundle paket perlu diperbarui.

## Requirements

- Node.js **>= 20**
- Node.js **>= 22** direkomendasikan untuk dependency cache terbaru

## Repository

- GitHub: <https://github.com/Xrelly-stack/bails>
- npm: <https://www.npmjs.com/package/@xrelly-stack/bails>
