<?php
/*
 * Простой PHP-прокси для приёма заявок с сайта и отправки на почту через mail().
 * Файл кладётся в корень сайта на рег.ру (public_html/).
 * Сайт (статика) делает fetch POST на /send.php, этот скрипт отправляет письмо.
 */

// Разрешаем CORS — нужно если домен сайта и скрипта совпадают, оставляем для надёжности
header('Access-Control-Allow-Origin: https://cer.moscow');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Preflight OPTIONS-запрос от браузера — просто отвечаем 200
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// Читаем JSON из тела запроса
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

$name    = isset($data['name'])    ? trim($data['name'])    : '';
$email   = isset($data['email'])   ? trim($data['email'])   : '';
$source  = isset($data['source'])  ? trim($data['source'])  : 'Консультация';
$payload = isset($data['payload']) ? $data['payload']       : null;

// Валидация
if (!$name || !$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Name and valid email are required']);
    exit;
}

// Куда слать письмо
$to      = 'info@cer.moscow';
$subject = '=?UTF-8?B?' . base64_encode('Заявка на консультацию с сайта ЦЭР — ' . $name) . '?=';

// Тело письма
$bodyLines = [
    'Новая заявка с сайта cer.moscow',
    '',
    'Источник: ' . $source,
    'Имя:     ' . $name,
    'Почта:   ' . $email,
];

if ($payload) {
    $bodyLines[] = '';
    $bodyLines[] = 'Данные расчёта:';
    $bodyLines[] = is_array($payload) || is_object($payload)
        ? json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
        : (string)$payload;
}

$body = implode("\r\n", $bodyLines);

// Заголовки письма
$headers  = 'From: =?UTF-8?B?' . base64_encode('Сайт ЦЭР') . '?= <noreply@cer.moscow>' . "\r\n";
$headers .= 'Reply-To: ' . $name . ' <' . $email . '>' . "\r\n";
$headers .= 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-Type: text/plain; charset=UTF-8' . "\r\n";
$headers .= 'Content-Transfer-Encoding: base64' . "\r\n";
$headers .= 'X-Mailer: PHP/' . phpversion();

// Отправляем
$sent = mail($to, $subject, base64_encode($body), $headers);

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'mail() failed']);
}
