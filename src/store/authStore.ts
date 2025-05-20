
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      
      login: async (email, password) => {
        // Mock login - simulate network delay
        return new Promise((resolve) => {
          setTimeout(() => {
            // Mock validation (in a real app, this would be an API call)
            if (email && password.length >= 6) {
              // Get user from localStorage or use a default if not found
              const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
              const user = registeredUsers.find((u: User & { password: string }) => 
                u.email === email && u.password === password
              );
              
              if (user) {
                set({ 
                  isAuthenticated: true,
                  user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                  }
                });
                resolve(true);
              } else {
                resolve(false);
              }
            } else {
              resolve(false);
            }
          }, 800); // Simulate network delay
        });
      },
      
      register: async (name, email, password) => {
        // Mock registration
        return new Promise((resolve) => {
          setTimeout(() => {
            if (name && email && password.length >= 6) {
              // Check if email already exists
              const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
              const userExists = registeredUsers.some((u: { email: string }) => u.email === email);
              
              if (userExists) {
                resolve(false); // User already exists
                return;
              }
              
              // Add new user to localStorage
              const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password // In a real app, NEVER store passwords in localStorage
              };
              
              localStorage.setItem('registeredUsers', JSON.stringify([...registeredUsers, newUser]));
              
              // Log them in
              set({ 
                isAuthenticated: true,
                user: {
                  id: newUser.id,
                  name: newUser.name,
                  email: newUser.email
                }
              });
              resolve(true);
            } else {
              resolve(false);
            }
          }, 800); // Simulate network delay
        });
      },
      
      logout: () => {
        set({ isAuthenticated: false, user: null });
      }
    }),
    {
      name: 'auth-storage', // name of the item in localStorage
    }
  )
);
