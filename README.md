# Turm Grand Hotel & Spa — PMS & Direct Booking Engine

An enterprise-grade, modern Hospitality Management System (PMS) and Direct Guest Booking Engine powered by **Next.js 15 (App Router)** frontend deployed on **Vercel**, integrated directly with an **Odoo 19** backend on **Odoo.sh** (or private VPS).

---

## 🌟 Key Architecture & Capabilities

```
┌────────────────────────────────────────────────────────┐
│               FRONTEND ON VERCEL                       │
│  Next.js 15 • Tailwind CSS • TypeScript • Server Actions│
│                                                        │
│  ┌───────────────────────┐  ┌───────────────────────┐  │
│  │  Staff PMS Dashboard  │  │  Guest Booking Engine │  │
│  │  • Interactive Rack   │  │  • Rate search        │  │
│  │  • Walk-in & Check-in │  │  • Room showcases     │  │
│  │  • Folios & Invoicing │  │  • Instant checkout   │  │
│  │  • Housekeeping Board │  │                       │  │
│  └───────────────────────┘  └───────────────────────┘  │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / JSON-RPC
                           ▼
┌────────────────────────────────────────────────────────┐
│               BACKEND ON ODOO.SH (OR VPS)              │
│  Odoo 19 • PostgreSQL                                  │
│                                                        │
│  • Master Room Inventory & Availability                │
│  • Accounting & Invoicing (`account.move`)             │
│  • Guest Profiles / CRM (`res.partner`)                │
│                                                        │
│         ▲                                              │
│         │ Two-Way Realtime Channel Sync                │
│         ▼                                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ OTA CHANNEL MANAGER (Channex / Beds24 / iCal)    │  │
│  │ • Booking.com  • MakeMyTrip  • Agoda  • Expedia  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Local Development)

### 1. Install & Run Locally
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Main Landing**: `http://localhost:3000/`
- **Staff Front Desk**: `http://localhost:3000/staff`
- **Room Rack Matrix**: `http://localhost:3000/staff/rack`
- **Reservations & OTAs**: `http://localhost:3000/staff/reservations`
- **Folios & Billing**: `http://localhost:3000/staff/folios`
- **Housekeeping**: `http://localhost:3000/staff/housekeeping`
- **Guest Booking**: `http://localhost:3000/book`

> [!NOTE]
> Out of the box, `ODOO_MOCK_MODE=true` is enabled in `.env.local`. You can immediately interact with the full PMS, test walk-ins, check-ins, add mini-bar charges, and view OTA channel feeds with rich simulated data.

---

## 🔗 Connecting to Live Odoo 19 (Odoo.sh)

When your Odoo.sh instance is ready:

1. Copy the custom Odoo module located in [`odoo_addons/turm_hotel_pms`](file:///Users/fahadrayamarakkar/Desktop/AI%20Projetcs/TurmHotel/odoo_addons/turm_hotel_pms) into your Odoo.sh GitHub repository.
2. Activate Developer Mode in Odoo and install **Turm Hotel Property Management System (PMS) & API**.
3. Update `.env.local` (or Vercel Environment Variables):
```env
ODOO_MOCK_MODE=false
ODOO_URL=https://your-hotel-instance.odoo.sh
ODOO_DB=your_db_name
ODOO_USERNAME=admin@turmhotel.com
ODOO_API_KEY=your_odoo_api_key_or_password
```

---

## 🌐 Deploying Frontend to Vercel

1. Push this project to your GitHub/GitLab repository.
2. Go to [vercel.com](https://vercel.com) $\rightarrow$ **Add New Project** $\rightarrow$ Import your repo.
3. Add your environment variables in the Vercel dashboard:
   - `ODOO_URL`
   - `ODOO_DB`
   - `ODOO_USERNAME`
   - `ODOO_API_KEY`
   - `ODOO_MOCK_MODE` (`false` for production)
4. Click **Deploy**. Vercel will build and deploy your project globally on the Edge Network in under 60 seconds!

---

## 🏨 OTA Channel Management (Booking.com & MakeMyTrip)

To prevent double bookings and automatically synchronize room rates and availability:
- Odoo serves as the **single source of truth** for room inventory.
- Connect Odoo to a channel manager adapter (such as **Channex.io** or **Beds24**).
- When a reservation arrives from **Booking.com** or **MakeMyTrip**, it fires a webhook to `/api/v1/hotel/ota/webhook` in Odoo.
- The reservation is automatically tagged with its channel source (`booking_com` or `makemytrip`) and appears instantly on your staff room rack.
- When a room is booked at the front desk or via your direct website, Odoo decrements availability, and the channel manager updates Booking.com and MakeMyTrip within seconds.

---

## 🖥️ Migrating from Odoo.sh to a Private VPS Later

If you decide to migrate your Odoo backend from Odoo.sh to your own VPS in the future:
1. Back up your PostgreSQL database and filestore from Odoo.sh.
2. Restore it on your Ubuntu VPS running Odoo 19 in Docker.
3. In your Vercel project settings, update only one variable:
   ```env
   ODOO_URL=https://odoo.yourcustomdomain.com
   ```
4. **No frontend code changes or redeployments are needed!**
