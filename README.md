# Shift Roaster - PWA Management App

A modern, mobile-optimized Progressive Web App for managing shift schedules, roles, people, and leave requests with full authentication and cloud database.

## ✨ Features

### 🔐 Authentication & Security

- **User Authentication**: Secure email/password login and signup
- **Protected Routes**: All features require authentication
- **Session Management**: Automatic session handling via Supabase
- **Row Level Security**: Database-level security policies

### 📋 People Directory Management

- Create, edit, and view people entries
- Store name, phone, and designation information
- Assign multiple roles to each person
- Quickly search people by name, phone, or designation

### 👔 Role Management

- Create and manage roles/positions
- Multiple people can have the same role
- Organize your workforce structure

### 👥 Group Management

- Create groups of people for quick assignment
- Save time by adding entire groups to shifts
- Still support individual person selection

### 📅 Shift Planner

- Board view layout for intuitive planning
- Create shifts with date and time
- Assign roles to shifts
- Assign people to specific roles within shifts
- Nested view: Shifts → Roles → People

### 🏥 Leave Management

- Request leaves with date range and reason
- Approve/reject leave requests
- Automatic unavailability display in shift planning
- Filter by status (pending, approved, rejected)

### 📊 Dashboard

- Quick statistics overview
- Fast access to main features
- Project information

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Backend & Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Shadcn/ui style
- **Icons**: Lucide React
- **PWA**: Service Worker for offline support

## Getting Started

### Prerequisites

- Node.js 20.18.0+
- npm 11.0.0+
- A Supabase account (free tier works great)

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd ShiftRoaster
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key from Settings → API

4. **Configure environment variables**

````bash
# Cocontexts/           # React contexts
│   └── AuthContext.tsx # Authentication context and hooks
├── pages/              # Feature pages
│   ├── AuthPage.tsx    # Login/signup page
│   ├── DashboardPage.tsx
│   ├── PeoplePage.tsx
│   ├── RolesPage.tsx
│   ├── GroupsPage.tsx
│   ├── ShiftPlannerPage.tsx
│   └── LeavesPage.tsx
├── stores/             # Zustand state management
│   ├── personStore.ts
│   ├── roleStore.ts
│   ├── groupStore.ts
│   ├── shiftStore.ts
│   └── leaveStore.ts
├── hooks/              # Custom React hooks
│   └── useInitializeStores.ts
├── types/              # TypeScript type definitions
├── lib/                # Library functions
│   └── supabase.ts     # Supabase client configuration
├── utils/              # Utilit

```bash
npm run dev
````

7. **Create your first account**
   - Open the app at `http://localhost:5173`
   - Click "Sign Up"
   - Enter your email and password
   - Sign in and start using the app!

### Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run previewsecurely in Supabase (PostgreSQL):

- **Database Tables**:
  - `profiles` - People/staff members
  - `roles` - Job roles/positions
  - `person_roles` - Many-to-many relationship
  - `groups` - Groups of people
  - `group_members` - Group membership
  - `shifts` - Shift schedules
  - `shift_roles` - Roles within shifts
  - `shift_assignments` - Person assignments to shifts
  - `leaves` - Leave requests

- **Row Level Security**: All tables protected with authentication-based policies
- **Real-time Sync**: Data syncs across all devices
- **Reliable Backups**: Automatic backups via Supabase

## 🔒 Security

- **Authentication Required**: All users must sign in
- **Row Level Security (RLS)**: Database enforces access control
- **Secure Sessions**: JWT tokens managed by Supabase
- **HTTPS Only**: All data transmitted over secure connections
- **No Sensitive Data in Code**: API keys stored in environment variables

## Future Enhancements

- Role-based access control (admin vs regular users)
- Multi-tenant/organization support
- Export/import functionality
- Advanced reporting and analytics
- Email notifications for shift assignments
- SMS reminders
- Mobile app (React Native)
- Calendar integration
- Performance history and analytic
│   ├── GroupsPage.tsx
│   ├── ShiftPlannerPage.tsx
│   └── LeavesPage.tsx
├── stores/             # Zustand state management
│   ├── personStore.ts
│   ├── roleStore.ts
│   ├── groupStore.ts
│   ├── shiftStore.ts
│   └── leaveStore.ts
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── lib/                # Library functions
├── index.css           # Global styles
├── App.tsx             # Main app component
└── main.tsx            # React entry point
```

## Design System

The app uses a modern, simplistic design with:

- **Primary Color**: Blue (#3b82f6)
- **Clean Typography**: Hierarchical font sizes
- **Responsive Layout**: Mobile-first approach
- **Accessibility**: WCAG compliant components
- **Dark Mode Ready**: CSS variables for theming

## PWA Features

- **Offline Support**: Service Worker caches essential assets
- **Installable**: Add to home screen on mobile devices
- **App Manifest**: Configured with app metadata
- **Mobile Optimized**: Viewport configuration for mobile
- **Touch Interface**: Mobile-friendly buttons and inputs

## Data Persistence

All data is stored locally using browser LocalStorage:

- **People Data**: `person-store`
- **Roles Data**: `role-store`
- **Groups Data**: `group-store`
- **Shifts Data**: `shift-store`
- **Leaves Data**: `leave-store`

Data persists across sessions and works offline.

## Future Enhancements

- Cloud sync with backend API
- Export/import functionality
- Advanced reporting and analytics
- Multi-user support
- Role-based access control
- Performance history
- Notification system
- Mobile app notifications

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers supporting PWA

## License

ISC
