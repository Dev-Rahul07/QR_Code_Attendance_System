import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { QrCode, UserCheck, CalendarOff, LogOut, RefreshCw, Activity } from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer 
} from 'recharts';

interface StudentStats {
    attendance_percentage: number;
    today_status: string;
    pending_leaves: number;
}

interface AttendanceRecord {
    id: string;
    date: string;
    check_in: string;
    status: string;
}

export default function StudentDashboard() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, qrRes, logsRes] = await Promise.all([
                axiosClient.get('/dashboard/stats/'),
                axiosClient.get('/student/my-qr/'),
                axiosClient.get('/attendance/list/')
            ]);
            setStats(statsRes.data);
            setQrCodeUrl(qrRes.data.qr_image);

            const allLogs = (logsRes.data.results || logsRes.data) as AttendanceRecord[];
            
            // Process chart data (last 7 days)
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d.toISOString().split('T')[0];
            }).reverse();

            const groupedData = last7Days.map(date => {
                const logForDate = allLogs.find(log => log.date === date);
                return {
                    date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    status: logForDate ? logForDate.status : 'None',
                    val: logForDate && logForDate.status === 'Present' ? 1 : 0
                };
            });
            
            setChartData(groupedData);

        } catch (error) {
            console.error("Failed to fetch student data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Hello, {user?.first_name}</p>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg transition-colors font-medium"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* QR Code Section */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                            <QrCode size={32} />
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Your Attendance QR</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Scan this code at the teacher's desk to mark your attendance. Refreshes every 5 minutes.</p>
                        
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 w-full flex justify-center">
                            {loading ? (
                                <div className="h-48 w-48 flex items-center justify-center text-gray-400">Loading QR...</div>
                            ) : qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="Attendance QR Code" className="w-48 h-48 mix-blend-multiply dark:mix-blend-normal" />
                            ) : (
                                <div className="h-48 w-48 flex items-center justify-center text-red-400">Failed to load</div>
                            )}
                        </div>
                        
                        <button 
                            onClick={fetchDashboardData}
                            className="mt-6 flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            <RefreshCw size={16} /> Refresh QR
                        </button>
                    </div>

                    {/* Stats & Charts Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <StatCard 
                                title="Attendance Percentage" 
                                value={`${stats?.attendance_percentage || 0}%`} 
                                icon={<UserCheck className="w-8 h-8 text-primary" />} 
                                bg="bg-primary/10"
                            />
                            <StatCard 
                                title="Today's Status" 
                                value={stats?.today_status || 'Unknown'} 
                                icon={<CalendarOff className="w-8 h-8 text-amber-500" />} 
                                bg="bg-amber-50 dark:bg-amber-900/20"
                            />
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-6">
                                <Activity className="text-primary" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Attendance (Last 7 Days)</h2>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(val) => val === 1 ? 'Present' : 'Absent'} domain={[0, 1]} ticks={[0, 1]} />
                                        <Tooltip 
                                            cursor={{fill: 'transparent'}}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                                            formatter={(_value, _name, props) => [props.payload.status, 'Status']}
                                        />
                                        <Bar dataKey="val" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                            {
                                                chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.status === 'Present' ? '#10B981' : entry.status === 'Absent' ? '#EF4444' : '#D1D5DB'} />
                                                ))
                                            }
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

function StatCard({ title, value, icon, bg }: { title: string, value: string | number, icon: React.ReactNode, bg: string }) {
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
