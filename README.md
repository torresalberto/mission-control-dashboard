# Mission Control Dashboard

A sophisticated frontend interface for monitoring OpenClaw agent activities, built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Real-time activity feed** with auto-refresh every 10 seconds
- **Weekly calendar view** with color-coded events
- **Smart search** across memories, documents, and tasks
- **Dark theme** matching NexAgua brand colors (navy #0A2540, orange #FF6B35)
- **Responsive layouts** with intuitive navigation

## Getting Started

```bash
# Navigate to the directory
cd mission-control

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Pages

- **`/`** → Redirects to `/activity`
- **`/activity`** → Real-time activity feed with filtering
- **`/calendar`** → Weekly schedule with color-coded events
- **`/search`** → Unified search across all agent activities

## Color Schema

- **Navy**: `#0A2540` (primary background)
- **Orange**: `#FF6B35` (accent color / NexAgua tasks)
- **Blue**: `#3b82f6` (system events)
- **Green**: `#22c55e` (success events)

## Components

- `Sidebar.tsx` → Navigation with activity/status indicators
- `ActivityCard.tsx` → Individual activity entries with status icons
- `CalendarGrid.tsx` → Interactive weekly calendar
- `SearchResult.tsx` → Highlighted search results with metadata
- `Header.tsx` → Page headers with context actions

## Data Integration Notes

The components are ready for data integration. Simply:

1. Replace mock data with real API calls
2. Update the websocket connection for real-time updates
3. Configure search endpoints for live searching

## Technology Stack

- **Frontend**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS + custom configuration
- **Icons**: Lucide React
- **Build**: SWC (Rust compiler)
- **Deployment**: Fully configured for production
