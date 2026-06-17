// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VerifikasiEmasPro {
    address public admin;
    bool public isPaused; // Status darurat
    
    // Authorization system untuk multiple addresses
    mapping(address => bool) public isAuthorized;
    address[] public authorizedList;

    // 1. STRUCT: Menyimpan data yang lebih kaya, bukan sekadar true/false
    struct DetailEmas {
        bool isRegistered;
        uint256 timestamp;    // Waktu pendaftaran (Unix Epoch)
        string batchProduksi; // Kode produksi pabrik
        bool isRevoked;       // Status jika kartu ditarik/dicuri
    }

    // Mapping nomor seri ke struktur detail emas
    mapping(string => DetailEmas) private dataEmas;

    // 2. EVENTS: Log permanen di blockchain agar frontend/backend bisa "mendengar" histori
    event EmasDidaftarkan(string serialNumber, string batchProduksi, uint256 timestamp);
    event EmasDibatalkan(string serialNumber, uint256 timestamp);
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

    // Fitur Keamanan: Tombol darurat jika terjadi anomali/hack pada sistem
    function togglePause() external hanyaAdmin {
        isPaused = !isPaused;
        emit ContractPaused(isPaused);
    }

    // Mendaftarkan emas dengan detail tambahan (hanya bisa saat sistem aktif)
    function daftarkanEmas(string memory _serialNumber, string memory _batch) external hanyaAuthorized saatSistemAktif {
        require(!dataEmas[_serialNumber].isRegistered, "Nomor seri sudah terdaftar!");
        
        dataEmas[_serialNumber] = DetailEmas({
            isRegistered: true,
            timestamp: block.timestamp,
            batchProduksi: _batch,
            isRevoked: false
        });

        // Memancarkan sinyal (event) bahwa emas berhasil didaftarkan
        emit EmasDidaftarkan(_serialNumber, _batch, block.timestamp);
    }

    // Membatalkan emas (Kasus: Kartu salah cetak, hilang, atau dicuri)
    function batalkanEmas(string memory _serialNumber) external hanyaAuthorized saatSistemAktif {
        require(dataEmas[_serialNumber].isRegistered, "Nomor seri tidak ditemukan!");
        require(!dataEmas[_serialNumber].isRevoked, "Emas sudah dibatalkan sebelumnya!");

        dataEmas[_serialNumber].isRevoked = true;

        emit EmasDibatalkan(_serialNumber, block.timestamp);
    }

    // ==========================================
    // FUNGSI PUBLIK (READ-ONLY)
    // ==========================================

    // Mengembalikan multiple values (Tuple) untuk detail yang lebih lengkap
    function cekKeaslian(string memory _serialNumber) external view returns (
        bool terdaftar, 
        string memory pesanStatus, 
        string memory batch, 
        uint256 waktuDaftar
    ) {
        DetailEmas memory emas = dataEmas[_serialNumber];

        // Skenario 1: Data sama sekali tidak ada
        if (!emas.isRegistered) {
            return (false, "PALSU / TIDAK TERDAFTAR", "", 0);
        }
        
        // Skenario 2: Data ada, tapi statusnya dibatalkan/bermasalah
        if (emas.isRevoked) {
            return (true, "PERINGATAN: KARTU DIBATALKAN / DILAPORKAN HILANG", emas.batchProduksi, emas.timestamp);
        }

        // Skenario 3: Data valid
        return (true, "VALID & ASLI", emas.batchProduksi, emas.timestamp);
    }
}