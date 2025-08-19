import Link from "next/link";

const tableRoutes = [
  { href: "/students", label: "Students", description: "Manage student records and profiles" },
  { href: "/teachers", label: "Teachers", description: "View and manage teacher information" },
  { href: "/packages", label: "Packages", description: "Configure lesson packages and pricing" },
  { href: "/bookings", label: "Bookings", description: "Track booking status and details" },
  { href: "/lessons", label: "Lessons", description: "Manage lesson scheduling and status" },
  { href: "/events", label: "Events", description: "View scheduled kite events" },
  { href: "/kites", label: "Kites", description: "Equipment management and tracking" },
  { href: "/references", label: "References", description: "Referenced bookings and notes" },
  { href: "/payments", label: "Payments", description: "Payment tracking and management" },
];

export default function TablesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Data Tables</h1>
      <p className="text-muted-foreground mb-8">
        Access and manage all system data through these table views.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tableRoutes.map(({ href, label, description }) => (
          <Link
            key={href}
            href={href}
            className="block p-6 border rounded-lg hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{label}</h2>
            <p className="text-muted-foreground text-sm">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}