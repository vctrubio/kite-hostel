"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateStudent, getStudentById, deleteStudent, softDeleteStudent, restoreStudent } from "@/actions/student-actions";
import { toast } from "sonner";
import { DateSince } from "@/components/formatters/DateSince";
import { ENTITY_DATA, LANGUAGES_ENUM_VALUES } from "@/lib/constants";
import { BookingLessonEventCard } from "@/components/cards/BookingLessonEventCard";
import { Search, ArrowUpDown, Eye, EyeOff, Trash2, ChevronDown, Ghost } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StudentDetailsProps {
  student: any;
  availableLanguages: string[];
}

// Sub-component for the header section
function StudentHeader({
  student,
  editMode,
  onEditToggle,
  onSave,
  onCancel,
  studentEntity,
  onDeleteStudent,
  onSoftDeleteStudent,
  onRestoreStudent
}: {
  student: any;
  editMode: boolean;
  onEditToggle: () => void;
  onSave: () => void;
  onCancel: () => void;
  studentEntity: any;
  onDeleteStudent: () => void;
  onSoftDeleteStudent: () => void;
  onRestoreStudent: () => void;
}) {
  const StudentIcon = studentEntity?.icon;

  return (
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
            <Button onClick={onSave} size="sm" className={`${studentEntity?.bgColor} hover:opacity-90`}>Save</Button>
            <Button variant="outline" onClick={onCancel} size="sm">Cancel</Button>
          </>
        ) : (
          <>
            <Button
              onClick={onEditToggle}
              variant="outline"
              size="sm"
              className={`border-2 ${studentEntity?.color?.replace('text-', 'border-')} hover:${studentEntity?.hoverColor ? `bg-[${studentEntity.hoverColor}]` : 'bg-gray-50'}`}
            >
              Edit
            </Button>
            
            {/* Delete/Restore Student Dropdown */}
            {student.deleted_at ? (
              // If soft deleted, show red ghost icon (no dropdown - just visual indicator)
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 cursor-default"
                onClick={onRestoreStudent}
              >
                <Ghost className="h-4 w-4" />
              </Button>
            ) : (
              // If not soft deleted, show delete options
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2 border-gray-300 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/20 px-2"
                  >
                    {(!student.bookings || student.bookings.length === 0) ? (
                      <Trash2 className="h-4 w-4" />
                    ) : (
                      <Ghost className="h-4 w-4" />
                    )}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  {(!student.bookings || student.bookings.length === 0) ? (
                    <DropdownMenuItem
                      onClick={onDeleteStudent}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 p-3"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          <span className="font-medium">Delete Student</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Are you sure you want to delete <strong>{student.name}</strong>? This action is irreversible.
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={onSoftDeleteStudent}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 p-3"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Ghost className="h-4 w-4" />
                          <span className="font-medium">Soft Delete Student</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          You are about to soft delete <strong>{student.name}</strong>. Their data will be present but you won't be able to access it through the app.
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Sub-component for form fields
function StudentFormFields({
  student,
  formData,
  editMode,
  onChange
}: {
  student: any;
  formData: any;
  editMode: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) {
  const handleLanguageChange = (language: string, isChecked: boolean) => {
    const event = {
      target: {
        name: 'languages',
        value: isChecked
          ? [...formData.languages, language]
          : formData.languages.filter((lang: string) => lang !== language)
      }
    } as any;
    onChange(event);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">First Name</Label>
          {editMode ? (
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={onChange}
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
              onChange={onChange}
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
                  onChange={(e) => handleLanguageChange(lang, e.target.checked)}
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
            onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
  );
}

// Sub-component for booking controls
function BookingControls({
  hasBookings,
  teacherSearch,
  onSearchChange,
  sortOrder,
  onSortToggle,
  compactView,
  onCompactToggle
}: {
  hasBookings: boolean;
  teacherSearch: string;
  onSearchChange: (value: string) => void;
  sortOrder: 'desc' | 'asc';
  onSortToggle: () => void;
  compactView: boolean;
  onCompactToggle: () => void;
}) {
  if (!hasBookings) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by teacher name..."
          value={teacherSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onSortToggle}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <ArrowUpDown className="w-4 h-4" />
        {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onCompactToggle}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        {compactView ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        {compactView ? 'Expand' : 'Compact'}
      </Button>
    </div>
  );
}

// Sub-component for booking list
function BookingList({
  bookings,
  hasBookings,
  compactView
}: {
  bookings: any[];
  hasBookings: boolean;
  compactView: boolean;
}) {
  if (bookings.length > 0) {
    return (
      <>
        {bookings.map((booking: any) => (
          <BookingLessonEventCard
            key={booking.id}
            booking={booking}
            compact={compactView}
          />
        ))}
      </>
    );
  }

  if (hasBookings) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">No Results</h2>
        <p className="text-gray-600 dark:text-gray-400">No bookings found matching your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Booking Information</h2>
      <p className="text-gray-600 dark:text-gray-400">No bookings found for this student.</p>
    </div>
  );
}

export function StudentDetails({ student: initialStudent }: StudentDetailsProps) {
  const [student, setStudent] = useState(initialStudent);
  const [editMode, setEditMode] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [compactView, setCompactView] = useState(false);
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
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleDeleteStudent = async () => {
    const result = await deleteStudent(student.id);
    if (result.success) {
      toast.success("Student deleted successfully!");
      // Redirect to students list
      router.push('/students');
    } else {
      toast.error(result.error || "Failed to delete student");
    }
  };

  const handleSoftDeleteStudent = async () => {
    const result = await softDeleteStudent(student.id);
    if (result.success) {
      toast.success("Student soft deleted successfully!");
      // Refresh student data to show soft deleted state
      const { data: updatedStudent } = await getStudentById(student.id);
      if (updatedStudent) {
        setStudent(updatedStudent);
      }
    } else {
      toast.error(result.error || "Failed to soft delete student");
    }
  };

  const handleRestoreStudent = async () => {
    const result = await restoreStudent(student.id);
    if (result.success) {
      toast.success("Student restored successfully!");
      // Refresh student data to show restored state
      const { data: updatedStudent } = await getStudentById(student.id);
      if (updatedStudent) {
        setStudent(updatedStudent);
      }
    } else {
      toast.error(result.error || "Failed to restore student");
    }
  };

  // Filtered and sorted bookings
  const filteredAndSortedBookings = useMemo(() => {
    if (!student.bookings || student.bookings.length === 0) return [];

    const filtered = student.bookings.filter((booking: any) => {
      if (!teacherSearch.trim()) return true;
      return booking.lessons?.some((lesson: any) =>
        lesson.teacher?.name?.toLowerCase().includes(teacherSearch.toLowerCase())
      );
    });

    filtered.sort((a: any, b: any) => {
      const dateA = new Date(a.date_start).getTime();
      const dateB = new Date(b.date_start).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [student.bookings, teacherSearch, sortOrder]);

  if (!student) {
    return <div>Student not found.</div>;
  }

  const studentEntity = ENTITY_DATA.find(entity => entity.name === "Student");
  const hasBookings = student.bookings && student.bookings.length > 0;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Student Details */}
        <div className="space-y-6">
          <StudentHeader
            student={student}
            editMode={editMode}
            onEditToggle={() => setEditMode(true)}
            onSave={handleSave}
            onCancel={handleCancel}
            studentEntity={studentEntity}
            onDeleteStudent={handleDeleteStudent}
            onSoftDeleteStudent={handleSoftDeleteStudent}
            onRestoreStudent={handleRestoreStudent}
          />

          <StudentFormFields
            student={student}
            formData={formData}
            editMode={editMode}
            onChange={handleChange}
          />
        </div>

        {/* Right Column - Booking Information */}
        <div className="space-y-6">
          <BookingControls
            hasBookings={hasBookings}
            teacherSearch={teacherSearch}
            onSearchChange={setTeacherSearch}
            sortOrder={sortOrder}
            onSortToggle={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            compactView={compactView}
            onCompactToggle={() => setCompactView(!compactView)}
          />

          <BookingList
            bookings={filteredAndSortedBookings}
            hasBookings={hasBookings}
            compactView={compactView}
          />
        </div>
      </div>
    </div>
  );
}
