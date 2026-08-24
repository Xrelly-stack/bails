const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');

const bails = require('@xrelly-stack/bails');
const makeWASocket = bails.default;
const {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = bails;

const AUTH_DIR = path.resolve(process.env.AUTH_DIR || './auth_info');
const PHONE_NUMBER = String(process.env.PHONE_NUMBER || '').replace(/\D/g, '');
const PREFIX = process.env.PREFIX || '!';

let reconnecting = false;

function getPairingNumber() {
  if (PHONE_NUMBER) return Promise.resolve(PHONE_NUMBER);

  const rl = readline.createInterface({ input, output });
  return rl.question('Masukkan nomor WhatsApp dengan kode negara, tanpa + atau spasi: ')
    .then((value) => String(value).replace(/\D/g, ''))
    .finally(() => rl.close());
}

async function startBot() {
  fs.mkdirSync(AUTH_DIR, { recursive: true, mode: 0o700 });
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const versionInfo = await fetchLatestBaileysVersion().catch(() => null);

  const sock = makeWASocket({
    auth: state,
    ...(versionInfo?.version ? { version: versionInfo.version } : {}),
    printQRInTerminal: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'connecting') {
      console.log('Menghubungkan ke WhatsApp...');
      return;
    }

    if (connection === 'open') {
      reconnecting = false;
      console.log(`Terhubung sebagai ${sock.user?.id || 'unknown'}`);
      return;
    }

    if (connection !== 'close') return;

    const statusCode = lastDisconnect?.error?.output?.statusCode;
    const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      && statusCode !== DisconnectReason.connectionReplaced;

    if (!shouldReconnect) {
      console.error('Session berhenti. Alasan:', statusCode || 'unknown');
      return;
    }

    if (reconnecting) return;
    reconnecting = true;
    console.log('Koneksi terputus; mencoba reconnect dalam 3 detik...');
    setTimeout(() => startBot().catch((error) => {
      reconnecting = false;
      console.error('Reconnect gagal:', error);
    }), 3000);
  });

  if (!state.creds.registered) {
    const phoneNumber = await getPairingNumber();
    if (!/^\d{8,15}$/.test(phoneNumber)) {
      throw new Error('Nomor tidak valid. Gunakan format contoh 628123456789.');
    }

    // Tunggu socket siap sebelum meminta pairing code.
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const pairingCode = await sock.requestPairingCode(phoneNumber);
    console.log(`\nPairing code: ${pairingCode}`);
    console.log('Buka WhatsApp > Perangkat tertaut > Tautkan perangkat > Tautkan dengan nomor telepon.');
  }

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const message of messages) {
      if (!message.message || message.key.fromMe) continue;

      const remoteJid = message.key.remoteJid;
      const text = message.message.conversation
        || message.message.extendedTextMessage?.text
        || '';
      if (!text.startsWith(PREFIX)) continue;

      const [command] = text.slice(PREFIX.length).trim().split(/\s+/);
      if (command === 'ping') {
        await sock.sendMessage(remoteJid, { text: 'pong' }, { quoted: message });
      }
    }
  });
}

startBot().catch((error) => {
  console.error('Bot gagal dijalankan:', error);
  process.exitCode = 1;
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

module.exports = { startBot };

