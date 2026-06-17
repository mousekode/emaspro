// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VerifikasiEmasPro {
    address public admin;
    bool public isPaused; // Status darurat

    // Role dibaca dari state contract:
    // - Admin: deployer contract
    // - AuthorizedIssuer: alamat yang masuk authorizedList
    // - PublicVerifier: alamat publik yang hanya bisa verifikasi/read-only
    enum Role {
        PublicVerifier,
        AuthorizedIssuer,
        Admin
    }
    
    // Authorization system untuk multiple addresses
    mapping(address => bool) public isAuthorized;
    address[] public authorizedList;

    // 1. STRUCT: Menyimpan data yang lebih kaya, bukan sekadar true/false
    struct DetailEmas {
        bool isRegistered;
        uint256 timestamp;    // Waktu pendaftaran (Unix Epoch)
        string batchProduksi; // Kode produksi pabrik
        string ownerName;     // Nama pemilik yang tercetak di sertifikat
        uint256 beratGram;    // Berat emas dalam gram
        uint8 karat;          // Kadar karat emas, maksimal 24
        bool isRevoked;       // Status jika kartu ditarik/dicuri
    }

    // Mapping nomor seri ke struktur detail emas
    mapping(string => DetailEmas) private dataEmas;

    // 2. EVENTS: Log permanen di blockchain agar frontend/backend bisa "mendengar" histori
    event EmasDidaftarkan(string serialNumber, string batchProduksi, string ownerName, uint256 beratGram, uint8 karat, uint256 timestamp);
    event EmasDibatalkan(string serialNumber, uint256 timestamp);
    event PemilikSertifikatDiubah(string serialNumber, string ownerLama, string ownerBaru, uint256 timestamp);
    event ContractPaused(bool status);
    event AuthorizationAdded(address indexed account);
    event AuthorizationRemoved(address indexed account);

    // 3. MODIFIERS: Validasi hak akses dan status sistem
    modifier hanyaAdmin() {
        require(msg.sender == admin, "Akses ditolak: Anda bukan Admin!");
        _;
    }

    modifier hanyaAuthorized() {
        require(isAuthorized[msg.sender] || msg.sender == admin, "Akses ditolak: Alamat tidak terauthorisasi!");
        _;
    }

    modifier saatSistemAktif() {
        require(!isPaused, "Sistem sedang dihentikan sementara (Paused)!");
        _;
    }

    constructor() {
        admin = msg.sender;
        isAuthorized[msg.sender] = true;
        authorizedList.push(msg.sender);
    }

    // ==========================================
    // FUNGSI MANAJEMEN AUTHORIZATION (ADMIN ONLY)
    // ==========================================

    // Tambahkan alamat terauthorisasi
    function addAuthorized(address _account) external hanyaAdmin {
        require(_account != address(0), "Alamat tidak valid!");
        require(!isAuthorized[_account], "Alamat sudah terauthorisasi!");
        
        isAuthorized[_account] = true;
        authorizedList.push(_account);
        
        emit AuthorizationAdded(_account);
    }

    // Hapus alamat terauthorisasi
    function removeAuthorized(address _account) external hanyaAdmin {
        require(_account != address(0), "Alamat tidak valid!");
        require(_account != admin, "Tidak bisa menghapus admin!");
        require(isAuthorized[_account], "Alamat tidak terauthorisasi!");
        
        isAuthorized[_account] = false;
        
        // Hapus dari array
        for (uint256 i = 0; i < authorizedList.length; i++) {
            if (authorizedList[i] == _account) {
                authorizedList[i] = authorizedList[authorizedList.length - 1];
                authorizedList.pop();
                break;
            }
        }
        
        emit AuthorizationRemoved(_account);
    }

    // Lihat daftar semua authorized addresses
    function getAuthorizedList() external view returns (address[] memory) {
        return authorizedList;
    }

    // Cek apakah alamat adalah admin contract
    function isAdmin(address _account) public view returns (bool) {
        return _account == admin;
    }

    // Cek apakah alamat boleh membuat/revoke sertifikat
    function canIssue(address _account) public view returns (bool) {
        return isAuthorized[_account] || _account == admin;
    }

    // Cek apakah alamat boleh mengubah authorization
    function canManageAuthorization(address _account) public view returns (bool) {
        return _account == admin;
    }

    // Role numerik untuk integrasi frontend/Remix:
    // 0 = PublicVerifier, 1 = AuthorizedIssuer, 2 = Admin
    function getRole(address _account) public view returns (Role) {
        if (_account == admin) {
            return Role.Admin;
        }

        if (isAuthorized[_account]) {
            return Role.AuthorizedIssuer;
        }

        return Role.PublicVerifier;
    }

    // Label role agar mudah dibaca dari Remix atau frontend
    function getRoleName(address _account) external view returns (string memory) {
        Role role = getRole(_account);

        if (role == Role.Admin) {
            return "Admin";
        }

        if (role == Role.AuthorizedIssuer) {
            return "Authorized Issuer";
        }

        return "Public Verifier";
    }

    // Fitur Keamanan: Tombol darurat jika terjadi anomali/hack pada sistem
    function togglePause() external hanyaAdmin {
        isPaused = !isPaused;
        emit ContractPaused(isPaused);
    }

    // Mendaftarkan emas dengan detail tambahan (hanya bisa saat sistem aktif)
    // Overload ini dipertahankan untuk kompatibilitas jika pemilik belum diisi.
    function daftarkanEmas(string memory _serialNumber, string memory _batch) external hanyaAuthorized saatSistemAktif {
        _daftarkanEmas(_serialNumber, _batch, "Belum Diisi", 1, 24);
    }

    // Mendaftarkan emas sekaligus nama pemilik awal sertifikat
    function daftarkanEmas(string memory _serialNumber, string memory _batch, string memory _ownerName) external hanyaAuthorized saatSistemAktif {
        require(bytes(_ownerName).length > 0, "Nama pemilik wajib diisi!");
        _daftarkanEmas(_serialNumber, _batch, _ownerName, 1, 24);
    }

    // Mendaftarkan emas dengan metadata lengkap
    function daftarkanEmas(
        string memory _serialNumber,
        string memory _batch,
        string memory _ownerName,
        uint256 _beratGram,
        uint8 _karat
    ) external hanyaAuthorized saatSistemAktif {
        require(bytes(_ownerName).length > 0, "Nama pemilik wajib diisi!");
        _daftarkanEmas(_serialNumber, _batch, _ownerName, _beratGram, _karat);
    }

    function _daftarkanEmas(
        string memory _serialNumber,
        string memory _batch,
        string memory _ownerName,
        uint256 _beratGram,
        uint8 _karat
    ) internal {
        require(!dataEmas[_serialNumber].isRegistered, "Nomor seri sudah terdaftar!");
        require(_beratGram > 0, "Berat gram harus lebih dari 0!");
        require(_karat > 0 && _karat <= 24, "Karat harus antara 1 sampai 24!");
        
        dataEmas[_serialNumber] = DetailEmas({
            isRegistered: true,
            timestamp: block.timestamp,
            batchProduksi: _batch,
            ownerName: _ownerName,
            beratGram: _beratGram,
            karat: _karat,
            isRevoked: false
        });

        // Memancarkan sinyal (event) bahwa emas berhasil didaftarkan
        emit EmasDidaftarkan(_serialNumber, _batch, _ownerName, _beratGram, _karat, block.timestamp);
    }

    // Membatalkan emas (Kasus: Kartu salah cetak, hilang, atau dicuri)
    function batalkanEmas(string memory _serialNumber) external hanyaAuthorized saatSistemAktif {
        require(dataEmas[_serialNumber].isRegistered, "Nomor seri tidak ditemukan!");
        require(!dataEmas[_serialNumber].isRevoked, "Emas sudah dibatalkan sebelumnya!");

        dataEmas[_serialNumber].isRevoked = true;

        emit EmasDibatalkan(_serialNumber, block.timestamp);
    }

    // Mengubah nama pemilik yang tercetak pada sertifikat
    function ubahPemilikSertifikat(string memory _serialNumber, string memory _ownerName) external hanyaAuthorized saatSistemAktif {
        require(dataEmas[_serialNumber].isRegistered, "Nomor seri tidak ditemukan!");
        require(!dataEmas[_serialNumber].isRevoked, "Sertifikat sudah dibatalkan!");
        require(bytes(_ownerName).length > 0, "Nama pemilik wajib diisi!");

        string memory ownerLama = dataEmas[_serialNumber].ownerName;
        dataEmas[_serialNumber].ownerName = _ownerName;

        emit PemilikSertifikatDiubah(_serialNumber, ownerLama, _ownerName, block.timestamp);
    }

    // ==========================================
    // FUNGSI PUBLIK (READ-ONLY)
    // ==========================================

    // Mengembalikan multiple values (Tuple) untuk detail yang lebih lengkap
    function cekKeaslian(string memory _serialNumber) external view returns (
        bool terdaftar, 
        string memory pesanStatus, 
        string memory batch, 
        uint256 waktuDaftar,
        string memory ownerName,
        uint256 beratGram,
        uint8 karat
    ) {
        DetailEmas memory emas = dataEmas[_serialNumber];

        // Skenario 1: Data sama sekali tidak ada
        if (!emas.isRegistered) {
            return (false, "PALSU / TIDAK TERDAFTAR", "", 0, "", 0, 0);
        }
        
        // Skenario 2: Data ada, tapi statusnya dibatalkan/bermasalah
        if (emas.isRevoked) {
            return (true, "PERINGATAN: KARTU DIBATALKAN / DILAPORKAN HILANG", emas.batchProduksi, emas.timestamp, emas.ownerName, emas.beratGram, emas.karat);
        }

        // Skenario 3: Data valid
        return (true, "VALID & ASLI", emas.batchProduksi, emas.timestamp, emas.ownerName, emas.beratGram, emas.karat);
    }
}
