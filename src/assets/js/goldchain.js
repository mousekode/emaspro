// GoldChain Pro - Remix dummy wallet demo adapter

const dummyWallets = [
    {
        name: "Account 1",
        address: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
    },
    {
        name: "Account 2",
        address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
    },
    {
        name: "Account 3",
        address: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"
    }
];

const registryStorageKey = "goldchain_dummy_registry";
const contractStateStorageKey = "goldchain_dummy_contract_state";
let currentWallet = null;
let contract = null;

class DummyTransaction {
    constructor(hash) {
        this.hash = hash;
    }

    async wait() {
        await new Promise((resolve) => setTimeout(resolve, 350));
        return { status: 1, transactionHash: this.hash };
    }
}

class DummyVerifikasiEmasPro {
    constructor(wallet) {
        this.wallet = wallet;
    }

    daftarkanEmas(serialNumber, batch, ownerName = "Belum Diisi") {
        this.requireAuthorized();

        const registry = readRegistry();
        if (registry[serialNumber]?.isRegistered) {
            throw new Error("Nomor seri sudah terdaftar!");
        }

        registry[serialNumber] = {
            isRegistered: true,
            timestamp: Math.floor(Date.now() / 1000),
            batchProduksi: batch,
            ownerName,
            isRevoked: false,
            issuer: this.wallet.address
        };

        writeRegistry(registry);
        return new DummyTransaction(createDummyHash(serialNumber));
    }

    batalkanEmas(serialNumber) {
        this.requireAuthorized();

        const registry = readRegistry();
        const record = registry[serialNumber];
        if (!record?.isRegistered) {
            throw new Error("Nomor seri tidak ditemukan!");
        }

        if (record.isRevoked) {
            throw new Error("Emas sudah dibatalkan sebelumnya!");
        }

        record.isRevoked = true;
        record.revokedBy = this.wallet.address;
        record.revokedAt = Math.floor(Date.now() / 1000);
        writeRegistry(registry);

        return new DummyTransaction(createDummyHash(serialNumber));
    }

    ubahPemilikSertifikat(serialNumber, ownerName) {
        this.requireAuthorized();

        if (!ownerName) {
            throw new Error("Nama pemilik wajib diisi!");
        }

        const registry = readRegistry();
        const record = registry[serialNumber];
        if (!record?.isRegistered) {
            throw new Error("Nomor seri tidak ditemukan!");
        }

        if (record.isRevoked) {
            throw new Error("Sertifikat sudah dibatalkan!");
        }

        record.ownerName = ownerName;
        record.ownerUpdatedBy = this.wallet.address;
        record.ownerUpdatedAt = Math.floor(Date.now() / 1000);
        writeRegistry(registry);

        return new DummyTransaction(createDummyHash(serialNumber));
    }

    cekKeaslian(serialNumber) {
        const record = readRegistry()[serialNumber];

        if (!record?.isRegistered) {
            return [false, "PALSU / TIDAK TERDAFTAR", "", 0, ""];
        }

        if (record.isRevoked) {
            return [
                true,
                "PERINGATAN: KARTU DIBATALKAN / DILAPORKAN HILANG",
                record.batchProduksi,
                record.timestamp,
                record.ownerName || "Belum Diisi"
            ];
        }

        return [true, "VALID & ASLI", record.batchProduksi, record.timestamp, record.ownerName || "Belum Diisi"];
    }

    addAuthorized(account) {
        this.requireAdmin();

        if (!account) {
            throw new Error("Alamat tidak valid!");
        }

        const state = readContractState();
        if (state.authorizedList.includes(account)) {
            throw new Error("Alamat sudah terauthorisasi!");
        }

        state.authorizedList.push(account);
        writeContractState(state);
        return new DummyTransaction(createDummyHash(account));
    }

    removeAuthorized(account) {
        this.requireAdmin();

        const state = readContractState();
        if (account === state.admin) {
            throw new Error("Tidak bisa menghapus admin!");
        }

        if (!state.authorizedList.includes(account)) {
            throw new Error("Alamat tidak terauthorisasi!");
        }

        state.authorizedList = state.authorizedList.filter((address) => address !== account);
        writeContractState(state);
        return new DummyTransaction(createDummyHash(account));
    }

    getAuthorizedList() {
        return [...readContractState().authorizedList];
    }

    isAuthorized(account) {
        return readContractState().authorizedList.includes(account);
    }

    admin() {
        return readContractState().admin;
    }

    isAdmin(account) {
        return account === this.admin();
    }

    canIssue(account) {
        return this.isAuthorized(account) || this.isAdmin(account);
    }

    canManageAuthorization(account) {
        return this.isAdmin(account);
    }

    getRole(account) {
        if (this.isAdmin(account)) return 2;
        if (this.isAuthorized(account)) return 1;
        return 0;
    }

    getRoleName(account) {
        const role = this.getRole(account);
        if (role === 2) return "Admin";
        if (role === 1) return "Authorized Issuer";
        return "Public Verifier";
    }

    requireAuthorized() {
        if (!this.wallet || !this.canIssue(this.wallet.address)) {
            throw new Error("Akses ditolak: Alamat tidak terauthorisasi!");
        }
    }

    requireAdmin() {
        if (!this.wallet || !this.canManageAuthorization(this.wallet.address)) {
            throw new Error("Akses ditolak: Anda bukan Admin!");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeContractState();
    contract = new DummyVerifikasiEmasPro(null);
    renderDummyWallets();
    renderAuthorizationControls();
});

function openWalletModal() {
    renderDummyWallets();
    renderAuthorizationControls();
    document.getElementById("walletModal").classList.remove("hidden");
}

function closeWalletModal() {
    document.getElementById("walletModal").classList.add("hidden");
}

function connectWallet(index) {
    currentWallet = dummyWallets[index];
    contract = new DummyVerifikasiEmasPro(currentWallet);

    const btn = document.getElementById("btnConnect");
    const role = getWalletRole(currentWallet);
    btn.innerText = `${currentWallet.name} Connected`;
    btn.className = "bg-slate-800 text-slate-400 text-sm font-semibold py-2 px-5 rounded-xl border border-slate-700";

    document.getElementById("walletLabel").innerText = `Connected: ${shortAddress(currentWallet.address)} (${role})`;
    renderDummyWallets();
    renderAuthorizationControls();
    closeWalletModal();
    showToast(`Connected to ${currentWallet.name}: ${role}`, "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20");
}

function renderDummyWallets() {
    const list = document.getElementById("dummyWalletList");
    if (!list) return;

    list.innerHTML = dummyWallets.map((wallet, index) => {
        const role = getWalletRole(wallet);
        const badgeClass = role !== "Public Verifier"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-slate-500/10 text-slate-400 border-slate-500/20";

        return `
            <button onclick="connectWallet(${index})"
                class="w-full text-left bg-[#0b0c14] border border-slate-800 hover:border-indigo-500 rounded-xl p-4 transition cursor-pointer">
                <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0">
                        <p class="text-sm font-semibold text-white">${wallet.name}</p>
                        <p class="text-xs text-slate-500 font-mono truncate mt-1">${wallet.address}</p>
                    </div>
                    <span class="shrink-0 text-[10px] border px-2 py-1 rounded-md ${badgeClass}">
                        ${role}
                    </span>
                </div>
            </button>
        `;
    }).join("");
}

function renderAuthorizationControls() {
    const select = document.getElementById("authWalletSelect");
    const status = document.getElementById("authPanelStatus");
    if (!select || !status) return;

    select.innerHTML = dummyWallets.map((wallet) => {
        const role = getWalletRole(wallet);
        return `<option value="${wallet.address}">${wallet.name} - ${shortAddress(wallet.address)} - ${role}</option>`;
    }).join("");

    const state = readContractState();
    if (!currentWallet) {
        status.innerText = `Admin is ${shortAddress(state.admin)}. Connect the admin dummy wallet to manage issuers.`;
        return;
    }

    if (currentWallet.address !== state.admin) {
        status.innerText = `Connected as ${getWalletRole(currentWallet)}. Only ${shortAddress(state.admin)} can change authorization.`;
        return;
    }

    status.innerText = "Admin connected. Authorization changes are stored in the dummy contract state.";
}

async function authorizeSelectedWallet() {
    if (!currentWallet) return alert("Hubungkan dummy wallet admin terlebih dahulu!");

    const account = document.getElementById("authWalletSelect").value;
    try {
        const tx = contract.addAuthorized(account);
        await tx.wait();
        renderDummyWallets();
        renderAuthorizationControls();
        updateConnectedWalletLabel();
        showToast("Alamat berhasil ditambahkan ke authorizedList dummy contract.", "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20");
    } catch (error) {
        console.error(error);
        showToast(error.message || "Gagal menambahkan authorization.", "bg-red-500/10 text-red-400 border border-red-500/20");
    }
}

async function removeSelectedAuthorization() {
    if (!currentWallet) return alert("Hubungkan dummy wallet admin terlebih dahulu!");

    const account = document.getElementById("authWalletSelect").value;
    try {
        const tx = contract.removeAuthorized(account);
        await tx.wait();
        renderDummyWallets();
        renderAuthorizationControls();
        updateConnectedWalletLabel();
        showToast("Alamat berhasil dihapus dari authorizedList dummy contract.", "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20");
    } catch (error) {
        console.error(error);
        showToast(error.message || "Gagal menghapus authorization.", "bg-red-500/10 text-red-400 border border-red-500/20");
    }
}

async function buatSertifikatEmas() {
    if (!currentWallet) return alert("Hubungkan dummy wallet terlebih dahulu!");

    const sn = document.getElementById("addSerial").value.trim();
    const batch = document.getElementById("addBatch").value.trim();
    const owner = document.getElementById("addOwner").value.trim();

    if (!sn || !batch || !owner) return alert("Mohon lengkapi kolom Serial Number, Batch, dan Nama Pemilik!");

    showToast("Memproses transaksi demo dari dummy wallet...", "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20");
    try {
        const tx = contract.daftarkanEmas(sn, batch, owner);
        showToast("Menulis data ke registry lokal Remix dummy...", "bg-amber-500/10 text-amber-400 border border-amber-500/20");
        await tx.wait();
        showToast("Sukses! Emas berhasil didaftarkan di registry demo.", "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20");

        document.getElementById("addSerial").value = "";
        document.getElementById("addBatch").value = "";
        document.getElementById("addOwner").value = "";
    } catch (error) {
        console.error(error);
        showToast(error.message || "Transaksi demo gagal.", "bg-red-500/10 text-red-400 border border-red-500/20");
    }
}

async function cekKeaslianEmas() {
    const sn = document.getElementById("querySerial").value.trim();
    if (!sn) return alert("Masukkan Nomor Seri Emas!");

    showToast("Mencari data di registry lokal Remix dummy...", "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20");

    try {
        const res = contract.cekKeaslian(sn);
        const terdaftar = res[0];
        const pesanStatus = res[1];
        const batch = res[2];
        const waktuDaftar = res[3];
        const ownerName = res[4];

        document.getElementById("placeholderView").classList.add("hidden");
        document.getElementById("certificateSheet").classList.remove("hidden");

        document.getElementById("certSerial").innerText = sn;
        document.getElementById("certStatusMsg").innerText = pesanStatus;
        document.getElementById("certBatch").innerText = terdaftar ? batch : "N/A";
        document.getElementById("certOwner").innerText = terdaftar ? ownerName : "N/A";

        if (terdaftar && waktuDaftar > 0) {
            const date = new Date(Number(waktuDaftar) * 1000);
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
        showToast("Gagal membaca data dari registry demo.", "bg-red-500/10 text-red-400 border border-red-500/20");
    }
}

async function ubahPemilikSertifikat() {
    if (!currentWallet) return alert("Hubungkan dummy wallet terlebih dahulu!");

    const sn = document.getElementById("ownerSerial").value.trim();
    const owner = document.getElementById("ownerName").value.trim();
    if (!sn || !owner) return alert("Masukkan ID Serial dan nama pemilik baru!");

    showToast("Mengirim perubahan nama pemilik dari dummy wallet...", "bg-amber-500/10 text-amber-400 border border-amber-500/20");
    try {
        const tx = contract.ubahPemilikSertifikat(sn, owner);
        await tx.wait();
        showToast("Sukses! Nama pemilik sertifikat berhasil diperbarui.", "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20");
        document.getElementById("ownerSerial").value = "";
        document.getElementById("ownerName").value = "";
    } catch (error) {
        console.error(error);
        showToast(error.message || "Gagal mengubah nama pemilik sertifikat.", "bg-red-500/10 text-red-400 border border-red-500/20");
    }
}

async function ubahStatusValidasi() {
    if (!currentWallet) return alert("Hubungkan dummy wallet terlebih dahulu!");

    const sn = document.getElementById("statusSerial").value.trim();
    if (!sn) return alert("Masukkan ID Serial!");

    showToast("Mengirim perintah pembatalan dari dummy wallet...", "bg-amber-500/10 text-amber-400 border border-amber-500/20");
    try {
        const tx = contract.batalkanEmas(sn);
        await tx.wait();
        showToast("Sukses! Status emas berhasil dibatalkan (Revoked).", "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20");
        document.getElementById("statusSerial").value = "";
    } catch (error) {
        console.error(error);
        showToast(error.message || "Gagal membatalkan sertifikat.", "bg-red-500/10 text-red-400 border border-red-500/20");
    }
}

function readRegistry() {
    try {
        return JSON.parse(localStorage.getItem(registryStorageKey)) || {};
    } catch (error) {
        console.error(error);
        return {};
    }
}

function writeRegistry(registry) {
    localStorage.setItem(registryStorageKey, JSON.stringify(registry));
}

function initializeContractState() {
    if (localStorage.getItem(contractStateStorageKey)) return;

    const deployer = dummyWallets[0].address;
    writeContractState({
        admin: deployer,
        authorizedList: [deployer],
        isPaused: false
    });
}

function readContractState() {
    try {
        return JSON.parse(localStorage.getItem(contractStateStorageKey)) || createDefaultContractState();
    } catch (error) {
        console.error(error);
        return createDefaultContractState();
    }
}

function writeContractState(state) {
    localStorage.setItem(contractStateStorageKey, JSON.stringify(state));
}

function createDefaultContractState() {
    const deployer = dummyWallets[0].address;
    return {
        admin: deployer,
        authorizedList: [deployer],
        isPaused: false
    };
}

function getWalletRole(wallet) {
    return contract.getRoleName(wallet.address);
}

function updateConnectedWalletLabel() {
    if (!currentWallet) return;

    document.getElementById("walletLabel").innerText = `Connected: ${shortAddress(currentWallet.address)} (${getWalletRole(currentWallet)})`;
}

function createDummyHash(input) {
    const payload = `${input}:${Date.now()}:${Math.random()}`;
    let hash = 0;

    for (let i = 0; i < payload.length; i++) {
        hash = ((hash << 5) - hash) + payload.charCodeAt(i);
        hash |= 0;
    }

    return `0x${Math.abs(hash).toString(16).padStart(64, "0")}`;
}

function shortAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function showToast(msg, classes) {
    const el = document.getElementById("toastMessage");
    if (!el) return;

    el.className = `mt-4 p-3 rounded-xl text-xs text-center border ${classes}`;
    el.innerText = msg;
    el.classList.remove("hidden");
}
