# Trace — All Pages Specification

## Page 1: Landing Page (/)

### Navbar

Fixed, white background.
On scroll > 50px: backdrop-blur + border-bottom appears.

Left: Trace logo (waveform SVG icon + "Trace" bold)
Right:
  "Sign in" link → /signin
  "Get started free" button → /signup
  (indigo solid button)

### Hero Section

Full viewport height.
White background with decorative blobs.

Background (all position:absolute, z-index:0):
  Blob 1: 700px circle, top-right, #6366f108, blur 140px
  Blob 2: 500px circle, bottom-left, #8b5cf608, blur 100px
  Dot grid: SVG pattern, 1.5px dots, #6366f10a, 28px gap

Content (z-index:1, centered, max-width:820px):

  1. Badge pill (animate: fade+y-10, delay 0s):
     "✨ Turn any meeting into instant insights"
     bg:#eef2ff border:#c7d2fe text:#6366f1

  2. Headline (animate: fade+y20, delay 0.15s):
     Line 1: "Stop losing track of"
     Line 2: "what matters"
     Line 3: "in your meetings."
     72px, weight 800, tracking -0.04em
     "matters" has animated gradient underline:
       linear-gradient(90deg, #6366f1, #8b5cf6)
       height 4px, border-radius 2px
       animate width 0→100% on load, 0.8s delay

  3. Subtext (animate: fade, delay 0.3s):
     "Trace listens to your meetings so you don't
     have to. Upload any recording — get every
     action item, decision, and blocker extracted
     automatically. Then ask anything in plain English."
     20px, #4b4b63, max-width 580px, centered

  4. CTA buttons (animate: fade+y16, delay 0.45s):
     Side by side, centered, gap 12px

     Primary: "Start for free →"
       indigo solid, LG size
       shadow: 0 4px 20px rgba(99,102,241,0.35)
       hover: scale(1.02) + shadow increase
       → navigates to /signup

     Secondary: "See how it works"
       white bg, border, LG size
       hover: border indigo
       → smooth scroll to #how-it-works

  5. Trust line (animate: fade, delay 0.6s):
     "Free to use  ·  Runs locally  ·  Your data stays private"
     14px, #9090a8, centered

### Product Mockup

Below hero content.
Centered, max-width 960px, margin-top 80px.
Animate: fade+y40, delay 0.7s, spring.

Outer wrapper:
  bg: linear-gradient(145deg, #f0f0ff, #f5f3ff, #fff0f8)
  border-radius: 24px
  padding: 20px
  shadow: 0 40px 100px rgba(99,102,241,0.18)
  border: 1px #e4e0ff

Inner app mockup (static, styled divs):
  Simulate the dashboard UI:

  Top bar:
    white, border-bottom, height 48px
    "Trace" logo left
    "New Meeting" indigo pill right

  Content area: 2 columns

  Left col (60%):
    3 meeting cards stacked, small versions:
      Card 1: "Q3 Planning Session"
              planning badge | "42 min"
              "4 tasks · 3 decisions · 1 blocker"
      Card 2: "Product Roadmap Review"
              review badge | "28 min"
              "2 tasks · 5 decisions · 0 blockers"
      Card 3: "Weekly Team Standup"
              standup badge | "15 min"
              "3 tasks · 1 decision · 2 blockers"

  Right col (40%):
    Query box with magnifier icon
    Sample: "What are open action items?"
    Answer card:
      "3 open action items found:"
      "• Fix auth bug — Sarah — Due today"
      "• Review designs — Mike"
      "• Update docs — Team"

  All mockup content styled to match real app
  but smaller, like a screenshot

Floating accent cards (around mockup):
  Card 1 (top-left, floating):
    white, shadow, rounded-xl, padding 12px 16px
    "✅ Action items extracted"
    animation: y -8 to 8, 3.5s loop, ease-in-out

  Card 2 (top-right, floating):
    "🎯 3 decisions captured"
    animation: y 8 to -8, 4s loop (opposite phase)

  Card 3 (bottom-right, floating):
    "🔍 Ask in plain English"
    animation: y -6 to 6, 3s loop

  Each card: white bg, border, shadow-MD, rounded-xl

### How It Works Section

id="how-it-works"
padding: 120px vertical
bg: #f8f8fc

Heading group (centered):
  Label: "HOW IT WORKS" (12px, uppercase, tracked, #6366f1)
  H2: "Simple as dropping a file"
  Subtext: "No setup. No training. Upload and go."

4 steps in horizontal row (vertical on mobile):
  Connecting dashed line between steps
  (indigo, dashed, horizontal, z-index 0)

  Step 1:
    Number bubble: "1" — 48px circle, indigo bg, white text
    Icon: Upload cloud (40px, indigo, above number)
    Title: "Upload recording"
    Body: "Any audio or video format.
    Drag, drop, done."

  Step 2:
    Number: "2"
    Icon: Mic waves
    Title: "AI transcribes"
    Body: "Every word. Every speaker.
    Timestamped precisely."

  Step 3:
    Number: "3"
    Icon: Sparkles
    Title: "Insights extracted"
    Body: "Tasks, decisions, blockers
    with owners and deadlines."

  Step 4:
    Number: "4"
    Icon: Search
    Title: "Ask anything"
    Body: "Natural language search
    across all your meetings."

  Each step:
    Card: white, border, radius-LG, padding 32px
    Center-aligned content
    On scroll: fade+y24 with stagger 0.1s

### Features Section

padding: 120px vertical
bg: white

Heading group (centered):
  Label: "FEATURES"
  H2: "Everything in one place"
  Subtext: "Built for teams who can't afford
  to lose context between meetings."

6 feature cards in 3×2 grid:

  Card 1 — Speaker identification:
    Icon container: 48px, rounded-MD, #eef2ff bg
    Icon: Users (indigo)
    Title: "Speaker identification"
    Body: "Automatically knows who said what.
    No manual labeling needed."

  Card 2 — Action items:
    Icon bg: #f0fdf4, Icon: CheckCircle2 (green)
    Title: "Action item extraction"
    Body: "Every task captured with owner
    and deadline. Nothing slips through."

  Card 3 — Decision tracking:
    Icon bg: #eff6ff, Icon: Zap (blue)
    Title: "Decision tracking"
    Body: "Full history of every decision.
    Know why things were decided."

  Card 4 — Blocker detection:
    Icon bg: #fff7ed, Icon: AlertTriangle (orange)
    Title: "Blocker detection"
    Body: "Surface problems before they
    become crises. Stay unblocked."

  Card 5 — Natural language:
    Icon bg: #faf5ff, Icon: MessageSquare (purple)
    Title: "Natural language search"
    Body: "Ask like you'd ask a colleague.
    Get real answers from real meetings."

  Card 6 — Meeting memory:
    Icon bg: #f0fdfa, Icon: Brain (teal)
    Title: "Persistent memory"
    Body: "Every meeting indexed forever.
    Search across months of history."

  Each card:
    white, border, radius-LG, padding 28px
    hover: border #c7d2fe, shadow-LG, y-4
    scroll animate: stagger 0.08s

### Social Proof / Use Cases

padding: 120px vertical
bg: #f8f8fc

Heading (centered):
  Label: "WHO USES TRACE"
  H2: "Built for teams who move fast"

3 cards horizontal (stack on mobile):

  Card 1 — Project Managers:
    Top: large emoji "📋" (48px)
    Role badge: "Project Manager"
    Quote: "I used to spend 30 minutes
    writing meeting notes. Now I upload
    the recording and everything is ready."
    Tags: "Action tracking" "Deadlines" "Accountability"

  Card 2 — Founders:
    Emoji: "🚀"
    Role: "Startup Founder"
    Quote: "We run 15+ meetings a week.
    Trace is the only reason I know what
    was actually decided in each one."
    Tags: "Decision history" "Cross-meeting search"

  Card 3 — Engineering Leads:
    Emoji: "⚙️"
    Role: "Engineering Lead"
    Quote: "The blocker detection catches
    things people forget to mention in
    standup. It's saved us multiple times."
    Tags: "Blocker detection" "Sprint planning"

  Cards: white, border, radius-XL, padding 40px
  Icon bg: very light matching color
  Hover: lift + shadow

### Final CTA Section

margin: 0 32px 80px
bg: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)
border-radius: 24px
padding: 80px

Centered:
  H2: "Ready to never lose a meeting insight again?"
  white, 48px
  Subtext: "Upload your first recording in 30 seconds."
  white/75

  Button: "Get started free →"
    white bg, #6366f1 text, weight 700
    LG size, shadow
    hover: scale(1.03)
    → /signup

  Below: "No account required to try"
  white/50, 14px

### Footer

bg: white
border-top: 1px #e8e8f0
padding: 40px 0

Left: Trace logo + "Meeting Intelligence"
Right: "Built with local AI · Your data never leaves"
Center bottom: "© 2026 Trace"

---

## Page 2: Sign Up (/signup)

### Layout

Split screen (desktop):
  Left 50%: indigo gradient bg, branding
  Right 50%: white, form

Left panel:
  bg: linear-gradient(145deg, #6366f1, #8b5cf6)
  Centered content:
    Trace logo (white version)
    Large quote:
      "Your meetings are full of
       decisions waiting to be found."
    Below: 3 benefit bullets with checkmarks:
      ✓ Auto transcription with speaker IDs
      ✓ Action items extracted instantly
      ✓ Ask anything across all meetings
    
    Decorative: abstract indigo/purple shapes
    Semi-transparent overlapping circles

Right panel:
  White, centered form, max-width 420px

  Logo top (for mobile — left panel hidden)
  
  H1: "Create your account"
  Subtext: "Start extracting insights from meetings"

  Form fields:
    Full name input (icon: User)
    Email input (icon: Mail)
    Password input (icon: Lock, show/hide toggle)
    
    All use design system input styles

  Submit button:
    "Create account →" — indigo, full width, LG
    Loading state: spinner + "Creating account..."

  Divider: "Already have an account?"
  "Sign in" link → /signin (indigo, centered)

  Bottom note:
    "Your data stays on your machine.
    We never store your recordings."
    14px, gray, centered

  On submit:
    Validate all fields (required, email format,
    password min 8 chars)
    Store in localStorage:
      { name, email, createdAt }
    Show success toast: "Welcome to Trace!"
    Navigate to /dashboard

---

## Page 3: Sign In (/signin)

### Layout

Same split layout as signup.

Left panel: same branding, different quote:
  "Every meeting is a goldmine.
   Trace helps you dig it out."

Right panel form:
  H1: "Welcome back"
  Subtext: "Sign in to your account"

  Email input
  Password input (show/hide toggle)
  "Forgot password?" link (gray, right-aligned, non-functional)

  "Sign in →" button — indigo, full width

  Divider: "Don't have an account?"
  "Get started free" link → /signup

  On submit:
    Check localStorage for existing user with email
    If found: log in, navigate to /dashboard
    If not found: show error "No account found.
    Please sign up first."
    Show error inline below email field

---

## Page 4: Dashboard (/dashboard)

### Top Navbar

See design system navbar spec.
Show user avatar (colored circle, initials) + name.

### Page Header

"Good morning, [name]" (or afternoon/evening based on time)
Subtext: "Here's what's happening across your meetings."
Right: "Upload meeting" indigo button with upload icon

### API Health Check Banner

On load: check GET /health
If offline:
  Yellow banner at top of page:
  "⚠ Backend offline — start the server to process meetings"
  "uvicorn backend.main:app --reload"
  [Retry] button

### Stats Row

Fetch GET /meetings on load.
Compute stats client-side.

4 cards in a row (2×2 on mobile):

  Card style: white, border, radius-LG, padding 24px

  Card 1 — Meetings:
    Icon: Layers, indigo, 40px, in #eef2ff circle
    Number: count of meetings (animated count-up)
    Label: "Meetings processed"
    Subtext: "Total recordings analyzed"

  Card 2 — Action Items:
    Icon: CheckCircle2, green
    Number: sum of all action_items counts
    Label: "Action items logged"
    Subtext: "Across all meetings"

  Card 3 — Decisions:
    Icon: Zap, blue
    Number: sum of decisions
    Label: "Decisions captured"
    Subtext: "Recorded and searchable"

  Card 4 — Blockers:
    Icon: AlertTriangle
    Number: sum of blockers
    Color: red if > 0, green if 0
    Label: "Active blockers"
    Subtext: blockers > 0 ? "Need attention" : "All clear"

### Upload Card

White card, border 2px dashed #c7d2fe
bg: white, hover-bg: #f8f8ff
radius-XL, padding 40px
Center-aligned

Default state:
  Upload cloud icon (48px, indigo)
  H3: "Upload a meeting recording"
  Body: "Drop your audio or video file here"
  Formats: "MP3, MP4, WAV, M4A, OGG, FLAC"
  "or click to browse" link (indigo)

Drag over state:
  border-color: #6366f1
  bg: #eef2ff
  icon scales up 1.1x

File selected state:
  File icon + filename + size
  "Process with Trace →" indigo button (full width)
  "Remove file" gray link below

Processing state:
  Replace card content with step tracker:

  4 steps vertical with connecting line:
  
  Visual for each step:
    Waiting: gray circle (24px), gray text
    Active:  indigo spinning ring (24px),
             indigo bold text,
             italic description below
    Done:    green filled circle + checkmark (spring anim),
             green text, checkmark icon

  Steps:
    1. "Converting audio"
       active: "Preparing your recording..."
    2. "Transcribing speech"
       active: "Identifying all speakers..."
    3. "Extracting insights"
       active: "Finding tasks, decisions, blockers..."
    4. "Building search index"
       active: "Making it searchable..."

  Map progress % from GET /jobs/:id:
    0-25%:  step 1 active
    25-60%: step 2 active
    60-85%: step 3 active
    85-99%: step 4 active
    100%:   all done

  Progress bar: thin, indigo, smooth width
  "X% complete" text

  Poll every 6 seconds.

  On complete:
    All steps green with checkmarks
    Animate: success scale bounce
    Toast: "✓ Meeting processed! 
            Ready to explore."
    After 2s: reset card, refresh meetings

### Recent Meetings Grid

"Recent Meetings" heading
"View all →" right → /meetings

2-col grid, max 4 meetings
Fetch GET /meetings, sort newest first

Each meeting card:
  white, border, radius-LG, padding 24px
  Hover: y-4, border #c7d2fe, shadow

  Top row:
    Title: bold, #0f0f1a, 2-line clamp
    Type badge: right aligned (see badge spec)

  Middle:
    Date: "Apr 14, 2026" — gray, 14px
    Duration: "X min" — gray, 14px
    Speakers: overlapping avatar circles
      max 4, "+N" if more
      consistent colors per name

  Bottom:
    Pills row:
      "N tasks" — green badge
      "N decisions" — blue badge
      "N blockers" — red badge (hide if 0)

  Hover:
    "Open meeting →" fades in (indigo text, 14px)

  Click: → /meetings/:id

### Quick Ask Bar

Fixed bottom, full width
bg: white/90, backdrop-blur
border-top: 1px #e8e8f0
padding: 16px 24px
z-index: 40

Input:
  "Ask anything about your meetings..."
  left: sparkle icon (indigo)
  right: send button (indigo arrow)
  width: max 640px, centered

On submit:
  Call POST /query
  Slide-up panel above bar:
    white, shadow-XL, radius 16px 16px 0 0
    max-height: 300px, scrollable
    Answer text + confidence badge
    "Full search →" link → /ask
    Click outside to close

---

## Page 5: Meetings List (/meetings)

### Header

"My Meetings" (H1) + count badge (gray pill)
Right: "Upload meeting" button

### Filter + Sort Bar

White card, border, padding 16px
Horizontal flex, space-between

Left — type filters:
  Pills: All | Onboarding | Planning | Review | Standup | Discussion
  Active: indigo bg, white text
  Inactive: white, border, gray text, hover indigo

Right — sort:
  Dropdown: "Newest first" | "Oldest first" | "Most tasks"
  White, border, radius-SM

### Meetings List

Full-width cards
Fetch GET /meetings
Apply filter + sort client-side

Each card:
  white, border, radius-LG, padding 24px
  Left accent bar: 4px, colored by meeting type
  Horizontal layout

  Left section:
    Title: H4, bold
    Meta: date · duration · type badge (row)
    Speakers: small overlapping avatars

  Right section:
    Stats pills: tasks + decisions + blockers
    "Open →" indigo outlined button

  Hover: border #c7d2fe, y-2, shadow

Stagger animate: 0.04s between cards

Empty state:
  Centered, illustration (empty folder SVG)
  "No meetings yet"
  "Upload your first recording"
  Upload button → scroll to top

---

## Page 6: Meeting Detail (/meetings/:id)

### Data Fetching

On mount:
  GET /meetings/:id → extraction data
  GET /meetings/:id/transcript → transcript

### Header

"← Back to Meetings" link (gray, hover indigo)
H1: meeting title
Meta row: type badge | date | duration
Speakers: colored pills with names
All animate in on load

### Tab Bar

4 tabs: Summary | Transcript | Action Items | Export
Sliding indigo underline indicator
Active: #6366f1 text, weight 600
Inactive: #9090a8

#### Summary Tab (default)

Two-column layout (single on mobile)

LEFT:

Summary card:
  white, border, radius-LG, padding 24px
  Left border: 4px solid #6366f1
  "Meeting Summary" heading + sparkle icon
  Summary body text, line-height 1.8
  Gray italic if no summary

Key Topics card:
  "Topics Covered" heading
  Topic pills: indigo bg, indigo text
  Wrap to multiple lines

Action Items card:
  "Action Items" heading + green count badge
  
  Each action item:
    white, border, radius-MD, padding 16px
    hover: border #6366f1

    Row 1: task text, weight 500
    Row 2:
      left: speaker avatar (SM) + owner name chip
      right: deadline badge:
        "today"/"afternoon" → red "Due today"
        "tomorrow" → orange "Due tomorrow"
        other text → gray badge
        null → nothing
    Row 3: "Assigned by [name]" — 12px, muted

Decisions card:
  "Decisions" heading + blue count badge

  Each decision:
    white, border-left 4px #2563eb
    radius-MD, padding 16px
    Decision text, weight 500
    "— [made_by]" — 14px, gray
    Zap icon: blue, top-right, 16px

RIGHT:

Blockers card:
  "Blockers" heading + count badge

  0 blockers:
    green light card: "✓ No blockers identified"
    bg: #f0fdf4, border: #86efac

  Each blocker:
    bg: #fef2f2
    border: 1px #fca5a5
    border-left: 4px #dc2626
    radius-MD, padding 16px
    AlertTriangle icon: red, 16px
    Blocker text: #7f1d1d
    "Affects: [name]" — 14px, gray

Stats chart card:
  "At a Glance" heading
  Recharts DonutChart:
    Tasks: #22c55e
    Decisions: #3b82f6
    Blockers: #ef4444
  Center: total count, large, bold
  Legend below with counts + labels

Participants card:
  "Participants" heading
  Each speaker: MD avatar + name
  Row layout, wrap, gap 12px

#### Transcript Tab

Fetch GET /meetings/:id/transcript

Chat-style layout, white bg
Total count: "X segments" — gray, top

For each segment:
  Group by speaker (consecutive same speaker)
  
  First of group:
    Avatar (MD) + Speaker name (weight 600, speaker color)
    Timestamp pill: "0:08" (gray, 12px, rounded)
    Message text below (indented to avatar width)

  Subsequent in group:
    Just message + timestamp, indented
    No repeated avatar/name

Message styling:
  Padding: 8px 0
  Border-bottom: 1px #f0f0f8 (light separator)
  Hover: bg #fafafa

Speaker colors: consistent hashed colors

#### Action Items Tab

Owner filter chips:
  "All" + one per unique owner
  Active: indigo, inactive: gray border

Table:
  Columns: Task | Owner | Deadline | Assigned By
  
  Header: weight 600, gray, border-bottom 2px

  Each row:
    Padding: 14px 16px
    Alt rows: white / #fafafa
    Hover: #f0f0ff bg

    Task: text, weight 500, wraps
    Owner: colored chip (SM avatar + name)
    Deadline: colored badge or "—"
    Assigned by: gray, 14px

  Empty: centered "No action items identified"

#### Export Tab

3 action cards in row:

  Copy Summary card:
    Clipboard icon (indigo bg pill)
    "Copy meeting summary"
    Body: "Paste directly into Slack, email, or docs"
    "Copy to clipboard" button (indigo outlined)
    On click: copy, toast "Copied!"

  Copy Tasks card:
    List icon (green bg pill)
    "Copy action items"
    Body: "Formatted as a markdown checklist"
    "Copy as markdown" button (green outlined)
    Format:
      ## [Title] — Action Items
      Date: [date]
      
      - [ ] [task] — [owner] | Due: [deadline]
    On click: copy, toast "Copied!"

  View JSON card:
    Code icon (gray bg pill)
    "Export raw data"
    Body: "Complete extraction as JSON"
    "View JSON" button (gray outlined)
    Expands code block below (animated height)
    JetBrains Mono, syntax colored, copy button

Danger Zone:
  Divider + "Danger Zone" label (red, small)
  
  Red outlined card:
    "Delete this meeting"
    "This will permanently remove the meeting,
    transcript, and all extracted data."
    "Delete meeting" button (red outlined)

  Confirmation modal:
    Overlay: rgba(0,0,0,0.4)
    Modal: white, radius-XL, padding 32px, shadow-XL
    "Delete meeting?" H3
    Warning text
    Button row: "Cancel" (gray) | "Delete" (red solid)
    
    On confirm:
      DELETE /meetings/:id
      Toast: "Meeting deleted"
      Navigate to /meetings

---

## Page 7: Ask Trace (/ask)

### Layout

Sidebar (260px) + main content
On mobile: sidebar becomes bottom sheet

### Left Sidebar

bg: white
border-right: 1px #e8e8f0
padding: 24px

"Ask History" — label, gray, small caps

Session history list:
  Past questions this session
  Clickable: gray text, hover indigo bg pill
  Italic, 14px
  Max 10 shown, scroll

Divider

"Try asking" label

Suggestion chips (vertical list):
  "What are all open tasks?"
  "What decisions need follow-up?"
  "Who has the most action items?"
  "What blockers are unresolved?"
  "Summarize recent meetings"
  "What came up most across meetings?"

  Each chip:
    white, border, radius-full, padding 8px 14px
    14px, gray text
    hover: bg #eef2ff, text indigo, border #c7d2fe
    transition 0.15s
    On click: populate input + submit

### Main Content

Flex column, grows to fill

#### Empty State (before first query)

Centered vertically + horizontally
Sparkles icon (80px, indigo, subtle pulse anim)
H2: "Ask anything about your meetings"
Body: "Trace searches across everything you've
uploaded and answers in plain English."

2×2 grid of example cards:
  "What are all open action items?"
  "What decisions were made?"
  "What blockers are affecting the team?"
  "Who said what about [any topic]?"

  Cards: white, border, radius-MD, padding 20px
  14px, gray text
  hover: border indigo, text indigo, bg #f8f8ff
  transition 0.15s
  Click: populate input + submit

#### Results Area (after queries)

Scroll container, grows upward from input

Each exchange:

  Question bubble:
    Right side, max-width 70%
    bg: #eef2ff, border: 1px #c7d2fe
    radius: 16px 16px 4px 16px
    padding: 12px 16px
    Text: #4b4b63, 15px

  Answer card:
    Left aligned, full width
    white, border, radius-LG, padding 24px, shadow-SM

    Header row:
      Left: sparkle icon (16px, indigo) + "Trace"
            weight 600, #0f0f1a
      Right: confidence badge
        high:   green bg, "High confidence"
        medium: yellow bg, "Check sources"
        low:    gray bg, "Limited context"

    Answer body:
      Character-by-character typing animation
      15ms per character
      Support line breaks and numbered lists
      color: #0f0f1a, line-height 1.7

    Structured results (filter active):
      Cards instead of text answer
      action_item: green left border, task+owner+deadline
      decision: blue left border, decision+made_by
      blocker: red left border, blocker+affects

    Sources section (collapsible):
      "N sources" + chevron icon
      Default: collapsed
      Expanded: source chips
        [meeting title] [type] [score]
        small, gray, border, rounded

  Loading state:
    Left aligned card
    3 indigo bouncing dots
    "Trace is searching your meetings..."
    Dots animate: scale 0.8→1.2, stagger 0.15s

#### Query Input (fixed bottom of main area)

bg: white
border-top: 1px #e8e8f0
padding: 20px 24px

Main input row:
  Large input, full width
  placeholder: "Ask anything about your meetings..."
  left icon: sparkle (indigo)
  right: send button (indigo, arrow-right icon)
  focus: border indigo, glow

Filter row (below input):
  "Filter:" label (gray, 13px)
  Pills: All | Action Items | Decisions | Blockers
  Active: indigo solid
  Inactive: white, border
  Sets filter_type in query

Keyboard: Enter submits (Shift+Enter = newline)