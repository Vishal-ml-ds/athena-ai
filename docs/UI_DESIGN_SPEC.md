# ATHENA — UI/UX Design Specification

**Version:** 1.0
**Date:** 2026-03-29
**Author:** ATHENA Team
**Stack:** Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
**Status:** Draft

---

## Table of Contents

1. [Design System](#1-design-system)
2. [Layout Architecture](#2-layout-architecture)
3. [Screen Specifications](#3-screen-specifications)
   - 3.1 Landing Page
   - 3.2 Authentication
   - 3.3 Dashboard
   - 3.4 Chat Interface
   - 3.5 Voice Mode
   - 3.6 Memory Panel
   - 3.7 Documents Page
   - 3.8 Browser View
   - 3.9 Life OS
   - 3.10 Weekly Report
   - 3.11 Analytics
   - 3.12 Settings
4. [Responsive Strategy](#4-responsive-strategy)
5. [Animation & Motion](#5-animation--motion)
6. [Accessibility Standards](#6-accessibility-standards)

---

## 1. Design System

### 1.1 Color Palette

```
DARK THEME (default)
--------------------------------------
Background Primary:    #0F172A  (slate-900)
Background Secondary:  #1E293B  (slate-800)
Background Tertiary:   #334155  (slate-700)
Surface:               #1E293B  (cards, panels)
Surface Hover:         #334155
Border:                #475569  (slate-600)
Border Subtle:         #334155  (slate-700)

Text Primary:          #F8FAFC  (slate-50)
Text Secondary:        #94A3B8  (slate-400)
Text Muted:            #64748B  (slate-500)

Brand Purple:          #7C3AED  (violet-600)
Brand Purple Light:    #8B5CF6  (violet-500)
Brand Purple Dark:     #6D28D9  (violet-700)
Brand Purple Glow:     #7C3AED/20  (for glows/shadows)

Accent Gold:           #F59E0B  (amber-500)
Accent Gold Light:     #FBBF24  (amber-400)
Accent Gold Dark:      #D97706  (amber-600)

Success:               #10B981  (emerald-500)
Warning:               #F59E0B  (amber-500)
Error:                 #EF4444  (red-500)
Info:                  #3B82F6  (blue-500)

LIGHT THEME
--------------------------------------
Background Primary:    #FFFFFF
Background Secondary:  #F8FAFC  (slate-50)
Background Tertiary:   #F1F5F9  (slate-100)
Surface:               #FFFFFF
Border:                #E2E8F0  (slate-200)
Text Primary:          #0F172A  (slate-900)
Text Secondary:        #475569  (slate-600)
Text Muted:            #94A3B8  (slate-400)
```

### 1.2 Typography

```
Font Family:
  Body:     Inter (variable, 400/500/600/700)
  Code:     JetBrains Mono (400/500/700)
  Display:  Inter (700/800, for hero headings)

Scale:
  xs:    12px / 16px line-height
  sm:    14px / 20px
  base:  16px / 24px
  lg:    18px / 28px
  xl:    20px / 28px
  2xl:   24px / 32px
  3xl:   30px / 36px
  4xl:   36px / 40px
  5xl:   48px / 48px
  6xl:   60px / 60px
```

### 1.3 Spacing & Sizing

```
Border Radius:
  Cards/Panels:   12px  (rounded-xl)
  Buttons:        8px   (rounded-lg)
  Inputs:         8px   (rounded-lg)
  Badges:         6px   (rounded-md)
  Avatars:        9999px (rounded-full)
  Modals:         16px  (rounded-2xl)

Shadows (dark mode):
  sm:   0 1px 2px rgba(0,0,0,0.3)
  md:   0 4px 6px rgba(0,0,0,0.4)
  lg:   0 10px 15px rgba(0,0,0,0.5)
  glow: 0 0 20px rgba(124,58,237,0.2)  (brand purple glow)

Sidebar:        280px (desktop), 0 (mobile, slide-over)
Max Content:    1280px
Chat Max Width: 768px (centered)
```

### 1.4 Component Theme Overrides (shadcn/ui)

```typescript
// tailwind.config.ts extensions
{
  colors: {
    athena: {
      purple: { DEFAULT: '#7C3AED', light: '#8B5CF6', dark: '#6D28D9' },
      gold: { DEFAULT: '#F59E0B', light: '#FBBF24', dark: '#D97706' },
    }
  }
}

// shadcn/ui CSS variables (globals.css)
:root {
  --primary: 263 70% 50%;       /* purple */
  --primary-foreground: 0 0% 100%;
  --accent: 38 92% 50%;         /* gold */
  --accent-foreground: 0 0% 100%;
  --radius: 0.75rem;            /* 12px */
}
```

### 1.5 Iconography

- **Icon Library:** Lucide React (default with shadcn/ui)
- **Size:** 16px (inline), 20px (buttons), 24px (navigation)
- **Agent Icons:** Custom SVG set for each agent type:
  - Supervisor: Brain icon (purple)
  - Researcher: Search/Globe (blue)
  - Scheduler: Calendar (green)
  - General: Sparkles (gold)
  - Document: FileText (orange)
  - Browser: Globe (cyan)

---

## 2. Layout Architecture

### 2.1 App Shell

The authenticated app uses a sidebar + main content layout. The sidebar is persistent on desktop and collapses to a hamburger overlay on mobile.

```
+------------------------------------------------------------------+
|  DESKTOP (>= 1024px)                                             |
|                                                                   |
|  +----------+---------------------------------------------------+ |
|  | SIDEBAR  |  MAIN CONTENT                                    | |
|  | 280px    |  flex-1                                          | |
|  |          |                                                   | |
|  | [Logo]   |  +---------------------------------------------+ | |
|  | [Nav]    |  | TOP BAR (breadcrumb + search + user avatar)  | | |
|  | [Recent] |  +---------------------------------------------+ | |
|  | [Quick]  |  |                                               | | |
|  | [User]   |  |  PAGE CONTENT                                | | |
|  |          |  |  max-w-7xl mx-auto px-6                      | | |
|  |          |  |                                               | | |
|  |          |  |                                               | | |
|  |          |  +---------------------------------------------+ | |
|  +----------+---------------------------------------------------+ |
+------------------------------------------------------------------+

  TABLET (768px - 1023px)
  - Sidebar collapses to 64px (icons only)
  - Expand on hover or hamburger tap

  MOBILE (< 768px)
  - Sidebar hidden, hamburger menu top-left
  - Sidebar slides in as overlay (Sheet component)
  - Bottom navigation bar for primary actions
```

### 2.2 Sidebar Navigation

```
+------------------------+
|  [Owl Icon] ATHENA     |  <- Logo + wordmark
|  ~~~~~~~~~~~~~~~~~~~~~~ |
|                         |
|  [Dashboard]            |  <- /dashboard
|  [Chat]                 |  <- /chat
|  [Documents]            |  <- /documents
|  [Browser]              |  <- /browser
|  [Life OS]              |  <- /life
|  [Analytics]            |  <- /analytics
|  [Settings]             |  <- /settings
|                         |
|  ~~~~~~~~~~~~~~~~~~~~~~ |
|  RECENT CHATS           |
|  > Research on AI age.. |
|  > Meeting notes from.. |
|  > Budget review Q1...  |
|  [+ New Chat]           |
|                         |
|  ~~~~~~~~~~~~~~~~~~~~~~ |
|  [Voice Mode]  (fab)    |  <- floating action, pulse animation
|                         |
|  ~~~~~~~~~~~~~~~~~~~~~~ |
|  [Avatar] Author P.     |
|  Free Plan              |
|  [Upgrade]              |
+------------------------+
```

### 2.3 Top Bar

```
+------------------------------------------------------------------+
|  [Hamburger]  Dashboard > Overview    [Cmd+K Search]  [Bell] [AV]|
+------------------------------------------------------------------+

Components:
- SidebarTrigger (mobile hamburger)
- Breadcrumb (dynamic, from route)
- CommandDialog (Cmd+K global search)
- NotificationDropdown (bell icon + unread badge)
- UserAvatar (dropdown: profile, theme toggle, logout)
```

---

## 3. Screen Specifications

---

### 3.1 Landing Page

**Route:** `/` (public, no auth required)
**Purpose:** Convert visitors to waitlist signups. Communicate ATHENA's value proposition.

#### Wireframe

```
+==================================================================+
|  NAVBAR                                                           |
|  [Owl] ATHENA          Features  Pricing  Docs     [Join Waitlist]|
+==================================================================+
|                                                                   |
|  HERO SECTION                                                     |
|  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                     |
|                                                                   |
|       The AI Goddess That                                         |
|       Runs Your Life.                                             |
|                                                                   |
|       One AI OS. Six agents. Zero context-switching.              |
|       Chat, voice, documents, browsing, life tracking             |
|       -- all in one place.                                        |
|                                                                   |
|       [email input............]  [Join Waitlist ->]               |
|                                                                   |
|       500+ on the waitlist                                        |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                                                              | |
|  |    HERO IMAGE / ANIMATED DASHBOARD PREVIEW                   | |
|  |    (dark glassmorphism card showing chat interface)           | |
|  |                                                              | |
|  +------------------------------------------------------------+  |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  FEATURE CARDS (2x2 grid)                                         |
|  ~~~~~~~~~~~~~~~~~~~~~~~~                                         |
|                                                                   |
|  +---------------------------+  +---------------------------+     |
|  | [Brain Icon]              |  | [Mic Icon]                |     |
|  | Multi-Agent Intelligence  |  | Voice-First Interface     |     |
|  |                           |  |                           |     |
|  | 6 specialized AI agents   |  | Talk to ATHENA naturally. |     |
|  | that collaborate on your  |  | Push-to-talk or hands-    |     |
|  | tasks automatically.      |  | free. Sub-300ms latency.  |     |
|  +---------------------------+  +---------------------------+     |
|                                                                   |
|  +---------------------------+  +---------------------------+     |
|  | [FileText Icon]           |  | [BarChart Icon]           |     |
|  | Document Intelligence     |  | Life Operating System     |     |
|  |                           |  |                           |     |
|  | Upload any document and   |  | Habits, goals, finance,   |     |
|  | query it conversationally |  | health -- tracked and     |     |
|  | with citations.           |  | analyzed with AI.         |     |
|  +---------------------------+  +---------------------------+     |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  HOW IT WORKS (3-step horizontal)                                 |
|  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                                 |
|                                                                   |
|  [1] Tell ATHENA   -->  [2] Agents Work  -->  [3] Get Results     |
|      what you need       Behind the scenes       Sourced, cited   |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  PRICING TABLE                                                    |
|  ~~~~~~~~~~~~                                                     |
|                                                                   |
|  +-------------------+  +-------------------+  +-----------------+|
|  | FREE              |  | PRO         *     |  | API             ||
|  | $0/mo             |  | $19/mo            |  | $49/mo          ||
|  |                   |  |                   |  |                 ||
|  | 50 msgs/day       |  | Unlimited msgs    |  | Everything in   ||
|  | 3 documents       |  | 100 documents     |  | Pro, plus:      ||
|  | Basic agents      |  | All agents        |  | REST API access ||
|  | 500MB storage     |  | 5GB storage       |  | Custom agents   ||
|  |                   |  | Voice mode        |  | 50GB storage    ||
|  |                   |  | Browser automation|  | Webhooks        ||
|  |                   |  | Life OS           |  | Priority support||
|  |                   |  |                   |  |                 ||
|  | [Join Waitlist]   |  | [Join Waitlist]   |  | [Join Waitlist] ||
|  +-------------------+  +-------------------+  +-----------------+|
|      * = "Most Popular" badge                                     |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  FINAL CTA                                                        |
|  ~~~~~~~~~                                                        |
|                                                                   |
|       Ready to let AI run your life?                              |
|       [email input............]  [Join Waitlist ->]               |
|                                                                   |
+-------------------------------------------------------------------+
|  FOOTER                                                           |
|  [Owl] ATHENA    Twitter  GitHub  Discord     (c) 2026 ATHENA     |
+===================================================================+
```

#### Components

| Section | shadcn/ui Components | Custom Components |
|---------|---------------------|-------------------|
| Navbar | `NavigationMenu`, `Button` | `Logo` |
| Hero | `Input`, `Button` | `HeroAnimation` (Framer Motion), `WaitlistCounter` |
| Features | `Card`, `CardHeader`, `CardTitle`, `CardDescription` | `FeatureCard` (hover glow effect) |
| How It Works | `Badge` | `StepCard` (numbered steps with connecting line) |
| Pricing | `Card`, `Badge`, `Button`, `Separator` | `PricingCard`, `PricingToggle` (monthly/yearly) |
| CTA | `Input`, `Button` | `WaitlistForm` |
| Footer | `Separator` | `FooterLinks` |

#### State Management

```typescript
// No global state needed -- landing page is stateless
// Waitlist form uses React Hook Form + server action
interface WaitlistFormState {
  email: string;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}
```

#### Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| Desktop (>= 1024px) | 2x2 feature grid, 3-column pricing, hero image beside text |
| Tablet (768-1023px) | 2x2 feature grid, 3-column pricing stacked slightly, hero image below text |
| Mobile (< 768px) | Single column everything, pricing cards stack vertically, hamburger nav |

#### Accessibility

- Navbar: `role="navigation"`, skip-to-content link
- Feature cards: semantic headings (h3)
- Pricing table: `role="table"` with proper headers
- Email input: `aria-label="Email address"`, `aria-describedby` for validation
- All CTAs: minimum 44x44px touch target
- Hero animation: `prefers-reduced-motion` media query disables motion

---

### 3.2 Authentication

**Routes:** `/login`, `/signup`, `/onboarding`
**Purpose:** Secure authentication with a guided onboarding flow for new users.

#### Login Wireframe

```
+==================================================================+
|                                                                   |
|  +-----------------------------+                                  |
|  |                             |     +------------------------+   |
|  |   [Owl Logo]               |     |                        |   |
|  |                             |     |  Welcome back.         |   |
|  |   BACKGROUND               |     |                        |   |
|  |   (gradient mesh:           |     |  [Google Sign In]      |   |
|  |    purple -> slate          |     |                        |   |
|  |    with floating            |     |  ---- or continue ---- |   |
|  |    particles)               |     |                        |   |
|  |                             |     |  Email                 |   |
|  |                             |     |  [..................]   |   |
|  |                             |     |                        |   |
|  |                             |     |  Password              |   |
|  |                             |     |  [..................]   |   |
|  |                             |     |                        |   |
|  |   "The AI Goddess That      |     |  [Forgot password?]    |   |
|  |    Runs Your Life"          |     |                        |   |
|  |                             |     |  [    Sign In     ]    |   |
|  |                             |     |                        |   |
|  |                             |     |  No account?           |   |
|  |                             |     |  [Sign up ->]          |   |
|  +-----------------------------+     +------------------------+   |
|                                                                   |
+==================================================================+
```

#### Signup Wireframe

```
Same layout as login, right panel changes:

+------------------------+
|                        |
|  Create your account.  |
|                        |
|  [Google Sign Up]      |
|                        |
|  ---- or --------      |
|                        |
|  Full Name             |
|  [..................]   |
|                        |
|  Email                 |
|  [..................]   |
|                        |
|  Password              |
|  [..................]   |
|  (min 8 chars, 1 upper,|
|   1 number)            |
|                        |
|  [   Create Account  ] |
|                        |
|  Already have an       |
|  account? [Sign in ->] |
+------------------------+
```

#### Onboarding Wireframe (3 Steps)

```
+==================================================================+
|                                                                   |
|  Step 1 of 3                    [Skip ->]                        |
|  [====-------]  progress bar                                     |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                                                              | |
|  |  What should we call you?                                    | |
|  |                                                              | |
|  |  Display Name                                                | |
|  |  [..................]                                         | |
|  |                                                              | |
|  |  Avatar (optional)                                           | |
|  |  [Upload] or [Generate with AI]                              | |
|  |                                                              | |
|  |                                [Continue ->]                 | |
|  +------------------------------------------------------------+  |
|                                                                   |
+==================================================================+

Step 2: Timezone & Preferences
+------------------------------------------------------------+
|                                                              |
|  Set your timezone.                                          |
|                                                              |
|  Timezone                                                    |
|  [Asia/Kolkata (IST)     v]  (auto-detected, editable)      |
|                                                              |
|  Preferred Language                                          |
|  [English               v]                                   |
|                                                              |
|  Theme                                                       |
|  [Dark]  [Light]  [System]  (toggle group)                   |
|                                                              |
|                    [<- Back]  [Continue ->]                   |
+------------------------------------------------------------+

Step 3: Interests
+------------------------------------------------------------+
|                                                              |
|  What do you want ATHENA to help with?                       |
|  (Select all that apply)                                     |
|                                                              |
|  [x] Research & Information     [ ] Health & Fitness         |
|  [x] Task & Calendar Mgmt      [ ] Finance Tracking         |
|  [ ] Document Analysis          [ ] Coding & Development     |
|  [ ] Habit Building             [ ] Browser Automation       |
|                                                              |
|  This helps us personalize your experience.                  |
|                                                              |
|                    [<- Back]  [Get Started ->]               |
+------------------------------------------------------------+
```

#### Components

| Section | shadcn/ui Components |
|---------|---------------------|
| Auth Layout | `Card`, `CardHeader`, `CardContent` |
| Form Fields | `Input`, `Label`, `Button` |
| OAuth | `Button` (outline variant with Google icon) |
| Separator | `Separator` with text overlay |
| Password | `Input` + custom `PasswordStrengthBar` |
| Onboarding Progress | `Progress` |
| Timezone Select | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` |
| Theme Toggle | `ToggleGroup`, `ToggleGroupItem` |
| Interest Chips | `Checkbox` + `Label` in grid |
| Error States | `Alert`, `AlertDescription` |

#### State Management

```typescript
// Zustand auth store
interface AuthStore {
  user: User | null;
  isLoading: boolean;
  onboardingStep: 1 | 2 | 3;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Onboarding form (React Hook Form + Zod)
interface OnboardingData {
  displayName: string;
  avatarUrl: string | null;
  timezone: string;
  language: string;
  theme: 'dark' | 'light' | 'system';
  interests: string[];
}
```

#### Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| Desktop | Split layout: gradient left, form right (50/50) |
| Tablet | Split layout: 40/60 ratio |
| Mobile | Full-screen form, gradient background behind form card |

#### Accessibility

- Form inputs: `aria-required`, `aria-invalid`, `aria-describedby` for errors
- Password field: toggle visibility button with `aria-label="Show password"`
- Progress bar: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- OAuth buttons: `aria-label="Sign in with Google"`
- Focus trapped within form, logical tab order
- Error messages: `role="alert"` with `aria-live="polite"`

---

### 3.3 Dashboard

**Route:** `/dashboard`
**Purpose:** Landing page after login. Quick overview of activity, stats, and shortcuts.

#### Wireframe

```
+----------+-----------------------------------------------------------+
| SIDEBAR  | TOP BAR                                                    |
|          | Dashboard                     [Cmd+K]  [Bell]  [Avatar]   |
|          +------------------------------------------------------------+
|          |                                                             |
|          |  Good morning, Author.                                     |
|          |  Here's your day at a glance.                              |
|          |                                                             |
|          |  QUICK STATS (4 cards, horizontal)                         |
|          |  +-------------+ +-------------+ +-------------+ +--------+|
|          |  | Messages    | | Documents   | | Habits      | | Memory ||
|          |  | Today       | | Uploaded    | | Streak      | | Items  ||
|          |  |             | |             | |             | |        ||
|          |  |    24       | |    12       | |    7 days   | |  156   ||
|          |  | +12% today  | | 2 pending   | | Best: 14    | | 3 new  ||
|          |  +-------------+ +-------------+ +-------------+ +--------+|
|          |                                                             |
|          |  +----------------------------------+ +-------------------+ |
|          |  | RECENT CONVERSATIONS             | | QUICK ACTIONS     | |
|          |  | ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ | | ~~~~~~~~~~~~~~~~~ | |
|          |  |                                  | |                   | |
|          |  | [Brain] Research on AI agents..  | | [+ New Chat]      | |
|          |  |   2 hours ago - Researcher       | | [Upload Document] | |
|          |  |                                  | | [Log Habit]       | |
|          |  | [Calendar] Meeting prep for..    | | [Add Expense]     | |
|          |  |   5 hours ago - Scheduler        | | [Voice Mode]      | |
|          |  |                                  | | [Browse Web]      | |
|          |  | [Sparkles] Code review of..      | |                   | |
|          |  |   Yesterday - General            | |                   | |
|          |  |                                  | |                   | |
|          |  | [Sparkles] Budget analysis..     | |                   | |
|          |  |   Yesterday - General            | |                   | |
|          |  |                                  | |                   | |
|          |  | [View All ->]                    | |                   | |
|          |  +----------------------------------+ +-------------------+ |
|          |                                                             |
|          |  +----------------------------------+ +-------------------+ |
|          |  | UPCOMING (next 24h)              | | WEEKLY SNAPSHOT   | |
|          |  | ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ | | ~~~~~~~~~~~~~~~~~ | |
|          |  |                                  | |                   | |
|          |  | 10:00 AM  Team standup           | | Msgs:  168 (+12%) | |
|          |  | 02:00 PM  Client call - Acme     | | Docs:   3 new     | |
|          |  | 05:00 PM  Gym (habit)            | | Goals: 67% avg    | |
|          |  |                                  | | Spend: 12,400     | |
|          |  | No more events today.            | |                   | |
|          |  +----------------------------------+ +-------------------+ |
|          |                                                             |
+----------+------------------------------------------------------------+
```

#### Components

| Section | shadcn/ui Components |
|---------|---------------------|
| Greeting | Custom `GreetingBanner` (time-aware) |
| Stat Cards | `Card`, `CardHeader`, `CardTitle`, `CardContent`, custom `StatCard` with trend indicator |
| Recent Conversations | `Card`, `ScrollArea`, custom `ConversationItem` (avatar + title + timestamp + agent badge) |
| Quick Actions | `Card`, `Button` (ghost variant with icons) |
| Upcoming | `Card`, `ScrollArea`, custom `EventItem` |
| Weekly Snapshot | `Card`, custom `MetricRow` |

#### State Management

```typescript
// Server component fetches dashboard data
interface DashboardData {
  stats: {
    messagesToday: number;
    messagesTrend: number; // percentage
    documentsUploaded: number;
    documentsPending: number;
    habitStreak: number;
    habitBest: number;
    memoryCount: number;
    memoryNew: number;
  };
  recentConversations: Conversation[];
  upcomingEvents: CalendarEvent[];
  weeklySnapshot: WeeklyMetrics;
}

// Fetched via server component with revalidation every 60s
// Quick actions trigger client-side navigation or modals
```

#### Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| Desktop | 4-column stat cards, 2-column grid below |
| Tablet | 2-column stat cards (2 rows), single column below |
| Mobile | Single column everything, stat cards as horizontal scroll |

#### Accessibility

- Stat cards: `role="status"`, trend indicators include sr-only text ("up 12 percent")
- Conversation list: `role="list"`, items are `role="listitem"` with keyboard navigation
- Quick action buttons: descriptive `aria-label` (not just icon)
- Time-based greeting: `aria-live="polite"` region

---

### 3.4 Chat Interface

**Route:** `/chat` and `/chat/[threadId]`
**Purpose:** Primary interaction surface. Multi-agent chat with streaming, tool execution visibility, and memory context.

#### Wireframe

```
+----------+-----------------------------------------------------------+
| SIDEBAR  | +------------------+--------------------------------------+|
|          | | THREAD LIST      | CHAT AREA                            ||
|          | | 260px            | flex-1                               ||
|          | |                  |                                      ||
|          | | [Search threads] | +----------------------------------+ ||
|          | |                  | | THREAD HEADER                    | ||
|          | | TODAY            | | "Research AI agents"   [i] [...]  | ||
|          | | > Research AI..  | +----------------------------------+ ||
|          | | > Code review..  | |                                    ||
|          | |                  | | [Avatar] You              10:30 AM ||
|          | | YESTERDAY        | | What are the latest trends in     ||
|          | | > Budget analy.. | | AI agents?                        ||
|          | | > Meeting prep.. | |                                    ||
|          | |                  | | [Brain] Supervisor         10:30AM ||
|          | | LAST 7 DAYS      | | Routing to Researcher agent...    ||
|          | | > Client specs.. | |                                    ||
|          | | > Health goals.. | | [Globe] Researcher         10:31AM||
|          | |                  | | +--------------------------------+ ||
|          | |                  | | | EXECUTION STEPS          [v]  | ||
|          | |                  | | | > Searching: "AI agent       | ||
|          | |                  | | |   trends 2026"               | ||
|          | |                  | | | > Reading 5 results...       | ||
|          | |                  | | | > Searching: "multi-agent    | ||
|          | |                  | | |   frameworks comparison"     | ||
|          | |                  | | | > Synthesizing answer...     | ||
|          | |                  | | +--------------------------------+ ||
|          | |                  | |                                    ||
|          | |                  | | Here are the latest trends in AI  ||
|          | |                  | | agents as of March 2026:          ||
|          | |                  | |                                    ||
|          | |                  | | 1. **Multi-agent orchestration**  ||
|          | |                  | |    LangGraph and CrewAI lead...   ||
|          | |                  | | 2. **Tool-use agents**            ||
|          | |                  | |    Agents that can call APIs...   ||
|          | |                  | | 3. ...                            ||
|          | |                  | |                                    ||
|          | |                  | | [Memory] 2 memories used          ||
|          | |                  | |   > "User interested in AI"       ||
|          | |                  | |   > "User builds with LangGraph"  ||
|          | |                  | |                                    ||
|          | | +[New Chat]+    | +----------------------------------+ ||
|          | |                  | | INPUT AREA                       | ||
|          | |                  | | +------------------------------+ | ||
|          | |                  | | | Message ATHENA...      [Mic]  | | ||
|          | |                  | | |                        [Send] | | ||
|          | |                  | | +------------------------------+ | ||
|          | |                  | | [Attach] [Agent: Auto v]         | ||
|          | |                  | +----------------------------------+ ||
|          | +------------------+--------------------------------------+||
+----------+-----------------------------------------------------------+
```

#### Components

| Section | shadcn/ui Components |
|---------|---------------------|
| Thread List | `ScrollArea`, `Input` (search), custom `ThreadItem` |
| Thread Header | `Badge` (agent type), `DropdownMenu` (rename, delete, export) |
| Messages | Custom `MessageBubble` (user/agent variants) |
| Agent Indicator | `Avatar`, `Badge` with agent color |
| Execution Steps | `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`, custom `StepItem` |
| Memory Indicator | `Collapsible`, custom `MemoryChip` |
| Input Area | `Textarea` (auto-resize), `Button` (send + mic), `Popover` (attach menu) |
| Agent Selector | `Select` with agent options |
| Code Blocks | Custom `CodeBlock` with `JetBrains Mono`, copy button |
| Citations | `HoverCard` for source preview |

#### Message Types

```typescript
type MessageRole = 'user' | 'agent' | 'system';

interface ChatMessage {
  id: string;
  threadId: string;
  role: MessageRole;
  content: string;
  agentType: AgentType | null; // which agent responded
  executionSteps: ExecutionStep[];
  memoriesUsed: MemoryRef[];
  citations: Citation[];
  isStreaming: boolean;
  createdAt: string;
}

interface ExecutionStep {
  type: 'search' | 'read' | 'tool_call' | 'think' | 'agent_switch';
  label: string;
  detail: string | null;
  status: 'running' | 'done' | 'error';
  durationMs: number | null;
}

type AgentType = 'supervisor' | 'researcher' | 'scheduler' | 'general' | 'document' | 'browser';
```

#### State Management

```typescript
// Zustand chat store
interface ChatStore {
  threads: Thread[];
  activeThreadId: string | null;
  messages: Map<string, ChatMessage[]>; // threadId -> messages
  isStreaming: boolean;
  streamingMessage: Partial<ChatMessage> | null;

  createThread: () => Promise<string>;
  sendMessage: (threadId: string, content: string) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  renameThread: (threadId: string, title: string) => Promise<void>;
}

// SSE streaming handled via EventSource
// Messages append token-by-token to streamingMessage
// On 'done' event, streamingMessage moves to messages array
```

#### Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| Desktop | Thread list (260px) + chat area side by side |
| Tablet | Thread list collapses to drawer, triggered by button |
| Mobile | Thread list is full-screen view, tapping thread navigates to chat view. Back button returns to list. Input area fixed to bottom with reduced padding. |

#### Accessibility

- Thread list: `role="listbox"`, `aria-activedescendant` for selected thread
- Messages: `role="log"`, `aria-live="polite"` for new messages
- Agent indicators: `aria-label="Response from Researcher agent"`
- Execution steps: `aria-expanded` on collapsible trigger
- Input: `aria-label="Type a message"`, Enter to send, Shift+Enter for newline
- Voice toggle: `aria-label="Toggle voice input"`, `aria-pressed` state
- Keyboard: Arrow keys navigate threads, Escape closes thread list on mobile

---

### 3.5 Voice Mode

**Route:** Overlay on any page (triggered from chat or sidebar)
**Purpose:** Full-screen immersive voice interaction with visual feedback.

#### Wireframe

```
+==================================================================+
|                                                                   |
|  [X Close]                                    [Settings Gear]     |
|                                                                   |
|                                                                   |
|                                                                   |
|                         [ATHENA Avatar]                           |
|                         (pulsing glow ring                        |
|                          when listening /                         |
|                          responding)                              |
|                                                                   |
|                     ~~~ WAVEFORM VISUALIZATION ~~~                |
|                     /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\                |
|                     (real-time audio waveform,                    |
|                      purple when ATHENA speaks,                   |
|                      gold when user speaks)                       |
|                                                                   |
|                                                                   |
|              "What's on my calendar today?"                       |
|              (live transcript, fades in word by word)             |
|                                                                   |
|              ATHENA: "You have 3 events today.                    |
|              Team standup at 10 AM, client call                   |
|              with Acme at 2 PM, and gym at 5 PM."                |
|              (agent response transcript)                          |
|                                                                   |
|                                                                   |
|           +-------------------------------------------+           |
|           |                                           |           |
|           |  [Push-to-Talk]    or    [Hands-Free]     |           |
|           |  (toggle between modes)                   |           |
|           |                                           |           |
|           |        [ HOLD TO SPEAK ]                  |           |
|           |        (large circular button,            |           |
|           |         purple gradient,                  |           |
|           |         press-and-hold in PTT mode)       |           |
|           |                                           |           |
|           +-------------------------------------------+           |
|                                                                   |
|  [Mute Mic]                                     [End Session]     |
|                                                                   |
+==================================================================+
```

#### Components

| Section | shadcn/ui Components |
|---------|---------------------|
| Overlay | `Dialog` (full-screen, no backdrop blur -- solid bg) |
| Close | `Button` (ghost, X icon) |
| Avatar | Custom `VoiceAvatar` with Framer Motion glow ring |
| Waveform | Custom `AudioWaveform` (canvas-based, real-time) |
| Transcript | Custom `LiveTranscript` with fade-in animation |
| Mode Toggle | `ToggleGroup` (Push-to-Talk / Hands-Free) |
| Speak Button | Custom `SpeakButton` (large, circular, gradient, press state) |
| Controls | `Button` (ghost icons for mute, settings, end) |

#### State Management

```typescript
// Zustand voice store
interface VoiceStore {
  isActive: boolean;
  mode: 'push-to-talk' | 'hands-free';
  state: 'idle' | 'listening' | 'processing' | 'speaking';
  userTranscript: string;
  agentTranscript: string;
  audioLevel: number; // 0-1, drives waveform
  isMuted: boolean;

  startSession: () => Promise<void>;
  endSession: () => void;
  toggleMode: () => void;
  toggleMute: () => void;
}

// WebSocket connection to OpenAI Realtime API via backend proxy
// Audio data streamed bidirectionally
// Transcripts update in real-time
```

#### Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| Desktop | Centered content, large waveform, spacious layout |
| Tablet | Same as desktop, slightly smaller waveform |
| Mobile | Full viewport, speak button larger (80px), transcript text smaller, bottom-aligned controls |

#### Accessibility

- Dialog: `aria-label="Voice conversation mode"`, focus trapped
- Speak button: `aria-label="Hold to speak"` / `aria-label="Listening"` (state-driven)
- Waveform: `aria-hidden="true"` (decorative), transcript is the accessible content
- Transcript: `aria-live="assertive"` for agent responses
- Mute: `aria-pressed` toggle state
- Escape key closes voice mode
- `prefers-reduced-motion`: disable waveform animation, use simple indicators

---

### 3.6 Memory Panel

**Route:** `/settings/memory` (also accessible as slide-over panel from chat)
**Purpose:** View, search, and manage ATHENA's memories about the user.

#### Wireframe

```
+----------+-----------------------------------------------------------+
| SIDEBAR  | Memory                          [Cmd+K]  [Bell]  [Avatar] |
|          +------------------------------------------------------------+
|          |                                                             |
|          |  ATHENA's Memory                                           |
|          |  156 memories stored                                       |
|          |                                                             |
|          |  [Search memories.................] [Filter v] [Sort v]     |
|          |                                                             |
|          |  CATEGORY TABS                                             |
|          |  [All] [Personal] [Preferences] [Tasks] [Relationships]    |
|          |                                                             |
|          |  +-------------------------------------------------------+ |
|          |  | MEMORY CARD                                   [X Del] | |
|          |  |                                                       | |
|          |  | "User's wife is named Sneha, birthday March 15"      | |
|          |  |                                                       | |
|          |  | Category: Personal Facts    Importance: ========-- 0.9| |
|          |  | Source: Chat "Family planning" - Mar 12, 2026         | |
|          |  | Last accessed: 2 days ago                              | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
|          |  +-------------------------------------------------------+ |
|          |  | MEMORY CARD                                   [X Del] | |
|          |  |                                                       | |
|          |  | "User prefers dark mode and concise responses"        | |
|          |  |                                                       | |
|          |  | Category: Preferences       Importance: =======--- 0.7| |
|          |  | Source: Chat "Setup" - Mar 10, 2026                    | |
|          |  | Last accessed: 5 hours ago                             | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
|          |  +-------------------------------------------------------+ |
|          |  | MEMORY CARD (fading)                          [X Del] | |
|          |  |                                                       | |
|          |  | "User discussed switching from AWS to GCP"            | |
|          |  |                                                       | |
|          |  | Category: Tasks             Importance: ==-------- 0.15| |
|          |  | Source: Chat "Infrastructure" - Feb 8, 2026            | |
|          |  | Last accessed: 49 days ago          [Reinforce]       | |
|          |  | WARNING: Fading -- will be archived in 5 days         | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
|          |  [Load More...]                                            |
|          |                                                             |
|          |  +-------------------------------------------------------+ |
|          |  | BULK ACTIONS                                          | |
|          |  | [Select All] [Delete Selected] [Export Memories]      | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
+----------+------------------------------------------------------------+
```

#### Components

| Section | shadcn/ui Components |
|---------|---------------------|
| Header | Custom `PageHeader` with count |
| Search | `Input` with search icon |
| Filters | `Select` (category, date range), `DropdownMenu` (sort by) |
| Tabs | `Tabs`, `TabsList`, `TabsTrigger` |
| Memory Card | `Card`, `Badge` (category), `Progress` (importance bar), `Button` (delete, reinforce) |
| Fading Warning | `Alert` (warning variant) |
| Bulk Actions | `Checkbox`, `Button`, `AlertDialog` (confirm delete) |
| Empty State | Custom `EmptyState` with illustration |

#### State Management

```typescript
interface MemoryPanelState {
  memories: Memory[];
  searchQuery: string;
  categoryFilter: MemoryCategory | 'all';
  sortBy: 'importance' | 'date' | 'last_accessed';
  selectedIds: Set<string>;
  isLoading: boolean;
  hasMore: boolean;
}

interface Memory {
  id: string;
  content: string;
  category: MemoryCategory;
  importanceScore: number; // 0.0 - 1.0
  sourceThreadId: string;
  sourceThreadTitle: string;
  createdAt: string;
  lastAccessedAt: string;
  isFading: boolean; // score < 0.2
}

type MemoryCategory = 'personal' | 'preferences' | 'tasks' | 'relationships';
```

#### Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| Desktop | Full-width memory cards, filters inline |
| Tablet | Same layout, cards fill width |
| Mobile | Filters collapse to bottom sheet, cards stack single column, swipe-left to delete |

#### Accessibility

- Memory list: `role="list"`, cards are `role="listitem"`
- Importance bar: `aria-label="Importance score 0.9 out of 1"`, `role="meter"`
- Delete button: `aria-label="Delete memory: User's wife is named Sneha"`
- Fading warning: `role="alert"`
- Bulk select: checkbox with `aria-label="Select memory for bulk action"`
- Search: `aria-label="Search memories"`, debounced (300ms)

---

### 3.7 Documents Page

**Route:** `/documents`
**Purpose:** Upload, manage, and query documents using RAG.

#### Wireframe

```
+----------+-----------------------------------------------------------+
| SIDEBAR  | Documents                       [Cmd+K]  [Bell]  [Avatar] |
|          +------------------------------------------------------------+
|          |                                                             |
|          |  +-------------------------------------------------------+ |
|          |  | UPLOAD ZONE                                           | |
|          |  |                                                       | |
|          |  |   +-----------------------------------------------+   | |
|          |  |   |                                               |   | |
|          |  |   |    [Cloud Upload Icon]                        |   | |
|          |  |   |                                               |   | |
|          |  |   |    Drag & drop files here                     |   | |
|          |  |   |    or click to browse                         |   | |
|          |  |   |                                               |   | |
|          |  |   |    PDF, DOCX, TXT, CSV, PNG, JPG              |   | |
|          |  |   |    Max 50MB per file                          |   | |
|          |  |   +-----------------------------------------------+   | |
|          |  |                                                       | |
|          |  |   Storage: 124MB / 500MB used  [=========-------]     | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
|          |  +-------------------------------------------------------+ |
|          |  | QUERY INTERFACE                                       | |
|          |  |                                                       | |
|          |  | [Ask a question about your documents............] [->] | |
|          |  |                                                       | |
|          |  | Recent: "What are the auth requirements?"              | |
|          |  |         "Summarize the Q1 budget"                     | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
|          |  DOCUMENTS (12 files)          [Grid] [List]  [Sort v]     |
|          |                                                             |
|          |  +-------------+ +-------------+ +-------------+           |
|          |  | [PDF icon]  | | [PDF icon]  | | [IMG icon]  |           |
|          |  | Client      | | Q1 Budget   | | Whiteboard  |           |
|          |  | Spec v2.pdf | | Report.pdf  | | Notes.png   |           |
|          |  |             | |             | |             |           |
|          |  | 2.4 MB      | | 1.1 MB      | | 3.8 MB      |           |
|          |  | [Ready]     | | [Ready]     | | [Processing]|           |
|          |  | Mar 28      | | Mar 25      | | Just now    |           |
|          |  | [...menu]   | | [...menu]   | | [...menu]   |           |
|          |  +-------------+ +-------------+ +-------------+           |
|          |                                                             |
|          |  +-------------+ +-------------+ +-------------+           |
|          |  | [DOCX icon] | | [CSV icon]  | | [TXT icon]  |           |
|          |  | Meeting     | | Expenses    | | API Docs    |           |
|          |  | Notes.docx  | | Mar.csv     | | Draft.txt   |           |
|          |  | ...         | | ...         | | ...         |           |
|          |  +-------------+ +-------------+ +-------------+           |
|          |                                                             |
+----------+------------------------------------------------------------+
```

#### Components

| Section | shadcn/ui Components |
|---------|---------------------|
| Upload Zone | Custom `DropZone` (react-dropzone), dashed border, hover highlight |
| Storage Bar | `Progress` with label |
| Query Input | `Input` + `Button`, custom `RecentQueries` dropdown |
| Document Grid | Custom `DocumentCard` in CSS grid |
| Document Card | `Card`, `Badge` (status: ready/processing/error), `DropdownMenu` (preview, download, delete) |
| List View | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` |
| Processing State | `Skeleton` during upload, spinner badge |
| Empty State | Custom `EmptyDocuments` illustration |

#### Document Status States

```typescript
type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'error';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'csv' | 'png' | 'jpg';
  sizeBytes: number;
  status: DocumentStatus;
  uploadProgress: number; // 0-100, during upload
  chunkCount: number | null;
  createdAt: string;
  lastQueriedAt: string | null;
}
```

#### State Management

```typescript
interface DocumentStore {
  documents: Document[];
  viewMode: 'grid' | 'list';
  sortBy: 'date' | 'name' | 'size';
  isUploading: boolean;
  uploadQueue: File[];
  storageUsed: number;
  storageLimit: number;

  uploadFiles: (files: File[]) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  queryDocuments: (query: string) => Promise<RAGResponse>;
}
```

#### Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| Desktop | 3-column document grid, upload zone full width |
| Tablet | 2-column grid |
| Mobile | Single column, list view default, upload zone condensed (just button), query input fixed bottom |

#### Accessibility

- Drop zone: `role="button"`, `aria-label="Upload documents, drag and drop or click to browse"`
- Upload: progress announced via `aria-live="polite"` region
- Document grid: `role="grid"`, cards focusable with keyboard
- Status badges: `aria-label="Document status: processing"` (not just color)
- Delete: `AlertDialog` confirmation, focus returns to grid after delete
- View toggle: `aria-label="Switch to list view"`, `aria-pressed`

---

### 3.8 Browser View

**Route:** `/browser`
**Purpose:** Control headless browser automation, view live screenshots, and approve actions.

#### Wireframe

```
+----------+-----------------------------------------------------------+
| SIDEBAR  | Browser Automation              [Cmd+K]  [Bell]  [Avatar] |
|          +------------------------------------------------------------+
|          |                                                             |
|          |  +-------------------------------------------------------+ |
|          |  | TASK FORM                                             | |
|          |  |                                                       | |
|          |  | What should ATHENA browse?                            | |
|          |  | +---------------------------------------------------+ | |
|          |  | | Go to Linear's pricing page and extract all plan  | | |
|          |  | | details into a comparison table.                   | | |
|          |  | +---------------------------------------------------+ | |
|          |  |                                                       | |
|          |  | Max time: [5 min v]   Approval: [Required v]         | |
|          |  |                                                       | |
|          |  | [Start Browsing ->]                                   | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
|          |  +---------------------------+---------------------------+  |
|          |  | LIVE SCREENSHOT            | ACTION TIMELINE          |  |
|          |  |                           |                           |  |
|          |  | +---------------------+   | 10:31:01                  |  |
|          |  | |                     |   | [Navigate] linear.app     |  |
|          |  | |  [Browser preview   |   |   Status: done (1.2s)    |  |
|          |  | |   screenshot here,  |   |                           |  |
|          |  | |   updates every     |   | 10:31:03                  |  |
|          |  | |   action step]      |   | [Click] "Pricing" link   |  |
|          |  | |                     |   |   Status: done (0.4s)    |  |
|          |  | |                     |   |                           |  |
|          |  | |                     |   | 10:31:04                  |  |
|          |  | |                     |   | [Scroll] to pricing table|  |
|          |  | |                     |   |   Status: done (0.3s)    |  |
|          |  | |                     |   |                           |  |
|          |  | +---------------------+   | 10:31:05                  |  |
|          |  |                           | [Extract] table data     |  |
|          |  | [< Prev] Step 4/6 [Next>] |   Status: running...     |  |
|          |  |                           |                           |  |
|          |  +---------------------------+---------------------------+  |
|          |                                                             |
|          |  +-------------------------------------------------------+ |
|          |  | APPROVAL GATE                                         | |
|          |  |                                                       | |
|          |  | ATHENA wants to submit a form on example.com           | |
|          |  |                                                       | |
|          |  | Fields to submit:                                     | |
|          |  |   Name: ATHENA Team                                 | |
|          |  |   Email: demo@athena.local                           | |
|          |  |                                                       | |
|          |  | [Screenshot of form before submit]                    | |
|          |  |                                                       | |
|          |  | [Cancel]                      [Approve & Submit]      | |
|          |  | (auto-cancels in 4:32)                                | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
|          |  RECENT TASKS                                              |
|          |  +-------------------------------------------------------+ |
|          |  | Extract pricing - Linear     | Done    | Mar 28 10:31 | |
|          |  | Fill GST form                | Paused  | Mar 27 14:20 | |
|          |  | Scrape job listings          | Done    | Mar 26 09:15 | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
+----------+------------------------------------------------------------+
```

#### Components

| Section | shadcn/ui Components |
|---------|---------------------|
| Task Form | `Textarea`, `Select` (timeout, approval mode), `Button` |
| Screenshot | Custom `BrowserPreview` (image with navigation controls) |
| Step Navigator | `Button` (prev/next), `Badge` (step counter) |
| Action Timeline | `ScrollArea`, custom `ActionStep` with status indicator |
| Approval Gate | `AlertDialog` with screenshot preview, countdown timer |
| Recent Tasks | `Table`, `Badge` (status) |

#### State Management

```typescript
interface BrowserStore {
  currentTask: BrowserTask | null;
  steps: BrowserStep[];
  currentStepIndex: number;
  approvalPending: ApprovalRequest | null;
  recentTasks: BrowserTask[];

  startTask: (description: string, config: TaskConfig) => Promise<void>;
  approveAction: (taskId: string) => Promise<void>;
  cancelAction: (taskId: string) => Promise<void>;
  replayTask: (taskId: string) => void;
}

interface BrowserStep {
  type: 'navigate' | 'click' | 'type' | 'scroll' | 'extract' | 'screenshot';
  label: string;
  screenshotUrl: string | null;
  status: 'pending' | 'running' | 'done' | 'error';
  durationMs: number | null;
  timestamp: string;
}
```

#### Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| Desktop | Screenshot and timeline side by side (60/40 split) |
| Tablet | Screenshot full width, timeline below |
| Mobile | Single column, screenshot smaller, timeline collapsible |

#### Accessibility

- Task form: `aria-label="Describe browser task"`, form validation with `aria-invalid`
- Screenshot: `alt` text describing current page, step navigation with `aria-label`
- Timeline: `role="list"`, status announced via `aria-live="polite"`
- Approval gate: focus trapped, countdown announced at 1 minute and 30 seconds
- Approve/Cancel: distinct colors, keyboard accessible (Enter to approve, Escape to cancel)

---

### 3.9 Life OS

**Route:** `/life`
**Purpose:** Unified life management dashboard with habits, goals, finance, and health tracking.

#### Wireframe

```
+----------+-----------------------------------------------------------+
| SIDEBAR  | Life OS                         [Cmd+K]  [Bell]  [Avatar] |
|          +------------------------------------------------------------+
|          |                                                             |
|          |  TABS                                                      |
|          |  [Habits] [Goals] [Finance] [Health]                       |
|          |                                                             |
|          |  === HABITS TAB ============================================|
|          |                                                             |
|          |  [+ Add Habit]                    Streak Record: 14 days   |
|          |                                                             |
|          |  TODAY'S HABITS                                            |
|          |  +-------------------------------------------------------+ |
|          |  | [x] Morning Workout         Streak: 12 days  [flame] | |
|          |  | [ ] Read 30 minutes         Streak: 3 days   [book]  | |
|          |  | [x] Meditate               Streak: 7 days   [lotus]  | |
|          |  | [ ] Journal                 Streak: 0 days   [pen]   | |
|          |  | [x] No junk food           Streak: 5 days   [apple]  | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
|          |  STREAK CALENDAR (GitHub-style heatmap)                    |
|          |  +-------------------------------------------------------+ |
|          |  |  Mon  . . # # . # # . # # # # . # # # # # . . . # #  | |
|          |  |  Tue  . # # # # # # # # # # # . # # # # # # . # # #  | |
|          |  |  Wed  # # # # # . # # # . # # # # # # # # # # # # #  | |
|          |  |  Thu  # # . # # # # # # # # . # # # # # # # # # . #  | |
|          |  |  Fri  # # # # . # # # # # # # . # # # # # # # # # #  | |
|          |  |  Sat  . . # # # # # . # # # # # # . # # # # # # . .  | |
|          |  |  Sun  . . . # # # . . # # # # # . . # # # # # . . .  | |
|          |  |       <-- Feb                              Mar -->     | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
|          |  === GOALS TAB =============================================|
|          |                                                             |
|          |  [+ Add Goal]                                              |
|          |                                                             |
|          |  +-------------------------------------------------------+ |
|          |  | OBJECTIVE: Ship ATHENA MVP                            | |
|          |  | Deadline: Apr 30, 2026                                | |
|          |  |                                                       | |
|          |  | Key Result 1: Complete all P0 features                | |
|          |  | [====================--------]  67%                   | |
|          |  |                                                       | |
|          |  | Key Result 2: 80% test coverage                      | |
|          |  | [==========------------------]  35%                   | |
|          |  |                                                       | |
|          |  | Key Result 3: Deploy to production                   | |
|          |  | [-----------------------------]  0%                    | |
|          |  |                                                       | |
|          |  | Overall: 34%  |  Time remaining: 32 days              | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
|          |  === FINANCE TAB ===========================================|
|          |                                                             |
|          |  Month: [March 2026 v]    Income: 85,000  Expenses: 42,300 |
|          |                                                             |
|          |  +---------------------------+---------------------------+  |
|          |  | EXPENSE BREAKDOWN         | MONTHLY TREND            |  |
|          |  | (Donut Chart)             | (Bar Chart)              |  |
|          |  |                           |                           |  |
|          |  |     +-------+             |  85k |       |            |  |
|          |  |    /  Rent   \            |      | 65k   |  72k       |  |
|          |  |   | 35%  Food |           |      |   |   |   |        |  |
|          |  |   |  20% 15% |            |  Jan   Feb   Mar          |  |
|          |  |    \ Trans  /             |  (income bars)            |  |
|          |  |     +-------+             |  42k                      |  |
|          |  |   Other 30%              |  (expense line overlay)   |  |
|          |  +---------------------------+---------------------------+  |
|          |                                                             |
|          |  RECENT TRANSACTIONS                                       |
|          |  +-------------------------------------------------------+ |
|          |  | Mar 28  Dinner at Bombay Canteen    Dining     -2,000 | |
|          |  | Mar 28  Uber to office              Transport    -350 | |
|          |  | Mar 27  Freelance payment           Income   +25,000 | |
|          |  | Mar 27  AWS bill                    Tech       -4,200 | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
|          |  === HEALTH TAB ============================================|
|          |                                                             |
|          |  +---------------------------+---------------------------+  |
|          |  | WEIGHT TREND (Line Chart) | SLEEP TREND (Line Chart) |  |
|          |  |                           |                           |  |
|          |  |  74 |    .                |  8h|  .   .              |  |
|          |  |  73 |  .   .   .          |  7h|    .   .  .         |  |
|          |  |  72 |        .   .        |  6h|            .        |  |
|          |  |     +------------>        |    +------------>         |  |
|          |  |     Mar 1    Mar 29       |    Mar 1    Mar 29        |  |
|          |  +---------------------------+---------------------------+  |
|          |                                                             |
|          |  +---------------------------+---------------------------+  |
|          |  | EXERCISE LOG              | MOOD TRACKER              |  |
|          |  |                           |                           |  |
|          |  | Today: Gym (45 min)       | Today: Good               |  |
|          |  | Yesterday: Run (30 min)   | Yesterday: Great          |  |
|          |  | Mar 27: Rest day          | Mar 27: Okay              |  |
|          |  +---------------------------+---------------------------+  |
|          |                                                             |
+----------+------------------------------------------------------------+
```

#### Components

| Section | shadcn/ui Components |
|---------|---------------------|
| Tab Navigation | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| Habit Checklist | `Checkbox`, `Label`, `Badge` (streak count), custom `HabitRow` |
| Streak Calendar | Custom `HeatmapCalendar` (similar to GitHub contribution graph) |
| Goal Card | `Card`, `Progress`, `Badge` (deadline), custom `OKRCard` |
| Finance Charts | Custom wrappers around Recharts: `DonutChart`, `BarChart` |
| Transaction List | `Table`, `Badge` (category color), currency formatting |
| Health Charts | Custom wrappers around Recharts: `LineChart`, `AreaChart` |
| Mood Tracker | Custom `MoodRow` with emoji indicators |
| Add Buttons | `Dialog` with forms for adding habits, goals, transactions, health entries |

#### Chart Library

Use **Recharts** (React-native charting, works with SSR):
- `PieChart` / `Pie` for expense donut
- `BarChart` / `Bar` for monthly income/expense
- `LineChart` / `Line` for weight, sleep, trends
- `AreaChart` / `Area` for filled trend lines
- All charts use the ATHENA color palette

#### State Management

```typescript
// Each tab has its own data slice, loaded on tab switch
interface LifeOSStore {
  activeTab: 'habits' | 'goals' | 'finance' | 'health';

  // Habits
  habits: Habit[];
  habitLogs: HabitLog[]; // for heatmap
  toggleHabit: (habitId: string, date: string) => Promise<void>;

  // Goals
  goals: Goal[];
  updateKeyResult: (goalId: string, krId: string, progress: number) => Promise<void>;

  // Finance
  transactions: Transaction[];
  financeSummary: FinanceSummary;
  selectedMonth: string; // YYYY-MM
  addTransaction: (tx: NewTransaction) => Promise<void>;

  // Health
  healthEntries: HealthEntry[];
  healthTrends: HealthTrend;
  logHealth: (entry: NewHealthEntry) => Promise<void>;
}
```

#### Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| Desktop | 2-column chart layouts, full heatmap visible |
| Tablet | Charts stack single column, heatmap scrollable horizontally |
| Mobile | Tabs become horizontal scroll, charts full width, transaction list simplified, heatmap shows last 3 months only |

#### Accessibility

- Tabs: `role="tablist"`, arrow key navigation between tabs
- Habit checkboxes: `aria-label="Mark Morning Workout as complete"`
- Progress bars: `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label`
- Charts: `aria-label` describing the data, data table fallback for screen readers
- Heatmap: each cell has `title` attribute with date and count
- Currency values: formatted with `Intl.NumberFormat`, `aria-label` includes currency

---

### 3.10 Weekly Report

**Route:** `/report` (also delivered via email)
**Purpose:** AI-generated weekly review with highlights, insights, and nudges.

#### Wireframe

```
+----------+-----------------------------------------------------------+
| SIDEBAR  | Weekly Report                   [Cmd+K]  [Bell]  [Avatar] |
|          +------------------------------------------------------------+
|          |                                                             |
|          |  +-------------------------------------------------------+ |
|          |  | REPORT HEADER                                         | |
|          |  |                                                       | |
|          |  |  [Owl Icon]  ATHENA Weekly Report                     | |
|          |  |  Week of Mar 23 - Mar 29, 2026                       | |
|          |  |                                                       | |
|          |  |  [<- Previous Week]              [Download PDF]       | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
|          |  +-------------------------------------------------------+ |
|          |  | HIGHLIGHTS                                            | |
|          |  |                                                       | |
|          |  |  [Star] You had 168 conversations this week (+12%)   | |
|          |  |  [Star] Longest habit streak: Morning Workout (12d)  | |
|          |  |  [Star] Saved 3.2 hours via browser automation       | |
|          |  |  [Star] 3 new documents processed and indexed        | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
|          |  +---------------------------+---------------------------+  |
|          |  | GOALS PROGRESS            | HABIT COMPLETION          |  |
|          |  |                           |                           |  |
|          |  | Ship ATHENA MVP           | Mon: 4/5                  |  |
|          |  | [===========---------]    | Tue: 5/5 (perfect!)      |  |
|          |  | 34% (+8% this week)       | Wed: 3/5                  |  |
|          |  |                           | Thu: 4/5                  |  |
|          |  | Learn Rust                | Fri: 5/5 (perfect!)      |  |
|          |  | [=====-----------------]  | Sat: 2/5                  |  |
|          |  | 15% (+3% this week)       | Sun: 3/5                  |  |
|          |  |                           |                           |  |
|          |  |                           | Avg: 74%                  |  |
|          |  +---------------------------+---------------------------+  |
|          |                                                             |
|          |  +-------------------------------------------------------+ |
|          |  | FINANCE SNAPSHOT                                      | |
|          |  |                                                       | |
|          |  | Income this week:   +25,000                           | |
|          |  | Expenses this week:  -12,400                          | |
|          |  | Net:                 +12,600                           | |
|          |  |                                                       | |
|          |  | Top categories: Dining (3,200), Transport (2,100)     | |
|          |  | Budget status: On track (68% of monthly budget used)  | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
|          |  +-------------------------------------------------------+ |
|          |  | AI INSIGHTS                                           | |
|          |  |                                                       | |
|          |  | [Lightbulb] "Your productivity peaks on Tuesdays and  | |
|          |  |  Fridays. Consider scheduling deep work on those      | |
|          |  |  days."                                               | |
|          |  |                                                       | |
|          |  | [Lightbulb] "Dining expenses are 40% higher than     | |
|          |  |  last week. Your monthly dining budget has 22%        | |
|          |  |  remaining."                                          | |
|          |  |                                                       | |
|          |  | [Lightbulb] "You haven't logged any health data in   | |
|          |  |  5 days. Want me to set a daily reminder?"            | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
|          |  +-------------------------------------------------------+ |
|          |  | NUDGES (Action Items)                                 | |
|          |  |                                                       | |
|          |  | [ ] Review fading memories (3 about to archive)       | |
|          |  | [ ] Update Key Result 3 progress (0% for 2 weeks)    | |
|          |  | [ ] Log health data (last entry: 5 days ago)          | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
+----------+------------------------------------------------------------+
```

#### Components

| Section | shadcn/ui Components |
|---------|---------------------|
| Report Header | Custom `ReportHeader` with week navigation, `Button` (download) |
| Highlights | `Card`, custom `HighlightItem` with star icon |
| Goals Progress | `Card`, `Progress` bars with delta badges |
| Habit Completion | `Card`, custom `DailyCompletionRow` |
| Finance Snapshot | `Card`, `Table` with currency formatting |
| Insights | `Card`, custom `InsightItem` with lightbulb icon |
| Nudges | `Card`, `Checkbox` + actionable links |
| Week Navigation | `Button` (previous/next), `Badge` (week range) |

#### State Management

```typescript
// Server component -- fetched per-week
interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  highlights: string[];
  goalsProgress: GoalProgress[];
  habitCompletion: DailyHabitCompletion[];
  habitAverage: number;
  financeSnapshot: WeeklyFinance;
  insights: string[];
  nudges: Nudge[];
  generatedAt: string;
}

// Minimal client state -- just week navigation
interface ReportPageState {
  selectedWeek: string; // ISO date of Monday
}
```

#### Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| Desktop | 2-column grid for goals/habits and charts |
| Tablet | Same as desktop |
| Mobile | Single column, all sections stacked, finance table simplified |

#### Accessibility

- Report sections: semantic headings (h2 for sections, h3 for subsections)
- Progress bars: full `aria` attributes
- Insights: `role="note"`
- Nudges: actionable checkboxes with descriptive labels
- Week navigation: `aria-label="Previous week"` / `aria-label="Next week"`
- PDF download: `aria-label="Download report as PDF"`

---

### 3.11 Analytics

**Route:** `/analytics`
**Purpose:** Usage analytics, agent breakdown, and cost tracking.

#### Wireframe

```
+----------+-----------------------------------------------------------+
| SIDEBAR  | Analytics                       [Cmd+K]  [Bell]  [Avatar] |
|          +------------------------------------------------------------+
|          |                                                             |
|          |  Period: [Last 7 days v]  [Last 30 days] [All time]        |
|          |                                                             |
|          |  OVERVIEW STATS (4 cards)                                  |
|          |  +-------------+ +-------------+ +-------------+ +--------+|
|          |  | Total       | | Tokens      | | Avg Response| | Est.   ||
|          |  | Messages    | | Used        | | Time        | | Cost   ||
|          |  |             | |             | |             | |        ||
|          |  |    847      | |   1.2M      | |   1.4s      | | $12.40 ||
|          |  | +18% prev   | | +22% prev   | | -8% (good)  | | +15%   ||
|          |  +-------------+ +-------------+ +-------------+ +--------+|
|          |                                                             |
|          |  +---------------------------+---------------------------+  |
|          |  | USAGE OVER TIME           | AGENT BREAKDOWN           |  |
|          |  | (Area Chart)              | (Pie Chart)               |  |
|          |  |                           |                           |  |
|          |  |      /\    /\             |     +-------+             |  |
|          |  |     /  \  /  \   /\       |    / General \            |  |
|          |  |    /    \/    \ /  \      |   | 45%  Res |            |  |
|          |  |   /            \    \     |   |  25%  Sch|            |  |
|          |  |  /                   \    |    \ 20% Doc /             |  |
|          |  | +--------------------->   |     +--10%--+             |  |
|          |  | Mon  Tue  Wed  Thu  Fri   |                           |  |
|          |  +---------------------------+---------------------------+  |
|          |                                                             |
|          |  +---------------------------+---------------------------+  |
|          |  | PEAK USAGE HEATMAP        | COST BREAKDOWN            |  |
|          |  |                           |                           |  |
|          |  |     M  T  W  T  F  S  S   | Model       Tokens  Cost  |  |
|          |  | 6a  .  .  .  .  .  .  .   | Claude Son  800K   $4.80 |  |
|          |  | 9a  #  ## ## ## #  .  .   | Claude Opus 200K   $6.00 |  |
|          |  | 12p ## ## ## ## ## .  .   | GPT-4o       50K   $1.00 |  |
|          |  | 3p  ## #  ## #  ## .  .   | Embeddings  150K   $0.60 |  |
|          |  | 6p  #  .  #  #  .  .  .   |                           |  |
|          |  | 9p  .  #  .  .  .  .  .   | Total: $12.40             |  |
|          |  +---------------------------+---------------------------+  |
|          |                                                             |
|          |  +-------------------------------------------------------+ |
|          |  | TOP QUERIED DOCUMENTS                                 | |
|          |  |                                                       | |
|          |  | 1. Client Spec v2.pdf          12 queries             | |
|          |  | 2. Q1 Budget Report.pdf         8 queries             | |
|          |  | 3. API Docs Draft.txt           5 queries             | |
|          |  | 4. Meeting Notes.docx           3 queries             | |
|          |  | 5. Expenses Mar.csv             2 queries             | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
|          |  +-------------------------------------------------------+ |
|          |  | RESPONSE TIME DISTRIBUTION                            | |
|          |  |                                                       | |
|          |  | p50: 1.1s  |  p95: 3.2s  |  p99: 5.8s              | |
|          |  |                                                       | |
|          |  | [Histogram showing response time distribution]        | |
|          |  +-------------------------------------------------------+ |
|          |                                                             |
+----------+------------------------------------------------------------+
```

#### Components

| Section | shadcn/ui Components |
|---------|---------------------|
| Period Selector | `ToggleGroup` or `Select` |
| Stat Cards | `Card`, custom `StatCard` with trend |
| Usage Chart | Recharts `AreaChart` with gradient fill |
| Agent Pie | Recharts `PieChart` with custom legend |
| Heatmap | Custom `UsageHeatmap` (CSS grid with opacity-based cells) |
| Cost Table | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` |
| Top Documents | `Card`, ordered list with query counts |
| Response Time | Recharts `BarChart` (histogram), `Badge` for percentiles |

#### State Management

```typescript
// Server component with search params for period
interface AnalyticsData {
  period: 'week' | 'month' | 'all';
  overview: {
    totalMessages: number;
    messagesTrend: number;
    tokensUsed: number;
    tokensTrend: number;
    avgResponseTime: number;
    responseTrend: number;
    estimatedCost: number;
    costTrend: number;
  };
  usageTimeline: { date: string; count: number }[];
  agentBreakdown: { agent: AgentType; count: number; percentage: number }[];
  peakUsage: { hour: number; day: number; intensity: number }[][];
  costBreakdown: { model: string; tokens: number; cost: number }[];
  topDocuments: { name: string; queryCount: number }[];
  responseTimePercentiles: { p50: number; p95: number; p99: number };
  responseTimeHistogram: { bucket: string; count: number }[];
}
```

#### Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| Desktop | 2-column chart grid, heatmap full width |
| Tablet | Charts stack single column |
| Mobile | Stat cards horizontal scroll, charts full width, cost table scrollable |

#### Accessibility

- Stat trends: sr-only text for direction ("increased by 18 percent from previous period")
- Charts: `aria-label` with summary, data tables as `<details>` fallback
- Heatmap cells: `title` with exact value, `aria-label` for screen readers
- Period selector: `aria-label="Select analytics time period"`

---

### 3.12 Settings

**Route:** `/settings` with sub-routes
**Purpose:** User profile, preferences, integrations, API keys, and account management.

#### Wireframe

```
+----------+-----------------------------------------------------------+
| SIDEBAR  | Settings                        [Cmd+K]  [Bell]  [Avatar] |
|          +------------------------------------------------------------+
|          |                                                             |
|          |  SETTINGS NAV (vertical tabs, left side)                   |
|          |  +------------+------------------------------------------+ |
|          |  | [Profile]  | PROFILE                                  | |
|          |  | [Prefs]    |                                          | |
|          |  | [Memory]   | Avatar                                   | |
|          |  | [Integr.]  | [Current Avatar]  [Change] [Remove]      | |
|          |  | [API Keys] |                                          | |
|          |  | [Billing]  | Display Name                             | |
|          |  | [Account]  | [ATHENA Team.....................]      | |
|          |  |            |                                          | |
|          |  |            | Email                                    | |
|          |  |            | demo@athena.local  [Verified]           | |
|          |  |            |                                          | |
|          |  |            | Timezone                                 | |
|          |  |            | [Asia/Kolkata (IST)              v]      | |
|          |  |            |                                          | |
|          |  |            | Language                                 | |
|          |  |            | [English                         v]      | |
|          |  |            |                                          | |
|          |  |            | [Save Changes]                          | |
|          |  +------------+------------------------------------------+ |
|          |                                                             |
|          |  === PREFERENCES TAB ========================================|
|          |  |            |                                          | |
|          |  |            | Theme                                    | |
|          |  |            | [Dark]  [Light]  [System]               | |
|          |  |            |                                          | |
|          |  |            | Default Agent                            | |
|          |  |            | [Auto-detect (recommended)       v]      | |
|          |  |            |                                          | |
|          |  |            | Response Style                           | |
|          |  |            | [Concise]  [Balanced]  [Detailed]       | |
|          |  |            |                                          | |
|          |  |            | Voice Persona                            | |
|          |  |            | [Athena (default)                v]      | |
|          |  |            |                                          | |
|          |  |            | Notifications                            | |
|          |  |            | [x] Weekly report email                 | |
|          |  |            | [x] Habit reminders                     | |
|          |  |            | [ ] Marketing emails                    | |
|          |  |            |                                          | |
|          |  +------------+------------------------------------------+ |
|          |                                                             |
|          |  === API KEYS TAB ==========================================|
|          |  |            |                                          | |
|          |  |            | [+ Create New Key]                      | |
|          |  |            |                                          | |
|          |  |            | +--------------------------------------+ | |
|          |  |            | | production-key                       | | |
|          |  |            | | athena_sk_...7f3d                    | | |
|          |  |            | | Scopes: read, write, agents          | | |
|          |  |            | | Last used: 2 hours ago               | | |
|          |  |            | | Created: Mar 15, 2026                | | |
|          |  |            | | [Revoke]                             | | |
|          |  |            | +--------------------------------------+ | |
|          |  |            |                                          | |
|          |  |            | +--------------------------------------+ | |
|          |  |            | | staging-key                          | | |
|          |  |            | | athena_sk_...a2b1                    | | |
|          |  |            | | Scopes: read, agents                 | | |
|          |  |            | | Last used: 3 days ago                | | |
|          |  |            | | Created: Mar 20, 2026                | | |
|          |  |            | | [Revoke]                             | | |
|          |  |            | +--------------------------------------+ | |
|          |  +------------+------------------------------------------+ |
|          |                                                             |
|          |  === ACCOUNT TAB ===========================================|
|          |  |            |                                          | |
|          |  |            | Change Password                         | |
|          |  |            | [Current password........]              | |
|          |  |            | [New password............]              | |
|          |  |            | [Confirm new password....]              | |
|          |  |            | [Update Password]                       | |
|          |  |            |                                          | |
|          |  |            | ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ | |
|          |  |            |                                          | |
|          |  |            | Export Data                              | |
|          |  |            | Download all your data as a ZIP file.   | |
|          |  |            | [Export My Data]                        | |
|          |  |            |                                          | |
|          |  |            | ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ | |
|          |  |            |                                          | |
|          |  |            | DANGER ZONE                             | |
|          |  |            | +--------------------------------------+ | |
|          |  |            | | Delete Account                       | | |
|          |  |            | | This permanently deletes all your    | | |
|          |  |            | | data. This action cannot be undone.  | | |
|          |  |            | | [Delete My Account]                  | | |
|          |  |            | +--------------------------------------+ | |
|          |  +------------+------------------------------------------+ |
|          |                                                             |
+----------+------------------------------------------------------------+
```

#### Components

| Section | shadcn/ui Components |
|---------|---------------------|
| Settings Nav | `Tabs` (vertical orientation), custom `SettingsNav` |
| Profile Form | `Input`, `Label`, `Select`, `Avatar`, `Button` |
| Theme Toggle | `ToggleGroup`, `ToggleGroupItem` |
| Preferences | `Select`, `ToggleGroup`, `Switch` (for notifications), `Checkbox` |
| API Keys | `Card`, `Badge` (scopes), `Button` (create, revoke), `AlertDialog` (confirm revoke) |
| Create Key Dialog | `Dialog`, `Input` (name), `Checkbox` group (scopes) |
| Password Change | `Input` (password type), `Button` |
| Export | `Button`, progress indicator |
| Danger Zone | `Card` (destructive border), `AlertDialog` (type email to confirm), `Button` (destructive variant) |

#### State Management

```typescript
// React Hook Form for each settings section
// Server actions for save operations

interface ProfileFormData {
  displayName: string;
  avatarUrl: string | null;
  timezone: string;
  language: string;
}

interface PreferencesFormData {
  theme: 'dark' | 'light' | 'system';
  defaultAgent: AgentType | 'auto';
  responseStyle: 'concise' | 'balanced' | 'detailed';
  voicePersona: string;
  notifications: {
    weeklyReport: boolean;
    habitReminders: boolean;
    marketing: boolean;
  };
}

interface APIKey {
  id: string;
  name: string;
  keyPrefix: string; // athena_sk_...last4
  scopes: ('read' | 'write' | 'agents' | 'documents')[];
  lastUsedAt: string | null;
  createdAt: string;
}
```

#### Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| Desktop | Vertical tab nav (200px) + content area side by side |
| Tablet | Same layout, slightly narrower |
| Mobile | Tab nav becomes horizontal scroll at top, content below, full width |

#### Accessibility

- Settings nav: `role="tablist"` with `aria-orientation="vertical"`
- Form fields: `aria-required`, `aria-invalid`, `aria-describedby` for help text
- Password fields: toggle visibility with `aria-label`
- API key secrets: `aria-label="API key ending in 7f3d"` (never read full key)
- Danger zone: red border + text for visual users, `role="alert"` heading for screen readers
- Delete confirmation: `aria-describedby` explaining the consequences
- All forms: validation errors announced via `aria-live="polite"`

---

## 4. Responsive Strategy

### 4.1 Breakpoints

```
Mobile:   < 768px   (single column, bottom nav, slide-over panels)
Tablet:   768-1023px (collapsed sidebar, 2-column grids)
Desktop:  >= 1024px  (full sidebar, multi-column layouts)
Large:    >= 1440px  (max-width containers, extra breathing room)
```

### 4.2 Mobile-Specific Patterns

| Pattern | Implementation |
|---------|---------------|
| Sidebar | Hidden, replaced by hamburger + Sheet overlay |
| Bottom Nav | Fixed bottom bar with 5 icons: Dashboard, Chat, Voice (FAB), Life, Menu |
| Modals | Full-screen on mobile (`Dialog` with `className="sm:max-w-lg"`) |
| Tables | Horizontal scroll with shadow indicators |
| Charts | Full-width, reduced tick labels |
| Thread list | Full-screen view with back navigation |
| Upload | Button trigger instead of drag-drop zone |

### 4.3 Mobile Bottom Navigation

```
+------------------------------------------------------------------+
|  [Dashboard]  [Chat]  [ (Voice) ]  [Life OS]  [More]            |
|   Home         Chat    Voice FAB    Life        Menu              |
+------------------------------------------------------------------+

- Voice button is elevated (FAB style), purple gradient, center position
- Active state: filled icon + text label, purple color
- Inactive state: outline icon only, muted color
- Badge on Chat for unread, badge on More for notifications
```

---

## 5. Animation & Motion

### 5.1 Framer Motion Patterns

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transition | Fade + slide up (y: 10 -> 0) | 200ms | `easeOut` |
| Sidebar open (mobile) | Slide from left (x: -280 -> 0) | 250ms | `[0.32, 0.72, 0, 1]` |
| Card hover | Scale 1.02 + shadow increase | 150ms | `easeOut` |
| Message appear | Fade in + slide up (y: 8 -> 0) | 200ms | `easeOut` |
| Execution step | Slide down + fade (height: 0 -> auto) | 250ms | `easeOut` |
| Voice glow ring | Continuous pulse (scale 1 -> 1.1) | 1500ms | `easeInOut`, repeat |
| Waveform | Real-time canvas animation | 16ms (60fps) | linear |
| Typing indicator | 3 dots bounce (y: 0 -> -4) | 600ms each | `easeInOut`, stagger 100ms |
| Streak fire | Subtle shake + glow on completion | 300ms | spring |
| Token stream | Characters fade in (opacity 0 -> 1) | 50ms each | linear |
| Modal open | Scale 0.95 -> 1 + fade | 200ms | spring(300, 20) |
| Toast notification | Slide in from right + fade | 300ms | `easeOut` |

### 5.2 Reduced Motion

All animations respect `prefers-reduced-motion: reduce`:
- Replace transforms with opacity-only transitions
- Disable continuous animations (waveform, glow pulse)
- Reduce durations to 100ms maximum
- Keep functional transitions (page changes) but simplify

---

## 6. Accessibility Standards

### 6.1 WCAG 2.1 AA Compliance

| Standard | Implementation |
|----------|---------------|
| Color Contrast | Minimum 4.5:1 for text, 3:1 for large text. Verified with `@axe-core/react` |
| Focus Indicators | 2px solid ring, purple brand color, 2px offset, visible on all interactive elements |
| Keyboard Navigation | Full app navigable via keyboard. Tab order follows visual order. Escape closes overlays. |
| Screen Reader | All images have `alt`, all icons have `aria-label`, live regions for dynamic content |
| Skip Link | "Skip to main content" link at top of every page |
| Form Labels | Every input has a visible `<label>` element. `aria-describedby` for help text and errors |
| Error Handling | Errors displayed inline next to fields, announced via `aria-live="polite"` |
| Touch Targets | Minimum 44x44px for all interactive elements on mobile |
| Language | `<html lang="en">`, update dynamically if language preference changes |

### 6.2 Color-Blind Safe

- Agent types distinguished by icon shape AND color (not color alone)
- Chart data uses pattern fills as option, not just color
- Status indicators (ready/processing/error) use icon + color + text label
- Heatmap cells use opacity rather than different hues

### 6.3 Testing Tools

- `@axe-core/react` for automated a11y testing in development
- Lighthouse accessibility audit (target score > 95)
- Manual testing with VoiceOver (macOS) and NVDA (Windows)
- Keyboard-only navigation testing for all flows

---

## Appendix A: Page Route Map

| Route | Component | Auth | Layout |
|-------|-----------|------|--------|
| `/` | `LandingPage` | No | Public (no sidebar) |
| `/login` | `LoginPage` | No | Auth layout (split) |
| `/signup` | `SignupPage` | No | Auth layout (split) |
| `/onboarding` | `OnboardingPage` | Yes | Minimal (no sidebar) |
| `/dashboard` | `DashboardPage` | Yes | App shell (sidebar) |
| `/chat` | `ChatPage` | Yes | App shell (sidebar) |
| `/chat/[threadId]` | `ChatThreadPage` | Yes | App shell (sidebar) |
| `/documents` | `DocumentsPage` | Yes | App shell (sidebar) |
| `/browser` | `BrowserPage` | Yes | App shell (sidebar) |
| `/life` | `LifeOSPage` | Yes | App shell (sidebar) |
| `/report` | `WeeklyReportPage` | Yes | App shell (sidebar) |
| `/analytics` | `AnalyticsPage` | Yes | App shell (sidebar) |
| `/settings` | `SettingsPage` | Yes | App shell (sidebar) |
| `/settings/memory` | `MemoryPanel` | Yes | App shell (sidebar) |

## Appendix B: shadcn/ui Component Inventory

All components used across screens:

```
Layout:        Separator, ScrollArea, Sheet, Tabs
Navigation:    NavigationMenu, Breadcrumb, DropdownMenu, Command (Cmd+K)
Forms:         Input, Textarea, Label, Select, Checkbox, Switch, ToggleGroup, RadioGroup
Feedback:      Alert, AlertDialog, Dialog, Toast, Progress, Skeleton, Badge
Data Display:  Card, Table, Avatar, HoverCard, Collapsible, Tooltip
```

## Appendix C: Third-Party Libraries

| Library | Purpose | Used In |
|---------|---------|---------|
| `recharts` | Charts (line, bar, pie, area) | Life OS, Analytics, Weekly Report |
| `react-dropzone` | File drag-and-drop | Documents page |
| `react-hook-form` | Form state management | All forms |
| `zod` | Form validation schemas | All forms |
| `framer-motion` | Animations and transitions | All screens |
| `date-fns` | Date formatting and manipulation | Timeline, reports, timestamps |
| `lucide-react` | Icon library | All screens |
| `zustand` | Client-side state management | Chat, Voice, Life OS stores |
| `nuqs` | URL search params state | Analytics, Documents (filters) |
