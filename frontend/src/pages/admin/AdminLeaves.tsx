import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

interface LeaveRequest {
    id: string;
    student_name: string;
    leave_type: string;
    reason: string;
    start_date: string;
    end_date: string;
    status: string;
    teacher_remarks?: string;
}

export default function AdminLeaves() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaves = async () => {
        try {
            const res = await axiosClient.get('/leaves/');
            setLeaves(res.data);
        } catch (error) {
            console.error("Failed to fetch leaves");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Leave Requests</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">System-wide overview of student leaves</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm">
                                <th className="px-6 py-4 font-medium">Student</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Duration</th>
                                <th className="px-6 py-4 font-medium">Reason</th>
                                <th className="px-6 py-4 font-medium">Teacher Remarks</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td>
                                </tr>
                            ) : leaves.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">No leave requests found.</td>
                                </tr>
                            ) : leaves.map((leave) => (
                                <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">{leave.student_name || 'Student'}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{leave.leave_type}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {leave.start_date} to {leave.end_date}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">{leave.reason}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 italic text-sm">{leave.teacher_remarks || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            leave.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        }`}>
                                            {leave.status}
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
