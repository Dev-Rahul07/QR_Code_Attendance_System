import { useEffect, useState, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { Bell, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
    id: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const res = await axiosClient.get('/notifications/');
            setNotifications(res.data.results || res.data);
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Set up polling every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await axiosClient.post(`/notifications/${id}/mark_read/`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            toast.error("Failed to mark notification as read");
        }
    };

    const handleMarkAllRead = async () => {
        if (unreadCount === 0) return;
        try {
            await axiosClient.post('/notifications/mark_all_read/');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            toast.success("All notifications marked as read");
        } catch (error) {
            toast.error("Failed to mark all as read");
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllRead}
                                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                            >
                                <Check size={14} /> Mark all read
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                No notifications yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {notifications.map(notification => (
                                    <div 
                                        key={notification.id} 
                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${!notification.is_read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <p className={`text-sm ${!notification.is_read ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {notification.message}
                                            </p>
                                            {!notification.is_read && (
                                                <button 
                                                    onClick={(e) => handleMarkRead(notification.id, e)}
                                                    className="text-primary hover:bg-primary/10 p-1 rounded-full flex-shrink-0"
                                                    title="Mark as read"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
