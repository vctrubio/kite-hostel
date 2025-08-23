import TeacherPortal from "@/components/TeacherPortal";
import { getTeacherPortalById } from "@/actions/teacher-actions";
import { notFound } from "next/navigation";

export default async function TeacherIdPage({ params }: { params: { id: string } }) {
    const { data: teacher, error } = await getTeacherPortalById(params.id);
    
    if (error || !teacher) {
        notFound();
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-3xl">
                <TeacherPortal teacherData={teacher} />
            </div>
        </div>
    );
}