"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

const PUBLIC_ROUTES = ["/login", "/register"];

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  if (pathname === "/invoices") return "Factures";
  if (pathname === "/invoices/new") return "Nouvelle facture";
  if (pathname.startsWith("/invoices/")) return "Détail de la facture";
  if (pathname === "/clients") return "Clients";
  if (pathname.startsWith("/clients/")) return "Détail du client";
  if (pathname === "/transactions") return "Transactions";
  if (pathname === "/wallet") return "Portefeuille";
  if (pathname === "/reports") return "Rapports";
  if (pathname === "/settings") return "Paramètres";
  if (pathname === "/support") return "Support";
  return "iziFacture";
}

function getBreadcrumb(pathname: string): string | undefined {
  if (pathname === "/invoices/new") return "Factures";
  if (pathname.startsWith("/invoices/") && pathname !== "/invoices") return "Factures";
  if (pathname.startsWith("/clients/") && pathname !== "/clients") return "Clients";
  return undefined;
}

export default function InnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Redirect unauthenticated users to /login
  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicRoute) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, isPublicRoute, router]);

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Public pages (login/register): render without sidebar/header
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Show nothing while checking auth (avoid flash of sidebar)
  if (loading || !isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center h-[100dvh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar isMobile />
        </SheetContent>
      </Sheet>
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden w-full max-w-full">
        <Header
          title={getPageTitle(pathname)}
          breadcrumbs={getBreadcrumb(pathname)}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <div className="flex-1 overflow-y-auto bg-background">
          {children}
        </div>
      </main>
    </>
  );
}
