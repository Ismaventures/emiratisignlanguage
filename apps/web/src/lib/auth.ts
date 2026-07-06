import { create } from 'zustand';
import type { User } from '@emirsign/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
}

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@emirsign.ae': {
    password: 'admin123',
    user: {
      id: 'demo-admin-001',
      email: 'admin@emirsign.ae',
      name: 'Admin User',
      role: 'ADMIN',
      avatarUrl: null,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as User,
  },
  'ahmed@emirsign.ae': {
    password: 'ahmed123',
    user: {
      id: 'demo-user-002',
      email: 'ahmed@emirsign.ae',
      name: 'Ahmed Al Mansouri',
      role: 'USER',
      avatarUrl: null,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as User,
  },
  'demo@emirsign.ae': {
    password: 'demo',
    user: {
      id: 'demo-user-003',
      email: 'demo@emirsign.ae',
      name: 'Demo User',
      role: 'USER',
      avatarUrl: null,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as User,
  },
};

function generateToken(): string {
  return 'demo-token-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    await new Promise((r) => setTimeout(r, 500));

    const demo = DEMO_USERS[email.toLowerCase()];
    if (demo && demo.password === password) {
      const token = generateToken();
      localStorage.setItem('accessToken', token);
      localStorage.setItem('emirsign_mock_user', JSON.stringify(demo.user));
      set({ user: demo.user, isAuthenticated: true, isLoading: false });
      return;
    }

    set({ error: 'Invalid email or password. Try: demo@emirsign.ae / demo', isLoading: false });
    throw new Error('Invalid credentials');
  },

  register: async (email: string, _password: string, name: string) => {
    set({ isLoading: true, error: null });
    await new Promise((r) => setTimeout(r, 500));

    const newUser = {
      id: 'user-' + Date.now(),
      email,
      name,
      role: 'USER',
      avatarUrl: null,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as User;

    const token = generateToken();
    localStorage.setItem('accessToken', token);
    localStorage.setItem('emirsign_mock_user', JSON.stringify(newUser));
    set({ user: newUser, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('emirsign_mock_user');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem('accessToken');
    const stored = localStorage.getItem('emirsign_mock_user');

    if (token && stored) {
      try {
        const user = JSON.parse(stored) as User;
        set({ user, isAuthenticated: true, isLoading: false });
        return;
      } catch {}
    }

    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updated = { ...currentUser, ...userData };
      localStorage.setItem('emirsign_mock_user', JSON.stringify(updated));
      set({ user: updated });
    }
  },

  clearError: () => set({ error: null }),
}));
