# Design Guidelines: AI-Driven Personalized Learning Platform

## Design Approach

**Selected Framework:** Material Design with educational focus

**Rationale:** This platform requires a balance of professional credibility for teachers/administrators and engaging, accessible interfaces for students. Material Design's established patterns for dashboards, cards, and data visualization align perfectly with the information-dense nature of learning analytics while maintaining a modern, approachable aesthetic.

**Core Principles:**
- **Clarity First:** Information hierarchy optimized for quick comprehension of learning progress
- **Encouraging Engagement:** Visual feedback celebrates achievements without distraction
- - **Dashboard Efficiency:** Dense information layouts without overwhelming users
- **Accessibility:** High contrast, clear typography, touch-friendly for varied devices

---

## Typography System

**Font Families:**
- **Primary:** Inter (via Google Fonts) - for UI elements, body text, data tables
- **Display:** Poppins (via Google Fonts) - for headings, hero sections, gamification elements

**Type Scale:**
- Hero/Landing: text-5xl to text-6xl (Poppins, font-semibold)
- Page Titles: text-3xl to text-4xl (Poppins, font-semibold)
- Section Headers: text-2xl (Poppins, font-medium)
- Card Titles: text-lg to text-xl (Poppins, font-medium)
- Body Text: text-base (Inter, font-normal)
- Secondary/Meta: text-sm (Inter, font-normal)
- Captions/Labels: text-xs (Inter, font-medium)

**Line Heights:** Use generous line spacing for readability - leading-relaxed for body text, leading-tight for headings

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Component padding: p-4 to p-6
- Section spacing: py-12 to py-16
- Card gaps: gap-4 to gap-6
- Icon-text spacing: gap-2 to gap-3

**Grid Patterns:**
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Course listings: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Analytics panels: grid-cols-1 lg:grid-cols-2 for side-by-side comparisons
- Mobile: Always stack to single column

**Container Strategy:**
- App container: max-w-7xl mx-auto px-4 to px-6
- Dashboard sections: Full-width with internal max-width constraints
- Content areas: max-w-4xl for optimal reading
- Chat interface: max-w-3xl for focused conversation

---

## Component Library

### Navigation
**Primary Navigation (Teachers/Students):**
- Persistent sidebar (lg screens): w-64, vertical navigation with icon + label
- Mobile: Collapsible hamburger menu with overlay
- Top bar: User profile, notifications, quick actions
- Breadcrumbs for deep navigation paths

**Student Dashboard Quick Actions:**
- Continue Learning card (prominent)
- Upcoming assessments
- Achievement highlights
- AI Chatbot access button (floating action button style)

### Course & Content Cards
**Course Card Structure:**
- Aspect ratio 16:9 thumbnail area
- Course title (text-lg, font-medium)
- Progress bar with percentage
- Metadata: Instructor, duration, difficulty level (text-sm)
- Elevation shadow on hover
- Consistent padding: p-4 to p-6

**Lesson Cards:**
- Simpler layout than course cards
- Completion checkmark indicator
- Lock icon for unavailable lessons
- Estimated time and lesson type icon

### Assessment Interface
**Quiz/Test Layout:**
- Question container with clear numbering
- Option cards with radio/checkbox, generous touch targets (min-h-12)
- Progress indicator at top
- Submit/Next buttons with clear hierarchy
- Timer display (if applicable) in fixed position

**Results Display:**
- Score prominently shown (large text-4xl to text-5xl)
- Breakdown by topic/category (horizontal bar charts)
- AI feedback section with distinct styling
- Retry/Continue buttons with clear CTAs

### Analytics Dashboards

**Student Dashboard:**
- Hero stats row: Courses completed, Current streak, Points earned (grid-cols-3)
- Large progress chart (line or area chart for learning over time)
- Weak areas identification cards
- Recent activity timeline
- Recommended next topics

**Teacher Dashboard:**
- Class overview metrics (grid-cols-2 lg:grid-cols-4)
- Student performance table with sortable columns
- Class average vs individual comparison charts
- At-risk students alerts section
- Assignment submission tracking

**Chart Components:**
- Use consistent chart library (Chart.js or Recharts)
- Generous padding around charts: p-6
- Clear axis labels and legends
- Tooltips on hover for detailed data

### Gamification Elements
**Badges/Achievements:**
- Circular or shield-shaped containers (w-16 to w-24)
- Icon-first design with label below
- Locked state: reduced opacity, lock overlay
- Achievement modal: Celebratory full-screen overlay with animation

**Leaderboard:**
- Compact table or card list
- User ranking, avatar, name, points
- Highlight current user row
- Top 3 get distinct visual treatment (medals/icons)

**Points Display:**
- Prominent counter in navigation
- Animation on point gain
- Breakdown modal showing point sources

### AI Chatbot Interface
**Chat Window:**
- Fixed height with scrollable message area
- Message bubbles: User (aligned right), AI (aligned left)
- Input field with send button (sticky bottom)
- Suggested questions as chips/buttons
- Typing indicator for AI responses
- Clear button to start new conversation

**Message Styling:**
- Max-width for readability (max-w-prose)
- Rounded corners (rounded-2xl)
- Generous padding: px-4 py-3
- Timestamp below messages (text-xs)

### Forms & Inputs
**Form Layouts:**
- Single column on mobile, two-column on desktop for related fields
- Labels above inputs (text-sm, font-medium)
- Input fields: min-h-12, px-4, rounded-lg, focus state with border change
- Error messages below field (text-sm)
- Helper text in muted style

**Action Buttons:**
- Primary: px-6 py-3, rounded-lg, font-medium
- Secondary: Same size but different visual treatment
- Icon buttons: Square aspect ratio, p-3
- Floating action button (for chatbot): Fixed bottom-right, w-14 h-14, rounded-full

### Notification System
- Toast notifications: Top-right corner, slide-in animation
- Badge indicators on notification bell
- Notification panel: Slide-out from top-right
- Each notification: Icon, message, timestamp, action button

---

## Page-Specific Layouts

### Landing Page (Public)
**Hero Section:**
- Full viewport height (min-h-screen)
- Two-column layout (lg): Left - headline, subheading, CTAs; Right - Hero image or illustration
- Headline: text-5xl to text-6xl
- Two CTAs: Primary "Get Started", Secondary "Learn More"
- Social proof indicators: Trusted by X students, Y courses, Z teachers

**Feature Sections:**
- Alternating two-column layouts
- Feature icon + title + description
- Supporting illustration or screenshot for each feature
- Spacing between sections: py-16 to py-24

**Testimonials:**
- Three-column grid on desktop (grid-cols-1 md:grid-cols-3)
- Quote, student name, school/role, avatar

**CTA Section:**
- Centered content, max-w-3xl
- Compelling headline + description
- Single prominent CTA button
- Background treatment to distinguish from other sections

**Footer:**
- Multi-column layout: Platform links, Resources, Support, Social media
- Newsletter signup form
- Copyright and legal links

### Student Dashboard
**Layout Structure:**
- Sidebar navigation (hidden on mobile)
- Main content area with top bar
- Greeting section: Welcome back [Name], current streak, quick stats
- Continue Learning section (1-2 cards)
- Upcoming Assessments timeline
- Progress charts section
- Recommended courses/topics grid

### Course Detail Page
**Header Section:**
- Course banner image (aspect-16/9)
- Course title, instructor, rating, enrollment count
- Enroll/Continue button (sticky on scroll)

**Content Tabs:**
- Overview, Curriculum, Instructor, Reviews
- Tab content with generous spacing

**Curriculum Section:**
- Accordion-style module list
- Each module: Title, lesson count, duration
- Lessons within expandable with completion status

### Assessment Taking Page
**Focused Layout:**
- Minimal distractions, no sidebar
- Question-centric design with large touch targets
- Progress bar at top (sticky)
- Navigation: Previous, Next, Submit buttons at bottom
- Question palette sidebar (optional, toggleable)

---

## Special Considerations

**Accessibility:**
- Minimum touch target: 44x44px for all interactive elements
- Keyboard navigation support for all features
- ARIA labels for charts and complex components
- Clear focus indicators

**Performance for Rural Connectivity:**
- Lightweight components, minimal heavy animations
- Progressive image loading with placeholders
- Skeleton screens for loading states
- Offline indicators when connection drops

**Icons:**
Use Heroicons via CDN for consistency throughout the application

---

## Images

**Landing Page:**
- Large hero image: Modern classroom or students learning with technology, placed on the right side of hero section (aspect-video or aspect-square), optimized for web

**Dashboard:**
- Empty state illustrations: Friendly, encouraging graphics when no courses/data available
- Achievement badges: Custom designed or use icon library styled as badges

**Course Cards:**
- Course thumbnails: Subject-relevant imagery (science equipment, books, technology), consistent aspect ratio (16:9)