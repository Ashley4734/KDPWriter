# Design Guidelines: Nonfiction Book Generation App

## Design Approach
**System-Based Approach** using Material Design principles for this productivity-focused application. The app prioritizes workflow efficiency, clear information hierarchy, and professional presentation suitable for content creators and authors.

## Core Design Elements

### Color Palette
**Light Mode:**
- Primary: 219 85% 35% (Deep blue for trust and professionalism)
- Surface: 220 15% 97% (Clean background)
- Text: 220 25% 15% (High contrast dark text)

**Dark Mode:**
- Primary: 219 85% 65% (Lighter blue for accessibility)
- Surface: 220 25% 8% (Dark surface)
- Text: 220 15% 85% (Light text)

**Accent Colors:**
- Success: 142 70% 45% (For completed sections)
- Warning: 38 95% 50% (For pending approvals)
- Error: 0 85% 60% (For validation issues)

### Typography
- **Primary Font:** Inter (via Google Fonts CDN)
- **Secondary Font:** JetBrains Mono (for code/technical content)
- **Hierarchy:** text-4xl, text-2xl, text-xl, text-lg, text-base, text-sm

### Layout System
**Spacing Units:** Consistent use of Tailwind units 2, 4, 6, 8, 12, 16
- Tight spacing: p-2, m-2 (buttons, form elements)
- Standard spacing: p-4, m-4, gap-4 (cards, sections)
- Generous spacing: p-8, m-8 (major sections, containers)

### Component Library

**Navigation:**
- Clean sidebar with collapsible sections
- Breadcrumb navigation for multi-step workflows
- Progress indicators for book generation stages

**Core Components:**
- **Book Cards:** Preview cards with title, genre, progress status
- **Outline Editor:** Expandable tree structure with drag-and-drop
- **Writing Interface:** Split-pane layout (outline left, content right)
- **Progress Dashboard:** Circular progress indicators and milestone tracking

**Data Displays:**
- **Word Count Meters:** Visual progress bars
- **Chapter Status Grid:** Card-based layout showing completion states
- **Export Preview:** Document-style preview with formatting

**Forms & Inputs:**
- Material Design influenced form fields
- Floating labels for book metadata
- Rich text editor for outline editing
- Auto-save indicators

**Overlays:**
- Modal dialogs for book idea generation
- Confirmation overlays for outline approval
- Loading states with progress feedback

### Visual Hierarchy
1. **Primary Actions:** Prominent CTAs for "Generate Book Idea," "Approve Outline," "Start Writing"
2. **Secondary Actions:** Edit, preview, and export functions
3. **Tertiary Actions:** Settings, help, and minor adjustments

### Content Structure
- **Dashboard View:** Overview of all projects with quick access
- **Book Creation Workflow:** Step-by-step guided process
- **Writing Interface:** Focused, distraction-free environment
- **Review Stages:** Clear approval workflows with revision tracking

### Animations
Minimal, purposeful animations:
- Smooth transitions between workflow stages
- Subtle loading indicators for AI generation
- Expand/collapse animations for outline sections

This design emphasizes productivity and professional workflow management while maintaining visual appeal appropriate for creative professionals in the publishing space.