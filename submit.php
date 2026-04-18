<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === ALLOWED_ORIGIN) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Methods: POST');
    header('Access-Control-Allow-Headers: Content-Type');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['ok' => false, 'error' => 'Método no permitido.']));
}

// Rate limiting: 5 envíos por 10 min por IP
$ip       = filter_var(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '')[0], FILTER_VALIDATE_IP) ?: 'unknown';
$rateFile = sys_get_temp_dir() . '/rl_' . md5($ip) . '.json';
$rate     = file_exists($rateFile) ? json_decode(file_get_contents($rateFile), true) : ['count' => 0, 'start' => time()];
if ((time() - $rate['start']) > 600) $rate = ['count' => 0, 'start' => time()];
if ($rate['count'] >= 5) {
    http_response_code(429);
    exit(json_encode(['ok' => false, 'error' => 'Demasiados intentos. Espera unos minutos.']));
}
$rate['count']++;
file_put_contents($rateFile, json_encode($rate), LOCK_EX);

// Leer body
$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    http_response_code(400);
    exit(json_encode(['ok' => false, 'error' => 'Solicitud inválida.']));
}

// Reglas
$fields = [
    'nombre'   => ['required' => true,  'max' => 100,  'type' => 'text'],
    'apellido' => ['required' => true,  'max' => 100,  'type' => 'text'],
    'empresa'  => ['required' => true,  'max' => 100,  'type' => 'text'],
    'correo'   => ['required' => true,  'max' => 150,  'type' => 'email'],
    'telefono' => ['required' => true,  'max' => 20,   'type' => 'tel'],
    'servicio' => ['required' => false, 'max' => 100,  'type' => 'whitelist'],
    'mensaje'  => ['required' => true,  'max' => 1000, 'type' => 'text'],
];

$allowed_servicios = [
    '', 'Monitoreo de Publicidad Exterior y Digital',
    'Monitoreo de PDV Interior', 'Auditoría de Imagen Corporativa',
    'POP Refresh', 'Todos los servicios',
];

$injection = '/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|UNION|EXEC|EXECUTE|CAST|DECLARE|WAITFOR|XP_)\b|--|\/\*|\*\/|;\s*\w|<\s*script|javascript\s*:|on\w+\s*=)/i';

// Validar
$clean  = [];
$errors = [];

foreach ($fields as $name => $rules) {
    $value = trim((string)($data[$name] ?? ''));

    if ($rules['required'] && $value === '') { $errors[] = "El campo '{$name}' es obligatorio."; continue; }
    if (mb_strlen($value) > $rules['max'])   { $errors[] = "El campo '{$name}' excede {$rules['max']} caracteres."; continue; }

    if ($rules['type'] === 'email' && $value !== '' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'El correo electrónico no es válido.'; continue;
    }
    if ($rules['type'] === 'tel' && $value !== '' && !preg_match('/^[0-9\s\+\-\(\)]{7,20}$/', $value)) {
        $errors[] = 'El teléfono no tiene un formato válido.'; continue;
    }
    if ($rules['type'] === 'whitelist' && !in_array($value, $allowed_servicios, true)) {
        $errors[] = 'El servicio seleccionado no es válido.'; continue;
    }
    if ($value !== '' && preg_match($injection, $value)) {
        $errors[] = "El campo '{$name}' contiene caracteres no permitidos."; continue;
    }

    $clean[$name] = strip_tags(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value));
}

if (!empty($errors)) {
    http_response_code(422);
    exit(json_encode(['ok' => false, 'errors' => $errors]));
}

// Conectar
try {
    $pdo = new PDO(
        sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET),
        DB_USER, DB_PASS,
        [
            PDO::ATTR_ERRMODE          => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    error_log('[Publiser] DB: ' . $e->getMessage());
    http_response_code(500);
    exit(json_encode(['ok' => false, 'error' => 'Error interno. Intenta más tarde.']));
}

// Insertar
try {
    $stmt = $pdo->prepare("
        INSERT INTO clientes (nombre, apellido, empresa, correo, telefono, servicio, mensaje)
        VALUES (:nombre, :apellido, :empresa, :correo, :telefono, :servicio, :mensaje)
    ");
    $stmt->execute([
        ':nombre'   => $clean['nombre'],
        ':apellido' => $clean['apellido'],
        ':empresa'  => $clean['empresa'],
        ':correo'   => $clean['correo'],
        ':telefono' => $clean['telefono'],
        ':servicio' => $clean['servicio'] ?? '',
        ':mensaje'  => $clean['mensaje'],
    ]);
    exit(json_encode(['ok' => true]));
} catch (PDOException $e) {
    error_log('[Publiser] Insert: ' . $e->getMessage());
    http_response_code(500);
    exit(json_encode(['ok' => false, 'error' => 'Error al guardar. Intenta más tarde.']));
}
