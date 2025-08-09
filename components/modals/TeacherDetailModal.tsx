import React from 'react';

interface TeacherDetailModalProps {
  teacherSummaries: any[];
  lessons: any[];
  events: any[];
  isOpen: boolean;
  onClose: () => void;
}

export default function TeacherDetailModal({ teacherSummaries, lessons, events, isOpen, onClose }: TeacherDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Teacher Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          {teacherSummaries.map((teacher) => {
            const teacherLessons = lessons.filter(l => l.teacher?.name === teacher.name);
            
            return (
              <div key={teacher.name} className="border rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{teacher.name}</h3>
                    <p className="text-sm text-gray-600">Total Lessons: {teacherLessons.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">€{Math.round(teacher.totalEarnings)}</p>
                    <p className="text-sm text-gray-600">Total Earnings</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="font-bold text-blue-600">{Math.round(teacher.totalHours * 10) / 10}h</div>
                    <div className="text-xs">Hours</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <div className="font-bold text-purple-600">{teacher.totalEvents}</div>
                    <div className="text-xs">Events</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-bold text-gray-600">{teacherLessons.length}</div>
                    <div className="text-xs">Lessons</div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Lessons:</p>
                  <div className="space-y-2">
                    {teacherLessons.map((lesson: any) => {
                      // Calculate events and earnings for this specific lesson
                      const lessonEvents = events.filter(event => event.lesson?.id === lesson.id);
                      const totalMinutes = lessonEvents.reduce((sum, event) => sum + (event.duration || 0), 0);
                      const hours = totalMinutes / 60;
                      const earnings = hours * (lesson.commission?.price_per_hour || 0);
                      
                      return (
                        <div key={lesson.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                          <span>Lesson #{lesson.id} - {lesson.status}</span>
                          <span>{lessonEvents.length} events ({Math.round(hours * 10) / 10}h)</span>
                          <span>€{Math.round(earnings)} (€{lesson.commission?.price_per_hour || 0}/hr)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
