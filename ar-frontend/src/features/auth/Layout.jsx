import { motion } from "framer-motion";

/**
 * Auth layout wrapper with premium page transition animations.
 * - Spring-based for natural feel (Emil Kowalski principle)
 * - Custom easing curves for polished entrance/exit
 * - Opacity + translate (never scale(0)) for smooth reveals
 *
 * Follows motion design best practices:
 * - Duration under 300ms for UI elements
 * - ease-out for entering (feels responsive)
 * - Uses transform/opacity only (GPU accelerated)
 */
export default function AuthLayout({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 28,
        mass: 0.8,
      }}
    >
      {children}
    </motion.div>
  );
}
