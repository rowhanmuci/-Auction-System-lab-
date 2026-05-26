# C.R.E.A.M Auction System

A full-stack online auction platform built with React + PHP + MySQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, MUI 9, React Router 7, Vite 8 |
| Backend | PHP 8, MySQL (XAMPP) |
| Auth | PHP Session + localStorage |
| Email | PHPMailer (winner notification) |

## Features

- **Browse** active listings with category filter and keyword search
- **Item detail** — image gallery, current highest bid, time remaining, collapsible bid history
- **Bidding** — must exceed current price; seller cannot bid on own item
- **My Listings** — seller's own auctions grouped by status (active / upcoming / ended)
- **My Bids** — buyer's bid history with leading / outbid / won / lost chips
- **Notifications** — in-app bell icon with unread badge; notifies on outbid, auction won, and new comments on your board
- **Winner resolution** — determined on first `detail.php` load after auction ends; confirmation email sent via PHPMailer
- **Image upload** — upload files directly or paste image URLs when listing an item
- **User boards** — per-user comment board visible on item pages and profile page
- **Form UX** — loading states on all submissions; password confirmation on register; time range validation on sell

---

## Project Structure

```
auction/
├── auction.sql                   # Main database schema + seed data
├── app/                          # Production build output (git-ignored)
├── uploads/                      # Uploaded item images (git-ignored, create manually)
├── frontend/                     # React source
│   ├── src/
│   │   ├── components/           # Navbar (search + notifications), ItemCard
│   │   ├── pages/                # HomePage, ItemDetailPage, LoginPage, RegisterPage,
│   │   │                         #   SellPage, ProfilePage, MyListingsPage, MyBidsPage
│   │   ├── api.js                # Fetch helpers + auth state
│   │   ├── theme.js              # MUI theme (#317b88 / #d63b99)
│   │   └── main.jsx
│   └── vite.config.js            # base=/auction/app/, proxy→localhost
└── backend/
    ├── config/
    │   ├── db.php                # MySQL connection + timezone (Asia/Taipei)
    │   ├── email.php             # SMTP credentials (git-ignored)
    │   └── add_notifications.sql # One-time migration for notification table
    ├── api/
    │   ├── auth/                 # login, logout, register
    │   ├── bids/                 # place, current, history, my
    │   ├── categories/           # list
    │   ├── comments/             # get, post
    │   ├── items/                # list, detail, create, search, my, upload_image
    │   ├── notifications/        # list, mark_read
    │   └── users/                # profile
    └── email/                    # notify_winner.php (PHPMailer)
```

---

## Setting Up From Scratch (New Machine)

### Prerequisites

| Tool | Download |
|------|----------|
| XAMPP (Apache + MySQL + PHP 8) | https://www.apachefriends.org |
| Node.js 18+ | https://nodejs.org |
| Git | https://git-scm.com |

---

### Step 1 — Clone the repo

Clone into XAMPP's `htdocs` so it's served by Apache:

```bash
cd C:\xampp\htdocs        # Windows
# or /opt/lampp/htdocs   # Linux/macOS

git clone https://github.com/rowhanmuci/-Auction-System-lab-.git auction
```

The project must live at `…/htdocs/auction/`.

---

### Step 2 — Start XAMPP

Open **XAMPP Control Panel** and start both:
- **Apache**
- **MySQL**

---

### Step 3 — Import the database

1. Open `http://localhost/phpmyadmin`
2. Create a new database named **`auction`** (Collation: `utf8mb4_unicode_ci`)
3. Select the `auction` database → click **Import** → choose `auction.sql` → Execute

---

### Step 4 — Create the notifications table

Still in phpMyAdmin with the `auction` database selected, click the **SQL** tab and run:

```sql
CREATE TABLE IF NOT EXISTS notification (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    type       ENUM('outbid','comment','won') NOT NULL,
    message    VARCHAR(255) NOT NULL,
    item_id    INT          NULL,
    is_read    TINYINT(1)   NOT NULL DEFAULT 0,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user   (user_id),
    INDEX idx_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

> The SQL is also saved at `backend/config/add_notifications.sql`.

---

### Step 5 — Create the uploads directory

Image uploads are stored locally. Create the folder manually:

```bash
mkdir C:\xampp\htdocs\auction\uploads
```

---

### Step 6 — Configure email (optional)

Winner notification emails use PHPMailer + Gmail SMTP.  
Create `backend/config/email.php` (this file is git-ignored):

```php
<?php
define('SMTP_HOST',      'smtp.gmail.com');
define('SMTP_PORT',      587);
define('SMTP_USERNAME',  'your@gmail.com');
define('SMTP_PASSWORD',  'your-app-password');  // Gmail App Password
define('SMTP_FROM',      'your@gmail.com');
define('SMTP_FROM_NAME', 'Auction System');
```

Email sending is non-fatal — the system works fine without this file.

---

### Step 7 — Build the frontend

```bash
cd C:\xampp\htdocs\auction\frontend
npm install
npm run build
```

Output is written to `../app/`.

---

### Step 8 — Open the app

```
http://localhost/auction/app/
```

---

### Development mode (hot reload)

If you want to edit the frontend with live reload instead of rebuilding every time:

```bash
cd frontend
npm run dev
```

Vite starts at `http://localhost:5173` and proxies `/auction/backend` to Apache automatically.

---

## Database Schema

```
user           — UserID, ID_number, name, phone, email, password (bcrypt)
category       — CategoryID, category_name
item           — ItemID, title, description, starting_price, start/end_time,
                 SellerID, CategoryID, WinnerID
item_image     — ImageID, image_url, ItemID
bid            — BidID, UserID, ItemID, bid_amount, bid_time
comment        — CommentID, content, post_time, WriterID, BoardOwnerID
notification   — id, user_id, type (outbid/comment/won), message,
                 item_id, is_read, created_at
```

---

## API Reference

All endpoints return `{ success: bool, data?: any, error?: string }`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register.php` | — | Register |
| POST | `/api/auth/login.php` | — | Login → sets PHP session |
| POST | `/api/auth/logout.php` | — | Destroy session |
| GET | `/api/categories/list.php` | — | List all categories |
| GET | `/api/items/list.php` | — | Active items (`?category_id=`) |
| GET | `/api/items/search.php` | — | Search items (`?q=`) |
| GET | `/api/items/detail.php` | — | Item detail (`?item_id=`) |
| POST | `/api/items/create.php` | Session | Create listing |
| GET | `/api/items/my.php` | Session | Seller's own listings |
| POST | `/api/items/upload_image.php` | Session | Upload item image |
| POST | `/api/bids/place.php` | Session | Place a bid |
| GET | `/api/bids/history.php` | — | Bid history for item (`?item_id=`) |
| GET | `/api/bids/my.php` | Session | Buyer's bid history |
| GET | `/api/comments/get.php` | — | Comments for user board (`?user_id=`) |
| POST | `/api/comments/post.php` | Session | Post a comment |
| GET | `/api/users/profile.php` | — | Public user info (`?user_id=`) |
| GET | `/api/notifications/list.php` | Session | Unread + recent notifications |
| POST | `/api/notifications/mark_read.php` | Session | Mark as read (`{ ids: [] }` or `{ all: true }`) |
