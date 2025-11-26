import React, { useState, useEffect } from 'react';
import { Indicator, Student, Teacher, EvaluationData } from '../types';
import { INDICATORS, SCHOOL_NAME } from '../constants';
import { Save, ArrowLeft, Check } from 'lucide-react';
import Swal from 'sweetalert2';

interface EvaluationFormProps {
  student: Student;
  teacher: Teacher;
  initialData?: EvaluationData;
  onSave: (data: EvaluationData) => Promise<boolean>;
  onBack: () => void;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({
  student,
  teacher,
  initialData,
  onSave,
  onBack
}) => {
  const [scores, setScores] = useState<Record<number, number>>({});
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');

  useEffect(() => {
    if (initialData) {
      setScores(initialData.scores);
      setStrengths(initialData.strengths || '');
      setImprovements(initialData.improvements || '');
    }
  }, [initialData]);

  const handleScoreChange = (questionId: number, score: number) => {
    setScores(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  const calculateTotal = (): number => {
    return (Object.values(scores) as number[]).reduce((acc: number, curr: number) => acc + curr, 0);
  };

  const calculatePercentage = (): string => {
    const total = calculateTotal();
    return ((total / 90) * 100).toFixed(2);
  };

  const getQualityLevel = (): string => {
    const percent = parseFloat(calculatePercentage());
    if (percent >= 75) return 'ดีเยี่ยม';
    if (percent >= 50) return 'ดี';
    if (percent >= 25) return 'พอใช้';
    return 'ปรับปรุง';
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(scores).length;
    if (answeredCount < 30) {
      Swal.fire({
        title: 'ข้อมูลไม่ครบถ้วน',
        text: `กรุณาประเมินให้ครบทุกข้อ (ทำไปแล้ว ${answeredCount}/30 ข้อ)`,
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#f59e0b',
        customClass: {
            popup: 'rounded-xl shadow-xl font-sans',
            title: 'font-bold text-gray-800',
        }
      });
      return;
    }

    const data: EvaluationData = {
      studentId: student.id,
      scores,
      strengths,
      improvements,
      evaluatorName: teacher.name,
      date: new Date().toISOString()
    };

    // 1. Confirm Dialog
    const confirmResult = await Swal.fire({
        title: 'ยืนยันการบันทึกข้อมูล?',
        text: `คุณต้องการบันทึกผลการประเมินของ ${student.name} ใช่หรือไม่?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ใช่',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#1e3a8a', // Navy 700
        cancelButtonColor: '#ef4444',
        reverseButtons: true,
        customClass: {
            popup: 'rounded-xl font-sans',
            title: 'font-bold text-navy-900'
        }
    });

    if (confirmResult.isConfirmed) {
        // 2. Loading Dialog
        Swal.fire({
            title: 'กำลังบันทึกข้อมูล...',
            text: 'กรุณารอสักครู่ ระบบกำลังบันทึกข้อมูล',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
            customClass: {
                popup: 'rounded-xl font-sans'
            }
        });

        try {
            // 3. Perform Save
            const success = await onSave(data);
            
            if (success) {
                // 4. Success Dialog
                await Swal.fire({
                    title: 'บันทึกสำเร็จ!',
                    text: 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'rounded-xl font-sans'
                    }
                });
            } else {
                throw new Error("Save returned false");
            }
        } catch (error) {
            // 5. Error Dialog
            Swal.fire({
                title: 'บันทึกไม่สำเร็จ',
                text: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google Sheets แต่ระบบได้บันทึกข้อมูลลงในเครื่องไว้แล้ว',
                icon: 'error',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#1e3a8a',
                customClass: {
                    popup: 'rounded-xl font-sans'
                }
            });
        }
    }
  };

  const qualityLevel = getQualityLevel();

  return (
    <div className="min-h-screen bg-gray-100 pb-24 print:bg-white print:pb-0 font-sans">
      {/* Navigation Bar */}
      <div className="bg-navy-800 text-white p-4 shadow-md sticky top-0 z-40 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-gray-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>กลับหน้ารายชื่อ</span>
          </button>
          <div className="text-sm hidden sm:block">
            กำลังประเมิน: {student.name}
          </div>
        </div>
      </div>

      {/* Paper Document Container */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-xl my-8 md:rounded-sm overflow-hidden print:shadow-none print:my-0 print:max-w-full">
        
        {/* Document Header */}
        <div className="text-center pt-12 pb-4 px-8">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">แบบประเมินความสามารถในการใช้ทักษะชีวิต</h1>
            <h2 className="text-xl font-bold text-gray-900 mt-2">ชั้นมัธยมศึกษาปีที่ 4 - 6</h2>
            <p className="text-gray-600 mt-4 font-medium text-lg">{SCHOOL_NAME}</p>
        </div>

        <div className="px-8 pb-4">
             <div className="border-b-4 border-navy-900 w-full"></div>
        </div>

        <div className="px-8 py-4 md:px-12">
          {/* Part 1: Student Info */}
          <div className="border border-gray-400 rounded-lg p-6 mb-8 relative">
              <div className="absolute -top-3 left-4 bg-white px-2 font-bold text-lg text-gray-900">
                ตอนที่ 1 ข้อมูลทั่วไปของนักเรียน
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-6 gap-x-12 mt-2">
                  <div className="flex items-end w-full">
                      <span className="font-bold text-gray-700 min-w-fit mr-2">ชื่อ-สกุล:</span>
                      <div className="border-b border-dotted border-gray-400 flex-grow text-center pb-1 text-blue-900 font-medium">
                        {student.name}
                      </div>
                  </div>
                  <div className="flex items-end w-full">
                      <span className="font-bold text-gray-700 min-w-fit mr-2">โรงเรียน:</span>
                      <div className="border-b border-dotted border-gray-400 flex-grow text-center pb-1">
                        โรงเรียนสาธิตอุดมศึกษา
                      </div>
                  </div>
                  
                  <div className="flex flex-wrap items-end lg:col-span-2 gap-y-4">
                      <div className="flex items-end mr-8">
                        <span className="font-bold text-gray-700 mr-2">ระดับชั้น:</span>
                        <div className="border-b border-dotted border-gray-400 w-24 text-center pb-1">
                            {student.classLevel}/{student.room}
                        </div>
                      </div>
                      <div className="flex items-end mr-8">
                        <span className="font-bold text-gray-700 mr-2">ห้อง:</span>
                        <div className="border-b border-dotted border-gray-400 w-24 text-center pb-1">
                            {student.room}
                        </div>
                      </div>
                      <div className="flex items-end">
                        <span className="font-bold text-gray-700 mr-2">เลขที่:</span>
                        <div className="border-b border-dotted border-gray-400 w-24 text-center pb-1">
                            {student.id}
                        </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-100">
              <h3 className="font-bold text-navy-900 text-lg mb-3">คำชี้แจง</h3>
              <p className="mb-3 text-gray-800">ให้ครูทำเครื่องหมาย ✓ ลงในช่องที่ตรงกับพฤติกรรมของนักเรียน ตามเกณฑ์พิจารณาดังนี้</p>
              <ul className="space-y-2 text-sm md:text-base ml-4">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                    <span className="font-bold w-20">ระดับ 3</span> 
                    <span>หมายถึง นักเรียนปฏิบัติ/แสดงพฤติกรรมดังกล่าว <span className="text-green-700 font-bold">เป็นประจำ</span></span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    <span className="font-bold w-20">ระดับ 2</span> 
                    <span>หมายถึง นักเรียนปฏิบัติ/แสดงพฤติกรรมดังกล่าว <span className="text-blue-700 font-bold">บ่อยครั้ง</span></span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    <span className="font-bold w-20">ระดับ 1</span> 
                    <span>หมายถึง นักเรียนปฏิบัติ/แสดงพฤติกรรมดังกล่าว <span className="text-orange-600 font-bold">บางครั้ง</span></span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                    <span className="font-bold w-20">ระดับ 0</span> 
                    <span>หมายถึง นักเรียน <span className="text-red-600 font-bold">ไม่เคย</span> ปฏิบัติหรืออาจปฏิบัติแต่ไม่ค่อยชัดเจน</span>
                  </li>
              </ul>
          </div>

          {/* Part 2: Table */}
          <div className="mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">ตอนที่ 2 รายการประเมินความสามารถในการใช้ทักษะชีวิต</h3>
              
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <table className="w-full border-collapse">
                      <thead>
                          <tr className="bg-gray-200 text-gray-800 text-sm font-bold border-b-2 border-gray-300">
                              <th className="py-4 px-2 text-center border-r border-gray-300 w-12">ข้อที่</th>
                              <th className="py-4 px-4 text-left border-r border-gray-300">รายการประเมิน</th>
                              <th className="py-2 px-0 text-center w-[200px] sm:w-[320px]">
                                <div className="border-b border-gray-300 pb-2 mb-2">การปฏิบัติ/การแสดงพฤติกรรม</div>
                                <div className="grid grid-cols-4 gap-1 px-2 text-xs sm:text-sm">
                                    <div className="text-green-800">3</div>
                                    <div className="text-blue-800">2</div>
                                    <div className="text-orange-800">1</div>
                                    <div className="text-red-800">0</div>
                                </div>
                              </th>
                          </tr>
                      </thead>
                      <tbody className="text-sm sm:text-base">
                        {INDICATORS.map((indicator) => (
                          <React.Fragment key={indicator.id}>
                            <tr className="bg-slate-100 border-b border-gray-300">
                              <td colSpan={3} className="py-3 px-4 font-bold text-navy-900">
                                {indicator.title}
                              </td>
                            </tr>
                            {indicator.questions.map((q) => (
                              <tr key={q.id} className="border-b border-gray-200 hover:bg-yellow-50 transition-colors">
                                <td className="py-3 px-2 text-center border-r border-gray-200 align-top pt-4">
                                  {q.id}
                                </td>
                                <td className="py-3 px-4 border-r border-gray-200 align-top pt-4">
                                  {q.text}
                                </td>
                                <td className="py-3 px-2 align-top pt-4">
                                  <div className="grid grid-cols-4 h-full items-center">
                                    {[3, 2, 1, 0].map((score) => (
                                      <label key={score} className="flex justify-center items-center h-full cursor-pointer group">
                                        <div className="relative">
                                          <input
                                            type="radio"
                                            name={`q-${q.id}`}
                                            value={score}
                                            checked={scores[q.id] === score}
                                            onChange={() => handleScoreChange(q.id, score)}
                                            className="sr-only"
                                          />
                                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all
                                            ${scores[q.id] === score 
                                              ? 'border-navy-700 bg-navy-700 text-white scale-110' 
                                              : 'border-gray-300 bg-white group-hover:border-navy-400'
                                            }`}>
                                            {scores[q.id] === score && <div className="w-2 h-2 bg-white rounded-full" />}
                                          </div>
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* Summary Section */}
          <div className="mt-6">
              <div className="border border-gray-300 rounded-t-lg overflow-hidden">
                <div className="flex border-b border-gray-300">
                    <div className="flex-grow p-3 text-right font-bold text-gray-800 flex items-center justify-end bg-white">
                        คะแนนรวม
                    </div>
                    <div className="w-32 sm:w-48 p-3 text-center font-bold text-gray-900 border-l border-gray-300 bg-white flex items-center justify-center text-xl">
                        {calculateTotal()}
                    </div>
                </div>
                <div className="flex bg-blue-50">
                    <div className="flex-grow p-3 text-right font-bold text-gray-800 flex items-center justify-end">
                        สรุปคะแนนร้อยละ
                    </div>
                    <div className="w-32 sm:w-48 p-2 text-center border-l border-gray-300 flex flex-col items-center justify-center">
                        <div className="text-sm">
                            <span className="border-b border-black inline-block px-1 mb-0.5">คะแนนที่ได้ x 100</span>
                        </div>
                        <div className="text-sm mb-1">90</div>
                        <div className="font-bold text-blue-800 text-lg">
                            = {calculatePercentage()} %
                        </div>
                    </div>
                </div>
              </div>

              <div className="border border-gray-300 border-t-0 rounded-b-lg p-6 bg-white">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">สรุปผลการประเมินความสามารถในการใช้ทักษะชีวิต</h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 flex-wrap">
                      <span className="font-bold text-gray-800 mr-2">นักเรียนอยู่ในระดับ:</span>
                      
                      <div className="flex items-center gap-2 mr-4">
                          <div className={`w-5 h-5 border border-gray-400 flex items-center justify-center rounded-sm ${qualityLevel === 'ดีเยี่ยม' ? 'bg-teal-600 border-teal-600' : 'bg-white'}`}>
                              {qualityLevel === 'ดีเยี่ยม' && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                          </div>
                          <span className="text-gray-700 text-sm sm:text-base">ดีเยี่ยม (75-100%)</span>
                      </div>

                      <div className="flex items-center gap-2 mr-4">
                          <div className={`w-5 h-5 border border-gray-400 flex items-center justify-center rounded-sm ${qualityLevel === 'ดี' ? 'bg-teal-600 border-teal-600' : 'bg-white'}`}>
                              {qualityLevel === 'ดี' && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                          </div>
                          <span className="text-gray-700 text-sm sm:text-base">ดี (50-74%)</span>
                      </div>

                      <div className="flex items-center gap-2 mr-4">
                          <div className={`w-5 h-5 border border-gray-400 flex items-center justify-center rounded-sm ${qualityLevel === 'พอใช้' ? 'bg-teal-600 border-teal-600' : 'bg-white'}`}>
                              {qualityLevel === 'พอใช้' && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                          </div>
                          <span className="text-gray-700 text-sm sm:text-base">พอใช้ (25-49%)</span>
                      </div>

                      <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 border border-gray-400 flex items-center justify-center rounded-sm ${qualityLevel === 'ปรับปรุง' ? 'bg-teal-600 border-teal-600' : 'bg-white'}`}>
                              {qualityLevel === 'ปรับปรุง' && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                          </div>
                          <span className="text-gray-700 text-sm sm:text-base">ปรับปรุง (ต่ำกว่า 25%)</span>
                      </div>
                  </div>

                  <h3 className="font-bold text-gray-800 mb-4">บันทึกเพิ่มเติม (สำหรับครูผู้สอน)</h3>

                  <div className="mb-4">
                      <label className="block text-gray-700 font-bold mb-2 text-sm">จุดเด่นของนักเรียนคือ</label>
                      <textarea
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-navy-700 focus:outline-none resize-none text-gray-700"
                          rows={3}
                          placeholder="ระบุจุดเด่น..."
                          value={strengths}
                          onChange={(e) => setStrengths(e.target.value)}
                      ></textarea>
                  </div>

                  <div className="mb-8">
                      <label className="block text-gray-700 font-bold mb-2 text-sm">จุดที่ควรพัฒนาของนักเรียนคือ</label>
                      <textarea
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-navy-700 focus:outline-none resize-none text-gray-700"
                          rows={3}
                          placeholder="ระบุสิ่งที่ควรพัฒนา..."
                          value={improvements}
                          onChange={(e) => setImprovements(e.target.value)}
                      ></textarea>
                  </div>

                  <div className="flex justify-end items-end gap-3 mt-10 pr-4 sm:pr-12">
                      <span className="mb-1 font-bold text-gray-700">ลงชื่อ:</span>
                      <div className="flex flex-col items-center">
                          <div className="min-w-[200px] text-center text-blue-900 font-medium px-2">
                              {teacher.name}
                          </div>
                          <div className="border-b border-dotted border-gray-400 w-full h-1"></div>
                      </div>
                      <span className="mb-1 font-bold text-gray-700">ครูผู้สอน</span>
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] print:hidden z-50">
        <div className="max-w-5xl mx-auto flex justify-end items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline mr-auto">
              กรุณาตรวจสอบความถูกต้องก่อนบันทึก
            </span>
            <button 
                onClick={onBack}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
            >
                ยกเลิก
            </button>
            <button 
                onClick={handleSubmit}
                className="px-8 py-2 bg-navy-700 text-white rounded-lg hover:bg-navy-800 font-bold shadow-md flex items-center gap-2 transition-all transform hover:scale-105"
            >
                <Save className="w-4 h-4" />
                บันทึกข้อมูล
            </button>
        </div>
      </div>
    </div>
  );
};