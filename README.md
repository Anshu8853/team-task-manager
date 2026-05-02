# Team Task Manager

A full-stack team task manager built with Next.js, Prisma, SQLite, JWT auth, and role-based access control.

## Features

- Signup and login with secure password hashing and http-only session cookies
- Admin / Member roles
- Project creation, member assignment, and project deletion
- Task creation, assignment, status updates, priorities, and due dates
- Dashboard with project/task totals, overdue count, and recent activity
- REST API endpoints for auth, dashboard, projects, and tasks

## Tech Stack

- Next.js 16 App Router
- Prisma ORM
- SQLite database file
- Zod validation
- bcryptjs for password hashing
- jose for JWT signing and verification

## Demo Accounts

The database seed creates these accounts:

- Admin: `admin@teamtask.local` / `Password123!`
- Member: `member@teamtask.local` / `Password123!`

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   The default local database path is `file:./data/app.db`.

3. Create the database schema and seed demo data:

   ```bash
   npm run db:setup
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

## Railway Deployment

This repo is ready for Railway with the SQLite file database path used in `.env`.

1. Create a Railway project from this repo.
2. Set `DATABASE_URL=file:./data/app.db`.
3. Set `JWT_SECRET` to a strong random value.
4. Add a persistent volume and mount it at `/app/data` so the SQLite file survives redeploys.
5. Deploy using the default build and start commands from `package.json`.

The build step runs `prisma db push` before `next build`, so the schema is synced automatically on deploy.

## API Overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/projects`
- `POST /api/projects`
- `PATCH /api/projects/:projectId`
- `DELETE /api/projects/:projectId`
- `POST /api/projects/:projectId/members`
- `DELETE /api/projects/:projectId/members/:memberId`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`

## Notes

- New signups are created as `MEMBER` users.
- Project owners and admins can manage members and projects.
- Task assignees must belong to the project.
