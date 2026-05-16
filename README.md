# Auction System

A full-stack online auction platform built with React + PHP + MySQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, MUI 9, React Router 7, Vite 8 |
| Backend | PHP 8, MySQL (XAMPP) |
| Auth | PHP Session + localStorage |
| Email | PHPMailer (winner notification) |

## Project Structure

```
auction/
├── auction.sql          # Database schema & seed data
├── app/                 # Production build output (git-ignored)
├── frontend/            # React source
│   ├── src/
│   │   ├── components/  # Navbar, ItemCard
│   │   ├── pages/       # HomePage, ItemDetailPage, LoginPage, RegisterPage,
│   │   │                #   SellPage, ProfilePage, MyListingsPage, MyBidsPage
│   │   ├── api.js       # Fetch helpers + auth state
│   │   ├── theme.js     # MUI theme (red / Noto Sans TC)
│   │   └── main.jsx     # Entry point
│   └── vite.config.js   # base=/auction/app/, proxy→localhost
└── backend/
    ├── config/
    │   ├── db.php       # MySQL connection
    │   └── email.php    # SMTP credentials (git-ignored, copy from example)
    ├── api/
    │   ├── auth/        # login, logout, register
    │   ├── bids/        # place, current, history, my
    │   ├── categories/  # list
    │   ├── comments/    # get, post
    │   ├── items/       # list, detail, create, search, my
    │   └── users/       # profile
    └── email/           # notify_winner.php (PHPMailer)
```

## Database Schema

```
user         — UserID, ID_number, name, phone, email, password (bcrypt)
category     — CategoryID, category_name
item         — ItemID, title, description, starting_price, start/end_time, SellerID, CategoryID, WinnerID
item_image   — ImageID, image_url, ItemID
bid          — BidID, UserID, ItemID, bid_amount, bid_time
comment      — CommentID, content, post_time, WriterID, BoardOwnerID
```

## Features

- **Browse** active listings with category filter
- **Search** items by title or description
- **Item detail** — image gallery, current highest bid, time remaining, collapsible bid history
- **Bidding** — must exceed current price; seller cannot bid on own item; loading state on submit
- **My Listings** — seller's own auctions grouped by status (active / upcoming / ended)
- **My Bids** — buyer's bid history with winning/outbid/won status per item
- **Lazy winner resolution** — winner set on first `detail.php` call after auction ends; email sent via PHPMailer
- **User boards** — comment board per user, visible on item page and profile page (shows real name)
- **Sell** — create listings with title, description, price, category, time range, image URLs; client-side end-time validation
- **Form UX** — loading states and disabled inputs during all API submissions; password confirmation on register

## Local Setup

### Prerequisites
- XAMPP (Apache + MySQL + PHP 8)
- Node.js 18+

### 1. Database

Import the schema in phpMyAdmin or via CLI:

```bash
mysql -u root < auction.sql
```

### 2. Backend

Place the project under `C:\xampp\htdocs\auction\` (or your XAMPP `htdocs`).  
Start Apache and MySQL in XAMPP Control Panel.

Configure the winner notification email by creating `backend/config/email.php`:

```php
<?php
define('SMTP_HOST',     'smtp.gmail.com');
define('SMTP_PORT',     587);
define('SMTP_USERNAME', 'your@gmail.com');
define('SMTP_PASSWORD', 'your-app-password');
define('SMTP_FROM',     'your@gmail.com');
define('SMTP_FROM_NAME', 'Auction System');
```

> This file is git-ignored. Email sending is non-fatal — the system works without it.

### 3. Frontend (development)

```bash
cd frontend
npm install
npm run dev
```

Vite dev server runs on `http://localhost:5173` and proxies `/auction/backend` to `http://localhost`.

### 4. Frontend (production build)

```bash
cd frontend
npm run build
```

Output is written to `../app/`. Access via `http://localhost/auction/app/`.

## API Reference

All endpoints return `{ success: bool, data?: any, error?: string }`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register.php` | — | Register (id_number, name, phone, email, password) |
| POST | `/api/auth/login.php` | — | Login → sets PHP session |
| POST | `/api/auth/logout.php` | — | Destroy session |
| GET | `/api/categories/list.php` | — | List all categories |
| GET | `/api/items/list.php` | — | List active items (`?category_id=`) |
| GET | `/api/items/search.php` | — | Search active items (`?q=`) |
| GET | `/api/items/detail.php` | — | Item detail (`?item_id=`) |
| POST | `/api/items/create.php` | Session | Create listing |
| GET | `/api/items/my.php` | Session | Seller's own listings (all statuses) |
| POST | `/api/bids/place.php` | Session | Place a bid |
| GET | `/api/bids/history.php` | — | Full bid history for an item (`?item_id=`) |
| GET | `/api/bids/my.php` | Session | Buyer's bid history (highest bid per item) |
| GET | `/api/comments/get.php` | — | Get comments for a user board (`?user_id=`) |
| POST | `/api/comments/post.php` | Session | Post a comment |
| GET | `/api/users/profile.php` | — | Get public user info (`?user_id=`) |
