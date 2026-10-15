"use client";

import { useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import { Product, Sale, SaleItem } from "@/lib/data";
import { formatFCFA } from "@/lib/utils";
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Receipt, 
  Printer, 
  User, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  TrendingUp, 
  Calendar, 
  History, 
  Tag, 
  Sparkles, 
  X,
  RotateCcw,
  ShieldCheck,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SalesPage() {
  const { 
    productsList, 
    salesList, 
    addSale, 
    clientsList, 
    companySettings 
  } = useAppData();

  const [activeTab, setActiveTab] = useState<"pos" | "history">("pos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Cart state
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [customerName, setCustomerName] = useState("Client de passage");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "wave" | "om" | "card" | "bank_transfer">("wave");
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [applyTax, setApplyTax] = useState(true);

  // Completed sale / Receipt modal
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Categories
  const categories = Array.from(new Set(["all", ...productsList.map((p) => p.category)]));

  // Filtered Products for POS Catalog
  const filteredProducts = productsList.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const totalCost = cart.reduce((sum, item) => sum + item.product.purchasePrice * item.quantity, 0);
  const taxRate = applyTax ? (companySettings?.defaultTaxRate ?? 18) : 0;
  const taxAmount = applyTax ? Math.round(subtotal * (taxRate / 100)) : 0;
  const total = subtotal + taxAmount;
  const totalMargin = subtotal - totalCost;

  // Change to return if cash
  const changeDue = paymentMethod === "cash" && cashTendered > total ? cashTendered - total : 0;

  // Add to cart
  const handleAddToCart = (product: Product) => {
    if (product.trackStock && product.stockQuantity <= 0) {
      showToast(`Attention : "${product.name}" est en rupture de stock !`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (product.trackStock && existing.quantity >= product.stockQuantity) {
          showToast(`Stock maximal atteint (${product.stockQuantity} ${product.unit}) pour cet article.`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Adjust cart item quantity
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (item.product.trackStock && newQty > item.product.stockQuantity) {
              showToast(`Quantité limitée au stock disponible (${item.product.stockQuantity})`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item
  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Clear cart
  const handleClearCart = () => {
    setCart([]);
    setCashTendered(0);
  };

  // Finalize Sale
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const saleNumber = `VTE-${new Date().getFullYear()}-${String(salesList.length + 1).padStart(3, "0")}`;

    const saleItems: SaleItem[] = cart.map((item) => ({
      id: `sitem_${Date.now()}_${item.product.id}`,
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      purchasePrice: item.product.purchasePrice,
      unitPrice: item.product.sellingPrice,
      totalPrice: item.product.sellingPrice * item.quantity,
    }));

    const newSaleData: Omit<Sale, "id" | "createdAt"> = {
      saleNumber,
      clientId: selectedClientId || undefined,
      customerName: customerName || "Client de passage",
      paymentMethod,
      subtotal,
      taxAmount,
      total,
      totalCost,
      margin: totalMargin,
      items: saleItems,
    };

    await addSale(newSaleData);

    const saleRecord: Sale = {
      ...newSaleData,
      id: `sale_${Date.now()}`,
      createdAt: new Date().toLocaleDateString("fr-FR", { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };

    setCompletedSale(saleRecord);
    handleClearCart();
    showToast(`Vente #${saleNumber} validée et stock décompté avec succès !`);
  };

  // Metrics from salesList
  const totalSalesRevenue = salesList.reduce((sum, s) => sum + s.total, 0);
  const totalSalesCount = salesList.length;
  const totalRealizedMargin = salesList.reduce((sum, s) => sum + s.margin, 0);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-foreground text-background px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200 border border-border">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Ventes & Caisse Rapide</h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs py-0.5">
              Caisse Directe
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Encaissez au comptoir par Wave, Orange Money ou Espèces avec déstockage instantané.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-muted p-1 rounded-2xl text-xs font-bold shadow-inner">
          <button
            onClick={() => setActiveTab("pos")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === "pos" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-primary" />
            Terminal de Caisse
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === "history" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-4 h-4 text-muted-foreground" />
            Journal des Ventes ({salesList.length})
          </button>
        </div>
      </div>

      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Encaissé Caisse</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-extrabold font-mono text-foreground">
              {formatFCFA(totalSalesRevenue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Sur {totalSalesCount} transactions de caisse</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Marge Brute Réalisée</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              +{formatFCFA(totalRealizedMargin)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Bénéfice commercial net</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Paiement Mobile Money</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-extrabold font-mono text-foreground">
              Wave & OM
            </p>
            <p className="text-xs text-muted-foreground mt-1">Instantané sans contact</p>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: TERMINAL DE CAISSE (POS)
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "pos" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Product Catalog (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Catalog Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un produit à encaisser..."
                  className="pl-10 text-xs md:text-sm bg-card border-border rounded-xl"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat === "all" ? "Tous" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.trackStock && prod.stockQuantity <= 0;
                const inCartItem = cart.find((c) => c.product.id === prod.id);

                return (
                  <div
                    key={prod.id}
                    onClick={() => !isOutOfStock && handleAddToCart(prod)}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 bg-card relative ${
                      isOutOfStock 
                        ? "opacity-50 cursor-not-allowed border-dashed border-border" 
                        : "hover:border-primary/50 hover:shadow-md cursor-pointer active:scale-[0.99] group border-border"
                    } ${inCartItem ? "ring-2 ring-primary/40 border-primary" : ""}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded-md bg-muted">
                          {prod.category}
                        </span>

                        {prod.trackStock ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOutOfStock 
                              ? "bg-rose-500/10 text-rose-600" 
                              : prod.stockQuantity <= prod.minStockAlert 
                              ? "bg-amber-500/10 text-amber-600" 
                              : "bg-emerald-500/10 text-emerald-600"
                          }`}>
                            {isOutOfStock ? "Rupture" : `${prod.stockQuantity} ${prod.unit}`}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full">
                            Service
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {prod.name}
                      </h4>
                      {prod.sku && (
                        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{prod.sku}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                      <span className="font-mono font-extrabold text-foreground text-sm">
                        {formatFCFA(prod.sellingPrice)}
                      </span>

                      <Button
                        size="sm"
                        disabled={isOutOfStock}
                        className={`rounded-xl h-8 px-3 text-xs font-bold gap-1 ${
                          inCartItem ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {inCartItem ? `x${inCartItem.quantity}` : "Ajouter"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 p-6 rounded-2xl bg-card border border-dashed border-border text-muted-foreground text-xs">
                Aucun produit ne correspond à votre recherche.
              </div>
            )}
          </div>

          {/* Right Column: POS Cart & Checkout (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5 sticky top-6">
            <div className="rounded-3xl border border-border bg-card p-6 md:p-7 shadow-lg flex flex-col gap-5">
              {/* Cart Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Panier en cours</h3>
                    <p className="text-[11px] text-muted-foreground">{cart.length} référence(s) sélectionnée(s)</p>
                  </div>
                </div>

                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-xs text-muted-foreground hover:text-rose-600 transition-colors flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" /> Vider
                  </button>
                )}
              </div>

              {/* Customer Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Client
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nom du client..."
                    className="text-xs rounded-xl"
                  />
                  <select
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value);
                      const cl = clientsList.find((c) => c.id === e.target.value);
                      if (cl) setCustomerName(cl.name);
                    }}
                    className="px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none"
                  >
                    <option value="">Sélectionner un client...</option>
                    {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1 divide-y divide-border/60">
                {cart.map((item) => (
                  <div key={item.product.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{item.product.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">
                        {formatFCFA(item.product.sellingPrice)} / {item.product.unit}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 bg-muted rounded-xl p-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded-lg bg-card hover:bg-muted-foreground/10 text-foreground flex items-center justify-center font-bold text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-mono font-bold">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded-lg bg-card hover:bg-muted-foreground/10 text-foreground flex items-center justify-center font-bold text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right shrink-0 min-w-[70px]">
                      <p className="font-mono font-bold text-xs text-foreground">
                        {formatFCFA(item.product.sellingPrice * item.quantity)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="text-[10px] text-muted-foreground hover:text-rose-500 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-xs italic">
                    Le panier est vide. Cliquez sur un article du catalogue à gauche pour l'ajouter.
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Moyen de règlement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("wave")}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === "wave"
                        ? "border-[#1dc3f7] bg-[#1dc3f7]/10 text-[#0099cc] shadow-sm ring-1 ring-[#1dc3f7]"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-[#1dc3f7]" />
                    <span>Wave</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("om")}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === "om"
                        ? "border-[#ff6600] bg-[#ff6600]/10 text-[#ff6600] shadow-sm ring-1 ring-[#ff6600]"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-[#ff6600]" />
                    <span>Orange M.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === "cash"
                        ? "border-emerald-600 bg-emerald-500/10 text-emerald-600 shadow-sm ring-1 ring-emerald-600"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Espèces</span>
                  </button>
                </div>

                {/* If Cash : Tendered Amount & Change Calculator */}
                {paymentMethod === "cash" && (
                  <div className="p-3 rounded-xl bg-muted/60 border border-border flex items-center justify-between gap-3 mt-1">
                    <div>
                      <span className="text-[11px] font-bold text-muted-foreground block">Montant reçu :</span>
                      <Input
                        type="number"
                        min={total}
                        value={cashTendered || ""}
                        onChange={(e) => setCashTendered(Number(e.target.value))}
                        placeholder={`${total} FCFA`}
                        className="h-8 text-xs font-mono font-bold mt-1 w-28 bg-background"
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-muted-foreground block">Monnaie à rendre :</span>
                      <span className="text-sm font-mono font-black text-emerald-600">
                        {formatFCFA(changeDue)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Totals Summary */}
              <div className="pt-3 border-t border-border flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Sous-total HT</span>
                  <span className="font-mono">{formatFCFA(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>TVA ({taxRate}%)</span>
                    <button
                      type="button"
                      onClick={() => setApplyTax(!applyTax)}
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${applyTax ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}
                    >
                      {applyTax ? "Active" : "Exonérée"}
                    </button>
                  </div>
                  <span className="font-mono">{formatFCFA(taxAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-base font-black text-foreground pt-2 border-t border-border">
                  <span>Total à payer</span>
                  <span className="text-xl font-mono text-primary">{formatFCFA(total)}</span>
                </div>
                {totalMargin > 0 && (
                  <span className="text-[11px] font-bold text-emerald-600 text-right mt-0.5">
                    Marge bénéficiaire : +{formatFCFA(totalMargin)}
                  </span>
                )}
              </div>

              {/* Big Checkout CTA */}
              <Button
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className="w-full rounded-2xl py-3.5 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Encaisser {formatFCFA(total)}</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ──────────────────────────────────────────────────────────────────────────
            TAB 2: JOURNAL & HISTORIQUE DES VENTES
        ────────────────────────────────────────────────────────────────────────── */
        <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Historique des Ventes de Caisse</h3>
              <p className="text-xs text-muted-foreground">Registre de tous les encaissements directs avec décompte de stock.</p>
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              {salesList.length} vente(s) enregistrée(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-4">N° Vente</th>
                  <th className="py-3.5 px-4">Date & Heure</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Paiement</th>
                  <th className="py-3.5 px-4 text-right">Articles</th>
                  <th className="py-3.5 px-4 text-right">Total TTC</th>
                  <th className="py-3.5 px-4 text-right">Marge Réalisée</th>
                  <th className="py-3.5 px-4 text-right">Ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {salesList.map((sale) => (
                  <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-primary">
                      {sale.saleNumber}
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">
                      {sale.createdAt}
                    </td>
                    <td className="py-4 px-4 font-semibold text-foreground">
                      {sale.customerName}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        sale.paymentMethod === "wave"
                          ? "bg-[#1dc3f7]/10 text-[#0099cc]"
                          : sale.paymentMethod === "om"
                          ? "bg-[#ff6600]/10 text-[#ff6600]"
                          : "bg-emerald-500/10 text-emerald-600"
                      }`}>
                        {sale.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-xs font-mono text-muted-foreground">
                      {sale.items.length} art.
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-foreground">
                      {formatFCFA(sale.total)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-xs font-bold text-emerald-600">
                      +{formatFCFA(sale.margin)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCompletedSale(sale)}
                        className="rounded-xl h-7 px-2.5 text-xs gap-1 border-border"
                      >
                        <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Ticket</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: TICKET DE CAISSE (REÇU DE VENTE IMPRIMABLE)
      ────────────────────────────────────────────────────────────────────────── */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-6 shadow-2xl relative flex flex-col">
            <button
              onClick={() => setCompletedSale(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Thermal Receipt Body */}
            <div id="thermal-receipt" className="p-4 rounded-2xl bg-white text-zinc-900 border border-zinc-200 font-mono text-xs shadow-inner">
              {/* Receipt Header */}
              <div className="text-center pb-3 border-b border-dashed border-zinc-300">
                <p className="font-extrabold text-sm uppercase tracking-wide">
                  {companySettings?.companyName || "iziFlow SARL"}
                </p>
                <p className="text-[10px] text-zinc-500">Suite Commerciale • OHADA</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  NINEA : {companySettings?.ninea || "001234567 2V3"}
                </p>
                <p className="text-[10px] text-zinc-500">Tél : {companySettings?.phone || "+221 77 123 45 67"}</p>
              </div>

              {/* Receipt Info */}
              <div className="py-2.5 border-b border-dashed border-zinc-300 text-[10px] flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>Reçu N° :</span>
                  <span className="font-bold">{completedSale.saleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date :</span>
                  <span>{completedSale.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span>Client :</span>
                  <span className="font-semibold">{completedSale.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Règlement :</span>
                  <span className="font-bold uppercase text-emerald-700">{completedSale.paymentMethod}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-2.5 border-b border-dashed border-zinc-300 flex flex-col gap-1.5">
                {completedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <div className="flex-1 pr-2">
                      <p className="font-bold leading-tight">{item.name}</p>
                      <span className="text-[10px] text-zinc-500">{item.quantity} x {formatFCFA(item.unitPrice)}</span>
                    </div>
                    <span className="font-bold text-right">{formatFCFA(item.totalPrice)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-2.5 flex flex-col gap-1 text-[11px]">
                <div className="flex justify-between text-zinc-500">
                  <span>Sous-total HT</span>
                  <span>{formatFCFA(completedSale.subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>TVA</span>
                  <span>{formatFCFA(completedSale.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-1 border-t border-zinc-300">
                  <span>TOTAL PAYÉ</span>
                  <span>{formatFCFA(completedSale.total)}</span>
                </div>
              </div>

              {/* Stamp watermark preview if available */}
              {companySettings?.useStampOnDocuments && companySettings?.companyStampUrl && (
                <div className="flex justify-center my-2 opacity-80">
                  <img
                    src={companySettings.companyStampUrl}
                    alt="Cachet officiel"
                    className="w-16 h-16 object-contain"
                  />
                </div>
              )}

              {/* Receipt Footer */}
              <div className="text-center pt-3 text-[9px] text-zinc-500 border-t border-dashed border-zinc-300 mt-2">
                <p>Merci pour votre confiance !</p>
                <p className="mt-0.5">Certifié par iziFlow • Solution de Gestion Commerciale</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4">
              <Button
                onClick={() => window.print()}
                className="flex-1 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer le ticket
              </Button>
              <Button
                variant="outline"
                onClick={() => setCompletedSale(null)}
                className="rounded-xl text-xs font-semibold"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
