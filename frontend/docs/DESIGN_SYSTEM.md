# Trace — Design System

## Theme: Light Mode Only

Clean, professional, modern.
Inspired by Linear.app, Notion, Vercel dashboard.
Airy white surfaces. Indigo as the primary accent.

## Color Palette

```css
/* Backgrounds */
--bg-page:        #ffffff;
--bg-surface:     #f8f8fc;
--bg-elevated:    #f0f0f8;
--bg-overlay:     rgba(255,255,255,0.85);

/* Borders */
--border-light:   #e8e8f0;
--border-medium:  #d4d4e8;
--border-strong:  #b4b4d0;

/* Primary — Indigo */
--primary:        #6366f1;
--primary-dark:   #4f46e5;
--primary-light:  #eef2ff;
--primary-glow:   rgba(99,102,241,0.15);
--primary-border: #c7d2fe;

/* Text */
--text-primary:   #0f0f1a;
--text-secondary: #4b4b63;
--text-muted:     #9090a8;
--text-disabled:  #c0c0d8;

/* Semantic */
--success:        #16a34a;
--success-light:  #f0fdf4;
--success-border: #86efac;

--warning:        #d97706;
--warning-light:  #fffbeb;
--warning-border: #fcd34d;

--danger:         #dc2626;
--danger-light:   #fef2f2;
--danger-border:  #fca5a5;

--info:           #2563eb;
--info-light:     #eff6ff;
--info-border:    #93c5fd;

/* Type badge colors */
--onboarding-bg:  #eef2ff;
--onboarding-text:#6366f1;
--planning-bg:    #eff6ff;
--planning-text:  #2563eb;
--review-bg:      #f0fdf4;
--review-text:    #16a34a;
--standup-bg:     #fffbeb;
--standup-text:   #d97706;
--discussion-bg:  #f8f8fc;
--discussion-text:#4b4b63;
```

## Typography

Font family: Inter (load from Google Fonts)
Mono font: JetBrains Mono (for code blocks)
Display:   72px / weight 800 / tracking -0.04em
H1:        48px / weight 800 / tracking -0.03em
H2:        36px / weight 700 / tracking -0.02em
H3:        24px / weight 700 / tracking -0.01em
H4:        18px / weight 600
Body LG:   18px / weight 400 / line-height 1.7
Body:      16px / weight 400 / line-height 1.6
Body SM:   14px / weight 400 / line-height 1.5
Label:     12px / weight 600 / tracking 0.06em / uppercase
Code:      14px / JetBrains Mono

## Spacing Scale

4px base unit.
4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120px

## Border Radius
XS:    6px   (badges, small chips)
SM:    8px   (buttons, inputs)
MD:    12px  (small cards)
LG:    16px  (cards)
XL:    20px  (large cards)
2XL:   24px  (modals, hero elements)
Full:  9999px (pills, avatars)

## Shadows
XS:  0 1px 2px rgba(0,0,0,0.05)
SM:  0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px #e8e8f0
MD:  0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px #e8e8f0
LG:  0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px #e8e8f0
XL:  0 20px 60px rgba(0,0,0,0.12)
Primary: 0 4px 20px rgba(99,102,241,0.25)
Hero:    0 40px 80px rgba(99,102,241,0.15)

## Components

### Button
Primary:
bg: #6366f1
text: white
hover: #4f46e5 + shadow-primary
active: scale(0.98)
padding: 12px 24px
radius: 10px
font-weight: 600
Secondary:
bg: white
text: #4b4b63
border: 1px #d4d4e8
hover: border #6366f1, text #6366f1
padding: 12px 24px
radius: 10px
Ghost:
bg: transparent
text: #4b4b63
hover: bg #f0f0f8
padding: 8px 16px
Danger:
bg: white
text: #dc2626
border: 1px #fca5a5
hover: bg #fef2f2, border #dc2626
Sizes:
SM: padding 8px 16px, font 14px
MD: padding 12px 24px, font 15px (default)
LG: padding 16px 32px, font 16px
XL: padding 18px 40px, font 18px

### Input
bg: white
border: 1px #d4d4e8
radius: 10px
padding: 12px 16px
font-size: 15px
color: #0f0f1a
placeholder: #9090a8
focus:
border: 1px #6366f1
box-shadow: 0 0 0 3px rgba(99,102,241,0.12)
outline: none
error:
border: 1px #dc2626
box-shadow: 0 0 0 3px rgba(220,38,38,0.10)

### Card
bg: white
border: 1px #e8e8f0
radius: 16px
padding: 24px
shadow: SM
hover (interactive cards):
border: 1px #c7d2fe
shadow: 0 8px 24px rgba(99,102,241,0.10)
transform: translateY(-2px)
transition: all 0.2s ease

### Badge / Pill
padding: 4px 10px
radius: 9999px
font-size: 12px
font-weight: 600
variants:
indigo: bg #eef2ff, text #6366f1, border #c7d2fe
green:  bg #f0fdf4, text #16a34a, border #86efac
blue:   bg #eff6ff, text #2563eb, border #93c5fd
orange: bg #fffbeb, text #d97706, border #fcd34d
red:    bg #fef2f2, text #dc2626, border #fca5a5
gray:   bg #f8f8fc, text #4b4b63, border #d4d4e8

### Speaker Avatar
Size: 32px (SM), 40px (MD), 48px (LG)
Shape: circle
Font: 12px (SM), 14px (MD), 16px (LG), weight 700
Show: first 2 initials of name
Colors (deterministic — hash name to pick one):
[indigo]  bg #eef2ff, text #6366f1
[teal]    bg #f0fdfa, text #0d9488
[orange]  bg #fff7ed, text #ea580c
[purple]  bg #faf5ff, text #9333ea
[green]   bg #f0fdf4, text #16a34a
[pink]    bg #fdf2f8, text #db2777
[amber]   bg #fffbeb, text #d97706
[cyan]    bg #ecfeff, text #0891b2
IMPORTANT: Hash the speaker name string to an index.
Same name always maps to same color.
Never use random.

### Skeleton Loader
bg: linear-gradient(90deg, #f0f0f8 25%, #e8e8f4 50%, #f0f0f8 75%)
background-size: 200% 100%
animation: shimmer 1.5s infinite
radius: matches the element it replaces

## Animation Principles

Use Framer Motion for all animations.
Page enter:
initial: { opacity: 0, y: 16 }
animate: { opacity: 1, y: 0 }
duration: 0.35s, ease: [0.25, 0.46, 0.45, 0.94]
Stagger children:
delayChildren: 0.05s
staggerChildren: 0.04s
Card hover:
whileHover: { y: -4, transition: { duration: 0.15 } }
Scale press:
whileTap: { scale: 0.97 }
Fade in on scroll:
use Intersection Observer
initial: { opacity: 0, y: 24 }
inView: { opacity: 1, y: 0 }
Number count-up:
duration: 1.5s, ease: easeOut
from 0 to final value
Modal:
initial: { opacity: 0, scale: 0.95 }
animate: { opacity: 1, scale: 1 }
duration: 0.2s
Toast:
slide in from top-right
auto dismiss 4s

## Navbar (App)
height: 64px
bg: white
border-bottom: 1px #e8e8f0
backdrop-filter: blur(12px)
position: sticky top-0
z-index: 50
Left: Logo (icon + "Trace" text)
Center: nav links (Dashboard | Meetings | Ask Trace)
Right: user avatar circle + dropdown
Active nav link:
color: #6366f1
weight: 600
dot below: 3px circle, #6366f1
User dropdown:
name + email
divider
Sign out option

## Footer (Landing only)
bg: white
border-top: 1px #e8e8f0
padding: 48px
Left: logo + tagline
Right: "Built with local AI · Your data never leaves"
Bottom center: copyright