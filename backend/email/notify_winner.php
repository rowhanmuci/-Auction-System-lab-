<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/phpmailer/src/Exception.php';
require_once __DIR__ . '/../vendor/phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/../vendor/phpmailer/src/SMTP.php';

function notify_winner(string $winner_email, string $winner_name, string $item_title): void
{
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'your@gmail.com';   // ← 換成你的 Gmail
        $mail->Password   = 'your-app-password'; // ← Gmail App Password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->SMTPDebug  = SMTP::DEBUG_OFF;    // 改成 SMTP::DEBUG_SERVER 可看 log

        $mail->setFrom('your@gmail.com', 'Auction System');
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
