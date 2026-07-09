# Setup Guide

This guide covers the local setup for the whole project.

## Prerequisites

- Node.js 18 or higher
- PostgreSQL

## Install

From the repository root:

```bash
npm install
```

## Environment Variables

Create the backend environment file at `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/soseki?schema=public"
JWT_SECRET="your_super_secret_jwt_key"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

Create the frontend environment file at `frontend/.env`:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

## Database Setup

Push the Prisma schema and seed the database:

```bash
npm run setup:db
```

## Run Locally

Start both apps from the root:

```bash
npm run dev
```

This runs:

- Backend on `http://localhost:4000`
- Frontend on `http://localhost:3000`

## Useful Commands

Backend only:

```bash
npm run dev:backend
```

Frontend only:

```bash
npm run dev:frontend
```

Build both apps:

```bash
npm run build
```
