"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Menu, CheckCheck, Trash2, X, Smartphone, Sparkles, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/context/AppDataContext";

interface HeaderProps {
  title: string;
  breadcrumbs?: string;
  onMenuClick?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "wave" | "om" | "invoice" | "system" | "overdue";
}

export function Header({ title, breadcrumbs, onMenuClick }: HeaderProps) {
  const { invoicesList, clientsList } = useAppData();
  const [customNotifications, setCustomNotifications] = useState<NotificationItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate notifications from real data
  const buildNotifications = useCallback((): NotificationItem[] => {
    const items: NotificationItem[] = [];

    // Overdue invoices
    const overdueInvoices = invoicesList.filter((i) => i.status === "overdue");
    overdueInvoices.slice(0, 3).forEach((inv) => {
      items.push({
        id: `overdue_${inv.id}`,
        title: "Facture en retard",
        message: `La facture #${inv.number} pour ${inv.client} est impayée depuis la date d'échéance.`,
        time: inv.dueDate || "Date inconnue",
        read: false,
        type: "overdue",
      });
    });

    // Recently sent invoices
    const sentInvoices = invoicesList.filter((i) => i.status === "sent");
    sentInvoices.slice(0, 2).forEach((inv) => {
      items.push({
        id: `sent_${inv.id}`,
        title: "Facture envoyée",
        message: `La facture #${inv.number} de ${inv.client} est en attente de paiement.`,
        time: inv.issueDate || "",
        read: true,
        type: "invoice",
      });
    });

    // Paid invoices (recent)
    const paidInvoices = invoicesList.filter((i) => i.status === "paid");
    paidInvoices.slice(0, 2).forEach((inv) => {
      items.push({
        id: `paid_${inv.id}`,
        title: "Paiement encaissé ✓",
        message: `La facture #${inv.number} de ${inv.client} a été payée.`,
        time: inv.issueDate || "",
        read: true,
        type: "wave",
      });
    });

    // Clients count notification
    if (clientsList.length > 0) {
      items.push({
        id: "clients_total",
        title: `${clientsList.length} client${clientsList.length > 1 ? "s" : ""} dans votre portefeuille`,
        message: "Créez de nouvelles factures pour vos clients existants.",
        time: "Aujourd'hui",
        read: true,
        type: "system",
      });
    }

    // Merge with custom (manually set read state)
    return items.map((item) => {
      const custom = customNotifications.find((c) => c.id === item.id);
      return custom ? { ...item, read: custom.read } : item;
    });
  }, [invoicesList, clientsList, customNotifications]);

  const notifications = buildNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const markAllAsRead = () => {
    const allRead = notifications.map((n) => ({ ...n, read: true }));
    setCustomNotifications(allRead);
  };

  const clearAll = () => {
    setCustomNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setCustomNotifications((prev) => {
      const existing = prev.find((n) => n.id === id);
      if (existing) {
        return prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n));
      }
      // Not in custom yet — mark as toggled
      const original = notifications.find((n) => n.id === id);
      if (original) {
        return [...prev, { ...original, read: !original.read }];
      }
      return prev;
    });
  };

  const typeIcon = (type: NotificationItem["type"]) => {
    if (type === "wave")
      return <img src="/Wave.webp" alt="Wave" className="w-7 h-7 rounded-full object-cover shadow-sm" />;
    if (type === "om")
      return <img src="/om.webp" alt="Orange Money" className="w-7 h-7 rounded-full object-cover shadow-sm" />;
    if (type === "overdue")
      return (
        <div className="w-7 h-7 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    if (type === "invoice")
      return (
        <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center">
          <FileText className="w-4 h-4" />
        </div>
      );
    if (type === "system")
      return (
        <div className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center">
          <Smartphone className="w-4 h-4" />
        </div>
      );
    return (
      <div className="w-7 h-7 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center">
        <Sparkles className="w-4 h-4" />
      </div>
    );
  };

  return (
    <header className="h-20 bg-background border-b border-border flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div className="flex flex-col">
          {breadcrumbs && (
            <span className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5 truncate max-w-[150px] sm:max-w-none">
              {breadcrumbs}
            </span>
          )}
          <h1 className="text-lg sm:text-2xl font-semibold text-foreground tracking-tight truncate max-w-[200px] sm:max-w-none">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {/* Bell Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowDropdown((v) => !v)}
          className="rounded-full w-10 h-10 border-border bg-background hover:bg-accent hover:text-accent-foreground relative transition-all active:scale-95"
          aria-label="Notifications"
        >
          <Bell className={`w-5 h-5 ${unreadCount > 0 ? "text-primary" : "text-foreground"}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-white text-[10px] font-bold rounded-full border-2 border-background flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>

        {/* Notifications Dropdown Panel */}
        {showDropdown && (
          <div className="absolute right-0 top-14 w-[300px] sm:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Dropdown Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
                    {unreadCount} nouvelles
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    title="Tout marquer comme lu"
                    className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    title="Vider"
                    className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => toggleRead(n.id)}
                    className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                      n.read
                        ? "bg-card hover:bg-accent/30"
                        : "bg-primary/5 hover:bg-primary/10"
                    }`}
                  >
                    {/* Icon */}
                    <div className="mt-0.5 flex-shrink-0">{typeIcon(n.type)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-xs font-bold leading-tight ${n.read ? "text-muted-foreground" : "text-foreground"}`}>
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                ))
              ) : (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                  <Bell className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">Aucune notification pour le moment.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border bg-muted/20 text-center">
                <span className="text-xs text-muted-foreground">
                  {notifications.length} notification{notifications.length > 1 ? "s" : ""} au total
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
