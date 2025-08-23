import { getTeachers } from "@/actions/teacher-actions";
import Link from "next/link";

export default async function TeacherPage() {
    const { data: teachers } = await getTeachers();

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-3xl">
                <h1 className="text-2xl font-bold mb-6">Teacher Portal</h1>
                <div className="grid gap-4">
                    {teachers.map((teacher) => (
                        <Link
                            key={teacher.id}
                            href={`/teacher/${teacher.id}`}
                            className="block p-4 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-medium">{teacher.name}</h2>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    View Portal →
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                Languages: {teacher.languages.join(", ")}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
