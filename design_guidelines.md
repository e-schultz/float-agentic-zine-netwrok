# Design Guidelines for Agentic Zine Network

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern publishing platforms like Medium, Substack, and Notion, with emphasis on content creation and community engagement.

## Core Design Elements

### Color Palette
**Dark Mode Primary** (default):
- Background: 10 15% 8% (deep charcoal)
- Surface: 10 10% 12% (elevated panels)
- Primary: 260 85% 65% (vibrant purple for AI/tech theme)
- Text: 0 0% 95% (near white)
- Muted: 240 5% 65% (subtle gray)

**Light Mode**:
- Background: 0 0% 98% (clean white)
- Surface: 0 0% 100% (pure white cards)
- Primary: 260 85% 55% (deeper purple)
- Text: 0 0% 15% (dark gray)

### Typography
- **Primary**: Inter (Google Fonts) - clean, readable
- **Accent**: JetBrains Mono (code/technical elements)
- **Scale**: text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl

### Layout System
**Spacing Units**: Use Tailwind units of 2, 4, 6, 8, 12, 16 for consistent rhythm
- Tight spacing: p-2, m-2
- Standard: p-4, gap-4
- Generous: p-8, my-12
- Section breaks: py-16

### Component Library

**Navigation**:
- Clean header with logo, search, and profile
- Sidebar navigation for dashboard areas
- Breadcrumbs for deep navigation

**Content Components**:
- **Zine Cards**: Clean cards with cover images, titles, author info, and engagement metrics
- **Conversation Bubbles**: Chat-like interface for input conversations
- **Publication Preview**: Rich preview with formatting options
- **Agent Status Indicators**: Visual feedback for AI processing states

**Forms**:
- Floating labels for inputs
- Rich text editor for zine content
- File upload with drag-and-drop
- Multi-step wizards for zine creation

**Data Displays**:
- Analytics dashboard with clean charts
- Community feed with infinite scroll
- Search results with filters
- User profiles with publication history

## Key Features Design

### Dashboard
- **Layout**: Sidebar + main content area
- **Widgets**: Recent activity, popular zines, creation shortcuts
- **Quick Actions**: Prominent "Create New Zine" CTA

### Zine Creation Workflow
- **Step Indicator**: Visual progress through conversion process
- **Live Preview**: Side-by-side conversation input and formatted output
- **AI Processing**: Animated indicators showing agent work
- **Customization Panel**: Typography, layout, and style controls

### Community Features
- **Feed Layout**: Pinterest-style masonry grid for zine discovery
- **Social Elements**: Like, share, comment interactions
- **User Profiles**: Clean profile pages with published works

### Images
**Hero Section**: Large hero with gradient overlay (260 85% 65% to 280 70% 45%) showcasing sample zines
**Zine Covers**: Auto-generated or user-uploaded cover images for each publication
**Avatar System**: Consistent user profile images throughout
**Placeholder Graphics**: Abstract AI-themed illustrations for empty states

## Interaction Patterns
- **Hover States**: Subtle elevation and color shifts
- **Loading States**: Skeleton screens during AI processing
- **Micro-interactions**: Smooth transitions, button feedback
- **Responsive**: Mobile-first with clean tablet/desktop scaling

## Accessibility
- High contrast ratios in both modes
- Keyboard navigation support
- Screen reader optimized structure
- Focus indicators on all interactive elements

This design creates a sophisticated, AI-native publishing platform that feels both technical and creative, supporting the complex workflow of conversation-to-publication transformation while maintaining user engagement and community features.