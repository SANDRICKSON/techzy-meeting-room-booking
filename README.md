# Meeting Room Booking System

> Internal web application for managing meeting room bookings within a company

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178c6)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646cff)
![MUI](https://img.shields.io/badge/MUI-5.15.4-007fff)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Design](#api-design)
- [Assumptions & Trade-offs](#assumptions--trade-offs)
- [Future Improvements](#future-improvements)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [License](#license)

---

## 🎯 Overview

This is a complete front-end application for managing internal meeting room bookings. Built as a take-home assignment for Front-End Developer candidates, it demonstrates clean architecture, TypeScript best practices, and modern React development.

### Key Features

- 📊 **Dashboard** - Real-time overview of rooms and bookings
- 🏠 **Room Management** - Browse, search, and filter meeting rooms
- 📅 **Calendar View** - Daily and weekly schedule with availability
- 📝 **Booking Management** - Create, edit, view, and cancel bookings
- 🔍 **Search & Filter** - Powerful filtering across all views
- 💾 **Data Persistence** - All changes saved to localStorage
- 📱 **Responsive** - Works on all screen sizes
- 🔗 **URL State** - Shareable links with state preservation

---

## ✨ Features

### Dashboard
- Statistics cards (total rooms, available, today's bookings, total bookings)
- Today's schedule overview
- Upcoming bookings list
- Quick stats section

### Rooms
- Grid view of all meeting rooms
- Room details: name, building, floor, capacity, equipment
- Search by name or building
- Filter by building, equipment, and minimum capacity
- Quick "Book Room" action

### Calendar
- **Day View** - Hour-by-hour schedule
- **Week View** - 7-day overview with time slots
- Visual overlap detection
- Current time indicator
- Navigation (prev/next/today)
- Click booking to view details
- URL state persistence (`?view=week&date=2026-08-28`)

### Bookings
- **Create Booking** - Step-by-step form with:
    - Basic info (title, room, organizer)
    - Time & attendees with availability check
    - Review and confirm
- **View Details** - Full booking information modal
- **Edit** - Only upcoming bookings can be edited
- **Cancel** - With confirmation dialog
- **Search & Filter** - By title, status, room, employee

---

## 🛠️ Tech Stack

### Core

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| TypeScript | 5.2.2 | Type Safety |
| Vite | 5.0.8 | Build Tool |

### UI & Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| Material-UI | 5.15.4 | Component Library |
| MUI Icons | 5.15.4 | Icons |
| MUI X Date Pickers | 6.19.0 | Date/Time Pickers |
| Emotion | 11.11.3 | CSS-in-JS |

### State & Data

| Technology | Version | Purpose |
|------------|---------|---------|
| Zustand | 4.4.7 | State Management |
| React Router | 6.21.1 | Routing |
| date-fns | 2.30.0 | Date Utilities |
| UUID | 9.0.1 | ID Generation |
| Lodash | 4.18.1 | Utility Functions |

---

## 🏗️ Architecture

### Clean Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │   Pages    │  │Components  │  │  Stores    │          │
│  └────────────┘  └────────────┘  └────────────┘          │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                     DOMAIN LAYER                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │  Entities  │  │  Services  │  │   Hooks    │          │
│  └────────────┘  └────────────┘  └────────────┘          │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      DATA LAYER                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │Repository  │  │    JSON    │  │localStorage│          │
│  └────────────┘  └────────────┘  └────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Repository Pattern** - Abstracts data source (JSON/localStorage → future API)
2. **Service Layer** - Contains business logic (validation, availability checks)
3. **Zustand Stores** - Simple, type-safe state management
4. **Component Composition** - Reusable, testable components
5. **Type Safety** - Full TypeScript coverage

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/meeting-room-booking.git
cd meeting-room-booking

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check
```

### Environment Variables

No environment variables required. All data is stored in localStorage.

---

## 📁 Project Structure

```
src/
├── api/                           # Data Layer
│   ├── repository.ts              # Base repository
│   ├── bookingRepository.ts
│   ├── employeeRepository.ts
│   └── roomRepository.ts
│
├── domain/                        # Domain Layer
│   ├── entities/                  # Business entities
│   │   ├── Booking.ts
│   │   ├── Employee.ts
│   │   └── Room.ts
│   └── services/                  # Business logic
│       ├── bookingService.ts
│       └── roomService.ts
│
├── stores/                        # State Management
│   ├── bookingStore.ts
│   ├── employeeStore.ts
│   └── roomStore.ts
│
├── components/                    # UI Components
│   ├── common/                    # Shared components
│   │   ├── Layout.tsx
│   │   ├── Navigation.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── LoadingSpinner.tsx
│   ├── bookings/                  # Booking components
│   │   ├── BookingForm.tsx
│   │   ├── BookingList.tsx
│   │   ├── BookingDetails.tsx
│   │   └── BookingFilters.tsx
│   ├── calendar/                  # Calendar components
│   │   ├── CalendarView.tsx
│   │   ├── DayView.tsx
│   │   └── WeekView.tsx
│   ├── dashboard/                 # Dashboard components
│   │   ├── Dashboard.tsx
│   │   ├── StatsCard.tsx
│   │   └── UpcomingBookings.tsx
│   └── rooms/                     # Room components
│       └── RoomsList.tsx
│
├── pages/                         # Page Components
│   ├── DashboardPages.tsx
│   ├── RoomsPage.tsx
│   ├── CalendarPage.tsx
│   └── BookingsPage.tsx
│
├── hooks/                         # Custom Hooks
│   ├── useCalendar.ts
│   └── useFilters.ts
│
├── data/                          # Initial Data
│   ├── bookings.json
│   ├── employees.json
│   └── rooms.json
│
├── App.tsx                        # Main App Component
├── main.tsx                       # Entry Point
├── index.css                      # Global Styles
└── vite-env.d.ts                  # TypeScript Definitions
```

---

## 🔌 API Design

### Repository Interface

```typescript
interface Repository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### Service Examples

```typescript
// Booking Service
class BookingService {
  async checkAvailability(
    roomId: string,
    start: Date,
    end: Date
  ): Promise<{ available: boolean; conflicts?: Booking[] }>

  async validateBooking(data: Partial<Booking>): Promise<string[]>

  async createBooking(data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Booking>

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking>

  async cancelBooking(id: string): Promise<void>
}

// Room Service
class RoomService {
  async getAvailableRooms(): Promise<Room[]>

  async filterRooms(filters: RoomFilters): Promise<Room[]>

  async getUniqueBuildings(): Promise<string[]>

  async getUniqueEquipment(): Promise<string[]>
}
```

### Store API

```typescript
// Booking Store
const {
  bookings,
  loading,
  filters,
  fetchBookings,
  createBooking,
  updateBooking,
  cancelBooking,
  setFilters,
  getFilteredBookings,
  getBookingsForRoom
} = useBookingStore();

// Room Store
const {
  rooms,
  filters,
  buildings,
  equipment,
  fetchRooms,
  setFilters,
  getFilteredRooms,
  getRoom,
  loadMetadata
} = useRoomStore();
```

---

## 📝 Assumptions & Trade-offs

### Assumptions

1. **Employees are pre-defined** - All employees are loaded from `employees.json`
2. **Rooms are pre-defined** - Rooms are loaded from `rooms.json`
3. **Business hours** - 8:00 AM - 8:00 PM (12 hours)
4. **Minimum booking duration** - 15 minutes
5. **Maximum booking duration** - 8 hours
6. **Maximum attendees** - 20 people per meeting
7. **Only upcoming bookings can be edited/cancelled**
8. **Single timezone** - All times are in local timezone

### Trade-offs

1. **localStorage vs IndexedDB** - Chose localStorage for simplicity (5-10MB limit)
2. **No authentication** - Internal tool with no backend
3. **Simple conflict resolution** - Overlaps detected but not auto-resolved
4. **date-fns vs Luxon** - Better tree-shaking and smaller bundle
5. **Zustand vs Redux** - Simpler API, less boilerplate

---

## 🚀 Future Improvements

### Short Term

- [ ] Add recurring meetings support
- [ ] Add room equipment reservation
- [ ] Add email notifications
- [ ] Add dark mode
- [ ] Add keyboard shortcuts

### Long Term

- [ ] Real-time updates with WebSockets
- [ ] Backend integration (PostgreSQL + REST API)
- [ ] Authentication & Authorization
- [ ] Calendar export (iCal/Google Calendar)
- [ ] Video conferencing integration (Zoom/Teams)
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Reporting & export (CSV/PDF)

---

## 🌐 Deployment

### Deployed on Vercel

**Production URL:** [https://meeting-room-booking.vercel.app](https://meeting-room-booking.vercel.app)

### Deploy Your Own

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Or connect to GitHub for auto-deploy
# 1. Push code to GitHub
# 2. Import project to Vercel
# 3. Auto-deploy on every push
```

---

## 📸 Screenshots

### Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Dashboard                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐             │
│  │ Rooms  │  │Avail.  │  │ Today  │  │ Total  │             │
│  │   8    │  │   5    │  │   3    │  │  10    │             │
│  └────────┘  └────────┘  └────────┘  └────────┘             │
│                                                                 │
│  Today's Schedule                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 📌 10:00 - Weekly Engineering Sync                      │  │
│  │ 📌 14:00 - Product Roadmap Planning                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Rooms Page

```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 Meeting Rooms                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🔍 Search  │ 🏢 Building │ ⚙️ Equipment │ ↑ Capacity  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │ Board Room │  │  Team A    │  │ Innovation │             │
│  │ Cap: 20    │  │  Cap: 8    │  │  Cap: 15   │             │
│  │ [Book]     │  │  [Book]    │  │  [Book]    │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### Calendar View

```
┌─────────────────────────────────────────────────────────────────┐
│  📅 Calendar - August 2026                                    │
│  [Day] [Week]  ◄  [Today]  ►                                 │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐               │
│  │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │               │
│  │ 24  │ 25  │ 26  │ 27  │ 28  │ 29  │ 30  │               │
│  │ ██  │     │     │ ██  │ ██  │     │     │               │
│  │ ██  │     │     │ ██  │ ██  │     │     │               │
│  └─────┴─────┴─────┴─────┴─────┴─────┴─────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Material-UI for the amazing component library
- Zustand for simple state management
- Vercel for easy deployment

---

## 📞 Contact

- **Author:** [Your Name]
- **Email:** [your.email@example.com]
- **GitHub:** [@your-username](https://github.com/your-username)
- **LinkedIn:** [Your Profile](https://linkedin.com/in/your-profile)

---

## 🔗 Links

- **Live Demo:** [https://meeting-room-booking.vercel.app](https://meeting-room-booking.vercel.app)
- **Repository:** [https://github.com/your-username/meeting-room-booking](https://github.com/your-username/meeting-room-booking)

---

**Built with ❤️ using React + TypeScript + Vite + MUI**