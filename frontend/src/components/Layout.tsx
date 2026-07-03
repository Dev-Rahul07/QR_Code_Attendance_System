import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Users, CalendarOff, CalendarDays, 
    QrCode, ListChecks, LogOut, Menu, X, FileText, UserCircle
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = getNavItems(user.role);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex text-gray-900 dark:text-gray-100">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:block`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                            QR Attendance
                        </h1>
                        <div className="flex items-center gap-4">
                            <NotificationDropdown />
                            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg overflow-hidden border border-primary/20">
                                {user.profile_image ? (
                                    <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user.first_name?.[0] || user.username[0]
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{user.first_name} {user.last_name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                        isActive 
                                        ? 'bg-primary text-white shadow-md' 
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium text-sm">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                        QR Attendance
                    </h1>
                    <div className="flex items-center gap-2">
                        <NotificationDropdown />
                        <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <Menu size={24} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

function getNavItems(role: string) {
    if (role === 'Admin') {
        return [
            { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/admin/users', label: 'Users', icon: Users },
            { path: '/admin/attendance', label: 'Attendance Logs', icon: ListChecks },
            { path: '/admin/leaves', label: 'Leave Requests', icon: CalendarOff },
            { path: '/admin/holidays', label: 'Holidays', icon: CalendarDays },
            { path: '/admin/reports', label: 'Reports', icon: FileText },
            { path: '/admin/profile', label: 'Profile', icon: UserCircle },
        ];
    }
    if (role === 'Teacher') {
        return [
            { path: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/teacher/scan', label: 'Scan QR', icon: QrCode },
            { path: '/teacher/attendance', label: 'Class Attendance', icon: ListChecks },
            { path: '/teacher/leaves', label: 'Leave Approvals', icon: CalendarOff },
            { path: '/teacher/holidays', label: 'Holidays', icon: CalendarDays },
            { path: '/teacher/reports', label: 'Reports', icon: FileText },
            { path: '/teacher/profile', label: 'Profile', icon: UserCircle },
        ];
    }
    if (role === 'Student') {
        return [
            { path: '/student', label: 'My QR & Status', icon: QrCode },
            { path: '/student/attendance', label: 'My Attendance', icon: ListChecks },
            { path: '/student/leaves', label: 'My Leaves', icon: CalendarOff },
            { path: '/student/holidays', label: 'Holidays', icon: CalendarDays },
            { path: '/student/profile', label: 'Profile', icon: UserCircle },
        ];
    }
    return [];
}
