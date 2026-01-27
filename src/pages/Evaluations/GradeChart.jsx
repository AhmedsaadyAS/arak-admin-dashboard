import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './GradeChart.css';

export default function GradeChart({ grades = [] }) {
    // Calculate grade distribution
    const distribution = useMemo(() => {
        const ranges = {
            'A (90-100)': { count: 0, color: '#22C55E' },
            'B (80-89)': { count: 0, color: '#3B82F6' },
            'C (70-79)': { count: 0, color: '#F59E0B' },
            'D (60-69)': { count: 0, color: '#EF4444' },
            'F (<60)': { count: 0, color: '#DC2626' }
        };

        grades.forEach(grade => {
            const marks = grade.marks;
            if (marks >= 90) ranges['A (90-100)'].count++;
            else if (marks >= 80) ranges['B (80-89)'].count++;
            else if (marks >= 70) ranges['C (70-79)'].count++;
            else if (marks >= 60) ranges['D (60-69)'].count++;
            else ranges['F (<60)'].count++;
        });

        return Object.entries(ranges).map(([grade, data]) => ({
            grade,
            students: data.count,
            color: data.color
        }));
    }, [grades]);

    if (grades.length === 0) {
        return null;
    }

    return (
        <div className="grade-chart-card">
            <div className="chart-header">
                <h3>Grade Distribution</h3>
                <p>{grades.length} students evaluated</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                        dataKey="grade"
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: '#E5E7EB' }}
                        label={{ value: 'Number of Students', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
                    />
                    <Tooltip
                        cursor={{ fill: '#F9FAFB' }}
                        contentStyle={{
                            background: 'white',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    />
                    <Bar dataKey="students" radius={[8, 8, 0, 0]}>
                        {distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
