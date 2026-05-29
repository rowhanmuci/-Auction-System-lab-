<?php
// 處理已結束拍賣的腳本 - 主動檢查並發送得標通知
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/email/notify_winner.php';

echo "🔍 檢查已結束的拍賣...\n\n";

// 找出已結束但WinnerID還是NULL的拍賣
$stmt = $conn->prepare('
    SELECT ItemID, title, end_time, SellerID
    FROM item
    WHERE NOW() > end_time AND WinnerID IS NULL
');
$stmt->execute();
$ended_auctions = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

if (empty($ended_auctions)) {
    echo "✅ 沒有需要處理的結束拍賣\n";
    exit;
}

echo "找到 " . count($ended_auctions) . " 個已結束的拍賣\n\n";

foreach ($ended_auctions as $auction) {
    echo "=== 處理拍賣 ===\n";
    echo "商品ID: {$auction['ItemID']}\n";
    echo "商品: {$auction['title']}\n";
    echo "結束時間: {$auction['end_time']}\n";

    // 找最高出價者
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

    if ($winner) {
        echo "🏆 得標者: {$winner['name']} ({$winner['email']})\n";
        echo "💰 得標價: NT$ {$winner['bid_amount']}\n";

        // 設定得標者
        $updateStmt = $conn->prepare('UPDATE item SET WinnerID = ? WHERE ItemID = ?');
        $updateStmt->bind_param('ii', $winner['UserID'], $auction['ItemID']);
        $updateStmt->execute();
        $updateStmt->close();

        // 發送得標通知
        try {
            notify_winner($winner['email'], $winner['name'], $auction['title']);
            echo "📧 得標通知已發送！\n";

            // 發送通知給得標者
            $notifStmt = $conn->prepare("
                INSERT INTO notification (user_id, type, message, item_id)
                VALUES (?, 'won', ?, ?)
            ");
            $wonMsg = '恭喜！你得標了「' . $auction['title'] . '」';
            $notifStmt->bind_param('isi', $winner['UserID'], $wonMsg, $auction['ItemID']);
            $notifStmt->execute();
            $notifStmt->close();

        } catch (Exception $e) {
            echo "❌ 郵件發送失敗: " . $e->getMessage() . "\n";
        }
    } else {
        echo "❌ 沒有人出價，無得標者\n";
    }

    echo "\n";
}

echo "✅ 處理完成！\n";
$conn->close();
?>