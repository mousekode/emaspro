// GoldChain Pro - deployed contract wallet integration

// Update this address when you deploy a new VerifikasiEmasPro contract.
const deployedContractAddress = "0x6818A0f5118d3CD7F8EbFBe55E4eA730D62FC4E1";

const contractABI = [
    "function admin() view returns (address)",
    "function isPaused() view returns (bool)",
    "function isAuthorized(address) view returns (bool)",
    "function getAuthorizedList() view returns (address[])",
    "function isAdmin(address _account) view returns (bool)",
    "function canIssue(address _account) view returns (bool)",
    "function canManageAuthorization(address _account) view returns (bool)",
    "function getRole(address _account) view returns (uint8)",
    "function getRoleName(address _account) view returns (string)",
    "function daftarkanEmas(bytes32 _serialHash, bytes32 _metadataHash, uint32 _beratGram, uint8 _karat)",
    "function ubahMetadataSertifikat(bytes32 _serialHash, bytes32 _metadataHash)",
    "function batalkanEmas(bytes32 _serialHash)",
    "function cekKeaslian(bytes32 _serialHash) view returns (bool terdaftar, string pesanStatus, uint40 waktuDaftar, bytes32 metadataHash, uint32 beratGram, uint8 karat)"
];

const certificateMetadataStorageKey = "goldchain_certificate_metadata";
let provider = null;
let signer = null;
let contract = null;
let currentWallet = null;

document.addEventListener("DOMContentLoaded", () => {
    renderAuthorizationControls();
    renderWalletConnectionState();

    if (window.ethereum?.on) {
        window.ethereum.on("accountsChanged", async (accounts) => {
            if (currentWallet?.source !== "MetaMask") return;

            if (!accounts.length) {
                disconnectWallet();
                return;
            }

            await setConnectedWallet(accounts[0], "MetaMask", true);
        });

        window.ethereum.on("chainChanged", () => {
            disconnectWallet();
            showToast("Network berubah. Connect ulang wallet untuk memuat contract di network baru.", "bg-amber-500/10 text-amber-400 border border-amber-500/20");
        });
    }
});

function openWalletModal() {
    renderAuthorizationControls();
    renderWalletConnectionState();
    document.getElementById("walletModal").classList.remove("hidden");
}

function closeWalletModal() {
    document.getElementById("walletModal").classList.add("hidden");
}

async function connectMetaMaskWallet() {
    if (!hasEthereumProvider()) {
        showToast("MetaMask tidak ditemukan. Gunakan browser dengan MetaMask untuk contract live.", "bg-red-500/10 text-red-400 border border-red-500/20");
        return;
    }

    try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (!accounts?.length) {
            showToast("Tidak ada akun MetaMask yang dipilih.", "bg-red-500/10 text-red-400 border border-red-500/20");
            return;
        }

        await setConnectedWallet(accounts[0], "MetaMask", true);
        closeWalletModal();
    } catch (error) {
        console.error(error);
        showToast("Koneksi MetaMask dibatalkan atau gagal.", "bg-red-500/10 text-red-400 border border-red-500/20");
    }
}

async function connectPastedWallet() {
    const input = document.getElementById("pastedWalletAddress");
    const address = input.value.trim();

    if (!isValidWalletAddress(address)) {
        showToast("Alamat wallet harus format EVM 0x + 40 karakter hex.", "bg-red-500/10 text-red-400 border border-red-500/20");
        return;
    }

    await setConnectedWallet(address, "Pasted Wallet", false);
    input.value = "";
    closeWalletModal();
}

function disconnectWallet() {
    currentWallet = null;
    signer = null;
    contract = null;
    renderAuthorizationControls();
    renderWalletConnectionState();
    showToast("Wallet disconnected. Anda bisa login dengan alamat lain.", "bg-slate-500/10 text-slate-300 border border-slate-500/20");
}

async function setConnectedWallet(address, source, withSigner) {
    currentWallet = {
        name: source,
        source,
        address: normalizeWalletAddress(address),
        canSign: withSigner
    };

    try {
        provider = getBrowserProvider();
        signer = withSigner ? await provider.getSigner() : null;
        contract = new ethers.Contract(deployedContractAddress, contractABI, signer || provider);
    } catch (error) {
        console.error(error);
        contract = null;
    }

    await renderAuthorizationControls();
    await renderWalletConnectionState();

    const role = await getWalletRole(currentWallet.address);
    showToast(`Connected via ${source}: ${shortAddress(currentWallet.address)} (${role})`, "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20");
}

async function renderAuthorizationControls() {
    const status = document.getElementById("authPanelStatus");
    const connectedAddress = document.getElementById("authConnectedAddress");
    const connectedRole = document.getElementById("authConnectedRole");
    if (!status || !connectedAddress || !connectedRole) return;

    if (!currentWallet) {
        connectedAddress.innerText = "-";
        connectedRole.innerText = "-";
        status.innerText = `Contract: ${shortAddress(deployedContractAddress)}. Connect MetaMask or paste an address to inspect role.`;
        return;
    }

    connectedAddress.innerText = currentWallet.address;
    connectedRole.innerText = "Checking...";
    status.innerText = `Reading authorization from contract ${shortAddress(deployedContractAddress)}.`;

    const role = await getWalletRole(currentWallet.address);
    connectedRole.innerText = role;

    if (currentWallet.source === "Pasted Wallet") {
        status.innerText = "Pasted wallet is for role inspection only. Use MetaMask to sign mint/revoke/update transactions.";
        return;
    }

    status.innerText = "MetaMask connected. Transactions will be signed by the connected wallet.";
}

async function renderWalletConnectionState() {
    const btn = document.getElementById("btnConnect");
    const walletLabel = document.getElementById("walletLabel");
    const disconnectButton = document.getElementById("btnDisconnectWallet");
    if (!btn || !walletLabel) return;

    if (!currentWallet) {
        btn.innerText = "Connect Wallet";
        btn.className = "bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-5 rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-indigo-600/20";
        walletLabel.innerText = "Wallet Not Connected";
        disconnectButton?.classList.add("hidden");
        return;
    }

    const role = await getWalletRole(currentWallet.address);
    btn.innerText = `${shortAddress(currentWallet.address)} Connected`;
    btn.className = "bg-slate-800 text-slate-400 text-sm font-semibold py-2 px-5 rounded-xl border border-slate-700";
    walletLabel.innerText = `Connected: ${shortAddress(currentWallet.address)} (${role})`;
    disconnectButton?.classList.remove("hidden");
}

async function buatSertifikatEmas() {
    if (!currentWallet) return alert("Hubungkan wallet terlebih dahulu!");
    if (!currentWallet.canSign) return alert("Gunakan MetaMask untuk menandatangani transaksi mint.");

    const sn = document.getElementById("addSerial").value.trim();
    const batch = document.getElementById("addBatch").value.trim();
    const owner = document.getElementById("addOwner").value.trim();
    const beratGram = Number(document.getElementById("addBerat").value);
    const karat = Number(document.getElementById("addKarat").value);

    if (!sn || !batch || !owner) return alert("Mohon lengkapi kolom Serial Number, Batch, dan Nama Pemilik!");
    if (!isValidPositiveInteger(beratGram)) return alert("Berat gram harus berupa angka bulat lebih dari 0!");
    if (!isValidKarat(karat)) return alert("Karat harus berupa angka bulat antara 1 sampai 24!");

    showToast("Memproses persetujuan transaksi di MetaMask...", "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20");
    try {
        const serialHash = hashSerial(sn);
        const metadataHash = hashCertificateMetadata(batch, owner);
        const tx = await getWriteContract().daftarkanEmas(serialHash, metadataHash, beratGram, karat);
        showToast("Menulis transaksi ke contract...", "bg-amber-500/10 text-amber-400 border border-amber-500/20");
        await tx.wait();
        saveCertificateMetadata(sn, batch, owner, metadataHash);
        showToast("Sukses! Emas berhasil didaftarkan di contract.", "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20");

        document.getElementById("addSerial").value = "";
        document.getElementById("addBatch").value = "";
        document.getElementById("addOwner").value = "";
        document.getElementById("addBerat").value = "";
        document.getElementById("addKarat").value = "";
    } catch (error) {
        console.error(error);
        showToast(getReadableError(error, "Transaksi mint gagal."), "bg-red-500/10 text-red-400 border border-red-500/20");
    }
}

async function cekKeaslianEmas() {
    const sn = document.getElementById("querySerial").value.trim();
    if (!sn) return alert("Masukkan Nomor Seri Emas!");

    showToast("Membaca data dari contract...", "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20");

    try {
        const res = await getReadContract().cekKeaslian(hashSerial(sn));
        const terdaftar = res[0];
        const pesanStatus = res[1];
        const waktuDaftar = Number(res[2]);
        const metadataHash = res[3];
        const beratGram = Number(res[4]);
        const karat = Number(res[5]);
        const metadata = getCertificateMetadata(sn, metadataHash);

        document.getElementById("placeholderView").classList.add("hidden");
        document.getElementById("certificateSheet").classList.remove("hidden");

        document.getElementById("certSerial").innerText = sn;
        document.getElementById("certStatusMsg").innerText = pesanStatus;
        document.getElementById("certBatch").innerText = terdaftar ? metadata.batch : "N/A";
        document.getElementById("certOwner").innerText = terdaftar ? metadata.owner : "N/A";
        document.getElementById("certBerat").innerText = terdaftar && beratGram > 0 ? `${beratGram} gram` : "N/A";
        document.getElementById("certKarat").innerText = terdaftar && karat > 0 ? `${karat}K` : "N/A";

        if (terdaftar && waktuDaftar > 0) {
            const date = new Date(waktuDaftar * 1000);
            document.getElementById("certDate").innerText = date.toLocaleString("id-ID") + " WITA";
        } else {
            document.getElementById("certDate").innerText = "N/A";
        }

        const stamp = document.getElementById("certStamp");
        const stampTxt = document.getElementById("stampText");

        if (!terdaftar) {
            stampTxt.innerText = "INVALID";
            stamp.className = "w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center font-bold text-[10px] uppercase tracking-tighter font-serif rotate-[-12deg] border-red-500 text-red-500 bg-red-50/50";
            showToast("Pencarian selesai: Sertifikat TIDAK TERDAFTAR / PALSU!", "bg-red-500/10 text-red-400 border border-red-500/20");
        } else if (pesanStatus.includes("PERINGATAN") || pesanStatus.includes("DIBATALKAN")) {
            stampTxt.innerText = "REVOKED";
            stamp.className = "w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center font-bold text-[10px] uppercase tracking-tighter font-serif rotate-[-12deg] border-amber-500 text-amber-500 bg-amber-50/50";
            showToast("Peringatan: Sertifikat telah ditarik/dibekukan!", "bg-amber-500/10 text-amber-400 border border-amber-500/20");
        } else {
            stampTxt.innerText = "VERIFIED";
            stamp.className = "w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center font-bold text-[10px] uppercase tracking-tighter font-serif rotate-[-12deg] border-emerald-600 text-emerald-600 bg-emerald-50/50";
            showToast("Pencarian selesai: Emas Valid & Terverifikasi!", "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20");
        }
    } catch (error) {
        console.error(error);
        showToast(getReadableError(error, "Gagal membaca data dari contract."), "bg-red-500/10 text-red-400 border border-red-500/20");
    }
}

async function ubahPemilikSertifikat() {
    if (!currentWallet) return alert("Hubungkan wallet terlebih dahulu!");
    if (!currentWallet.canSign) return alert("Gunakan MetaMask untuk menandatangani transaksi ubah pemilik.");

    const sn = document.getElementById("ownerSerial").value.trim();
    const owner = document.getElementById("ownerName").value.trim();
    if (!sn || !owner) return alert("Masukkan ID Serial dan nama pemilik baru!");

    showToast("Memproses perubahan nama pemilik di MetaMask...", "bg-amber-500/10 text-amber-400 border border-amber-500/20");
    try {
        const serialHash = hashSerial(sn);
        const existingMetadata = getCertificateMetadata(sn);
        const batch = existingMetadata.batch === "Metadata off-chain tidak tersedia" ? "" : existingMetadata.batch;
        const metadataHash = hashCertificateMetadata(batch, owner);
        const tx = await getWriteContract().ubahMetadataSertifikat(serialHash, metadataHash);
        await tx.wait();
        saveCertificateMetadata(sn, batch, owner, metadataHash);
        showToast("Sukses! Nama pemilik sertifikat berhasil diperbarui.", "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20");
        document.getElementById("ownerSerial").value = "";
        document.getElementById("ownerName").value = "";
    } catch (error) {
        console.error(error);
        showToast(getReadableError(error, "Gagal mengubah nama pemilik sertifikat."), "bg-red-500/10 text-red-400 border border-red-500/20");
    }
}

async function ubahStatusValidasi() {
    if (!currentWallet) return alert("Hubungkan wallet terlebih dahulu!");
    if (!currentWallet.canSign) return alert("Gunakan MetaMask untuk menandatangani transaksi revoke.");

    const sn = document.getElementById("statusSerial").value.trim();
    if (!sn) return alert("Masukkan ID Serial!");

    showToast("Memproses pembatalan sertifikat di MetaMask...", "bg-amber-500/10 text-amber-400 border border-amber-500/20");
    try {
        const tx = await getWriteContract().batalkanEmas(hashSerial(sn));
        await tx.wait();
        showToast("Sukses! Status emas berhasil dibatalkan (Revoked).", "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20");
        document.getElementById("statusSerial").value = "";
    } catch (error) {
        console.error(error);
        showToast(getReadableError(error, "Gagal membatalkan sertifikat."), "bg-red-500/10 text-red-400 border border-red-500/20");
    }
}

function getBrowserProvider() {
    if (!hasEthereumProvider()) {
        throw new Error("MetaMask/browser EVM provider tidak tersedia.");
    }

    return provider || new ethers.BrowserProvider(window.ethereum);
}

function getReadContract() {
    const readProvider = getBrowserProvider();
    return new ethers.Contract(deployedContractAddress, contractABI, readProvider);
}

function getWriteContract() {
    if (!signer || !contract) {
        throw new Error("Wallet signer belum tersedia. Connect MetaMask terlebih dahulu.");
    }

    return contract;
}

async function getWalletRole(address) {
    try {
        return await getReadContract().getRoleName(address);
    } catch (error) {
        console.error(error);
        return "Unknown";
    }
}

function updateConnectedWalletLabel() {
    renderWalletConnectionState();
    renderAuthorizationControls();
}

function hashSerial(serialNumber) {
    return ethers.keccak256(ethers.toUtf8Bytes(serialNumber.trim()));
}

function hashCertificateMetadata(batch, owner) {
    return ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "string"],
        [batch, owner]
    ));
}

function saveCertificateMetadata(serialNumber, batch, owner, metadataHash) {
    const metadata = readCertificateMetadata();
    metadata[hashSerial(serialNumber)] = {
        batch,
        owner,
        metadataHash
    };
    localStorage.setItem(certificateMetadataStorageKey, JSON.stringify(metadata));
}

function getCertificateMetadata(serialNumber, expectedHash = null) {
    const metadata = readCertificateMetadata()[hashSerial(serialNumber)];

    if (metadata && (!expectedHash || metadata.metadataHash.toLowerCase() === String(expectedHash).toLowerCase())) {
        return metadata;
    }

    return {
        batch: "Metadata off-chain tidak tersedia",
        owner: "Metadata off-chain tidak tersedia"
    };
}

function readCertificateMetadata() {
    try {
        return JSON.parse(localStorage.getItem(certificateMetadataStorageKey)) || {};
    } catch (error) {
        console.error(error);
        return {};
    }
}

function validateCertificateNumbers(beratGram, karat) {
    if (!isValidPositiveInteger(beratGram)) {
        throw new Error("Berat gram harus berupa angka bulat lebih dari 0!");
    }

    if (!isValidKarat(karat)) {
        throw new Error("Karat harus berupa angka bulat antara 1 sampai 24!");
    }
}

function isValidPositiveInteger(value) {
    return Number.isInteger(value) && value > 0;
}

function isValidKarat(value) {
    return Number.isInteger(value) && value >= 1 && value <= 24;
}

function isValidWalletAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function normalizeWalletAddress(address) {
    return String(address || "").trim().toLowerCase();
}

function hasEthereumProvider() {
    return typeof window.ethereum !== "undefined" && typeof ethers !== "undefined";
}

function shortAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getReadableError(error, fallback) {
    return error?.reason || error?.shortMessage || error?.info?.error?.message || error?.message || fallback;
}

function showToast(msg, classes) {
    const el = document.getElementById("toastMessage");
    if (!el) return;

    el.className = `mt-4 p-3 rounded-xl text-xs text-center border ${classes}`;
    el.innerText = msg;
    el.classList.remove("hidden");
}
