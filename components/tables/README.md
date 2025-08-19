# Entity Tables Components

This directory contains reusable components for creating consistent entity table layouts.

## Components

### EntityLayout
A complete layout wrapper that includes header, stats, search, and month filter.

### EntityHeader  
Displays entity name with icon and stats row.

### EntityControls
Search bar and month picker controls.

## Usage Example

```tsx
// In your entity table component (e.g., StudentsTable.tsx)
import { EntityLayout } from "@/components/tables/EntityLayout";

export function StudentsTable({ initialStudents }: StudentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Your existing logic...
  
  const stats = [
    { description: "Total Students", value: totalStudents },
    { description: "Local Students", value: localStudents },
    { description: "Foreign Students", value: foreignStudents }
  ];

  return (
    <EntityLayout
      stats={stats}
      searchPlaceholder="Search students..."
      onSearchChange={setSearchTerm}
      onMonthChange={setSelectedMonth}
      selectedMonth={selectedMonth}
    >
      {/* Your existing table content */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {/* Your table content */}
        </table>
      </div>
    </EntityLayout>
  );
}
```

## Features

- **Auto-detection**: EntityHeader automatically detects entity info from pathname
- **Custom override**: All props are optional, allowing custom values
- **Responsive**: Mobile-friendly layout
- **Consistent styling**: Matches app theme and design system
- **Search & Filter**: Built-in search and month filtering controls