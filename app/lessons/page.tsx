import { getLessonsWithDetails } from "@/actions/lesson-actions";
import { LessonsTable } from "./LessonsTable";

export default async function Page() {
  const { data: lessons, error } = await getLessonsWithDetails();

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lessons Overview</h1>
      <LessonsTable lessons={lessons || []} />
    </div>
  );
}



