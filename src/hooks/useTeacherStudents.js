import { useState, useEffect } from 'react';
import { api } from '../services/api';

/**
 * Hook to fetch students assigned to a specific teacher
 * @param {string|number} teacherId 
 * @returns {Object} { students, loading, error, total }
 */
export const useTeacherStudents = (teacherId) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!teacherId) return;

            try {
                setLoading(true);
                // JSON Server supports filtering by top-level properties
                // GET /students?teacherId=1
                const response = await api.getStudents({ teacherId, _limit: 100 }); // Fetch up to 100 for now
                setStudents(response.data);
                setTotal(response.total);
                setError(null);
            } catch (err) {
                console.error(`Failed to fetch students for teacher ${teacherId}:`, err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [teacherId]);

    return { students, loading, error, total };
};
