import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, CreditCard, Upload } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "New Restaurant",
      icon: Plus,
      onClick: () => navigate("/restaurants"),
    },
    {
      label: "Upgrade Plan",
      icon: CreditCard,
      onClick: () => navigate("/subscription"),
    },
    {
      label: "Upload 3D",
      icon: Upload,
      onClick: () => alert("3D upload coming soon"),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex items-center gap-3"
    >
      {actions.map((action) => (
        <Button
          key={action.label}
          onClick={action.onClick}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <action.icon size={16} />
          <span className="text-sm font-medium">{action.label}</span>
        </Button>
      ))}
    </motion.div>
  );
}