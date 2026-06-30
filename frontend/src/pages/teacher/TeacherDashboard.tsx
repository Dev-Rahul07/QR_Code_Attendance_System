import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { Users, UserCheck, CalendarOff } from 'lucide-react';

interface TeacherStats {
    assigned_students: number;
    attendance_today: number;
    pending_leaves: number;
}

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<TeacherStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axiosClient.get('/dashboard/stats/');
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.first_name} {user?.last_name}</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading statistics...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        title="Assigned Students" 
                        value={stats?.assigned_students || 0} 
                        icon={<Users className="w-8 h-8 text-blue-500" />} 
                        bg="bg-blue-50 dark:bg-blue-900/20"
                    />
                    <StatCard 
                        title="Present Today" 
                        value={stats?.attendance_today || 0} 
                        icon={<UserCheck className="w-8 h-8 text-emerald-500" />} 
                        bg="bg-emerald-50 dark:bg-emerald-900/20"
                    />
                    <StatCard 
                        title="Pending Leaves" 
                        value={stats?.pending_leaves || 0} 
                        icon={<CalendarOff className="w-8 h-8 text-amber-500" />} 
                        bg="bg-amber-50 dark:bg-amber-900/20"
                    />
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, icon, bg }: { title: string, value: number, icon: React.ReactNode, bg: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl ${bg}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
            </div>
        </div>
    );
}
