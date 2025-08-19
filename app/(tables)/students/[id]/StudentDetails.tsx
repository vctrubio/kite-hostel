"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateStudent } from "@/actions/student-actions";
import { toast } from "sonner";

interface StudentDetailsProps {
  student: any;
  availableLanguages: string[];
}

export function StudentDetails({ student: initialStudent, availableLanguages }: StudentDetailsProps) {
  const [student, setStudent] = useState(initialStudent);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: initialStudent.name,
    languages: initialStudent.languages,
    passport_number: initialStudent.passport_number,
    country: initialStudent.country,
    phone: initialStudent.phone,
    size: initialStudent.size,
    desc: initialStudent.desc,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const result = await updateStudent(student.id, formData);
    if (result.success) {
      setStudent(result.student);
      setEditMode(false);
      toast.success("Student updated successfully!");
    } else {
      toast.error(result.error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: student.name,
      languages: student.languages,
      passport_number: student.passport_number,
      country: student.country,
      phone: student.phone,
      size: student.size,
      desc: student.desc,
    });
    setEditMode(false);
  };

  if (!student) {
    return <div>Student not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{student.name}</h1>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-lg mb-1">Name:</p>
            {editMode ? (
              <Input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full" />
            ) : (
              <p className="text-base">{student.name}</p>
            )}
          </div>
          <div>
            <p className="font-semibold">Languages:</p>
            {editMode ? (
              <div className="flex flex-wrap gap-2">
                {availableLanguages.map((lang) => (
                  <div key={lang} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={lang}
                      name="languages"
                      value={lang}
                      checked={formData.languages.includes(lang)}
                      onChange={(e) => {
                        const { value, checked } = e.target;
                        setFormData((prev) => ({
                          ...prev,
                          languages: checked
                            ? [...prev.languages, value]
                            : prev.languages.filter((l: string) => l !== value),
                        }));
                      }}
                      className="h-4 w-4 border-gray-300 rounded"
                    />
                    <label htmlFor={lang} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {lang}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p>{student.languages.join(", ")}</p>
            )}
          </div>
          <div>
            <p className="font-semibold text-lg mb-1">Passport Number:</p>
            {editMode ? (
              <Input type="text" name="passport_number" value={formData.passport_number || ''} onChange={handleChange} className="w-full" />
            ) : (
              <p className="text-base">{student.passport_number || 'N/A'}</p>
            )}
          </div>
          <div>
            <p className="font-semibold text-lg mb-1">Country:</p>
            {editMode ? (
              <Input type="text" name="country" value={formData.country || ''} onChange={handleChange} className="w-full" />
            ) : (
              <p className="text-base">{student.country || 'N/A'}</p>
            )}
          </div>
          <div>
            <p className="font-semibold text-lg mb-1">Phone:</p>
            {editMode ? (
              <Input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full" />
            ) : (
              <p className="text-base">{student.phone || 'N/A'}</p>
            )}
          </div>
          <div>
            <p className="font-semibold">Size:</p>
            {editMode ? (
              <Input type="text" name="size" value={formData.size || ''} onChange={handleChange} />
            ) : (
              <p>{student.size || 'N/A'}</p>
            )}
          </div>
          <div>
            <p className="font-semibold">Description:</p>
            {editMode ? (
              <textarea name="desc" value={formData.desc || ''} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            ) : (
              <p>{student.desc || 'N/A'}</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex space-x-2">
          {editMode ? (
            <>
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>Edit</Button>
          )}
        </div>
      </div>
    </div>
  );
}
