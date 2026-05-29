<?php
// 改進版：處理已結束拍賣的腳本 - 防止重複發送郵件
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/email/notify_winner.php';

echo "🔍 檢查已結束的拍賣（防重複發送版本）...\n\n";

// 找出已結束且郵件未發送的拍賣
$stmt = $conn->prepare('
    SELECT ItemID, title, end_time, SellerID, WinnerID
    FROM item
    WHERE NOW() > end_time
    AND (
        (WinnerID IS NULL) OR
        (WinnerID IS NOT NULL AND email_sent = FALSE)
    )
');
$stmt->execute();
$ended_auctions = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

if (empty($ended_auctions)) {
    echo "✅ 沒有需要處理的結束拍賣\n";
    exit;
}

echo "找到 " . count($ended_auctions) . " 個需要處理的拍賣\n\n";

foreach ($ended_auctions as $auction) {
    echo "=== 處理拍賣 ===\n";
    echo "商品ID: {$auction['ItemID']}\n";
    echo "商品: {$auction['title']}\n";
    echo "結束時間: {$auction['end_time']}\n";

    // 開始資料庫交易
    $conn->begin_transaction();

    try {
        // 如果還沒設定得標者，先找最高出價者
        if ($auction['WinnerID'] === null) {
            $bidStmt = $conn->prepare('
                SELECT b.UserID, u.email, u.name, b.bid_amount
                FROM bid b
                JOIN user u ON b.UserID = u.UserID
                WHERE b.ItemID = ?
                ORDER BY b.bid_amount DESC LIMIT 1
            ');
            $bidStmt->bind_param('i', $auction['ItemID']);
            $bidStmt->execute();
            $winner = $bidStmt->get_result()->fetch_assoc();
            $bidStmt->close();

            if (!$winner) {
                echo "❌ 沒有人出價，無得標者\n";
                $conn->commit();
                echo "\n";
                continue;
            }
        } else {
            // 已有得標者，取得得標者資訊
            $winnerStmt = $conn->prepare('
                SELECT u.UserID, u.email, u.name,
                       (SELECT bid_amount FROM bid WHERE ItemID = ? AND UserID = u.UserID ORDER BY bid_amount DESC LIMIT 1) as bid_amount
                FROM user u
                WHERE u.UserID = ?
            ');
            $winnerStmt->bind_param('ii', $auction['ItemID'], $auction['WinnerID']);
            $winnerStmt->execute();
            $winner = $winnerStmt->get_result()->fetch_assoc();
            $winnerStmt->close();
        }

        if ($winner) {
            echo "🏆 得標者: {$winner['name']} ({$winner['email']})\n";
            echo "💰 得標價: NT$ {$winner['bid_amount']}\n";

            // 🚨 先發送郵件，成功後才更新資料庫
            echo "📧 發送得標通知...\n";
            notify_winner($winner['email'], $winner['name'], $auction['title']);

            // 郵件發送成功，更新資料庫
            $updateStmt = $conn->prepare('
                UPDATE item
                SET WinnerID = ?, email_sent = TRUE
                WHERE ItemID = ?
            ');
            $updateStmt->bind_param('ii', $winner['UserID'], $auction['ItemID']);
            $updateStmt->execute();
            $updateStmt->close();

            // 添加站內通知
            $notifStmt = $conn->prepare("
                INSERT INTO notification (user_id, type, message, item_id)
                VALUES (?, 'won', ?, ?)
            ");
            $wonMsg = '恭喜！你得標了「' . $auction['title'] . '」';
            $notifStmt->bind_param('isi', $winner['UserID'], $wonMsg, $auction['ItemID']);
            $notifStmt->execute();
            $notifStmt->close();

            $conn->commit();
            echo "✅ 得標通知已發送且資料已更新！\n";

        }

    } catch (Exception $e) {
        $conn->rollback();
        echo "❌ 處理失敗: " . $e->getMessage() . "\n";
        echo "💡 資料庫已回滾，下次執行會重試\n";
    }

    echo "\n";
}

echo "✅ 處理完成！\n";
$conn->close();
?>