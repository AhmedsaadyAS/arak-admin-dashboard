import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartErrorBoundary from '../common/ChartErrorBoundary';

/**
 * Dynamic Bar Chart: Students per Teacher
 * Uses useMemo to aggregate large dataset.
 */
const StudentsPerTeacherChart = ({ students = [], teachers = [] }) => {

    const chartData = useMemo(() => {
        if (!students.length || !teachers.length) return [];

        // Map teacherId to Name for readability
        const teacherMap = teachers.reduce((acc, t) => {
            acc[t.id] = t.name;
            return acc;
        }, {});

        // Count students per teacher
        const counts = students.reduce((acc, student) => {
            const tId = student.teacherId;
            if (tId) {
                const tName = teacherMap[tId] || `Teacher ${tId}`;
                acc[tName] = (acc[tName] || 0) + 1;
            }
            return acc;
        }, {});

        // Transform to array and sort by count desc, Limit to top 10 for readability
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

    }, [students, teachers]);

    const COLORS = ['#4D44B5', '#FB7D5B', '#FCC43E', '#303972', '#FEECEC'];

    if (!students.length) return <div className="text-gray-400 text-sm p-4">Loading data...</div>;

    return (
        <ChartErrorBoundary>
            <div className="w-full h-[350px] bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Top 10 Teachers by Class Size</h3>

                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#303972', fontSize: 12, fontWeight: 500 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </ChartErrorBoundary>
    );
};

export default StudentsPerTeacherChart;
