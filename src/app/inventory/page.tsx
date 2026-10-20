"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import { canAddProduct, normalizePlan } from "@/lib/plans";
import { Product, StockMovement } from "@/lib/data";
import { formatFCFA } from "@/lib/utils";
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpDown, 
  SlidersHorizontal, 
  History, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Layers, 
  Barcode, 
  ShoppingBag,
  Filter,
  Lock,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InventoryPage() {
  const { user } = useAuth();
  const { 
    productsList, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    adjustStock, 
    stockMovementsList 
  } = useAppData();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<Product | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "Général",
    purchasePrice: 0,
    sellingPrice: 0,
    stockQuantity: 0,
    minStockAlert: 5,
    trackStock: true,
    unit: "unité",
  });

  const [adjustData, setAdjustData] = useState({
    type: "in" as "in" | "out",
    quantity: 1,
    reason: "Réception fournisseur",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Categories list
  const categories = Array.from(new Set(["Général", ...productsList.map((p) => p.category)]));

  // Filtered Products
  const filteredProducts = productsList.filter((prod) => {
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.sku && prod.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      prod.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || prod.category === selectedCategory;

    let matchesStatus = true;
    if (stockStatusFilter === "out_of_stock") {
      matchesStatus = prod.trackStock && prod.stockQuantity <= 0;
    } else if (stockStatusFilter === "low_stock") {
      matchesStatus = prod.trackStock && prod.stockQuantity > 0 && prod.stockQuantity <= prod.minStockAlert;
    } else if (stockStatusFilter === "in_stock") {
      matchesStatus = !prod.trackStock || prod.stockQuantity > prod.minStockAlert;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate Metrics
  const totalItemsCount = productsList.length;
  const trackedProducts = productsList.filter((p) => p.trackStock);
  const lowStockCount = trackedProducts.filter((p) => p.stockQuantity <= p.minStockAlert).length;
  const outOfStockCount = trackedProducts.filter((p) => p.stockQuantity <= 0).length;

  const totalStockPurchaseValue = trackedProducts.reduce(
    (sum, p) => sum + p.stockQuantity * p.purchasePrice, 
    0
  );

  const totalStockSaleValue = trackedProducts.reduce(
    (sum, p) => sum + p.stockQuantity * p.sellingPrice, 
    0
  );

  const totalPotentialMargin = totalStockSaleValue - totalStockPurchaseValue;

  const productQuota = canAddProduct(productsList.length, user?.plan);

  // Open modal for new product
  const handleOpenAddModal = () => {
    if (!productQuota.allowed) {
      showToast("Limite atteinte : 10 articles max sur le forfait Gratuit. Passez en Pro pour un catalogue illimité !");
      return;
    }
    setEditingProduct(null);
    setFormData({
      name: "",
      sku: `ART-${Math.floor(1000 + Math.random() * 9000)}`,
      category: "Général",
      purchasePrice: 0,
      sellingPrice: 0,
      stockQuantity: 0,
      minStockAlert: 5,
      trackStock: true,
      unit: "unité",
    });
    setIsAddModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku || "",
      category: prod.category,
      purchasePrice: prod.purchasePrice,
      sellingPrice: prod.sellingPrice,
      stockQuantity: prod.stockQuantity,
      minStockAlert: prod.minStockAlert,
      trackStock: prod.trackStock,
      unit: prod.unit,
    });
    setIsAddModalOpen(true);
  };

  // Submit product create/update
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: formData.name,
        sku: formData.sku || undefined,
        category: formData.category,
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        stockQuantity: Number(formData.stockQuantity) || 0,
        minStockAlert: Number(formData.minStockAlert) || 0,
        trackStock: formData.trackStock,
        unit: formData.unit,
      });
      showToast(`Article "${formData.name}" mis à jour avec succès.`);
    } else {
      if (!productQuota.allowed) {
        showToast("Limite atteinte : 10 articles max sur le forfait Gratuit. Passez en Pro.");
        return;
      }
      await addProduct({
        name: formData.name,
        sku: formData.sku || undefined,
        category: formData.category,
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        stockQuantity: Number(formData.stockQuantity) || 0,
        minStockAlert: Number(formData.minStockAlert) || 0,
        trackStock: formData.trackStock,
        unit: formData.unit,
      });
      showToast(`Nouvel article "${formData.name}" ajouté à l'inventaire.`);
    }

    setIsAddModalOpen(false);
  };

  // Quick adjust modal open
  const handleOpenAdjustModal = (prod: Product, defaultType: "in" | "out" = "in") => {
    setSelectedProductForAdjust(prod);
    setAdjustData({
      type: defaultType,
      quantity: 1,
      reason: defaultType === "in" ? "Réapprovisionnement fournisseur" : "Sortie manuelle / Ajustement",
    });
    setIsAdjustModalOpen(true);
  };

  // Execute quick adjustment
  const handleExecuteAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAdjust) return;

    const delta = adjustData.type === "in" ? adjustData.quantity : -adjustData.quantity;
    await adjustStock(selectedProductForAdjust.id, delta, adjustData.reason);

    showToast(
      `Stock ajusté pour "${selectedProductForAdjust.name}" : ${delta > 0 ? "+" : ""}${delta} ${selectedProductForAdjust.unit}`
    );
    setIsAdjustModalOpen(false);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-foreground text-background px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200 border border-border">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Stocks & Inventaire</h1>
            <Badge variant="outline" className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 text-xs py-0.5">
              Temps réel
            </Badge>
            {normalizePlan(user?.plan) === "gratuit" && (
              <Badge 
                variant="outline" 
                className={`${!productQuota.allowed ? "bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold" : "bg-muted text-muted-foreground border-border"} text-xs py-0.5`}
              >
                Stock : {productsList.length}/10 {productQuota.allowed ? "(Gratuit)" : "(Plafond atteint)"}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez vos références articles, suivez les niveaux d'approvisionnement et prévenez les ruptures de stock.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setIsHistoryModalOpen(true)}
            className="rounded-xl flex items-center gap-2 border-border hover:bg-muted text-xs font-semibold"
          >
            <History className="w-4 h-4 text-muted-foreground" />
            <span className="hidden sm:inline">Historique mouvements</span>
          </Button>

          {!productQuota.allowed ? (
            <Link href="/settings/billing">
              <Button
                className="rounded-xl flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm"
              >
                <Lock className="w-4 h-4" />
                <span>Passer Pro (Limite atteinte)</span>
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleOpenAddModal}
              className="rounded-xl flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel Article</span>
            </Button>
          )}
        </div>
      </div>

      {/* Quota limit warning banner for Free plan */}
      {!productQuota.allowed && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-700 dark:text-amber-400">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Limite de catalogue atteinte ({productsList.length}/10 articles) : </span>
              Le forfait Gratuit permet de gérer jusqu'à 10 articles. Passez au forfait Pro pour un catalogue illimité et des alertes de réapprovisionnement.
            </div>
          </div>
          <Link href="/settings/billing">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 rounded-xl">
              Débloquer Pro (10 000 FCFA)
            </Button>
          </Link>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total References */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Catalogue Articles</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-extrabold font-mono text-foreground">{totalItemsCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {trackedProducts.length} articles physiques traqués
            </p>
          </div>
        </div>

        {/* Stock Purchase Value */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Valeur Stock (Achat)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-extrabold font-mono text-foreground">
              {formatFCFA(totalStockPurchaseValue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Immobilisation marchandises</p>
          </div>
        </div>

        {/* Potential Margin / Sale Value */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Valeur Marchande (Vente)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-extrabold font-mono text-foreground">
              {formatFCFA(totalStockSaleValue)}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-bold">
              <span>Marge potentielle : +{formatFCFA(totalPotentialMargin)}</span>
            </div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className={`rounded-2xl border p-5 shadow-sm flex flex-col justify-between gap-3 transition-colors ${
          lowStockCount > 0 
            ? "border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20" 
            : "border-border bg-card"
        }`}>
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Alertes de Stock</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              lowStockCount > 0 ? "bg-amber-500 text-white animate-pulse" : "bg-muted text-muted-foreground"
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className={`text-2xl lg:text-3xl font-extrabold font-mono ${lowStockCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
              {lowStockCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {outOfStockCount > 0 ? `${outOfStockCount} en rupture totale` : "Aucune rupture critique"}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, SKU ou code-barres..."
            className="pl-10 text-xs md:text-sm bg-background border-border rounded-xl"
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex items-center bg-muted p-1 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setStockStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${stockStatusFilter === "all" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              Tous
            </button>
            <button
              onClick={() => setStockStatusFilter("in_stock")}
              className={`px-3 py-1.5 rounded-lg transition-all ${stockStatusFilter === "in_stock" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              En stock
            </button>
            <button
              onClick={() => setStockStatusFilter("low_stock")}
              className={`px-3 py-1.5 rounded-lg transition-all ${stockStatusFilter === "low_stock" ? "bg-card text-amber-600 shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              Stock bas
            </button>
            <button
              onClick={() => setStockStatusFilter("out_of_stock")}
              className={`px-3 py-1.5 rounded-lg transition-all ${stockStatusFilter === "out_of_stock" ? "bg-card text-rose-600 shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              Rupture
            </button>
          </div>
        </div>
      </div>

      {/* Main Products Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3.5 px-4">Article & Code</th>
                <th className="py-3.5 px-4">Catégorie</th>
                <th className="py-3.5 px-4 text-right">Prix d'Achat</th>
                <th className="py-3.5 px-4 text-right">Prix Vente</th>
                <th className="py-3.5 px-4">Niveau de Stock</th>
                <th className="py-3.5 px-4">État</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.trackStock && product.stockQuantity <= 0;
                const isLowStock = product.trackStock && !isOutOfStock && product.stockQuantity <= product.minStockAlert;
                const marginAmount = product.sellingPrice - product.purchasePrice;
                const marginPercent = product.purchasePrice > 0 
                  ? Math.round((marginAmount / product.purchasePrice) * 100) 
                  : 100;

                return (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors group">
                    {/* Article & SKU */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          !product.trackStock 
                            ? "bg-purple-500/10 text-purple-600" 
                            : isOutOfStock 
                            ? "bg-rose-500/10 text-rose-600" 
                            : isLowStock 
                            ? "bg-amber-500/10 text-amber-600" 
                            : "bg-brand-blue/10 text-brand-blue"
                        }`}>
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {product.sku && (
                              <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                                <Barcode className="w-3 h-3 text-muted-foreground/70" />
                                {product.sku}
                              </span>
                            )}
                            {!product.trackStock && (
                              <span className="text-[10px] font-semibold bg-purple-500/10 text-purple-600 px-1.5 py-0.2 rounded">
                                Service
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted text-foreground">
                        {product.category}
                      </span>
                    </td>

                    {/* Purchase Price */}
                    <td className="py-4 px-4 text-right font-mono text-xs text-muted-foreground">
                      {product.purchasePrice > 0 ? formatFCFA(product.purchasePrice) : "—"}
                    </td>

                    {/* Selling Price & Margin */}
                    <td className="py-4 px-4 text-right">
                      <p className="font-mono font-bold text-foreground text-sm">
                        {formatFCFA(product.sellingPrice)}
                      </p>
                      {product.purchasePrice > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          +{marginPercent}% marge
                        </span>
                      )}
                    </td>

                    {/* Stock Level Bar */}
                    <td className="py-4 px-4 min-w-[170px]">
                      {product.trackStock ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-xs font-bold font-mono">
                            <span className={isOutOfStock ? "text-rose-600" : isLowStock ? "text-amber-600" : "text-foreground"}>
                              {product.stockQuantity} {product.unit}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              Min : {product.minStockAlert}
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                            <div
                              style={{ 
                                width: `${Math.min(100, Math.max(5, (product.stockQuantity / (product.minStockAlert * 3)) * 100))}%` 
                              }}
                              className={`h-full rounded-full transition-all duration-300 ${
                                isOutOfStock ? "bg-rose-600" : isLowStock ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Illimité (Service)</span>
                      )}
                    </td>

                    {/* Stock Status Badge */}
                    <td className="py-4 px-4">
                      {!product.trackStock ? (
                        <Badge variant="outline" className="bg-muted text-muted-foreground text-[11px]">
                          Non stocké
                        </Badge>
                      ) : isOutOfStock ? (
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[11px] font-bold">
                          Rupture
                        </Badge>
                      ) : isLowStock ? (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[11px] font-bold flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> Stock bas
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px] font-bold">
                          En stock
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick stock adjustment buttons */}
                        {product.trackStock && (
                          <>
                            <button
                              onClick={() => handleOpenAdjustModal(product, "in")}
                              title="Ajouter du stock (+)"
                              className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 flex items-center justify-center transition-colors font-bold text-xs"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleOpenAdjustModal(product, "out")}
                              title="Déstocker (-)"
                              className="w-7 h-7 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 flex items-center justify-center transition-colors font-bold text-xs"
                            >
                              -
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleOpenEditModal(product)}
                          title="Modifier l'article"
                          className="w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
                              deleteProduct(product.id);
                              showToast(`Article "${product.name}" supprimé.`);
                            }
                          }}
                          title="Supprimer"
                          className="w-7 h-7 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Aucun article trouvé</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Aucun produit ne correspond à vos filtres de recherche. Ajoutez un nouvel article ou réinitialisez la recherche.
            </p>
            <Button
              onClick={handleOpenAddModal}
              className="mt-4 rounded-xl text-xs font-bold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Créer un premier article
            </Button>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL 1: AJOUTER / MODIFIER UN PRODUIT
      ────────────────────────────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editingProduct ? "Modifier l'article" : "Ajouter un article au catalogue"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Configurez les prix, la catégorie et le suivi du stock en temps réel.
              </p>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Désignation de l'article *
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Terminal TPE Wave & QR Code"
                  className="rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Code Article / SKU
                  </label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Ex: TPE-01"
                    className="rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Catégorie
                  </label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Matériel, Consommable"
                    className="rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Prix d'Achat (Coût FCFA)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                    className="rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Prix de Vente (FCFA) *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              {/* Stock Tracking Toggle */}
              <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Suivre le stock de cet article</p>
                  <p className="text-[11px] text-muted-foreground">Décocher s'il s'agit d'une prestation de service sans déstockage.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.trackStock}
                  onChange={(e) => setFormData({ ...formData, trackStock: e.target.checked })}
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
              </div>

              {formData.trackStock && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Quantité en stock
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                      className="rounded-xl text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Seuil d'alerte min
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.minStockAlert}
                      onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                      className="rounded-xl text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Unité de mesure
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none"
                    >
                      <option value="unité">Unité</option>
                      <option value="pack">Pack</option>
                      <option value="carton">Carton</option>
                      <option value="kg">Kg</option>
                      <option value="litre">Litre</option>
                      <option value="prestation">Prestation</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl text-xs font-bold bg-primary text-primary-foreground"
                >
                  {editingProduct ? "Enregistrer les modifications" : "Ajouter l'article"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL 2: AJUSTEMENT RAPIDE DE STOCK (+/-)
      ────────────────────────────────────────────────────────────────────────── */}
      {isAdjustModalOpen && selectedProductForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsAdjustModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2.5 h-2.5 rounded-full ${adjustData.type === "in" ? "bg-emerald-500" : "bg-amber-500"}`} />
                <h2 className="text-xl font-bold text-foreground">
                  Ajustement de stock
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Article : <strong>{selectedProductForAdjust.name}</strong> (Stock actuel : {selectedProductForAdjust.stockQuantity} {selectedProductForAdjust.unit})
              </p>
            </div>

            <form onSubmit={handleExecuteAdjust} className="flex flex-col gap-4">
              <div className="flex items-center bg-muted p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAdjustData({ ...adjustData, type: "in", reason: "Réapprovisionnement fournisseur" })}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    adjustData.type === "in" ? "bg-card text-emerald-600 shadow-sm font-black" : "text-muted-foreground"
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" /> Entrée (+)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustData({ ...adjustData, type: "out", reason: "Sortie manuelle / Ajustement" })}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    adjustData.type === "out" ? "bg-card text-rose-600 shadow-sm font-black" : "text-muted-foreground"
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" /> Sortie (-)
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Quantité à {adjustData.type === "in" ? "ajouter" : "retirer"} ({selectedProductForAdjust.unit}) *
                </label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={adjustData.quantity}
                  onChange={(e) => setAdjustData({ ...adjustData, quantity: Math.max(1, Number(e.target.value)) })}
                  className="rounded-xl text-base font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Motif du mouvement *
                </label>
                <select
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none"
                >
                  {adjustData.type === "in" ? (
                    <>
                      <option value="Réapprovisionnement fournisseur">Réapprovisionnement fournisseur</option>
                      <option value="Retour client">Retour client</option>
                      <option value="Ajustement inventaire positif">Ajustement inventaire positif</option>
                    </>
                  ) : (
                    <>
                      <option value="Sortie manuelle / Ajustement">Sortie manuelle / Ajustement</option>
                      <option value="Perte ou casse">Perte ou casse</option>
                      <option value="Cadeau d'entreprise / Démo">Cadeau d'entreprise / Démo</option>
                      <option value="Ajustement inventaire négatif">Ajustement inventaire négatif</option>
                    </>
                  )}
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/60 text-xs flex items-center justify-between">
                <span className="text-muted-foreground">Nouveau stock projeté :</span>
                <span className="font-mono font-black text-foreground">
                  {adjustData.type === "in" 
                    ? selectedProductForAdjust.stockQuantity + adjustData.quantity 
                    : Math.max(0, selectedProductForAdjust.stockQuantity - adjustData.quantity)} {selectedProductForAdjust.unit}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl text-xs font-bold bg-primary text-primary-foreground"
                >
                  Valider le mouvement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL 3: HISTORIQUE DES MOUVEMENTS DE STOCK
      ────────────────────────────────────────────────────────────────────────── */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setIsHistoryModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground">Journal des mouvements de stock</h2>
              <p className="text-xs text-muted-foreground">
                Traçabilité des approvisionnements, sorties de caisse et ajustements d'inventaire.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {stockMovementsList.length > 0 ? (
                stockMovementsList.map((mov) => {
                  const isIn = mov.type === "in";
                  return (
                    <div
                      key={mov.id}
                      className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isIn ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                        }`}>
                          {isIn ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{mov.productName}</p>
                          <p className="text-[11px] text-muted-foreground">{mov.notes || "Mouvement régulier"}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono text-xs font-bold ${isIn ? "text-emerald-600" : "text-rose-600"}`}>
                          {isIn ? "+" : "-"}{mov.quantity}
                        </span>
                        <p className="text-[10px] text-muted-foreground">{mov.createdAt}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  Aucun mouvement enregistré pour le moment. Les entrées et sorties de stock s'afficheront ici automatiquement.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border mt-4 flex justify-end">
              <Button
                onClick={() => setIsHistoryModalOpen(false)}
                className="rounded-xl text-xs font-bold"
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
