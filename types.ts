export interface Student {
  id: number;
  name: string;
  classLevel: string; // e.g., "ม.4"
  room: string;       // e.g., "A"
}

export interface Teacher {
  username: string;
  name: string;
  classLevel: string;
  room: string;
}

export interface Question {
  id: number;
  text: string;
}

export interface Indicator {
  id: number;
  title: string;
  questions: Question[];
}

export interface EvaluationData {
  studentId: number;
  scores: Record<number, number>; // questionId -> score (0-3)
  comments?: string;
  strengths?: string;
  improvements?: string;
  evaluatorName: string;
  date: string;
}

export enum ScoringLevel {
  EXCELLENT = 'ดีเยี่ยม',
  GOOD = 'ดี',
  FAIR = 'พอใช้',
  IMPROVE = 'ปรับปรุง'
}