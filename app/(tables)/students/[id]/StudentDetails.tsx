"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateStudent } from "@/actions/student-actions";
import { toast } from "sonner";
import { DateSince } from "@/components/formatters/DateSince";
import { ENTITY_DATA, LANGUAGES_ENUM_VALUES } from "@/lib/constants";

interface StudentDetailsProps {
  student: any;
  availableLanguages: string[];
}

export function StudentDetails({ student: initialStudent, availableLanguages }: StudentDetailsProps) {
  const [student, setStudent] = useState(initialStudent);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: initialStudent.name,
    last_name: initialStudent.last_name,
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
      last_name: student.last_name,
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

  const studentEntity = ENTITY_DATA.find(entity => entity.name === "Student");
  const StudentIcon = studentEntity?.icon;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Student Details */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 pb-6 border-b">
            {StudentIcon && (
              <div className="p-3 rounded-lg">
                <StudentIcon className={`w-8 h-8 ${studentEntity?.color}`} />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {student.name} {student.last_name || ''}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Created</span>
                <DateSince dateString={student.created_at} />
              </div>
            </div>
            <div className="flex gap-2">
              {editMode ? (
                <>
                  <Button onClick={handleSave} size="sm" className={`${studentEntity?.bgColor} hover:opacity-90`}>Save</Button>
                  <Button variant="outline" onClick={handleCancel} size="sm">Cancel</Button>
                </>
              ) : (
                <Button 
                  onClick={() => setEditMode(true)} 
                  variant="outline" 
                  size="sm"
                  className={`border-2 ${studentEntity?.color?.replace('text-', 'border-')} hover:${studentEntity?.hoverColor ? `bg-[${studentEntity.hoverColor}]` : 'bg-gray-50'}`}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">First Name</Label>
                {editMode ? (
                  <Input 
                    id="name"
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                  />
                ) : (
                  <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                    {student.name}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                {editMode ? (
                  <Input 
                    id="last_name"
                    name="last_name" 
                    value={formData.last_name || ''} 
                    onChange={handleChange} 
                  />
                ) : (
                  <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                    {student.last_name || 'N/A'}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Languages</Label>
              {editMode ? (
                <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                  {LANGUAGES_ENUM_VALUES.map((lang) => (
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
                      <Label htmlFor={lang} className="text-sm">
                        {lang}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                  {student.languages.join(", ")}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="passport_number">Passport Number</Label>
              {editMode ? (
                <Input 
                  id="passport_number"
                  name="passport_number" 
                  value={formData.passport_number || ''} 
                  onChange={handleChange} 
                />
              ) : (
                <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                  {student.passport_number || 'N/A'}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                {editMode ? (
                  <Input 
                    id="country"
                    name="country" 
                    value={formData.country || ''} 
                    onChange={handleChange} 
                  />
                ) : (
                  <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                    {student.country || 'N/A'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                {editMode ? (
                  <Input 
                    id="phone"
                    name="phone" 
                    value={formData.phone || ''} 
                    onChange={handleChange} 
                  />
                ) : (
                  <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                    {student.phone || 'N/A'}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              {editMode ? (
                <Input 
                  id="size"
                  name="size" 
                  value={formData.size || ''} 
                  onChange={handleChange} 
                />
              ) : (
                <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                  {student.size || 'N/A'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              {editMode ? (
                <textarea 
                  id="desc"
                  name="desc" 
                  value={formData.desc || ''} 
                  onChange={handleChange} 
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              ) : (
                <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border min-h-[76px]">
                  {student.desc || 'N/A'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Related Entities Placeholder */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Related Information</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Bookings - Coming soon</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Lessons - Coming soon</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Events - Coming soon</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Packages - Coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
