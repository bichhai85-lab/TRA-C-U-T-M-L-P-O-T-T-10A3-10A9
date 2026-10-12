import React from 'react';
import { GraduationCap, Search, Settings } from 'lucide-react';

interface HeaderProps {
  currentTab: 'lookup' | 'admin' | 'roster';
  setCurrentTab: (tab: 'lookup' | 'admin' | 'roster') => void;
  studentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setCurrentTab('lookup')}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:bg-blue-700 transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap block">
              THPT Tịnh Biên
            </span>
            <span className="text-xs text-slate-500 whitespace-nowrap block">
              Tổ Ngữ Văn · GV Đặng Thị Bích Hài
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Clean & focused on lookup for students) */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setCurrentTab('lookup')}
            className={`whitespace-nowrap transition-colors hover:text-blue-600 ${
              currentTab === 'lookup'
                ? 'text-blue-600 font-semibold underline underline-offset-8 decoration-2 decoration-blue-600'
                : ''
            }`}
          >
            Tra Cứu Kỹ Năng Qua "Áo Tết"
          </button>
        </nav>

        {/* Zone 3: Primary Action - Only shown in Admin mode to return back to lookup */}
        <div className="flex items-center gap-2 shrink-0">
          {currentTab === 'admin' && (
            <button
              onClick={() => setCurrentTab('lookup')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Quay Lại Tra Cứu</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
