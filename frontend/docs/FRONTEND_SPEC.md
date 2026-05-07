# Trace — Frontend Specification

## Project Overview

Trace is a Meeting Intelligence SaaS platform.
Users upload meeting recordings. The AI automatically
transcribes speech, identifies speakers, extracts
action items, decisions, and blockers, then lets
users query all their meetings in plain English.

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Framer Motion (animations)
- shadcn/ui (component library)
- React Router v6 (routing)
- Axios (API calls)
- Recharts (data visualization)
- React Hot Toast (notifications)
- Lucide React (icons)

## Project Structure
frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn components
│   │   ├── layout/       # Navbar, Sidebar, Footer
│   │   ├── landing/      # Hero, Features, HowItWorks
│   │   ├── dashboard/    # Stats, UploadCard, MeetingCard
│   │   ├── meetings/     # MeetingList, MeetingDetail
│   │   ├── query/        # QueryInput, AnswerCard
│   │   └── shared/       # SpeakerAvatar, TypeBadge, etc
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── SignInPage.tsx
│   │   ├── SignUpPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── MeetingsPage.tsx
│   │   ├── MeetingDetailPage.tsx
│   │   └── AskPage.tsx
│   ├── lib/
│   │   ├── api.ts        # all API calls
│   │   ├── utils.ts      # helpers
│   │   └── hooks.ts      # custom hooks
│   ├── types/
│   │   └── index.ts      # all TypeScript interfaces
│   └── App.tsx

## Routes

| Path | Page | Auth required |
|------|------|---------------|
| / | Landing page | No |
| /signin | Sign in | No |
| /signup | Sign up | No |
| /dashboard | Dashboard | Yes |
| /meetings | All meetings | Yes |
| /meetings/:id | Meeting detail | Yes |
| /ask | Ask Trace | Yes |

## Auth

Use simple localStorage-based auth for now.
Store: { email, name, token: "local-session" }
No real backend auth — just store user info locally.
Protected routes redirect to /signin if not logged in.

## Important Rules

- Light mode ONLY — no dark mode
- No hardcoded meeting data anywhere
- All meeting data comes from API (localhost:8000)
- Every page has loading skeleton + error + empty states
- All animations via Framer Motion
- TypeScript strict mode
- Mobile responsive at all breakpoints