"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ninea?: string;
  role: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (companyName: string, email: string, phone: string, password: string, ninea?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(supabaseUser: User, profile?: { company_name: string; phone?: string; ninea?: string; role?: string } | null): AppUser {
  return {
    id: supabaseUser.id,
    name: profile?.company_name || supabaseUser.user_metadata?.company_name || supabaseUser.email?.split("@")[0] || "Utilisateur",
    email: supabaseUser.email || "",
    phone: profile?.phone || supabaseUser.user_metadata?.phone,
    ninea: profile?.ninea || supabaseUser.user_metadata?.ninea,
    role: profile?.role || "Administrateur Pro",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Fetch user profile from DB
  const fetchProfile = async (supabaseUser: User): Promise<AppUser> => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, phone, ninea, role")
      .eq("id", supabaseUser.id)
      .single();
    return mapUser(supabaseUser, profile);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const appUser = await fetchProfile(session.user);
        setUser(appUser);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const appUser = await fetchProfile(session.user);
        setUser(appUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      if (error.message.includes("Invalid login")) return { error: "Email ou mot de passe incorrect." };
      if (error.message.includes("Email not confirmed")) return { error: "Veuillez confirmer votre email avant de vous connecter." };
      return { error: error.message };
    }
    router.push("/");
    return {};
  };

  const register = async (
    companyName: string,
    email: string,
    phone: string,
    password: string,
    ninea?: string
  ): Promise<{ error?: string }> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { company_name: companyName, phone, ninea },
      },
    });
    if (error) {
      if (error.message.includes("already registered")) return { error: "Cet email est déjà utilisé." };
      if (error.message.includes("invalid") || error.message.toLowerCase().includes("invalid email")) return { error: "Adresse email invalide. Veuillez vérifier le format de votre email." };
      return { error: error.message };
    }

    // Profil créé automatiquement par le Trigger de la base de données (on_auth_user_created)

    if (data.session === null) {
      return { error: "✅ Compte créé ! Veuillez vérifier votre boîte mail pour le lien de confirmation." };
    }

    router.push("/");
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
