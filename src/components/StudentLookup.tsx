import React, { useState, useMemo } from 'react';
import { Search, Sparkles, AlertCircle, BookMarked, User } from 'lucide-react';
import { StudentScore } from '../types';
import { removeVietnameseTones } from '../utils/vietnamese';
import { ScoreResultCard } from './ScoreResultCard';

interface StudentLookupProps {
  students: StudentScore[];
  classes: string[];
  initialSelectedStudent?: StudentScore | null;
}

export const StudentLookup: React.FC<StudentLookupProps> = ({
  students,
  classes,
  initialSelectedStudent,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(
    initialSelectedStudent ? initialSelectedStudent.class : '10A3'
  );
  const [searchInput, setSearchInput] = useState<string>(
    initialSelectedStudent ? initialSelectedStudent.name : ''
  );
  const [foundStudent, setFoundStudent] = useState<StudentScore | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Sync if initialSelectedStudent changes (only pre-fill input, wait for click to reveal score)
  React.useEffect(() => {
    if (initialSelectedStudent) {
      setSelectedClass(initialSelectedStudent.class);
      setSearchInput(initialSelectedStudent.name);
      setFoundStudent(null);
      setHasSearched(false);
    }
  }, [initialSelectedStudent]);

  // Filter autocomplete suggestions based on current input and class
  const suggestions = useMemo(() => {
    if (!searchInput.trim()) return [];
    const query = removeVietnameseTones(searchInput.trim());
    return students
      .filter((s) => {
        const matchesClass = selectedClass === 'ALL' || s.class === selectedClass;
        if (!matchesClass) return false;
        const normName = removeVietnameseTones(s.name);
        return normName.includes(query);
      })
      .slice(0, 5);
  }, [searchInput, selectedClass, students]);

  // Suggestions for when no exact student is found (fuzzy matches in the class)
  const classStudents = useMemo(() => {
    return students.filter((s) => selectedClass === 'ALL' || s.class === selectedClass);
  }, [students, selectedClass]);

  const handleLookup = (overrideName?: string) => {
    const queryToUse = (overrideName !== undefined ? overrideName : searchInput).trim();
    if (!queryToUse) {
      setHasSearched(true);
      setFoundStudent(null);
      return;
    }

    const normQuery = removeVietnameseTones(queryToUse);

    // 1. First attempt exact match
    let found = students.find((item) => {
      const matchClass = selectedClass === 'ALL' || item.class === selectedClass;
      return matchClass && removeVietnameseTones(item.name) === normQuery;
    });

    // 2. Second attempt partial match
    if (!found) {
      found = students.find((item) => {
        const matchClass = selectedClass === 'ALL' || item.class === selectedClass;
        return matchClass && removeVietnameseTones(item.name).includes(normQuery);
      });
    }

    // 3. Third attempt searching in any class if not found in current class
    if (!found) {
      found = students.find((item) => removeVietnameseTones(item.name) === normQuery);
      if (found) {
        setSelectedClass(found.class);
      }
    }

    setFoundStudent(found || null);
    setHasSearched(true);
    setShowSuggestions(false);
  };

  const handleQuickSelect = (student: StudentScore) => {
    setSelectedClass(student.class);
    setSearchInput(student.name);
    setFoundStudent(null);
    setHasSearched(false);
    setShowSuggestions(false);
  };

  const handleReset = () => {
    setSearchInput('');
    setFoundStudent(null);
    setHasSearched(false);
  };

  return (
    <div className="space-y-8">
      {/* Visual Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white min-h-[220px] md:min-h-[250px] flex items-end">
        {/* Background Image with Fallback */}
        <img
          src="/src/assets/images/school_academic_banner_1791766663750.jpg"
          alt="Trường THPT Tịnh Biên"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
          onError={(e) => {
            // Graceful fallback to CSS gradient
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

        <div className="relative z-10 p-6 md:p-8 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Tra Cứu Kỹ Năng Tìm Ý, Lập Ý Qua "Áo Tết"
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Hệ thống tra cứu điểm số và nhận xét chi tiết: Kỹ năng tìm ý, lập ý qua truyện ngắn <span className="text-white font-medium">"Áo Tết"</span> của Nguyễn Ngọc Tư (Ngữ Văn 10).
            Giáo viên phụ trách: <span className="text-white font-semibold">Đặng Thị Bích Hài</span>.
          </p>
        </div>
      </div>

      {/* Main Search Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-1 pb-2">
            <h2 className="text-xl font-bold text-slate-900">
              Tra Cứu Kỹ Năng Tìm Ý, Lập Ý Qua "Áo Tết"
            </h2>
            <p className="text-xs text-slate-500">
              Học sinh chọn đúng Lớp và nhập Họ tên (hỗ trợ cả gõ có dấu và không dấu).
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Lớp */}
            <div>
              <label
                htmlFor="classSelect"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Lớp học:
              </label>
              <select
                id="classSelect"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setFoundStudent(null);
                  setHasSearched(false);
                }}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
              >
                {classes.map((cls) => (
                  <option key={cls} value={cls}>
                    Lớp {cls} ({students.filter((s) => s.class === cls).length} học sinh)
                  </option>
                ))}
                <option value="ALL">Tất cả các lớp</option>
              </select>
            </div>

            {/* Họ và tên input */}
            <div className="relative">
              <label
                htmlFor="searchInput"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Họ và tên học sinh:
              </label>
              <div className="relative">
                <input
                  id="searchInput"
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLookup();
                    }
                  }}
                  placeholder="Ví dụ: Nguyễn Văn A hoặc tran thi b..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>

              {/* Autocomplete suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 uppercase bg-slate-50 border-b border-slate-100">
                    Gợi ý tên học sinh ({selectedClass})
                  </div>
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleQuickSelect(item)}
                      className="w-full px-3.5 py-2 text-left text-sm text-slate-800 hover:bg-blue-50 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-slate-500">Lớp {item.class}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tra cứu Button */}
            <button
              onClick={() => handleLookup()}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Tra Cứu Kỹ Năng Tìm Ý, Lập Ý Qua "Áo Tết"</span>
            </button>
          </div>

          {/* Quick Click Samples */}
          <div className="pt-2">
            <div className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Gợi ý tra cứu nhanh bài mẫu:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {students.slice(0, 4).map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleQuickSelect(s)}
                  className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
                >
                  {s.name} ({s.class})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Container */}
      {hasSearched && (
        <div id="resultContainer" className="transition-all animate-fadeIn">
          {foundStudent ? (
            <ScoreResultCard student={foundStudent} onReset={handleReset} />
          ) : (
            <div className="bg-white border border-rose-200 rounded-2xl p-6 md:p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Không Tìm Thấy Học Sinh
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Học sinh <strong className="text-rose-600">"{searchInput}"</strong> không tồn tại trong danh sách lớp <strong className="text-slate-800">{selectedClass}</strong> hoặc nhập sai tên.
                </p>
              </div>

              {/* Suggestions in this class */}
              {classStudents.length > 0 && (
                <div className="pt-4 border-t border-slate-100 max-w-lg mx-auto text-left">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Danh sách học sinh lớp {selectedClass}:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {classStudents.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleQuickSelect(s)}
                        className="text-xs text-left p-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg border border-slate-200 transition-colors truncate"
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 text-xs text-slate-500">
                Trường hợp học sinh đã nộp bài nhưng không hiển thị kết quả, vui lòng liên hệ giáo viên phụ trách bộ môn để kiểm tra lại danh sách.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subject Information Note - Thang điểm 10 quy đổi cho bài tập "Áo Tết" */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-3">
        <div className="font-semibold text-slate-800 flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-blue-600" />
          <span>Thang điểm 10 quy đổi cho bài tập "Áo Tết" & Quy tắc đánh giá:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">Câu 4 (2.0 điểm)</div>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Nêu cảm nhận / lý do yêu thích tác phẩm. Điểm tối đa khi lý giải thuyết phục, chân thành.
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">Câu 5 (3.0 điểm)</div>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Nêu chính xác chủ đề truyện (Ca ngợi tình bạn trong sáng, thấu hiểu của trẻ thơ). Điểm tối đa khi cô đọng, trúng trọng tâm.
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">Câu 6 (5.0 điểm)</div>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Nêu 2 đặc sắc nghệ thuật (Tâm lý nhân vật tinh tế; Ngôn ngữ đậm chất Nam Bộ) + 2 dẫn chứng trích từ văn bản.
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 leading-relaxed">
          * Nhận xét được xây dựng ngắn gọn, dễ hiểu, khách quan, không dùng đại từ xưng hô, chỉ rõ hạn chế cụ thể ở từng câu khiến bài làm chưa đạt điểm tối đa.
        </div>
      </div>
    </div>
  );
};
