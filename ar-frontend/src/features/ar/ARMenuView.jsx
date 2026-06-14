// ─── src/features/ar/ARMenuView.jsx ───────────────────────────────────────────
// Premium AR Menu – Customer-Facing Page
// When customers scan QR code → they see this page
// API: GET /api/v1/public/ar/table/{tableId}, GET /api/v1/public/ar/item/{itemId}
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  Store,
  ChefHat,
  DollarSign,
  UtensilsCrossed,
  Search,
  Sparkles,
  QrCode,
  Image,
  Leaf,
  X,
  AlertTriangle,
  Share2,
  Camera,
} from "lucide-react";
import ARViewer3D from "./components/ARViewer3D";
import apiClient from "../../shared/lib/axios";
import { Button } from "../../shared/components/ui/Button";
import { cn } from "../../shared/lib/utils";

// ─── Animation Variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
};

const categoryVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1, x: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
};

// ─── Category Tabs ───────────────────────────────────────────────────────────
function CategoryTabs({ categories, activeId, onSelect }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect("all")}
        className={cn(
          "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all border",
          activeId === "all"
            ? "bg-primary text-primary-foreground border-primary shadow-md"
            : "bg-white/10 text-white/70 border-white/10 hover:bg-white/20 hover:text-white"
        )}
      >
        All Items
      </motion.button>
      {categories.map((cat) => (
        <motion.button
          key={cat.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all border",
            activeId === cat.id
              ? "bg-primary text-primary-foreground border-primary shadow-md"
              : "bg-white/10 text-white/70 border-white/10 hover:bg-white/20 hover:text-white"
          )}
        >
          {cat.name}
        </motion.button>
      ))}
    </div>
  );
}

// ─── Menu Item Card ──────────────────────────────────────────────────────────
function MenuItemCard({ item, onSelect, onViewAR }) {
  const [imgError, setImgError] = useState(false);

  const handleARClick = (e) => {
    e.stopPropagation();
    if (item.modelUrl) {
      onViewAR(item);
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={() => onSelect(item)}
      className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-4 cursor-pointer transition-all hover:bg-white/15 hover:border-primary/30 active:scale-[0.99]"
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
          {item.imageUrl && !imgError ? (
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover"
              onError={() => setImgError(true)} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-primary/10">
              <Image size={20} className="text-primary/60" />
            </div>
          )}
          {item.hasArModel && item.modelUrl && (
            <button onClick={handleARClick}
              className="absolute top-1 right-1 rounded-full bg-primary/90 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm hover:bg-primary transition-colors z-10"
              title="View in 3D"
            >
              3D
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white truncate">{item.name}</h3>
            <span className="flex items-center gap-1 text-sm font-bold text-emerald-400 tabular-nums shrink-0">
              <DollarSign size={12} />
              {item.price?.toFixed(2) || "0.00"}
            </span>
          </div>
          {item.description && (
            <p className="text-xs text-white/60 line-clamp-2 mt-1">{item.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {item.ingredients && (
              <span className="flex items-center gap-1 text-[10px] text-white/40 truncate max-w-[160px]">
                <Leaf size={9} />
                {item.ingredients}
              </span>
            )}
            {item.hasArModel && item.modelUrl && (
              <button onClick={handleARClick}
                className="flex items-center gap-1 text-[10px] text-primary/80 hover:text-primary transition-colors"
              >
                <Sparkles size={9} />
                View in AR
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute -inset-0.5 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-20 bg-primary/20 pointer-events-none" />
    </motion.div>
  );
}

// ─── Item Detail Modal ───────────────────────────────────────────────────────
function ItemDetailModal({ item, isOpen, onClose, onViewAR }) {
  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-gradient-to-t from-gray-900 to-gray-800 border-t border-white/10 shadow-2xl"
          >
            <div className="p-6 pb-8">
              {/* Handle bar */}
              <div className="flex justify-center mb-4">
                <div className="h-1.5 w-12 rounded-full bg-white/20" />
              </div>

              {/* Image */}
              <div className="relative h-48 rounded-2xl overflow-hidden mb-5 bg-gradient-to-br from-primary/30 to-primary/10">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Image size={48} className="text-primary/40" />
                  </div>
                )}
                <button onClick={onClose} className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
                  <X size={16} />
                </button>
                {item.hasArModel && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                    <Sparkles size={12} /> View in AR
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{item.name}</h2>
                    {item.category && (
                      <p className="text-sm text-white/50 mt-0.5">{item.category.name || item.category}</p>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-emerald-400">${item.price?.toFixed(2)}</span>
                </div>

                {item.description && (
                  <p className="text-sm text-white/70 leading-relaxed">{item.description}</p>
                )}

                {item.ingredients && (
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                    <p className="text-xs font-medium text-white/50 uppercase tracking-wide mb-2">Ingredients</p>
                    <p className="text-sm text-white/80">{item.ingredients}</p>
                  </div>
                )}

                {/* AR Button */}
                {item.hasArModel && item.modelUrl && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => onViewAR(item)}
                      className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/20"
                    >
                      <Sparkles size={16} />
                      View in Augmented Reality
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function ARMenuSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4 space-y-4">
      <div className="h-6 w-48 rounded-lg bg-white/5 animate-pulse" />
      <div className="h-4 w-64 rounded-lg bg-white/5 animate-pulse" />
      <div className="flex gap-2">
        {[0,1,2,3].map(i => <div key={i} className="h-9 w-24 rounded-full bg-white/5 animate-pulse" />)}
      </div>
      <div className="space-y-3">
        {[0,1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)}
      </div>
    </div>
  );
}

// ─── Error State ─────────────────────────────────────────────────────────────
function ARMenuError() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={36} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Menu Unavailable</h2>
        <p className="text-sm text-white/60 mb-6">This menu could not be loaded. Please try scanning the QR code again.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="border-white/20 text-white">
          Try Again
        </Button>
      </div>
    </div>
  );
}

// ─── Main AR Menu View ───────────────────────────────────────────────────────
export default function ARMenuView() {
  const { tableId } = useParams();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [arViewerState, setArViewerState] = useState({ open: false, url: null, name: "" });

  const openARViewer = useCallback((item) => {
    if (item?.modelUrl) {
      setArViewerState({ open: true, url: item.modelUrl, name: item.name });
    }
  }, []);

  const closeARViewer = useCallback(() => {
    setArViewerState({ open: false, url: null, name: "" });
  }, []);

  // ─── Fetch AR menu data ─────────────────────────────────────────────
  const { data: menuData, isLoading, error } = useQuery({
    queryKey: ["arMenu", tableId],
    queryFn: () => apiClient.get(`/api/v1/public/ar/table/${tableId}`).then((r) => r.data.data),
    enabled: !!tableId,
    retry: 1,
  });

  // Extract data
  const restaurant = menuData?.restaurant || menuData;
  const categories = menuData?.categories || [];
  const items = menuData?.items || menuData?.menuItems || [];

  // Filter items
  const filteredItems = useMemo(() => {
    let result = items;
    if (activeCategory !== "all") {
      result = result.filter((item) => item.categoryId === activeCategory || item.category?.id === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i) =>
        i.name?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, activeCategory, searchQuery]);

  // Loading
  if (isLoading) return <ARMenuSkeleton />;

  // Error
  if (error) return <ARMenuError />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* ─── Restaurant Header ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 pt-12 pb-6 px-4">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative z-10">
          {/* Restaurant name + info */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 ring-1 ring-primary/20 shadow-lg">
              <Store size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{restaurant?.name || "Restaurant Menu"}</h1>
              <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                {restaurant?.cuisineType && (
                  <span className="flex items-center gap-1">
                    <ChefHat size={10} />{restaurant.cuisineType}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <QrCode size={10} />Table Menu
                </span>
              </div>
            </div>
          </div>

          {/* Search + Share */}
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 rounded-xl bg-white/10 border border-white/10 px-4 pl-10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all"
              />
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>
            <motion.button whileTap={{ scale: 0.9 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10 text-white/60 hover:bg-white/20 transition-all">
              <Share2 size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ─── Categories ─────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <div className="px-4 py-3 border-t border-white/5">
          <CategoryTabs categories={categories} activeId={activeCategory} onSelect={setActiveCategory} />
        </div>
      )}

      {/* ─── Menu Items ─────────────────────────────────────────────────── */}
      <div className="px-4 py-4 pb-24">
        {filteredItems.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <UtensilsCrossed size={36} className="text-white/20 mb-4" />
            <p className="text-white/60 text-sm">
              {searchQuery ? `No items matching "${searchQuery}"` : "No menu items available"}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="mt-2 text-xs text-primary/80 hover:text-primary">
                Clear search
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onSelect={setSelectedItem} onViewAR={openARViewer} />
            ))}
          </motion.div>
        )}
      </div>

      {/* ─── Item Detail Modal ─────────────────────────────────────────── */}
      <ItemDetailModal item={selectedItem} isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} onViewAR={openARViewer} />

      {/* ─── Bottom Bar ────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent pt-6 pb-4 px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2">
            <Camera size={14} className="text-primary" />
            <span className="text-xs text-white/70">Point camera at AR-enabled item to view in 3D</span>
          </div>
        </div>
      </div>

      {/* ─── AR 3D Model Viewer ────────────────────────────────────────── */}
      <ARViewer3D
        isOpen={arViewerState.open}
        onClose={closeARViewer}
        modelUrl={arViewerState.url}
        itemName={arViewerState.name}
      />
    </div>
  );
}
