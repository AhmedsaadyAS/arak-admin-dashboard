import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartErrorBoundary from '../common/ChartErrorBoundary';

/**
 * Demonstrates Data Transformation with useMemo
 * Takes raw student list -> Aggregates by Class -> Renders Chart
 */
const ClassDistributionChart = ({ students = [] }) => {

    // 1. Transform Data using useMemo
    // This runs only when the 'students' array changes, optimizing performance.
    const chartData = useMemo(() => {
        if (!students.length) return [];

        // Aggregate counts by 'grade' (e.g., "VII A")
        const distribution = students.reduce((acc, student) => {
            const grade = student.grade || 'Unknown';
            acc[grade] = (acc[grade] || 0) + 1;
            return acc;
        }, {});

        // Convert object to array for Recharts: [{ name: 'VII A', count: 12 }, ...]
        return Object.entries(distribution)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count); // Sort by highest count

    }, [students]);

    // 2. Handling Empty State
    if (!students || students.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No student data available for visualization.
            </div>
        );
    }

    const COLORS = ['#4D44B5', '#FB7D5B', '#FCC43E', '#303972'];

    return (
        <ChartErrorBoundary>
            <div className="w-full h-[350px] bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Students per Class</h3>

                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#A098AE', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#A098AE', fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="count" radius={[20, 20, 0, 0]} barSize={40}>
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

export default ClassDistributionChart;
