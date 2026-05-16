<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/phpmailer/src/Exception.php';
require_once __DIR__ . '/../vendor/phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/../vendor/phpmailer/src/SMTP.php';

function notify_winner(string $winner_email, string $winner_name, string $item_title): void
{
    require_once __DIR__ . '/../config/email.php';
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USERNAME;
        $mail->Password   = SMTP_PASSWORD;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;
        $mail->SMTPDebug  = SMTP::DEBUG_OFF;

        $mail->setFrom(SMTP_FROM, SMTP_FROM_NAME);
        $mail->addAddress($winner_email, $winner_name);
        $mail->CharSet = 'UTF-8';

        $mail->Subject = '恭喜您得標！';
        $mail->Body    = "親愛的 {$winner_name}，\n\n您已成功得標商品：{$item_title}\n\n感謝您使用本拍賣系統！";

        $mail->send();
    } catch (Exception $e) {
        // Email failure is non-fatal; log to file
        error_log('[notify_winner] Mailer Error: ' . $mail->ErrorInfo);
    }
}
