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
import { WaveLogo, OrangeMoneyLogo, PaymentMethodBadge } from "@/components/ui/payment-logos";

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
                    className={`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === "wave"
                        ? "border-[#1dc3f7] bg-[#1dc3f7]/15 text-[#0284c7] shadow-sm ring-2 ring-[#1dc3f7]/40"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <WaveLogo className="w-5 h-5 shadow-sm" />
                    <span className="font-extrabold text-[#0284c7] dark:text-[#38bdf8]">Wave</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("om")}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === "om"
                        ? "border-[#ff7900] bg-[#ff7900]/15 text-[#ea580c] shadow-sm ring-2 ring-[#ff7900]/40"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <OrangeMoneyLogo className="w-5 h-5 shadow-sm" />
                    <span className="font-extrabold text-[#ea580c] dark:text-[#fb923c]">Orange M.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === "cash"
                        ? "border-emerald-600 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shadow-sm ring-2 ring-emerald-500/40"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400">Espèces</span>
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
                      <PaymentMethodBadge method={sale.paymentMethod} />
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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          {/* Floating Toolbar above the physical receipt */}
          <div className="w-full max-w-[360px] flex items-center justify-between pb-3 text-white print:hidden">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wide uppercase text-slate-300">
                Ticket Caisse Émis
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => window.print()}
                className="h-8 px-3 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs gap-1.5 shadow-lg"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer</span>
              </Button>
              <button
                onClick={() => setCompletedSale(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Realistic Physical Thermal Ticket Paper Roll */}
          <div className="w-full max-w-[360px] relative filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.65)] select-text print:filter-none print:max-w-full">
            {/* Top Sawtooth Tear Cut (POS Thermal roll cut) */}
            <div className="w-full overflow-hidden leading-none rotate-180 print:hidden">
              <svg className="w-full h-3 text-white fill-current block" viewBox="0 0 360 12" preserveAspectRatio="none">
                <path d="M0,12 L6,0 L12,12 L18,0 L24,12 L30,0 L36,12 L42,0 L48,12 L54,0 L60,12 L66,0 L72,12 L78,0 L84,12 L90,0 L96,12 L102,0 L108,12 L114,0 L120,12 L126,0 L132,12 L138,0 L144,12 L150,0 L156,12 L162,0 L168,12 L174,0 L180,12 L186,0 L192,12 L198,0 L204,12 L210,0 L216,12 L222,0 L228,12 L234,0 L240,12 L246,0 L252,12 L258,0 L264,12 L270,0 L276,12 L282,0 L288,12 L294,0 L300,12 L306,0 L312,12 L318,0 L324,12 L330,0 L336,12 L342,0 L348,12 L354,0 L360,12 Z" />
              </svg>
            </div>

            {/* Solid Pure White Thermal Paper Body */}
            <div 
              id="thermal-receipt" 
              className="bg-white text-zinc-950 px-6 py-5 font-mono text-xs border-x border-zinc-200 print:border-none print:p-0"
              style={{ backgroundColor: "#ffffff", color: "#09090b" }}
            >
              {/* Receipt Header */}
              <div className="text-center pb-3 border-b-2 border-dashed border-zinc-400">
                <div className="inline-block p-1.5 rounded-full bg-zinc-100 mb-1.5">
                  <Receipt className="w-5 h-5 text-zinc-800" />
                </div>
                <h2 className="font-black text-sm uppercase tracking-wider text-zinc-950">
                  {companySettings?.companyName || "iziFlow SARL"}
                </h2>
                <p className="text-[10px] font-bold text-zinc-600 uppercase mt-0.5">
                  COMMERCE &amp; SERVICES AGRÉÉS
                </p>
                <div className="text-[10px] text-zinc-600 mt-1 space-y-0.5">
                  <p>NINEA : {companySettings?.ninea || "001234567 2V3"}</p>
                  <p>RCCM : {companySettings?.rccm || "SN-DKR-2024-B-12345"}</p>
                  <p>Tél : {companySettings?.phone || "+221 77 123 45 67"}</p>
                  <p>{companySettings?.address || "Dakar, Sénégal"}</p>
                </div>
              </div>

              {/* Receipt Meta */}
              <div className="py-2.5 border-b border-dashed border-zinc-300 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Ticket N° :</span>
                  <span className="font-extrabold text-zinc-950">{completedSale.saleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Date &amp; Heure :</span>
                  <span className="font-medium text-zinc-900">{completedSale.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Client :</span>
                  <span className="font-bold text-zinc-900">{completedSale.customerName}</span>
                </div>
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-zinc-600">Règlement :</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    {completedSale.paymentMethod === "wave" ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1dc3f7]/15 text-[#0284c7] border border-[#1dc3f7]/40 text-[11px] font-extrabold">
                        <WaveLogo className="w-4 h-4" />
                        <span>Wave</span>
                      </span>
                    ) : completedSale.paymentMethod === "om" ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ff7900]/15 text-[#ea580c] border border-[#ff7900]/40 text-[11px] font-extrabold">
                        <OrangeMoneyLogo className="w-4 h-4" />
                        <span>Orange Money</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                        💵 Espèces
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-3 border-b-2 border-dashed border-zinc-400 space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-200 pb-1">
                  <span>Désignation</span>
                  <span>Total</span>
                </div>
                {completedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="flex-1 pr-3">
                      <p className="font-bold text-zinc-950 leading-tight">{item.name}</p>
                      <span className="text-[10px] text-zinc-500">
                        {item.quantity} x {formatFCFA(item.unitPrice)}
                      </span>
                    </div>
                    <span className="font-extrabold text-right text-zinc-950 whitespace-nowrap">
                      {formatFCFA(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals Summary */}
              <div className="pt-2.5 pb-2 border-b border-dashed border-zinc-300 text-[11px] space-y-1">
                <div className="flex justify-between text-zinc-600">
                  <span>Sous-total HT</span>
                  <span className="font-bold">{formatFCFA(completedSale.subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>TVA (18%)</span>
                  <span>{formatFCFA(completedSale.taxAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black pt-1.5 border-t border-zinc-300 text-zinc-950">
                  <span className="uppercase tracking-wider">TOTAL TTC PAYÉ</span>
                  <span className="text-base font-extrabold">{formatFCFA(completedSale.total)}</span>
                </div>
              </div>

              {/* Cash tendered & change if applicable */}
              {completedSale.paymentMethod === "cash" && cashTendered > 0 && (
                <div className="py-2 border-b border-dashed border-zinc-300 text-[10px] text-zinc-600 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Espèces reçues :</span>
                    <span className="font-bold">{formatFCFA(cashTendered)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>Monnaie rendue :</span>
                    <span>{formatFCFA(changeDue)}</span>
                  </div>
                </div>
              )}

              {/* Stamp watermark preview if available */}
              {companySettings?.useStampOnDocuments && companySettings?.companyStampUrl && (
                <div className="flex justify-center my-3">
                  <img
                    src={companySettings.companyStampUrl}
                    alt="Cachet officiel"
                    className="w-16 h-16 object-contain opacity-90 rotate-[-5deg]"
                  />
                </div>
              )}

              {/* Barcode Graphic Simulation */}
              <div className="pt-3 pb-1 text-center">
                <div className="flex justify-center items-center gap-[2px] h-9 mx-auto w-48 opacity-80">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3].map((w, i) => (
                    <span
                      key={i}
                      className="bg-zinc-950 h-full inline-block"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
                <p className="text-[9px] tracking-widest text-zinc-500 font-mono mt-1">
                  *{completedSale.saleNumber.replace(/-/g, "")}*
                </p>
              </div>

              {/* Receipt Footer */}
              <div className="text-center pt-2 text-[9px] text-zinc-500 space-y-0.5">
                <p className="font-bold text-zinc-800">MERCI POUR VOTRE ACHAT !</p>
                <p>Les articles vendus ne sont ni repris ni échangés.</p>
                <p className="text-[8px] text-zinc-400 pt-1">
                  Système de Caisse certifié iziFlow POS • www.iziflow.sn
                </p>
              </div>
            </div>

            {/* Bottom Sawtooth Tear Cut */}
            <div className="w-full overflow-hidden leading-none print:hidden">
              <svg className="w-full h-3 text-white fill-current block" viewBox="0 0 360 12" preserveAspectRatio="none">
                <path d="M0,0 L6,12 L12,0 L18,12 L24,0 L30,12 L36,0 L42,12 L48,0 L54,12 L60,0 L66,12 L72,0 L78,12 L84,0 L90,12 L96,0 L102,12 L108,0 L114,12 L120,0 L126,12 L132,0 L138,12 L144,0 L150,12 L156,0 L162,12 L168,0 L174,12 L180,0 L186,12 L192,0 L198,12 L204,0 L210,12 L216,0 L222,12 L228,0 L234,12 L240,0 L246,12 L252,0 L258,12 L264,0 L270,12 L276,0 L282,12 L288,0 L294,12 L300,0 L306,12 L312,0 L318,12 L324,0 L330,12 L336,0 L342,12 L348,0 L354,12 L360,0 Z" />
              </svg>
            </div>
          </div>

          {/* Quick Close Button Below */}
          <div className="mt-4 print:hidden">
            <button
              onClick={() => setCompletedSale(null)}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors underline underline-offset-4"
            >
              Fermer et retourner à la caisse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
