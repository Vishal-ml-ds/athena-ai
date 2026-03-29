# ATHENA — Stitch Prompts V2 (Extra Screens)

> Same design system: Dark (#0b1326), Purple (#7C3AED / #d2bbff), Gold (#ffb95f)
> Space Grotesk headlines, Inter body, JetBrains Mono metadata
> Glassmorphism, no-line rule, editorial layout

---

## Screen 13: Onboarding Wizard (3 Steps)

```
Build a 3-step onboarding wizard for ATHENA AI — a Personal AI Operating System.

This appears after first signup. Dark, premium, welcoming. Makes the user feel like they're initializing their personal AI.

Layout: Centered card (max-width 600px), dark background (#0b1326), progress bar at top.

STEP INDICATOR at top:
- 3 circles connected by lines
- Active step: purple filled circle with number
- Completed step: green check
- Upcoming: outline circle with number
- Labels below: "Identity" → "Preferences" → "Interests"

STEP 1 — IDENTITY:
- Heading: "Let's initialize your neural link" (Space Grotesk, light weight)
- Subtitle: "Tell ATHENA who you are" (JetBrains Mono, small caps, gold)
- Avatar upload circle (100px, dashed purple border, camera icon, click to upload)
- Display name input field
- "What should ATHENA call you?" label in mono
- "Continue" button (purple gradient, full width)

STEP 2 — PREFERENCES:
- Heading: "Calibrating your environment"
- Timezone dropdown (auto-detected, editable)
- Language dropdown (English default)
- Theme toggle: Dark / Light (pill switch, dark selected)
- Preferred AI voice dropdown: "Athena (Default)", "Nova", "Onyx", "Echo"
- "Continue" button

STEP 3 — INTERESTS:
- Heading: "What should ATHENA focus on?"
- Grid of selectable interest chips (3 columns):
  - Coding, AI/ML, Finance, Health, Productivity, Learning
  - Startups, Design, Marketing, Writing, Music, Travel
- Each chip: pill-shaped, outline by default, purple fill when selected
- Minimum 3 selections required
- "Initialize ATHENA" button (purple gradient, glowing, big)
- Below button: "You can always change these in Settings"

Overall feel: Like booting up a starship's AI system. Premium, exciting.
Colors: Background #0b1326, cards glass-card style, primary #7C3AED, gold #ffb95f
Framework: React + Tailwind CSS
```

---

## Screen 14: Agent Command Center

```
Build an Agent Command Center dashboard for ATHENA AI — shows all 7 AI agents, their status, and performance.

This is a unique feature no competitor has. It visualizes the multi-agent system.

Layout: Full page, grid of agent cards + performance metrics.

TOP SECTION:
- "Agent Command Center" heading (Space Grotesk)
- "NEURAL NETWORK STATUS" subtitle (JetBrains Mono, gold, small caps)
- System status indicator: green dot + "All Systems Operational"

AGENT GRID (7 cards, 2 rows — 4 + 3):
Each agent card (glass-card style):
- Agent icon (top-left): colored circle with icon
  - Researcher: blue, search icon
  - Scheduler: green, calendar icon
  - Life Coach: amber, heart icon
  - Coder: cyan, code icon
  - Browser: orange, globe icon
  - Finance: emerald, dollar icon
  - General: purple, brain icon
- Agent name (bold, white)
- Status badge: "Active" (green) or "Standby" (muted)
- Messages handled: "247 requests" (small, muted)
- Avg response time: "1.2s" (small)
- Confidence score: circular progress ring (small, colored)
- Last active: "2 min ago" (JetBrains Mono, tiny)

BOTTOM SECTION — PERFORMANCE METRICS:
- 4 stat cards in a row:
  - "Total Conversations" with large number + trend arrow
  - "Tokens Used Today" with number + daily limit bar
  - "Avg Response Time" with number in seconds
  - "Intent Accuracy" with percentage + small bar chart
- Below: "Agent Distribution" pie/donut chart showing which agents handle most requests

Colors: Background #0b1326, cards glass-card, each agent has its own accent color
Framework: React + Tailwind CSS
```

---

## Screen 15: Notification Center

```
Build a notification center overlay for ATHENA AI — shows all alerts, nudges, and reminders.

Slides in from the right side of the screen (like a drawer/panel).

Layout: Right-side panel (width 400px), full height, glass-card background.

HEADER:
- "Notifications" heading
- "Mark all read" button (text button, muted)
- Close button (X icon, top-right)

FILTER TABS:
- "All" | "Nudges" | "Reminders" | "System" — horizontal pills

NOTIFICATION LIST (scrollable):
Each notification card:
- Left icon: colored circle based on type
  - Nudge: amber light bulb
  - Reminder: purple bell
  - System: blue info circle
  - Achievement: green trophy
- Title (bold, 14px)
- Description (muted, 12px, 2 lines max)
- Time: "2 min ago" (JetBrains Mono, tiny, right-aligned)
- Unread indicator: small purple dot on left
- Click to dismiss / mark as read

EXAMPLE NOTIFICATIONS:
1. Nudge (amber): "You haven't exercised in 3 days" — "Consider a 20-minute walk today"
2. Reminder (purple): "Call Mom at 5:00 PM" — "Scheduled 2 hours ago"
3. Achievement (green): "7-day streak!" — "You completed all habits for a week straight"
4. System (blue): "Weekly report ready" — "Your March 23-29 report has been generated"

EMPTY STATE: "No notifications. ATHENA is watching over you."

Colors: Background glass-card (#171f33 at 60% opacity + blur), types have accent colors
Framework: React + Tailwind CSS
```

---

## Screen 16: AI Conversation Insights

```
Build a conversation insights page for ATHENA AI — analytics about chat usage and AI agent performance.

Layout: Full page with stat cards at top and charts below.

TOP STATS ROW (4 cards):
1. "Total Conversations" — large number, trend percentage, chart sparkline
2. "Messages This Week" — number with daily breakdown mini bar chart
3. "Tokens Consumed" — number with cost estimate, progress bar vs limit
4. "Most Used Agent" — agent name with icon and percentage

CHARTS SECTION (2 columns):

LEFT COLUMN:
- "Agent Distribution" donut chart — shows % of messages per agent (researcher, coder, scheduler, etc.) with colored segments matching agent colors
- Legend below with agent names and percentages

RIGHT COLUMN:
- "Activity Heatmap" — GitHub-style grid showing chat activity by day/hour
- Green squares (or purple) for activity intensity
- X-axis: days of week, Y-axis: hours

BOTTOM ROW:
- "Response Time Trend" — line chart showing average response time over past 30 days
- "Top Topics" — horizontal bar chart showing most discussed topics extracted from conversations

Each chart card has:
- Title in Space Grotesk
- Time period selector: "7D" | "30D" | "90D" pills
- Glass-card background

Colors: Background #0b1326, chart colors match agent colors, cards glass-card
Framework: React + Tailwind CSS + Recharts
```

---

## Screen 17: Mobile Chat View

```
Build a mobile-optimized chat view for ATHENA AI — designed for smartphones (375px width).

This is the responsive version of the main chat interface.

Layout: Full-screen, single column, no sidebar.

TOP BAR (fixed):
- Left: hamburger menu icon (opens sidebar drawer)
- Center: "ATHENA" text
- Right: user avatar circle (small)

CHAT AREA (scrollable, full width):
- Messages take full width with small padding
- User messages: right-aligned purple bubble, rounded
- AI messages: left-aligned, editorial style (role label + content)
- Agent badge: small colored pill below AI role label
- Streaming indicator: pulsing purple bar

BOTTOM INPUT BAR (fixed):
- Text input (rounded, dark, takes most width)
- Mic button (circle, left of send)
- Send button (purple circle, right)
- Safe area padding for iPhone notch

BOTTOM NAV BAR (fixed, below input):
- 5 icons: Chat, Life OS, Memory, Documents, Settings
- Active icon: purple with label
- Inactive: muted gray
- Small dots for notification badges

Overall feel: Like a premium AI messaging app. Fast, clean, thumb-friendly.
Colors: Background #0b1326, bubbles same as desktop, nav bar #131b2e
Framework: React + Tailwind CSS (mobile-first)
```

---

## Screen 18: Command Palette / Quick Actions

```
Build a command palette overlay for ATHENA AI — a spotlight-style quick action modal.

Triggered by Ctrl+K or clicking search icon. Appears as a centered floating panel.

Layout: Centered modal (max-width 600px), glass-card with strong blur.

SEARCH INPUT at top:
- Large input field with search icon
- Placeholder: "Ask ATHENA anything or search..."
- Auto-focus when opened
- JetBrains Mono font for input text

RESULTS SECTION (below input, scrollable):

Category headers in gold mono text:
"QUICK ACTIONS"
- ⚡ New Chat — "Start a fresh conversation"
- 📊 Weekly Report — "View this week's summary"
- 💰 Log Expense — "Add a new expense entry"
- ✅ Log Habit — "Mark a habit as complete"

"RECENT CONVERSATIONS"
- 3 recent chat titles with message preview

"MODULES"
- Life OS, Memory, Documents, Browser, Knowledge, Settings — with icons

Each result item:
- Icon (left)
- Title (bold)
- Description (muted, smaller)
- Keyboard shortcut badge (right, if applicable): "⌘1", "⌘2", etc.
- Hover: subtle purple highlight

FOOTER:
- "ESC to close" | "↑↓ to navigate" | "↵ to select" — keyboard hints in mono

Overall feel: Like macOS Spotlight but for your AI OS. Fast, powerful, discoverable.
Colors: Background glass-card with extra blur, input #060e20, primary #7C3AED
Framework: React + Tailwind CSS
```

---

## Folder Convention

Save to same folder:
```
docs/ui-references/
├── athena_onboarding/code.html + screen.png
├── athena_agent_command_center/code.html + screen.png
├── athena_notification_center/code.html + screen.png
├── athena_conversation_insights/code.html + screen.png
├── athena_mobile_chat/code.html + screen.png
└── athena_command_palette/code.html + screen.png
```
