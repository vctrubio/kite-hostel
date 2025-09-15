import { DateTime } from '@/components/formatters/DateTime';

interface LessonDetailModalProps {
  lessons: any[];
  isOpen: boolean;
  onClose: () => void;
  type: 'planned' | 'rest';
}

export default function LessonDetailModal({ lessons, isOpen, onClose, type }: LessonDetailModalProps) {
  if (!isOpen) return null;

  const filteredLessons = lessons.filter(l => l.status === type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold capitalize">{type} Lessons</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          {filteredLessons.map((lesson) => (
            <div key={lesson.id} className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Lesson #{lesson.id}</h3>
                  <p className="text-sm text-gray-600">Teacher: {lesson.teacher?.name || 'Unassigned'}</p>
                  <p className="text-sm text-gray-600">
                    <DateTime dateString={lesson.date} formatType="date" />
                  </p>
                  <p className="text-sm">Events: {lesson.events?.length || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    €{lesson.commission?.price_per_hour || 0}/hour
                  </p>
                  <p className="text-sm text-gray-600">Commission Rate</p>
                </div>
              </div>
              
              {lesson.events && lesson.events.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-sm font-medium">Events:</p>
                  <div className="space-y-1 mt-1">
                    {lesson.events.map((event: any) => (
                      <div key={event.id} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded flex justify-between">
                        <span><DateTime dateString={event.date} formatType="time" /></span>
                        <span>{event.duration || 0}min</span>
                        <span>{event.kite?.model || 'No kite'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
