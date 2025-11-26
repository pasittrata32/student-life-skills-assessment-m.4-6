import { EvaluationData, Student, Teacher } from '../types';

/**
 * URL ของ Google Apps Script Web App
 */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzbmWcyt2VoF04D48fTIR3BYIwRQ5iCRAiHkreU6Tb5iQRtGEhwgQL9orlY1LRpXrBg/exec";

/**
 * สร้างชื่อชีตตามระดับชั้นและห้อง เช่น "M.4-A"
 */
const getSheetName = (teacher: Teacher): string => {
  return `${teacher.classLevel}-${teacher.room}`.replace(/\s/g, '');
};

/**
 * บันทึกข้อมูลลง Google Sheets
 */
export const saveEvaluationToSheet = async (
  student: Student,
  teacher: Teacher,
  evaluation: EvaluationData
): Promise<boolean> => {
  if (!SCRIPT_URL) {
    console.warn("Please Configure SCRIPT_URL in services/googleSheetsService.ts");
    return false;
  }

  try {
    // เตรียมข้อมูล payload
    const payload = {
      ...evaluation,
      studentName: student.name,
      classLevel: teacher.classLevel,
      room: teacher.room
    };

    // เตรียม body request
    const body = {
      sheetName: getSheetName(teacher),
      payload: payload
    };

    // ส่ง Request ไปยัง Google Apps Script
    // ใช้ Content-Type: text/plain เพื่อหลีกเลี่ยง CORS preflight (OPTIONS request)
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    return result.result === "success";

  } catch (error) {
    console.error("Error saving to Google Sheets:", error);
    return false;
  }
};

/**
 * ดึงข้อมูลทั้งหมดของห้องนั้นๆ จาก Google Sheets
 */
export const getEvaluationsFromSheet = async (
  teacher: Teacher
): Promise<Record<number, EvaluationData> | null> => {
  if (!SCRIPT_URL) {
    return null;
  }

  try {
    const sheetName = getSheetName(teacher);
    const url = `${SCRIPT_URL}?sheetName=${sheetName}`;

    const response = await fetch(url);
    const result = await response.json();

    if (result.result === "success") {
      return result.data;
    }
    return null;

  } catch (error) {
    console.error("Error loading from Google Sheets:", error);
    return null;
  }
};