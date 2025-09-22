# Body by Rings Training App

## Project Overview

Professional calisthenics training app with tendon-safe progressions based on Daniel Vadel principles. Built with Next.js 14 + Supabase + TypeScript.

## Current Status - PROJECT SETUP

**✅ COMPLETED:**

- Next.js 14 project initialized with TypeScript + Tailwind + ShadCN
- Project structure created
- Dependencies installed (Supabase, React Hook Form, Zustand, etc.)
- ShadCN components added (button, input, card, table, etc.)
- `.claude/` folder with all documentation

**🎯 CURRENT TASK:**
Architecture Setup - Supabase Project & Database

**📍 IMMEDIATE NEXT STEPS:**

1. Create Supabase project
2. Setup database schema (all tables + RLS policies)
3. Configure environment variables
4. Test database connection

**📅 DETAILED ROADMAP:** See `.claude/GAME-PLAN.md` for complete 12-day timeline

## Technical Stack

```typescript
// Frontend
Next.js 14 (App Router) + TypeScript
TailwindCSS + ShadCN/UI
Zustand (state) + TanStack Query
React Hook Form + Zod

// Backend
Supabase (PostgreSQL + Auth + Storage)
Plausible Analytics (RGPD-compliant)
Vercel (deployment)
```

## Development Philosophy

- **Step-by-step guided development** - Explain each concept as we build
- **Quality over speed** - But we're moving fast (12-day timeline)
- **Mobile-first** - Gym usage is primary use case
- **Offline-first** - Must work without internet
- **Test as we build** - No technical debt

## Key Documents

- `.claude/PRD.md` - Product requirements & user stories
- `.claude/Architecture.md` - Technical architecture & database schema
- `.claude/GAME-PLAN.md` - 12-day development timeline
- `.claude/External-Ideas.md` - Future features backlog

## Database Schema (from Architecture.md)

```sql
-- Core tables to implement TODAY
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Body by Rings',
  phase INTEGER NOT NULL DEFAULT 1,
  cycle_number INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 5),
  session_type TEXT NOT NULL CHECK (session_type IN ('push_1', 'pull_1', 'push_2', 'pull_2')),
  is_deload BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  set_number INTEGER NOT NULL,
  target_reps_min INTEGER,
  target_reps_max INTEGER,
  actual_reps INTEGER,
  rpe INTEGER CHECK (rpe BETWEEN 6 AND 10),
  tempo TEXT DEFAULT '30X1',
  notes TEXT,
  completed_at TIMESTAMPTZ
);
```

## Immediate Instructions for Claude

**CONTEXT:** User was working with Claude via web interface on DAY 1 setup. Next.js project is initialized and working. Now continuing via Claude Code for hands-on development.

**CURRENT OBJECTIVE:** Complete DAY 1 Morning Session (4h) - Architecture Setup

- Create Supabase project
- Setup complete database schema
- Configure environment variables
- Test connection

**DEVELOPMENT STYLE:**

- Explain WHY we do each step (educational)
- Show actual commands to run
- Test each step before moving to next
- Handle errors together if they occur
- Keep the 12-day timeline in mind but prioritize learning

**KEY PRINCIPLE:** User wants to learn deeply while building fast. Explain concepts in context, show best practices, and maintain momentum toward our DAY 12 launch goal.

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/          # Auth pages
│   ├── (dashboard)/     # Main app pages
│   └── api/             # API routes
├── components/          # React components
│   ├── ui/              # ShadCN components
│   ├── workout/         # Workout-specific components
│   └── forms/           # Form components
├── lib/                 # Utilities & config
│   ├── supabase/        # Supabase client & types
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # Zustand stores
│   └── utils/           # Helper functions
└── types/               # TypeScript definitions
```

## Environment Variables Needed

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
```

## Success Criteria for Today

- ✅ Supabase project created & configured
- ✅ All database tables + RLS policies working
- ✅ Next.js can connect to Supabase
- ✅ Authentication setup complete
- ✅ Ready to build first components tomorrow

**Current Focus:** Get the backend infrastructure rock-solid so we can focus on building amazing UI/UX for the rest of the week.

Let's keep building! 🚀
