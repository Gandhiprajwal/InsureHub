# InsureHub — Angular Insurance Management App

Standalone Angular 18 + Bootstrap 5 + vanilla CSS app.
Demo data only (in-memory, persisted in `localStorage`). Simulated payments.

## Run locally

```bash
cd angular-app
npm install
npm start
```

Open http://localhost:4200

## Demo accounts (auto-seeded)

- Agent — email: `agent@demo.com` / password: `demo123` (Agent ID: `AGT001`)
- Agent — email: `agent2@demo.com` / password: `demo123` (Agent ID: `AGT002`)
- Customer — email: `john@demo.com` / password: `demo123`

Or sign up. As a **customer** you must enter a valid Agent ID (e.g. `AGT001`).

## Features

- Login / Signup with role selector (Agent or Customer)
- Customer signup requires an existing Agent ID
- 4 insurance types: Life, Health, Home, Vehicle
- Policies auto-renew window: 1 year term, 30-day due window
- Status: Active / Lapsed (computed from due date)
- Agent dashboard: total customers, active/lapsed policies, total profit
- Customer dashboard: own policies, renew with simulated payment
- Drill-down: agent → customer → policies
