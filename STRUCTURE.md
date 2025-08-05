# Project Structure

This document outlines the directory structure of the project in a tree format.

```
/
├─── actions/ # Contains server-side functions for making API calls to the database using Drizzle ORM.
├─── app/ # Defines the application's routes and pages, following Next.js App Router conventions.
├─── whiteboard/ # Core application feature for admins to manage daily kite lessons and events. (INSIDE THE APP DIR/ROUTE)
├─── components/
│    ├─── cards/ # Components for displaying entity information in a card format.
│    ├─── forms/ # Form components used for creating and editing entities.
│    ├─── formatters/ # Components to format data for display (e.g., dates, durations).
│    ├─── pickers/ # Date and time picker components.
│    ├─── supabase-init/ # UI components related to Supabase authentication.
│    ├─── ui/ # Generic, low-level UI elements (Button, Card, etc.).
│    └─── users/ # Components specifically for user information and management.
├─── drizzle/ # Holds Drizzle ORM configuration, schema, and migration files.
├─── lib/ # Utility functions and library configurations, including Supabase clients.
├─── provider/ # React Context providers for managing global state (e.g., UserWalletProvider).
├─── public/ # Static assets like images and logos that are served directly.
├─── seed/ # Components and forms for seeding the database with test data during development.
└─── svgs/ # SVG icons used throughout the application.
```

## Entity Page Architecture

Each primary entity (e.g., Students, Teachers, Bookings) follows a consistent architectural pattern.

- **Data Flow**: Data is fetched on the server and passed to a client-side page component.
- **Filtering**: The page component provides filtering options (e.g., by month, last 3 months, last 6 months, all).
- **Stats Bar**: Each entity page uses the `@components/StatsBar.tsx` component, which updates based on the selected filter.
- **Table Structure**: Each entity page has a dedicated `...Table.tsx` and `...Row.tsx` component to display data.
- **Add New Form**: A form for creating a new entity is included, with its visibility toggled via a `useState` and `useEffect` hook.
- **Master Dashboard (kPlanned)**: All entity pages will inherit from a common `MasterDashboard` component to ensure a consistent layout and shared logic.

### Conventions

- **`components/tables`**: This convention is for components that define the headers and columns for data tables.
- **`components/rows`**: This is for components that render the individual rows of data within the tables.
- **`components/links`**: This is for UI components like dropdowns that trigger API interactions.
