// ─── src/features/dashboard/components/Placeholder.jsx ───────────────────────

import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

/**
 * Enhanced placeholder for pages that are not yet implemented.
 * Shows a title, icon, and informative message.
 * Follows UI/UX Pro Max empty state guidelines.
 */
export default function Placeholder({ title }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="flex flex-col items-center justify-center min-h-[60vh] bg-background"
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
      >
        <Construction className="text-primary" size={36} />
      </motion.div>

      <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
        {title}
      </h2>

      <p className="text-sm text-muted-foreground text-center max-w-md">
        This feature is currently under development. We&apos;re working hard to
        bring it to you soon. Check back later for updates.
      </p>

      {/* Decorative dots */}
      <div className="flex items-center gap-1.5 mt-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            className="h-1.5 w-1.5 rounded-full bg-primary/50"
          />
        ))}
      </div>
    </motion.div>
  );
}
