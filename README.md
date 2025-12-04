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
├── README.md
├── backend
│   ├── Dockerfile.dev
│   ├── package-lock.json
│   ├── package.json
│   └── src
│       ├── config
│       │   ├── db.js
│       │   ├── env.js
│       │   └── logger.js
│       ├── controllers
│       │   ├── authController.js
│       │   ├── driverController.js
│       │   ├── hubController.js
│       │   ├── parcelController.js
│       │   └── scanController.js
│       ├── middleware
│       │   ├── auth.js
│       │   └── errorHandler.js
│       ├── models
│       │   ├── courier.js
│       │   ├── hub.js
│       │   ├── parcel.js
│       │   ├── parcel_route_assignment.js
│       │   ├── parcel_scan_event.js
│       │   ├── proof_of_delivery.js
│       │   ├── recipient.js
│       │   ├── route.js
│       │   ├── sender.js
│       │   └── zone.js
│       ├── routes
│       │   ├── authRoutes.js
│       │   ├── driverRoutes.js
│       │   ├── hubRoutes.js
│       │   ├── parcelRoutes.js
│       │   ├── podRoutes.js
│       │   ├── routeRoutes.js
│       │   └── scanRoutes.js
│       ├── server.js
│       ├── services
│       │   ├── notificationService.js
│       │   ├── parcelService.js
│       │   └── routeService.js
│       └── utils
│           ├── jwt.js
│           ├── time.js
│           └── validators.js
├── docker-compose.yml
└── frontend
    ├── Dockerfile.dev
    ├── app
    │   ├── (admin)
    │   │   ├── dashboard
    │   │   ├── drivers
    │   │   ├── hubs
    │   │   ├── layout.jsx
    │   │   ├── parcels
    │   │   │   ├── [id]
    │   │   │   │   └── page.jsx
    │   │   │   ├── create
    │   │   │   │   └── page.jsx
    │   │   │   └── page.jsx
    │   │   ├── pod
    │   │   ├── routes
    │   │   └── scans
    │   ├── (auth)
    │   │   └── login
    │   │       └── page.jsx
    │   ├── (driver)
    │   │   ├── layout.jsx
    │   │   ├── page.jsx
    │   │   ├── parcel
    │   │   │   └── [id]
    │   │   │       └── page.jsx
    │   │   ├── parcels
    │   │   │   └── page.jsx
    │   │   └── route
    │   │       └── page.jsx
    │   ├── (public)
    │   │   ├── page.jsx
    │   │   └── track
    │   ├── components
    │   │   ├── AdminSidebar.jsx
    │   │   ├── DriverHeader.jsx
    │   │   ├── Protected.jsx
    │   │   ├── PublicNav.jsx
    │   │   └── ui
    │   ├── globals.css
    │   ├── layout.jsx
    │   └── page.jsx
    ├── lib
    │   ├── api.js
    │   ├── auth.js
    │   └── helpers.js
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── utils

35 directories, 65 files
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
