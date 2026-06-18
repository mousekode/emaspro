<?php
// CertificateVerifier.php - Component untuk query/verifikasi sertifikat
?>

<div class="bg-[#131524] border border-slate-800 p-6 rounded-2xl shadow-xl">
    <h2 class="text-xl font-bold text-white mb-2">Verify Authenticity</h2>
    <p class="text-sm text-slate-400 mb-6">
        Masukkan nomor seri emas untuk memvalidasi data sertifikat dari contract registry.
    </p>

    <div class="flex gap-3">
        <div class="relative flex-1">
            <span class="absolute left-4 top-3.5 text-slate-500 text-sm">#</span>
            <input type="text" id="querySerial" placeholder="Enter Certificate Gold Serial Number..."
                class="w-full bg-[#0b0c14] border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl pl-8 pr-4 py-3 text-sm transition tracking-wide text-white">
        </div>
        <button onclick="cekKeaslianEmas()"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 rounded-xl transition duration-200 flex items-center gap-2 cursor-pointer text-sm shadow-lg shadow-indigo-600/15">
            🔍 Query Registry
        </button>
    </div>
    <div id="toastMessage" class="mt-4 p-3 rounded-xl text-xs text-center hidden"></div>
</div>
