import { Lesson4EventTable } from "@/components/forms/Lesson4EventTable";
import { getLessonsWithDetails } from "@/actions/lesson-actions";

export default async function EventFormPage() {
  const { data: lessons, error } = await getLessonsWithDetails();

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Failed to load lessons: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <Lesson4EventTable lessons={lessons || []} />
    </div>
  );
}