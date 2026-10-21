<?php

$temporaryPaths = [
    'APP_CONFIG_CACHE' => '/tmp/laravel-config.php',
    'APP_EVENTS_CACHE' => '/tmp/laravel-events.php',
    'APP_PACKAGES_CACHE' => '/tmp/laravel-packages.php',
    'APP_ROUTES_CACHE' => '/tmp/laravel-routes.php',
    'APP_SERVICES_CACHE' => '/tmp/laravel-services.php',
    'VIEW_COMPILED_PATH' => '/tmp/laravel-views',
];

foreach ($temporaryPaths as $name => $value) {
    putenv("{$name}={$value}");
    $_ENV[$name] = $value;
    $_SERVER[$name] = $value;
}

if (! is_dir('/tmp/laravel-views')) {
    mkdir('/tmp/laravel-views', 0775, true);
}

require __DIR__.'/../public/index.php';