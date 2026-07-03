import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'sonner';
import { User, KeyRound, Shield, CheckCircle2, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRef } from 'react';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password change state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosClient.get('/accounts/profile/');
                setProfile(res.data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        setChangingPassword(true);
        try {
            await axiosClient.post('/accounts/change-password/', {
                old_password: oldPassword,
                new_password: newPassword
            });
            toast.success("Password changed successfully!");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.response?.data?.old_password?.[0] || "Failed to change password.");
        } finally {
            setChangingPassword(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profile_image', file);

        setUploadingImage(true);
        try {
            const res = await axiosClient.patch('/accounts/profile/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setProfile(res.data);
            updateUser(res.data);
            toast.success("Profile image updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile image.");
        } finally {
            setUploadingImage(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl font-bold overflow-hidden border-2 border-primary/20">
                        {profile?.profile_image ? (
                            <img src={profile.profile_image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.first_name?.[0]
                        )}
                    </div>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                        title="Upload Profile Picture"
                    >
                        <Camera className="text-white w-8 h-8" />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        accept="image/*" 
                        className="hidden" 
                    />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {user?.first_name} {user?.last_name}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                        <Shield size={16} />
                        <span>{user?.role} Role</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Details */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
                    <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white">
                        <User className="text-primary" />
                        <h2 className="text-xl font-bold">Profile Details</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{profile?.username}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{profile?.email}</p>
                        </div>
                        
                        {profile?.role === 'Student' && profile?.student_profile && (
                            <>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Enrollment Number</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{profile.student_profile.enrollment_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{profile.student_profile.department_name}</p>
                                </div>
                            </>
                        )}

                        {profile?.role === 'Teacher' && profile?.teacher_profile && (
                            <>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Employee ID</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{profile.teacher_profile.employee_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{profile.teacher_profile.department_name}</p>
                                </div>
                            </>
                        )}

                        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={18} />
                            <span className="text-sm font-medium">Account is active</span>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
                    <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white">
                        <KeyRound className="text-primary" />
                        <h2 className="text-xl font-bold">Change Password</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Current Password</label>
                            <input 
                                type="password" required 
                                value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">New Password</label>
                            <input 
                                type="password" required minLength={8}
                                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Confirm New Password</label>
                            <input 
                                type="password" required minLength={8}
                                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={changingPassword}
                            className="w-full py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 mt-2"
                        >
                            {changingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
