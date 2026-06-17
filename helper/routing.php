<?php
// helper/routing.php

/**
 * Sistem routing sederhana untuk memetakan URL ke file PHP yang sesuai.
 * Bisa di-extend untuk dukung dynamic routes, query params, dll.
 * Contoh penggunaan:
 * $routes = [
 *     '/' => 'src/views/HomeView.php',
 *     '/about' => 'src/views/AboutView.php',
 * ];
 * $result = resolveRoute($routes);
 * $page = $result['page'];
 * $route = $result['route'];
 * include $page;
 */
function resolveRoute($routes, $default = 'src/views/404.php') {
    // Normalize and extract the current path
    $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if ($requestUri !== '/' && substr($requestUri, -1) === '/') {
        $requestUri = rtrim($requestUri, '/');
    }

    // Resolve page if route exists
    if (array_key_exists($requestUri, $routes)) {
        return ['page' => $routes[$requestUri], 'route' => $requestUri];
    }

    // Fallback: 404 page, but still return the normalized route
    http_response_code(404);
    return ['page' => $default, 'route' => $requestUri];
}

?>