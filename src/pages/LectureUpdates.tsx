
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Filter, Check, AlertCircle } from 'lucide-react';

const LectureUpdates = () => {
  const [filter, setFilter] = useState('all');
  
  // Sample lecture updates data
  const lectureUpdates = [
    {
      id: 1,
      subject: 'Mathematics',
      update: 'Lecture rescheduled to Friday 10:00 AM',
      date: '2025-05-02',
      type: 'reschedule',
      professor: 'Dr. Johnson',
      read: true
    },
    {
      id: 2,
      subject: 'Physics',
      update: 'Additional material uploaded for next lecture',
      date: '2025-05-01',
      type: 'material',
      professor: 'Prof. Smith',
      read: true
    },
    {
      id: 3,
      subject: 'Computer Science',
      update: 'Lecture cancelled for tomorrow',
      date: '2025-04-30',
      type: 'cancel',
      professor: 'Dr. Williams',
      read: false
    },
    {
      id: 4,
      subject: 'English Literature',
      update: 'Room changed to 205 for tomorrow\'s lecture',
      date: '2025-04-29',
      type: 'room-change',
      professor: 'Dr. Brown',
      read: false
    },
    {
      id: 5,
      subject: 'Biology',
      update: 'Review session added before exam',
      date: '2025-04-28',
      type: 'additional',
      professor: 'Prof. Wilson',
      read: false
    },
    {
      id: 6,
      subject: 'Chemistry',
      update: 'Lab preparation instructions posted',
      date: '2025-04-27',
      type: 'material',
      professor: 'Dr. Miller',
      read: true
    }
  ];
  
  // Filter updates based on selected filter
  const filteredUpdates = filter === 'all' 
    ? lectureUpdates 
    : filter === 'unread' 
      ? lectureUpdates.filter(update => !update.read) 
      : lectureUpdates.filter(update => update.type === filter);
  
  // Get badge color based on update type
  const getBadgeColor = (type) => {
    switch (type) {
      case 'reschedule':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancel':
        return 'bg-red-100 text-red-800';
      case 'material':
        return 'bg-green-100 text-green-800';
      case 'room-change':
        return 'bg-blue-100 text-blue-800';
      case 'additional':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get badge text based on update type
  const getBadgeText = (type) => {
    switch (type) {
      case 'reschedule':
        return 'Rescheduled';
      case 'cancel':
        return 'Cancelled';
      case 'material':
        return 'New Materials';
      case 'room-change':
        return 'Room Change';
      case 'additional':
        return 'Additional Session';
      default:
        return 'Update';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Lecture Updates</h2>
          
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">Filter:</div>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Updates</option>
              <option value="unread">Unread</option>
              <option value="reschedule">Rescheduled</option>
              <option value="cancel">Cancelled</option>
              <option value="material">Materials</option>
              <option value="room-change">Room Changes</option>
              <option value="additional">Additional Sessions</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredUpdates.length > 0 ? (
            filteredUpdates.map((update) => (
              <div 
                key={update.id} 
                className={`p-4 border rounded-lg flex items-start ${update.read ? 'bg-white' : 'bg-blue-50'}`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(update.type)}`}>
                      {getBadgeText(update.type)}
                    </span>
                    {!update.read && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        New
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-medium mb-1">{update.subject}</h3>
                  <p className="text-gray-700 mb-2">{update.update}</p>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Prof: {update.professor}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(update.date)}</span>
                  </div>
                </div>
                
                {update.read ? (
                  <div className="text-green-500 bg-green-50 p-1 rounded-full">
                    <Check size={16} />
                  </div>
                ) : (
                  <button className="text-blue-500 hover:bg-blue-50 p-1 rounded-full">
                    <Check size={16} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <div className="flex justify-center mb-3">
                <AlertCircle size={48} className="text-gray-300" />
              </div>
              <p className="text-gray-500">No updates match your filter</p>
              <button 
                onClick={() => setFilter('all')} 
                className="mt-2 text-primary text-sm hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LectureUpdates;
