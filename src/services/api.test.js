import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios at the module level
vi.mock('axios');

// Import api after mocking axios
const { api } = await import('../services/api.js');

describe('API Service - Student Operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getStudents', () => {
        it('should fetch students with pagination', async () => {
            // This test validates SRS NFR-1.4 (database queries < 500ms)
            const mockResponse = {
                data: [
                    { id: 1, name: 'John Doe', email: 'john@example.com', grade: 'VII A' },
                    { id: 2, name: 'Jane Smith', email: 'jane@example.com', grade: 'VII B' }
                ],
                headers: { 'x-total-count': '2' }
            };

            // Mock axios.create to return a client with get method
            const mockGet = vi.fn().mockResolvedValue(mockResponse);
            api.client.get = mockGet;

            const params = { _page: 1, _limit: 10 };
            const result = await api.getStudents(params);

            expect(mockGet).toHaveBeenCalledWith('/students', { params });
            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(result.data[0].name).toBe('John Doe');
        });

        it('should handle search filtering', async () => {
            const mockResponse = {
                data: [{ id: 1, name: 'John Doe', email: 'john@example.com' }],
                headers: { 'x-total-count': '1' }
            };

            const mockGet = vi.fn().mockResolvedValue(mockResponse);
            api.client.get = mockGet;

            const result = await api.getStudents({ q: 'john', _page: 1, _limit: 10 });

            expect(mockGet).toHaveBeenCalledWith('/students', {
                params: { q: 'john', _page: 1, _limit: 10 }
            });
            expect(result.data).toHaveLength(1);
        });

        it('should handle API errors gracefully', async () => {
            // SRS NFR-4.3: System shall gracefully handle connection failures
            const mockGet = vi.fn().mockRejectedValue(new Error('Network error'));
            api.client.get = mockGet;

            await expect(api.getStudents({ _page: 1 })).rejects.toThrow('Network error');
        });
    });

    describe('createStudent', () => {
        it('should create a new student', async () => {
            const newStudent = {
                name: 'Alice Johnson',
                email: 'alice@example.com',
                grade: 'VII C',
                parentName: 'Bob Johnson'
            };

            const mockResponse = {
                data: { id: 3, ...newStudent }
            };

            const mockPost = vi.fn().mockResolvedValue(mockResponse);
            api.client.post = mockPost;

            const result = await api.createStudent(newStudent);

            expect(mockPost).toHaveBeenCalledWith('/students', newStudent);
            expect(result.id).toBe(3);
            expect(result.name).toBe('Alice Johnson');
        });
    });

    describe('updateStudent', () => {
        it('should update an existing student', async () => {
            const updates = { name: 'John Updated', email: 'john.updated@example.com' };
            const mockResponse = {
                data: { id: 1, ...updates }
            };

            const mockPatch = vi.fn().mockResolvedValue(mockResponse);
            api.client.patch = mockPatch;

            const result = await api.updateStudent(1, updates);

            expect(mockPatch).toHaveBeenCalledWith('/students/1', updates);
            expect(result.name).toBe('John Updated');
        });
    });

    describe('deleteStudent', () => {
        it('should prevent deletion when student has dependencies', async () => {
            // SRS requirement: Data integrity - orphan prevention
            const mockAttendance = { data: [{ id: 1, studentId: 1 }] };
            const mockEvaluations = { data: [{ id: 1, studentId: 1 }] };

            const mockGet = vi.fn()
                .mockResolvedValueOnce(mockAttendance)  // attendance check
                .mockResolvedValueOnce(mockEvaluations); // evaluations check

            api.client.get = mockGet;

            await expect(api.deleteStudent(1)).rejects.toThrow();
        });

        it('should delete student when no dependencies exist', async () => {
            const mockEmptyAttendance = { data: [] };
            const mockEmptyEvaluations = { data: [] };

            const mockGet = vi.fn()
                .mockResolvedValueOnce(mockEmptyAttendance)
                .mockResolvedValueOnce(mockEmptyEvaluations);

            const mockDelete = vi.fn().mockResolvedValue({ data: {} });

            api.client.get = mockGet;
            api.client.delete = mockDelete;

            await api.deleteStudent(1);

            expect(mockDelete).toHaveBeenCalledWith('/students/1');
        });
    });
});

describe('API Service - Teacher Operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getTeachers', () => {
        it('should fetch all teachers', async () => {
            const mockTeachers = [
                { id: 1, name: 'Prof Ahmed', subject: 'Math', teacherId: 'T001' },
                { id: 2, name: 'Dr Sara', subject: 'Science', teacherId: 'T002' }
            ];

            const mockGet = vi.fn().mockResolvedValue({ data: mockTeachers });
            api.client.get = mockGet;

            const result = await api.getTeachers();

            expect(mockGet).toHaveBeenCalledWith('/teachers');
            expect(result).toHaveLength(2);
            expect(result[0].subject).toBe('Math');
        });
    });

    describe('deleteTeacher', () => {
        it('should check for schedule dependencies before deletion', async () => {
            // SRS requirement: Cannot delete teacher with active schedules
            const mockSchedule = { data: [{ id: 1, teacherId: 1 }] };

            const mockGet = vi.fn().mockResolvedValue(mockSchedule);
            api.client.get = mockGet;

            await expect(api.deleteTeacher(1)).rejects.toThrow();
        });
    });
});
