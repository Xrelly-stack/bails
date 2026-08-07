# Panduan Sistem Anti-Ban (Baron-Baileys-v2)

Modul `antiban.js` yang diintegrasikan dari `baron-baileys-v2` mencakup fitur-fitur canggih berikut:

1. **Rate Limiter & Message Queue**: Mengatur pembatasan pesan per menit/jam/hari serta jeda minimum antar pesan.
2. **Content Variator**: Mencegah deteksi pesan berulang yang identik.
3. **Presence Choreographer**: Mensimulasikan aktivitas online, mengetik, dan jeda acak secara natural.
4. **Timelock & Reconnect Guard**: Mencegah error 463 dan menangani pemulihan sesi otomatis.
5. **Health Monitor**: Memantau kesehatan koneksi dan mendeteksi error kriptografi (MAC error).
