// ─── src/features/dashboard/pages/MenusPage.jsx ───────────────────────────────
// Premium Menu Management – Full API Integration
// Categories CRUD + Menu Items CRUD + Restaurant Selector
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  MenuSquare,
  ChefHat,
  DollarSign,
  Eye,
  Edit3,
  Trash2,
  Loader2,
  X,
  Check,
  FolderPlus,
  Layers,
  Image,
  Tag,
  UtensilsCrossed,
  ChevronDown,
  Power,
  PowerOff,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import apiClient from "../../../shared/lib/axios";
import { Button } from "../../../shared/components/ui/Button";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { toast } from "react-hot-toast";
import { cn } from "../../../shared/lib/utils";

// ─── Animation Variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0, scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// ─── StatCard ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent = "primary", index = 0 }) {
  const accentBg = {
    primary: "from-primary/20 to-primary/5 border-primary/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
    rose: "from-rose-500/20 to-rose-500/5 border-rose-500/20",
  };
  const iconBg = {
    primary: "bg-primary/15 text-primary",
    emerald: "bg-emerald-500/15 text-emerald-400",
    blue: "bg-blue-500/15 text-blue-400",
    amber: "bg-amber-500/15 text-amber-400",
    rose: "bg-rose-500/15 text-rose-400",
  };

  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: index * 0.08 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-sm transition-all duration-500 hover:shadow-xl",
        accentBg[accent]
      )}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground/80">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
        </div>
        <div className={cn("rounded-xl p-3 backdrop-blur-sm shadow-lg", iconBg[accent])}>
          <Icon size={20} />
        </div>
      </div>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
    </motion.div>
  );
}

// ─── Category Badge Chips ────────────────────────────────────────────────────
function CategoryChip({ category, isActive, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(category.id)}
      className={cn(
        "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 border",
        isActive
          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
          : "bg-card/50 text-muted-foreground border-border/60 hover:border-primary/30 hover:text-foreground hover:bg-card/80"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeCategory"
          className="absolute inset-0 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      )}
      <span className="relative z-10">{category.name}</span>
      {category.itemCount > 0 && (
        <span className={cn(
          "relative z-10 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
          isActive ? "bg-white/20 text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {category.itemCount}
        </span>
      )}
    </motion.button>
  );
}

// ─── Menu Item Card ──────────────────────────────────────────────────────────
function MenuItemCard({ item, onEdit, onToggleAvailability, onDelete }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      layout
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Availability indicator */}
      <div className={cn(
        "absolute left-0 top-0 h-full w-1 transition-all duration-300",
        item.isAvailable
          ? "bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-sm shadow-emerald-500/30"
          : "bg-gradient-to-b from-muted-foreground/30 to-muted-foreground/10"
      )} />

      <div className="p-4 pl-5">
        <div className="flex gap-4">
          {/* Image / Placeholder */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl"
          >
            {item.imageUrl && !imgError ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <Image size={20} className="text-primary/50" />
              </div>
            )}
            {/* AR badge */}
            {item.hasArModel && (
              <div className="absolute top-1 right-1 rounded-full bg-primary/80 px-1.5 py-0.5 text-[8px] font-bold text-primary-foreground backdrop-blur-sm">
                AR
              </div>
            )}
          </motion.div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                {item.description && (
                  <p className="text-xs text-muted-foreground/70 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {/* Availability toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onToggleAvailability(item)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                    item.isAvailable
                      ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-muted/30 text-muted-foreground/50 hover:bg-amber-500/10 hover:text-amber-400"
                  )}
                  title={item.isAvailable ? "Mark unavailable" : "Mark available"}
                >
                  {item.isAvailable ? <Power size={12} /> : <PowerOff size={12} />}
                </motion.button>
              </div>
            </div>

            {/* Meta info */}
            <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <DollarSign size={10} className="text-emerald-400" />
                {item.price?.toFixed(2) || "0.00"}
              </span>
              {item.ingredients && (
                <span className="flex items-center gap-1 truncate max-w-[140px]">
                  <Tag size={10} className="text-muted-foreground/50" />
                  {item.ingredients}
                </span>
              )}
              {item.hasArModel && (
                <span className="flex items-center gap-1 text-primary">
                  <Sparkles size={10} />
                  AR Enabled
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(item)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Edit3 size={12} />
            Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(item)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            <Trash2 size={12} />
            Delete
          </motion.button>
          {!item.isAvailable && (
            <span className="ml-auto text-[10px] font-medium text-amber-400/70">Unavailable</span>
          )}
        </div>
      </div>

      {/* Hover glow */}
      <div className={cn(
        "absolute -inset-0.5 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-30 pointer-events-none",
        item.isAvailable ? "bg-primary/15" : "bg-muted-foreground/10"
      )} />
    </motion.div>
  );
}

// ─── Category Dialog ─────────────────────────────────────────────────────────
function CategoryDialog({ isOpen, onClose, category, restaurantId }) {
  const queryClient = useQueryClient();
  const isEditing = !!category;

  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
  });
  const [errors, setErrors] = useState({});

  const handleClose = () => {
    setFormData({ name: "", description: "" });
    setErrors({});
    onClose();
  };

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (isEditing) {
        return apiClient.put(
          `/api/v1/restaurants/${restaurantId}/categories/${category.id}`,
          payload
        );
      }
      return apiClient.post(`/api/v1/restaurants/${restaurantId}/categories`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", restaurantId] });
      toast.success(`Category ${isEditing ? "updated" : "created"} successfully`);
      handleClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Something went wrong";
      if (err.response?.status === 403) toast.error("Plan limit reached. Upgrade to continue.");
      else toast.error(msg);
    },
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-4 z-50 flex items-center justify-center p-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {isEditing ? "Edit Category" : "Add Category"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isEditing ? `Update "${category.name}"` : "Create a new menu category"}
                  </p>
                </div>
                <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Layers size={14} className="text-muted-foreground" />
                    Category Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, name: e.target.value }));
                      if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                    }}
                    placeholder="e.g., Starters, Main Course, Desserts"
                    className={cn(
                      "h-11 w-full rounded-xl border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
                      errors.name ? "border-destructive" : "border-border focus:border-primary/50"
                    )}
                    disabled={mutation.isPending}
                  />
                  {errors.name && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ChefHat size={14} className="text-muted-foreground" />
                    Description (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description of the category..."
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    disabled={mutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <Button type="button" variant="ghost" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending} className="gap-2 bg-primary hover:bg-primary/90">
                    {mutation.isPending ? (
                      <><Loader2 size={16} className="animate-spin" /> {isEditing ? "Saving..." : "Creating..."}</>
                    ) : (
                      <><Check size={16} /> {isEditing ? "Save Changes" : "Add Category"}</>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Menu Item Dialog ────────────────────────────────────────────────────────
function MenuItemDialog({ isOpen, onClose, item, restaurantId, categories }) {
  const queryClient = useQueryClient();
  const isEditing = !!item;

  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price?.toString() || "",
    categoryId: item?.categoryId || item?.category?.id || "",
    ingredients: item?.ingredients || "",
    imageUrl: item?.imageUrl || "",
  });
  const [errors, setErrors] = useState({});

  const handleClose = () => {
    setFormData({
      name: "", description: "", price: "",
      categoryId: "", ingredients: "", imageUrl: "",
    });
    setErrors({});
    onClose();
  };

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (isEditing) {
        return apiClient.put(
          `/api/v1/restaurants/${restaurantId}/menu-items/${item.id}`,
          payload
        );
      }
      return apiClient.post(`/api/v1/restaurants/${restaurantId}/menu-items`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems", restaurantId] });
      toast.success(`Menu item ${isEditing ? "updated" : "created"} successfully`);
      handleClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Something went wrong";
      if (err.response?.status === 403) toast.error("Plan limit reached. Upgrade to continue.");
      else toast.error(msg);
    },
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Please select a category";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      price: Number(formData.price),
      categoryId: formData.categoryId,
      ingredients: formData.ingredients.trim() || undefined,
      imageUrl: formData.imageUrl.trim() || undefined,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-4 z-50 flex items-center justify-center p-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {isEditing ? "Edit Menu Item" : "Add Menu Item"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isEditing ? `Update "${item.name}"` : "Add a new item to your menu"}
                  </p>
                </div>
                <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6 max-h-[60vh] overflow-y-auto">
                {/* Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MenuSquare size={14} className="text-muted-foreground" />
                    Item Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, name: e.target.value }));
                      if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                    }}
                    placeholder="e.g., Butter Chicken, Margherita Pizza"
                    className={cn(
                      "h-11 w-full rounded-xl border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
                      errors.name ? "border-destructive" : "border-border focus:border-primary/50"
                    )}
                    disabled={mutation.isPending}
                  />
                  {errors.name && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">{errors.name}</motion.p>
                  )}
                </div>

                {/* Category + Price row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Layers size={14} className="text-muted-foreground" />
                      Category <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, categoryId: e.target.value }));
                        if (errors.categoryId) setErrors((p) => ({ ...p, categoryId: undefined }));
                      }}
                      className={cn(
                        "h-11 w-full rounded-xl border bg-background px-4 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none",
                        errors.categoryId ? "border-destructive" : "border-border focus:border-primary/50"
                      )}
                      disabled={mutation.isPending}
                    >
                      <option value="">Select category</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">{errors.categoryId}</motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <DollarSign size={14} className="text-muted-foreground" />
                      Price <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => {
                          setFormData((p) => ({ ...p, price: e.target.value }));
                          if (errors.price) setErrors((p) => ({ ...p, price: undefined }));
                        }}
                        placeholder="0.00"
                        className={cn(
                          "h-11 w-full rounded-xl border bg-background pl-8 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
                          errors.price ? "border-destructive" : "border-border focus:border-primary/50"
                        )}
                        disabled={mutation.isPending}
                      />
                    </div>
                    {errors.price && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">{errors.price}</motion.p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ChefHat size={14} className="text-muted-foreground" />
                    Description (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Item description..."
                    rows={2}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    disabled={mutation.isPending}
                  />
                </div>

                {/* Ingredients */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Tag size={14} className="text-muted-foreground" />
                    Ingredients (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.ingredients}
                    onChange={(e) => setFormData((p) => ({ ...p, ingredients: e.target.value }))}
                    placeholder="e.g., Chicken, Butter, Cream, Spices"
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    disabled={mutation.isPending}
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Image size={14} className="text-muted-foreground" />
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="https://res.cloudinary.com/..."
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    disabled={mutation.isPending}
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <Button type="button" variant="ghost" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending} className="gap-2 bg-primary hover:bg-primary/90">
                    {mutation.isPending ? (
                      <><Loader2 size={16} className="animate-spin" /> {isEditing ? "Saving..." : "Creating..."}</>
                    ) : (
                      <><Check size={16} /> {isEditing ? "Save Changes" : "Add Item"}</>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Delete Confirm Dialog ───────────────────────────────────────────────────
function DeleteConfirmDialog({ isOpen, onClose, title, subtitle, onConfirm, isPending }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 z-50 flex items-center justify-center p-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
          >
            <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mb-6 text-sm text-muted-foreground">{subtitle}</p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="ghost" onClick={onClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={onConfirm}
                  disabled={isPending}
                  className="gap-2"
                >
                  {isPending ? (
                    <><Loader2 size={16} className="animate-spin" /> Deleting...</>
                  ) : (
                    <><Trash2 size={16} /> Delete</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Restaurant Selector ─────────────────────────────────────────────────────
function RestaurantSelector({ restaurants, selectedId, onSelect, isLoading }) {
  const [open, setOpen] = useState(false);
  const selected = restaurants?.find((r) => r.id === selectedId);

  if (isLoading) return <Skeleton className="h-11 w-64 rounded-xl" />;
  if (!restaurants?.length) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-11 w-64 items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 text-sm text-foreground transition-colors hover:border-primary/50"
      >
        <span className="truncate">{selected?.name || "Select a restaurant..."}</span>
        <ChevronDown size={16} className={cn("text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
            >
              {restaurants.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { onSelect(r.id); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                    r.id === selectedId
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MenuSquare size={14} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.cuisineType || "Restaurant"}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-20 px-8 backdrop-blur-sm"
    >
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
      >
        <Icon size={36} className="text-primary" />
      </motion.div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-center text-muted-foreground">{subtitle}</p>
      {onAction && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={onAction} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus size={18} />
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function MenusSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" />
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-white/5 animate-pulse" />
          <div className="h-4 w-64 rounded-lg bg-white/5 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0,1,2,3].map(i => <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"><div className="space-y-3"><div className="h-4 w-24 rounded-lg bg-white/5 animate-pulse" /><div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" /></div></div>)}
      </div>
      <div className="flex gap-2">
        {[0,1,2,3].map(i => <div key={i} className="h-9 w-28 rounded-full bg-white/5 animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0,1,2,3,4,5].map(i => <div key={i} className="h-36 rounded-2xl bg-white/5 animate-pulse" />)}
      </div>
    </div>
  );
}

// ─── Main MenusPage ──────────────────────────────────────────────────────────
export default function MenusPage() {
  const queryClient = useQueryClient();

  // ─── Restaurant selection ────────────────────────────────────────────
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState("all");

  // ─── Dialog states ───────────────────────────────────────────────────
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // ─── Search ─────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Fetch restaurants ───────────────────────────────────────────────
  const { data: restaurantsData, isLoading: loadingRestaurants } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => apiClient.get("/api/v1/restaurants").then((r) => r.data.data),
  });
  const restaurants = restaurantsData?.content || restaurantsData || [];
  const restaurantId = selectedRestaurantId || restaurants[0]?.id || null;
  const currentRestaurant = restaurants.find((r) => r.id === restaurantId);

  // Auto-select first restaurant (happens via computed `restaurantId` above)

  // ─── Fetch categories ────────────────────────────────────────────────
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories", restaurantId],
    queryFn: () =>
      apiClient.get(`/api/v1/restaurants/${restaurantId}/categories`)
        .then((r) => r.data.data),
    enabled: !!restaurantId,
  });
  const categories = categoriesData?.content || categoriesData || [];

  // ─── Fetch menu items ────────────────────────────────────────────────
  const { data: itemsData, isLoading: loadingItems } = useQuery({
    queryKey: ["menuItems", restaurantId],
    queryFn: () =>
      apiClient.get(`/api/v1/restaurants/${restaurantId}/menu-items`)
        .then((r) => r.data.data),
    enabled: !!restaurantId,
  });
  const menuItems = itemsData?.content || itemsData || [];

  // ─── Add item count to categories ────────────────────────────────────
  const categoriesWithCount = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      itemCount: menuItems.filter((item) => item.categoryId === cat.id || item.category?.id === cat.id).length,
    }));
  }, [categories, menuItems]);

  // ─── Filter menu items ───────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (activeCategoryId !== "all") {
      items = items.filter((item) => item.categoryId === activeCategoryId || item.category?.id === activeCategoryId);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.ingredients?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [menuItems, activeCategoryId, searchQuery]);

  // ─── Stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: menuItems.length,
    available: menuItems.filter((i) => i.isAvailable).length,
    categories: categories.length,
    arEnabled: menuItems.filter((i) => i.hasArModel).length,
  }), [menuItems, categories]);

  // ─── Category mutations ──────────────────────────────────────────────
  const deleteCategoryMutation = useMutation({
    mutationFn: (id) =>
      apiClient.delete(`/api/v1/restaurants/${restaurantId}/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", restaurantId] });
      toast.success("Category deleted");
      setDeletingCategory(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete category");
    },
  });

  // ─── Menu item mutations ─────────────────────────────────────────────
  const deleteItemMutation = useMutation({
    mutationFn: (id) =>
      apiClient.delete(`/api/v1/restaurants/${restaurantId}/menu-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems", restaurantId] });
      toast.success("Menu item deleted");
      setDeletingItem(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete item");
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }) =>
      apiClient.patch(`/api/v1/restaurants/${restaurantId}/menu-items/${id}/availability`, {
        isAvailable: !isAvailable,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems", restaurantId] });
      toast.success("Availability updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update availability");
    },
  });

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleRestaurantSelect = (id) => {
    setSelectedRestaurantId(id);
    setActiveCategoryId("all");
    setSearchQuery("");
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setShowCategoryDialog(true);
  };

  const handleDeleteCategory = (cat) => {
    setDeletingCategory(cat);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowItemDialog(true);
  };

  const handleDeleteItem = (item) => {
    setDeletingItem(item);
  };

  const handleToggleAvailability = (item) => {
    toggleAvailabilityMutation.mutate({ id: item.id, isAvailable: item.isAvailable });
  };

  // ─── Loading ─────────────────────────────────────────────────────────
  if (loadingRestaurants) {
    return <MenusSkeleton />;
  }

  // ─── No Restaurant ───────────────────────────────────────────────────
  if (!restaurantId && !loadingRestaurants) {
    return (
      <EmptyState
        icon={MenuSquare}
        title="Select a Restaurant"
        subtitle="Choose a restaurant from the dropdown above to manage its menu."
      />
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ─── Hero ────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 backdrop-blur-sm">
        <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-emerald-500/10" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05, rotate: 3 }} className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent ring-1 ring-primary/20 shadow-lg">
              <MenuSquare size={24} className="text-primary" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Menu Management</h1>
              <p className="text-sm text-muted-foreground/80">Manage categories and menu items for your restaurants</p>
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-3">
            <RestaurantSelector
              restaurants={restaurants}
              selectedId={restaurantId}
              onSelect={handleRestaurantSelect}
              isLoading={loadingRestaurants}
            />
            {currentRestaurant && (
              <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {stats.available}/{stats.total} available
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ─── Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={MenuSquare} label="Total Items" value={stats.total} accent="primary" index={0} />
        <StatCard icon={Power} label="Available" value={stats.available} accent="emerald" index={1} />
        <StatCard icon={Layers} label="Categories" value={stats.categories} accent="blue" index={2} />
        <StatCard icon={Sparkles} label="AR Enabled" value={stats.arEnabled} accent="rose" index={3} />
      </div>

      {/* ─── Categories Section ───────────────────────────────────────── */}
      {!loadingCategories && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Categories</h2>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => { setEditingCategory(null); setShowCategoryDialog(true); }}
                size="sm"
                className="gap-1.5 text-xs"
              >
                <FolderPlus size={14} />
                Add Category
              </Button>
            </motion.div>
          </div>

          {/* Categories chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <CategoryChip
              category={{ id: "all", name: "All Items", itemCount: menuItems.length }}
              isActive={activeCategoryId === "all"}
              onClick={() => setActiveCategoryId("all")}
            />
            {categoriesWithCount.map((cat) => (
              <div key={cat.id} className="relative group/cat flex-shrink-0">
                <CategoryChip
                  category={cat}
                  isActive={activeCategoryId === cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                />
                {/* Edit/Delete buttons on hover for each category */}
                <div className="absolute -top-2 -right-2 flex gap-0.5 opacity-0 group-hover/cat:opacity-100 transition-opacity z-10">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); handleEditCategory(cat); }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground shadow-sm"
                  >
                    <Edit3 size={8} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-card border border-border text-red-400 hover:bg-red-500/10 shadow-sm"
                  >
                    <Trash2 size={8} />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Toolbar ──────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/10 bg-card/50 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 backdrop-blur-sm transition-all duration-300 focus:border-primary/40 focus:bg-primary/[0.03] focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
            >
              <X size={14} />
            </motion.button>
          )}
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => { setEditingItem(null); setShowItemDialog(true); }}
            className="gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20"
          >
            <Plus size={16} />
            Add Menu Item
          </Button>
        </motion.div>
      </motion.div>

      {/* ─── Menu Items Area ──────────────────────────────────────────── */}
      {loadingItems ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0,1,2,3,4,5].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : filteredItems.length === 0 && !searchQuery && activeCategoryId === "all" ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No menu items yet"
          subtitle="Start building your menu by adding items. Customers will see these when they scan the QR code."
          actionLabel="Add First Item"
          onAction={() => { setEditingItem(null); setShowItemDialog(true); }}
        />
      ) : filteredItems.length === 0 && searchQuery ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-16"
        >
          <Search size={32} className="mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No items matching "{searchQuery}"</p>
          <button onClick={() => setSearchQuery("")} className="mt-2 text-sm text-primary hover:underline">Clear search</button>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onToggleAvailability={handleToggleAvailability}
                onDelete={handleDeleteItem}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ─── Results count ────────────────────────────────────────────── */}
      {!loadingItems && filteredItems.length > 0 && (
        <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground">
          Showing {filteredItems.length} of {stats.total} item{stats.total !== 1 ? "s" : ""}
          {activeCategoryId !== "all" && ` in selected category`}
        </motion.p>
      )}

      {/* ─── Dialogs ──────────────────────────────────────────────────── */}
      <CategoryDialog
        isOpen={showCategoryDialog}
        onClose={() => { setShowCategoryDialog(false); setEditingCategory(null); }}
        category={editingCategory}
        restaurantId={restaurantId}
      />

      <MenuItemDialog
        isOpen={showItemDialog}
        onClose={() => { setShowItemDialog(false); setEditingItem(null); }}
        item={editingItem}
        restaurantId={restaurantId}
        categories={categories}
      />

      <DeleteConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        title={`Delete "${deletingCategory?.name}"?`}
        subtitle="This will remove the category. Items in this category will not be deleted but will be uncategorized."
        onConfirm={() => deleteCategoryMutation.mutate(deletingCategory.id)}
        isPending={deleteCategoryMutation.isPending}
      />

      <DeleteConfirmDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        title={`Delete "${deletingItem?.name}"?`}
        subtitle="This will permanently delete this menu item. This action cannot be undone."
        onConfirm={() => deleteItemMutation.mutate(deletingItem.id)}
        isPending={deleteItemMutation.isPending}
      />
    </motion.div>
  );
}
