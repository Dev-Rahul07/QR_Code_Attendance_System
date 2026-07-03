import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface Holiday {
    id: string;
    name: string;
    description: string;
    date: string;
    holiday_type: string;
}

export default function Holidays() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [holidayType, setHolidayType] = useState('Public Holiday');

    const fetchHolidays = async () => {
        try {
            const res = await axiosClient.get('/holidays/');
            setHolidays(res.data.results || res.data);
        } catch (error) {
            console.error("Failed to fetch holidays");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axiosClient.post('/holidays/', { name, description, date, holiday_type: holidayType });
            toast.success("Holiday added successfully");
            setShowForm(false);
            setName('');
            setDescription('');
            setDate('');
            fetchHolidays();
        } catch (error) {
            toast.error("Failed to add holiday");
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Academic Calendar</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Upcoming holidays and events</p>
                </div>
                {isAdmin && (
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        {showForm ? 'Cancel' : 'Add Holiday'}
                    </button>
                )}
            </div>

            {isAdmin && showForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                                <input 
                                    type="text" required 
                                    value={name} onChange={e => setName(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Date</label>
                                <input 
                                    type="date" required 
                                    value={date} onChange={e => setDate(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Type</label>
                            <input 
                                type="text" required 
                                value={holidayType} onChange={e => setHolidayType(e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                            <textarea 
                                rows={2}
                                value={description} onChange={e => setDescription(e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                            Save Holiday
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 text-center py-8 text-gray-500">Loading holidays...</div>
                ) : holidays.length === 0 ? (
                    <div className="col-span-3 text-center py-8 text-gray-500">No upcoming holidays scheduled.</div>
                ) : holidays.map((holiday) => (
                    <div key={holiday.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-0"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{holiday.name}</h3>
                            <p className="text-sm font-medium text-primary mb-3">{new Date(holiday.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md mb-3">
                                {holiday.holiday_type}
                            </span>
                            {holiday.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{holiday.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
