# brainventory-api

A NestJS REST API with PostgreSQL (via Docker) and Prisma ORM.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example env file and adjust values as needed:

```bash
cp .env.example .env
```

The default `.env` values are already configured to work with the Docker database below.

### 3. Start the database

Spin up the PostgreSQL container in the background:

```bash
docker compose up -d
```

To stop it:

```bash
docker compose down
```

To wipe all data and start fresh:

```bash
docker compose down -v
docker compose up -d
```

### 4. Configure Prisma

The `DATABASE_URL` in `.env` must point to the running database. The format is:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Using the default `.env` values:

```
DATABASE_URL="postgresql://brainventory:secret@localhost:5432/brainventory_dev"
```

Add this line to your `.env` file, then run migrations:

```bash
# Apply existing migrations to the database
npx prisma migrate dev

# (Optional) Open Prisma Studio — a visual database browser
npx prisma studio
```

Whenever you change `prisma/schema.prisma`, create a new migration:

```bash
npx prisma migrate dev --name describe-your-change
```

## Running the app

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run start:prod
```

The API will be available at `http://localhost:3000` (or the `PORT` set in `.env`).

## Running tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```
