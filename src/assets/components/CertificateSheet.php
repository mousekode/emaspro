<?php
// CertificateSheet.php - Component untuk menampilkan template sertifikat visual
?>

<div class="bg-[#131524] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
    <div class="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#171a2e]">
        <span class="text-xs font-bold text-slate-400 tracking-wider uppercase">👁️ Gold Certificate Preview</span>
        <span class="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-mono animate-pulse">
            LIVE ON-CHAIN RENDERING
        </span>
    </div>

    <div class="p-6 md:p-10 flex justify-center items-center bg-[#0e101b] min-h-[420px]">

        <div id="placeholderView" class="text-center space-y-3">
            <div class="text-4xl text-slate-600">📄</div>
            <p class="text-sm font-semibold text-slate-400">No Certificate Loaded</p>
            <p class="text-xs text-slate-500">Masukkan nomor seri di atas untuk merender lembar sertifikasi visual.</p>
        </div>

        <div id="certificateSheet"
            class="w-full max-w-2xl bg-[#faf9f5] text-slate-900 rounded-lg p-8 relative shadow-2xl border-[12px] border-double border-amber-600/20 hidden flex-col justify-between min-h-[460px]">

            <div class="absolute top-2 left-2 text-[10px] text-amber-800/10 font-serif">SECURE DECENTRALIZED LEDger</div>
            <div class="absolute bottom-2 right-2 text-[10px] text-amber-800/10 font-serif">GOLDCHAIN PRO ENGINE</div>

            <div class="text-center space-y-2 mt-4">
                <span class="text-3xl">👑</span>
                <h2 class="gold-font text-2xl font-bold tracking-wider text-amber-800">OFFICIAL CERTIFICATE OF AUTHENTICITY</h2>
                <p class="text-[10px] tracking-widest font-semibold text-slate-500 uppercase border-b border-slate-300 pb-4 max-w-md mx-auto">
                    Issued Under Cryptographic Bullion Verification Registry
                </p>
            </div>

            <div class="text-center my-6 space-y-4">
                <p class="text-xs italic text-slate-500">Sertifikat ini dengan sah menerangkan status komoditas komersial:</p>
                <h3 id="certStatusMsg"
                    class="text-xl font-bold text-slate-900 tracking-wide font-serif border-b border-slate-200 inline-block px-6 pb-1">
                    -
                </h3>

                <p class="text-xs text-slate-600 max-w-md mx-auto">
                    Logam mulia dengan nomor identifikasi terlampir di bawah dinyatakan terdaftar secara absah pada sistem basis data terdistribusi EVM.
                </p>
            </div>

            <div class="grid grid-cols-2 gap-4 text-xs text-slate-600 border-t border-slate-200 pt-6 px-4">
                <div class="space-y-1">
                    <p><span class="font-medium text-slate-400 uppercase text-[9px] block">Production Batch</span> 
                    <span id="certBatch" class="font-semibold text-slate-800">-</span></p>
                    <p><span class="font-medium text-slate-400 uppercase text-[9px] block">Block Timestamp</span> 
                    <span id="certDate" class="font-semibold text-slate-800">-</span></p>
                </div>
                <div class="space-y-1 font-mono text-right flex flex-col justify-end items-end">
                    <p class="text-[9px] text-slate-400 uppercase">Serial Number</p>
                    <span id="certSerial"
                        class="text-sm font-bold text-indigo-900 tracking-wider bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                        -
                    </span>
                </div>
            </div>

            <div class="flex justify-between items-center mt-6 pt-4 border-t border-dashed border-slate-200">
                <div class="text-[8px] text-slate-400 font-mono">
                    SECURITY LEVEL: HIGH_EVM_PROOF<br>
                    ENGINE_VER: VERIFIKASI_EMAS_PRO
                </div>
                <div id="certStamp"
                    class="w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center font-bold text-[9px] uppercase tracking-tighter font-serif rotate-[-12deg] shadow-sm transition">
                    <span id="stampText">PENDING</span>
                </div>
            </div>
        </div>

    </div>
</div>
