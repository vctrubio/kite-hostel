import { getKitesWithEvents } from "@/actions/kite-actions";
import { KitesTable } from "./KitesTable";
import { getTeachers } from "@/actions/teacher-actions";

export default async function KitesPage() {
  const { data: initialKites, error: kitesError } = await getKitesWithEvents();
  const { data: teachers, error: teachersError } = await getTeachers();

  if (kitesError) {
    return <div className="container mx-auto p-4">Error loading kites: {kitesError}</div>;
  }

  if (teachersError) {
    return <div className="container mx-auto p-4">Error loading teachers: {teachersError}</div>;
  }

  return <KitesTable initialKites={initialKites || []} teachers={teachers || []} />;
}