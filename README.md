# Meeting Room Booking System

Internal meeting room booking system built with React, TypeScript, and Material-UI.

## Assumptions & Trade-offs

### Assumptions
1. **Employees are pre-defined**: All employees are loaded from `employees.json` and cannot be created/edited through the UI.
2. **Rooms are pre-defined**: Rooms are loaded from `rooms.json` and cannot be created/edited through the UI.
3. **Business hours**: 8:00 AM - 8:00 PM (12 hours) for calendar views.
4. **Minimum booking duration**: 15 minutes.
5. **Maximum booking duration**: 8 hours.
6. **Maximum attendees**: 20 people per meeting.
7. **Only upcoming bookings can be edited/cancelled**: Past bookings are read-only.
8. **Single timezone**: All times are in local timezone.

### Trade-offs
1. **localStorage vs IndexedDB**: Used localStorage for simplicity, but it has a 5-10MB limit. For production with many bookings, IndexedDB would be better.
2. **No authentication**: Since this is an internal tool with no backend, authentication is skipped.
3. **Simple conflict resolution**: Overlapping bookings are detected but not automatically resolved.
4. **Date-fns vs Luxon**: Used date-fns for better tree-shaking and smaller bundle size.
5. **Zustand vs Redux**: Used Zustand for simpler API and less boilerplate.

### Future Improvements
- Add real-time updates with WebSockets
- Add email notifications for bookings
- Add recurring meetings support
- Add room equipment reservation
- Add calendar export (iCal/Google Calendar)
- Add dark mode support
- Add keyboard shortcuts

## Tech Stack
- React 18
- TypeScript
- Material-UI (MUI) v5
- Zustand (State Management)
- date-fns (Date utilities)
- React Router v6
- Vite (Build tool)

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test