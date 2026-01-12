# Vuilbak-app

A full-stack web application for managing and monitoring trash can statuses in Ghent, Belgium. Built with Next.js, React, Leaflet, Prisma, and PostgreSQL.

## Table of Contents

- [Setup](#setup)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [Application Flows](#application-flows)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)

---

## Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon is used in production)
- Environment variables configured

### Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ArnoVanSteenbergen03/Vuilbak-app.git
   cd Vuilbak-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
   NEXT_PUBLIC_ADMIN_PASSWORD=your-password
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Neon Database Setup (Production)

1. Create a Neon database via Vercel Marketplace
2. Vercel automatically adds `DATABASE_URL` to environment variables
3. Prisma migrations run automatically during deployment

---

## Project Structure

```
Vuilbak-app/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   └── trash-status/         # Trash can API endpoints
│   │       ├── route.ts          # GET /api/trash-status
│   │       ├── [id]/route.ts     # PUT /api/trash-status/[id]
│   │       └── test/route.ts     # GET /api/trash-status/test
│   ├── admin/                    # Admin panel page
│   │   └── page.tsx              # Admin dashboard
│   ├── components/               # React components
│   │   └── TrashCanMap.tsx       # Interactive Leaflet map
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (map)
├── lib/                          # Utility functions
│   ├── prisma.ts                 # Prisma client singleton
│   └── status.ts                 # Status utility functions
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Database seed script
│   └── migrations/               # Migration files
├── public/                       # Static assets
├── types/                        # TypeScript type definitions
│   ├── cache-life.d.ts
│   ├── routes.d.ts
│   └── validator.ts              # (auto-generated)
├── data/                         # Static data
│   └── trashcans.json            # Initial trash can data
├── .env                          # Environment variables
├── .gitignore
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js configuration
├── postcss.config.mjs            # PostCSS configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

---

## Dependencies

### Core Framework
- **next** (16.0.10) - React framework for production
- **react** (19.2.1) - UI library
- **react-dom** (19.2.1) - React rendering

### Database & ORM
- **@prisma/client** (5.22.0) - Prisma ORM client for type-safe database access
- **prisma** (5.22.0) - Prisma CLI for migrations and schema management

### Map & Visualization
- **leaflet** (1.9.4) - Interactive map library
- **react-leaflet** (5.0.0) - React bindings for Leaflet
- **@types/leaflet** (1.9.21) - TypeScript definitions for Leaflet

### Styling
- **tailwindcss** (4) - Utility-first CSS framework
- **@tailwindcss/postcss** (4) - Tailwind CSS PostCSS plugin
- **postcss** - CSS transformations

### Development Tools
- **typescript** (5) - TypeScript compiler
- **eslint** (9) - JavaScript linter
- **eslint-config-next** (16.0.10) - ESLint config for Next.js
- **@types/node** (20) - Node.js type definitions
- **@types/react** (19) - React type definitions
- **@types/react-dom** (19) - React DOM type definitions

### Optional/Legacy
- **@vercel/kv** (3.0.0) - Redis client for Vercel KV (currently unused, using Prisma instead)

---

## Application Flows

### 1. Map View (Public)

**User Flow:**
1. User visits `http://localhost:3000/`
2. Map component loads (TrashCanMap.tsx)
3. Fetches trash cans from `/api/trash-status` (GET)
4. Displays markers on Leaflet map
5. Shows status (empty/full) for each location
6. Polls API every 5 seconds for live updates

**Components:**
- `app/page.tsx` - Home page
- `app/components/TrashCanMap.tsx` - Map component with Leaflet

### 2. Admin Panel

**User Flow:**
1. User visits `http://localhost:3000/admin`
2. Selects a trash can from the list
3. Clicks "Niet Vol" (empty) or "Vol" (full) button
4. Sends PUT request to `/api/trash-status/[id]` with new status
5. Updates database and returns success/error message
6. Changes reflected on map immediately

**Components:**
- `app/admin/page.tsx` - Admin dashboard UI

### 3. Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  (Map View / Admin Panel)                               │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ HTTP Requests (JSON)
                  │
┌─────────────────▼───────────────────────────────────────┐
│                  API Routes                              │
│  /api/trash-status (GET)                                │
│  /api/trash-status/[id] (PUT)                           │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ Prisma ORM (Type-safe)
                  │
┌─────────────────▼───────────────────────────────────────┐
│              PostgreSQL Database                         │
│  trash_cans table                                       │
│  (id, location, lat, lng, status, lastUpdated)          │
└─────────────────────────────────────────────────────────┘
```

---

## API Documentation

### GET /api/trash-status

**Description:** Fetch all trash cans with current statuses

**Method:** `GET`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "location": "Gravensteenstraat",
    "lat": 51.0568,
    "lng": 3.7192,
    "status": "empty",
    "lastUpdated": "2026-01-12"
  },
  {
    "id": 2,
    "location": "Korenmarkt",
    "lat": 51.0543,
    "lng": 3.7205,
    "status": "full",
    "lastUpdated": "2025-12-17"
  }
]
```

**Error Response:** `500 Internal Server Error`
```json
{
  "error": "Failed to fetch trash can data"
}
```

---

### PUT /api/trash-status/[id]

**Description:** Update the status of a specific trash can

**Method:** `PUT`

**Parameters:**
- `id` (path) - Trash can ID (integer)

**Request Body:**
```json
{
  "status": "full"  // or "empty"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "location": "Gravensteenstraat",
  "lat": 51.0568,
  "lng": 3.7192,
  "status": "full",
  "lastUpdated": "2026-01-12"
}
```

**Error Responses:**

`404 Not Found` - Trash can doesn't exist
```json
{
  "error": "Trash can not found"
}
```

`500 Internal Server Error` - Database error
```json
{
  "error": "Error: [detailed error message]"
}
```

---

### GET /api/trash-status/test

**Description:** Health check endpoint for testing API connectivity

**Method:** `GET`

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-01-12T15:46:00Z"
}
```

---

## Development

### Scripts

```bash
# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Prisma commands
npx prisma migrate dev          # Create and apply migration
npx prisma db push             # Push schema changes to database
npx prisma studio              # Open Prisma Studio (visual editor)
npx prisma db seed             # Seed database with initial data
```

### Database Management

**View/Edit Data:**
```bash
npx prisma studio
```

**Create New Migration:**
```bash
npx prisma migrate dev --name add_new_field
```

**Reset Database (Development Only):**
```bash
npx prisma migrate reset
```

### TypeScript

The project uses strict TypeScript configuration. All `.ts` and `.tsx` files are type-checked.

**Key Exclusions:**
- `types/validator.ts` - Auto-generated by Next.js, excluded from strict checking

---

## Deployment

### Vercel Deployment

1. **Connect GitHub Repository**
   - Push code to GitHub
   - Connect repository in Vercel dashboard

2. **Environment Variables**
   - Set `DATABASE_URL` in Vercel project settings
   - Set `NEXT_PUBLIC_ADMIN_PASSWORD` for admin access

3. **Database Setup**
   - Create Neon PostgreSQL database via Vercel Marketplace
   - Vercel automatically configures connection string

4. **Deployment**
   - Vercel automatically triggers build on push
   - Prisma migrations run via postinstall script
   - App deployed to `https://vuilbak-app.vercel.app`

### Build Configuration

The postinstall script ensures Prisma client is generated during builds:
```json
"postinstall": "prisma generate"
```

---

## Monitoring

### Logs

**Local Development:**
```bash
npm run dev
# Logs appear in terminal
```

**Production (Vercel):**
- View logs in Vercel dashboard under "Deployments"
- Check Vercel Function logs for API errors

### Database Monitoring

**Neon Dashboard:**
- Monitor connections and query performance
- View database activity in real-time

---

## Security

- Environment variables stored in `.env` (not committed to Git)
- Admin panel password protected via `NEXT_PUBLIC_ADMIN_PASSWORD`
- Database connections use SSL/TLS
- Prisma prevents SQL injection with parameterized queries

---

## Future Enhancements

- [ ] Authentication system for admin panel
- [ ] Real-time WebSocket updates instead of polling
- [ ] Trash can fill level predictions (ML)
- [ ] Route optimization for collection
- [ ] Mobile app
- [ ] Email/SMS notifications

---

## License

This project is part of the KKR Agile course at Artevelde University of Applied Sciences.

## Author

Arno Van Steenbergen