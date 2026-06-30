export type UserRole = 'Admin' | 'Teacher' | 'Student';

export interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    profile_image: string | null;
    phone_number: string | null;
    is_active: boolean;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}
