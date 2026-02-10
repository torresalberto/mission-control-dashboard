# Simple Activity Feed Plan

**Problem:** Current complex Activity feed with SQLite dependency failing on Vercel
**Solution:** Static file-based activity with Director/agent visibility

## Implementation Steps

1. **Remove SQLite dependency** - Use static JSON files instead
2. **Simple generation** - Node script to generate static activity JSON
3. **Director/agent display** - Show both clearly in feed
4. **10-second refresh** - Client-side polling without rate limits
5. **Vercel deployment** - Test on platform without file system issues

## Architecture

- `/public/activity.json` - Static generated feed
- `/src/app/activity/page.tsx` - Simple client page
- `/src/app/api/activity/route.ts` - Fallback route
- `/scripts/generate-activity.js` - Static generator script

## Content Format

```json
{
  "timestamp": "2026-02-09T22:30:00Z",
  "activities": [
    {
      "id": "director_init_001",
      "type": "director",
      "agent": "Director", 
      "action": "Task delegation started",
      "description": "Breaking 'Email marketing' into 3 agent tasks",
      "timestamp": "22:29:15",
      "status": "running"
    },
    {
      "id": "k25_analysis_001", 
      "type": "agent",
      "agent": "K2.5-Think",
      "action": "Strategy analysis",
      "description": "Analyzing email marketing approach",
      "timestamp": "22:29:20",
      "status": "completed"
    }
  ]
}
```