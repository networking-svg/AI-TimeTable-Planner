
import React, { useState, useMemo } from 'react';
import type { Timetable, TimetableInputs, Teacher } from '../types';
import { ClockIcon } from './Icons';

interface TeacherAvailabilityProps {
  timetableData: Timetable;
  teachers: Teacher[];
  days: string[];
  breaks: TimetableInputs['breaks'];
}

interface TeacherStatus {
    teacher: Teacher;
    status: 'Available' | 'Busy';
    location?: string; // Class name if busy
    subject?: string;
}

const TeacherAvailability: React.FC<TeacherAvailabilityProps> = ({ timetableData, teachers, days, breaks }) => {
  const [selectedDay, setSelectedDay] = useState(days[0] || '');

  // 1. Aggregate all unique time slots across all classes for consistency
  const allTimeSlots = useMemo(() => {
    const timeSet = new Set<string>();
    Object.values(timetableData).forEach(classSchedule => {
        if (classSchedule[selectedDay]) {
            classSchedule[selectedDay].forEach(slot => timeSet.add(slot.time));
        }
    });
    return Array.from(timeSet).sort((a, b) => {
        const startA = a.split('-')[0].trim();
        const startB = b.split('-')[0].trim();
        return startA.localeCompare(startB);
    });
  }, [timetableData, selectedDay]);

  // 2. For each time slot, calculate status of every teacher
  const availabilityData = useMemo(() => {
      return allTimeSlots.map(time => {
          const statusMap: TeacherStatus[] = [];
          
          // Check if this slot is a universal break
          // We check a sample class to see if it's a break.
          // (Refinement: Check if ALL classes have a break or if it's in the 'breaks' input list)
          const isFixedBreak = breaks?.some(b => {
              // Simple string match on start time or check if time string falls within break
              // For simplicity, we assume exact string match from generated timetable to break definition is tricky,
              // so we rely on the subject name in the timetable being a Break Name.
              return false; // Handled dynamically below
          });

          // Identify busy teachers
          const busyTeacherIds = new Set<string>();
          const busyDetails = new Map<string, { className: string, subject: string }>();

          Object.entries(timetableData).forEach(([className, schedule]) => {
              const slot = schedule[selectedDay]?.find(s => s.time === time);
              if (slot && slot.teacher && slot.teacher !== 'N/A') {
                  // Normalize teacher name/id matching
                  // The timetable usually has "Name" or "Name (ID)"
                  // We try to match with the teacher list.
                  const matchedTeacher = teachers.find(t => 
                      slot.teacher === t.name || 
                      slot.teacher === `${t.name} (ID: ${t.id})` ||
                      slot.teacher.includes(t.name)
                  );
                  
                  if (matchedTeacher) {
                      busyTeacherIds.add(matchedTeacher.id);
                      busyDetails.set(matchedTeacher.id, { className, subject: slot.subject });
                  }
              }
          });

          // Determine if it looks like a Break slot (Subject is "Lunch", "Break" etc for most)
          // We take a sample from the first class
          const firstClass = Object.keys(timetableData)[0];
          const sampleSlot = timetableData[firstClass]?.[selectedDay]?.find(s => s.time === time);
          const isBreakSubject = ['Lunch', 'Break', 'Recess', 'Assembly'].includes(sampleSlot?.subject || '');

          teachers.forEach(teacher => {
              if (busyTeacherIds.has(teacher.id)) {
                  const details = busyDetails.get(teacher.id);
                  statusMap.push({
                      teacher,
                      status: 'Busy',
                      location: details?.className,
                      subject: details?.subject
                  });
              } else {
                  statusMap.push({
                      teacher,
                      status: 'Available',
                      subject: isBreakSubject ? sampleSlot?.subject : undefined
                  });
              }
          });
          
          return { time, teachers: statusMap, isBreak: isBreakSubject, breakName: sampleSlot?.subject };
      });
  }, [allTimeSlots, timetableData, teachers, selectedDay, breaks]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Day Selector */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-4 px-4" aria-label="Tabs">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`${day === selectedDay ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                {day}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="overflow-x-auto p-4">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border-b-2 border-gray-200 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                            Time Slot
                        </th>
                        <th className="border-b-2 border-gray-200 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Teacher Availability
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {availabilityData.map((row) => (
                        <tr key={row.time} className={row.isBreak ? "bg-blue-50" : ""}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900 flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-gray-400"/>
                                {row.time}
                            </td>
                            <td className="px-4 py-4">
                                {row.isBreak ? (
                                    <div className="text-center font-bold text-blue-600 py-1">
                                        {row.breakName || "Break"}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {/* Available Teachers Section */}
                                        <div>
                                            <span className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2 block">
                                                Available for Substitution
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {row.teachers.filter(t => t.status === 'Available').map((item) => (
                                                    <span key={item.teacher.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                        {item.teacher.name}
                                                    </span>
                                                ))}
                                                {row.teachers.filter(t => t.status === 'Available').length === 0 && (
                                                    <span className="text-xs text-gray-400 italic">No teachers available</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Busy Teachers Section (Optional / Collapsible could be nice, but simple list is fine) */}
                                        <div>
                                             <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                                                Busy
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                 {row.teachers.filter(t => t.status === 'Busy').map((item) => (
                                                    <span key={item.teacher.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs text-gray-500 bg-gray-100 border border-gray-200" title={`Teaching ${item.subject} in ${item.location}`}>
                                                        {item.teacher.name} <span className="ml-1 text-gray-400">({item.location})</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default TeacherAvailability;
