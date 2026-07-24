import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Register() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('Student');
    
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSendOTP = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email first.");
            return;
        }
        
        setLoading(true);
        try {
            await axiosClient.post('/accounts/send-otp/', { email });
            setOtpSent(true);
            toast.success("OTP sent to your email!");
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axiosClient.post('/accounts/register/', {
                email,
                otp,
                username,
                password,
                first_name: firstName,
                last_name: lastName,
                role
            });
            
            // SimpleJWT returns access and refresh tokens after custom update
            const token = res.data.access;
            
            // Fetch profile
            const profileRes = await axiosClient.get('/accounts/profile/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            login(token, profileRes.data);
            toast.success('Successfully registered & logged in!');
            
            // Redirect based on role
            const userRole = profileRes.data.role;
            if (userRole === 'Admin') navigate('/admin');
            else if (userRole === 'Teacher') navigate('/teacher');
            else if (userRole === 'Student') navigate('/student');
            
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Registration failed. Check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            
            <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-10 rounded-2xl shadow-xl z-10 border border-white/20">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Create an Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Register to access QR Attendance
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    disabled={otpSent}
                                    className="flex-1 appearance-none rounded-l-lg block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                                    placeholder="Enter your email"
                                />
                                {!otpSent && (
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        disabled={loading}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Send OTP'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {otpSent && (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">OTP</label>
                                    <input
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                                        placeholder="6-digit OTP"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={e => setFirstName(e.target.value)}
                                            className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={lastName}
                                            onChange={e => setLastName(e.target.value)}
                                            className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                                    <select
                                        value={role}
                                        onChange={e => setRole(e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="Student">Student</option>
                                        <option value="Teacher">Teacher</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    {otpSent && (
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-md transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Complete Registration'}
                            </button>
                        </div>
                    )}
                </form>
                
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
