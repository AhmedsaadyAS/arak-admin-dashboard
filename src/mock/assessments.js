// Multi-assessment tracking for students
// Types: task (20%), quiz (10%), midterm (30%), final (40%)

export const assessmentsData = [
    // Student 1 (Samantha William) - Grade 7-A
    // Mathematics
    { id: 1, studentId: 1, subjectId: 1, type: 'task', title: 'Algebra Homework 1', date: '2024-09-15', score: 18, maxScore: 20, weight: 0.05 },
    { id: 2, studentId: 1, subjectId: 1, type: 'task', title: 'Geometry Problem Set', date: '2024-09-22', score: 19, maxScore: 20, weight: 0.05 },
    { id: 3, studentId: 1, subjectId: 1, type: 'task', title: 'Fractions Assignment', date: '2024-10-01', score: 17, maxScore: 20, weight: 0.05 },
    { id: 4, studentId: 1, subjectId: 1, type: 'task', title: 'Word Problems', date: '2024-10-15', score: 20, maxScore: 20, weight: 0.05 },
    { id: 5, studentId: 1, subjectId: 1, type: 'quiz', title: 'Mid-Unit Quiz 1', date: '2024-09-28', score: 9, maxScore: 10, weight: 0.05 },
    { id: 6, studentId: 1, subjectId: 1, type: 'quiz', title: 'Mid-Unit Quiz 2', date: '2024-10-20', score: 10, maxScore: 10, weight: 0.05 },
    { id: 7, studentId: 1, subjectId: 1, type: 'midterm', title: 'Midterm Exam', date: '2024-11-10', score: 85, maxScore: 100, weight: 0.30 },
    { id: 8, studentId: 1, subjectId: 1, type: 'final', title: 'Final Exam', date: '2024-12-20', score: 88, maxScore: 100, weight: 0.40 },

    // English
    { id: 9, studentId: 1, subjectId: 3, type: 'task', title: 'Reading Comprehension 1', date: '2024-09-12', score: 16, maxScore: 20, weight: 0.05 },
    { id: 10, studentId: 1, subjectId: 3, type: 'task', title: 'Essay Writing', date: '2024-09-25', score: 18, maxScore: 20, weight: 0.05 },
    { id: 11, studentId: 1, subjectId: 3, type: 'task', title: 'Grammar Exercise', date: '2024-10-05', score: 19, maxScore: 20, weight: 0.05 },
    { id: 12, studentId: 1, subjectId: 3, type: 'task', title: 'Vocabulary Quiz Prep', date: '2024-10-18', score: 17, maxScore: 20, weight: 0.05 },
    { id: 13, studentId: 1, subjectId: 3, type: 'quiz', title: 'Vocabulary Quiz', date: '2024-09-30', score: 8, maxScore: 10, weight: 0.05 },
    { id: 14, studentId: 1, subjectId: 3, type: 'quiz', title: 'Grammar Quiz', date: '2024-10-22', score: 9, maxScore: 10, weight: 0.05 },
    { id: 15, studentId: 1, subjectId: 3, type: 'midterm', title: 'Midterm Exam', date: '2024-11-12', score: 90, maxScore: 100, weight: 0.30 },
    { id: 16, studentId: 1, subjectId: 3, type: 'final', title: 'Final Exam', date: '2024-12-22', score: 92, maxScore: 100, weight: 0.40 },

    // Science
    { id: 17, studentId: 1, subjectId: 2, type: 'task', title: 'Lab Report 1', date: '2024-09-18', score: 17, maxScore: 20, weight: 0.05 },
    { id: 18, studentId: 1, subjectId: 2, type: 'task', title: 'Cell Structure Diagram', date: '2024-09-28', score: 19, maxScore: 20, weight: 0.05 },
    { id: 19, studentId: 1, subjectId: 2, type: 'task', title: 'Ecosystem Project', date: '2024-10-10', score: 20, maxScore: 20, weight: 0.05 },
    { id: 20, studentId: 1, subjectId: 2, type: 'task', title: 'Lab Safety Assessment', date: '2024-10-20', score: 18, maxScore: 20, weight: 0.05 },
    { id: 21, studentId: 1, subjectId: 2, type: 'quiz', title: 'Unit 1 Quiz', date: '2024-10-01', score: 9, maxScore: 10, weight: 0.05 },
    { id: 22, studentId: 1, subjectId: 2, type: 'quiz', title: 'Unit 2 Quiz', date: '2024-10-25', score: 10, maxScore: 10, weight: 0.05 },
    { id: 23, studentId: 1, subjectId: 2, type: 'midterm', title: 'Midterm Exam', date: '2024-11-15', score: 87, maxScore: 100, weight: 0.30 },
    { id: 24, studentId: 1, subjectId: 2, type: 'final', title: 'Final Exam', date: '2024-12-18', score: 89, maxScore: 100, weight: 0.40 },

    // History
    { id: 25, studentId: 1, subjectId: 4, type: 'task', title: 'Chapter 1 Summary', date: '2024-09-14', score: 16, maxScore: 20, weight: 0.05 },
    { id: 26, studentId: 1, subjectId: 4, type: 'task', title: 'Timeline Project', date: '2024-09-27', score: 18, maxScore: 20, weight: 0.05 },
    { id: 27, studentId: 1, subjectId: 4, type: 'task', title: 'Map Analysis', date: '2024-10-08', score: 17, maxScore: 20, weight: 0.05 },
    { id: 28, studentId: 1, subjectId: 4, type: 'task', title: 'Historical Figure Report', date: '2024-10-21', score: 19, maxScore: 20, weight: 0.05 },
    { id: 29, studentId: 1, subjectId: 4, type: 'quiz', title: 'Era Quiz 1', date: '2024-10-03', score: 8, maxScore: 10, weight: 0.05 },
    { id: 30, studentId: 1, subjectId: 4, type: 'quiz', title: 'Era Quiz 2', date: '2024-10-24', score: 9, maxScore: 10, weight: 0.05 },
    { id: 31, studentId: 1, subjectId: 4, type: 'midterm', title: 'Midterm Exam', date: '2024-11-14', score: 84, maxScore: 100, weight: 0.30 },
    { id: 32, studentId: 1, subjectId: 4, type: 'final', title: 'Final Exam', date: '2024-12-21', score: 86, maxScore: 100, weight: 0.40 },

    // Student 2 (Tony Soap) - Struggling student
    // Mathematics - showing decline from tasks to exams
    { id: 33, studentId: 2, subjectId: 1, type: 'task', title: 'Algebra Homework 1', date: '2024-09-15', score: 17, maxScore: 20, weight: 0.05 },
    { id: 34, studentId: 2, subjectId: 1, type: 'task', title: 'Geometry Problem Set', date: '2024-09-22', score: 16, maxScore: 20, weight: 0.05 },
    { id: 35, studentId: 2, subjectId: 1, type: 'task', title: 'Fractions Assignment', date: '2024-10-01', score: 18, maxScore: 20, weight: 0.05 },
    { id: 36, studentId: 2, subjectId: 1, type: 'task', title: 'Word Problems', date: '2024-10-15', score: 16, maxScore: 20, weight: 0.05 },
    { id: 37, studentId: 2, subjectId: 1, type: 'quiz', title: 'Mid-Unit Quiz 1', date: '2024-09-28', score: 7, maxScore: 10, weight: 0.05 },
    { id: 38, studentId: 2, subjectId: 1, type: 'quiz', title: 'Mid-Unit Quiz 2', date: '2024-10-20', score: 6, maxScore: 10, weight: 0.05 },
    { id: 39, studentId: 2, subjectId: 1, type: 'midterm', title: 'Midterm Exam', date: '2024-11-10', score: 55, maxScore: 100, weight: 0.30 },
    { id: 40, studentId: 2, subjectId: 1, type: 'final', title: 'Final Exam', date: '2024-12-20', score: 52, maxScore: 100, weight: 0.40 },

    // Science - also struggling
    { id: 41, studentId: 2, subjectId: 2, type: 'task', title: 'Lab Report 1', date: '2024-09-18', score: 15, maxScore: 20, weight: 0.05 },
    { id: 42, studentId: 2, subjectId: 2, type: 'task', title: 'Cell Structure Diagram', date: '2024-09-28', score: 16, maxScore: 20, weight: 0.05 },
    { id: 43, studentId: 2, subjectId: 2, type: 'task', title: 'Ecosystem Project', date: '2024-10-10', score: 14, maxScore: 20, weight: 0.05 },
    { id: 44, studentId: 2, subjectId: 2, type: 'task', title: 'Lab Safety Assessment', date: '2024-10-20', score: 17, maxScore: 20, weight: 0.05 },
    { id: 45, studentId: 2, subjectId: 2, type: 'quiz', title: 'Unit 1 Quiz', date: '2024-10-01', score: 6, maxScore: 10, weight: 0.05 },
    { id: 46, studentId: 2, subjectId: 2, type: 'quiz', title: 'Unit 2 Quiz', date: '2024-10-25', score: 7, maxScore: 10, weight: 0.05 },
    { id: 47, studentId: 2, subjectId: 2, type: 'midterm', title: 'Midterm Exam', date: '2024-11-15', score: 58, maxScore: 100, weight: 0.30 },
    { id: 48, studentId: 2, subjectId: 2, type: 'final', title: 'Final Exam', date: '2024-12-18', score: 54, maxScore: 100, weight: 0.40 },

    // English - better performance
    { id: 49, studentId: 2, subjectId: 3, type: 'task', title: 'Reading Comprehension 1', date: '2024-09-12', score: 15, maxScore: 20, weight: 0.05 },
    { id: 50, studentId: 2, subjectId: 3, type: 'task', title: 'Essay Writing', date: '2024-09-25', score: 16, maxScore: 20, weight: 0.05 },
    { id: 51, studentId: 2, subjectId: 3, type: 'task', title: 'Grammar Exercise', date: '2024-10-05', score: 17, maxScore: 20, weight: 0.05 },
    { id: 52, studentId: 2, subjectId: 3, type: 'task', title: 'Vocabulary Quiz Prep', date: '2024-10-18', score: 16, maxScore: 20, weight: 0.05 },
    { id: 53, studentId: 2, subjectId: 3, type: 'quiz', title: 'Vocabulary Quiz', date: '2024-09-30', score: 7, maxScore: 10, weight: 0.05 },
    { id: 54, studentId: 2, subjectId: 3, type: 'quiz', title: 'Grammar Quiz', date: '2024-10-22', score: 8, maxScore: 10, weight: 0.05 },
    { id: 55, studentId: 2, subjectId: 3, type: 'midterm', title: 'Midterm Exam', date: '2024-11-12', score: 70, maxScore: 100, weight: 0.30 },
    { id: 56, studentId: 2, subjectId: 3, type: 'final', title: 'Final Exam', date: '2024-12-22', score: 72, maxScore: 100, weight: 0.40 },

    // Student 3 (Karen Hope) - Balanced performance
    // Mathematics
    { id: 57, studentId: 3, subjectId: 1, type: 'task', title: 'Algebra Homework 1', date: '2024-09-15', score: 15, maxScore: 20, weight: 0.05 },
    { id: 58, studentId: 3, subjectId: 1, type: 'task', title: 'Geometry Problem Set', date: '2024-09-22', score: 16, maxScore: 20, weight: 0.05 },
    { id: 59, studentId: 3, subjectId: 1, type: 'task', title: 'Fractions Assignment', date: '2024-10-01', score: 14, maxScore: 20, weight: 0.05 },
    { id: 60, studentId: 3, subjectId: 1, type: 'task', title: 'Word Problems', date: '2024-10-15', score: 17, maxScore: 20, weight: 0.05 },
    { id: 61, studentId: 3, subjectId: 1, type: 'quiz', title: 'Mid-Unit Quiz 1', date: '2024-09-28', score: 8, maxScore: 10, weight: 0.05 },
    { id: 62, studentId: 3, subjectId: 1, type: 'quiz', title: 'Mid-Unit Quiz 2', date: '2024-10-20', score: 8, maxScore: 10, weight: 0.05 },
    { id: 63, studentId: 3, subjectId: 1, type: 'midterm', title: 'Midterm Exam', date: '2024-11-10', score: 75, maxScore: 100, weight: 0.30 },
    { id: 64, studentId: 3, subjectId: 1, type: 'final', title: 'Final Exam', date: '2024-12-20', score: 78, maxScore: 100, weight: 0.40 }
];

// Helper function to calculate subject grade
export function calculateSubjectGrade(studentId, subjectId, assessments = assessmentsData) {
    const studentAssessments = assessments.filter(
        a => a.studentId === studentId && a.subjectId === subjectId
    );

    if (studentAssessments.length === 0) return null;

    let totalGrade = 0;
    studentAssessments.forEach(assessment => {
        const percentage = (assessment.score / assessment.maxScore) * 100;
        totalGrade += percentage * assessment.weight;
    });

    return Math.round(totalGrade * 10) / 10; // Round to 1 decimal
}

// Helper function to get performance breakdown
export function getPerformanceBreakdown(studentId, subjectId, assessments = assessmentsData) {
    const studentAssessments = assessments.filter(
        a => a.studentId === studentId && a.subjectId === subjectId
    );

    const breakdown = {
        tasks: { scores: [], total: 0, count: 0, percentage: 0 },
        quizzes: { scores: [], total: 0, count: 0, percentage: 0 },
        midterm: { score: 0, maxScore: 0, percentage: 0 },
        final: { score: 0, maxScore: 0, percentage: 0 }
    };

    studentAssessments.forEach(assessment => {
        const percentage = (assessment.score / assessment.maxScore) * 100;

        if (assessment.type === 'task') {
            breakdown.tasks.scores.push(percentage);
            breakdown.tasks.total += assessment.score;
            breakdown.tasks.count++;
        } else if (assessment.type === 'quiz') {
            breakdown.quizzes.scores.push(percentage);
            breakdown.quizzes.total += assessment.score;
            breakdown.quizzes.count++;
        } else if (assessment.type === 'midterm') {
            breakdown.midterm.score = assessment.score;
            breakdown.midterm.maxScore = assessment.maxScore;
            breakdown.midterm.percentage = percentage;
        } else if (assessment.type === 'final') {
            breakdown.final.score = assessment.score;
            breakdown.final.maxScore = assessment.maxScore;
            breakdown.final.percentage = percentage;
        }
    });

    // Calculate averages
    if (breakdown.tasks.count > 0) {
        breakdown.tasks.percentage = breakdown.tasks.scores.reduce((a, b) => a + b, 0) / breakdown.tasks.count;
    }
    if (breakdown.quizzes.count > 0) {
        breakdown.quizzes.percentage = breakdown.quizzes.scores.reduce((a, b) => a + b, 0) / breakdown.quizzes.count;
    }

    return breakdown;
}

// Helper function to calculate overall performance
export function calculateOverallPerformance(studentId, assessments = assessmentsData) {
    const subjects = [...new Set(assessments.filter(a => a.studentId === studentId).map(a => a.subjectId))];

    if (subjects.length === 0) return null;

    const subjectGrades = subjects.map(subjectId => calculateSubjectGrade(studentId, subjectId, assessments));
    const validGrades = subjectGrades.filter(g => g !== null);

    if (validGrades.length === 0) return null;

    return Math.round(validGrades.reduce((a, b) => a + b, 0) / validGrades.length * 10) / 10;
}
