"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { DatePicker, DateRange } from "@/components/pickers/date-picker";
import { BookingPackageTable } from "@/components/forms/BookingPackageTable";
import { BookingStudentTable } from "@/components/forms/BookingStudentTable";
import { BookingReferenceTable } from "@/components/forms/BookingReferenceTable";
import { BookingLessonTeacherTable } from "@/components/forms/BookingLessonTeacherTable";
import { BookingFormSummary } from "@/components/forms/BookingFormSummary";
import { StudentForm } from "@/components/forms/StudentForm";
import { PackageForm } from "@/components/forms/PackageForm";
import { createBooking } from "@/actions/booking-actions";
import { getStudents } from "@/actions/student-actions";
import { createLesson } from "@/actions/lesson-actions";
import { toast } from "sonner";
import { ENTITY_DATA } from "@/lib/constants";
import { UserCheck } from "lucide-react";

type FormType = "booking" | "student" | "package";

// Extract icons from ENTITY_DATA
const BookingIcon = ENTITY_DATA.find(
  (entity) => entity.name === "Booking",
)?.icon;
const PackageIcon = ENTITY_DATA.find(
  (entity) => entity.name === "Package",
)?.icon;
const StudentIcon = ENTITY_DATA.find(
  (entity) => entity.name === "Student",
)?.icon;
const TeacherIcon = ENTITY_DATA.find(
  (entity) => entity.name === "Teacher",
)?.icon;

// Reusable Section Component
const Section = ({
  id,
  title,
  icon: Icon,
  iconColor,
  isExpanded,
  onToggle,
  children,
}: {
  id: string;
  title: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  isExpanded: boolean;
  onToggle: (sectionId: string) => void;
  children: React.ReactNode;
}) => (
  <div id={id} className="scroll-mt-4">
    <div
      className="flex items-center justify-between cursor-pointer p-4 rounded-lg bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200"
      onClick={() => onToggle(id)}
    >
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
        {Icon && <Icon className={`h-6 w-6 ${iconColor}`} />}
        {title}
      </h2>
      <span className="text-lg font-bold text-primary">
        {isExpanded ? "−" : "+"}
      </span>
    </div>
    {isExpanded && <div className="mt-4 p-4 bg-card rounded-lg border border-border shadow-sm">{children}</div>}
  </div>
);

// Individual Section Components
const DatesSection = ({ 
  dateRange, 
  onDatesChange, 
  isExpanded, 
  onToggle 
}: {
  dateRange: DateRange;
  onDatesChange: (dateRange: DateRange) => void;
  isExpanded: boolean;
  onToggle: (sectionId: string) => void;
}) => (
  <Section
    id="dates-section"
    title="Booking Dates"
    icon={BookingIcon}
    iconColor="text-blue-500"
    isExpanded={isExpanded}
    onToggle={onToggle}
  >
    <DatePicker dateRange={dateRange} setDateRange={onDatesChange} />
  </Section>
);

const PackageSection = ({
  packages,
  selectedPackageId,
  viaStudentParams,
  selectedStudentIds,
  onPackageChange,
  isExpanded,
  onToggle,
}: {
  packages: any[];
  selectedPackageId: string;
  viaStudentParams: boolean;
  selectedStudentIds: string[];
  onPackageChange: (packageId: string) => void;
  isExpanded: boolean;
  onToggle: (sectionId: string) => void;
}) => (
  <Section
    id="package-section"
    title="Select Package"
    icon={PackageIcon}
    iconColor="text-orange-500"
    isExpanded={isExpanded}
    onToggle={onToggle}
  >
    <BookingPackageTable
      packages={packages}
      onSelectPackage={onPackageChange}
      selectedPackageId={selectedPackageId}
      viaStudentParams={viaStudentParams}
      selectedStudentIds={selectedStudentIds}
    />
  </Section>
);

const StudentsSection = ({
  students,
  selectedStudentIds,
  selectedPackageCapacity,
  availableStudents,
  onStudentChange,
  isExpanded,
  onToggle,
}: {
  students: any[];
  selectedStudentIds: string[];
  selectedPackageCapacity: number;
  availableStudents: Set<string>;
  onStudentChange: (studentId: string) => void;
  isExpanded: boolean;
  onToggle: (sectionId: string) => void;
}) => (
  <Section
    id="students-section"
    title={
      <>
        Select Students{" "}
        <span className="text-sm font-normal text-muted-foreground">
          (Max: {selectedPackageCapacity})
        </span>
      </>
    }
    icon={StudentIcon}
    iconColor="text-yellow-500"
    isExpanded={isExpanded}
    onToggle={onToggle}
  >
    <BookingStudentTable
      students={students}
      selectedStudentIds={selectedStudentIds}
      onSelectStudent={onStudentChange}
      packageCapacity={selectedPackageCapacity}
      availableStudents={availableStudents}
    />
  </Section>
);

const ReferenceSection = ({
  userWallets,
  selectedReferenceId,
  onReferenceChange,
  isExpanded,
  onToggle,
}: {
  userWallets: any[];
  selectedReferenceId: string | null;
  onReferenceChange: (referenceId: string | null) => void;
  isExpanded: boolean;
  onToggle: (sectionId: string) => void;
}) => (
  <Section
    id="reference-section"
    title="Select Reference (Optional)"
    icon={UserCheck}
    iconColor="text-gray-500"
    isExpanded={isExpanded}
    onToggle={onToggle}
  >
    <BookingReferenceTable
      userWallets={userWallets}
      onSelectReference={onReferenceChange}
      selectedReferenceId={selectedReferenceId}
    />
  </Section>
);

const LessonSection = ({
  teachers,
  selectedLessonTeacherId,
  selectedLessonCommissionId,
  onSelectTeacher,
  onSelectCommission,
  isExpanded,
  onToggle,
}: {
  teachers: any[];
  selectedLessonTeacherId: string | null;
  selectedLessonCommissionId: string | null;
  onSelectTeacher: (teacherId: string | null) => void;
  onSelectCommission: (commissionId: string | null) => void;
  isExpanded: boolean;
  onToggle: (sectionId: string) => void;
}) => (
  <Section
    id="lesson-section"
    title="Lesson Details (Optional)"
    icon={TeacherIcon}
    iconColor="text-green-500"
    isExpanded={isExpanded}
    onToggle={onToggle}
  >
    <BookingLessonTeacherTable
      teachers={teachers}
      selectedTeacherId={selectedLessonTeacherId}
      selectedCommissionId={selectedLessonCommissionId}
      onSelectTeacher={onSelectTeacher}
      onSelectCommission={onSelectCommission}
    />
  </Section>
);

export default function MasterBookingForm({
  packages,
  students,
  userWallets,
  teachers,
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentIdsParam = searchParams.get("studentIds");
  const studentIds = studentIdsParam ? studentIdsParam.split(",") : [];
  const packageIdParam = searchParams.get("packageId");

  const [selectedPackageId, setSelectedPackageId] = useState(
    packageIdParam || "",
  );
  const [selectedPackageCapacity, setSelectedPackageCapacity] = useState(
    studentIds.length > 0 ? studentIds.length : 0,
  );
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: "",
    endDate: "",
  });
  const [selectedStudentIds, setSelectedStudentIds] =
    useState<string[]>(studentIds);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(
    null,
  );
  const [selectedLessonTeacherId, setSelectedLessonTeacherId] = useState<
    string | null
  >(null);
  const [selectedLessonCommissionId, setSelectedLessonCommissionId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<Set<string>>(
    new Set(),
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    if (studentIds.length > 0 || packageIdParam) {
      return new Set(["dates-section", "reference-section", "lesson-section"]);
    } else {
      return new Set([
        "dates-section",
        "package-section",
        "students-section",
        "reference-section",
        "lesson-section",
      ]);
    }
  });
  const [viaStudentParams, setViaStudentParams] = useState(
    studentIds.length > 0,
  );
  const [activeForm, setActiveForm] = useState<FormType>("booking");
  const [stayOnFormAfterSubmit, setStayOnFormAfterSubmit] = useState(false);

  useEffect(() => {
    const updateAvailableStudents = () => {
      setAvailableStudents(
        new Set(students.filter((s) => s.isAvailable).map((s) => s.id)),
      );
    };
    updateAvailableStudents();
  }, [students]);

  useEffect(() => {
    if (selectedPackageId) {
      const selectedPkg = packages.find(
        (pkg: any) => pkg.id === selectedPackageId,
      );
      if (selectedPkg) {
        setSelectedPackageCapacity(selectedPkg.capacity_students);
        if (
          viaStudentParams &&
          selectedStudentIds.length > selectedPkg.capacity_students
        ) {
          toast.error(
            `The selected package capacity (${selectedPkg.capacity_students}) is less than the number of pre-selected students (${selectedStudentIds.length}). Please adjust student selection.`,
          );
        }
      }
    } else if (!viaStudentParams) {
      setSelectedPackageCapacity(0);
    }
  }, [selectedPackageId, packages, viaStudentParams, selectedStudentIds]);

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentIds((prevSelected) => {
      let newSelectedIds;
      if (prevSelected.includes(studentId)) {
        newSelectedIds = prevSelected.filter((id) => id !== studentId);
      } else {
        if (prevSelected.length < selectedPackageCapacity) {
          newSelectedIds = [...prevSelected, studentId];
        } else {
          toast.error(
            `You can only select up to ${selectedPackageCapacity} students for this package.`,
          );
          newSelectedIds = prevSelected;
        }
      }

      if (newSelectedIds.length >= selectedPackageCapacity) {
        setExpandedSections((prev) => {
          const newSet = new Set(prev);
          newSet.delete("students-section");
          return newSet;
        });
      }

      return newSelectedIds;
    });
  };

  const handleEditSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handlePackageChange = (packageId: string) => {
    setSelectedPackageId(packageId);
    if (packageId) {
      setExpandedSections((prev) => {
        const newSet = new Set(prev);
        newSet.delete("package-section");
        return newSet;
      });
    }
  };

  const handleDatesChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  const handleReferenceChange = (referenceId: string | null) => {
    setSelectedReferenceId(referenceId);
    if (referenceId) {
      setExpandedSections((prev) => {
        const newSet = new Set(prev);
        newSet.delete("reference-section");
        return newSet;
      });
      const selectedWallet = userWallets.find(
        (wallet) => wallet.id === referenceId,
      );
      if (selectedWallet && selectedWallet.pk) {
        const teacher = teachers.find((t) => t.id === selectedWallet.pk);
        if (teacher) {
          setSelectedLessonTeacherId(teacher.id);
          setExpandedSections((prev) => {
            const newSet = new Set(prev);
            newSet.add("lesson-section");
            return newSet;
          });
        } else {
          setSelectedLessonTeacherId(null);
          setSelectedLessonCommissionId(null);
        }
      } else {
        setSelectedLessonTeacherId(null);
        setSelectedLessonCommissionId(null);
      }
    } else {
      setSelectedLessonTeacherId(null);
      setSelectedLessonCommissionId(null);
      setExpandedSections((prev) => {
        const newSet = new Set(prev);
        newSet.delete("reference-section");
        return newSet;
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (!selectedPackageId) {
        toast.error("Please select a package.");
        return;
      }

      if (!dateRange.startDate || !dateRange.endDate) {
        toast.error("Please select booking dates.");
        return;
      }

      if (selectedStudentIds.length === 0) {
        toast.error("Please select at least one student.");
        return;
      }

      const result = await createBooking({
        package_id: selectedPackageId,
        date_start: dateRange.startDate,
        date_end: dateRange.endDate,
        student_ids: selectedStudentIds,
        reference_id: selectedReferenceId,
      });

      if (result.success) {
        let toastMessage = "Booking created successfully!";
        if (selectedLessonTeacherId && selectedLessonCommissionId) {
          const lessonResult = await createLesson({
            booking_id: result.bookingId as string,
            teacher_id: selectedLessonTeacherId,
            commission_id: selectedLessonCommissionId,
          });
          if (lessonResult.success) {
            toastMessage = "Booking and Lesson created successfully!";
          } else {
            toastMessage = `Booking created, but failed to create lesson: ${lessonResult.error}`;
          }
        }
        toast.success(toastMessage);
        // Reset form and reopen sections
        setSelectedPackageId("");
        setDateRange({ startDate: "", endDate: "" });
        setSelectedStudentIds([]);
        setSelectedReferenceId(null);
        setSelectedLessonTeacherId(null);
        setSelectedLessonCommissionId(null);
        setExpandedSections(
          new Set([
            "dates-section",
            "package-section",
            "students-section",
            "reference-section",
            "lesson-section",
          ]),
        );
        // Re-fetch students to update availability
        const { data: updatedStudents, error: studentsError } =
          await getStudents();
        if (updatedStudents) {
          setAvailableStudents(
            new Set(
              updatedStudents.filter((s) => s.isAvailable).map((s) => s.id),
            ),
          );
        } else if (studentsError) {
          console.error("Error re-fetching students:", studentsError);
        }
        setLoading(false); // Reset loading state here
        router.refresh(); // Refresh the current route to revalidate data and re-render
      } else {
        toast.error(result.error || "Failed to create booking.");
        setLoading(false); // Reset loading state on error too
      }
    } catch (error) {
      console.error("Error during booking submission:", error);
      toast.error("An unexpected error occurred during booking.");
      setLoading(false); // Reset loading state on unexpected error
    } finally {
      // Removed window.history.replaceState from here
    }
  };

  const handleReset = () => {
    setSelectedPackageId("");
    setDateRange({ startDate: "", endDate: "" });
    setSelectedStudentIds([]);
    setSelectedReferenceId(null);
    setSelectedLessonTeacherId(null);
    setSelectedLessonCommissionId(null);
    setExpandedSections(
      new Set([
        "dates-section",
        "package-section",
        "students-section",
        "reference-section",
        "lesson-section",
      ]),
    );
    setViaStudentParams(false);
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const selectedPackage = packages.find(
    (pkg: any) => pkg.id === selectedPackageId,
  );
  const selectedStudentsList = students.filter((student: any) =>
    selectedStudentIds.includes(student.id),
  );
  const selectedReference = userWallets.find(
    (wallet: any) => wallet.id === selectedReferenceId,
  );

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <div className="lg:grid lg:grid-cols-5 lg:gap-8 max-w-7xl mx-auto">
        {/* Summary Sidebar */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="lg:sticky lg:top-4 p-4">
            <BookingFormSummary
              selectedPackage={selectedPackage}
              selectedStudents={selectedStudentsList}
              selectedReference={selectedReference}
              dateRange={dateRange}
              onSubmit={handleSubmit}
              onReset={handleReset}
              loading={loading}
              onEditSection={handleEditSection}
              viaStudentParams={viaStudentParams}
              selectedLessonTeacherId={selectedLessonTeacherId}
              selectedLessonCommissionId={selectedLessonCommissionId}
              teachers={teachers}
              activeForm={activeForm}
              setActiveForm={setActiveForm}
              stayOnFormAfterSubmit={stayOnFormAfterSubmit}
              setStayOnFormAfterSubmit={setStayOnFormAfterSubmit}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="bg-card rounded-lg border border-border shadow-lg">
            <div className="p-6">
              {/* Render the appropriate form based on activeForm */}
              {activeForm === "booking" && (
                <div className="space-y-6">
                  <DatesSection
                    dateRange={dateRange}
                    onDatesChange={handleDatesChange}
                    isExpanded={expandedSections.has("dates-section")}
                    onToggle={handleEditSection}
                  />

                  <PackageSection
                    packages={packages}
                    selectedPackageId={selectedPackageId}
                    viaStudentParams={viaStudentParams}
                    selectedStudentIds={selectedStudentIds}
                    onPackageChange={handlePackageChange}
                    isExpanded={expandedSections.has("package-section")}
                    onToggle={handleEditSection}
                  />

                  <StudentsSection
                    students={students}
                    selectedStudentIds={selectedStudentIds}
                    selectedPackageCapacity={selectedPackageCapacity}
                    availableStudents={availableStudents}
                    onStudentChange={handleStudentChange}
                    isExpanded={expandedSections.has("students-section")}
                    onToggle={handleEditSection}
                  />

                  <ReferenceSection
                    userWallets={userWallets}
                    selectedReferenceId={selectedReferenceId}
                    onReferenceChange={handleReferenceChange}
                    isExpanded={expandedSections.has("reference-section")}
                    onToggle={handleEditSection}
                  />

                  <LessonSection
                    teachers={teachers}
                    selectedLessonTeacherId={selectedLessonTeacherId}
                    selectedLessonCommissionId={selectedLessonCommissionId}
                    onSelectTeacher={setSelectedLessonTeacherId}
                    onSelectCommission={setSelectedLessonCommissionId}
                    isExpanded={expandedSections.has("lesson-section")}
                    onToggle={handleEditSection}
                  />
                </div>
              )}

              {activeForm === "student" && (
                <div className="-m-4">
                  <StudentForm
                    onSubmit={() => {
                      // Handle student creation success
                      // Switch to booking form only if toggle is off
                      if (!stayOnFormAfterSubmit) {
                        setActiveForm("booking");
                      }
                    }}
                  />
                </div>
              )}

              {activeForm === "package" && (
                <div className="-m-4">
                  <PackageForm
                    onSubmit={() => {
                      // Handle package creation success
                      // Switch to booking form only if toggle is off
                      if (!stayOnFormAfterSubmit) {
                        setActiveForm("booking");
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
