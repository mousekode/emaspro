// GoldChain Pro - Remix dummy wallet demo adapter

const dummyWallets = [
    {
        name: "Account 1",
        role: "Admin",
        address: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
        authorized: true,
        admin: true
    },
    {
        name: "Account 2",
        role: "Authorized Factory",
        address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
        authorized: true,
        admin: false
    },
    {
        name: "Account 3",
        role: "Public Verifier",
        address: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
        authorized: false,
        admin: false
    }
];

const registryStorageKey = "goldchain_dummy_registry";
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

    daftarkanEmas(serialNumber, batch) {
        this.requireAuthorized();

        const registry = readRegistry();
        if (registry[serialNumber]?.isRegistered) {
            throw new Error("Nomor seri sudah terdaftar!");
        }

        registry[serialNumber] = {
            isRegistered: true,
            timestamp: Math.floor(Date.now() / 1000),
            batchProduksi: batch,
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

    cekKeaslian(serialNumber) {
        const record = readRegistry()[serialNumber];

        if (!record?.isRegistered) {
            return [false, "PALSU / TIDAK TERDAFTAR", "", 0];
        }

        if (record.isRevoked) {
            return [
                true,
                "PERINGATAN: KARTU DIBATALKAN / DILAPORKAN HILANG",
                record.batchProduksi,
                record.timestamp
            ];
        }

        return [true, "VALID & ASLI", record.batchProduksi, record.timestamp];
    }

    requireAuthorized() {
        if (!this.wallet?.authorized) {
            throw new Error("Akses ditolak: Alamat tidak terauthorisasi!");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    contract = new DummyVerifikasiEmasPro(null);
    renderDummyWallets();
});

function openWalletModal() {
    document.getElementById("walletModal").classList.remove("hidden");
}

function closeWalletModal() {
    document.getElementById("walletModal").classList.add("hidden");
}

function connectWallet(index) {
    currentWallet = dummyWallets[index];
    contract = new DummyVerifikasiEmasPro(currentWallet);

    const btn = document.getElementById("btnConnect");
    btn.innerText = `${currentWallet.name} Connected`;
    btn.className = "bg-slate-800 text-slate-400 text-sm font-semibold py-2 px-5 rounded-xl border border-slate-700";

    document.getElementById("walletLabel").innerText = `Connected: ${shortAddress(currentWallet.address)} (${currentWallet.role})`;
    closeWalletModal();
    showToast(`Connected to ${currentWallet.name}: ${currentWallet.role}`, "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20");
}

function renderDummyWallets() {
    const list = document.getElementById("dummyWalletList");
    if (!list) return;

    list.innerHTML = dummyWallets.map((wallet, index) => {
        const badgeClass = wallet.authorized
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
                        ${wallet.role}
                    </span>
                </div>
            </button>
        `;
    }).join("");
}

async function buatSertifikatEmas() {
    if (!currentWallet) return alert("Hubungkan dummy wallet terlebih dahulu!");

    const sn = document.getElementById("addSerial").value.trim();
    const batch = document.getElementById("addBatch").value.trim();

    if (!sn || !batch) return alert("Mohon lengkapi kolom Serial Number dan Batch!");

    showToast("Memproses transaksi demo dari dummy wallet...", "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20");
    try {
        const tx = contract.daftarkanEmas(sn, batch);
        showToast("Menulis data ke registry lokal Remix dummy...", "bg-amber-500/10 text-amber-400 border border-amber-500/20");
        await tx.wait();
        showToast("Sukses! Emas berhasil didaftarkan di registry demo.", "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20");

        document.getElementById("addSerial").value = "";
        document.getElementById("addBatch").value = "";
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

        document.getElementById("placeholderView").classList.add("hidden");
        document.getElementById("certificateSheet").classList.remove("hidden");

        document.getElementById("certSerial").innerText = sn;
        document.getElementById("certStatusMsg").innerText = pesanStatus;
        document.getElementById("certBatch").innerText = terdaftar ? batch : "N/A";

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
