<?php
// RegistryStats.php - Component untuk menampilkan system engine dan wallet info

if (!isset($walletConnected)) {
    $walletConnected = false;
    $walletAddress = '';
}
?>

<div class="bg-[#131524] border border-slate-800 p-5 rounded-2xl">
    <h3 class="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Registry Stats</h3>
    <div class="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
        <span class="text-sm text-slate-400">System Engine</span>
        <span class="text-sm font-semibold text-emerald-400">VerifikasiEmasPro Dummy</span>
    </div>
    <div>
        <span class="text-xs text-slate-500 block truncate font-mono" id="walletLabel">
            <?= $walletConnected ? "Connected: " . $walletAddress : "Wallet Not Connected" ?>
        </span>
    </div>
</div>
