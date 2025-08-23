"use client";

import { useState } from "react";
import { Duration } from "@/components/formatters/Duration";
import { DateTime } from "@/components/formatters/DateTime";
import { HelmetIcon } from "@/svgs/HelmetIcon";
import { Clock, MapPin, ChevronDown, ChevronUp, Euro, Phone } from "lucide-react";
import { type EventWithDetails } from "@/backend/TeacherPortal";

interface TeacherEventCardProps {
  eventDetail: EventWithDetails;
}

const STATUS_COLORS = {
  planned: "bg-blue-500",
  tbc: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-orange-500",
} as const;

const StudentsDisplay = ({ 
  students, 
  studentDetails, 
  onStudentClick 
}: { 
  students: string[]; 
  studentDetails: EventWithDetails['studentDetails'];
  onStudentClick: (student: EventWithDetails['studentDetails'][0]) => void;
}) => {
  return (
    <div className="flex items-center gap-2 text-base">
      {students.length > 0 ? (
        <>
          {Array.from({ length: students.length }).map((_, index) => (
            <HelmetIcon key={index} className="w-4 h-4 text-yellow-500" />
          ))}
          <div className="flex gap-1 flex-wrap">
            {students.map((studentName, index) => {
              const studentDetail = studentDetails.find(sd => sd.student.name === studentName);
              return (
                <button
                  key={index}
                  onClick={() => studentDetail && onStudentClick(studentDetail)}
                  className="text-foreground font-medium hover:underline hover:text-blue-600"
                >
                  {studentName}
                  {index < students.length - 1 && ","}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <span className="text-muted-foreground">No students</span>
      )}
    </div>
  );
};

const TimeDisplay = ({
  date,
  duration,
}: {
  date: string;
  duration: number;
}) => (
  <div className="flex items-center gap-2">
    <Clock className="w-4 h-4 text-muted-foreground" />
    <div className="flex items-center gap-1">
      <span className="text-foreground font-medium">
        <DateTime dateString={date} formatType="time" />
      </span>
      <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
        +<Duration minutes={duration} />
      </span>
    </div>
  </div>
);

const LocationDisplay = ({ location }: { location: string }) => (
  <div className="flex items-center gap-2">
    <MapPin className="w-4 h-4 text-muted-foreground" />
    <span className="text-foreground font-medium">{location}</span>
  </div>
);

const EarningsDisplay = ({ earnings }: { earnings: number }) => (
  <div className="flex items-center gap-2">
    <Euro className="w-4 h-4 text-muted-foreground" />
    <span className="text-foreground font-medium">€{Math.round(earnings)}</span>
  </div>
);

const StudentDropdown = ({ 
  student, 
  isOpen, 
  onClose 
}: { 
  student: EventWithDetails['studentDetails'][0]; 
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;
  
  const handleWhatsAppClick = (phone: string) => {
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/\D/g, '');
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
  };
  
  return (
    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm">{student.student.name}</h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
        <div><strong>Languages:</strong> {student.student.languages.join(", ")}</div>
        {student.student.country && <div><strong>Country:</strong> {student.student.country}</div>}
        {student.student.phone && (
          <div className="flex items-center gap-2">
            <strong>Phone:</strong> 
            <span>{student.student.phone}</span>
            <button
              onClick={() => handleWhatsAppClick(student.student.phone!)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              <Phone className="w-3 h-3" />
              WhatsApp
            </button>
          </div>
        )}
        {student.student.passport_number && <div><strong>Passport:</strong> {student.student.passport_number}</div>}
        {student.student.size && <div><strong>Size:</strong> {student.student.size}</div>}
        {student.student.desc && <div><strong>Notes:</strong> {student.student.desc}</div>}
      </div>
    </div>
  );
};

export default function TeacherEventCard({ eventDetail }: TeacherEventCardProps) {
  const [selectedStudent, setSelectedStudent] = useState<EventWithDetails['studentDetails'][0] | null>(null);
  
  const sidebarColor = STATUS_COLORS[eventDetail.event.status as keyof typeof STATUS_COLORS] || "bg-gray-500";
  
  const handleStudentClick = (student: EventWithDetails['studentDetails'][0]) => {
    setSelectedStudent(selectedStudent?.student.id === student.student.id ? null : student);
  };

  return (
    <div className="space-y-0">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Date Header with muted background */}
        <div className="bg-muted px-4 py-2 border-b border-border">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-muted-foreground">
              <DateTime dateString={eventDetail.event.date} formatType="date" />
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              {eventDetail.packageInfo.capacity_kites} kites
            </div>
          </div>
        </div>
        
        <div className="flex">
          <div className={`w-2 ${sidebarColor}`} />
          
          <div className="flex-1 p-4">
            <div className="mb-3">
              <StudentsDisplay 
                students={eventDetail.students} 
                studentDetails={eventDetail.studentDetails}
                onStudentClick={handleStudentClick}
              />
            </div>

            <div className="space-y-2">
              <TimeDisplay date={eventDetail.event.date} duration={eventDetail.event.duration} />
              <LocationDisplay location={eventDetail.event.location} />
              {eventDetail.event.status === 'completed' && (
                <EarningsDisplay earnings={eventDetail.earnings} />
              )}
              {eventDetail.kites.length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Kites:</strong> {eventDetail.kites.map(k => `${k.kite.model} ${k.kite.size}m`).join(", ")}
                </div>
              )}
            </div>

            {selectedStudent && (
              <StudentDropdown 
                student={selectedStudent}
                isOpen={true}
                onClose={() => setSelectedStudent(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}