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
│  │  └─ server.js         # Express + Mongoose + WS
│  ├─ package.json
│  ├─ Dockerfile.dev       # Dev image for backend (nodemon)
│
├─ frontend/
│  ├─ app/
│  │  ├─ layout.jsx
│  │  ├─ page.jsx
│  │  └─ globals.css
│  ├─ package.json
│  ├─ Dockerfile.dev       # Dev image for frontend (next dev)
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
