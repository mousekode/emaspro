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
- Network badge (Remix Dummy)
- Connect Dummy Wallet button yang membuka modal wallet dummy

---

### 2. **DummyWalletModal.php**
Modal untuk memilih akun dummy Remix dan mengelola authorization contract demo.

**Lokasi**: `src/assets/components/DummyWalletModal.php`

**Penggunaan**:
```php
<?= renderComponent('DummyWalletModal'); ?>
```

**Fitur**:
- Daftar akun dummy Remix
- Role wallet dibaca dari dummy contract state, bukan hardcoded di wallet
- Panel Contract Authorization
- Admin dapat menjalankan `addAuthorized` dan `removeAuthorized`
- Authorization disimpan di `localStorage` sebagai state contract demo

**Catatan Authorization**:
- `Account 1` dianggap deployer awal, sehingga menjadi `admin`
- Saat state pertama dibuat, hanya `admin` yang masuk `authorizedList`
- `Account 2` dan `Account 3` menjadi issuer hanya setelah admin menekan Authorize
- Public verifier tetap bisa menjalankan query sertifikat tanpa authorization
- Role dibaca dari contract helper: `getRole()`, `getRoleName()`, `canIssue()`, dan `canManageAuthorization()`

---

### 3. **RegistryStats.php**
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

### 4. **MintingPanel.php**
Form untuk membuat sertifikat emas baru, mengubah nama pemilik, dan menu revoke.

**Lokasi**: `src/assets/components/MintingPanel.php`

**Penggunaan**:
```php
<?= renderComponent('MintingPanel'); ?>
```

**Fitur**:
- Input Serial Number
- Input Batch Produksi
- Input Nama Pemilik Awal
- Tombol Issue Gold Certificate
- Menu Ubah Nama Pemilik Sertifikat
- Menu Revoke/Pembatalan

**JavaScript Functions yang Digunakan**:
- `buatSertifikatEmas()` - Untuk minting sertifikat
- `ubahPemilikSertifikat()` - Untuk mengubah nama pemilik sertifikat
- `ubahStatusValidasi()` - Untuk revoke sertifikat

**Aturan Authorization**:
- Mint, ubah pemilik, dan revoke membutuhkan wallet yang masuk `authorizedList`
- Admin selalu authorized
- Wallet public akan menerima error `Akses ditolak: Alamat tidak terauthorisasi!`

---

### 5. **CertificateVerifier.php**
Input field untuk query dan verifikasi sertifikat dari registry dummy lokal.

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
- `cekKeaslianEmas()` - Query ke dummy contract registry

---

### 6. **CertificateSheet.php**
Template visual untuk menampilkan sertifikat emas yang telah diverifikasi.

**Lokasi**: `src/assets/components/CertificateSheet.php`

**Penggunaan**:
```php
<?= renderComponent('CertificateSheet'); ?>
```

**Fitur**:
- Placeholder saat tidak ada sertifikat
- Template visual sertifikat premium
- Dynamic rendering berdasarkan query dummy contract registry
- Status badge (VERIFIED, INVALID, REVOKED)

**JavaScript Data yang Digunakan**:
- `certSerial` - Nomor seri
- `certStatusMsg` - Pesan status
- `certOwner` - Nama pemilik sertifikat
- `certBatch` - Batch produksi
- `certDate` - Tanggal registry
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
   - DummyWalletModal (wallet dummy & authorization)
   - RegistryStats (info sistem)
   - MintingPanel (form minting)
   - CertificateVerifier (input query)
   - CertificateSheet (display sertifikat)
   ↓
4. JavaScript functions di goldchain.js:
   - openWalletModal() → buka modal dummy wallet
   - connectWallet(index) → pilih akun dummy Remix
   - authorizeSelectedWallet() → addAuthorized() dummy contract
   - removeSelectedAuthorization() → removeAuthorized() dummy contract
   - buatSertifikatEmas() → daftarkanEmas() dummy contract call
   - ubahPemilikSertifikat() → ubahPemilikSertifikat() dummy contract call
   - cekKeaslianEmas() → cekKeaslian() dummy contract call
   - ubahStatusValidasi() → batalkanEmas() dummy contract call
   ↓
5. Dummy Contract State (Remix-style local mode)
   - VerifikasiEmasPro access rules
   - admin, authorizedList, role helpers, registry sertifikat
   - Data tersimpan di browser localStorage
```

---

## Contract Role Model

`contract/EmasPro.sol` menyimpan authorization di contract, bukan di wallet. Role diturunkan dari state:

- `Admin` - alamat deployer contract
- `Authorized Issuer` - alamat yang masuk `authorizedList`
- `Public Verifier` - alamat publik yang tidak masuk authorization

Helper contract yang tersedia:

- `isAdmin(address)` - true jika alamat adalah admin
- `canIssue(address)` - true jika alamat boleh mint/revoke
- `canManageAuthorization(address)` - true jika alamat boleh add/remove authorization
- `getRole(address)` - return enum numerik: 0 Public, 1 Authorized, 2 Admin
- `getRoleName(address)` - return label role untuk Remix/frontend
- `getAuthorizedList()` - return daftar issuer authorized
- `ubahPemilikSertifikat(string,string)` - mengubah nama pemilik sertifikat

Fungsi lama tetap dipakai dan backward-compatible:

- `addAuthorized(address)`
- `removeAuthorized(address)`
- `isAuthorized(address)`
- `daftarkanEmas(string,string)`
- `daftarkanEmas(string,string,string)`
- `batalkanEmas(string)`
- `cekKeaslian(string)`

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
Memilih akun dummy Remix dari modal dan membuat adapter `DummyVerifikasiEmasPro`.

### `openWalletModal()` / `closeWalletModal()`
Membuka dan menutup modal wallet dummy.

### `authorizeSelectedWallet()`
Menjalankan `addAuthorized()` pada dummy contract state. Hanya bisa dipanggil oleh admin.

### `removeSelectedAuthorization()`
Menjalankan `removeAuthorized()` pada dummy contract state. Hanya bisa dipanggil oleh admin dan tidak bisa menghapus admin.

### `buatSertifikatEmas()`
Membuat sertifikat emas baru dengan serial, batch, dan nama pemilik awal. Membutuhkan wallet yang masuk `authorizedList`.

### `ubahPemilikSertifikat()`
Mengubah nama pemilik sertifikat berdasarkan serial number. Membutuhkan wallet yang masuk `authorizedList` dan sertifikat belum revoked.

### `cekKeaslianEmas()`
Query sertifikat dari dummy contract registry dan render certificate sheet.

### `ubahStatusValidasi()`
Membatalkan/revoke sertifikat. Membutuhkan wallet yang masuk `authorizedList`.

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

### Wallet tidak bisa mint/revoke
- Buka Connect Dummy Wallet
- Connect sebagai Account 1/Admin
- Pilih account target di Contract Authorization
- Klik Authorize
- Connect ulang sebagai account yang sudah authorized

### Reset data dummy contract
- Hapus key `goldchain_dummy_registry` dan `goldchain_dummy_contract_state` dari browser localStorage
- Refresh halaman untuk membuat ulang state default

### Styling tidak bekerja
- Verifikasi Tailwind CSS CDN sudah loaded di Layout.php
- Cek custom CSS di `src/assets/css/goldchain.css`

---

**Created**: June 2026
**Last Updated**: 2026-06-17
**Version**: 1.0
