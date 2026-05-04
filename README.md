# HealthFitnessPro

A full-stack health and fitness web application. This application was originally built for software engineering course at TXST for course CS3398 software engineering as a team project, I'm now taking this as a solo project with a focus on clean software design, scalability, and production readiness.

## About

HealthFitnessPro helps users track workouts, browse an exercise, log nutrition, and monitor progress over time. The goal of this solo continuation is to move the codebase beyond a class project — reducing technical debt, replacing brittle third-party dependencies with owned infrastructure, and building toward an architecture that can support many concurrent users.

## Features

- **Exercise Library** — browse exercises by muscle group with animated demos
- **Workout Templates** — pre-built and custom workout plans
- **Active Workout Tracking** — log sets, reps, and weight in real time
- **Workout History** — review past sessions and track progress over time
- **Nutrition Logging** — log meals and track macros
- **User Accounts** — secure sign-up, login, and profile management

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | FastAPI (Python) |
| Database | PostgreSQL (Supabase) |
| Auth | JWT |
| Storage | Supabase Storage |
| Deployment | Docker |

## Design Goals

- **Own the data** — exercise data and assets are seeded into Supabase, eliminating reliance on third-party APIs that can expire or change
- **Consistent API contracts** — normalized data shapes across backend and frontend, no multi-branch normalization hacks
- **Scalable by default** — stateless backend, cloud-hosted database, CDN-served assets
- **Testable** — clear separation between routes, services, and data access

