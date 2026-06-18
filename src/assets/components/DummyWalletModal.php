<?php
// DummyWalletModal.php - Wallet connection chooser for demo transactions
?>

<div id="walletModal" class="fixed inset-0 z-50 hidden">
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeWalletModal()"></div>

    <div class="relative w-full min-h-screen flex items-center justify-center p-4">
        <section class="w-full max-w-lg bg-[#131524] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#171a2e]">
                <div>
                    <h2 class="text-base font-bold text-white">Connect Wallet</h2>
                    <p class="text-xs text-slate-400 mt-1">Connect MetaMask or paste an address for Remix authorization testing.</p>
                </div>
                <button onclick="closeWalletModal()"
                    class="w-9 h-9 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer">
                    X
                </button>
            </div>

            <div class="p-5 space-y-4">
                <div class="bg-[#0b0c14] border border-slate-800 rounded-xl p-4">
                    <label class="text-[11px] text-slate-400 block mb-2">Contract Address</label>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="text" id="contractAddressInput" placeholder="0x..."
                            class="flex-1 min-w-0 bg-[#131524] border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-white font-mono">
                        <button onclick="saveContractAddressFromInput()"
                            class="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer">
                            Use
                        </button>
                    </div>
                    <p class="text-[10px] text-slate-500 mt-2">
                        Current: <span id="activeContractAddress" class="font-mono text-slate-400">-</span>
                    </p>
                </div>

                <button onclick="connectMetaMaskWallet()"
                    class="w-full text-left bg-[#0b0c14] border border-slate-800 hover:border-indigo-500 rounded-xl p-4 transition cursor-pointer">
                    <div class="flex items-center justify-between gap-4">
                        <div>
                            <p class="text-sm font-semibold text-white">MetaMask SSO</p>
                            <p class="text-xs text-slate-500 mt-1">Request account access from the browser wallet.</p>
                        </div>
                        <span class="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded-md">
                            WALLET
                        </span>
                    </div>
                </button>

                <div class="bg-[#0b0c14] border border-slate-800 rounded-xl p-4">
                    <label class="text-[11px] text-slate-400 block mb-2">Paste Wallet Address</label>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="text" id="pastedWalletAddress" placeholder="0x..."
                            class="flex-1 min-w-0 bg-[#131524] border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-white font-mono">
                        <button onclick="connectPastedWallet()"
                            class="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer">
                            Connect
                        </button>
                    </div>
                </div>

                <button id="btnDisconnectWallet" onclick="disconnectWallet()"
                    class="w-full hidden bg-red-600/10 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition cursor-pointer">
                    Disconnect Wallet
                </button>
            </div>

            <div class="px-5 pb-5">
                <div class="border border-slate-800 rounded-xl bg-[#0b0c14] p-4">
                    <div class="flex items-center justify-between gap-3 mb-3">
                        <div>
	                            <h3 class="text-sm font-semibold text-white">Contract Authorization</h3>
	                            <p class="text-[11px] text-slate-500 mt-1" id="authPanelStatus">
	                                Connect a wallet to inspect its current authorization role.
	                            </p>
                        </div>
                        <span class="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-md">
                            CONTRACT STATE
                        </span>
                    </div>

                    <div class="space-y-2">
                        <div class="flex items-center justify-between gap-3 border border-slate-800 rounded-xl px-3 py-2 bg-[#131524]">
                            <span class="text-[11px] text-slate-500">Connected Address</span>
                            <span id="authConnectedAddress" class="text-[11px] text-slate-300 font-mono truncate">-</span>
                        </div>
                        <div class="flex items-center justify-between gap-3 border border-slate-800 rounded-xl px-3 py-2 bg-[#131524]">
                            <span class="text-[11px] text-slate-500">Current Role</span>
                            <span id="authConnectedRole" class="text-[11px] text-emerald-400 font-semibold">-</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="px-6 py-4 border-t border-slate-800 bg-[#0f111d]">
                <p class="text-[11px] leading-relaxed text-slate-500">
                    Authorization is owned by the VerifikasiEmasPro contract. Set address authorization in Remix,
                    then reconnect or paste the address here to test the selected wallet flow.
                </p>
            </div>
        </section>
    </div>
</div>
