<?php
// MintingPanel.php - Component untuk membuat sertifikat emas
?>

<div class="bg-[#131524] border border-slate-800 p-5 rounded-2xl">
    <div class="flex items-center justify-between mb-4">
        <span class="text-xs font-bold text-slate-400 tracking-wider uppercase">🏭 Minting Panel</span>
        <span class="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md">
            Otoritas Pabrik
        </span>
    </div>
    <div class="space-y-4">
        <div>
            <label class="text-[11px] text-slate-400 block mb-1">Nomor Seri Emas</label>
            <input type="text" id="addSerial" placeholder="Contoh: AUG-666"
                class="w-full bg-[#0b0c14] border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm transition text-white">
        </div>
        <div>
            <label class="text-[11px] text-slate-400 block mb-1">Batch Produksi</label>
            <input type="text" id="addBatch" placeholder="Contoh: BATCH-2026-A"
                class="w-full bg-[#0b0c14] border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm transition text-white">
        </div>
        <div>
            <label class="text-[11px] text-slate-400 block mb-1">Nama Pemilik Awal</label>
            <input type="text" id="addOwner" placeholder="Contoh: PT Emas Nusantara"
                class="w-full bg-[#0b0c14] border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm transition text-white">
        </div>

        <button onclick="buatSertifikatEmas()"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition duration-200 cursor-pointer shadow-md">
            Issue Gold Certificate
        </button>

        <div class="border-t border-slate-800 my-2 pt-4">
            <label class="text-[11px] text-slate-400 block mb-1 font-semibold text-amber-400">
                Ubah Nama Pemilik Sertifikat
            </label>
            <div class="space-y-2">
                <input type="text" id="ownerSerial" placeholder="Masukkan ID Serial"
                    class="w-full bg-[#0b0c14] border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-1.5 text-xs text-white">
                <div class="flex gap-2">
                    <input type="text" id="ownerName" placeholder="Nama pemilik baru"
                        class="flex-1 min-w-0 bg-[#0b0c14] border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-1.5 text-xs text-white">
                    <button onclick="ubahPemilikSertifikat()"
                        class="shrink-0 bg-amber-600/20 text-amber-400 border border-amber-500/30 px-3 rounded-xl text-xs hover:bg-amber-600 hover:text-white transition cursor-pointer font-medium">
                        Update
                    </button>
                </div>
            </div>
        </div>

        <div class="border-t border-slate-800 my-2 pt-4">
            <label class="text-[11px] text-slate-400 block mb-1 font-semibold text-red-400">
                Menu Pembatalan Kartu (Revoke)
            </label>
            <div class="flex gap-2">
                <input type="text" id="statusSerial" placeholder="Masukkan ID Serial"
                    class="flex-1 bg-[#0b0c14] border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-1.5 text-xs text-white">
                <button onclick="ubahStatusValidasi()"
                    class="bg-red-600/20 text-red-400 border border-red-500/30 px-4 rounded-xl text-xs hover:bg-red-600 hover:text-white transition cursor-pointer font-medium">
                    Revoke
                </button>
            </div>
        </div>
    </div>
</div>
