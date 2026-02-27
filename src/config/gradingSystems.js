/**
 * Egyptian Ministry of Education Grading Systems (2025)
 * 
 * Defines column schemas for each educational stage.
 * Each column has: key, label (English), labelAr (Arabic), maxScore.
 * 
 * The total for each stage always sums to 100.
 */

export const STAGES = {
    PRIMARY: {
        key: 'PRIMARY',
        label: 'Primary',
        labelAr: 'ابتدائي',
        grades: [4, 5, 6],
        description: 'Grades 4–6 (الصفوف 4–6)',
    },
    PREP: {
        key: 'PREP',
        label: 'Preparatory',
        labelAr: 'إعدادي',
        grades: [7, 8, 9],
        description: 'Grades 7–9 (الصفوف 7–9)',
    },
    SECONDARY: {
        key: 'SECONDARY',
        label: 'Secondary',
        labelAr: 'ثانوي',
        grades: [10, 11, 12],
        description: 'Grades 10–12 (الصفوف 10–12)',
    },
};

/**
 * Grade column schemas per stage.
 * 
 * Each column defines:
 *   - key:      unique identifier (used in code/export)
 *   - label:    English display name
 *   - labelAr:  Arabic display name (for official sheets)
 *   - maxScore: maximum allowed mark
 *   - editable: whether teachers can input grades for this column
 */
export const GRADING_SYSTEMS = {
    // ══════════════════════════════════════════════════════════════
    //  PRIMARY STAGE — الابتدائي (Grades 4–6)
    //  No weekly tests. Uses Performance Tasks (مهام أدائية) instead.
    // ══════════════════════════════════════════════════════════════
    PRIMARY: {
        stageKey: 'PRIMARY',
        label: 'Primary Stage',
        labelAr: 'المرحلة الابتدائية',
        totalMaxScore: 100,
        columns: [
            {
                key: 'month1',
                label: 'Month 1 Test',
                labelAr: 'اختبار شهر 1',
                maxScore: 15,
                editable: true,
            },
            {
                key: 'month2',
                label: 'Month 2 Test',
                labelAr: 'اختبار شهر 2',
                maxScore: 15,
                editable: true,
            },
            {
                key: 'performanceTasks',
                label: 'Performance Tasks',
                labelAr: 'مهام أدائية',
                maxScore: 35,
                editable: true,
            },
            {
                key: 'attendance',
                label: 'Attendance',
                labelAr: 'حضور وانضباط',
                maxScore: 5,
                editable: true,
            },
            {
                key: 'final',
                label: 'Final Exam',
                labelAr: 'اختبار نهائي',
                maxScore: 30,
                editable: true,
            },
        ],
    },

    // ══════════════════════════════════════════════════════════════
    //  PREP STAGE — الإعدادي (Grades 7–9)
    //  Has weekly tests, homework, and behavior columns.
    // ══════════════════════════════════════════════════════════════
    PREP: {
        stageKey: 'PREP',
        label: 'Preparatory Stage',
        labelAr: 'المرحلة الإعدادية',
        totalMaxScore: 100,
        columns: [
            {
                key: 'month1',
                label: 'Month 1 Test',
                labelAr: 'اختبار شهر 1',
                maxScore: 15,
                editable: true,
            },
            {
                key: 'month2',
                label: 'Month 2 Test',
                labelAr: 'اختبار شهر 2',
                maxScore: 15,
                editable: true,
            },
            {
                key: 'weeklyTests',
                label: 'Weekly Tests',
                labelAr: 'اختبارات أسبوعية',
                maxScore: 20,
                editable: true,
            },
            {
                key: 'homework',
                label: 'Homework',
                labelAr: 'واجبات',
                maxScore: 10,
                editable: true,
            },
            {
                key: 'behavior',
                label: 'Behavior',
                labelAr: 'سلوك',
                maxScore: 10,
                editable: true,
            },
            {
                key: 'final',
                label: 'Final Exam',
                labelAr: 'اختبار نهائي',
                maxScore: 30,
                editable: true,
            },
        ],
    },

    // ══════════════════════════════════════════════════════════════
    //  SECONDARY STAGE — الثانوي (Grades 10–12)
    //  Final exam weighs 60%.
    // ══════════════════════════════════════════════════════════════
    SECONDARY: {
        stageKey: 'SECONDARY',
        label: 'Secondary Stage',
        labelAr: 'المرحلة الثانوية',
        totalMaxScore: 100,
        columns: [
            {
                key: 'weeklyTests',
                label: 'Weekly Tests',
                labelAr: 'اختبارات أسبوعية',
                maxScore: 15,
                editable: true,
            },
            {
                key: 'homework',
                label: 'Homework',
                labelAr: 'واجبات',
                maxScore: 15,
                editable: true,
            },
            {
                key: 'behavior',
                label: 'Behavior',
                labelAr: 'سلوك',
                maxScore: 10,
                editable: true,
            },
            {
                key: 'final',
                label: 'Final Exam',
                labelAr: 'اختبار نهائي',
                maxScore: 60,
                editable: true,
            },
        ],
    },
};

/**
 * Get the grading schema for a given stage key.
 * @param {'PRIMARY'|'PREP'|'SECONDARY'} stageKey
 * @returns {Object|null}
 */
export function getGradingSchema(stageKey) {
    return GRADING_SYSTEMS[stageKey] || null;
}

/**
 * Get stage key from a grade level number.
 * @param {number} gradeLevel  e.g. 4, 7, 10
 * @returns {'PRIMARY'|'PREP'|'SECONDARY'|null}
 */
export function getStageForGrade(gradeLevel) {
    const g = parseInt(gradeLevel, 10);
    if (g >= 4 && g <= 6) return 'PRIMARY';
    if (g >= 7 && g <= 9) return 'PREP';
    if (g >= 10 && g <= 12) return 'SECONDARY';
    return null;
}

/**
 * Validate scores against the stage schema.
 * @param {Object} scores  e.g. { month1: 14, month2: 16, final: 28 }
 * @param {'PRIMARY'|'PREP'|'SECONDARY'} stageKey
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateScores(scores, stageKey) {
    const schema = GRADING_SYSTEMS[stageKey];
    if (!schema) return { valid: false, errors: [`Unknown stage: ${stageKey}`] };

    const errors = [];

    for (const col of schema.columns) {
        const val = scores[col.key];

        if (val === undefined || val === null || val === '') {
            continue; // Not provided — acceptable
        }

        // Handle absence markers
        if (val === 'غ' || val === 'A' || val === -1) {
            continue; // Valid absence marker
        }

        const numVal = Number(val);
        if (isNaN(numVal)) {
            errors.push(`${col.label}: "${val}" is not a valid number`);
            continue;
        }

        if (numVal < 0) {
            errors.push(`${col.label}: Score cannot be negative (${numVal})`);
        }

        if (numVal > col.maxScore) {
            errors.push(`${col.label}: Score ${numVal} exceeds maximum ${col.maxScore}`);
        }
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Calculate total score from individual column scores.
 * @param {Object} scores
 * @param {'PRIMARY'|'PREP'|'SECONDARY'} stageKey
 * @returns {number}
 */
export function calculateTotal(scores, stageKey) {
    const schema = GRADING_SYSTEMS[stageKey];
    if (!schema) return 0;

    let total = 0;
    for (const col of schema.columns) {
        const val = scores[col.key];
        if (val === 'غ' || val === 'A' || val === -1) continue; // Absent
        const num = Number(val);
        if (!isNaN(num) && num >= 0) total += num;
    }
    return total;
}

/**
 * All available stages as an array (for dropdowns).
 */
export const STAGE_OPTIONS = Object.values(STAGES).map(s => ({
    value: s.key,
    label: `${s.label} (${s.labelAr})`,
    labelAr: s.labelAr,
    grades: s.grades,
}));
