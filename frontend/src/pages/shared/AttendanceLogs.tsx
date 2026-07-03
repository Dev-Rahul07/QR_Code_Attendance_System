import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

interface AttendanceRecord {
    id: string;
    student_name?: string;
    student_enrollment?: string;
    date: string;
    check_in: string;
    status: string;
}

export default function AttendanceLogs({ role }: { role: 'Admin' | 'Teacher' | 'Student' }) {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRecords = async () => {
        try {
            const res = await axiosClient.get('/attendance/list/');
            setRecords(res.data.results || res.data);
        } catch (error) {
            console.error("Failed to fetch attendance logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {role === 'Student' ? 'My Attendance' : 'Attendance Logs'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {role === 'Student' ? 'Review your daily attendance history' : 'System wide attendance records'}
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm">
                                {role !== 'Student' && <th className="px-6 py-4 font-medium">Student Name</th>}
                                {role !== 'Student' && <th className="px-6 py-4 font-medium">Roll No</th>}
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Time In</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={role !== 'Student' ? 5 : 3} className="text-center py-8 text-gray-500">Loading...</td></tr>
                            ) : records.length === 0 ? (
                                <tr><td colSpan={role !== 'Student' ? 5 : 3} className="text-center py-8 text-gray-500">No attendance records found.</td></tr>
                            ) : records.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                    {role !== 'Student' && <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{record.student_name}</td>}
                                    {role !== 'Student' && <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{record.student_enrollment}</td>}
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{record.date}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {record.check_in ? new Date(`1970-01-01T${record.check_in}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            record.status === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' :
                                            record.status === 'Absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
                                        }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
