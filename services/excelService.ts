import * as XLSX from 'xlsx';
import { EvaluationData, Indicator, Student, Teacher } from '../types';
import { INDICATORS, SCHOOL_NAME } from '../constants';

export const exportToExcel = (
  teacher: Teacher,
  students: Student[],
  evaluations: Record<number, EvaluationData>
) => {
  // Create header row
  const headers = [
    'เลขที่',
    'ชื่อ-นามสกุล',
    'ระดับชั้น',
    'ห้อง',
    'ผู้ประเมิน',
    'วันที่ประเมิน',
  ];

  // Add columns for each question
  INDICATORS.forEach((ind) => {
    ind.questions.forEach((q) => {
      headers.push(`ข้อ ${q.id}`);
    });
  });

  headers.push('คะแนนรวม (90)', 'ร้อยละ (%)', 'ระดับคุณภาพ', 'จุดเด่น', 'จุดที่ควรพัฒนา');

  const rows = students.map((student) => {
    const evalData = evaluations[student.id];
    
    if (!evalData) {
        return [student.id, student.name, student.classLevel, student.room, '-', '-', ...Array(30).fill('-'), '-', '-', '-', '-', '-'];
    }

    let totalScore = 0;
    const questionScores = [];

    for (let i = 1; i <= 30; i++) {
        const score = evalData.scores[i] || 0;
        questionScores.push(score);
        totalScore += score;
    }

    const percentage = (totalScore / 90) * 100;
    let quality = '';
    if (percentage >= 75) quality = 'ดีเยี่ยม';
    else if (percentage >= 50) quality = 'ดี';
    else if (percentage >= 25) quality = 'พอใช้';
    else quality = 'ปรับปรุง';

    return [
      student.id,
      student.name,
      student.classLevel,
      student.room,
      evalData.evaluatorName,
      new Date(evalData.date).toLocaleDateString('th-TH'),
      ...questionScores,
      totalScore,
      percentage.toFixed(2),
      quality,
      evalData.strengths || '-',
      evalData.improvements || '-'
    ];
  });

  const wsData = [
    [SCHOOL_NAME],
    [`รายงานผลการประเมินทักษะชีวิต ชั้น ${teacher.classLevel} ห้อง ${teacher.room}`],
    [`ครูประจำชั้น: ${teacher.name}`],
    [],
    headers,
    ...rows
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Merge title rows
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "ผลการประเมิน");
  XLSX.writeFile(wb, `LifeSkills_Evaluation_${teacher.classLevel}${teacher.room}.xlsx`);
};