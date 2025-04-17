import { create } from 'zustand';
import { api } from './axios';

export type UserType = {
  id: number;
  email: string;
  name: string;
  password: string; 
};

const saveUserToStorage = (user: UserType | null) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

const saveTokenToStorage = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

interface UserStore {
  user: UserType | null;
  setuser: (user: UserType | null) => void;
  checkSession: () => Promise<void>;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  signup: (userData: Omit<UserType, 'id'>) => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => {
  const savedUser = JSON.parse(localStorage.getItem('user') || 'null');

  return {
    user: savedUser,

    setuser: (user: UserType | null) => {
      set({ user });
      saveUserToStorage(user);
    },

    checkSession: async () => {
      try {
        const { data } = await api.get<UserType>('auth/getprofile');
        set({ user: data });
        saveUserToStorage(data);
      } catch (error: any) {
        console.warn('Session not found or expired:', error.response?.data || error.message);
        set({ user: null });
        saveUserToStorage(null);
      }
    },

    login: async (credentials) => {
      try {
        const { data } = await api.post<{ message: string; token: string; user: UserType }>('auth/login', credentials);
        set({ user: data.user });
        saveUserToStorage(data.user);
        saveTokenToStorage(data.token);
      } catch (error: any) {
        console.error('Login failed:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
      }
    },

    signup: async (userData) => {
      try {
        const { data } = await api.post<{ message: string; token: string; user: UserType }>('auth/signup', userData);
        set({ user: data.user });
        saveUserToStorage(data.user);
        saveTokenToStorage(data.token);
      } catch (error: any) {
        console.error('Signup failed:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Signup failed. Please try again.');
      }
    },

    logout: async () => {
      try {
        await api.post('auth/logout');
        set({ user: null });
        saveUserToStorage(null);
        saveTokenToStorage(null);
      } catch (error: any) {
        console.error('Logout error:', error.response?.data || error.message);
        throw new Error('Logout failed. Please try again.');
      }
    },
  };
});
