<?php

/**
 * Fungsi dari setiap parameter:
 * - $name: Nama file komponen yang ingin dirender (tanpa ekstensi .php)
 * - $props: Array asosiatif yang berisi data yang ingin dikirim ke komponen. Di dalam komponen, variabel ini akan diekstrak menjadi variabel biasa
 * - $slot: String opsional yang berisi konten tambahan yang ingin disisipkan ke dalam komponen. Di dalam komponen, variabel $slot bisa digunakan untuk menampilkan konten ini.
 */
function renderComponent($name, $props = [], $slot = '') {
    extract($props);
    ob_start();
    include "src/assets/components/{$name}.php";
    return ob_get_clean();
}

?>