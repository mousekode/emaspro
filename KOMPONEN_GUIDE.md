# 📚 GoldChain Components Guide

## Cara Menggunakan Komponen

Semua komponen dimuat menggunakan fungsi `renderComponent()` dari helper.

### Syntax Dasar
```php
<?= renderComponent('NamaKomponen', ['prop1' => $value1, 'prop2' => $value2], '<slot content>'); ?>
```

## Daftar Komponen

### 1. **Header.php**
Menampilkan navbar utama dengan logo, network info, dan tombol wallet connection.

**Lokasi**: `src/assets/components/Header.php`

**Penggunaan**:
```php
<?= renderComponent('Header'); ?>
```

**Fitur**:
- Logo GoldChain
- Network badge (Sepolia)
- Connect Wallet button

---

### 2. **RegistryStats.php**
Panel untuk menampilkan informasi sistem dan wallet yang terhubung.

**Lokasi**: `src/assets/components/RegistryStats.php`

**Penggunaan**:
```php
<?= renderComponent('RegistryStats', [
    'walletConnected' => true,
    'walletAddress' => '0x123...'
]); ?>
```

**Props**:
- `walletConnected` (bool) - Apakah wallet sudah terhubung
- `walletAddress` (string) - Alamat wallet

---

### 3. **MintingPanel.php**
Form untuk membuat sertifikat emas baru dan menu revoke.

**Lokasi**: `src/assets/components/MintingPanel.php`

**Penggunaan**:
```php
<?= renderComponent('MintingPanel'); ?>
```

**Fitur**:
- Input Serial Number
- Input Batch Produksi
- Tombol Issue Gold Certificate
- Menu Revoke/Pembatalan

**JavaScript Functions yang Digunakan**:
- `buatSertifikatEmas()` - Untuk minting sertifikat
- `ubahStatusValidasi()` - Untuk revoke sertifikat

---

### 4. **CertificateVerifier.php**
Input field untuk query dan verifikasi sertifikat dari blockchain.

**Lokasi**: `src/assets/components/CertificateVerifier.php`

**Penggunaan**:
```php
<?= renderComponent('CertificateVerifier'); ?>
```

**Fitur**:
- Input Serial Number dengan prefix #
- Tombol Query Registry
- Toast message display area

**JavaScript Functions yang Digunakan**:
- `cekKeaslianEmas()` - Query ke blockchain

---

### 5. **CertificateSheet.php**
Template visual untuk menampilkan sertifikat emas yang telah diverifikasi.

**Lokasi**: `src/assets/components/CertificateSheet.php`

**Penggunaan**:
```php
<?= renderComponent('CertificateSheet'); ?>
```

**Fitur**:
- Placeholder saat tidak ada sertifikat
- Template visual sertifikat premium
- Dynamic rendering berdasarkan query blockchain
- Status badge (VERIFIED, INVALID, REVOKED)

**JavaScript Data yang Digunakan**:
- `certSerial` - Nomor seri
- `certStatusMsg` - Pesan status
- `certBatch` - Batch produksi
- `certDate` - Tanggal blockchain
- `stampText` - Status badge

---

## Alur Kerja Aplikasi

```
1. User akses halaman / atau /home
   ↓
2. index.php routing → resolveRoute() → HomeView.php
   ↓
3. HomeView.php merangkai komponen:
   - Header (navbar & wallet)
   - RegistryStats (info sistem)
   - MintingPanel (form minting)
   - CertificateVerifier (input query)
   - CertificateSheet (display sertifikat)
   ↓
4. JavaScript functions di goldchain.js:
   - connectWallet() → Web3 connection
   - buatSertifikatEmas() → daftarkanEmas() contract call
   - cekKeaslianEmas() → cekKeaslian() contract call
   - ubahStatusValidasi() → batalkanEmas() contract call
   ↓
5. Smart Contract (Sepolia testnet)
   - VerifikasiEmasPro contract
   - On-chain verification
```

---

## Membuat Komponen Baru

Template untuk membuat komponen baru:

```php
<?php
// src/assets/components/NamaKomponen.php
// Props yang diterima akan otomatis di-extract menjadi variabel
// Contoh: renderComponent('NamaKomponen', ['title' => 'Hello'])
// Di dalam komponen, bisa langsung gunakan: echo $title;
?>

<div class="component-container">
    <!-- HTML markup -->
</div>
```

**Penting**:
- Simpan file dengan ekstensi `.php`
- Props otomatis di-extract via `extract($props)` di renderComponent()
- Gunakan Tailwind classes untuk styling

---

## JavaScript Functions (goldchain.js)

Semua functions ini global scope dan bisa dipanggil dari onclick handlers:

### `connectWallet()`
Koneksi ke MetaMask dan initialize ethers.js

### `buatSertifikatEmas()`
Membuat sertifikat emas baru (require wallet + contract interaction)

### `cekKeaslianEmas()`
Query sertifikat dari blockchain dan render certificate sheet

### `ubahStatusValidasi()`
Membatalkan/revoke sertifikat (admin only)

### `showToast(msg, classes)`
Menampilkan toast notification dengan pesan custom

---

## Troubleshooting

### Komponen tidak muncul
- Cek apakah file komponen ada di `src/assets/components/`
- Pastikan nama file sesuai dengan nama komponen
- Verifikasi syntax PHP

### JavaScript function undefined
- Pastikan `src/assets/js/goldchain.js` sudah di-include di Layout.php
- Cek browser console untuk error messages

### Styling tidak bekerja
- Verifikasi Tailwind CSS CDN sudah loaded di Layout.php
- Cek custom CSS di `src/assets/css/goldchain.css`

---

**Created**: June 2026
**Last Updated**: 2026-06-17
**Version**: 1.0
