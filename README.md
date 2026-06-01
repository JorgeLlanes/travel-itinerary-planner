# Travoya

A full-stack travel itinerary planner that lets users create trips, manage bookings, and organize their travel experiences — built to demonstrate production-grade full-stack engineering across a normalized relational data layer.

---

## Why I Built This

I spent three years building consumer-facing products at The Points Guy, one of the most recognized names in travel media. That experience gave me a deep understanding of the traveler's perspective — and a clear gap in my backend skills. I built Travoya to close that gap deliberately: designing a real database schema, building a typed REST API from scratch, and working toward an AI-powered travel assistant that helps users plan and discover trips through natural language.

---

## Tech Stack

**Frontend**

- React
- TypeScript
- Tailwind CSS
- Next.js

**Backend**

- TypeScript
- Fastify
- Zod (request validation)
- bcrypt (password hashing)

**Database & ORM**

- PostgreSQL 16
- Prisma ORM (with PrismaPg adapter)

**Infrastructure**

- Turborepo (monorepo)
- AWS
- CI/CD
- Docker (planned)

---

## Architecture

Travoya is structured as a Turborepo monorepo separating the API, web client, and shared packages into independent workspaces — mirroring how production engineering teams organize large-scale codebases.

```
travoya/
├── apps/
│   ├── api/                # Fastify REST API
│   │   └── src/
│   │       ├── index.ts    # Server entry point
│   │       ├── routes/     # Route files per resource
│   │       ├── lib/        # Shared utilities (prisma.ts, utils.ts)
│   │       └── generated/  # Prisma generated client
│   └── web/                # React frontend (in progress)
├── shared/                 # Shared types and utilities
└── turbo.json
```

---

## Data Model

Travoya uses a normalized relational schema with five models and five enums across a PostgreSQL database managed by Prisma ORM.

```
User
  └── has many Trips
        └── each Trip has many Bookings
              ├── Booking of type FLIGHT → FlightBooking
              └── Booking of type HOTEL  → HotelBooking
```

**Enums:** TwoFactorMethod, TripStatus, BookingStatus, BookingType, CabinClass

---

## API Routes

### Users

| Method | Endpoint         | Description              |
| ------ | ---------------- | ------------------------ |
| POST   | /users           | Create a new user        |
| GET    | /users/:id       | Get a user by ID         |
| GET    | /users/:id/trips | Get all trips for a user |

### Trips

| Method | Endpoint   | Description       |
| ------ | ---------- | ----------------- |
| POST   | /trips     | Create a new trip |
| GET    | /trips/:id | Get a trip by ID  |
| PATCH  | /trips/:id | Update a trip     |
| DELETE | /trips/:id | Delete a trip     |

---

## Getting Started

### Prerequisites

- Node.js v22 or higher
- npm v10 or higher
- PostgreSQL v16 or higher

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/travoya.git

# Navigate into the project
cd travoya

# Install dependencies
npm install

# Set up your environment variables
cp apps/api/.env.example apps/api/.env
# Add your DATABASE_URL to apps/api/.env

# Run database migrations
cd apps/api
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Running the Development Server

Open two terminal tabs inside `apps/api`:

**Tab 1 — TypeScript compiler watch mode:**

```bash
npx tsc --watch
```

**Tab 2 — Fastify server:**

```bash
npm run dev
```

The API will be running at `http://localhost:3000`

### Verifying the Setup

```bash
# Health check
curl http://localhost:3000/health
# Expected: { "status": "ok" }
```

### Prisma Studio

```bash
# Open visual database browser
npx prisma studio
```

---

## Environment Variables

Create a `.env` file in `apps/api/` with the following:

```env
DATABASE_URL="postgresql://your_username@localhost:5432/travoya"
```

---

## Roadmap

### Completed

- [x] Turborepo monorepo initialized with API and web workspaces
- [x] Fastify server with production build setup
- [x] PostgreSQL database configured with local Homebrew setup
- [x] Prisma schema designed — 5 models, 5 enums, full relational integrity
- [x] Database migrations run and Prisma Studio confirmed
- [x] lib/prisma.ts singleton with PrismaPg adapter
- [x] Modular route file structure with Fastify plugin pattern
- [x] POST /users — Zod validation, bcrypt password hashing, duplicate email check
- [x] GET /users/:id — safe field selection, 404 handling
- [x] POST /trips — user existence check, auto-defaulted UPCOMING status
- [x] GET /trips/:id — safe field selection, 404 handling
- [x] GET /users/:id/trips — findMany with empty array support
- [x] PATCH /trips/:id — partial Zod schema, cleanUndefined utility, strict TypeScript
- [x] DELETE /trips/:id — confirmation response with title and ID
- [x] cleanUndefined utility in lib/utils.ts for safe partial updates

### In Progress

- [ ] Booking routes — POST, GET
- [ ] FlightBooking routes
- [ ] HotelBooking routes

### Planned

- [ ] JWT authentication middleware — protected routes, userId from decoded token
- [ ] POST /auth/login and POST /auth/register
- [ ] External flight and hotel API integration (Amadeus)
- [ ] React frontend — trip dashboard, search, booking flows
- [ ] Python AI microservice — natural language trip planning using Anthropic API
- [ ] RAG over saved trips using pgvector with PostgreSQL
- [ ] AI travel assistant chat interface
- [ ] Docker containerization
- [ ] Deployment — API to Railway or AWS, frontend to Vercel
- [ ] Production database migration to Supabase or Railway

---

## Engineering Decisions

**Fastify over Express** — Fastify provides superior TypeScript support with native generics for typed request params, body, and responses. Its plugin architecture enforces the modular route structure used throughout this project. Performance benchmarks consistently show Fastify outperforming Express on JSON throughput.

**REST over GraphQL** — chosen deliberately to build backend fundamentals first. A REST API requires understanding HTTP methods, status codes, route design, and data modeling without the abstraction layer GraphQL introduces. GraphQL is a planned addition once the core REST layer is complete.

**Prisma over raw SQL** — Prisma's type-safe client eliminates an entire class of runtime errors by catching schema mismatches at compile time. The generated client mirrors the schema exactly, making refactors safe and predictable.

**Python microservice for AI** — the planned AI layer will be built as a separate Python service inside the Turborepo rather than adding Python to the existing TypeScript API. This provides a clean separation of concerns, mirrors how production AI systems are typically structured, and enables learning Python and AI integration simultaneously in a real production context.

**Zod for validation** — all incoming request data is validated through Zod schemas before touching the database. This catches type mismatches, missing fields, and invalid enum values at the API boundary — the same approach used in production at The Points Guy to eliminate runtime crashes from malformed configurations.

---

## License

MIT
