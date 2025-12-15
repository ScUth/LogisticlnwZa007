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
`tree -I "node_modules"`
```sql
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
│       │   ├── adminController.js
│       │   ├── authController.js
│       │   ├── courierController.js
│       │   ├── employeeController.js
│       │   ├── hubController.js
│       │   ├── locationController.js
│       │   ├── parcelController.js
│       │   ├── pickupRequestController.js
│       │   └── scanController.js
│       ├── middleware
│       │   ├── auth.js
│       │   └── errorHandler.js
│       ├── models
│       │   ├── location.js
│       │   ├── operations.js
│       │   └── people.js
│       ├── routes
│       │   ├── adminRoutes.js
│       │   ├── authRoutes.js
│       │   ├── courierRoutes.js
│       │   ├── employeeRoutes.js
│       │   ├── hubRoutes.js
│       │   ├── locationRoutes.js
│       │   ├── parcelRoutes.js
│       │   ├── pickupRequestItemRoutes.js
│       │   ├── pickupRequestRoutes.js
│       │   ├── podRoutes.js
│       │   ├── routeRoutes.js
│       │   └── scanRoutes.js
│       ├── seed
│       │   └── seed.js
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
├── frontend
│   ├── Dockerfile.dev
│   ├── app
│   │   ├── (user)
│   │   │   ├── (auth)
│   │   │   │   ├── login
│   │   │   │   │   └── page.jsx
│   │   │   │   └── shipment
│   │   │   │       ├── layout.jsx
│   │   │   │       ├── page.jsx
│   │   │   │       └── step2
│   │   │   │           └── page.jsx
│   │   │   ├── aboutus
│   │   │   │   └── page.jsx
│   │   │   ├── contact
│   │   │   │   └── page.jsx
│   │   │   ├── layout.jsx
│   │   │   ├── page.jsx
│   │   │   └── track
│   │   │       └── page.jsx
│   │   ├── admin
│   │   │   ├── dashboard
│   │   │   │   └── page.jsx
│   │   │   ├── layout.jsx
│   │   │   ├── login
│   │   │   │   └── page.jsx
│   │   │   ├── management
│   │   │   │   ├── courier
│   │   │   │   │   ├── detail
│   │   │   │   │   │   └── page.jsx
│   │   │   │   │   ├── list
│   │   │   │   │   │   └── page.jsx
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── hub
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── page.jsx
│   │   │   │   ├── parcel
│   │   │   │   │   ├── details
│   │   │   │   │   │   └── page.jsx
│   │   │   │   │   ├── list
│   │   │   │   │   │   └── page.jsx
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── pod
│   │   │   │   │   ├── detail
│   │   │   │   │   │   └── page.jsx
│   │   │   │   │   ├── list
│   │   │   │   │   │   └── page.jsx
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── records
│   │   │   │   │   ├── page.jsx
│   │   │   │   │   ├── recipient
│   │   │   │   │   │   └── page.jsx
│   │   │   │   │   └── sender
│   │   │   │   │       └── page.jsx
│   │   │   │   ├── route
│   │   │   │   │   ├── details
│   │   │   │   │   │   └── page.jsx
│   │   │   │   │   ├── list
│   │   │   │   │   │   └── page.jsx
│   │   │   │   │   └── page.jsx
│   │   │   │   └── scan_event
│   │   │   │       └── page.jsx
│   │   │   └── page.jsx
│   │   ├── employee
│   │   │   ├── courier
│   │   │   │   ├── [id]
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── dashboard
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── page.jsx
│   │   │   │   ├── parcel
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── parcels
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── pickup
│   │   │   │   │   └── pickup.jsx
│   │   │   │   └── route
│   │   │   │       └── page.jsx
│   │   │   ├── hub
│   │   │   ├── layout.jsx
│   │   │   ├── login
│   │   │   │   └── page.jsx
│   │   │   └── page.jsx
│   │   ├── globals.css
│   │   ├── layout.jsx
│   │   └── test
│   │       └── page.jsx
│   ├── components
│   │   ├── AdminSidebar.jsx
│   │   ├── CourierForm.jsx
│   │   ├── CreateHub.jsx
│   │   ├── DisableNumberScroll.jsx
│   │   ├── DriverHeader.jsx
│   │   ├── EditHub.jsx
│   │   ├── PublicNav.jsx
│   │   ├── RecipientEdit.jsx
│   │   ├── RouteCreate.jsx
│   │   ├── ScanEventsCreate.jsx
│   │   ├── SenderEdit.jsx
│   │   ├── driversidebar.jsx
│   │   ├── img
│   │   │   ├── Caveman-SpongeBob.jpg
│   │   │   ├── contactus.jpg
│   │   │   ├── logo.png
│   │   │   ├── transport.jpg
│   │   │   ├── transport_1.jpg
│   │   │   └── whitelogo.png
│   │   ├── locations
│   │   │   ├── create-location-dialog.jsx
│   │   │   └── list-pickup-location-dialog.jsx
│   │   ├── navbar.jsx
│   │   ├── shipment
│   │   │   ├── cart.jsx
│   │   │   └── shipment-form.jsx
│   │   └── ui
│   │       ├── checkbox.jsx
│   │       ├── dialog.jsx
│   │       ├── select.jsx
│   │       └── tabs.jsx
│   ├── components.json
│   ├── context
│   │   ├── adminAuthContext.jsx
│   │   ├── authContext.jsx
│   │   ├── employeeAuthContext.jsx
│   │   └── shipmentContext.jsx
│   ├── jsconfig.json
│   ├── lib
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── helpers.js
│   │   ├── use-location.js
│   │   ├── use-pickup-request.js
│   │   └── utils.js
│   ├── middleware.js
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── utils
└── package-lock.json

61 directories, 132 files
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
- Frontend UI: http://kumtho.trueddns.com:33860
- Backend (API Health): http://kumtho.trueddns.com:33860/api/health

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
