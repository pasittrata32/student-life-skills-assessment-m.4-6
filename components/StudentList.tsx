import React from 'react';
import { Student, EvaluationData, Teacher } from '../types';
import { FileSpreadsheet, LogOut, User, Search, Edit, PlusCircle, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { SCHOOL_NAME } from '../constants';

interface StudentListProps {
  teacher: Teacher;
  students: Student[];
  evaluations: Record<number, EvaluationData>;
  onSelectStudent: (student: Student) => void;
  onLogout: () => void;
  onExport: () => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  teacher,
  students,
  evaluations,
  onSelectStudent,
  onLogout,
  onExport,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredStudents = students.filter(s => 
    s.name.includes(searchTerm) || s.id.toString().includes(searchTerm)
  );

  const completedCount = students.filter(s => evaluations[s.id]).length;
  const pendingCount = students.length - completedCount;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-navy-900 text-white px-4 md:px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-white/10 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
             </div>
             <div>
                <h1 className="text-lg md:text-xl font-bold leading-tight">ระบบประเมินความสามารถในการใช้ทักษะชีวิต</h1>
                <p className="text-xs md:text-sm text-slate-300 opacity-90">{SCHOOL_NAME}</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-300">ครูผู้สอน</p>
                <p className="font-medium">{teacher.name}</p>
             </div>
             <button 
               onClick={onLogout}
               className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white"
               title="ออกจากระบบ"
             >
                <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Students */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border-l-4 border-navy-700">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mr-4">
                    <User className="w-7 h-7 text-slate-600" />
                </div>
                <div>
                    <p className="text-gray-500 mb-1 text-sm font-medium">นักเรียนทั้งหมด</p>
                    <p className="text-3xl font-bold text-gray-800">{students.length} คน</p>
                </div>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border-l-4 border-green-500">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mr-4">
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <div>
                    <p className="text-gray-500 mb-1 text-sm font-medium">ประเมินแล้ว</p>
                    <p className="text-3xl font-bold text-gray-800">{completedCount} คน</p>
                </div>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border-l-4 border-orange-500">
                <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mr-4">
                    <AlertCircle className="w-7 h-7 text-orange-500" />
                </div>
                <div>
                    <p className="text-gray-500 mb-1 text-sm font-medium">รอการประเมิน</p>
                    <p className="text-3xl font-bold text-gray-800">{pendingCount} คน</p>
                </div>
            </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-800 border-l-4 border-navy-900 pl-3">รายชื่อนักเรียน</h2>
            <button
                onClick={onExport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center transition-colors font-medium text-sm"
            >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Excel
            </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                placeholder="ค้นหาชื่อนักเรียน หรือ เลขที่..."
                className="pl-10 w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-navy-700 focus:outline-none shadow-sm bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-600 uppercase tracking-wider w-20">เลขที่</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-600 uppercase tracking-wider w-24">ชั้น</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-600 uppercase tracking-wider w-32">สถานะ</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-600 uppercase tracking-wider w-32">คะแนน (%)</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-600 uppercase tracking-wider w-32">การจัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map((student) => {
                            const isEvaluated = !!evaluations[student.id];
                            let scorePercentage = '-';
                            
                            if (isEvaluated) {
                                const evaluation = evaluations[student.id];
                                const totalScore = (Object.values(evaluation.scores) as number[]).reduce((a: number, b: number) => a + b, 0);
                                const percentage = (totalScore / 90) * 100;
                                scorePercentage = `${percentage.toFixed(2)}%`;
                            }

                            return (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                                        {student.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isEvaluated ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                                <User className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                        {student.classLevel}/{student.room}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                                            isEvaluated 
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : 'bg-orange-50 text-orange-700 border-orange-200'
                                        }`}>
                                            {isEvaluated ? 'ประเมินแล้ว' : 'รอการประเมิน'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-navy-700">
                                        {scorePercentage}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <button
                                            onClick={() => onSelectStudent(student)}
                                            className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md transition-colors text-sm font-medium shadow-sm ${
                                                isEvaluated 
                                                ? 'text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50' 
                                                : 'bg-navy-700 text-white hover:bg-navy-800 border border-transparent'
                                            }`}
                                        >
                                            {isEvaluated ? (
                                                <>
                                                    <Edit className="w-3.5 h-3.5 mr-1.5" /> แก้ไข
                                                </>
                                            ) : (
                                                <>
                                                    <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> ประเมิน
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                                    <div className="flex flex-col items-center justify-center">
                                        <Search className="w-10 h-10 text-gray-300 mb-2" />
                                        <p>ไม่พบรายชื่อนักเรียนที่ค้นหา</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
};
