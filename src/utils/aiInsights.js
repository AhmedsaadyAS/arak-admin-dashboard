// AI-powered student risk assessment (rule-based)
import { assessmentsData, calculateSubjectGrade, getPerformanceBreakdown } from '../mock/assessments';
import { attendanceData } from '../mock/attendance';

/**
 * Analyze student risk level based on attendance and performance
 * @param {Object} student - Student object
 * @param {Array} assessments - Assessments data
 * @param {Object} attendance - Attendance data
 * @returns {Object} Risk analysis
 */
export function analyzeStudentRisk(student, assessments = assessmentsData, attendance = attendanceData) {
    const studentAssessments = assessments.filter(a => a.studentId === student.id);
    const studentAttendance = attendance[student.id];

    // Calculate attendance percentage
    const attendancePercent = studentAttendance
        ? (studentAttendance.present / (studentAttendance.present + studentAttendance.absent)) * 100
        : 100;

    // Get unique subjects
    const subjects = [...new Set(studentAssessments.map(a => a.subjectId))];

    // Core subjects (Math, Science, English)
    const coreSubjects = [1, 2, 3];

    let failingCoreCount = 0;
    let taskVsExamGap = false;
    const subjectIssues = [];

    subjects.forEach(subjectId => {
        const grade = calculateSubjectGrade(student.id, subjectId, assessments);
        const breakdown = getPerformanceBreakdown(student.id, subjectId, assessments);

        // Check if failing in core subject
        if (coreSubjects.includes(subjectId) && grade < 60) {
            failingCoreCount++;
            subjectIssues.push({ subjectId, issue: 'failing', grade });
        }

        // Check for task vs exam gap (good tasks but weak exams)
        if (breakdown.tasks.percentage > 80 &&
            (breakdown.midterm.percentage < 60 || breakdown.final.percentage < 60)) {
            taskVsExamGap = true;
            subjectIssues.push({
                subjectId,
                issue: 'exam-gap',
                taskAvg: breakdown.tasks.percentage,
                examAvg: (breakdown.midterm.percentage + breakdown.final.percentage) / 2
            });
        }
    });

    // Determine risk level
    let riskLevel = 'Low';
    const riskFactors = [];

    if (attendancePercent < 80) {
        riskLevel = 'High';
        riskFactors.push(`Low attendance: ${attendancePercent.toFixed(1)}%`);
    }

    if (failingCoreCount >= 2) {
        riskLevel = 'High';
        riskFactors.push(`Failing ${failingCoreCount} core subjects`);
    } else if (failingCoreCount === 1) {
        riskLevel = riskLevel === 'High' ? 'High' : 'Medium';
        riskFactors.push('Struggling in 1 core subject');
    }

    if (taskVsExamGap) {
        riskLevel = riskLevel === 'Low' ? 'Medium' : riskLevel;
        riskFactors.push('Good in tasks but weak in exams');
    }

    return {
        riskLevel,
        riskFactors,
        attendancePercent,
        failingCoreCount,
        subjectIssues,
        recommendations: generateRecommendations(riskFactors, subjectIssues)
    };
}

/**
 * Generate actionable recommendations based on risk factors
 * @param {Array} riskFactors - Array of risk factors
 * @param {Array} subjectIssues - Subject-specific issues
 * @returns {Array} Recommendations
 */
function generateRecommendations(riskFactors, subjectIssues) {
    const recommendations = [];

    riskFactors.forEach(factor => {
        if (factor.includes('attendance')) {
            recommendations.push('Schedule parent meeting to discuss attendance');
            recommendations.push('Monitor daily attendance closely');
        }

        if (factor.includes('exam')) {
            recommendations.push('Provide exam-style practice and test-taking strategies');
            recommendations.push('Consider one-on-one tutoring for exam preparation');
        }

        if (factor.includes('core subjects')) {
            recommendations.push('Assign peer tutor or schedule extra help sessions');
            recommendations.push('Break down complex topics into smaller learning goals');
        }
    });

    return [...new Set(recommendations)]; // Remove duplicates
}

/**
 * Get insights for displaying in UI
 * @param {Object} student - Student object
 * @returns {Object} Formatted insights for UI
 */
export function getStudentInsights(student) {
    const analysis = analyzeStudentRisk(student);

    return {
        riskLevel: analysis.riskLevel,
        summary: getRiskSummary(analysis),
        factors: analysis.riskFactors.slice(0, 3), // Top 3 factors
        recommendations: analysis.recommendations.slice(0, 3), // Top 3 recommendations
        attendancePercent: analysis.attendancePercent
    };
}

/**
 * Get a human-readable summary of the risk
 * @param {Object} analysis - Risk analysis
 * @returns {string} Summary
 */
function getRiskSummary(analysis) {
    if (analysis.riskLevel === 'High') {
        return 'Student requires immediate attention and intervention';
    } else if (analysis.riskLevel === 'Medium') {
        return 'Monitor closely and provide additional support';
    } else {
        return 'Student is performing well overall';
    }
}

/**
 * Get high-risk students for dashboard widget
 * @param {Array} students - All students
 * @returns {Array} High-risk students with details
 */
export function getHighRiskStudents(students) {
    return students
        .map(student => ({
            ...student,
            analysis: analyzeStudentRisk(student)
        }))
        .filter(s => s.analysis.riskLevel === 'High')
        .map(s => ({
            id: s.id,
            name: s.name,
            studentId: s.studentId,
            grade: s.grade,
            mainIssue: s.analysis.riskFactors[0] || 'Requires attention',
            riskFactors: s.analysis.riskFactors
        }));
}
