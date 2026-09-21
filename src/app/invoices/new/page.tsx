"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppData } from "@/context/AppDataContext";
import { formatFCFA } from "@/lib/utils";
import { Invoice, InvoiceItem } from "@/lib/data";
import { ArrowLeft, Plus, Trash2, GripVertical, AlertCircle } from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { clientsList: clients, invoicesList: invoices, addInvoice } = useAppData();

  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState(18);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!clientId) newErrors.clientId = "Veuillez sélectionner un client.";
    items.forEach((item, idx) => {
      if (!item.description.trim()) newErrors[`desc_${idx}`] = "Description requise.";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildAndSave = (status: Invoice["status"]) => {
    const selectedClient = clients.find((c) => c.id === clientId)!;
    const nextNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      number: nextNumber,
      clientId,
      client: selectedClient.name,
      clientEmail: selectedClient.email,
      issueDate,
      dueDate,
      amount: total,
      taxRate,
      status,
      notes,
      items: items.map((item): InvoiceItem => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };
    
    // addInvoice in context takes an Omit<Invoice, "id" | "status"> & { status?: InvoiceStatus }
    // It creates the id itself, so we don't need to pass it, but TS might complain if we defined newInvoice as Invoice.
    // So we just omit id from the payload.
    const { id, ...payload } = newInvoice;
    addInvoice(payload);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    buildAndSave("sent");
    setIsSubmitting(false);
    router.push("/invoices");
  };

  const handleSaveDraft = () => {
    if (!validate()) return;
    buildAndSave("draft");
    router.push("/invoices");
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/invoices"
          className="p-2 rounded-xl border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Nouvelle facture</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Remplissez les informations ci-dessous pour créer une facture.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Client Selection */}
            <section className="rounded-2xl border border-border bg-card shadow-sm p-6 flex flex-col gap-4">
              <h3 className="font-semibold text-foreground">Informations client</h3>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Client <span className="text-destructive">*</span>
                </label>
                <select
                  value={clientId}
                  onChange={(e) => { setClientId(e.target.value); setErrors((prev) => ({ ...prev, clientId: "" })); }}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all ${errors.clientId ? "border-destructive" : "border-border"}`}
                >
                  <option value="">— Sélectionner un client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.clientId}
                  </p>
                )}
              </div>

              {clientId && (() => {
                const c = clients.find((x) => x.id === clientId)!;
                return (
                  <div className="p-4 bg-accent/50 rounded-xl flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${c.color}`}>
                      {c.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email} · {c.city}, {c.country}</p>
                    </div>
                  </div>
                );
              })()}
            </section>

            {/* Dates */}
            <section className="rounded-2xl border border-border bg-card shadow-sm p-6 flex flex-col gap-4">
              <h3 className="font-semibold text-foreground">Dates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Date d&apos;émission</label>
                  <input
                    type="text"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    placeholder="jj/mm/aaaa"
                    className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Date d&apos;échéance
                  </label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => { setDueDate(e.target.value); setErrors((prev) => ({ ...prev, dueDate: "" })); }}
                    placeholder="jj/mm/aaaa"
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all ${errors.dueDate ? "border-destructive" : "border-border"}`}
                  />
                  {errors.dueDate && (
                    <p className="flex items-center gap-1.5 text-xs text-destructive mt-0.5">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.dueDate}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Line Items */}
            <section className="rounded-2xl border border-border bg-card shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Lignes de facturation</h3>
                <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  <Plus className="w-4 h-4" /> Ajouter une ligne
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2 text-center">Qté</div>
                  <div className="col-span-3 text-right">Prix unitaire</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                {items.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-start group">
                    <div className="col-span-5 flex items-start gap-1">
                      <button type="button" className="mt-3 text-muted-foreground/40 cursor-grab">
                        <GripVertical className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex-1 flex flex-col gap-1">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          placeholder="Description du service..."
                          className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all ${errors[`desc_${idx}`] ? "border-destructive" : "border-border"}`}
                        />
                        {errors[`desc_${idx}`] && (
                          <p className="text-xs text-destructive">{errors[`desc_${idx}`]}</p>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number" min={1} value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2.5 border border-border rounded-xl text-sm text-center bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number" min={0} value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, "unitPrice", parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 border border-border rounded-xl text-sm text-right bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-mono"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <span className="text-sm font-mono font-semibold text-foreground text-right leading-[42px]">
                        {formatFCFA(item.quantity * item.unitPrice)}
                      </span>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Notes */}
            <section className="rounded-2xl border border-border bg-card shadow-sm p-6 flex flex-col gap-4">
              <h3 className="font-semibold text-foreground">Notes (optionnel)</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Conditions de paiement, remerciements, instructions supplémentaires..."
                className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none"
              />
            </section>
          </div>

          {/* Sidebar Summary */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card shadow-sm p-6 flex flex-col gap-5 sticky top-24">
              <h3 className="font-semibold text-foreground">Récapitulatif</h3>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total HT</span>
                  <span className="font-mono font-medium text-foreground">{formatFCFA(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">TVA</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min={0} max={100} value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-border rounded-lg text-sm text-right bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Montant TVA</span>
                  <span className="font-mono font-medium text-foreground">{formatFCFA(taxAmount)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-bold text-foreground">Total TTC</span>
                  <span className="font-mono font-bold text-xl text-primary">{formatFCFA(total)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  {isSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {isSubmitting ? "Enregistrement..." : "Enregistrer & Envoyer"}
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="w-full px-5 py-3 border border-border hover:bg-accent text-foreground rounded-xl text-sm font-medium transition-colors"
                >
                  Enregistrer comme brouillon
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
