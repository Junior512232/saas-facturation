"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Wallet, 
  FileText, 
  BarChart2, 
  HelpCircle, 
  Settings, 
  Moon,
  Sun,
  Search,
  Command,
  Users,
  LogOut,
  ShieldCheck,
  Briefcase,
  UserCheck,
  Package
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type MenuItem = {
  icon: any;
  label: string;
  href: string;
  disabled?: boolean;
};

type MenuGroup = {
  label: string;
  items: MenuItem[];
};

const menuGroups: MenuGroup[] = [
  {
    label: "Général",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: Users, label: "Clients", href: "/clients" },
    ]
  },
  {
    label: "Finance",
    items: [
      { icon: FileText, label: "Factures", href: "/invoices" },
      { icon: ArrowRightLeft, label: "Transactions", href: "/transactions" },
      { icon: Wallet, label: "Portefeuille", href: "/wallet" },
    ]
  },
  {
    label: "Système",
    items: [
      { icon: BarChart2, label: "Rapports", href: "/reports" },
      { icon: ShieldCheck, label: "Abonnement", href: "/settings/billing" },
      { icon: Settings, label: "Paramètres", href: "/settings" },
      { icon: HelpCircle, label: "Aide & Support", href: "/support" },
    ]
  },
  {
    label: "Extensions (Bientôt)",
    items: [
      { icon: Briefcase, label: "Paie & RH", href: "#", disabled: true },
      { icon: UserCheck, label: "CRM", href: "#", disabled: true },
      { icon: Package, label: "Stocks", href: "#", disabled: true },
    ]
  }
];

export function Sidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = mounted && currentTheme === "dark";

  // Get initials from user name
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "AD";

  const userLogo = (user as any)?.logo_url; // We'll add this to AuthContext later

  return (
    <aside className={`w-64 bg-sidebar border-r border-sidebar-border flex-col h-[100dvh] overflow-y-auto ${isMobile ? "flex" : "hidden md:flex"}`}>
      {/* Logo */}
      <div className="p-6 pb-4 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-brand-blue flex items-center justify-center text-white shadow-blue-glow/40 transition-transform group-hover:scale-95 duration-200">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v2H4V6zm0 5h16v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7zm9 3a1 1 0 000 2h3a1 1 0 100-2h-3z"></path>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-sidebar-primary flex items-center">
              izi<span className="text-brand-blue">Facture</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold -mt-1">Zone OHADA • UEMOA</span>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="px-6 pb-4 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full pl-9 pr-12 py-2 bg-sidebar-accent/50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-primary/20 transition-all placeholder:text-muted-foreground"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden md:inline-flex items-center gap-1 bg-background px-1.5 py-0.5 rounded text-[10px] font-medium text-muted-foreground">
              <Command className="w-3 h-3" /> F
            </kbd>
          </div>
        </div>
      </div>

      {/* Scrollable Menus */}
      <div className="flex-1 px-4 space-y-6 pb-4 overflow-y-auto">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.label}
            </div>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = !item.disabled && (pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href)));
                return (
                  <Link
                    key={item.label}
                    href={item.disabled ? "#" : item.href}
                    onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                        : item.disabled
                        ? "opacity-50 cursor-not-allowed text-muted-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sidebar-primary rounded-r-full" />
                    )}
                    <item.icon className={`w-4 h-4 ${isActive ? "text-sidebar-primary" : item.disabled ? "text-muted-foreground" : "text-muted-foreground group-hover:text-sidebar-foreground"}`} />
                    <span className="text-sm">{item.label}</span>
                    {item.disabled && (
                      <span className="ml-auto text-[9px] uppercase tracking-wider bg-sidebar-accent px-1.5 py-0.5 rounded text-muted-foreground">Prochainement</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom Fixed Area */}
      <div className="px-4 pb-4 pt-2 shrink-0 border-t border-sidebar-border/50">
        {/* Dark Mode Toggle */}
        <div
          onClick={() => {
            if (mounted) {
              setTheme(isDark ? "light" : "dark");
            }
          }}
          className="flex items-center justify-between px-3 py-3 mb-2 rounded-xl hover:bg-sidebar-accent/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3 text-sidebar-foreground">
            {isDark
              ? <Sun className="w-4 h-4 text-muted-foreground group-hover:text-sidebar-foreground" />
              : <Moon className="w-4 h-4 text-muted-foreground group-hover:text-sidebar-foreground" />}
            <span className="text-sm">{mounted ? (isDark ? "Mode Clair" : "Mode Sombre") : "Thème"}</span>
          </div>
          <div className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${isDark ? "bg-primary" : "bg-muted"}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${isDark ? "left-4" : "left-0.5"}`} />
          </div>
        </div>

        {/* User Profile */}
        <div className="p-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/30">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="w-10 h-10 border border-border flex-shrink-0 bg-white">
              {userLogo ? (
                <AvatarImage src={userLogo} alt={user?.name || "Logo Entreprise"} className="object-contain p-1" />
              ) : (
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "AD")}&background=random`} alt={user?.name || "Admin"} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-sidebar-foreground truncate">{user?.name || "Utilisateur"}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email || ""}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </aside>
  );
}
