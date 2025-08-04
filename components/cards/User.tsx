
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";

interface UserCardProps {
  id: string;
  role: "admin" | "teacher" | "teacherAdmin" | "locked" | "reference";
  teacher_name?: string | null;
  sk_full_name?: string | null;
  sk_email?: string | null;
  note?: string | null;
}

export function UserCard({ id, role, teacher_name, sk_full_name, sk_email, note }: UserCardProps) {
  let roleColorClass = "";
  switch (role) {
    case "admin":
      roleColorClass = "text-orange-500";
      break;
    case "teacher":
      roleColorClass = "text-blue-500";
      break;
    case "teacherAdmin":
      roleColorClass = "text-blue-700";
      break;
    case "reference":
      roleColorClass = "text-orange-700";
      break;
    case "locked":
      roleColorClass = "text-red-500";
      break;
    default:
      roleColorClass = "";
  }

  return (
    <div className="p-4 border rounded-md shadow-sm flex justify-between items-center">
      <div>
        <div className="flex items-center space-x-2">
          <span className={`font-bold ${roleColorClass}`}>{role}</span>
          {teacher_name && (
            <span className="text-gray-700">- {teacher_name}</span>
          )}
        </div>
        {sk_full_name && sk_email && (
          <p className="text-sm text-gray-500 mt-1">{sk_full_name}: {sk_email}</p>
        )}
        {!sk_full_name && sk_email && (
          <p className="text-sm text-gray-500 mt-1">Email: {sk_email}</p>
        )}
        {note && (
          <p className="text-sm text-gray-500 mt-1">Note: {note}</p>
        )}
      </div>
      <Link href={`/users/${id}`}>
        <Button variant="ghost" size="icon">
          <PencilIcon className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
