import React, { useState } from 'react';
import { TEACHERS } from '../constants';
import { Teacher } from '../types';
import { LogIn, School } from 'lucide-react';

interface LoginFormProps {
  onLogin: (teacher: Teacher) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = TEACHERS.find(
      (t) => t.username === username && t.username === password // Password is same as username per requirements
    );

    if (teacher) {
      onLogin(teacher);
    } else {
      setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl overflow-hidden">
        <div className="bg-navy-700 p-8 text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4">
            <School className="h-10 w-10 text-navy-700" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">แบบประเมินความสามารถในการใช้ทักษะชีวิต</h2>
          <p className="text-blue-100 text-sm">โรงเรียนสาธิตอุดมศึกษา อ.บางละมุง จ.ชลบุรี</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              ชื่อผู้ใช้งาน (User)
            </label>
            <input
              id="username"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-700 transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="เช่น teacherm4a"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              รหัสผ่าน (Password)
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-700 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน"
              required
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded border border-red-200 flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-navy-700 text-white font-bold py-3 px-4 rounded hover:bg-navy-800 transition-colors flex items-center justify-center"
          >
            <LogIn className="w-5 h-5 mr-2" />
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
};