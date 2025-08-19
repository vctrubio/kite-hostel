"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateTeacher } from "@/actions/teacher-actions";
import { CommissionForm } from "@/components/forms/CommissionForm";
import { getTeacherById } from "@/actions/teacher-actions";

interface TeacherDetailsProps {
  teacher: any;
}

const LANGUAGES = ["Spanish", "French", "English", "German", "Italian"];

export function TeacherDetails({ teacher: initialTeacher }: TeacherDetailsProps) {
  const [teacher, setTeacher] = useState(initialTeacher);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: initialTeacher.name,
    languages: initialTeacher.languages || [],
    passport_number: initialTeacher.passport_number || "",
    country: initialTeacher.country || "",
    phone: initialTeacher.phone || "",
  });
  const router = useRouter();

  useEffect(() => {
    setTeacher(initialTeacher);
    setFormData({
      name: initialTeacher.name,
      languages: initialTeacher.languages.join(", "),
      passport_number: initialTeacher.passport_number || "",
      country: initialTeacher.country || "",
      phone: initialTeacher.phone || "",
    });
  }, [initialTeacher]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLanguageChange = (language: string, isChecked: boolean) => {
    setFormData((prev) => {
      const currentLanguages = Array.isArray(prev.languages) ? prev.languages : [];
      if (isChecked) {
        return { ...prev, languages: [...currentLanguages, language] };
      } else {
        return { ...prev, languages: currentLanguages.filter((lang) => lang !== language) };
      }
    });
  };

  const handleSave = async () => {
    const updatedFields = {
      name: formData.name,
      languages: formData.languages,
      passport_number: formData.passport_number || null,
      country: formData.country || null,
      phone: formData.phone || null,
    };

    const result = await updateTeacher(teacher.id, updatedFields);

    if (result.success) {
      toast.success("Teacher updated successfully!");
      setEditMode(false);
      // Revalidate data by refreshing the router
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update teacher.");
    }
  };

  const handleCommissionCreated = async (commissionId: string) => {
    // Re-fetch teacher data to get the updated commissions
    const { data: updatedTeacher, error } = await getTeacherById(teacher.id);
    if (updatedTeacher) {
      setTeacher(updatedTeacher);
      toast.success("Commission added and teacher data updated!");
    } else if (error) {
      toast.error(`Failed to refresh teacher data: ${error}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Teacher Details: {teacher.name}</h1>
        <Button onClick={() => setEditMode(!editMode)}>
          {editMode ? "Cancel" : "Edit Details"}
        </Button>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>
        <div>
          <Label htmlFor="languages">Languages</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <div key={lang} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`lang-${lang}`}
                  checked={formData.languages.includes(lang)}
                  onChange={(e) => handleLanguageChange(lang, e.target.checked)}
                  disabled={!editMode}
                  className="form-checkbox"
                />
                <Label htmlFor={`lang-${lang}`}>{lang}</Label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="passport_number">Passport Number</Label>
          <Input
            id="passport_number"
            value={formData.passport_number}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>

        {editMode && (
          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        )}

        <h2 className="text-xl font-bold mt-6 mb-4">Commissions</h2>
        {teacher.commissions.length > 0 ? (
          <ul className="space-y-2">
            {teacher.commissions.map((commission) => (
              <li key={commission.id} className="border p-3 rounded-md">
                <p>Rate: €{commission.price_per_hour.toFixed(0)}/h</p>
                {commission.desc && <p>Description: {commission.desc}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p>No commissions found for this teacher.</p>
        )}

        <CommissionForm teacherId={teacher.id} onCommissionCreated={handleCommissionCreated} />

        <h2 className="text-xl font-bold mt-6 mb-4">Associated User Wallet</h2>
        {teacher.user_wallet ? (
          <Link href={`/users/${teacher.user_wallet.id}`} passHref>
            <div 
              className={`border p-3 rounded-md space-y-1 ${teacher.user_wallet.sk_email ? 'cursor-pointer hover:bg-gray-50' : ''}`}
            >
              <p><span className="font-semibold">Role:</span> {teacher.user_wallet.role}</p>
              {teacher.user_wallet.sk_email && <p><span className="font-semibold">Email:</span> {teacher.user_wallet.sk_email}</p>}
              {teacher.user_wallet.sk_full_name && <p><span className="font-semibold">Full Name:</span> {teacher.user_wallet.sk_full_name}</p>}
              {teacher.user_wallet.note && <p><span className="font-semibold">Note:</span> {teacher.user_wallet.note}</p>}
            </div>
          </Link>
        ) : (
          <p>No associated user wallet found.</p>
        )}

        <h2 className="text-xl font-bold mt-6 mb-4">Kites</h2>
        {teacher.kites && teacher.kites.length > 0 ? (
          <ul className="space-y-2">
            {teacher.kites.map((teacherKite: any) => (
              <li key={teacherKite.id} className="border p-3 rounded-md">
                <p>Model: {teacherKite.kite.model}, Size: {teacherKite.kite.size}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No kites found for this teacher.</p>
        )}

        <h2 className="text-xl font-bold mt-6 mb-4">Lessons</h2>
        {teacher.lessons && teacher.lessons.length > 0 ? (
          <ul className="space-y-2">
            {teacher.lessons.map((lesson: any) => (
              <li key={lesson.id} className="border p-3 rounded-md">
                <p>Booking ID: {lesson.booking_id}</p>
                <p>Commission ID: {lesson.commission_id}</p>
                <p>Status: {lesson.status}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No lessons found for this teacher.</p>
        )}
      </div>
    </div>
  );
}
