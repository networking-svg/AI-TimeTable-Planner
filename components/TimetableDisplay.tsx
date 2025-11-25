
import React, { useState, useMemo } from 'react';
import type { Timetable, TimetableInputs } from '../types';
import { exportTimetableToPDF } from '../utils/pdfGenerator';
import { DownloadIcon, EditIcon, ArrowPathIcon, UserGroupIcon } from './Icons';
import TeacherAvailability from './TeacherAvailability';

interface TimetableDisplayProps {
  timetableData: Timetable;
  originalInputs: TimetableInputs;
  onModify: (modificationRequest: string) => void;
  onBack: () => void;
  isModifying: boolean;
  onSessionMove: (className: string, fromDay: string, fromTime: string, toDay: string, toTime: string) => void;
}

const TimetableDisplay: React.FC<TimetableDisplayProps> = ({ timetableData, originalInputs, onModify, onBack, isModifying, onSessionMove }) => {
  const classNames = Object.keys(timetableData);
  const [selectedClass, setSelectedClass] = useState(classNames[0] || '');
  const [modificationRequest, setModificationRequest] = useState('');
  const [dragOverCell, setDragOverCell] = useState<{day: string, time: string} | null>(null);
  const [viewMode, setViewMode] = useState<'class' | 'substitution'>('class');

  // Extract unique time slots across all days for the selected class
  const { timeSlots, days } = useMemo(() => {
    if (!selectedClass || !timetableData[selectedClass]) return { timeSlots: [], days: [] };
    const days = originalInputs.days;
    const allSlots = new Set<string>();
    
    days.forEach(day => {
        timetableData[selectedClass][day]?.forEach(slot => allSlots.add(slot.time));
    });
    
    // Sort times. Assumes format HH:MM-HH:MM
    const sortedTimeSlots = Array.from(allSlots).sort((a, b) => {
        const startA = a.split('-')[0].trim();
        const startB = b.split('-')[0].trim();
        return startA.localeCompare(startB);
    });
    
    return { timeSlots: sortedTimeSlots, days };
  }, [selectedClass, timetableData, originalInputs.days]);
  
  const handleModify = () => {
    if (modificationRequest.trim()) {
      onModify(modificationRequest);
    }
  };

  // Helper to check if a specific time slot is a full-width break (same subject across all days)
  const getRowType = (time: string): { type: 'break' | 'normal', label?: string } => {
      if (!timetableData[selectedClass]) return { type: 'normal' };
      
      const slots = days.map(day => timetableData[selectedClass][day]?.find(s => s.time === time));
      const firstSubject = slots[0]?.subject;
      
      // If all days have the same subject at this time, and it's likely a break/lunch
      const isConsistent = slots.every(s => s && s.subject === firstSubject);
      
      // Check if it's a known break from inputs or just labelled as such
      const isBreakName = originalInputs.breaks?.some(b => b.name === firstSubject) || ['Break', 'Lunch', 'Recess', 'Assembly'].includes(firstSubject || '');

      if (isConsistent && isBreakName && firstSubject) {
          return { type: 'break', label: firstSubject };
      }
      return { type: 'normal' };
  };

  // --- Drag and Drop Handlers ---

  const handleDragStart = (e: React.DragEvent, day: string, time: string) => {
      e.dataTransfer.setData("application/json", JSON.stringify({ className: selectedClass, day, time }));
      e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, day: string, time: string) => {
      e.preventDefault(); // Necessary to allow dropping
      if (dragOverCell?.day !== day || dragOverCell?.time !== time) {
          setDragOverCell({ day, time });
      }
  };
  
  const handleDragLeave = () => {
      setDragOverCell(null);
  };

  const handleDrop = (e: React.DragEvent, targetDay: string, targetTime: string) => {
      e.preventDefault();
      setDragOverCell(null);
      
      try {
          const data = JSON.parse(e.dataTransfer.getData("application/json"));
          if (data.className !== selectedClass) {
              return; 
          }
          onSessionMove(selectedClass, data.day, data.time, targetDay, targetTime);
      } catch (err) {
          console.error("Failed to parse drag data", err);
      }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 p-4 bg-white rounded-lg shadow-md">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Generated Timetable</h2>
            <p className="text-sm text-gray-500">View class schedules or plan substitutions</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
           {/* View Toggle */}
           <div className="bg-gray-100 p-1 rounded-lg flex items-center mr-2">
                <button 
                    onClick={() => setViewMode('class')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'class' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Class Schedule
                </button>
                <button 
                    onClick={() => setViewMode('substitution')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'substitution' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <UserGroupIcon className="w-4 h-4" />
                    Substitution / Free Teachers
                </button>
           </div>

          <button onClick={onBack} className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Edit Inputs
          </button>
          
          {viewMode === 'class' && (
              <button onClick={() => exportTimetableToPDF(timetableData, selectedClass, days)} disabled={!selectedClass} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 ml-auto xl:ml-0">
                <DownloadIcon className="w-5 h-5"/>
                Export PDF
              </button>
          )}
        </div>
      </div>
      
      {/* Substitution View */}
      {viewMode === 'substitution' && (
          <TeacherAvailability 
            timetableData={timetableData} 
            teachers={originalInputs.teachers}
            days={originalInputs.days}
            breaks={originalInputs.breaks}
          />
      )}

      {/* Class View */}
      {viewMode === 'class' && (
        <>
            {/* Modification Section */}
            <div className="p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Request a Change</h3>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                <input 
                    type="text" 
                    value={modificationRequest} 
                    onChange={(e) => setModificationRequest(e.target.value)} 
                    placeholder="e.g., 'Move Grade 8 Math from Monday to Tuesday'" 
                    className="p-2 border rounded w-full focus:ring-2 focus:ring-indigo-500"
                />
                <button onClick={handleModify} disabled={isModifying} className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                    {isModifying ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <EditIcon className="w-5 h-5"/>}
                    {isModifying ? 'Updating...' : 'Apply Change'}
                </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    <b>Drag and Drop</b> cells to rearrange.
                </p>
            </div>

            {/* Timetable View */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
                {/* Class Selector Tabs */}
                <div className="mb-4 border-b border-gray-200 overflow-x-auto">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    {classNames.map((name) => (
                    <button
                        key={name}
                        onClick={() => setSelectedClass(name)}
                        className={`${name === selectedClass ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm transition-colors duration-200`}
                    >
                        {name}
                    </button>
                    ))}
                </nav>
                </div>
                
                {/* Table Container */}
                <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full border-collapse">
                    <thead>
                    <tr className="bg-white">
                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-700 bg-gray-50 w-32">Time</th>
                        {days.map(day => (
                            <th key={day} className="border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-700 bg-gray-50">
                                {day}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {timeSlots.map(time => {
                        const rowInfo = getRowType(time);
                        
                        if (rowInfo.type === 'break') {
                            return (
                                <tr key={time}>
                                    <td className="border border-gray-300 px-2 py-2 text-center text-sm font-medium text-gray-900 whitespace-nowrap bg-white">
                                        {time}
                                    </td>
                                    <td colSpan={days.length} className="border border-gray-300 px-4 py-2 text-center text-sm font-bold text-blue-700 bg-blue-50">
                                        {rowInfo.label}
                                    </td>
                                </tr>
                            )
                        }

                        return (
                            <tr key={time}>
                            <td className="border border-gray-300 px-2 py-4 text-center text-sm font-medium text-gray-900 whitespace-nowrap bg-white">
                                {time}
                            </td>
                            {days.map(day => {
                                const slot = timetableData[selectedClass]?.[day]?.find(s => s.time === time);
                                const isOver = dragOverCell?.day === day && dragOverCell?.time === time;
                                
                                return (
                                <td 
                                    key={`${day}-${time}`} 
                                    className={`border border-gray-300 px-2 py-2 text-center align-middle transition-all duration-200
                                        ${isOver ? 'bg-indigo-100 ring-2 ring-inset ring-indigo-400' : 'bg-white hover:bg-gray-50'}
                                    `}
                                    draggable={!!slot && !!slot.subject}
                                    onDragStart={(e) => handleDragStart(e, day, time)}
                                    onDragOver={(e) => handleDragOver(e, day, time)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, day, time)}
                                >
                                    {slot && slot.subject ? (
                                    <div className="flex flex-col items-center justify-center h-full cursor-move">
                                        <span className="font-semibold text-gray-800 text-sm">{slot.subject}</span>
                                        {slot.teacher && slot.teacher !== 'N/A' && (
                                            <span className="text-xs text-gray-500 mt-1">{slot.teacher}</span>
                                        )}
                                    </div>
                                    ) : (
                                        <div className="w-full h-12 flex items-center justify-center text-gray-300 cursor-default">
                                            -
                                        </div>
                                    )}
                                </td>
                                );
                            })}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default TimetableDisplay;
