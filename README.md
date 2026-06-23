# Preorder Manager

A full-stack web application for managing product preorders — built with **Next.js 16**, **Prisma**, and **SQLite**.

## Features

- 📋 List all preorders with **server-side** filtering (All / Active / Inactive), sorting, and pagination
- 🔄 Toggle preorder status (Active / Inactive) directly from the list
- 🗑️ Delete preorders with inline confirmation
- ➕ Create new preorders via a dedicated form
- ✏️ Edit existing preorders
- 💾 Persistent storage using a local SQLite database via Prisma

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Database ORM | [Prisma 7](https://www.prisma.io/) |
| Database | SQLite (via `better-sqlite3`) |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Language | TypeScript |

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher → [Download](https://nodejs.org/)
- **npm** v9 or higher (comes with Node.js)
- **Git** → [Download](https://git-scm.com/)

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/iasraful/pre-ordered-list.git
cd pre-ordered-list
```

### 2. Install dependencies

```bash
npm install
```

### 3. Generate the Prisma client

The Prisma client must be generated from the schema before the app can talk to the database.

```bash
npx prisma generate
```

### 4. Create and migrate the database

This command creates the `dev.db` SQLite file in the project root and applies the schema.

```bash
npx prisma migrate dev --name init
```

> **Note:** If `dev.db` already exists (e.g., from a previous run), you can reset it cleanly with:
> ```bash
> npx prisma migrate reset
> ```

### 5. Seed the database with sample data

The seed script inserts 8 sample preorders so the app has data to display right away.

```bash
node prisma/seed.js
```

You should see output like:

```
Starting database seeding...
Cleared existing preorders.
Created preorder: Multi variant 3
Created preorder: Multi variant 2
...
Database seeding completed successfully.
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
preordered-list/
├── app/
│   ├── actions.ts              # Server Actions (getPreorders, toggle, delete, create, update)
│   ├── page.tsx                # Preorder list page (server component)
│   ├── components/
│   │   ├── PreordersClient.tsx # Interactive list UI (client component)
│   │   └── ClientFormattedDate.tsx
│   ├── create/
│   │   ├── page.tsx            # Create preorder page
│   │   └── CreatePreorderForm.tsx
│   └── update/[id]/
│       ├── page.tsx            # Update preorder page
│       └── UpdatePreorderForm.tsx
├── lib/
│   └── db.ts                   # Prisma client singleton
├── prisma/
│   ├── schema.prisma           # Database schema (Preorder model)
│   ├── migrations/             # SQL migration history
│   ├── seed.js                 # Sample data seed script
│   └── dev.db                  # SQLite database file (auto-generated, git-ignored)
├── prisma.config.ts            # Prisma configuration
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Database Schema

```prisma
model Preorder {
  id           String    @id @default(uuid())
  name         String
  products     Int
  preorderWhen String    // "regardless-of-stock" | "out-of-stock"
  startsAt     DateTime
  endsAt       DateTime? // optional end date
  status       Boolean   @default(true) // true = active, false = inactive
  createdAt    DateTime  @default(now())
}
```

---

## How Data Flow Works

```
Browser (React) → Next.js Server Action → Prisma → SQLite (dev.db)
```

1. The UI calls a **Server Action** (e.g., `togglePreorderStatus(id)`) imported directly from `app/actions.ts`.
2. Next.js routes the call to the server — **no manual API routes are needed**.
3. The server action uses the **Prisma client** (`lib/db.ts`) to read/write the SQLite file.
4. The updated data is returned to the component, which re-renders the UI.

All filtering, sorting, and pagination happen **server-side** using Prisma's `where`, `orderBy`, `skip`, and `take` options.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `http://localhost:3000` |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server (requires `npm run build` first) |
| `npm run lint` | Run ESLint |
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx prisma migrate dev` | Apply schema changes to the database |
| `npx prisma migrate reset` | Reset the database and re-run all migrations |
| `node prisma/seed.js` | Seed the database with sample preorders |
| `npx prisma studio` | Open Prisma Studio (visual DB browser) at `http://localhost:5555` |

---

## Inspecting the Database

To browse the database visually, run:

```bash
npx prisma studio
```

Or query it directly with the SQLite CLI:

```bash
npx -y sqlite3 dev.db "SELECT id, name, status FROM Preorder;"
```

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| `PrismaClientInitializationError` | Run `npx prisma generate` and restart the dev server. |
| `dev.db` not found | Run `npx prisma migrate dev --name init` to create it. |
| Empty list after setup | Run `node prisma/seed.js` to insert sample data. |
| Port 3000 already in use | Run `npm run dev -- -p 3001` to use a different port. |
