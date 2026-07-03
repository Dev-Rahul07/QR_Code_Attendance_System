import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Users, UserCheck, CalendarOff, LogOut, Activity } from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface DashboardStats {
    total_students: number;
    total_teachers: number;
    attendance_today: number;
    pending_leaves: number;
    inactive_users: number;
}

interface AttendanceRecord {
    id: string;
    student_name?: string;
    student_enrollment?: string;
    date: string;
    check_in: string;
    status: string;
}

export default function AdminDashboard() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentLogs, setRecentLogs] = useState<AttendanceRecord[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, logsRes] = await Promise.all([
                    axiosClient.get('/dashboard/stats/'),
                    axiosClient.get('/attendance/list/')
                ]);
                
                setStats(statsRes.data);
                
                const allLogs = (logsRes.data.results || logsRes.data) as AttendanceRecord[];
                setRecentLogs(allLogs.slice(0, 5)); // Last 5 logs
                
                // Process chart data (last 7 days)
                const last7Days = [...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    return d.toISOString().split('T')[0];
                }).reverse();

                const groupedData = last7Days.map(date => {
                    const logsForDate = allLogs.filter(log => log.date === date);
                    return {
                        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                        Present: logsForDate.filter(log => log.status === 'Present').length,
                        Absent: logsForDate.filter(log => log.status === 'Absent').length,
                    };
                });
                
                setChartData(groupedData);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
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
                    <div className="text-center py-20 text-gray-500">Loading dashboard...</div>
                ) : (
                    <>
                        {/* Stats Grid */}
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

                        {/* Charts and Tables */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Chart Section */}
                            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-6">
                                    <Activity className="text-primary" />
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Attendance Trends (Last 7 Days)</h2>
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                                            <Tooltip 
                                                cursor={{fill: 'transparent'}}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Bar dataKey="Present" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                            <Bar dataKey="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent Logs Section */}
                            <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
                                <div className="space-y-4">
                                    {recentLogs.length === 0 ? (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">No recent attendance records.</p>
                                    ) : (
                                        recentLogs.map(log => (
                                            <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-xl">
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{log.student_name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(`${log.date}T${log.check_in || '00:00:00'}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                                    log.status === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' :
                                                    log.status === 'Absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                                                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <button onClick={() => navigate('/admin/attendance')} className="w-full mt-6 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                                    View All Logs
                                </button>
                            </div>
                        </div>
                    </>
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
