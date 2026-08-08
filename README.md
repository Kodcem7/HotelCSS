# 🏖️ HotelCSS — Parador Beach Digital Concierge

A full-stack **hotel digital concierge & guest-loyalty platform**. Guests scan a room QR code to order services, track requests in real time, and earn/redeem loyalty points — while staff and managers run the whole operation from role-based dashboards with live stats and reporting.

![.NET](https://img.shields.io/badge/.NET-8.0-512BD4)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Vite](https://img.shields.io/badge/Vite-7-646CFF)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-CC2927)
![SignalR](https://img.shields.io/badge/SignalR-realtime-FF6F00)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)

**Repository:** [github.com/Kodcem7/HotelCSS](https://github.com/Kodcem7/HotelCSS)

---

## ✨ Overview

HotelCSS turns the in-room experience into a self-service digital concierge and an ancillary-revenue engine:

- **Guests** open a QR code → digital concierge (no app install), order room service, report issues, request reception services, and spend loyalty points in a Point Shop.
- **Staff** receive and process department-specific requests with live alerts, wait-time indicators, and cancel-with-reason.
- **Managers** get real-time operational stats, a revenue trend, department performance, guest history, surveys, reputation tracking, and one-click CSV export.

The reward/gamification system is the core differentiator: **points are earned only by spending**, which nudges guests toward higher-margin ancillary purchases and drives repeat, direct bookings.

---

## 🚀 Features

### Guest (Room)
- 📱 **QR digital concierge** — instant access, no download or account creation
- 🛎️ **Service & room requests** — room service, housekeeping, technical issue reports (with photo), reception services
- ⭐ **Points & Point Shop** — earn points on orders, redeem for rewards/vouchers
- 🔔 **Real-time tracking** — live status (Pending → In Process → Completed), completion & cancellation toasts
- 🌍 **Multi-language** — Turkish, English, German, Russian
- 💬 **Chat assistant** — order history and quick help

### Staff & Operations
- 🎯 **Department routing** — each request reaches the right team; staff act only on their own department
- 🔊 **Instant alerts** — sound on new order + desktop notification when the tab is in the background
- ⏱️ **Wait-time badges** — "waiting X min" on each card (turns red when overdue)
- 🚫 **Cancel with reason** — the reason is shown to the guest automatically
- ✅ **Guarded status flow** — Start / Complete / Cancel with role & department checks

### Manager
- 📊 **Live dashboard** — pending / in-process / completed counts update in real time
- 📈 **Revenue trend & department performance**
- 📥 **CSV export** — full guest & revenue history to Excel
- 🗂️ **Guest logs, surveys, and TripAdvisor reputation** tracking

### Loyalty & Gamification
- 🎁 Points earned by spending → redeemed for low-cost, high-perceived-value perks
- 📣 **Bonus campaigns** — e.g. "2× points this weekend" to fill quiet days
- 🔁 Repeat, direct bookings driven by accumulated points

### Platform
- ⚡ **Real-time** via SignalR
- 🔐 **JWT auth** with role-based access
- 🐳 **Docker Compose** one-command deployment
- 🧩 Unit of Work + Repository pattern (EF Core)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core 8 Web API, SignalR, Entity Framework Core |
| Database | SQL Server 2022 |
| Frontend | React 18, Vite, Tailwind CSS, `@microsoft/signalr` |
| Auth | JWT Bearer (role-based) |
| Integrations | Google Gemini (chat assistant), TripAdvisor (reputation), SMTP e-mail (MimeKit) |
| Delivery | Docker Compose, nginx (serves the built SPA + reverse-proxies the API) |

---

## 🧱 Project Structure

```
HotelCSS/
├── HotelCSS/                 # ASP.NET Core Web API (Controllers, Hubs, Program.cs, appsettings)
├── CSSHotel.Models/          # Domain models & view models
├── CSSHotel.DataAccess/      # EF Core DbContext, Repositories (UoW), Migrations, DbInitializer
├── CSSHotel.Utility/         # Constants (SD), Email / Token / AI services
├── hotelcss-frontend/        # React + Vite SPA (Dockerfile + nginx.conf)
├── docker-compose.yml        # db + api + web orchestration
├── Dockerfile                # API image
└── HotelCSS.sln
```

---

## 🐳 Getting Started (Docker — recommended)

**Prerequisites:** Docker Desktop.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Kodcem7/HotelCSS.git
   cd HotelCSS
   ```

2. **Configure the LAN address for room QR codes.** Create a `.env` file in the repo root (git-ignored) with **this machine's LAN IP**:

   ```env
   QR_BASE_URL=http://192.168.1.23:5173
   ```

   > Find your IP with `ipconfig` (Windows) / `ifconfig` (macOS/Linux). Guests' phones must reach the app at this address, so it has to be the host's real LAN IP — not `localhost`. Each machine keeps its own `.env`, so pulling teammates' changes never overwrites your IP.

3. **Build & run everything:**

   ```bash
   docker compose up --build -d
   ```

4. **Open the app:**

   | Service | URL |
   |---------|-----|
   | Web (SPA) | http://localhost:5173 |
   | API (Swagger) | http://localhost:5237/swagger |
   | SQL Server | localhost:1433 |

   The API applies EF migrations and seeds initial data automatically on startup.

> ⚠️ **After any code change**, rebuild the affected image — the frontend is compiled *into* the image at build time:
> ```bash
> docker compose up --build -d          # everything
> docker compose up --build -d web      # frontend only
> docker compose up --build -d api      # backend only
> ```
> Data lives in the `mssql-data` volume and survives `docker compose down`, but **not** `docker compose down -v`.

---

## 💻 Local Development (without Docker)

**Backend**
```bash
# Set ConnectionStrings:DefaultConnection in HotelCSS/appsettings.json
# (default: Server=localhost\SQLEXPRESS;Database=HotelCSSdb;Trusted_Connection=True;TrustServerCertificate=True)
dotnet run --project HotelCSS      # API on http://localhost:5237
```

**Frontend**
```bash
cd hotelcss-frontend
npm install
npm run dev                        # Vite dev server
```

Set `VITE_API_BASE_URL` (e.g. `http://localhost:5237/api`) for the frontend if not using the nginx reverse proxy.

---

## ⚙️ Configuration

| Setting | Where | Purpose |
|---------|-------|---------|
| `QR_BASE_URL` | `.env` (root, git-ignored) | LAN address baked into room QR codes |
| `ConnectionStrings:DefaultConnection` | `HotelCSS/appsettings.json` / compose env | Database connection |
| `JwtSettings:SecretKey` | `appsettings.json` | JWT signing key |
| `EmailConfiguration` | `appsettings.json` | SMTP for password reset / guest e-mails |
| `Gemini:ApiKey`, `TripAdvisor:*` | `appsettings.json` | Chat assistant & reputation |

> 🔒 **Security:** Do not commit real secrets. Keep API keys, SMTP passwords, and connection strings out of version control (use `.env` / user-secrets / environment variables in production).

---

## 👤 Default Accounts (seeded)

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin123!` |
| Room (guest) | `Room<number>` (e.g. `Room101`) | `HotelGuest123!` |

Staff accounts (Reception, Housekeeping, Kitchen, Technic, Restaurant, Manager) are created by an Admin/Manager from the Staff management screen; each staff member's role matches their department.

> Change the default admin password before any real deployment.

---

## 🔑 Roles & Access

| Role | Can do |
|------|--------|
| **Admin / Manager** | Everything: staff, departments, rooms, service items, events, vouchers, requests, reports |
| **Reception** | Rooms, requests, reception services, rewards |
| **Staff** (Housekeeping / Kitchen / Technic / Restaurant) | View & process requests **for their own department** |
| **Room** (guest) | Orders, requests, point shop, vouchers, campaigns, history |

---

## 🧯 Troubleshooting

- **Guest phone shows a blank page** → usually a stale cached bundle after a redeploy. Do a hard refresh (`Ctrl/Cmd + Shift + R`); nginx is configured to serve HTML `no-store` so this self-heals on the next load.
- **"Safari can't connect to the server"** → the QR points at the wrong IP. Update `QR_BASE_URL` in `.env` to the host's current LAN IP and rebuild `web`.
- **Notifications don't fire** → the browser needs one user interaction before it allows sound; grant notification permission for desktop alerts.
- **Guests must be on the same Wi-Fi** as the host (or use a tunnel/HTTPS setup for off-LAN access).

---

## 📄 License

Proprietary — all rights reserved. (Update this section if you choose an open-source license.)
