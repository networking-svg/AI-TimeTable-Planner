
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { TimetableInputs, Timetable, TimetableResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper to generate a schema that matches the specific days requested by the user
const generateDynamicSchema = (inputs: TimetableInputs) => {
    const daysToUse = inputs.days && inputs.days.length > 0 ? inputs.days : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    const dayProperties = daysToUse.reduce((acc: any, day: string) => {
        acc[day] = { 
            type: Type.ARRAY, 
            items: { 
                type: Type.OBJECT, 
                properties: { 
                    time: {type: Type.STRING}, 
                    subject: {type: Type.STRING}, 
                    teacher: {type: Type.STRING} 
                },
                required: ['time', 'subject', 'teacher']
            } 
        };
        return acc;
    }, {});

    const classProperties = inputs.classes.reduce((acc: any, currentClass) => {
        acc[currentClass.name] = {
            type: Type.OBJECT,
            description: `Schedule for ${currentClass.name}`,
            properties: dayProperties,
            required: daysToUse // Ensure all days are present in the response
        };
        return acc;
    }, {});

    return {
        type: Type.OBJECT,
        properties: {
            timetable: {
                type: Type.OBJECT,
                description: "The complete timetable, with class names as keys.",
                properties: classProperties,
                required: inputs.classes.map(c => c.name)
            },
        },
        required: ['timetable'],
    };
};

export const generateTimetable = async (inputs: TimetableInputs): Promise<Timetable> => {
    const dynamicSchema = generateDynamicSchema(inputs);

    const systemInstruction = `You are an expert school-timetable planner. Your task is to generate a complete, conflict-free school timetable.
    
    CRITICAL RULES:
    1. **Session Counts**: You MUST schedule EXACTLY the number of sessions requested for each subject. If a class needs 4 Math sessions, there must be exactly 4 Math slots in the timetable for that class. Count them carefully.
    2. **Teacher Conflicts**: No teacher can teach two classes at the same time.
    3. **Teacher Assignment**: If a specific 'teacherId' is provided for a subject, you MUST use that teacher. If not, use the teacher's name provided in the general teacher list who teaches that subject.
    4. **Class Conflicts**: No class can have two subjects at the same time.
    5. **Time Slots**: Create time slots starting from the school start time. You can combine slots for double periods.
    6. **Fixed Breaks**: You MUST include the defined fixed breaks (like Lunch, Recess) at their specific start and end times for EVERY class and EVERY day. The subject for these slots should be the break name (e.g., 'Lunch').
    7. **Days**: Only schedule on the provided days.
    8. **Double Periods**: If a subject requires a 'Double Period' or is a long block like 'Main Lesson', try to schedule consecutive slots or a longer time slot for it.
    
    Optimization:
    - Distribute sessions evenly across the week.
    - Do not schedule academic classes during break times.
    `;
    
    let detailedRequirements = "Detailed Requirements per Class:\n";
    inputs.classes.forEach(cls => {
        detailedRequirements += `Class '${cls.name}':\n`;
        cls.subjects.forEach(sub => {
            const teacherObj = sub.teacherId ? inputs.teachers.find(t => t.id === sub.teacherId) : null;
            const teacherInfo = teacherObj ? `${teacherObj.name} (ID: ${teacherObj.id})` : "Any available teacher";
            const double = sub.doublePeriod ? " (Double Period Preferred)" : "";
            detailedRequirements += `  - Subject: "${sub.name}" needs ${sub.sessionsPerWeek} sessions/week${double}. Teacher: ${teacherInfo}.\n`;
        });
    });

    const breakList = inputs.breaks && inputs.breaks.length > 0 
        ? inputs.breaks.map(b => `- ${b.name}: ${b.startTime} to ${b.endTime}`).join('\n') 
        : "No fixed breaks.";

    const prompt = `
    School Information:
    - Days: ${inputs.days.join(', ')}
    - Hours: ${inputs.schoolHours.start} to ${inputs.schoolHours.end}
    - Session Duration: ${inputs.sessionDuration} minutes (Approximate. Use this as a base but adjust for breaks or double periods)
    
    Fixed Breaks (MUST be included for all classes at these exact times):
    ${breakList}
    
    ${detailedRequirements}
    
    Constraints: ${inputs.constraints}
    
    Full Input JSON: ${JSON.stringify(inputs)}
    
    Generate the timetable JSON matching the schema. 
    - Ensure every single session count is met exactly.
    - Ensure breaks are exactly at the times specified.
    - Fill the rest of the time with classes according to session duration.
    - 'Main Lesson' typically is the first block of the day and can be longer than a standard session.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: dynamicSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse: TimetableResponse = JSON.parse(jsonText);
        return parsedResponse.timetable;

    } catch (error) {
        console.error("Error generating timetable:", error);
        throw new Error("Failed to generate timetable. Please check your constraints or try again.");
    }
};

export const modifyTimetable = async (currentTimetable: Timetable, modificationRequest: string, originalInputs: TimetableInputs): Promise<Timetable> => {
    const dynamicSchema = generateDynamicSchema(originalInputs);
    
    const systemInstruction = `You are an expert school-timetable planner. Modify the timetable based on the user request.
    - Maintain all original constraints (no teacher overlaps, correct session counts, fixed breaks) unless the user explicitly asks to change them.
    - If moving a class, ensure the new slot is valid and doesn't create a conflict.
    - Return the full updated timetable JSON.`;

    const prompt = `
    Original Inputs: ${JSON.stringify(originalInputs)}
    Current Timetable: ${JSON.stringify(currentTimetable)}
    User Request: "${modificationRequest}"

    Update the timetable.
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: dynamicSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse: TimetableResponse = JSON.parse(jsonText);
        return parsedResponse.timetable;

    } catch (error) {
        console.error("Error modifying timetable:", error);
        throw new Error("Failed to modify timetable.");
    }
};
