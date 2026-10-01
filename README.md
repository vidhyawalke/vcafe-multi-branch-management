# BrewHub — Multi-Cafe Management System

A beginner-friendly full-stack portfolio project for managing multiple cafe branches.

## Stack
- React + Vite
- Node.js + Express
- PostgreSQL
- JWT + bcrypt
- CSS (no heavy UI framework)

## Core features
- Admin and staff login
- Multiple cafe branches
- Branch-specific menu
- Order management
- Order status workflow
- Sales dashboard
- PostgreSQL relational database

## Project structure

```text
BrewHub-Multi-Cafe-Management/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   └── package.json
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── db/
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── database/
    ├── schema.sql
    └── seed.sql
```

## 1. Create the PostgreSQL database

Create a database called:

```sql
CREATE DATABASE brewhub;
```

Then run `database/schema.sql`, followed by `database/seed.sql`.

## 2. Start the backend

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and update your PostgreSQL password.

```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

## 3. Start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs on the Vite URL shown in the terminal.

## Demo login

```text
Admin:
admin@brewhub.com
password: password123

Staff:
staff@brewhub.com
password: password123
```

## Portfolio description

> BrewHub is a full-stack multi-branch cafe management system built with React, Node.js, Express and PostgreSQL. It provides role-based access, branch-specific menu management, order workflows and business dashboards for cafe operators.

## Beginner note

The code is intentionally kept readable. Each controller and route handles one small responsibility so you can explain the project during interviews.
