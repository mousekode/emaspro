<?php
// DummyWalletModal.php - Local Remix-style wallet picker for demo transactions
?>

<div id="walletModal" class="fixed inset-0 z-50 hidden">
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeWalletModal()"></div>

    <div class="relative w-full min-h-screen flex items-center justify-center p-4">
        <section class="w-full max-w-lg bg-[#131524] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#171a2e]">
                <div>
                    <h2 class="text-base font-bold text-white">Connect Remix Dummy Wallet</h2>
                    <p class="text-xs text-slate-400 mt-1">Use local demo accounts without MetaMask or Sepolia switching.</p>
                </div>
                <button onclick="closeWalletModal()"
                    class="w-9 h-9 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer">
                    X
                </button>
            </div>

            <div class="p-5 space-y-3" id="dummyWalletList"></div>

            <div class="px-6 py-4 border-t border-slate-800 bg-[#0f111d]">
                <p class="text-[11px] leading-relaxed text-slate-500">
                    Demo mode stores certificate records in this browser's local storage and mirrors the
                    VerifikasiEmasPro access rules for admin, authorized issuer, verify, and revoke flows.
                </p>
            </div>
        </section>
    </div>
</div>
