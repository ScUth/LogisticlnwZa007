# LogisticlnwZa007
## Topic: Micro logistic
## List business activities/processes:
1. Create Parcel / Intake
    - Register new parcel.
    - Generate tracking code.
    - Set sender, recipient, SLA.
2. Hub Sort & Assign
    - Scan parcel into hub.
    - Group parcels by area.
    - Assign parcels to a driver route.
3. Dispatch Driver / Out for Delivery
    - Start route.
    - Mark parcels as “out for delivery.”
4. Attempt Delivery
    - Driver marks success (delivered) or fail (recipient not available).
5. Re-route / Return
    - Failed parcels get reassigned or returned.
6. Review Performance
    - Check delays, on-time % and bottleneck hubs.

---

### Full-stack demo with:
- **MongoDB** (database)
- **Express + Mongoose** (API + WebSocket server)
- **Next.js + React + Tailwind** (frontend dashboard)

---


## Project Structure

```text
.
├─ backend/
│  ├─ src/
│  │  ├─ server.js                 # App entry
│  │  ├─ config/
│  │  │  ├─ db.js                  # DB connection (Mongo/Postgres/etc)
│  │  │  ├─ env.js                 # env loader
│  │  │  └─ logger.js
│  │  ├─ middleware/
│  │  │  ├─ auth.js                # JWT + role guard
│  │  │  ├─ errorHandler.js
│  │  ├─ models/                   # DB schemas (sender, parcel, etc)
│  │  │  ├─ Hub.js
│  │  │  ├─ Sender.js
│  │  │  ├─ Recipient.js
│  │  │  ├─ Parcel.js
│  │  │  ├─ Driver.js
│  │  │  ├─ Route.js
│  │  │  ├─ ParcelScanEvent.js
│  │  │  └─ ProofOfDelivery.js
│  │  ├─ controllers/              # Business logic 
│  │  │  ├─ authController.js
│  │  │  ├─ parcelController.js
│  │  │  ├─ routeController.js
│  │  │  ├─ driverController.js
│  │  │  ├─ hubController.js
│  │  │  └─ scanController.js
│  │  ├─ routes/                   # REST endpoints
│  │  │  ├─ authRoutes.js
│  │  │  ├─ parcelRoutes.js
│  │  │  ├─ routeRoutes.js
│  │  │  ├─ driverRoutes.js
│  │  │  ├─ hubRoutes.js
│  │  │  ├─ scanRoutes.js
│  │  │  └─ podRoutes.js
│  │  ├─ services/                 # Business modules (optional)
│  │  │  ├─ parcelService.js
│  │  │  ├─ routeService.js
│  │  │  └─ notificationService.js
│  │  └─ utils/
│  │     ├─ jwt.js
│  │     ├─ validators.js
│  │     └─ time.js
│  ├─ package.json
│  ├─ Dockerfile.dev
│
├─ frontend/
│  ├─ app/
│  │  ├─ layout.jsx
│  │  ├─ globals.css
│  │  │
│  │  ├─ (public)/                # ❗ Unprotected routes
│  │  │  ├─ page.jsx              # Home
│  │  │  ├─ track/
│  │  │  │  └─ page.jsx           # Track shipment
│  │  │  ├─ create-shipment/
│  │  │  │  └─ page.jsx
│  │  │  └─ contact/
│  │  │     └─ page.jsx
│  │  │
│  │  ├─ (auth)/                  # Login page
│  │  │  └─ login/
│  │  │     └─ page.jsx
│  │  │
│  │  ├─ (admin)/                 # 🟩 PROTECTED Admin Dashboard
│  │  │  ├─ layout.jsx            # Contains AdminSidebar, auth guard
│  │  │  ├─ dashboard/
│  │  │  │  └─ page.jsx
│  │  │  ├─ parcels/
│  │  │  │  ├─ page.jsx           # list
│  │  │  │  ├─ create/
│  │  │  │  │  └─ page.jsx
│  │  │  │  └─ [id]/
│  │  │  │     └─ page.jsx
│  │  │  ├─ routes/
│  │  │  ├─ drivers/
│  │  │  ├─ hubs/
│  │  │  ├─ scans/
│  │  │  └─ pod/
│  │  │
│  │  ├─ (driver)/                # 🟦 PROTECTED DRIVER ROUTES
│  │  │  ├─ layout.jsx            # DriverLayout + auth guard
│  │  │  ├─ page.jsx              # Driver dashboard
│  │  │  ├─ route/
│  │  │  │  └─ page.jsx
│  │  │  ├─ parcels/
│  │  │  │  └─ page.jsx
│  │  │  └─ parcel/
│  │  │     └─ [id]/
│  │  │        └─ page.jsx        # Scan + POD
│  │  │
│  │  ├─ components/
│  │  │  ├─ Protected.jsx         # Role-based guard
│  │  │  ├─ PublicNav.jsx
│  │  │  ├─ AdminSidebar.jsx
│  │  │  ├─ DriverHeader.jsx
│  │  │  └─ ui/...
│  │
│  ├─ lib/
│  │  ├─ api.js                   # fetch wrappers
│  │  ├─ auth.js                  # getToken, verifyRole
│  │  └─ helpers.js
│  │
│  ├─ utils/
│  ├─ Dockerfile.dev
│  ├─ package.json
│
├─ docker-compose.yml
└─ README.md

```

## Quick Start (Development Mode)
1. Clone the repo:
```bash
git clone https://github.com/ScUth/LogisticlnwZa007.git
```
2. Start all services (MongoDB, backend, frontend):
```bash
docker compose up --build
```
3. Open the app in your browser:
- Frontend UI: http://localhost:4060
- Backend (API Health): http://localhost:4826/api/health

To stop everything:
```bash
Ctrl + c
docker compose down
```
To stop and also wipe Mongo Data:
```bash
docker compose down --volumes
```

---
## Member:
- 6710545521 Chaiyapat Kumtho
- 6710545741 Pasin Tongtip
- 6710545989 Amornrit Sirikham
