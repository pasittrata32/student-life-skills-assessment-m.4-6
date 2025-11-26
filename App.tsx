import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { StudentList } from './components/StudentList';
import { EvaluationForm } from './components/EvaluationForm';
import { Teacher, Student, EvaluationData } from './types';
import { STUDENTS_M4A, STUDENTS_M5A, STUDENTS_M6A } from './constants';
import { exportToExcel } from './services/excelService';
import { saveEvaluationToSheet, getEvaluationsFromSheet } from './services/googleSheetsService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Teacher | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  // Store evaluations in state
  // Key string format: "class-room-studentId"
  const [allEvaluations, setAllEvaluations] = useState<Record<string, EvaluationData>>({});

  // Load from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('lifeSkillsEvaluations');
    if (savedData) {
      setAllEvaluations(JSON.parse(savedData));
    }
  }, []);

  // Load from Google Sheets when user logs in
  useEffect(() => {
    if (currentUser) {
        getEvaluationsFromSheet(currentUser).then(sheetData => {
            if (sheetData) {
                // Transform data to match the state structure
                const formattedData: Record<string, EvaluationData> = {};
                Object.values(sheetData).forEach(d => {
                    const key = `${currentUser.classLevel}-${currentUser.room}-${d.studentId}`;
                    formattedData[key] = d;
                });
                
                // Merge with existing data (prefer Sheets data as it's the source of truth)
                setAllEvaluations(prev => {
                    const newData = { ...prev, ...formattedData };
                    localStorage.setItem('lifeSkillsEvaluations', JSON.stringify(newData));
                    return newData;
                });
            }
        });
    }
  }, [currentUser]);

  const handleLogin = (teacher: Teacher) => {
    setCurrentUser(teacher);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedStudent(null);
  };

  const getStudentsForTeacher = (teacher: Teacher) => {
    if (teacher.classLevel === 'ม.4' && teacher.room === 'A') return STUDENTS_M4A;
    if (teacher.classLevel === 'ม.5' && teacher.room === 'A') return STUDENTS_M5A;
    if (teacher.classLevel === 'ม.6' && teacher.room === 'A') return STUDENTS_M6A;
    return [];
  };

  const handleSaveEvaluation = async (data: EvaluationData): Promise<boolean> => {
    if (!currentUser) return false;
    
    const key = `${currentUser.classLevel}-${currentUser.room}-${data.studentId}`;
    
    // 1. Update Local State & Local Storage immediately (Optimistic UI)
    const updatedEvaluations = { ...allEvaluations, [key]: data };
    setAllEvaluations(updatedEvaluations);
    localStorage.setItem('lifeSkillsEvaluations', JSON.stringify(updatedEvaluations));
    
    // 2. Save to Google Sheets
    const success = await saveEvaluationToSheet(selectedStudent!, currentUser, data);
    
    if (success) {
        setSelectedStudent(null); // Go back to list only if success
    }
    
    return success;
  };

  const handleExport = () => {
    if (!currentUser) return;
    const students = getStudentsForTeacher(currentUser);
    
    // Filter evaluations for this specific class
    const classEvaluations: Record<number, EvaluationData> = {};
    students.forEach(s => {
        const key = `${currentUser.classLevel}-${currentUser.room}-${s.id}`;
        if (allEvaluations[key]) {
            classEvaluations[s.id] = allEvaluations[key];
        }
    });

    exportToExcel(currentUser, students, classEvaluations);
  };

  // Get current class specific evaluations for display in list
  const getCurrentClassEvaluations = () => {
    if (!currentUser) return {};
    const students = getStudentsForTeacher(currentUser);
    const classEvaluations: Record<number, EvaluationData> = {};
    students.forEach(s => {
        const key = `${currentUser.classLevel}-${currentUser.room}-${s.id}`;
        if (allEvaluations[key]) {
            classEvaluations[s.id] = allEvaluations[key];
        }
    });
    return classEvaluations;
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (selectedStudent) {
    const key = `${currentUser.classLevel}-${currentUser.room}-${selectedStudent.id}`;
    return (
      <EvaluationForm
        student={selectedStudent}
        teacher={currentUser}
        initialData={allEvaluations[key]}
        onSave={handleSaveEvaluation}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  return (
    <StudentList
      teacher={currentUser}
      students={getStudentsForTeacher(currentUser)}
      evaluations={getCurrentClassEvaluations()}
      onSelectStudent={setSelectedStudent}
      onLogout={handleLogout}
      onExport={handleExport}
    />
  );
};

export default App;