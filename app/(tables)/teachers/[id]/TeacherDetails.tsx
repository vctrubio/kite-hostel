"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateTeacher } from "@/actions/teacher-actions";
import { getTeacherById, deleteTeacher, softDeleteTeacher, restoreTeacher } from "@/actions/teacher-actions";
import { createCommission, deleteCommission } from "@/actions/commission-actions";
import { DateSince } from "@/components/formatters/DateSince";
import { ENTITY_DATA, LANGUAGES_ENUM_VALUES } from "@/lib/constants";
import { BookIcon, KiteIcon } from "@/svgs";
import { UserCheck, Trash2, ChevronDown, Ghost, RotateCcw } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeacherDetailsProps {
  teacher: any;
}

// Commission Form Sub-component
function CommissionForm({ teacherId, onCommissionCreated, onCancel }: {
  teacherId: string;
  onCommissionCreated: (commissionId: string) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    price_per_hour: '',
    desc: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.price_per_hour) {
      toast.error("Price per hour is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createCommission({
        teacher_id: teacherId,
        price_per_hour: parseInt(formData.price_per_hour),
        desc: formData.desc || null
      });

      if (result.success) {
        toast.success("Commission created successfully!");
        setFormData({ price_per_hour: '', desc: '' });
        onCommissionCreated(result.commission.id);
      } else {
        toast.error(result.error || "Failed to create commission");
      }
    } catch (error) {
      toast.error("An error occurred while creating the commission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price_per_hour">Price per Hour (€)</Label>
          <Input
            id="price_per_hour"
            name="price_per_hour"
            type="number"
            min="1"
            value={formData.price_per_hour}
            onChange={handleChange}
            placeholder="e.g. 25"
            autoFocus
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Description (Optional)</Label>
          <Input
            id="desc"
            name="desc"
            value={formData.desc}
            onChange={handleChange}
            placeholder="e.g. Peak season rate"
          />
        </div>
      </div>
      
      <div className="flex gap-2 pt-2">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          size="sm"
          variant="outline"
          className="border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
        >
          {isSubmitting ? 'Creating...' : 'Save'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function TeacherDetails({ teacher: initialTeacher }: TeacherDetailsProps) {
  const [teacher, setTeacher] = useState(initialTeacher);
  const [editMode, setEditMode] = useState(false);
  const [showCommissionForm, setShowCommissionForm] = useState(false);
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
      languages: initialTeacher.languages || [],
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
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update teacher.");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: teacher.name,
      languages: teacher.languages || [],
      passport_number: teacher.passport_number || "",
      country: teacher.country || "",
      phone: teacher.phone || "",
    });
    setEditMode(false);
  };

  const handleCommissionCreated = async (commissionId: string) => {
    const { data: updatedTeacher, error } = await getTeacherById(teacher.id);
    if (updatedTeacher) {
      setTeacher(updatedTeacher);
      setShowCommissionForm(false);
    } else if (error) {
      toast.error(`Failed to refresh teacher data: ${error}`);
    }
  };

  const handleDeleteCommission = async (commissionId: string) => {
    if (!confirm('Are you sure you want to delete this commission? This action cannot be undone.')) {
      return;
    }

    const result = await deleteCommission(commissionId);
    if (result.success) {
      toast.success("Commission deleted successfully!");
      // Refresh teacher data
      const { data: updatedTeacher } = await getTeacherById(teacher.id);
      if (updatedTeacher) {
        setTeacher(updatedTeacher);
      }
    } else {
      toast.error(result.error || "Failed to delete commission");
    }
  };

  const handleDeleteTeacher = async () => {
    const result = await deleteTeacher(teacher.id);
    if (result.success) {
      toast.success("Teacher deleted successfully!");
      // Redirect to teachers list
      router.push('/teachers');
    } else {
      toast.error(result.error || "Failed to delete teacher");
    }
  };

  const handleSoftDeleteTeacher = async () => {
    const result = await softDeleteTeacher(teacher.id);
    if (result.success) {
      toast.success("Teacher soft deleted successfully!");
      // Refresh teacher data to show soft deleted state
      const { data: updatedTeacher } = await getTeacherById(teacher.id);
      if (updatedTeacher) {
        setTeacher(updatedTeacher);
      }
    } else {
      toast.error(result.error || "Failed to soft delete teacher");
    }
  };

  const handleRestoreTeacher = async () => {
    const result = await restoreTeacher(teacher.id);
    if (result.success) {
      toast.success("Teacher restored successfully!");
      // Refresh teacher data to show restored state
      const { data: updatedTeacher } = await getTeacherById(teacher.id);
      if (updatedTeacher) {
        setTeacher(updatedTeacher);
      }
    } else {
      toast.error(result.error || "Failed to restore teacher");
    }
  };

  const teacherEntity = ENTITY_DATA.find(entity => entity.name === "Teacher");
  const TeacherIcon = teacherEntity?.icon;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Teacher Details */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 pb-6 border-b">
            {TeacherIcon && (
              <div className="p-3 rounded-lg">
                <TeacherIcon className={`w-8 h-8 ${teacherEntity?.color}`} />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {teacher.name}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Created</span>
                <DateSince dateString={teacher.created_at} />
              </div>
            </div>
            <div className="flex gap-2">
              {editMode ? (
                <>
                  <Button onClick={handleSave} size="sm" className={`${teacherEntity?.bgColor} hover:opacity-90`}>Save</Button>
                  <Button variant="outline" onClick={handleCancel} size="sm">Cancel</Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => setEditMode(true)} 
                    variant="outline" 
                    size="sm"
                    className={`border-2 ${teacherEntity?.color?.replace('text-', 'border-')} hover:${teacherEntity?.hoverColor ? `bg-[${teacherEntity.hoverColor}]` : 'bg-gray-50'}`}
                  >
                    Edit
                  </Button>
                  
                  {/* Delete/Restore Teacher Dropdown */}
                  {teacher.deleted_at ? (
                    // If soft deleted, show red ghost icon (no dropdown - just visual indicator)
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 cursor-default"
                      onClick={handleRestoreTeacher}
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
                          {(!teacher.lessons || teacher.lessons.length === 0) ? (
                            <Trash2 className="h-4 w-4" />
                          ) : (
                            <Ghost className="h-4 w-4" />
                          )}
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80">
                        {(!teacher.lessons || teacher.lessons.length === 0) ? (
                          <DropdownMenuItem
                            onClick={handleDeleteTeacher}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 p-3"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Trash2 className="h-4 w-4" />
                                <span className="font-medium">Delete Teacher</span>
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Are you sure you want to delete <strong>{teacher.name}</strong>? This action is irreversible.
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={handleSoftDeleteTeacher}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 p-3"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Ghost className="h-4 w-4" />
                                <span className="font-medium">Soft Delete Teacher</span>
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                You are about to soft delete <strong>{teacher.name}</strong>. Their data will be present but you won't be able to access it through the app.
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

          {/* Form Fields */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              {editMode ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              ) : (
                <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                  {teacher.name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Languages</Label>
              {editMode ? (
                <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                  {LANGUAGES_ENUM_VALUES.map((lang) => (
                    <div key={lang} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`lang-${lang}`}
                        checked={formData.languages.includes(lang)}
                        onChange={(e) => handleLanguageChange(lang, e.target.checked)}
                        className="h-4 w-4 border-gray-300 rounded"
                      />
                      <Label htmlFor={`lang-${lang}`} className="text-sm">
                        {lang}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                  {teacher.languages.join(", ")}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="passport_number">Passport Number</Label>
              {editMode ? (
                <Input
                  id="passport_number"
                  value={formData.passport_number}
                  onChange={handleChange}
                />
              ) : (
                <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                  {teacher.passport_number || 'N/A'}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                {editMode ? (
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                    {teacher.country || 'N/A'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                {editMode ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                    {teacher.phone || 'N/A'}
                  </div>
                )}
              </div>
            </div>

            {/* Commissions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <BookIcon className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-xl font-semibold">Commissions</h3>
                </div>
                <Button 
                  onClick={() => setShowCommissionForm(!showCommissionForm)}
                  variant="outline" 
                  size="sm"
                  className="border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                >
                  {showCommissionForm ? 'Cancel Commission' : 'Add Commission'}
                </Button>
              </div>
              
              {/* Current Commissions */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Current Rates</Label>
                {teacher.commissions && teacher.commissions.length > 0 ? (
                  <div className="space-y-2">
                    {teacher.commissions.map((commission: any) => {
                      // Count lessons using this commission
                      const lessonsUsingCommission = teacher.lessons?.filter((lesson: any) => 
                        lesson.commission_id === commission.id
                      ).length || 0;
                      
                      return (
                        <div key={commission.id} className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">€{commission.price_per_hour.toFixed(0)}/h</p>
                              {commission.desc && (
                                <p className="text-gray-600 dark:text-gray-400 mt-1">{commission.desc}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                {lessonsUsingCommission} lesson{lessonsUsingCommission !== 1 ? 's' : ''}
                              </span>
                              {lessonsUsingCommission === 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteCommission(commission.id)}
                                  className="p-1 h-6 w-6 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                    No commissions set
                  </div>
                )}
              </div>

              {/* Add Commission Form - Conditionally Rendered */}
              {showCommissionForm && (
                <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Label className="text-sm font-medium">Add New Rate</Label>
                  <CommissionForm 
                    teacherId={teacher.id} 
                    onCommissionCreated={handleCommissionCreated}
                    onCancel={() => setShowCommissionForm(false)}
                  />
                </div>
              )}
            </div>

            {/* User Wallet Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <UserCheck className="w-5 h-5 text-gray-500" />
                <h3 className="text-xl font-semibold">User Wallet</h3>
              </div>
              {teacher.user_wallet ? (
                <Link href={`/users/${teacher.user_wallet.id}`}>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <p><span className="font-semibold">Role:</span> {teacher.user_wallet.role}</p>
                    {teacher.user_wallet.sk_email && <p className="mt-1"><span className="font-semibold">Email:</span> {teacher.user_wallet.sk_email}</p>}
                    {teacher.user_wallet.sk_full_name && <p className="mt-1"><span className="font-semibold">Full Name:</span> {teacher.user_wallet.sk_full_name}</p>}
                    {teacher.user_wallet.note && <p className="mt-1"><span className="font-semibold">Note:</span> {teacher.user_wallet.note}</p>}
                  </div>
                </Link>
              ) : (
                <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                  No associated user wallet
                </div>
              )}
            </div>

            {/* Kites Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <KiteIcon className="w-5 h-5 text-purple-500" />
                <h3 className="text-xl font-semibold">Associated Kites</h3>
              </div>
              {teacher.kites && teacher.kites.length > 0 ? (
                <div className="space-y-2">
                  {teacher.kites.map((teacherKite: any) => (
                    <div key={teacherKite.id} className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                      <p>Model: {teacherKite.kite.model}, Size: {teacherKite.kite.size}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border">
                  No kites associated
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Additional Information */}
        <div className="space-y-6">

          {/* Placeholder for additional sections */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Additional Information</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Events - Coming soon</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Payments - Coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
