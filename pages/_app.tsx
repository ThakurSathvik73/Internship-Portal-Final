import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, mounted, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

function AppContent({ Component, pageProps, router }: AppProps) {
  const isLoginPage = router.pathname === "/login";
  const isApiRoute = router.pathname.startsWith("/api");

  // Don't protect API routes or login page
  if (isApiRoute || isLoginPage) {
    return <Component {...pageProps} />;
  }

  // Protect all other routes
  return (
    <ProtectedRoute>
      <Component {...pageProps} />
    </ProtectedRoute>
  );
}

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent Component={Component} pageProps={pageProps} router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}
