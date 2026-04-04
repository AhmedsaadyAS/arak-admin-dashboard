import * as XLSX from 'xlsx';
import { getGradingSchema, calculateTotal } from '../config/gradingSystems';
import { api } from './api';

/**
 * Official Sheet Service
 *
 * Uses plain `xlsx` (SheetJS community) — 100% browser-native, zero Node.js deps.
 *
 * Template layout:
 *   Row 1 — School + class name  (merged)
 *   Row 2 — Subject + stage + date (merged)
 *   Row 3 — Instructions           (merged)
 *   Row 4 — Column headers
 *   Row 5+ — Student data rows
 *
 * Columns:
 *   A = Seat No.  |  B = Student ID  |  C = Student Name
 *   D..N = grade columns (editable)  |  last = Total (SUM formula)
 */

// ─── Constants ────────────────────────────────────────
const ABSENCE_MARKERS = new Set(['غ', 'A', 'a', 'غائب']);

/** Excel column letter from 0-based index: 0→A, 1→B, … */
function colLetter(idx) {
    let r = '';
    let n = idx;
    do {
        r = String.fromCharCode(65 + (n % 26)) + r;
        n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return r;
}

// ─── Generate Excel Template ─────────────────────────

/**
 * Generate an official grading Excel sheet.
 *
 * @param {string} stageKey    'PRIMARY' | 'PREP' | 'SECONDARY'
 * @param {string} subjectName  e.g. 'Mathematics'
 * @param {Array}  students    [{ id, name, seatNumber }]
 * @param {string} className   e.g. 'Grade 7-A'
 * @returns {ArrayBuffer}
 */
export function generateOfficialSheet(stageKey, subjectName, students, className = '') {
    const schema = getGradingSchema(stageKey);
    if (!schema) throw new Error(`Unknown stage: ${stageKey}`);

    const numGrade = schema.columns.length;
    const totalCols = 3 + numGrade + 1;        // A-C + grade cols + Total
    const today = new Date().toLocaleDateString('en-GB');

    const wb = XLSX.utils.book_new();

    // ── Build all rows as an AOA (array-of-arrays) ────

    // Row 1 — School banner
    const row1 = [`ARAK School  |  مدرسة أراك  —  ${className}`, ...Array(totalCols - 1).fill('')];

    // Row 2 — Subject + stage + date
    const row2 = [`${subjectName}  —  ${schema.labelAr}  —  ${today}`, ...Array(totalCols - 1).fill('')];

    // Row 3 — Instructions
    const row3 = [
        `⚠ Enter scores below. For absent students write: غ or A  |  أدخل الدرجات. للغياب اكتب: غ`,
        ...Array(totalCols - 1).fill(''),
    ];

    // Row 4 — Column headers
    const row4 = [
        'Seat No.\nرقم الجلوس',
        'Student ID\nكود الطالب',
        'Student Name\nاسم الطالب',
        ...schema.columns.map(col => `${col.labelAr}\n${col.label}\n(max ${col.maxScore})`),
        `Total\nالمجموع\n(max ${schema.totalMaxScore})`,
    ];

    // Rows 5+ — Student data
    const dataRows = students.map((student, idx) => {
        const excelRow = 5 + idx; // 1-based row number in the final sheet
        // Grade columns: leave empty for teacher to fill
        const gradeCells = schema.columns.map(() => null);
        // Total formula
        const firstGradeCol = colLetter(3);  // D (0-based index 3)
        const lastGradeCol = colLetter(3 + numGrade - 1);
        // Return data row
        return [
            student.seatNumber || idx + 1,
            student.id,
            student.name,
            ...gradeCells,
            null,  // placeholder for Total — will add formula manually below
        ];
    });

    // Assemble full AOA
    const aoa = [row1, row2, row3, row4, ...dataRows];

    // Create worksheet from AOA
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // ── Add SUM formulas for Total column ─────────────
    const totalColLetter = colLetter(totalCols - 1); // last column
    const firstGradeCol = colLetter(3);              // D
    const lastGradeCol = colLetter(3 + numGrade - 1);

    students.forEach((_, idx) => {
        const excelRow = 5 + idx;
        const addr = `${totalColLetter}${excelRow}`;
        ws[addr] = { t: 'n', f: `SUM(${firstGradeCol}${excelRow}:${lastGradeCol}${excelRow})` };
    });

    // ── Merges: rows 1, 2, 3 span all columns ────────
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } },
    ];

    // ── Column widths ─────────────────────────────────
    ws['!cols'] = [
        { wch: 10 },  // A — Seat
        { wch: 14 },  // B — Student ID
        { wch: 28 },  // C — Name
        ...schema.columns.map(() => ({ wch: 16 })),
        { wch: 13 },  // Total
    ];

    // ── Row heights ───────────────────────────────────
    ws['!rows'] = [
        { hpx: 32 },  // Row 1
        { hpx: 24 },  // Row 2
        { hpx: 32 },  // Row 3 — instructions
        { hpx: 50 },  // Row 4 — headers (bilingual, wrapped)
        ...students.map(() => ({ hpx: 22 })),
    ];

    // ── Build workbook and write ──────────────────────
    const sheetName = `${className || stageKey} - ${subjectName}`.substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    return wb;
}

/**
 * Trigger browser download of an Excel workbook.
 * Uses base64 data URI to avoid blob URL issues with filenames.
 */
export function downloadSheet(wb, filename) {
    // Write workbook as a binary array (Blob-compatible)
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Use object URL — Chrome respects the filename on Blob URLs (unlike data: URIs)
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke after a short delay to allow download to start
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── Parse Uploaded Excel ─────────────────────────────

/**
 * Parse an uploaded official grading sheet.
 *
 * Layout expectations (matching our template):
 *   Rows 1-3 = metadata + instructions (skipped)
 *   Row 4    = column headers (skipped)
 *   Rows 5+  = student data
 *
 * Column layout:
 *   0 = Seat No | 1 = Student ID | 2 = Name
 *   3..3+N-1 = grades | last = Total (skip — formula)
 */
export async function parseOfficialSheet(file, stageKey) {
    const schema = getGradingSchema(stageKey);
    if (!schema) {
        return {
            validGrades: [],
            errors: [{ row: 0, message: `Unknown stage: ${stageKey}` }],
            summary: { totalRows: 0, validCount: 0, errorCount: 1, averageTotal: 0 },
        };
    }

    let arrayBuffer;
    if (file instanceof File) {
        arrayBuffer = await file.arrayBuffer();
    } else {
        arrayBuffer = file;
    }

    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];

    if (!ws) {
        return { validGrades: [], errors: [{ row: 0, message: 'Empty spreadsheet' }], summary: {} };
    }

    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true });

    // First 4 rows are headers — data starts at index 4 (row 5)
    const DATA_START = 4;

    if (data.length <= DATA_START) {
        return {
            validGrades: [],
            errors: [{ row: 0, message: 'No student data found (expected from row 5)' }],
            summary: { totalRows: 0, validCount: 0, errorCount: 0, averageTotal: 0 },
        };
    }

    const validGrades = [];
    const errors = [];
    const studentRows = data.slice(DATA_START);

    studentRows.forEach((row, idx) => {
        const excelRow = DATA_START + idx + 1; // 1-based
        const seatNum = row[0];
        const rawId = row[1];
        const name = row[2];

        // Skip blank rows
        if ((rawId === '' || rawId == null) && !name) return;

        if (rawId === '' || rawId == null) {
            errors.push({ row: excelRow, message: `Row ${excelRow}: Missing Student ID (column B)` });
            return;
        }

        const studentId = typeof rawId === 'number' ? rawId : parseInt(rawId, 10);
        if (isNaN(studentId)) {
            errors.push({ row: excelRow, message: `Row ${excelRow}: Invalid Student ID "${rawId}"` });
            return;
        }

        const scores = {};
        let hasAnyScore = false;

        schema.columns.forEach((col, colIdx) => {
            const rawVal = row[3 + colIdx]; // grades start at index 3 (col D)

            // Empty cells → 0 marks (NOT skipped) so maxMarks is always counted
            if (rawVal === '' || rawVal == null) {
                scores[col.key] = 0;
                hasAnyScore = true;
                return;
            }
            const strVal = String(rawVal).trim();
            if (strVal === '') {
                scores[col.key] = 0;
                hasAnyScore = true;
                return;
            }

            if (ABSENCE_MARKERS.has(strVal)) {
                scores[col.key] = -1;
                hasAnyScore = true;
                return;
            }

            const numVal = Number(strVal);
            if (isNaN(numVal)) {
                errors.push({ row: excelRow, message: `Row ${excelRow}, ${col.label}: "${rawVal}" is not valid (use غ for absence)` });
                return;
            }
            if (numVal < 0) {
                errors.push({ row: excelRow, message: `Row ${excelRow}, ${col.label}: negative score` });
                return;
            }
            if (numVal > col.maxScore) {
                errors.push({ row: excelRow, message: `Row ${excelRow}, ${col.label}: ${numVal} exceeds max ${col.maxScore}` });
                return;
            }

            scores[col.key] = numVal;
            hasAnyScore = true;
        });

        if (hasAnyScore) {
            validGrades.push({
                studentId,
                studentName: String(name || ''),
                seatNumber: seatNum || idx + 1,
                scores,
                total: calculateTotal(scores, stageKey),
            });
        }
    });

    const summary = {
        totalRows: studentRows.filter(r => r[1] || r[2]).length,
        validCount: validGrades.length,
        errorCount: errors.length,
        averageTotal: validGrades.length > 0
            ? Math.round(validGrades.reduce((s, g) => s + g.total, 0) / validGrades.length)
            : 0,
    };

    return { validGrades, errors, summary };
}

/**
 * Convert parsed grades → evaluation records for the database.
 */
export function gradesToEvaluations(validGrades, meta, stageKey) {
    const schema = getGradingSchema(stageKey);
    if (!schema) return [];

    const today = new Date().toISOString().split('T')[0];
    const out = [];

    for (const grade of validGrades) {
        for (const col of schema.columns) {
            const score = grade.scores[col.key];
            // score=0 means empty cell, still create the record so maxMarks is counted
            if (score === undefined) continue;

            out.push({
                studentId: grade.studentId,
                studentName: grade.studentName,
                classId: meta.classId,
                teacherId: meta.teacherId || null,
                subjectId: meta.subjectId,
                subject: meta.subjectName,
                assessmentType: col.label,
                marks: score === -1 ? 0 : score,
                maxMarks: col.maxScore,
                feedback: score === -1 ? 'Absent (غائب)' : '',
                date: today,
                termId: meta.termId || 1,
                isAbsent: score === -1,
            });
        }
    }
    return out;
}

/**
 * Upsert evaluations:
 * 1. DELETE all existing evaluations for (classId, subjectId)
 * 2. INSERT fresh ones from the uploaded sheet
 *
 * Ensures GradeBook always shows the latest upload, no duplicates.
 */
export async function saveEvaluations(evaluations, classId, subjectId) {
    const errors = [];
    let deleted = 0;
    let saved = 0;

    const cId = parseInt(classId, 10);
    const sId = parseInt(subjectId, 10);
    console.log(`[saveEvaluations] Upsert classId=${cId}, subjectId=${sId}, records=${evaluations.length}`);

    // ── 1. Fetch ALL existing evaluations for this class+subject ──
    let existingIds = [];
    try {
        const res = await api.client.get('/evaluations', {
            params: { classId: cId, subjectId: sId },
        });
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        existingIds = list.map(e => e.id);
    } catch (err) {
        console.error('[saveEvaluations] FAILED to fetch existing:', err);
    }

    // ── 2. Delete ALL stale records one by one ──
    for (const id of existingIds) {
        try {
            await api.client.delete(`/evaluations/${id}`);
            deleted++;
        } catch (err) {
            console.error(`[saveEvaluations] FAILED to delete id=${id}:`, err.message);
            errors.push(`Delete id ${id}: ${err.message}`);
        }
    }

    // ── 3. Verify deletion — make sure old records are gone ──
    try {
        const check = await api.client.get('/evaluations', {
            params: { classId: cId, subjectId: sId },
        });
        const leftover = Array.isArray(check.data) ? check.data : (check.data?.data || []);
        if (leftover.length > 0) {
            console.warn(`[saveEvaluations] ${leftover.length} records still remain after delete — cleaning up`);
            for (const rec of leftover) {
                try { await api.client.delete(`/evaluations/${rec.id}`); deleted++; } catch (_) { }
            }
        }
    } catch (_) { }

    // ── 4. Insert fresh records SEQUENTIALLY ──
    // (json-server is file-based — parallel POSTs cause race-condition duplicates)
    for (let i = 0; i < evaluations.length; i++) {
        try {
            await api.client.post('/evaluations', evaluations[i]);
            saved++;
        } catch (err) {
            console.error(`[saveEvaluations] FAILED to insert row ${i + 1}:`, err.message);
            errors.push(`Row ${i + 1}: ${err.message}`);
        }
    }

    return { saved, deleted, errors };
}
