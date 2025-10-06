"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createLesson } from "@/actions/lesson-actions";
import { createCommission } from "@/actions/commission-actions";
import { useRouter } from "next/navigation";
import { X, Search, Plus, Check, ChevronRight, UserCheck } from "lucide-react";
import { HeadsetIcon, PaymentIcon } from "@/svgs";

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
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/30"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isSelected ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
        }`}>
          <HeadsetIcon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-sm">{teacher.name}</h3>
          {teacher.languages && teacher.languages.length > 0 && (
            <div className="flex gap-1 mt-0.5 flex-wrap">
              {teacher.languages.map((lang, idx) => (
                <span key={idx} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {lang}
                </span>
              ))}
            </div>
          )}
        </div>
        {isSelected && <Check className="w-4 h-4 text-primary" />}
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
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/30"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isSelected ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
        }`}>
          <PaymentIcon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">€{commission.price_per_hour}/h</div>
          {commission.desc && (
            <p className="text-xs text-muted-foreground">{commission.desc}</p>
          )}
        </div>
        {isSelected && <Check className="w-4 h-4 text-primary" />}
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
        onCommissionCreated(result.commission.id);
      } else {
        toast.error(result.error || "Failed to create commission");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border border-dashed border-border bg-muted/20 space-y-3">
      <div className="flex items-center gap-2 text-foreground">
        <Plus className="w-4 h-4" />
        <h4 className="font-medium text-sm">New Commission</h4>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Rate (€)</label>
          <Input
            type="number"
            min="1"
            max="99"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="25"
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Description</label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Summer Rate"
            className="h-8 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isCreating} size="sm" className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleCreate} disabled={isCreating || !rate} size="sm" className="flex-1">
          {isCreating ? "Creating..." : "Create"}
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
  const fields = [
    reference.note && { label: "Note", value: reference.note },
    reference.role && { label: "Role", value: reference.role, capitalize: true },
    reference.teacher?.name && { label: "Teacher", value: reference.teacher.name },
    reference.amount && { label: "Amount", value: `€${reference.amount}`, color: "text-green-600" },
    reference.status && { label: "Status", value: reference.status, capitalize: true },
  ].filter(Boolean);

  return (
    <div className="p-3 rounded-lg bg-muted/20 border border-border">
      <div className="flex items-center gap-3">
        <UserCheck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <h3 className="font-medium text-foreground text-sm">Booking Reference</h3>
        <div className="flex-1 flex flex-wrap gap-x-4 gap-y-1 justify-end text-xs">
          {fields.map((field, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="text-muted-foreground">{field.label}:</span>
              <span className={`font-medium ${field.color || 'text-foreground'} ${field.capitalize ? 'capitalize' : ''}`}>
                {field.value}
              </span>
            </div>
          ))}
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
        toast.success("Lesson created and linked successfully!");
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
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Assign Teacher</h2>
              <p className="text-muted-foreground text-xs">Select teacher and commission</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Booking Reference */}
          {bookingReference && (
            <BookingReferenceCard reference={bookingReference} />
          )}

          {/* Search Bar */}
          {teachers.length > 3 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teachers..."
                className="pl-8 h-8 text-sm"
              />
            </div>
          )}

          {/* Teacher Selection */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-foreground text-xs font-bold">1</span>
              Select Teacher
            </h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {filteredTeachers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  {searchQuery ? "No teachers found" : "No teachers available"}
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
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-foreground text-xs font-bold">2</span>
                Commission for <span className="text-foreground font-bold">{selectedTeacher.name}</span>
              </h3>
              {selectedTeacher.commissions.length > 0 && (
                <div className="space-y-1.5">
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
              {selectedTeacher.commissions.length === 0 && !showNewCommissionForm && (
                <div className="p-3 rounded-lg border border-dashed border-border bg-muted/20 text-center text-xs text-muted-foreground">
                  No existing commissions
                </div>
              )}
              {!showNewCommissionForm ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNewCommissionForm(true);
                    setSelectedCommissionId(null);
                  }} 
                  className="w-full border-dashed h-8" 
                  size="sm"
                >
                  <Plus className="w-3 h-3 mr-1" /> New Commission
                </Button>
              ) : (
                <NewCommissionForm
                  teacherId={selectedTeacher.id}
                  onCommissionCreated={(commissionId) => {
                    setSelectedCommissionId(commissionId);
                    setShowNewCommissionForm(false);
                    handleCreateLesson(commissionId);
                  }}
                  onCancel={() => setShowNewCommissionForm(false)}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {!selectedTeacherId && "Select teacher"}
            {selectedTeacherId && !selectedCommissionId && "Choose commission"}
            {selectedTeacherId && selectedCommissionId && (
              <span className="flex items-center gap-1 text-foreground font-medium">
                <Check className="w-3 h-3" /> Ready
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isPending} size="sm">
              Cancel
            </Button>
            <Button
              onClick={() => handleCreateLesson()}
              disabled={isPending || !selectedTeacherId || !selectedCommissionId}
              size="sm"
            >
              {isPending ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 mr-1" /> Create
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
