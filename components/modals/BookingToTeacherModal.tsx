"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createLesson } from "@/actions/lesson-actions";
import { createCommission } from "@/actions/commission-actions";
import { useRouter } from "next/navigation";
import { X, Search, Plus, Check, ChevronRight, DollarSign, User } from "lucide-react";

/* ============================================================================
 * TYPE DEFINITIONS
 * ============================================================================ */

interface Teacher {
  id: string;
  name: string;
  languages?: string[];
  commissions: {
    id: string;
    price_per_hour: number;
    desc: string | null;
  }[];
}

interface BookingReference {
  id: string;
  teacher: {
    id: string;
    name: string;
  } | null;
  amount?: number;
  status?: string;
  role?: string;
  note?: string;
}

interface BookingToTeacherModalProps {
  bookingId: string;
  bookingReference?: BookingReference | null;
  onClose: () => void;
  teachers: Teacher[];
  onCommissionCreated: () => void;
}

/* ============================================================================
 * SUB-COMPONENT: TeacherCard
 * ============================================================================ */

interface TeacherCardProps {
  teacher: Teacher;
  isSelected: boolean;
  onSelect: () => void;
}

function TeacherCard({ teacher, isSelected, onSelect }: TeacherCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-muted-foreground/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {teacher.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base">
              {teacher.name}
            </h3>
            {teacher.languages && teacher.languages.length > 0 && (
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {teacher.languages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div
          className={`transition-transform duration-300 ${
            isSelected ? "rotate-90 text-primary" : "text-muted-foreground"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </button>
  );
}

/* ============================================================================
 * SUB-COMPONENT: CommissionCard
 * ============================================================================ */

interface CommissionCardProps {
  commission: {
    id: string;
    price_per_hour: number;
    desc: string | null;
  };
  isSelected: boolean;
  onSelect: () => void;
}

function CommissionCard({ commission, isSelected, onSelect }: CommissionCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-muted-foreground/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-lg text-foreground">
              €{commission.price_per_hour}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                /hour
              </span>
            </div>
            {commission.desc && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {commission.desc}
              </p>
            )}
          </div>
        </div>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>
    </button>
  );
}

/* ============================================================================
 * SUB-COMPONENT: NewCommissionForm
 * ============================================================================ */

interface NewCommissionFormProps {
  teacherId: string;
  onCommissionCreated: (commissionId: string) => void;
  onCancel: () => void;
}

function NewCommissionForm({
  teacherId,
  onCommissionCreated,
  onCancel,
}: NewCommissionFormProps) {
  const [rate, setRate] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    const rateNum = parseInt(rate);
    if (isNaN(rateNum) || rateNum < 1 || rateNum >= 100) {
      toast.error("Rate must be between 1 and 99 €/hour");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createCommission({
        teacher_id: teacherId,
        price_per_hour: rateNum,
        desc: description || null,
      });

      if (result.success && result.commission?.id) {
        toast.success("Commission created successfully!");
        onCommissionCreated(result.commission.id);
      } else {
        toast.error(result.error || "Failed to create commission");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-5 rounded-lg border border-dashed border-border bg-muted/30 space-y-4">
      <div className="flex items-center gap-2 text-foreground">
        <Plus className="w-5 h-5" />
        <h4 className="font-semibold text-base">Create New Commission</h4>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Hourly Rate (€)
          </label>
          <Input
            type="number"
            min="1"
            max="99"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="25"
            className="h-11 text-base"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Description (Optional)
          </label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Summer Rate, Group Lessons"
            className="h-11 text-base"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isCreating}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={isCreating || !rate}
          className="flex-1"
        >
          {isCreating ? "Creating..." : "Create & Use"}
        </Button>
      </div>
    </div>
  );
}

/* ============================================================================
 * SUB-COMPONENT: BookingReferenceCard
 * ============================================================================ */

interface BookingReferenceCardProps {
  reference: BookingReference;
}

function BookingReferenceCard({ reference }: BookingReferenceCardProps) {
  return (
    <div className="p-5 rounded-lg bg-muted/30 border border-border">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-foreground text-sm">
            Booking Reference
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">ID:</span>
              <p className="font-mono text-xs text-foreground mt-0.5 bg-background/50 px-2 py-1 rounded">
                {reference.id}
              </p>
            </div>
            {(reference.teacher?.name || reference.note) && (
              <div>
                <span className="text-muted-foreground">
                  {reference.teacher?.name ? "Teacher:" : "Note:"}
                </span>
                <p className="font-medium text-foreground mt-0.5">
                  {reference.teacher?.name || reference.note}
                </p>
              </div>
            )}
            {reference.amount && (
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <p className="font-bold text-green-600 dark:text-green-400 mt-0.5">
                  €{reference.amount}
                </p>
              </div>
            )}
            {reference.status && (
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="capitalize font-medium text-foreground mt-0.5">
                  {reference.status}
                </p>
              </div>
            )}
            {reference.role && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Role:</span>
                <p className="capitalize font-medium text-foreground mt-0.5">
                  {reference.role}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * MAIN COMPONENT: BookingToTeacherModal
 * ============================================================================ */

export function BookingToTeacherModal({
  bookingId,
  bookingReference,
  onClose,
  teachers,
  onCommissionCreated,
}: BookingToTeacherModalProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [selectedCommissionId, setSelectedCommissionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewCommissionForm, setShowNewCommissionForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

  // Filter teachers based on search query
  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Reset commission selection when teacher changes
  const handleTeacherSelect = (teacherId: string) => {
    if (selectedTeacherId === teacherId) {
      setSelectedTeacherId(null);
      setSelectedCommissionId(null);
      setShowNewCommissionForm(false);
    } else {
      setSelectedTeacherId(teacherId);
      setSelectedCommissionId(null);
      setShowNewCommissionForm(false);
    }
  };

  // Handle lesson creation
  const handleCreateLesson = async (autoCommissionId?: string) => {
    const commissionId = autoCommissionId || selectedCommissionId;

    if (!selectedTeacherId || !commissionId) {
      toast.error("Please select both a teacher and a commission");
      return;
    }

    startTransition(async () => {
      const result = await createLesson({
        booking_id: bookingId,
        teacher_id: selectedTeacherId,
        commission_id: commissionId,
      });

      if (result.success) {
        toast.success("🎉 Lesson created and linked successfully!");
        onCommissionCreated();
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || "Failed to create lesson");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                Assign Teacher to Booking
              </h2>
              <p className="text-muted-foreground text-sm">
                Select a teacher and commission to create a lesson
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Booking Reference */}
          {bookingReference && (
            <BookingReferenceCard reference={bookingReference} />
          )}

          {/* Search Bar */}
          {teachers.length > 3 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teachers..."
                className="pl-10 h-12 text-base"
              />
            </div>
          )}

          {/* Teacher Selection */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-foreground text-xs font-bold">
                1
              </span>
              Select Teacher
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {filteredTeachers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? "No teachers found matching your search"
                    : "No teachers available"}
                </div>
              ) : (
                filteredTeachers.map((teacher) => (
                  <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                    isSelected={selectedTeacherId === teacher.id}
                    onSelect={() => handleTeacherSelect(teacher.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Commission Selection */}
          {selectedTeacher && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-foreground text-xs font-bold">
                  2
                </span>
                Choose Commission for{" "}
                <span className="text-foreground font-bold">{selectedTeacher.name}</span>
              </h3>

              {/* Existing Commissions */}
              {selectedTeacher.commissions.length > 0 && (
                <div className="space-y-2">
                  {selectedTeacher.commissions.map((commission) => (
                    <CommissionCard
                      key={commission.id}
                      commission={commission}
                      isSelected={selectedCommissionId === commission.id}
                      onSelect={() => {
                        setSelectedCommissionId(commission.id);
                        setShowNewCommissionForm(false);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* No Commissions Message */}
              {selectedTeacher.commissions.length === 0 && !showNewCommissionForm && (
                <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30 text-center text-sm text-muted-foreground">
                  No existing commissions for this teacher
                </div>
              )}

              {/* Create New Commission Button/Form */}
              {!showNewCommissionForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowNewCommissionForm(true)}
                  className="w-full border-dashed h-12"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Commission
                </Button>
              ) : (
                <NewCommissionForm
                  teacherId={selectedTeacher.id}
                  onCommissionCreated={(commissionId) => {
                    setSelectedCommissionId(commissionId);
                    setShowNewCommissionForm(false);
                    toast.success("Commission created! Creating lesson...");
                    handleCreateLesson(commissionId);
                  }}
                  onCancel={() => setShowNewCommissionForm(false)}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-muted/30 border-t border-border flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {!selectedTeacherId && "Start by selecting a teacher"}
            {selectedTeacherId && !selectedCommissionId && "Now choose or create a commission"}
            {selectedTeacherId && selectedCommissionId && (
              <span className="flex items-center gap-2 text-foreground font-medium">
                <Check className="w-4 h-4" />
                Ready to create lesson
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleCreateLesson()}
              disabled={isPending || !selectedTeacherId || !selectedCommissionId}
              className="px-8"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Create Lesson
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
