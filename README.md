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


## Overview

This project is a micro‑logistics platform that simulates a real parcel delivery network with multiple roles and end‑to‑end parcel lifecycle tracking.

Key roles:
- **Sender (customer)** – requests pickup, creates shipments, and tracks parcels.
- **Courier (field staff)** – picks up parcels from senders, hands them to hubs, and performs final delivery.
- **Hub staff** – receives parcels at hubs, sorts by destination, and assigns linehaul or last‑mile routes.
- **Admin** – manages hubs, staff, couriers, routes, and monitors system performance.

Main flows:
- **Create shipment & pickup** – sender logs in, creates a pickup request and items, and a courier is assigned.
- **Parcel intake** – courier confirms items into parcels with tracking codes, then marks them as arrived at the origin hub.
- **Hub processing** – hub staff scan parcels in, send them on linehaul to destination hubs, and prepare parcels for local delivery.
- **Route dispatch & delivery** – couriers start delivery routes, mark parcels as out for delivery, delivered, or failed, with scan events recorded at each step.
- **Tracking & operations dashboards** – public tracking page shows parcel status and events; admin and employee dashboards show hubs, routes, and parcel statuses.

## Seed Data & Test Accounts

On first start (with Docker) the backend seeds example data so a teacher/professor can explore the system without manual setup.

### How seeding works
- When the backend connects to MongoDB and the environment variable `RESET_SEED_DATA` is set to `true`, it runs the seeding script from `backend/src/seed/seed.js`.
- In `docker-compose.yml` this is already configured for you:
    - Backend service has `RESET_SEED_DATA: "true"` by default.
- If you run the backend manually, you can enable seeding by setting in `backend/.env`:
    ```env
    RESET_SEED_DATA=true
    ```
    and then restarting the backend.

The seed will:
- Create an admin account, three courier employees, five hub staff employees.
- Create sample hubs in Chatuchak area.
- Create several vehicles (pickup, truck, motorcycle) ready to be assigned.

### Login accounts for testing

**Admin (web UI: Admin Login page)**
- Employee ID: `ADMIN001`
- Password: `admin1234`

Use this account to:
- Open the Admin dashboard.
- Manage hubs, staff, couriers, routes, and monitor parcel/scan events.

**Couriers (web UI: Employee Login page, role courier)**
- Courier 1 – Employee ID: `EMP0001`, Password: `111111`
- Courier 2 – Employee ID: `EMP0002`, Password: `111111`
- Courier 3 – Employee ID: `EMP0003`, Password: `111111`

Use these accounts to:
- Accept pickup requests, create parcels, and hand parcels to hubs.
- Start delivery routes and mark parcels delivered/failed.

**Hub staff (web UI: Employee Login page, role staff)**
- Staff accounts are created with IDs starting from `EMP0004` up to `EMP0008`, all with password `111111`.
- Each staff member is assigned to one of the seeded hubs.

Use these accounts to:
- View parcels at their hub.
- Process parcels (receive at hub, send to linehaul, prepare for delivery).

**Sender (customer)**
- There is no fixed seeded sender. Instead, testers can:
    - Go to the public site, open the Sender login/register page, and register a new account.
    - Create pickup requests and shipments, then track them using the public tracking page.

## Quick Start (Development Mode)

### 1. Clone the repository
```bash
git clone https://github.com/ScUth/LogisticlnwZa007.git
cd LogisticlnwZa007
```

### 2. Option A – Run with Docker (recommended)

Requirements:
- Docker and Docker Compose installed

From the project root:
```bash
docker compose up --build
```

This will start:
- MongoDB on `localhost:27017`
- Backend API on `http://localhost:4826`
- Frontend (Next.js app) on `http://localhost:4060`

Open in your browser:
- Sender / public site: http://localhost:4060
- Employee & admin dashboards: http://localhost:4060

To stop everything:
```bash
Ctrl + C
docker compose down
```

To stop and also wipe Mongo data:
```bash
docker compose down --volumes
```

### 3. Option B – Run manually (without Docker)

Requirements:
- Node.js 18+ and npm
- Local MongoDB running on `mongodb://localhost:27017`

#### Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder (or export these env vars) with at least:
```env
PORT=4826
MONGO_URI=mongodb://localhost:27017/dbproject
FRONTEND_URL=http://localhost:4060
NODE_ENV=development
RESET_SEED_DATA=false

JWT_SECRET=change_me_to_a_long_random_value
JWT_REFRESH_SECRET=change_me_to_a_different_long_random_value
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

Then start the backend API:
```bash
npm run dev
```
The backend will run on http://localhost:4826

#### Frontend
In a new terminal:
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` folder with:
```env
NEXT_PUBLIC_API_URL=http://localhost:4826
```

Then start the Next.js dev server:
```bash
npm run dev
```

The frontend will run on http://localhost:4060

---
## Member:
- 6710545521 Chaiyapat Kumtho
- 6710545741 Pasin Tongtip
- 6710545989 Amornrit Sirikham
