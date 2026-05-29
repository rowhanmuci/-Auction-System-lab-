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

    // 測試模式 - 只記錄不發送
    if (defined('EMAIL_TEST_MODE') && EMAIL_TEST_MODE) {
        $log_msg = "[TEST MODE] 得標通知 - 收件人: {$winner_email}, 姓名: {$winner_name}, 商品: {$item_title}";
        error_log($log_msg);
        echo "🧪 測試模式: 郵件已記錄但未實際發送\n";
        return;
    }

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

        $mail->Subject = '🏆 恭喜您得標！- C.R.E.A.M 拍賣系統';
        $mail->Body    = "親愛的 {$winner_name}，\n\n🎉 恭喜您成功得標！\n\n📦 得標商品：{$item_title}\n\n📞 請聯絡賣家進行後續交易事宜。\n\n感謝您使用 C.R.E.A.M 拍賣系統！\n\n---\nC.R.E.A.M 拍賣團隊";

        $mail->send();
        echo "✅ 郵件發送成功給 {$winner_email}\n";
    } catch (Exception $e) {
        // Email failure is non-fatal; log to file
        error_log('[notify_winner] Mailer Error: ' . $mail->ErrorInfo);
        echo "❌ 郵件發送失敗: " . $mail->ErrorInfo . "\n";
    }
}
