
interface KiteDetailModalProps {
  kites: any[];
  isOpen: boolean;
  onClose: () => void;
}

export default function KiteDetailModal({ kites, isOpen, onClose }: KiteDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Kite Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          {kites.map((kite) => (
            <div key={kite.id} className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{kite.model}</h3>
                  <p className="text-sm text-gray-600">Size: {kite.size}m</p>
                  <p className="text-sm text-gray-600">Serial: {kite.serial_id}</p>
                  <p className="text-sm text-gray-600">Brand: {kite.brand || 'Unknown'}</p>
                </div>
                <div className="text-right">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">{kite.events?.length || 0}</div>
                      <div className="text-xs text-gray-600">Events Today</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">{kite.assignedTeachers?.length || 0}</div>
                      <div className="text-xs text-gray-600">Teachers</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {kite.events && kite.events.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Events:</p>
                  <div className="space-y-1">
                    {kite.events.map((event: any) => (
                      <div key={event.id} className="flex justify-between items-center p-2 bg-purple-50 rounded text-sm">
                        <span>Event #{event.id}</span>
                        <span>{event.duration || 0}min</span>
                        <span>Teacher: {event.lesson?.teacher?.name || 'Unknown'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {kite.assignedTeachers && kite.assignedTeachers.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Assigned Teachers:</p>
                  <div className="flex flex-wrap gap-1">
                    {kite.assignedTeachers.map((teacher: any) => (
                      <span key={teacher.id} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {teacher.name}
                      </span>
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
