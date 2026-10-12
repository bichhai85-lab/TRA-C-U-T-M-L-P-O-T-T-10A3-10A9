import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit3,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Search,
  Save,
  X,
  FileText
} from 'lucide-react';
import { StudentScore } from '../types';
import { parseScore, exportToCSV, parseSpreadsheetText } from '../utils/vietnamese';

interface TeacherAdminProps {
  students: StudentScore[];
  setStudents: React.Dispatch<React.SetStateAction<StudentScore[]>>;
  classes: string[];
  onResetToDefault: () => void;
}

export const TeacherAdmin: React.FC<TeacherAdminProps> = ({
  students,
  setStudents,
  classes,
  onResetToDefault,
}) => {
  const [adminTab, setAdminTab] = useState<'sheet-import' | 'roster-edit' | 'statistics'>('sheet-import');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sheet import states
  const [rawText, setRawText] = useState<string>('');
  const [importTargetClass, setImportTargetClass] = useState<string>('10A3');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [importFeedback, setImportFeedback] = useState<{ count: number; errors: string[] } | null>(null);

  // Edit/Add modal state
  const [editingStudent, setEditingStudent] = useState<StudentScore | null>(null);
  const [isNewStudent, setIsNewStudent] = useState<boolean>(false);

  // Parse raw text in real time for preview
  const previewData = useMemo(() => {
    if (!rawText.trim()) return { parsed: [], errors: [] };
    return parseSpreadsheetText(rawText, importTargetClass);
  }, [rawText, importTargetClass]);

  // Filtered students in list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = filterClass === 'ALL' || s.class === filterClass;
      if (!matchClass) return false;
      if (!searchQuery.trim()) return true;
      return s.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [students, filterClass, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const list = filterClass === 'ALL' ? students : students.filter((s) => s.class === filterClass);
    if (list.length === 0) {
      return { total: 0, avg: 0, max: 0, min: 0, excellent: 0, good: 0, fair: 0, pass: 0, needWork: 0 };
    }

    let sum = 0;
    let max = -1;
    let min = 999;
    let excellent = 0;
    let good = 0;
    let fair = 0;
    let pass = 0;
    let needWork = 0;

    list.forEach((s) => {
      const p = parseScore(s.score, s);
      sum += p.scoreNum;
      if (p.scoreNum > max) max = p.scoreNum;
      if (p.scoreNum < min) min = p.scoreNum;

      if (p.rating === 'Xuất sắc') excellent++;
      else if (p.rating === 'Giỏi') good++;
      else if (p.rating === 'Khá') fair++;
      else if (p.rating === 'Đạt') pass++;
      else needWork++;
    });

    return {
      total: list.length,
      avg: Number((sum / list.length).toFixed(2)),
      max: max >= 0 ? max : 0,
      min: min <= 100 ? min : 0,
      excellent,
      good,
      fair,
      pass,
      needWork,
    };
  }, [students, filterClass]);

  const handleApplyImport = () => {
    if (previewData.parsed.length === 0) return;

    if (importMode === 'replace') {
      setStudents(previewData.parsed);
    } else {
      setStudents((prev) => [...prev, ...previewData.parsed]);
    }

    setImportFeedback({
      count: previewData.parsed.length,
      errors: previewData.errors,
    });
    setRawText('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Cô có chắc chắn muốn xóa học sinh này khỏi danh sách?')) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editingStudent.name.trim() || !editingStudent.score.trim()) return;

    if (isNewStudent) {
      setStudents((prev) => [editingStudent, ...prev]);
    } else {
      setStudents((prev) =>
        prev.map((s) => (s.id === editingStudent.id ? editingStudent : s))
      );
    }
    setEditingStudent(null);
    setIsNewStudent(false);
  };

  const handleAddNew = () => {
    setIsNewStudent(true);
    setEditingStudent({
      id: `s-${Date.now()}`,
      name: '',
      class: filterClass === 'ALL' ? '10A3' : filterClass,
      score: '8.5/10',
      totalScore: 8.5,
      questionScores: { q4: 2.0, q5: 2.5, q6: 4.0 },
      comment: '',
      testTitle: 'Kỹ năng tìm ý, lập ý qua "Áo Tết"',
      date: 'Tháng 10/2026',
    });
  };

  return (
    <div className="space-y-6">
      {/* Teacher workspace header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-blue-700 font-bold mb-1">
            Không Gian Làm Việc Giáo Viên
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản Lý Điểm Số & Google Sheets
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            GVBM: <strong className="text-slate-900">Đặng Thị Bích Hài</strong> · Trường THPT Tịnh Biên · Môn Ngữ Văn 10
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(students)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel/CSV</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Cô có muốn khôi phục về danh sách mẫu ban đầu không?')) {
                onResetToDefault();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mẫu</span>
          </button>
        </div>
      </div>

      {/* Internal Navigation Sub-tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-md">
        <button
          onClick={() => setAdminTab('sheet-import')}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5 ${
            adminTab === 'sheet-import'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
          <span>Dán Từ Sheets / Excel</span>
        </button>
        <button
          onClick={() => setAdminTab('roster-edit')}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5 ${
            adminTab === 'roster-edit'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>Bảng Điểm ({students.length})</span>
        </button>
        <button
          onClick={() => setAdminTab('statistics')}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5 ${
            adminTab === 'statistics'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
          <span>Phổ Điểm</span>
        </button>
      </div>

      {/* TAB 1: SHEET IMPORT */}
      {adminTab === 'sheet-import' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <span>Nhập Nhanh Dữ Liệu Từ Google Sheets / Excel</span>
              </h2>
              <p className="text-xs text-slate-500">
                Cô chỉ cần mở file Google Sheets, bôi đen các cột rồi nhấn <strong>Ctrl + C</strong> (Sao chép), sau đó dán vào ô bên dưới.
              </p>
            </div>

            {/* Instruction Format Guide */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
              <div className="font-semibold text-blue-900">
                Định dạng các cột trong Google Sheets (Thứ tự gợi ý):
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-200 font-mono text-[12px] text-slate-800 overflow-x-auto">
                <div>Cột 1: <strong>Họ và tên</strong> (ví dụ: Nguyễn Văn A)</div>
                <div>Cột 2: <strong>Lớp</strong> (ví dụ: 10A3 hoặc 10A9)</div>
                <div>Cột 3: <strong>Điểm số</strong> (ví dụ: 6.5/7.0 hoặc 5.0)</div>
                <div>Cột 4: <strong>Nhận xét chi tiết</strong> (ví dụ: Bài làm tốt, thiếu dẫn chứng câu 5...)</div>
              </div>
              <p className="text-slate-500 text-[11px]">
                * Hệ thống tự động nhận diện cả ký tự Tab khi dán từ bảng tính hoặc file CSV.
              </p>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Lớp mặc định (nếu trong bảng không có cột Lớp):
                </label>
                <select
                  value={importTargetClass}
                  onChange={(e) => setImportTargetClass(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                >
                  {classes.map((c) => (
                    <option key={c} value={c}>
                      Lớp {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phương thức nhập:
                </label>
                <div className="flex gap-4 items-center pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-blue-600"
                    />
                    <span>Thêm vào danh sách hiện có</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-blue-600"
                    />
                    <span>Thay thế toàn bộ</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Textarea for pasting */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Dán nội dung từ Google Sheets / Excel vào đây:
              </label>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  setImportFeedback(null);
                }}
                placeholder={`Nguyễn Văn A\t10A3\t6.5/7.0\tBài làm khá tốt, thể hiện sự thấu hiểu văn bản...\nTrần Thị B\t10A9\t5.0/7.0\tNội dung cơ bản đạt yêu cầu...`}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Success / Error feedback */}
            {importFeedback && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-emerald-800 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">
                    Đã nhập thành công {importFeedback.count} học sinh vào hệ thống!
                  </div>
                  {importFeedback.errors.length > 0 && (
                    <div className="text-rose-700 mt-1">
                      Lưu ý: Có {importFeedback.errors.length} dòng không đúng định dạng đã được bỏ qua.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Live Preview */}
            {previewData.parsed.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Xem trước kết quả nhận diện ({previewData.parsed.length} học sinh):
                  </div>
                  <button
                    onClick={handleApplyImport}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác nhận nhập vào hệ thống</span>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0">
                      <tr>
                        <th className="p-2.5">Họ và tên</th>
                        <th className="p-2.5">Lớp</th>
                        <th className="p-2.5">Điểm</th>
                        <th className="p-2.5">Nhận xét chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {previewData.parsed.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-900">{item.name}</td>
                          <td className="p-2.5 text-slate-600">{item.class}</td>
                          <td className="p-2.5 font-bold text-blue-700">{item.score}</td>
                          <td className="p-2.5 text-slate-600 max-w-xs truncate">{item.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ROSTER TABLE */}
      {adminTab === 'roster-edit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Danh Sách Học Sinh & Bảng Điểm
              </h2>
              <p className="text-xs text-slate-500">
                Chỉnh sửa trực tiếp điểm số, nhận xét sư phạm hoặc thêm học sinh mới.
              </p>
            </div>

            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm học sinh</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setFilterClass('ALL')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  filterClass === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả các lớp
              </button>
              {classes.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setFilterClass(cls)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    filterClass === cls
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lớp {cls}
                </button>
              ))}
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh học sinh theo tên..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Họ và tên</th>
                    <th className="p-3">Lớp</th>
                    <th className="p-3">Điểm số</th>
                    <th className="p-3">Xếp loại</th>
                    <th className="p-3">Nhận xét chi tiết</th>
                    <th className="p-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        Không tìm thấy học sinh nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const p = parseScore(s.score);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                            {s.name}
                          </td>
                          <td className="p-3 text-slate-700 whitespace-nowrap">{s.class}</td>
                          <td className="p-3 font-extrabold text-blue-700 whitespace-nowrap tabular-nums">
                            {s.score}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${p.badgeBg}`}>
                              {p.rating}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 max-w-sm line-clamp-2 pr-4 italic">
                            "{s.comment}"
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setIsNewStudent(false);
                                  setEditingStudent(s);
                                }}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                title="Sửa thông tin"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(s.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STATISTICS */}
      {adminTab === 'statistics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500 font-medium">Tổng số bài nộp</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{stats.total}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">học sinh</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500 font-medium">Điểm trung bình</div>
              <div className="text-2xl font-bold text-blue-700 mt-1 tabular-nums">{stats.avg}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">trên thang 10.0</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500 font-medium">Điểm cao nhất</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums">{stats.max}</div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Xuất sắc</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500 font-medium">Điểm thấp nhất</div>
              <div className="text-2xl font-bold text-slate-700 mt-1 tabular-nums">{stats.min}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Cần bồi dưỡng</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
            <h3 className="text-base font-bold text-slate-900">
              Phổ Điểm & Xếp Loại Đánh Giá Năng Lực (Thang Điểm 10)
            </h3>

            <div className="space-y-4">
              {/* Xuất sắc */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-emerald-800">Xuất sắc (9.0 - 10.0 điểm)</span>
                  <span className="text-slate-600 font-medium tabular-nums">
                    {stats.excellent} HS ({stats.total > 0 ? Math.round((stats.excellent / stats.total) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.excellent / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Giỏi */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-blue-800">Giỏi (8.0 - 8.9 điểm)</span>
                  <span className="text-slate-600 font-medium tabular-nums">
                    {stats.good} HS ({stats.total > 0 ? Math.round((stats.good / stats.total) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.good / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Khá */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-amber-800">Khá (6.5 - 7.9 điểm)</span>
                  <span className="text-slate-600 font-medium tabular-nums">
                    {stats.fair} HS ({stats.total > 0 ? Math.round((stats.fair / stats.total) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.fair / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Đạt */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Đạt (5.0 - 6.4 điểm)</span>
                  <span className="text-slate-600 font-medium tabular-nums">
                    {stats.pass} HS ({stats.total > 0 ? Math.round((stats.pass / stats.total) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.pass / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Chưa đạt */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-rose-800">Chưa đạt (Dưới 5.0 điểm)</span>
                  <span className="text-slate-600 font-medium tabular-nums">
                    {stats.needWork} HS ({stats.total > 0 ? Math.round((stats.needWork / stats.total) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.needWork / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Pedagogy observations */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Gợi ý sư phạm theo thang điểm 10 của bài "Áo Tết":
              </div>
              <ul className="text-xs text-slate-600 list-disc list-inside space-y-1.5 leading-relaxed">
                <li>
                  <strong>Câu 4 (2.0 điểm)</strong>: Rèn luyện kỹ năng giải thích cảm nhận sâu sắc, chân thành; tránh trả lời cụt ngủn hoặc chung chung.
                </li>
                <li>
                  <strong>Câu 5 (3.0 điểm)</strong>: Nhấn mạnh chủ đề ca ngợi tình bạn trong sáng, thấu hiểu của trẻ thơ; chỉ rõ lỗi phổ biến là sa vào tóm tắt cốt truyện thay vì nêu chủ đề.
                </li>
                <li>
                  <strong>Câu 6 (5.0 điểm)</strong>: Yêu cầu nêu rõ 2 đặc sắc nghệ thuật (Tâm lý nhân vật tinh tế; Ngôn ngữ đậm chất Nam Bộ) và bắt buộc phải trích dẫn đủ 2 dẫn chứng trực tiếp từ văn bản.
                </li>
                <li>
                  <strong>Nguyên tắc nhận xét</strong>: Ngắn gọn, dễ hiểu, khách quan, không dùng đại từ xưng hô, chỉ rõ nguyên nhân vì sao chưa đạt điểm tối đa ở từng câu.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {isNewStudent ? 'Thêm Học Sinh Mới' : 'Chỉnh Sửa Thông Tin Học Sinh'}
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Họ và tên học sinh:
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Lớp:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStudent.class}
                    onChange={(e) => setEditingStudent({ ...editingStudent, class: e.target.value.toUpperCase() })}
                    placeholder="10A3 hoặc 10A9"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tổng điểm (thang 10):
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStudent.score}
                    onChange={(e) => setEditingStudent({ ...editingStudent, score: e.target.value })}
                    placeholder="8.5/10"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white font-bold text-blue-700"
                  />
                </div>
              </div>

              {/* Chi tiết từng câu theo thang 10 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Điểm thành phần (Tự động cập nhật tổng điểm):
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                      Câu 4 (Tối đa 2.0đ)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="2"
                      value={editingStudent.questionScores?.q4 ?? 2.0}
                      onChange={(e) => {
                        const q4Val = parseFloat(e.target.value) || 0;
                        const prevQ = editingStudent.questionScores || { q4: 2.0, q5: 2.5, q6: 4.0 };
                        const updated = { ...prevQ, q4: q4Val };
                        const sum = Number((updated.q4 + updated.q5 + updated.q6).toFixed(1));
                        setEditingStudent({
                          ...editingStudent,
                          questionScores: updated,
                          score: `${sum}/10`,
                          totalScore: sum,
                        });
                      }}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                      Câu 5 (Tối đa 3.0đ)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="3"
                      value={editingStudent.questionScores?.q5 ?? 2.5}
                      onChange={(e) => {
                        const q5Val = parseFloat(e.target.value) || 0;
                        const prevQ = editingStudent.questionScores || { q4: 2.0, q5: 2.5, q6: 4.0 };
                        const updated = { ...prevQ, q5: q5Val };
                        const sum = Number((updated.q4 + updated.q5 + updated.q6).toFixed(1));
                        setEditingStudent({
                          ...editingStudent,
                          questionScores: updated,
                          score: `${sum}/10`,
                          totalScore: sum,
                        });
                      }}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                      Câu 6 (Tối đa 5.0đ)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="5"
                      value={editingStudent.questionScores?.q6 ?? 4.0}
                      onChange={(e) => {
                        const q6Val = parseFloat(e.target.value) || 0;
                        const prevQ = editingStudent.questionScores || { q4: 2.0, q5: 2.5, q6: 4.0 };
                        const updated = { ...prevQ, q6: q6Val };
                        const sum = Number((updated.q4 + updated.q5 + updated.q6).toFixed(1));
                        setEditingStudent({
                          ...editingStudent,
                          questionScores: updated,
                          score: `${sum}/10`,
                          totalScore: sum,
                        });
                      }}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nhận xét chi tiết bài làm:
                </label>
                <div className="text-[11px] text-slate-500 mb-1">
                  * Quy tắc: Ngắn gọn, khách quan, tuyệt đối không xưng cô - trò, chỉ rõ hạn chế cụ thể ở từng câu.
                </div>
                <textarea
                  rows={4}
                  required
                  value={editingStudent.comment}
                  onChange={(e) => setEditingStudent({ ...editingStudent, comment: e.target.value })}
                  placeholder="Ví dụ: Ở Câu 4: Cảm nhận chân thành (2.0/2.0). Ở Câu 5: Xác định chủ đề còn lan man... Ở Câu 6: Thiếu dẫn chứng trích từ văn bản..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu thông tin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
