import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Check, Copy, Printer, Award, BookOpen, User, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { StudentScore } from '../types';
import { parseScore, getQuestionScores } from '../utils/vietnamese';

interface ScoreResultCardProps {
  student: StudentScore;
  onReset: () => void;
}

export const ScoreResultCard: React.FC<ScoreResultCardProps> = ({ student, onReset }) => {
  const [copied, setCopied] = useState(false);
  const parsed = parseScore(student.score, student);
  const qScores = parsed.questionScores || getQuestionScores(student, parsed.scoreNum);

  useEffect(() => {
    // Fire celebratory confetti if >= 8.5/10 (Giỏi hoặc Xuất sắc)
    if (parsed.percentage >= 85) {
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.65 },
        });
      } catch {
        // Safe fallback
      }
    }
  }, [student.id, parsed.percentage]);

  const handleCopy = () => {
    const textToCopy = `[KẾT QUẢ ĐÁNH GIÁ: KỸ NĂNG TÌM Ý, LẬP Ý QUA "ÁO TẾT" - THPT TỊNH BIÊN]
Họ tên: ${student.name}
Lớp: ${student.class}
Điểm tổng kết: ${student.score} (Xếp loại: ${parsed.rating})
Chi tiết từng câu:
- Câu 4 (Cảm nhận/lý do yêu thích): ${qScores.q4}/2.0 điểm
- Câu 5 (Chủ đề tình bạn trẻ thơ): ${qScores.q5}/3.0 điểm
- Câu 6 (Đặc sắc nghệ thuật & dẫn chứng): ${qScores.q6}/5.0 điểm
Nhận xét chi tiết: ${student.comment}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden print-container transition-all">
      {/* Top Academic Ribbon */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-300 font-medium">
            Trường THPT Tịnh Biên · Bộ Môn Ngữ Văn 10
          </div>
          <div className="text-sm font-semibold text-white">
            Bài kiểm tra: Kỹ năng tìm ý, lập ý qua truyện ngắn "Áo Tết" (Nguyễn Ngọc Tư)
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-300">Thang điểm chuẩn</div>
          <div className="text-xs font-semibold text-blue-300">
            Thang điểm 10.0 (Câu 4: 2.0đ · Câu 5: 3.0đ · Câu 6: 5.0đ)
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Student & Class Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Kết quả học sinh tra cứu
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {student.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>Lớp: <strong className="text-slate-800 font-semibold">{student.class}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Năm học: 2026 - 2027</span>
              </div>
            </div>
          </div>

          {/* Big Score Box */}
          <div className="sm:text-right bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng điểm đạt được
            </div>
            <div className="flex sm:justify-end items-baseline gap-1 mt-0.5">
              <span className="text-4xl font-extrabold text-blue-700 tabular-nums">
                {student.score}
              </span>
            </div>
            <div className="mt-1">
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${parsed.badgeBg}`}>
                Xếp loại: {parsed.rating}
              </span>
            </div>
          </div>
        </div>

        {/* 10-Point Rubric Breakdown (Câu 4, Câu 5, Câu 6) */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
            <span>Chi tiết điểm số theo từng câu (Thang điểm 10):</span>
            <span className="text-slate-500 font-normal">Tổng: 10.0 điểm</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Câu 4 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Câu 4</span>
                  <span className="text-xs font-extrabold text-blue-700 tabular-nums">
                    {qScores.q4} / 2.0 điểm
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Nêu cảm nhận/lý do yêu thích tác phẩm. Điểm tối đa khi lý giải thuyết phục, chân thành.
                </p>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(qScores.q4 / 2.0) * 100}%` }}
                />
              </div>
            </div>

            {/* Câu 5 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Câu 5</span>
                  <span className="text-xs font-extrabold text-blue-700 tabular-nums">
                    {qScores.q5} / 3.0 điểm
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Nêu chính xác chủ đề truyện (Ca ngợi tình bạn trong sáng, thấu hiểu của trẻ thơ). Điểm tối đa khi cô đọng, trúng trọng tâm.
                </p>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(qScores.q5 / 3.0) * 100}%` }}
                />
              </div>
            </div>

            {/* Câu 6 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Câu 6</span>
                  <span className="text-xs font-extrabold text-blue-700 tabular-nums">
                    {qScores.q6} / 5.0 điểm
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  2 đặc sắc nghệ thuật (Tâm lý nhân vật tinh tế; Ngôn ngữ Nam Bộ) + 2 dẫn chứng trích từ văn bản.
                </p>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(qScores.q6 / 5.0) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Objective Teacher's Remarks (Khách quan, không xưng cô - trò, chỉ rõ hạn chế) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 md:p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Nhận xét chi tiết bài làm (Đánh giá ưu điểm & hạn chế từng câu):</span>
          </div>
          <div className="text-sm md:text-base text-slate-800 leading-relaxed bg-white p-4 rounded-lg border border-slate-200 space-y-1">
            <p className="font-medium text-slate-900">
              {student.comment}
            </p>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>Căn cứ đánh giá: Đáp án và biểu điểm chi tiết bài tập "Áo Tết"</span>
            </div>
            <span className="font-semibold text-slate-700">Bộ môn Ngữ Văn 10</span>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tra cứu học sinh khác</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép kết quả</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In phiếu điểm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
