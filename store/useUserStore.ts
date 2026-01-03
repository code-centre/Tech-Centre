import { create } from 'zustand';
import type { User } from '@/types/supabase';

type Store = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const isClient = typeof window !== 'undefined';

const useUserStore = create<Store>((set) => {
  let user = null;
  if (isClient) {
    try {
      const storedUser = localStorage.getItem('user');
      user = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
    }
  }

  return {
    user,
    setUser: (user) => {
      set({ user });
      if (isClient) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
  }
});

export default useUserStore;