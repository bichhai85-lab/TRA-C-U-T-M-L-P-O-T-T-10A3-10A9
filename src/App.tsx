/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { StudentLookup } from './components/StudentLookup';
import { TeacherAdmin } from './components/TeacherAdmin';
import { ClassRosterView } from './components/ClassRosterView';
import { INITIAL_STUDENTS } from './data/initialData';
import { StudentScore } from './types';
import { GraduationCap } from 'lucide-react';

const STORAGE_KEY = 'thpt_tinh_bien_scores_ao_tet_full_cohort_v1';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'lookup' | 'admin' | 'roster'>('lookup');
  const [selectedStudentForView, setSelectedStudentForView] = useState<StudentScore | null>(null);

  // Load students from localStorage or use initial default data
  const [students, setStudents] = useState<StudentScore[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse error and fallback
    }
    return INITIAL_STUDENTS;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch {
      // Safe fallback
    }
  }, [students]);

  // Extract distinct classes list dynamically
  const classes = useMemo(() => {
    const set = new Set(students.map((s) => s.class));
    // Always make sure 10A3 and 10A9 are available
    set.add('10A3');
    set.add('10A9');
    return Array.from(set).sort();
  }, [students]);

  // Reset data handler
  const handleResetToDefault = () => {
    setStudents(INITIAL_STUDENTS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar following contract */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'lookup') {
            setSelectedStudentForView(null);
          }
        }}
        studentCount={students.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 md:py-10">
        {currentTab === 'lookup' && (
          <StudentLookup
            students={students}
            classes={classes}
            initialSelectedStudent={selectedStudentForView}
          />
        )}

        {currentTab === 'roster' && (
          <ClassRosterView
            students={students}
            classes={classes}
            onSelectStudent={(student) => {
              setSelectedStudentForView(student);
              setCurrentTab('lookup');
            }}
          />
        )}

        {currentTab === 'admin' && (
          <TeacherAdmin
            students={students}
            setStudents={setStudents}
            classes={classes}
            onResetToDefault={handleResetToDefault}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 no-print">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-700 font-semibold text-sm">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>TRƯỜNG THPT TỊNH BIÊN — TỈNH AN GIANG</span>
          </div>
          <p className="text-slate-500">
            Giáo viên phụ trách bộ môn: <strong className="text-slate-700">Đặng Thị Bích Hài</strong> · Môn Ngữ Văn 10
          </p>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Hệ thống tra cứu kết quả bài tập phục vụ đánh giá môn Ngữ Văn 10. Dữ liệu được quản lý và cập nhật bởi giáo viên bộ môn.
          </div>
        </div>
      </footer>
    </div>
  );
}
