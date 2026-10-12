import { StudentScore, ParsedScore, ScoreRating, QuestionScores } from '../types';

/**
 * Removes Vietnamese diacritical marks to enable accent-insensitive search.
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  let result = str.trim().toLowerCase();
  result = result.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  result = result.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  result = result.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  result = result.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  result = result.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  result = result.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  result = result.replace(/đ/g, 'd');
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return result;
}

/**
 * Calculates question breakdown if not explicitly defined
 */
export function getQuestionScores(student: StudentScore, total: number): QuestionScores {
  if (student.questionScores) {
    return student.questionScores;
  }

  // Derive proportionally from total score (max 10: Q4 max 2.0, Q5 max 3.0, Q6 max 5.0)
  const ratio = Math.max(0, Math.min(1, total / 10));
  let q4 = Math.round(ratio * 2.0 * 2) / 2; // snap to 0.5
  let q5 = Math.round(ratio * 3.0 * 2) / 2;
  let q6 = Number((total - q4 - q5).toFixed(1));

  if (q6 < 0) {
    q6 = 0;
    q5 = Number((total - q4).toFixed(1));
  } else if (q6 > 5.0) {
    const excess = q6 - 5.0;
    q6 = 5.0;
    q5 = Math.min(3.0, Number((q5 + excess).toFixed(1)));
  }

  return {
    q4: Math.min(2.0, Math.max(0, q4)),
    q5: Math.min(3.0, Math.max(0, q5)),
    q6: Math.min(5.0, Math.max(0, q6)),
  };
}

/**
 * Parses score strings on the 10-point scale: "8.5/10", "9.0", "7.5/10.0"
 */
export function parseScore(scoreStr: string, student?: StudentScore): ParsedScore {
  let scoreNum = 0;
  let maxNum = 10.0; // Standard 10-point scale for Áo Tết (Câu 4: 2.0, Câu 5: 3.0, Câu 6: 5.0)

  const clean = scoreStr.replace(/\s+/g, '').replace(',', '.');
  if (clean.includes('/')) {
    const parts = clean.split('/');
    scoreNum = parseFloat(parts[0]) || 0;
    maxNum = parseFloat(parts[1]) || 10.0;
  } else {
    scoreNum = parseFloat(clean) || 0;
    maxNum = 10.0;
  }

  // Normalize to 10 scale for percentage calculation
  const percentage = maxNum > 0 ? (scoreNum / maxNum) * 100 : 0;
  const scaledScore = maxNum === 10 ? scoreNum : (scoreNum / maxNum) * 10;

  let rating: ScoreRating = 'Chưa đạt';
  let ratingColor = 'text-rose-700';
  let badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';

  if (scaledScore >= 9.0) {
    rating = 'Xuất sắc';
    ratingColor = 'text-emerald-700';
    badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (scaledScore >= 8.0) {
    rating = 'Giỏi';
    ratingColor = 'text-blue-700';
    badgeBg = 'bg-blue-50 text-blue-800 border-blue-200';
  } else if (scaledScore >= 6.5) {
    rating = 'Khá';
    ratingColor = 'text-amber-700';
    badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (scaledScore >= 5.0) {
    rating = 'Đạt';
    ratingColor = 'text-slate-700';
    badgeBg = 'bg-slate-100 text-slate-800 border-slate-200';
  }

  const questionScores = student ? getQuestionScores(student, scoreNum) : undefined;

  return {
    scoreNum,
    maxNum,
    percentage: Math.min(100, Math.max(0, percentage)),
    rating,
    ratingColor,
    badgeBg,
    questionScores,
  };
}

/**
 * Searches students by query with flexible accent matching
 */
export function searchStudents(
  students: StudentScore[],
  query: string,
  selectedClass?: string
): StudentScore[] {
  const normQuery = removeVietnameseTones(query);
  if (!normQuery && (!selectedClass || selectedClass === 'ALL')) {
    return students;
  }

  return students.filter((student) => {
    const matchesClass = !selectedClass || selectedClass === 'ALL' || student.class === selectedClass;
    if (!matchesClass) return false;

    if (!normQuery) return true;

    const normName = removeVietnameseTones(student.name);
    return normName.includes(normQuery);
  });
}

/**
 * Parses tab-delimited or comma-delimited text from Google Sheets or Excel
 */
export function parseSpreadsheetText(
  rawText: string,
  fallbackClass: string = '10A3'
): { parsed: StudentScore[]; errors: string[] } {
  const lines = rawText.trim().split(/\r?\n/);
  const parsed: StudentScore[] = [];
  const errors: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (i === 0 && (line.toLowerCase().includes('họ tên') || line.toLowerCase().includes('name'))) {
      continue;
    }

    let parts = line.split('\t');
    if (parts.length < 2) {
      parts = line.includes(';') ? line.split(';') : line.split(',');
    }

    parts = parts.map((p) => p.trim());

    if (parts.length >= 2) {
      const name = parts[0];
      let cls = fallbackClass;
      let score = '';
      let comment = '';

      if (parts.length === 2) {
        score = parts[1];
      } else if (parts.length === 3) {
        if (parts[1].toUpperCase().includes('10A') || parts[1].toUpperCase().includes('11A') || parts[1].toUpperCase().includes('12A')) {
          cls = parts[1].toUpperCase();
          score = parts[2];
        } else {
          score = parts[1];
          comment = parts[2];
        }
      } else if (parts.length >= 4) {
        cls = parts[1].toUpperCase();
        score = parts[2];
        comment = parts.slice(3).join(', ');
      }

      // Format score to /10 if just a raw number
      if (score && !score.includes('/')) {
        const val = parseFloat(score.replace(',', '.'));
        if (!isNaN(val)) {
          score = `${val}/10`;
        }
      }

      if (name && score) {
        parsed.push({
          id: `imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name,
          class: cls,
          score,
          comment: comment || 'Đã hoàn thành bài kiểm tra.',
          testTitle: 'Kỹ năng tìm ý, lập ý qua "Áo Tết"',
          date: new Date().toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }),
        });
      } else {
        errors.push(`Dòng ${i + 1}: Thiếu thông tin tên hoặc điểm`);
      }
    } else {
      errors.push(`Dòng ${i + 1}: Không đúng định dạng`);
    }
  }

  return { parsed, errors };
}

/**
 * Exports students to CSV download
 */
export function exportToCSV(students: StudentScore[], filename = 'Bang_diem_Ao_Tet_THPT_Tinh_Bien.csv') {
  const headers = ['Họ và tên', 'Lớp', 'Điểm tổng (thang 10)', 'Câu 4 (/2.0)', 'Câu 5 (/3.0)', 'Câu 6 (/5.0)', 'Nhận xét chi tiết', 'Chủ đề'];
  const rows = students.map((s) => {
    const p = parseScore(s.score, s);
    const qs = p.questionScores || getQuestionScores(s, p.scoreNum);
    return [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.class}"`,
      `"${s.score}"`,
      `"${qs.q4}"`,
      `"${qs.q5}"`,
      `"${qs.q6}"`,
      `"${(s.comment || '').replace(/"/g, '""')}"`,
      `"${s.testTitle || 'Kỹ năng tìm ý, lập ý qua "Áo Tết"'}"`,
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
