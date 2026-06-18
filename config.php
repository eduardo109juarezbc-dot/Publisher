<?php
// ============================================================
//  Configuración de base de datos — NO exponer en producción
//  Coloca este archivo FUERA del document root si es posible,
//  o protégelo con reglas de servidor (.htaccess / nginx).
// ============================================================

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'publise2_customers');
define('DB_USER', 'publise2_lalo');
define('DB_PASS', 'b;$J5q6n79?EmZ=');
define('DB_CHARSET', 'utf8mb4');

// Orígenes permitidos para CORS (tu dominio en producción)
define('ALLOWED_ORIGIN', 'https://publisermx.com');
