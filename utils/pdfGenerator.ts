
import type { Timetable, ClassSchedule } from '../types';

declare const jspdf: any;

const getTimeSlots = (classSchedule: ClassSchedule, days: string[]): string[] => {
  const timeSet = new Set<string>();
  days.forEach(day => {
    if (classSchedule[day]) {
      classSchedule[day].forEach(slot => timeSet.add(slot.time));
    }
  });
  return Array.from(timeSet).sort((a, b) => {
      const startA = a.split('-')[0].trim();
      const startB = b.split('-')[0].trim();
      return startA.localeCompare(startB);
  });
};

export const exportTimetableToPDF = (timetable: Timetable, selectedClass: string, days: string[]) => {
  const { jsPDF } = jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });

  const classSchedule = timetable[selectedClass];
  if (!classSchedule) return;

  const timeSlots = getTimeSlots(classSchedule, days);
  const tableHeader = ['Time', ...days];

  const tableBody: any[] = [];
  
  timeSlots.forEach(time => {
      // Check for break/merge
      const slots = days.map(day => classSchedule[day]?.find(s => s.time === time));
      const firstSubject = slots[0]?.subject;
      const isConsistent = slots.every(s => s && s.subject === firstSubject);
      const isBreak = ['Break', 'Lunch', 'Recess', 'Assembly'].includes(firstSubject || '');
      
      if (isConsistent && isBreak) {
           // Special handling for break row
           const row = [{
               content: time,
               styles: { valign: 'middle', halign: 'center' }
           }, {
               content: firstSubject,
               colSpan: days.length,
               styles: { 
                   halign: 'center', 
                   valign: 'middle', 
                   fillColor: [230, 240, 255], // Light blue for breaks
                   fontStyle: 'bold',
                   textColor: [0, 102, 204]
               }
           }];
           tableBody.push(row);
      } else {
          const row = [time];
          days.forEach(day => {
              const slot = classSchedule[day]?.find(s => s.time === time);
              row.push(slot ? `${slot.subject}\n${slot.teacher !== 'N/A' ? `(${slot.teacher})` : ''}` : '-');
          });
          tableBody.push(row);
      }
  });

  // Add Title
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text(`School Timetable - ${selectedClass}`, 14, 15);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);

  (doc as any).autoTable({
    head: [tableHeader],
    body: tableBody,
    startY: 30,
    theme: 'grid', // Grid theme for borders
    styles: {
      halign: 'center',
      valign: 'middle',
      cellPadding: 3,
      fontSize: 9,
      lineWidth: 0.1, // Border width
      lineColor: [200, 200, 200] // Light grey border
    },
    headStyles: {
      fillColor: [255, 255, 255], // White header
      textColor: [50, 50, 50], // Dark text
      fontStyle: 'bold',
      lineWidth: 0.1,
      lineColor: [150, 150, 150]
    },
    columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 30 } // Time column
    }
  });

  doc.save(`${selectedClass}_Timetable.pdf`);
};
