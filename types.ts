
export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  availability: { [day: string]: { start: string; end: string } };
}

export interface ClassInfo {
  id: string;
  name: string;
  subjects: {
    name: string;
    sessionsPerWeek: number;
    requiresLab?: boolean;
    doublePeriod?: boolean;
    teacherId?: string;
  }[];
}

export interface Break {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface SchoolHours {
  start: string;
  end:string;
}

export interface TimetableInputs {
  teachers: Teacher[];
  classes: ClassInfo[];
  sessionDuration: number;
  days: string[];
  schoolHours: SchoolHours;
  breaks: Break[];
  constraints: string;
}

export interface TimetableSlot {
  time: string;
  subject: string;
  teacher: string;
}

export type DaySchedule = TimetableSlot[];

export type ClassSchedule = {
  [day: string]: DaySchedule;
};

export type Timetable = {
  [className: string]: ClassSchedule;
};

export interface TimetableResponse {
    timetable: Timetable;
}
