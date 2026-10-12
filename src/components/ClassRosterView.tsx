import React, { useState } from 'react';
import { Search, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { StudentScore } from '../types';
import { removeVietnameseTones } from '../utils/vietnamese';

interface ClassRosterViewProps {
  students: StudentScore[];
  classes: string[];
  onSelectStudent: (student: StudentScore) => void;
}

export const ClassRosterView: React.FC<ClassRosterViewProps> = ({
  students,
  classes,
  onSelectStudent,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('10A3');
  const [search, setSearch] = useState<string>('');

  const filtered = students.filter((s) => {
    const matchClass = selectedClass === 'ALL' || s.class === selectedClass;
    if (!matchClass) return false;
    if (!search.trim()) return true;
    return removeVietnameseTones(s.name).includes(removeVietnameseTones(search));
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-blue-700 font-bold mb-1">
            Danh Sách Lớp
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Danh Sách Học Sinh Đã Nộp Bài "Áo Tết"</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chọn tên học sinh để tra cứu. Điểm số và nhận xét chi tiết chỉ hiển thị khi nhấp nút Tra cứu.
          </p>
        </div>

        {/* Class Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          {classes.map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedClass === cls
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lớp {cls}
            </button>
          ))}
          <button
            onClick={() => setSelectedClass('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              selectedClass === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Lọc nhanh theo họ tên..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
      </div>

      {/* Grid of Student Cards (NO scores or comments displayed here!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((student) => {
          return (
            <div
              key={student.id}
              onClick={() => onSelectStudent(student)}
              className="group p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 transition-all cursor-pointer flex flex-col justify-between space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {student.name}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Lớp: <strong className="text-slate-700">{student.class}</strong> · Bài tập "Áo Tết"
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Đã chấm</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Đi tới tra cứu kết quả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-slate-500 text-xs">
          Không tìm thấy học sinh nào trong danh sách.
        </div>
      )}
    </div>
  );
};
