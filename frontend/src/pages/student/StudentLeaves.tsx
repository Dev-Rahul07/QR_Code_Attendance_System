import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'sonner';

interface LeaveRequest {
    id: string;
    leave_type: string;
    reason: string;
    start_date: string;
    end_date: string;
    status: string;
    teacher_remarks?: string;
    created_at: string;
}

export default function StudentLeaves() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [leaveType, setLeaveType] = useState('Sick Leave');
    const [reason, setReason] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchLeaves = async () => {
        try {
            const res = await axiosClient.get('/leaves/');
            setLeaves(res.data);
        } catch (error) {
            toast.error("Failed to fetch leaves");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axiosClient.post('/leaves/', {
                leave_type: leaveType,
                reason,
                start_date: startDate,
                end_date: endDate
            });
            toast.success("Leave request submitted!");
            setShowForm(false);
            setReason('');
            setStartDate('');
            setEndDate('');
            fetchLeaves();
        } catch (error) {
            toast.error("Failed to submit leave request");
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Leaves</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Apply for and track your leave requests</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                    {showForm ? 'Cancel' : 'Apply for Leave'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Leave Type</label>
                                <select 
                                    required
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option>Sick Leave</option>
                                    <option>Family Emergency</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Start Date</label>
                                    <input 
                                        type="date" required 
                                        value={startDate} onChange={e => setStartDate(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">End Date</label>
                                    <input 
                                        type="date" required 
                                        value={endDate} onChange={e => setEndDate(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Reason</label>
                            <textarea 
                                required rows={3}
                                value={reason} onChange={e => setReason(e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                placeholder="Please provide details..."
                            />
                        </div>
                        <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                            Submit Request
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm">
                            <th className="px-6 py-4 font-medium">Type</th>
                            <th className="px-6 py-4 font-medium">Duration</th>
                            <th className="px-6 py-4 font-medium">Reason</th>
                            <th className="px-6 py-4 font-medium">Remarks</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td></tr>
                        ) : leaves.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">No leave history.</td></tr>
                        ) : leaves.map((leave) => (
                            <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{leave.leave_type}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{leave.start_date} to {leave.end_date}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300 truncate max-w-xs">{leave.reason}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300 italic text-sm">{leave.teacher_remarks || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' :
                                        leave.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
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
    );
}
