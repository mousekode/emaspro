<?php
// Header.php - Component untuk header utama dengan wallet connection
?>

<header
    class="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center bg-[#131524] border border-slate-800 rounded-2xl px-6 py-4 mb-6 gap-4">
    <div class="flex items-center gap-3">
        <span class="text-2xl">🏆</span>
        <div>
            <h1 class="text-xl font-bold tracking-tight text-white">GoldChain</h1>
            <p class="text-xs text-slate-400">PREMIUM ASSET REGISTRY</p>
        </div>
    </div>
    <div class="flex flex-wrap items-center gap-3">
        <span
            class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-2">
            <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Network: Remix / Wallet Test
        </span>
        <button id="btnConnect" onclick="openWalletModal()"
            class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-5 rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-indigo-600/20">
            Connect Wallet
        </button>
    </div>
</header>
