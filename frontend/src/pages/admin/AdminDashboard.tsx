import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Users, UserCheck, CalendarOff, UserMinus, LogOut } from 'lucide-react';

interface DashboardStats {
    total_students: number;
    total_teachers: number;
    attendance_today: number;
    pending_leaves: number;
    inactive_users: number;
}

export default function AdminDashboard() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.first_name} {user?.last_name}</p>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg transition-colors font-medium"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading statistics...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title="Total Students" 
                            value={stats?.total_students || 0} 
                            icon={<Users className="w-8 h-8 text-blue-500" />} 
                            bg="bg-blue-50 dark:bg-blue-900/20"
                        />
                        <StatCard 
                            title="Total Teachers" 
                            value={stats?.total_teachers || 0} 
                            icon={<Users className="w-8 h-8 text-purple-500" />} 
                            bg="bg-purple-50 dark:bg-purple-900/20"
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
