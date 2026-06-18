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
- Network badge (Remix / Wallet Test)
- Connect Wallet button yang membuka modal koneksi

---

### 2. **DummyWalletModal.php**
Modal untuk memilih metode koneksi wallet dan melihat role authorization contract.

**Lokasi**: `src/assets/components/DummyWalletModal.php`

**Penggunaan**:
```php
<?= renderComponent('DummyWalletModal'); ?>
```

**Fitur**:
- Connect via MetaMask SSO (`eth_requestAccounts`)
- Connect via pasted EVM wallet address
- Disconnect/logout wallet
- Panel Contract Authorization read-only untuk alamat aktif
- Role wallet dibaca dari contract adapter, bukan hardcoded di wallet

**Catatan Authorization**:
- Authorization alamat diatur dari Remix/contract
- Paste wallet digunakan untuk menguji alamat tertentu tanpa perlu switch akun MetaMask
- Public verifier tetap bisa menjalankan query sertifikat tanpa authorization
- Role dibaca dari contract helper: `getRole()`, `getRoleName()`, `canIssue()`, dan `canManageAuthorization()`
- Alamat EVM dinormalisasi lowercase agar checksum/lowercase tidak merusak role check

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
- Input Berat (gram)
- Input Karat
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

**Aturan Angka**:
- `Berat (gram)` harus angka bulat lebih dari 0
- `Karat` harus angka bulat dari 1 sampai 24
- Validasi dilakukan di frontend dan contract
- Batch dan nama pemilik disimpan sebagai metadata off-chain browser untuk menghemat gas
- Contract hanya menyimpan `metadataHash`, `beratGram`, `karat`, timestamp, dan status revoke
- Contract Solidity juga melakukan `require` untuk nilai berat dan karat

---

### 5. **CertificateVerifier.php**
Input field untuk query dan verifikasi sertifikat dari contract registry.

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
- `cekKeaslianEmas()` - Query ke contract registry

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
- Dynamic rendering berdasarkan query contract registry
- Status badge (VERIFIED, INVALID, REVOKED)

**JavaScript Data yang Digunakan**:
- `certSerial` - Nomor seri
- `certStatusMsg` - Pesan status
- `certOwner` - Nama pemilik sertifikat
- `certBerat` - Berat emas dalam gram
- `certKarat` - Kadar karat emas
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
   - DummyWalletModal (MetaMask/pasted wallet & authorization status)
   - RegistryStats (info sistem)
   - MintingPanel (form minting)
   - CertificateVerifier (input query)
   - CertificateSheet (display sertifikat)
   ↓
4. JavaScript functions di goldchain.js:
   - openWalletModal() → buka modal wallet
   - connectMetaMaskWallet() → koneksi MetaMask SSO
   - connectPastedWallet() → koneksi dari alamat pasted
   - disconnectWallet() → logout wallet aktif
   - buatSertifikatEmas() → daftarkanEmas() contract call
   - ubahPemilikSertifikat() → ubahMetadataSertifikat() contract call
   - cekKeaslianEmas() → cekKeaslian() contract call
   - ubahStatusValidasi() → batalkanEmas() contract call
   ↓
5. Deployed Contract
   - VerifikasiEmasPro access rules
   - admin, authorizedList, role helpers, registry hash sertifikat
   - Contract address configured in `src/assets/js/goldchain.js`
```

**Contract Address**

Alamat contract aktif berada di `src/assets/js/goldchain.js`:

```js
const deployedContractAddress = "0x2C01D483c54842576f858B5d809a97C9c9f98B3c";
```

Ganti nilai tersebut jika deploy contract baru di Remix.

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
- `ubahMetadataSertifikat(bytes32,bytes32)` - mengubah hash metadata sertifikat

Fungsi utama contract rendah gas:

- `addAuthorized(address)`
- `removeAuthorized(address)`
- `isAuthorized(address)`
- `daftarkanEmas(bytes32,bytes32,uint32,uint8)`
- `batalkanEmas(bytes32)`
- `cekKeaslian(bytes32)`

**Catatan gas**

Contract memakai model rendah gas:

- Serial number dikirim sebagai `bytes32 serialHash`
- Batch dan nama pemilik tidak disimpan sebagai string on-chain
- Batch dan nama pemilik disimpan di browser `localStorage` dengan key `goldchain_certificate_metadata`
- Contract hanya menyimpan hash metadata agar data off-chain bisa dicocokkan dengan bukti on-chain
- Jika browser/storage berbeda, certificate preview tetap valid tetapi batch/pemilik bisa tampil sebagai metadata tidak tersedia

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

### `connectMetaMaskWallet()`
Meminta akun MetaMask via `eth_requestAccounts` dan membuat adapter wallet aktif.

### `connectPastedWallet()`
Menggunakan alamat EVM yang dipaste untuk menguji role/address tertentu.

### `disconnectWallet()`
Logout wallet aktif dan mengembalikan UI ke status belum terhubung.

### `openWalletModal()` / `closeWalletModal()`
Membuka dan menutup modal wallet.

### `buatSertifikatEmas()`
Membuat sertifikat emas baru dengan serial, batch, nama pemilik awal, berat gram, dan karat. Membutuhkan wallet yang masuk `authorizedList`.

### `ubahPemilikSertifikat()`
Mengubah metadata hash sertifikat berdasarkan serial number dan menyimpan nama pemilik baru di metadata browser. Membutuhkan wallet yang masuk `authorizedList` dan sertifikat belum revoked.

### `cekKeaslianEmas()`
Query sertifikat dari contract registry dan render certificate sheet.

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
- Pastikan alamat sudah masuk `authorizedList` di Remix/contract
- Buka Connect Wallet
- Gunakan MetaMask atau paste alamat yang ingin dites
- Disconnect lalu connect alamat lain untuk menguji role berbeda

### Contract address salah
- Buka `src/assets/js/goldchain.js`
- Ubah `deployedContractAddress`
- Pastikan MetaMask berada di network yang sama dengan contract deploy

### Metadata batch/pemilik tidak muncul
- Metadata detail disimpan off-chain untuk menghemat gas
- Gunakan browser yang sama dengan saat mint, atau input ulang metadata melalui menu update metadata
- On-chain proof tetap dicek melalui `metadataHash`

### Styling tidak bekerja
- Verifikasi Tailwind CSS CDN sudah loaded di Layout.php
- Cek custom CSS di `src/assets/css/goldchain.css`

---

**Created**: June 2026
**Last Updated**: 2026-06-18
**Version**: 1.0
