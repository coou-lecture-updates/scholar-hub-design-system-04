import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface TimetableExportProps {
  lectures: any[];
  userProfile: any;
}

const TimetableExport: React.FC<TimetableExportProps> = ({ lectures, userProfile }) => {
  const exportToPDF = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      '08:00 - 09:30',
      '09:45 - 11:15',
      '11:30 - 13:00',
      '13:15 - 14:45',
      '15:00 - 16:30',
      '16:45 - 18:15'
    ];

    const getClassForTimeSlot = (day: string, timeSlot: string) => {
      return lectures.find(lecture => 
        lecture.day === day && lecture.time === timeSlot
      );
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Class Timetable</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px;
            color: #333;
          }
          h1 { 
            color: #1e40af; 
            margin-bottom: 5px;
            text-align: center;
          }
          .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 20px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td { 
            border: 1px solid #ddd;
            padding: 10px;
            text-align: center;
            vertical-align: top;
          }
          th { 
            background: #1e40af;
            color: white;
            font-weight: 600;
          }
          .time-cell {
            background: #f3f4f6;
            font-weight: 500;
            width: 100px;
          }
          .class-cell {
            background: #dbeafe;
            border-radius: 4px;
            padding: 8px;
          }
          .class-subject {
            font-weight: 600;
            color: #1e40af;
          }
          .class-room {
            font-size: 12px;
            color: #666;
          }
          .empty-cell {
            background: #fafafa;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
          @media print {
            body { padding: 0; }
            table { font-size: 11px; }
          }
        </style>
      </head>
      <body>
        <h1>Class Timetable</h1>
        <p class="subtitle">
          ${userProfile?.level ? `${userProfile.level} Level` : ''} • 
          ${userProfile?.department || ''} • 
          ${userProfile?.faculty || ''} • 
          ${userProfile?.campus || ''} Campus
        </p>

        <table>
          <thead>
            <tr>
              <th>Time</th>
              ${days.map(day => `<th>${day}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${timeSlots.map(timeSlot => `
              <tr>
                <td class="time-cell">${timeSlot}</td>
                ${days.map(day => {
                  const classData = getClassForTimeSlot(day, timeSlot);
                  if (classData) {
                    return `
                      <td>
                        <div class="class-cell">
                          <div class="class-subject">${classData.subject}</div>
                          <div class="class-room">${classData.room}</div>
                          ${classData.lecturer ? `<div class="class-room">${classData.lecturer}</div>` : ''}
                        </div>
                      </td>
                    `;
                  }
                  return '<td class="empty-cell"></td>';
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <p class="footer">
          Generated from CoouConnect on ${new Date().toLocaleDateString()}
        </p>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-primary"
      onClick={exportToPDF}
      disabled={lectures.length === 0}
    >
      <Download className="h-4 w-4 mr-1" />
      Download
    </Button>
  );
};

export default TimetableExport;
