import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";

type Role = "Superadmin" | "Admin" | "Faculty" | "Student";

type User = {
  email: string;
  role: Role;
  name: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeStoredUser = (storedUser: User): User | null => {
  const roleMap: Record<string, Role> = {
    Superadmin: "Superadmin",
    Admin: "Admin",
    Faculty: "Faculty",
    Student: "Student",
    Employee: "Faculty",
    Intern: "Student",
  };
  const role = roleMap[storedUser.role as string];

  if (!storedUser.email || !storedUser.name || !role) return null;
  return { ...storedUser, role };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = normalizeStoredUser(JSON.parse(storedUser));
        if (parsedUser) {
          localStorage.setItem("user", JSON.stringify(parsedUser));
          setUser(parsedUser);
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      } catch (e) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      const updatedUser = normalizeStoredUser({ ...currentUser, ...updates });
      if (!updatedUser) return currentUser;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        updateUser,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
