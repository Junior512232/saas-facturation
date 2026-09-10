"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Save, Send } from "lucide-react";
import Link from "next/link";
import { formatFCFA } from "@/lib/utils";
import { useAppData } from "@/context/AppDataContext";
import { useRouter } from "next/navigation";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const { clientsList, addInvoice } = useAppData();

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [clientId, setClientId] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState("");

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const handleSave = (status: "draft" | "sent" | "paid") => {
    if (!clientId) {
      alert("Veuillez sélectionner un client.");
      return;
    }
    const client = clientsList.find((c) => c.id === clientId);
    if (!client) return;

    const date = new Date();
    const issueDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

    addInvoice({
      number: invoiceNumber,
      clientId: client.id,
      client: client.name,
      clientEmail: client.email,
      issueDate,
      dueDate: dueDate || issueDate,
      amount: total,
      taxRate,
      items,
      notes,
      status,
    });
    
    router.push("/invoices");
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8 pb-24">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="outline" size="icon" className="rounded-full w-10 h-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Nouvelle Facture</h2>
            <p className="text-muted-foreground">Créez une facture et envoyez-la à votre client.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => handleSave("draft")}>
            <Save className="w-4 h-4" />
            Brouillon
          </Button>
          <Button className="flex items-center gap-2" onClick={() => handleSave("sent")}>
            <Send className="w-4 h-4" />
            Enregistrer & Envoyer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Client Details */}
          <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Informations du client</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sélectionner un client</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">-- Choisir un client --</option>
                  {clientsList.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              
              {clientId && (
                <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-sm flex flex-col gap-1">
                  <span className="font-semibold text-foreground">{clientsList.find(c => c.id === clientId)?.name}</span>
                  <span className="text-muted-foreground">{clientsList.find(c => c.id === clientId)?.email}</span>
                  <span className="text-muted-foreground">{clientsList.find(c => c.id === clientId)?.address}</span>
                </div>
              )}
            </div>
          </section>

          {/* Invoice Details */}
          <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Détails de la facture</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Numéro de facture</label>
                <Input 
                  value={invoiceNumber} 
                  onChange={(e) => setInvoiceNumber(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date d'échéance</label>
                <Input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className="hidden sm:grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground mb-2 px-2">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-center">Qté</div>
                <div className="col-span-3 text-right">Prix unitaire (FCFA)</div>
                <div className="col-span-1"></div>
              </div>
              
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-muted/30 p-4 sm:p-2 sm:bg-transparent rounded-xl sm:rounded-none border sm:border-none border-border/50">
                  <div className="sm:col-span-6 space-y-1 sm:space-y-0">
                    <label className="text-xs text-muted-foreground sm:hidden">Description</label>
                    <Input 
                      placeholder="Description du service" 
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1 sm:space-y-0">
                    <label className="text-xs text-muted-foreground sm:hidden">Qté</label>
                    <Input 
                      type="number" 
                      min="1" 
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-1 sm:space-y-0">
                    <label className="text-xs text-muted-foreground sm:hidden">Prix unitaire</label>
                    <Input 
                      type="number" 
                      min="0" 
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, "unitPrice", parseInt(e.target.value) || 0)}
                      className="text-right"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end sm:justify-center mt-2 sm:mt-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="mt-4 w-full border-dashed flex items-center justify-center gap-2"
              onClick={addItem}
            >
              <Plus className="w-4 h-4" />
              Ajouter une ligne
            </Button>
          </section>

          {/* Notes */}
          <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Notes supplémentaires</h3>
            <Textarea 
              placeholder="Merci pour votre confiance. Les conditions de paiement sont à 30 jours." 
              className="min-h-[100px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-semibold mb-6">Résumé</h3>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Sous-total</span>
                <span className="font-mono text-foreground font-medium">{formatFCFA(subtotal)}</span>
              </div>
              
              <div className="flex items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>TVA (%)</span>
                  <Input 
                    type="number" 
                    className="w-16 h-8 text-right px-2" 
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseInt(e.target.value) || 0)}
                  />
                </div>
                <span className="font-mono text-foreground font-medium">{formatFCFA(taxAmount)}</span>
              </div>
            </div>
            
            <div className="border-t border-border pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total TTC</span>
                <span className="text-xl font-bold font-mono text-primary">{formatFCFA(total)}</span>
              </div>
            </div>

            <Button className="w-full mb-3 flex items-center justify-center gap-2" size="lg" onClick={() => handleSave("sent")}>
              <Send className="w-4 h-4" />
              Envoyer la facture
            </Button>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2" size="lg" onClick={() => handleSave("draft")}>
              <Save className="w-4 h-4" />
              Enregistrer comme brouillon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
