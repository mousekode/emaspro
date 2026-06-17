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
                    <p class="text-xs text-slate-400 mt-1">Use local Remix-style accounts with contract-owned roles.</p>
                </div>
                <button onclick="closeWalletModal()"
                    class="w-9 h-9 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer">
                    X
                </button>
            </div>

            <div class="p-5 space-y-3" id="dummyWalletList"></div>

            <div class="px-5 pb-5">
                <div class="border border-slate-800 rounded-xl bg-[#0b0c14] p-4">
                    <div class="flex items-center justify-between gap-3 mb-3">
                        <div>
                            <h3 class="text-sm font-semibold text-white">Contract Authorization</h3>
                            <p class="text-[11px] text-slate-500 mt-1" id="authPanelStatus">
                                Connect the admin dummy wallet to manage authorized issuers.
                            </p>
                        </div>
                        <span class="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-md">
                            CONTRACT STATE
                        </span>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-2">
                        <select id="authWalletSelect"
                            class="flex-1 bg-[#131524] border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-white">
                        </select>
                        <div class="flex gap-2 shrink-0">
                            <button onclick="authorizeSelectedWallet()"
                                title="Authorize selected wallet"
                                aria-label="Authorize selected wallet"
                                class="w-10 h-10 flex items-center justify-center bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-600 hover:text-white transition cursor-pointer">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                            </button>
                            <button onclick="removeSelectedAuthorization()"
                                title="Remove selected authorization"
                                aria-label="Remove selected authorization"
                                class="w-10 h-10 flex items-center justify-center bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-600 hover:text-white transition cursor-pointer">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 11h-6"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="px-6 py-4 border-t border-slate-800 bg-[#0f111d]">
                <p class="text-[11px] leading-relaxed text-slate-500">
                    Demo mode stores certificate and authorization records in this browser's local storage and mirrors
                    the VerifikasiEmasPro access rules for admin, authorized issuer, verify, and revoke flows.
                </p>
            </div>
        </section>
    </div>
</div>
