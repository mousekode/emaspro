// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VerifikasiEmasPro {
    address public admin;
    bool public isPaused;

    enum Role {
        PublicVerifier,
        AuthorizedIssuer,
        Admin
    }

    mapping(address => bool) public isAuthorized;
    address[] public authorizedList;

    // Gas-optimized record. Dynamic strings are kept off-chain.
    struct DetailEmas {
        bool isRegistered;
        bool isRevoked;
        uint40 timestamp;
        uint32 beratGram;
        uint8 karat;
        bytes32 metadataHash;
    }

    mapping(bytes32 => DetailEmas) private dataEmas;

    event EmasDidaftarkan(bytes32 indexed serialHash, bytes32 indexed metadataHash, uint32 beratGram, uint8 karat, uint40 timestamp);
    event EmasDibatalkan(bytes32 indexed serialHash, uint40 timestamp);
    event MetadataSertifikatDiubah(bytes32 indexed serialHash, bytes32 indexed metadataHash, uint40 timestamp);
    event ContractPaused(bool status);
    event AuthorizationAdded(address indexed account);
    event AuthorizationRemoved(address indexed account);

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

    function addAuthorized(address _account) external hanyaAdmin {
        require(_account != address(0), "Alamat tidak valid!");
        require(!isAuthorized[_account], "Alamat sudah terauthorisasi!");

        isAuthorized[_account] = true;
        authorizedList.push(_account);

        emit AuthorizationAdded(_account);
    }

    function removeAuthorized(address _account) external hanyaAdmin {
        require(_account != address(0), "Alamat tidak valid!");
        require(_account != admin, "Tidak bisa menghapus admin!");
        require(isAuthorized[_account], "Alamat tidak terauthorisasi!");

        isAuthorized[_account] = false;

        for (uint256 i = 0; i < authorizedList.length; i++) {
            if (authorizedList[i] == _account) {
                authorizedList[i] = authorizedList[authorizedList.length - 1];
                authorizedList.pop();
                break;
            }
        }

        emit AuthorizationRemoved(_account);
    }

    function getAuthorizedList() external view returns (address[] memory) {
        return authorizedList;
    }

    function isAdmin(address _account) public view returns (bool) {
        return _account == admin;
    }

    function canIssue(address _account) public view returns (bool) {
        return isAuthorized[_account] || _account == admin;
    }

    function canManageAuthorization(address _account) public view returns (bool) {
        return _account == admin;
    }

    function getRole(address _account) public view returns (Role) {
        if (_account == admin) return Role.Admin;
        if (isAuthorized[_account]) return Role.AuthorizedIssuer;
        return Role.PublicVerifier;
    }

    function getRoleName(address _account) external view returns (string memory) {
        Role role = getRole(_account);

        if (role == Role.Admin) return "Admin";
        if (role == Role.AuthorizedIssuer) return "Authorized Issuer";
        return "Public Verifier";
    }

    function togglePause() external hanyaAdmin {
        isPaused = !isPaused;
        emit ContractPaused(isPaused);
    }

    function daftarkanEmas(
        bytes32 _serialHash,
        bytes32 _metadataHash,
        uint32 _beratGram,
        uint8 _karat
    ) external hanyaAuthorized saatSistemAktif {
        require(!dataEmas[_serialHash].isRegistered, "Nomor seri sudah terdaftar!");
        require(_serialHash != bytes32(0), "Hash serial tidak valid!");
        require(_metadataHash != bytes32(0), "Hash metadata tidak valid!");
        require(_beratGram > 0, "Berat gram harus lebih dari 0!");
        require(_karat > 0 && _karat <= 24, "Karat harus antara 1 sampai 24!");

        uint40 waktu = uint40(block.timestamp);
        dataEmas[_serialHash] = DetailEmas({
            isRegistered: true,
            isRevoked: false,
            timestamp: waktu,
            beratGram: _beratGram,
            karat: _karat,
            metadataHash: _metadataHash
        });

        emit EmasDidaftarkan(_serialHash, _metadataHash, _beratGram, _karat, waktu);
    }

    function batalkanEmas(bytes32 _serialHash) external hanyaAuthorized saatSistemAktif {
        require(dataEmas[_serialHash].isRegistered, "Nomor seri tidak ditemukan!");
        require(!dataEmas[_serialHash].isRevoked, "Emas sudah dibatalkan sebelumnya!");

        dataEmas[_serialHash].isRevoked = true;

        emit EmasDibatalkan(_serialHash, uint40(block.timestamp));
    }

    function ubahMetadataSertifikat(bytes32 _serialHash, bytes32 _metadataHash) external hanyaAuthorized saatSistemAktif {
        require(dataEmas[_serialHash].isRegistered, "Nomor seri tidak ditemukan!");
        require(!dataEmas[_serialHash].isRevoked, "Sertifikat sudah dibatalkan!");
        require(_metadataHash != bytes32(0), "Hash metadata tidak valid!");

        dataEmas[_serialHash].metadataHash = _metadataHash;

        emit MetadataSertifikatDiubah(_serialHash, _metadataHash, uint40(block.timestamp));
    }

    function cekKeaslian(bytes32 _serialHash) external view returns (
        bool terdaftar,
        string memory pesanStatus,
        uint40 waktuDaftar,
        bytes32 metadataHash,
        uint32 beratGram,
        uint8 karat
    ) {
        DetailEmas memory emas = dataEmas[_serialHash];

        if (!emas.isRegistered) {
            return (false, "PALSU / TIDAK TERDAFTAR", 0, bytes32(0), 0, 0);
        }

        if (emas.isRevoked) {
            return (true, "PERINGATAN: KARTU DIBATALKAN / DILAPORKAN HILANG", emas.timestamp, emas.metadataHash, emas.beratGram, emas.karat);
        }

        return (true, "VALID & ASLI", emas.timestamp, emas.metadataHash, emas.beratGram, emas.karat);
    }
}
