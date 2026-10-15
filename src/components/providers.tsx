"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { AppDataProvider } from "@/context/AppDataContext";
import { AuthProvider } from "@/context/AuthContext";
import { ExtensionsProvider } from "@/context/ExtensionsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <AppDataProvider>
          <ExtensionsProvider>
            {children}
          </ExtensionsProvider>
        </AppDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}


