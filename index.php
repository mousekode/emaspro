<?php
// index.php
// woy ganti
// routing agar bisa menggunakan $routes dan resolveRoute()
// renderComponent agar bisa menggunakan renderComponent() di Layout.php
require_once 'helper/routing.php';
require_once 'helper/renderComponent.php';

$routes = [
    '/'                 => 'src/views/HomeView.php',
    '/home'             => 'src/views/HomeView.php',
    '/certificate-review'=> 'src/views/CertificateView.php',
];

// Resolve the current page and normalized route (for Navbar, breadcrumbs, etc.)
$result = resolveRoute($routes, 'src/views/404.php');
$page = $result['page'];
$route = $result['route'];


// Laman utama
include 'src/Layout.php';