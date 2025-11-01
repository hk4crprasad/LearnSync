# 🎨 YouTube Courses - Visual Design Guide

## Color Palette

### Primary Gradients
```
Header:     from-red-600 via-pink-600 to-purple-600
AI Search:  from-purple-600 to-pink-600
Stats Card: from-purple-500 to-purple-600
Level Card: from-blue-500 to-blue-600
Keywords:   from-green-500 to-green-600
Mode Card:  from-orange-500 to-orange-600
```

### Action Colors
- **Like (Red)**: `bg-red-500 hover:bg-red-600`
- **Save (Blue)**: `bg-blue-500 hover:bg-blue-600`
- **Primary**: `bg-primary hover:bg-primary/90`
- **Share (Ghost)**: `variant="ghost"`

## Component Hierarchy

```
YouTubeCourses
├── Header Section (Gradient Background)
│   ├── Left: Title & Description
│   │   └── Icon + "Video Learning Hub"
│   └── Right: Gamification Stats Grid (2x2)
│       ├── Videos Watched (Trophy)
│       ├── Search Streak (Flame)
│       ├── Saved Videos (Bookmark)
│       └── Liked Videos (Heart)
│
├── Quick Stats Banner (4 Cards)
│   ├── Videos Found (Zap)
│   ├── Learning Level (Target)
│   ├── AI Keywords (Award)
│   └── Search Mode (Sparkles)
│
├── Search Card
│   ├── Header with Icon
│   ├── Tabs (AI / Manual)
│   ├── Quick Topic Suggestions
│   ├── Search Input with Icon
│   ├── Learning Level Dropdown
│   ├── Action Buttons (Gradient)
│   └── AI Keywords Display (if generated)
│
└── Results Section
    ├── Loading State (Skeleton Cards)
    ├── Results Header
    └── Video Cards Grid
        └── Each Card:
            ├── Thumbnail (Hover Overlay)
            │   ├── Play Button Overlay
            │   ├── Duration Badge
            │   └── Action Buttons (Save, Like)
            ├── Card Header
            │   ├── Title (2 lines)
            │   └── Channel
            ├── Card Content
            │   ├── Description (2 lines)
            │   ├── Stats Row (Views, Likes, Share)
            │   └── Action Buttons (Watch, Channel)
```

## Interactive States

### Video Card States
1. **Default**: Border-2, normal shadow
2. **Hover**: 
   - Scale up slightly (`hover:-translate-y-1`)
   - Border becomes primary color
   - Shadow increases to 2xl
   - Play button appears
   - Action buttons fade in
3. **Saved**: Blue bookmark icon (filled)
4. **Liked**: Red heart icon (filled)

### Button States
```typescript
// AI Search Button
default:  "gradient purple-pink, shadow-lg"
hover:    "darker gradient, shadow-xl, scale-105"
disabled: "opacity-50, cursor-not-allowed"
loading:  "spinner animation"

// Save Button
default:  "white/90, bookmark outline"
hover:    "white background"
saved:    "blue-500, bookmark filled"

// Like Button  
default:  "white/90, heart outline"
hover:    "white background"
liked:    "red-500, heart filled"
```

## Animations

### Entrance Animations
```css
/* Video Cards */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
animation: fadeInUp 0.5s ease-out forwards;
animationDelay: ${index * 0.1}s; /* Staggered */

/* Confetti */
- Main: bounce animation
- Stars: ping animation with delays
- Trophy: bounce animation
```

### Hover Animations
```css
/* Card Hover */
transition: all 300ms
transform: translateY(-4px)
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1)

/* Thumbnail Hover */
transform: scale(1.05)
transition: transform 300ms

/* Button Hover */
transform: scale(1.05)
transition: all 300ms
```

### Loading Animation
```css
/* Skeleton Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## Typography

### Headings
```
H1 (Page Title): text-3xl sm:text-4xl font-bold
H2 (Section): text-2xl font-bold
H3 (Card Title): text-xl font-semibold
Card Title: text-base line-clamp-2
```

### Body Text
```
Description: text-lg text-white/90
Card Description: text-sm text-muted-foreground line-clamp-2
Stats: text-xs text-muted-foreground
```

### Special Text
```
Gradient Text: bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent
Badges: text-xs font-semibold
Tooltips: text-xs text-white/60
```

## Spacing

### Container
```
container mx-auto px-4 py-8
```

### Grid Gaps
```
Stats Grid: gap-4
Video Grid: gap-6
Form Elements: gap-2
Card Sections: space-y-4
```

### Padding
```
Card Header: default
Card Content: pt-6
Buttons: px-3 py-1 (small), default (medium), size="lg"
```

## Icons

### Icon Sizes
```
Small: h-3 w-3 (stats, inline)
Medium: h-4 w-4 (buttons)
Large: h-6 w-6 (section headers)
XL: h-8 w-8 (stats cards)
XXL: h-12 w-12 (play overlay)
Hero: h-16 w-16 (empty state)
```

### Icon Placement
```
Button: mr-2 (before text)
Badge: mr-1 (before text)
Stats: inline with text
```

## Responsive Breakpoints

### Grid Layouts
```
Quick Stats: 
  mobile: 2 cols
  md: 4 cols

Video Cards:
  mobile: 1 col
  md: 2 cols  
  lg: 3 cols

Search Buttons:
  mobile: stacked
  md: 2 cols
```

### Header
```
mobile: stacked
md: grid-cols-2 (title left, stats right)
```

## Accessibility Features

### Focus States
- All interactive elements have visible focus rings
- Keyboard navigation supported
- Tab order follows visual hierarchy

### Color Contrast
- Text meets WCAG AA standards
- Interactive elements have sufficient contrast
- Hover states clearly visible

### Screen Readers
- Semantic HTML structure
- Alt text on all images
- ARIA labels where needed
- Meaningful button text

## Best Practices Used

1. **Progressive Enhancement**: Works without JavaScript for basic functionality
2. **Mobile First**: Designed for mobile, enhanced for desktop
3. **Performance**: Optimized animations, lazy loading
4. **User Feedback**: Loading states, success messages, error handling
5. **Consistency**: Same patterns throughout
6. **Accessibility**: Keyboard, screen readers, color contrast
7. **Modern CSS**: Tailwind utilities, custom properties
8. **Component Reuse**: shadcn/ui components

## Emojis Used

### Functional
- 🔍 Search
- 🤖 AI
- ✨ Keywords
- 🎯 Target/Goal
- 🏆 Achievement
- 🔥 Streak
- ⚡ Quick/Fast
- 📚 Learning
- 🚀 Start/Launch

### Celebratory
- 🎉 Confetti
- ⭐ Star
- 💎 Premium
- ❤️ Like
- 🔖 Save
- 📋 Copy
- 🎪 Fun

### Status
- ✅ Success
- ⏳ Loading
- 📊 Stats
- 📈 Growth

---

**Design Philosophy**: Make learning fun, engaging, and rewarding through gamification and beautiful UI!
