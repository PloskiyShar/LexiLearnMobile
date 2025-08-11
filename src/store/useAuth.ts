import { create } from "zustand";
type AuthState = { user?: { id: string } | null; setUser: (u: AuthState["user"]) => void };
export const useAuth = create<AuthState>((set) => ({ user: null, setUser: (user) => set({ user }) }));
