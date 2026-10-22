import type { Invoice, Client } from "@/lib/data";

/**
 * Helper to download a UTF-8 CSV with BOM (Byte Order Mark)
 * for perfect display in Microsoft Excel and LibreOffice with French accents.
 */
function downloadCSV(csvContent: string, fileName: string) {
  const BOM = "\uFEFF"; // UTF-8 BOM
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export Invoices to Excel-compatible CSV
 */
export function exportInvoicesToCSV(invoices: Invoice[]) {
  if (!invoices || invoices.length === 0) return false;

  const headers = [
    "Numéro Facture",
    "Client",
    "Email Client",
    "NINEA Client",
    "Date d'émission",
    "Date d'échéance",
    "Montant Total (FCFA)",
    "Taux TVA (%)",
    "Statut",
    "Notes",
  ];

  const statusLabels: Record<string, string> = {
    paid: "Payée",
    sent: "Envoyée (En attente)",
    overdue: "En retard",
    draft: "Brouillon",
  };

  const rows = invoices.map((inv) => [
    escapeCSV(inv.number),
    escapeCSV(inv.client),
    escapeCSV(inv.clientEmail),
    escapeCSV(inv.clientNinea || ""),
    escapeCSV(inv.issueDate),
    escapeCSV(inv.dueDate),
    escapeCSV(inv.amount),
    escapeCSV(inv.taxRate),
    escapeCSV(statusLabels[inv.status] || inv.status),
    escapeCSV(inv.notes || ""),
  ]);

  const csvContent = [
    headers.map((h) => `"${h}"`).join(";"),
    ...rows.map((row) => row.join(";")),
  ].join("\r\n");

  const today = new Date().toISOString().split("T")[0];
  downloadCSV(csvContent, `iziflow-factures-${today}.csv`);
  return true;
}

/**
 * Export Clients to Excel-compatible CSV
 */
export function exportClientsToCSV(clients: Client[]) {
  if (!clients || clients.length === 0) return false;

  const headers = [
    "Nom / Société",
    "Email",
    "Téléphone",
    "NINEA",
    "RCCM",
    "Adresse",
    "Ville",
    "Pays",
    "Factures Totales",
    "Total Encaissé (FCFA)",
    "Date de création",
  ];

  const rows = clients.map((c) => [
    escapeCSV(c.name),
    escapeCSV(c.email),
    escapeCSV(c.phone),
    escapeCSV(c.ninea || ""),
    escapeCSV(c.rccm || ""),
    escapeCSV(c.address || ""),
    escapeCSV(c.city || ""),
    escapeCSV(c.country || "Sénégal"),
    escapeCSV(c.totalInvoices || 0),
    escapeCSV(c.totalPaid || 0),
    escapeCSV(c.createdAt || ""),
  ]);

  const csvContent = [
    headers.map((h) => `"${h}"`).join(";"),
    ...rows.map((row) => row.join(";")),
  ].join("\r\n");

  const today = new Date().toISOString().split("T")[0];
  downloadCSV(csvContent, `iziflow-clients-${today}.csv`);
  return true;
}
