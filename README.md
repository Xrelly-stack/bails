# @xrelly-stack/bails

WhatsApp Modified By Lotus Seiren — Complete xrl API, updated with the latest methods and structure from `@vansnowi/baileys`.

## Install

```json
"dependencies": {
  "@xrelly-stack/bails": "^2.3.0"
}
```

## Import

```javascript
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@xrelly-stack/bails';
```

## Fitur & Pembaruan Terbaru

- Diperbarui menggunakan metode dan struktur dari `@vansnowi/baileys` (dukungan penuh ES Modules, `libsignal` versi standar, serta perbaikan protokol WhatsApp terbaru).
- Fix memory leak & CPU — mutex + offline batching + WeakMap cache.
- Anti-banned error 463 (Reachout Timelock).
- Protokol WA terbaru: LID mapping, TC Tokens, App State sync.
- Newsletter v2, Album message, `@all` mention (`mentionAll: true`).

### Shortcut Helpers

- `sendText`, `sendImage`, `sendVideo`, `sendAudio`, `sendDocument`
- `sendPoll`, `sendQuiz`, `sendLocation`, `sendPtv`
- `statusMention`

### Extended Messages

- `requestPaymentMessage`, `productMessage`, `albumMessage`
- `eventMessage`, `pollResultMessage`, `orderMessage`
- `groupStatus`, `groupLabel`
- `interactiveMessage`

## Contoh Penggunaan

```javascript
import makeWASocket, { useMultiFileAuthState } from '@xrelly-stack/bails';

const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
const sock = makeWASocket({ auth: state });

sock.ev.on('creds.update', saveCreds);

await sock.sendText('628xxx@s.whatsapp.net', 'Hello from updated Bails!');
```

## Requirements

- Node.js **>= 20**
