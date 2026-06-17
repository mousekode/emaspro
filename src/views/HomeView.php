<?php
// src/views/HomeView.php - Halaman utama yang merangkai semua komponen

// Include renderComponent function
require_once 'helper/renderComponent.php';
?>

<div class="flex flex-col items-center w-full min-h-screen px-4 md:px-8 py-8">
    
    <!-- Header Component -->
    <?= renderComponent('Header'); ?>
    <?= renderComponent('DummyWalletModal'); ?>

    <!-- Main Content Grid -->
    <main class="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Left Sidebar -->
        <div class="space-y-6">
            <!-- Registry Stats Component -->
            <?= renderComponent('RegistryStats'); ?>

            <!-- Minting Panel Component -->
            <?= renderComponent('MintingPanel'); ?>
        </div>

        <!-- Right Content Area -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Certificate Verifier Component -->
            <?= renderComponent('CertificateVerifier'); ?>

            <!-- Certificate Sheet Component -->
            <?= renderComponent('CertificateSheet'); ?>
        </div>

    </main>

</div>
