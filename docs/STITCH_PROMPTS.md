# ATHENA — Stitch UI Prompts

> Paste each prompt into [stitch.withgoogle.com](https://stitch.withgoogle.com) one at a time.
> Export each screen → save to `docs/ui-references/` as HTML.
> One prompt per screen. Iterate with follow-up prompts if needed.

---

## Design System (use in every prompt)

- **Colors:** Primary purple (#7C3AED), accent gold (#F59E0B), dark background (#0F172A), card background (#1E293B), text white (#F8FAFC), muted text (#94A3B8)
- **Font:** Inter for body, JetBrains Mono for code
- **Style:** Modern, minimal, dark-first, glassmorphism cards with subtle borders
- **Border radius:** 12px cards, 8px buttons, full-round avatars
- **Framework:** React + Tailwind CSS

---

## Screen 1: Login Page

```
Build a login page for ATHENA — a Personal AI Operating System.

Product: ATHENA is an AI-powered life management OS with multi-agent intelligence. Think Jarvis meets Notion.
Users: Professionals who want AI to manage their schedule, research, finances, and health.
Style: Modern, dark, minimal, premium feel — like a luxury AI product.

Layout:
- Centered card (max-width 420px) on dark background (#0F172A)
- Card has subtle glass effect with border (#1E293B background, slight border)

Card contents (top to bottom):
1. Purple circle avatar (48px) with brain icon — this is ATHENA's logo
2. "Welcome back" heading (24px, bold, white)
3. "Sign in to your ATHENA account" subtitle (14px, muted #94A3B8)
4. "Continue with Google" button — outline style, full width, Google G icon
5. "OR" divider line with text in center
6. Email input field — dark background, rounded, placeholder "you@example.com"
7. Password input field — same style, placeholder "Enter your password"
8. Error text area (red, small, hidden by default)
9. "Sign In" button — full width, solid purple (#7C3AED), hover darker
10. "Don't have an account? Sign up" link text at bottom — purple "Sign up" link

Colors: Background #0F172A, card #1E293B, primary #7C3AED, text #F8FAFC, muted #94A3B8
Responsive: yes, mobile-first
Framework: React + Tailwind CSS
```

---

## Screen 2: Sign Up Page

```
Build a signup page for ATHENA — a Personal AI Operating System.

Same design system as the login page (dark, minimal, premium).

Layout: Centered card (max-width 420px) on dark background (#0F172A)

Card contents:
1. Purple circle avatar (48px) with brain icon
2. "Create account" heading (24px, bold, white)
3. "Get started with ATHENA" subtitle (14px, muted)
4. Name input field — placeholder "Your name"
5. Email input field — placeholder "you@example.com"
6. Password input field — placeholder "Min 8 characters"
7. Error text area (red, small)
8. "Create Account" button — full width, solid purple (#7C3AED)
9. "Already have an account? Sign in" link at bottom

Colors: Background #0F172A, card #1E293B, primary #7C3AED
Responsive: yes, mobile-first
Framework: React + Tailwind CSS
```

---

## Screen 3: Chat Interface (Main Screen)

```
Build the main chat interface for ATHENA — a Personal AI Operating System with multiple AI agents.

This is where users spend 80% of their time. It has a sidebar and a chat area.

Layout: Full-screen, two columns.

LEFT SIDEBAR (width 280px, dark #0F172A background):
1. Header: Purple brain icon + "ATHENA" text (bold, 18px)
2. "New Chat" button — full width, solid purple, plus icon
3. Scrollable conversation list — each item shows:
   - Chat bubble icon (small, muted)
   - Conversation title (truncated, 14px)
   - Trash icon on hover (right side)
   - Active conversation has slightly lighter background (#1E293B)
4. Footer: "Settings" button with gear icon (ghost style, muted)

RIGHT CHAT AREA (flex-1, #0F172A background):
- If no messages: Empty state with:
  - Large purple sparkle icon in a circle
  - "Welcome to ATHENA" heading
  - "The AI Goddess of Wisdom" subtitle
  - 4 suggestion chips in a 2x2 grid:
    "Research the latest AI trends"
    "Help me plan my week"
    "Explain how LangGraph works"
    "Track my expenses this month"
  - Each chip: bordered card, small text, hover effect

- If messages exist:
  - Scrollable message list (max-width 768px, centered)
  - User messages: right-aligned, purple bubble (#7C3AED), white text
  - AI messages: left-aligned, dark bubble (#1E293B), with:
    - Purple circle avatar (32px) with brain icon
    - Small agent badge above message (e.g., "researcher" in blue, "scheduler" in green)
    - Message text in white
  - Streaming indicator: pulsing purple cursor bar at end of AI message

BOTTOM INPUT BAR (border-top, #1E293B background):
- Text input area (auto-resize, rounded, dark background)
- Microphone button (right, muted, disabled for now)
- Send button (right, purple circle, arrow-up icon)
- Max-width 768px, centered

Colors: Sidebar #0F172A, chat #0F172A, cards #1E293B, primary #7C3AED, agent badges use different colors
Responsive: On mobile, sidebar collapses to hamburger menu
Framework: React + Tailwind CSS
```

---

## Screen 4: Voice Mode (Full-Screen Overlay)

```
Build a full-screen voice conversation overlay for ATHENA AI.

This appears when the user clicks the microphone button. It's an immersive voice-first experience.

Layout: Full screen, centered, dark background with subtle gradient.

Center content:
1. Large pulsing circle (120px) — purple gradient (#7C3AED to #9333EA), pulses when AI is speaking
2. "ATHENA is listening..." text below the circle (or "ATHENA is speaking..." when responding)
3. Real-time audio waveform visualization — horizontal bar of moving lines, purple color
4. Live transcript area below — scrollable, shows what user said and ATHENA's response in real-time
   - User text: right-aligned, muted
   - AI text: left-aligned, white

Bottom controls:
1. Toggle: "Push to talk" / "Hands-free" — pill toggle button
2. Large red "End" circle button to close the overlay
3. Mute button (small, outline)

Overall feel: Like talking to Jarvis. Dark, immersive, futuristic.
Colors: Background #0F172A with subtle radial gradient, primary #7C3AED, waveform purple
Framework: React + Tailwind CSS
```

---

## Screen 5: Memory Panel

```
Build a memory management panel for ATHENA AI — shows everything the AI remembers about the user.

Layout: Full page with header and scrollable content.

Header:
- "ATHENA's Memory" heading with brain icon
- Search bar — dark input, search icon, placeholder "Search memories..."
- Filter chips: "All", "Facts", "Preferences", "Events", "Relationships" — horizontal scroll, pill-shaped

Memory list (cards in a single column, max-width 700px, centered):
Each memory card shows:
- Memory type badge (top-left): colored pill (fact=blue, preference=amber, event=green)
- Memory content text (14px, white)
- Importance score: small bar or number (0.0-1.0)
- "Learned on" date (small, muted text)
- Delete button (trash icon, top-right, appears on hover, red)

Empty state: "No memories yet. Start chatting and ATHENA will remember important things."

Summary card at top: "ATHENA knows X facts, Y preferences, Z events about you"

Colors: Background #0F172A, cards #1E293B, badges use type-specific colors
Framework: React + Tailwind CSS
```

---

## Screen 6: Documents / RAG Page

```
Build a document management page for ATHENA AI — users upload files and ask questions about them.

Layout: Two sections — upload area and document list.

TOP: Upload area
- Drag-and-drop zone (dashed border, 200px tall, centered)
- Cloud upload icon in center
- "Drag files here or click to upload" text
- "Supports PDF, images, audio" small text below
- Active state: purple dashed border when dragging

BOTTOM: Document list (grid of cards, 3 columns on desktop, 1 on mobile)
Each document card:
- File icon (PDF icon, image icon, etc.)
- Filename (bold, truncated)
- Status badge: "Processing" (yellow pulse), "Ready" (green), "Failed" (red)
- File size and date (small, muted)
- Delete button (top-right, hover)

Bottom section: "Ask about your documents" — input bar similar to chat input
- Placeholder: "Ask a question about your documents..."
- Send button

Colors: Background #0F172A, cards #1E293B, upload zone border #7C3AED when active
Framework: React + Tailwind CSS
```

---

## Screen 7: Life OS Dashboard

```
Build a Life OS dashboard for ATHENA AI — tracks habits, goals, finances, and health in one view.

Layout: Tab navigation at top, content below.

Tab bar: "Habits" | "Goals" | "Finance" | "Health" — horizontal tabs, underline active (purple)

HABITS TAB:
- Daily checklist — vertical list of habit items
  - Each: checkbox + habit name + streak count (fire icon + number)
  - Completed items have green check, strikethrough text
- Streak summary card at top: "Current streak: 12 days" with flame icon
- Heat map calendar (GitHub-style) showing activity over past 3 months — green squares

GOALS TAB:
- Goal cards in a grid (2 columns)
- Each card: title, category badge, progress bar (0-100%), target date
- "Add Goal" button (purple, plus icon)

FINANCE TAB:
- Top summary: 3 cards — "Income", "Expenses", "Savings" with amounts and up/down arrows
- Donut chart: spending by category (food, transport, rent, etc.)
- Recent transactions list below

HEALTH TAB:
- Metric cards: Weight, Sleep, Exercise, Mood — each with current value and trend arrow
- Line chart showing selected metric over past 30 days
- "Log" buttons to add new entries

Colors: Background #0F172A, cards #1E293B, streaks green, finance uses category colors
Framework: React + Tailwind CSS + Recharts for charts
```

---

## Screen 8: Weekly Report

```
Build a weekly AI-generated report view for ATHENA — like a personalized newsletter.

Layout: Single column, newsletter style, max-width 700px, centered.

Top:
- "Your Week in Review" heading with calendar icon
- Date range: "March 23 - March 29, 2026"
- ATHENA avatar + "Generated by ATHENA" text

Sections (each in a card with subtle border):

1. HIGHLIGHTS (star icon)
   - 3-4 bullet points with green check icons
   - Example: "Completed 5/7 daily habits", "Under budget by Rs 2,000"

2. HABITS SUMMARY
   - Horizontal progress bars for each habit
   - Streak numbers
   - AI insight: "You're most consistent on weekday mornings"

3. GOALS PROGRESS
   - Progress bars with percentages
   - Milestone markers

4. FINANCE OVERVIEW
   - Mini bar chart: spending this week vs last week
   - Category breakdown (top 3 categories)

5. HEALTH TRENDS
   - Mini sparkline charts for weight, sleep, exercise
   - AI insight: "Your sleep improved 15% this week"

6. NUDGES (light bulb icon, amber background card)
   - 2-3 suggestions: "You haven't exercised in 3 days", "Review your Q2 goals"

Footer: "Share Report" and "Export PDF" buttons

Colors: Background #0F172A, cards #1E293B, highlights green, nudges amber
Framework: React + Tailwind CSS
```

---

## Screen 9: Browser Automation View

```
Build a browser automation view for ATHENA AI — shows the AI controlling a web browser.

Layout: Two panels — task panel (left) and browser view (right).

LEFT PANEL (width 350px):
- "Browser Task" heading with globe icon
- Task input area: "What should ATHENA do on the web?" textarea
- "Execute" button (purple)
- Action timeline below — vertical list of steps:
  - Each step: number circle + action text + timestamp
  - Example: "1. Navigated to amazon.in" "2. Searched for wireless mouse" "3. Clicked filters"
  - Active step has pulsing purple dot
  - Completed steps have green check

RIGHT PANEL (flex-1):
- Browser screenshot preview — large image area with thin border
- URL bar at top showing current page URL (read-only, dark input)
- "Live" badge (green dot) when actively automating
- Refresh button
- Override button: "Take Control" — lets user manually guide the browser

Bottom: "Stop" button (red) to cancel automation

Colors: Background #0F172A, panels #1E293B, active step purple, completed green
Framework: React + Tailwind CSS
```

---

## Screen 10: Settings Page

```
Build a settings page for ATHENA AI.

Layout: Sidebar navigation (left) + content area (right).

Settings sidebar (width 200px):
- Profile
- Preferences
- Integrations
- API Keys
- Billing

PROFILE section:
- Avatar upload circle (80px, with camera overlay on hover)
- Name input
- Email (read-only, muted)
- "Save Changes" button (purple)

PREFERENCES section:
- Timezone dropdown
- Language dropdown
- Theme toggle: Dark/Light (pill switch)
- Voice selection dropdown (AI voice preference)

INTEGRATIONS section:
- Integration cards in a grid:
  - Google: "Connected" green badge, disconnect button
  - GitHub: "Connect" purple button
  - Slack: "Coming Soon" muted badge
  - Each card: service icon, name, status, action button

API KEYS section (developer tier):
- "Create API Key" button
- Key list: name, prefix (athena_xx...), created date, delete button
- Warning: "API keys are only shown once when created"

Colors: Background #0F172A, cards #1E293B, connected green, primary purple
Framework: React + Tailwind CSS
```

---

## Screen 11: Knowledge Graph

```
Build a knowledge graph visualization for ATHENA AI — shows connections between concepts the AI knows about the user.

Layout: Full-screen interactive graph with control panel.

Main area: Interactive force-directed graph (like a mind map)
- Nodes are circles with labels inside
- Node types have different colors:
  - Person: purple
  - Topic: blue
  - Event: green
  - Place: amber
  - Organization: cyan
  - Skill: pink
- Edges are thin lines connecting related nodes with relationship labels
- Nodes are draggable
- Zoom in/out with scroll wheel
- Click a node to see details

Right panel (collapsible, width 300px):
- Shows details of selected node
- Name, type, related nodes list
- "Delete" and "Edit" buttons
- Related conversations where this entity was mentioned

Top bar:
- Search input to find nodes
- Filter buttons by node type (Person, Topic, Event, etc.)
- "Auto-layout" button
- Zoom controls

Colors: Background #0F172A, nodes use type-specific colors, edges #475569
Framework: React + Tailwind CSS + D3.js force-directed graph
```

---

## Screen 12: Landing Page (Public)

```
Build a public landing page for ATHENA — a Personal AI Operating System.

Tagline: "The AI Goddess That Runs Your Life"

Layout: Full-width, scrollable, marketing page.

HERO section:
- Large heading: "The AI Goddess That Runs Your Life" (48px, bold, white)
- Subtitle: "6 specialized AI agents. Voice-first. Browser control. Life management. One intelligent system." (18px, muted)
- CTA buttons: "Get Started Free" (purple, solid) + "Watch Demo" (outline)
- Hero image/mockup of the chat interface below

FEATURES section (4 columns on desktop, 1 on mobile):
- Card 1: "Multi-Agent Intelligence" — brain icon, description about 6 agents working together
- Card 2: "Voice-First" — microphone icon, talk naturally to your AI
- Card 3: "Browser Control" — globe icon, AI browses the web for you
- Card 4: "Life OS" — heart icon, habits, goals, finance, health tracking

HOW IT WORKS section:
- 3 steps with numbered circles
- Step 1: "Ask ATHENA anything" — chat screenshot
- Step 2: "Agents work in parallel" — agent visualization
- Step 3: "Get intelligent results" — result screenshot

PRICING section:
- 3 pricing cards: Free / Pro $29/mo / Ultra $79/mo
- Each with feature list and CTA button
- Pro card highlighted (purple border, "Popular" badge)

FOOTER:
- ATHENA logo + tagline
- Links: Features, Pricing, About, Contact
- "Built by Vishal Prasad"

Colors: Background #0F172A, cards #1E293B, primary #7C3AED, accent #F59E0B
Framework: React + Tailwind CSS
```

---

## Folder Convention

After generating each screen in Stitch, export and save:

```
docs/ui-references/
├── login.html
├── signup.html
├── chat.html
├── voice-mode.html
├── memory.html
├── documents.html
├── life-os.html
├── weekly-report.html
├── browser.html
├── settings.html
├── knowledge-graph.html
└── landing.html
```

Then tell Claude to convert each file to production Next.js + Tailwind + shadcn/ui components.
