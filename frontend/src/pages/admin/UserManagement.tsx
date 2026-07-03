import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'sonner';
import { Plus, UserCheck, UserX, Shield, Users as UsersIcon } from 'lucide-react';

interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    date_joined: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'Student'
    });

    const fetchUsers = async () => {
        try {
            const res = await axiosClient.get('/accounts/users/');
            setUsers(res.data.results || res.data);
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axiosClient.post('/accounts/users/', formData);
            toast.success("User created successfully!");
            setShowForm(false);
            setFormData({ username: '', email: '', password: '', first_name: '', last_name: '', role: 'Student' });
            fetchUsers();
        } catch (error: any) {
            const errors = error.response?.data;
            if (errors && typeof errors === 'object') {
                Object.values(errors).forEach((err: any) => toast.error(err[0]));
            } else {
                toast.error("Failed to create user");
            }
        }
    };

    const toggleStatus = async (user: User) => {
        try {
            await axiosClient.patch(`/accounts/users/${user.id}/`, { is_active: !user.is_active });
            toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
            fetchUsers();
        } catch (error) {
            toast.error("Failed to update user status");
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <UsersIcon className="text-primary" size={32} />
                        User Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage system accounts and roles</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                    {showForm ? 'Cancel' : <><Plus size={20} /> Add User</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Username</label>
                                <input 
                                    name="username" type="text" required 
                                    value={formData.username} onChange={handleInputChange}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                                <input 
                                    name="email" type="email" required 
                                    value={formData.email} onChange={handleInputChange}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">First Name</label>
                                <input 
                                    name="first_name" type="text" 
                                    value={formData.first_name} onChange={handleInputChange}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Last Name</label>
                                <input 
                                    name="last_name" type="text" 
                                    value={formData.last_name} onChange={handleInputChange}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
                                <input 
                                    name="password" type="password" required 
                                    value={formData.password} onChange={handleInputChange}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Role</label>
                                <select 
                                    name="role" required
                                    value={formData.role} onChange={handleInputChange}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="Student">Student</option>
                                    <option value="Teacher">Teacher</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 mt-4">
                            Create User
                        </button>
                        <p className="text-xs text-amber-600 mt-2">
                            * Note: Creating a Student or Teacher here only creates their base account. Their extended profiles (Enrollment ID, Sections) must still be seeded.
                        </p>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm">
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Contact</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">No users found.</td>
                                </tr>
                            ) : users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                {u.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{u.username}</p>
                                                <p className="text-xs text-gray-500">{u.first_name} {u.last_name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                                        {u.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {u.role === 'Admin' && <Shield size={14} className="text-primary" />}
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                                        {new Date(u.date_joined).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            u.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                            {u.is_active ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => toggleStatus(u)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                u.is_active 
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20' 
                                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20'
                                            }`}
                                            title={u.is_active ? 'Deactivate User' : 'Activate User'}
                                        >
                                            {u.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
                                        </button>
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
