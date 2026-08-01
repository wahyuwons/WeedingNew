# Heritage Series – Aruna static rebuild

Patch ini menggunakan full-page capture yang sudah tersedia di repository (`demo-heritage-series-aruna` atau `Index.html.txt`) sebagai sumber utama. Dengan metode ini, struktur DOM, class Elementor, inline styles, animasi, cover, navigation, gallery, music, serta script personalisasi nama tamu tetap mengikuti versi referensi—bukan dibuat ulang berdasarkan perkiraan visual.

## File yang perlu ditambahkan ke root repository

- `index.html`
- `aruna-loader.js`
- `aruna-runtime.js`
- `build-static.mjs`
- `package.json`
- `.nojekyll`
- `.github/workflows/pages.yml`

Jangan hapus file asli berikut:

- `demo-heritage-series-aruna`
- `Index.html.txt`
- folder `Assets`
- folder `CSS`
- folder `JS`

## Cara paling cepat: tanpa build

Upload `index.html`, `aruna-loader.js`, dan `aruna-runtime.js` ke root repository. Loader akan membaca source capture dari repository lalu merendernya sebagai halaman penuh.

Gunakan server HTTP; jangan membuka `index.html` langsung melalui `file://`, karena browser akan memblokir `fetch()` ke source file.

Contoh local preview:

```bash
python3 -m http.server 8080
```

Lalu buka:

```text
http://localhost:8080/
```

## Cara deploy yang direkomendasikan: GitHub Pages

1. Tambahkan seluruh file patch ke root repository.
2. Commit dan push ke branch `main`.
3. Buka **Repository Settings → Pages**.
4. Pada **Source**, pilih **GitHub Actions**.
5. Workflow akan membuat `dist/index.html` dari capture asli dan menyalin folder `Assets` ke output.

## Link personal nama tamu

Source asli sudah menggunakan class `.namatamu`. Patch juga menambahkan fallback sehingga parameter berikut didukung:

```text
https://domain-anda.com/?to=Jessica
https://domain-anda.com/?dear=Keluarga%20Bapak%20Ahmad
https://domain-anda.com/?kepada=Jeremy%20Kenerson
```

Parameter `to` adalah format yang direkomendasikan.

## Kenapa tidak membuat HTML baru dari nol

Rebuild manual tidak akan benar-benar pixel-identical karena halaman referensi menggunakan ribuan rule Elementor, file CSS khusus post, WeddingPress scripts, popup configuration, dan animation settings. Patch ini mempertahankan source capture asli lalu mengubahnya menjadi entry point yang dapat dideploy.

## Ketergantungan eksternal

Agar hasil visual tetap sedekat mungkin dengan referensi, file plugin/font/CSS yang tidak tersedia di repository tetap dimuat dari `attarivitation.com`. Asset gambar yang namanya cocok dengan folder `Assets` akan dilokalkan saat proses build.

Untuk versi yang sepenuhnya mandiri, semua stylesheet, font, audio, dan script eksternal harus diunduh serta dilisensikan terlebih dahulu. Setelah itu URL eksternal dapat diganti dengan local paths.

## Perubahan keamanan

Build dan loader menghapus Meta Pixel/Google tracking dari hasil clone. Ini tidak mengubah tampilan, tetapi mencegah domain baru mengirim analytics ke akun milik website referensi.

## QA minimum setelah deploy

Periksa pada mobile dan desktop:

- cover terkunci sebelum tombol **BUKA UNDANGAN** diklik;
- audio dimulai setelah klik;
- nama tamu tampil dari `?to=`;
- side menu dan anchor navigation bekerja;
- countdown tampil;
- gallery terbuka/tertutup dengan benar;
- tombol copy rekening bekerja;
- popup dan form RSVP tidak menghasilkan error console.

Form RSVP/comment bawaan masih menunjuk ke backend WordPress referensi. Untuk production, form tersebut perlu disambungkan ke backend milik Anda sendiri, misalnya Formspree, Supabase, Google Apps Script, atau endpoint WordPress Anda.
