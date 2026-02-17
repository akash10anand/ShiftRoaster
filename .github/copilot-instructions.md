# Shift Roaster PWA - Project Guidelines

## Project Overview

Shift Roaster is a modern Progressive Web App (PWA) for managing shift schedules, roles, people, and leave requests. Built with React, TypeScript, and Vite.

## Tech Stack

- React 19 with TypeScript
- Vite as build tool
- Zustand for state management
- Tailwind CSS for styling
- Lucide React for icons

## Code Organization

### Naming Conventions

- **Components**: PascalCase (e.g., `PeoplePage.tsx`, `Button.tsx`)
- **Functions**: camelCase (e.g., `handleSubmit`, `calculateDates`)
- **Variables**: camelCase (e.g., `personId`, `filteredList`)
- **Store hooks**: `use[Entity]Store` (e.g., `usePersonStore`)

### File Structure

- `/src/components/`: Reusable UI components
- `/src/components/ui/`: Base UI components (Button, Card, Input, etc.)
- `/src/pages/`: Page components (one per feature area)
- `/src/stores/`: Zustand store definitions
- `/src/types/`: TypeScript type definitions
- `/src/utils/`: Utility functions
- `/src/lib/`: Library functions

## Type Definitions

All domain models are defined in `src/types/index.ts`:

- `Person`: Individual staff member with roles
- `Role`: Position/job title
- `Group`: Collection of people
- `Shift`: Scheduled work period
- `ShiftRole`: Role assignment within a shift
- `Leave`: Leave request

## State Management with Zustand

Each entity has its own store following this pattern:

```typescript
const useEntityStore = create<EntityStore>()(
  persist(
    (set, get) => ({
      // State
      entities: [],
      // Actions
      addEntity: (entity) => {
        /* ... */
      },
      updateEntity: (id, data) => {
        /* ... */
      },
      deleteEntity: (id) => {
        /* ... */
      },
    }),
    { name: "entity-store" },
  ),
);
```

Stores use Zustand's persist middleware for automatic localStorage persistence.

## Component Guidelines

### UI Components

Base components in `src/components/ui/` should:

- Use TypeScript interfaces for props
- Support className prop for customization
- Use Tailwind CSS classes
- Follow shadcn/ui conventions
- Use utility function `cn()` for class merging

### Page Components

Page components in `src/pages/` should:

- Be named `[Feature]Page.tsx`
- Export as named React function component
- Use React hooks for state management
- Import and use stores directly
- Organize with clear sections (form, filter, list, etc.)

## Styling

- Use Tailwind CSS utilities
- CSS variables defined in `src/index.css` for theming
- Support both light and dark modes through CSS variables
- Responsive design: mobile-first approach
- Use utility classes: `grid`, `flex`, `space-y-`, etc.

## Development Workflow

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run lint
```

## Common Tasks

### Adding New Feature

1. Create store in `src/stores/[feature]Store.ts`
2. Add types to `src/types/index.ts`
3. Create page in `src/pages/[Feature]Page.tsx`
4. Add navigation item in `src/components/Navigation.tsx`
5. Update App.tsx to render the page

### Adding New Component

1. Create in `src/components/` or `src/components/ui/`
2. Export as named component
3. Use TypeScript interfaces for props
4. Example:

```typescript
interface MyComponentProps {
  label: string;
  onClick: () => void;
}

export function MyComponent({ label, onClick }: MyComponentProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

### Modifying Store

Always update both:

1. Type interface
2. Store implementation
3. Ensure persist middleware is configured

## Best Practices

- Keep components focused and single-responsibility
- Use composition over inheritance
- Leverage Zustand hooks in components
- Implement proper error handling
- Add form validation where needed
- Use semantic HTML
- Make mobile-first designs
- Test keyboard navigation
- Ensure accessibility

## PWA Features

- Service Worker registered in `App.tsx`
- manifest.json configured in `public/`
- Meta tags for mobile in `index.html`
- localStorage for data persistence

## Important Notes

- All data stored locally in browser
- No backend API currently (can be added)
- Works offline with Service Worker
- Mobile-optimized with touch-friendly UI
- Responsive design adapts to all screen sizes
