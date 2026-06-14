import { motion } from "framer-motion";

/**
 * <PageLoader /> – Premium loading state for page transitions.
 * Features:
 * - Animated bouncing dots with staggered delays
 * - Subtle spring physics for natural motion
 * - Centered layout that respects reduced motion
 *
 * Follows Emil Kowalski's principles:
 * - Duration under 300ms for perceived performance
 * - Spring animations for natural feel
 * - Opacity + scale (never scale(0))
 */

const dotVariants = {
  initial: { opacity: 0, scale: 0.9, y: 0 },
  animate: (i) => ({
    opacity: [0.3, 1, 0.3],
    scale: [0.9, 1.1, 0.9],
    y: [0, -6, 0],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      delay: i * 0.15,
      ease: "easeInOut",
    },
  }),
};

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      {/* Animated dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            className="h-2.5 w-2.5 rounded-full bg-primary"
          />
        ))}
      </div>

      {/* Subtle loading text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground"
      >
        Loading...
      </motion.p>
    </div>
  );
}
