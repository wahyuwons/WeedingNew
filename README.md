# RSVP & Wishes Fix V6

Fix ini mengganti perilaku demo pada form RSVP dengan sistem yang bekerja pada website statis.

## Yang diperbaiki

- Tombol Kirim tidak lagi menampilkan pesan "halaman ini hanya untuk demo".
- Form tidak lagi mencoba submit ke website Attarivitation.
- Nama, status hadir, jumlah tamu, dan ucapan divalidasi.
- Ucapan langsung tampil di bawah form.
- Nama tamu dari `?to=Nama` otomatis mengisi field Nama.
- Mendukung Google Sheets sebagai penyimpanan terpusat.
- Jika endpoint belum dipasang, form berjalan dalam mode preview menggunakan localStorage.

## Install otomatis

1. Extract folder ini di dalam repository `WeedingNew`.
2. Jalankan `INSTALL-RSVP.bat` pada Windows atau `./INSTALL-RSVP.sh` pada macOS/Linux.
3. Pastikan hasil akhir menampilkan `FINAL VERIFICATION: PASS`.
4. Preview `index.html` dengan Live Server dan hard refresh.

## Install manual

Copy ke root repository:

- `ww-rsvp-config.js`
- `ww-rsvp.js`
- `ww-rsvp.css`

Tambahkan sebelum `</head>`:

```html
<link rel="stylesheet" href="ww-rsvp.css?v=6">
```

Tambahkan sebelum `</body>`:

```html
<script src="ww-rsvp-config.js?v=6"></script>
<script src="ww-rsvp.js?v=6"></script>
```

## Hubungkan ke Google Sheets

Tanpa langkah ini, kiriman hanya tersimpan pada browser pengunjung yang mengirim.

1. Buat Google Sheet baru.
2. Buka **Extensions → Apps Script**.
3. Hapus kode default dan paste isi `google-apps-script/Code.gs`.
4. Klik **Deploy → New deployment**.
5. Type: **Web app**.
6. Execute as: **Me**.
7. Who has access: **Anyone**.
8. Deploy dan copy URL yang berakhir dengan `/exec`.
9. Buka `ww-rsvp-config.js` lalu paste URL tersebut:

```js
window.WW_RSVP_CONFIG = {
  endpoint: 'https://script.google.com/macros/s/XXXXXXXXXXXX/exec',
  storageKey: 'ww-rsvp-jihan-wahyu-v1',
  refreshInterval: 30000,
  displayLimit: 50,
  coupleName: 'Jihan & Wahyu'
};
```

10. Ubah versi script di `index.html` dari `v=6` ke `v=7`, lalu hard refresh.

## Test

Buka:

```text
http://127.0.0.1:5500/?to=Jessica
```

- Nama Jessica harus otomatis masuk ke field Nama.
- Klik Kirim tidak boleh membuka demo atau redirect.
- Setelah submit, status sukses muncul dan ucapan tampil di daftar.
- Setelah Google Sheets terhubung, row baru harus muncul di sheet `RSVP`.

## Production

Commit file berikut:

```text
index.html
ww-rsvp-config.js
ww-rsvp.js
ww-rsvp.css
```

Backup `index.before-rsvp-fix-v6.html` dapat dipindahkan keluar repository setelah QA selesai.
