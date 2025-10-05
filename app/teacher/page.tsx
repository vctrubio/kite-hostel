import { getTeachers } from "@/actions/teacher-actions";
import Link from "next/link";
import { HeadsetIcon } from "@/svgs/HeadsetIcon";
import { ArrowRight } from "lucide-react";

export default async function TeacherPage() {
    const { data: teachers } = await getTeachers();

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-3xl space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Teacher Portal
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Select a teacher to view their portal
                    </p>
                </div>

                {/* Teachers List */}
                <div className="space-y-2">
                    {teachers.map((teacher) => (
                        <Link
                            key={teacher.id}
                            href={`/teacher/${teacher.id}`}
                            className="group flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <HeadsetIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    {teacher.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>View Portal</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {teachers.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No teachers found
                    </div>
                )}
            </div>
        </div>
    );
}
