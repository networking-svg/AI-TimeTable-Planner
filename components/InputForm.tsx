
import React, { useState } from 'react';
import type { TimetableInputs, Teacher, ClassInfo, Break } from '../types';
import { PlusIcon, TrashIcon, SparklesIcon, ArrowPathIcon } from './Icons';

interface InputFormProps {
  onGenerate: (inputs: TimetableInputs) => void;
  isLoading: boolean;
}

type SubjectInfo = ClassInfo['subjects'][number];

const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: 't1', name: 'Mrs. Sharma', subjects: ['Math', 'Science', 'Physics'], availability: {} },
    { id: 't2', name: 'Mr. Patil', subjects: ['Hindi', 'Marathi'], availability: {} },
    { id: 't3', name: 'Ms. D\'Souza', subjects: ['English', 'History', 'Main Lesson'], availability: {} },
    { id: 't4', name: 'Mr. Khan', subjects: ['Sports', 'Outdoor Sports'], availability: {} },
    { id: 't5', name: 'Ms. Rao', subjects: ['Art', 'Handwork', 'Music', 'Art (Drawing/Painting)', 'Art (3D Modelling)'], availability: {} },
    { id: 't6', name: 'Mr. Mehta', subjects: ['Main Lesson', 'Sociology/Art and Design', 'Business Studies'], availability: {} },
    { id: 't7', name: 'Ms. Nair', subjects: ['ICT', 'Economics', 'Computer Science'], availability: {} },
    { id: 't8', name: 'Mrs. Kulkarni', subjects: ['Main Lesson', 'Maths'], availability: {} }
  ]);

  const [classes, setClasses] = useState<ClassInfo[]>([
    {
      id: 'c1',
      name: 'Grade VI',
      subjects: [
        { name: 'Main Lesson', sessionsPerWeek: 5, doublePeriod: true },
        { name: 'English', sessionsPerWeek: 3 },
        { name: 'Math', sessionsPerWeek: 3 },
        { name: 'Hindi', sessionsPerWeek: 3 },
        { name: 'Marathi', sessionsPerWeek: 2 },
        { name: 'Music', sessionsPerWeek: 1 },
        { name: 'Outdoor Sports', sessionsPerWeek: 2 },
        { name: 'Art (Drawing/Painting)', sessionsPerWeek: 1 },
        { name: 'Art (3D Modelling)', sessionsPerWeek: 1 },
        { name: 'Handwork', sessionsPerWeek: 1 },
        { name: 'Electives', sessionsPerWeek: 1 }
      ]
    },
    {
      id: 'c2',
      name: 'Grade VII',
      subjects: [
        { name: 'Main Lesson', sessionsPerWeek: 5, doublePeriod: true },
        { name: 'Maths', sessionsPerWeek: 4 },
        { name: 'English', sessionsPerWeek: 3 },
        { name: 'Hindi', sessionsPerWeek: 3 },
        { name: 'Marathi', sessionsPerWeek: 2 },
        { name: 'Music', sessionsPerWeek: 1 },
        { name: 'Outdoor Sports', sessionsPerWeek: 2 },
        { name: 'Handwork', sessionsPerWeek: 1 },
        { name: 'Art', sessionsPerWeek: 2 },
        { name: 'Electives', sessionsPerWeek: 1 }
      ]
    },
    {
      id: 'c3',
      name: 'Grade VIII',
      subjects: [
        { name: 'Main Lesson', sessionsPerWeek: 5, doublePeriod: true },
        { name: 'Math', sessionsPerWeek: 3 },
        { name: 'English', sessionsPerWeek: 3 },
        { name: 'Hindi', sessionsPerWeek: 3 },
        { name: 'Marathi', sessionsPerWeek: 2 },
        { name: 'Outdoor Sports', sessionsPerWeek: 1 },
        { name: 'Handwork', sessionsPerWeek: 1 },
        { name: 'Art (3D Modelling)', sessionsPerWeek: 2 },
        { name: 'Music', sessionsPerWeek: 1 },
        { name: 'Electives', sessionsPerWeek: 1 }
      ]
    },
    {
      id: 'c4',
      name: 'Grade IX',
      subjects: [
        { name: 'Main Lesson', sessionsPerWeek: 5, doublePeriod: true },
        { name: 'Math', sessionsPerWeek: 4 },
        { name: 'Science', sessionsPerWeek: 3 },
        { name: 'English', sessionsPerWeek: 2 },
        { name: 'Hindi', sessionsPerWeek: 2 },
        { name: 'Sociology/Art and Design', sessionsPerWeek: 2 },
        { name: 'Business Studies', sessionsPerWeek: 2 },
        { name: 'ICT', sessionsPerWeek: 2 },
        { name: 'Outdoor Sports', sessionsPerWeek: 1 },
        { name: 'Music', sessionsPerWeek: 1 },
        { name: 'Electives', sessionsPerWeek: 1 }
      ]
    },
    {
      id: 'c5',
      name: 'Grade X',
      subjects: [
        { name: 'Art & Design', sessionsPerWeek: 3 },
        { name: 'English', sessionsPerWeek: 3 },
        { name: 'Math', sessionsPerWeek: 3 },
        { name: 'Hindi', sessionsPerWeek: 2 },
        { name: 'Science', sessionsPerWeek: 2 },
        { name: 'Sports', sessionsPerWeek: 1 },
        { name: 'ICT / Economics', sessionsPerWeek: 2 },
        { name: 'Business Studies', sessionsPerWeek: 2 },
        { name: 'Handwork', sessionsPerWeek: 1 },
        { name: 'Marathi', sessionsPerWeek: 1 }
      ]
    }
  ]);

  const [sessionDuration, setSessionDuration] = useState(45);
  const [days, setDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [schoolHours, setSchoolHours] = useState({ start: '08:05', end: '15:30' });
  const [breaks, setBreaks] = useState<Break[]>([
      { id: 'b1', name: 'Break', startTime: '10:15', endTime: '10:30'},
      { id: 'b2', name: 'Lunch', startTime: '12:00', endTime: '12:30'}
  ]);
  const [constraints, setConstraints] = useState('');

  const handleAddTeacher = () => {
    setTeachers([...teachers, { id: `t${Date.now()}`, name: '', subjects: [], availability: {} }]);
  };

  const handleRemoveTeacher = (id: string) => {
    setTeachers(teachers.filter(t => t.id !== id));
  };

  const handleTeacherChange = <K extends keyof Teacher>(index: number, field: K, value: Teacher[K]) => {
    const newTeachers = [...teachers];
    newTeachers[index][field] = value;
    setTeachers(newTeachers);
  };
  
  const handleAddClass = () => {
    setClasses([...classes, { id: `c${Date.now()}`, name: '', subjects: [] }]);
  };

  const handleRemoveClass = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
  };

  const handleClassChange = <K extends keyof ClassInfo>(index: number, field: K, value: ClassInfo[K]) => {
    const newClasses = [...classes];
    newClasses[index][field] = value;
    setClasses(newClasses);
  };
  
  const handleAddSubjectToClass = (classIndex: number) => {
      const newClasses = [...classes];
      newClasses[classIndex].subjects.push({ name: '', sessionsPerWeek: 1 });
      setClasses(newClasses);
  };
  
  const handleRemoveSubjectFromClass = (classIndex: number, subjectIndex: number) => {
    const newClasses = [...classes];
    newClasses[classIndex].subjects.splice(subjectIndex, 1);
    setClasses(newClasses);
  };

  const handleSubjectInClassChange = <K extends keyof SubjectInfo>(classIndex: number, subjectIndex: number, field: K, value: SubjectInfo[K]) => {
    const newClasses = [...classes];
    newClasses[classIndex].subjects[subjectIndex][field] = value;
    setClasses(newClasses);
  };

  const handleAddBreak = () => {
      setBreaks([...breaks, { id: `b${Date.now()}`, name: '', startTime: '', endTime: '' }]);
  };

  const handleRemoveBreak = (index: number) => {
      const newBreaks = [...breaks];
      newBreaks.splice(index, 1);
      setBreaks(newBreaks);
  };

  const handleBreakChange = <K extends keyof Break>(index: number, field: K, value: Break[K]) => {
      const newBreaks = [...breaks];
      newBreaks[index][field] = value;
      setBreaks(newBreaks);
  };

  const handleSubmit = () => {
    onGenerate({ teachers, classes, sessionDuration, days, schoolHours, breaks, constraints });
  };

  return (
    <div className="space-y-8">
        {/* Teachers Section */}
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Teachers</h2>
            {teachers.map((teacher, index) => (
                <div key={teacher.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-4 p-4 border rounded-md">
                    <input type="text" placeholder="Teacher Name" value={teacher.name} onChange={(e) => handleTeacherChange(index, 'name', e.target.value)} className="p-2 border rounded col-span-1" />
                    <input type="text" placeholder="Subjects (comma-separated)" value={teacher.subjects.join(', ')} onChange={(e) => handleTeacherChange(index, 'subjects', e.target.value.split(',').map(s => s.trim()))} className="p-2 border rounded col-span-1" />
                    <button onClick={() => handleRemoveTeacher(teacher.id)} className="text-red-500 hover:text-red-700 justify-self-end"><TrashIcon className="w-5 h-5"/></button>
                </div>
            ))}
            <button onClick={handleAddTeacher} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                <PlusIcon className="w-5 h-5"/> Add Teacher
            </button>
        </div>

        {/* Classes Section */}
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Classes / Grades</h2>
            {classes.map((cls, classIndex) => (
                <div key={cls.id} className="mb-6 p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-4">
                      <input type="text" placeholder="Class Name" value={cls.name} onChange={(e) => handleClassChange(classIndex, 'name', e.target.value)} className="p-2 border rounded font-semibold text-lg w-1/3" />
                      <button onClick={() => handleRemoveClass(cls.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                    <h3 className="font-semibold text-gray-700 mb-2">Subjects for {cls.name || 'this class'}:</h3>
                    {cls.subjects.map((subject, subjectIndex) => (
                        <div key={subjectIndex} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center mb-2 bg-gray-50 p-2 rounded">
                          <div className="md:col-span-3">
                            <input 
                                type="text" 
                                placeholder="Subject Name" 
                                value={subject.name} 
                                onChange={(e) => handleSubjectInClassChange(classIndex, subjectIndex, 'name', e.target.value)} 
                                className="p-2 border rounded w-full" 
                            />
                          </div>
                          <div className="md:col-span-3">
                            <select 
                                value={subject.teacherId || ''} 
                                onChange={(e) => handleSubjectInClassChange(classIndex, subjectIndex, 'teacherId', e.target.value)} 
                                className="p-2 border rounded w-full bg-white"
                            >
                                <option value="">Select Teacher (Auto)</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} {t.subjects.length > 0 ? `(${t.subjects.join(', ')})` : ''}
                                    </option>
                                ))}
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <input 
                                type="number" 
                                placeholder="Sessions/Week" 
                                value={subject.sessionsPerWeek} 
                                min="1" 
                                onChange={(e) => handleSubjectInClassChange(classIndex, subjectIndex, 'sessionsPerWeek', parseInt(e.target.value))} 
                                className="p-2 border rounded w-full" 
                            />
                          </div>
                          <div className="md:col-span-3 flex items-center gap-2 text-sm text-gray-600 justify-center">
                              <input id={`double-${cls.id}-${subjectIndex}`} type="checkbox" checked={!!subject.doublePeriod} onChange={(e) => handleSubjectInClassChange(classIndex, subjectIndex, 'doublePeriod', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                              <label htmlFor={`double-${cls.id}-${subjectIndex}`}>Double Period</label>
                           </div>
                          <div className="md:col-span-1 flex justify-end">
                            <button onClick={() => handleRemoveSubjectFromClass(classIndex, subjectIndex)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                          </div>
                        </div>
                    ))}
                    <button onClick={() => handleAddSubjectToClass(classIndex)} className="flex items-center gap-2 mt-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                      <PlusIcon className="w-4 h-4" /> Add Subject
                    </button>
                </div>
            ))}
            <button onClick={handleAddClass} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                <PlusIcon className="w-5 h-5"/> Add Class
            </button>
        </div>

        {/* Settings Section */}
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">General Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block font-medium text-gray-700">Session Duration (minutes)</label>
                    <input type="number" value={sessionDuration} onChange={(e) => setSessionDuration(parseInt(e.target.value))} className="p-2 border rounded w-full mt-1" />
                </div>
                <div>
                    <label className="block font-medium text-gray-700">School Days</label>
                    <input type="text" value={days.join(', ')} onChange={(e) => setDays(e.target.value.split(',').map(d => d.trim()))} className="p-2 border rounded w-full mt-1" />
                </div>
                <div>
                    <label className="block font-medium text-gray-700">School Hours (Start)</label>
                    <input type="time" value={schoolHours.start} onChange={(e) => setSchoolHours({...schoolHours, start: e.target.value})} className="p-2 border rounded w-full mt-1" />
                </div>
                <div>
                    <label className="block font-medium text-gray-700">School Hours (End)</label>
                    <input type="time" value={schoolHours.end} onChange={(e) => setSchoolHours({...schoolHours, end: e.target.value})} className="p-2 border rounded w-full mt-1" />
                </div>
            </div>

            {/* Breaks Section */}
            <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Breaks & Recess</h3>
                <p className="text-sm text-gray-500 mb-3">Define fixed breaks (e.g., Lunch, Recess) that apply to all classes.</p>
                {breaks.map((brk, index) => (
                    <div key={brk.id} className="flex flex-col md:flex-row gap-3 items-end md:items-center mb-3">
                        <div className="w-full md:w-1/3">
                            <label className="block text-xs font-medium text-gray-500">Name</label>
                            <input type="text" value={brk.name} onChange={(e) => handleBreakChange(index, 'name', e.target.value)} placeholder="e.g. Lunch" className="p-2 border rounded w-full" />
                        </div>
                        <div className="w-full md:w-1/4">
                            <label className="block text-xs font-medium text-gray-500">Start Time</label>
                            <input type="time" value={brk.startTime} onChange={(e) => handleBreakChange(index, 'startTime', e.target.value)} className="p-2 border rounded w-full" />
                        </div>
                        <div className="w-full md:w-1/4">
                            <label className="block text-xs font-medium text-gray-500">End Time</label>
                            <input type="time" value={brk.endTime} onChange={(e) => handleBreakChange(index, 'endTime', e.target.value)} className="p-2 border rounded w-full" />
                        </div>
                        <button onClick={() => handleRemoveBreak(index)} className="text-red-500 hover:text-red-700 pb-2"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                ))}
                <button onClick={handleAddBreak} className="flex items-center gap-2 mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    <PlusIcon className="w-4 h-4"/> Add Break
                </button>
            </div>

            <div className="mt-6">
                <label className="block font-medium text-gray-700">Additional Constraints / Notes</label>
                <textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} rows={3} className="p-2 border rounded w-full mt-1" placeholder="e.g., No sports on Monday morning. Mr. Smith is unavailable on Friday afternoons."></textarea>
            </div>
        </div>

        <div className="flex justify-center mt-8">
            <button onClick={handleSubmit} disabled={isLoading} className="flex items-center justify-center gap-3 w-full md:w-1/2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                    <>
                        <ArrowPathIcon className="w-6 h-6 animate-spin"/>
                        <span>Generating...</span>
                    </>
                ) : (
                    <>
                        <SparklesIcon className="w-6 h-6"/>
                        <span>Generate Timetable</span>
                    </>
                )}
            </button>
        </div>
    </div>
  );
};

export default InputForm;
