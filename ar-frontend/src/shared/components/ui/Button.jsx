// ─── src/shared/components/ui/Button.jsx ───────────────────────────────────────

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Button component with variant support and premium micro-interactions.
 * - Hover: subtle scale up
 * - Press/Tap: scale(0.97) for responsive feel (Emil Kowalski principle)
 * - Spring animations for natural physics
 * - Extends HTML button element with consistent styling
 */
const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  press: { scale: 0.97 },
};

export function Button({ className, variant = 'default', size = 'default', disabled, ...props }) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background select-none';

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'underline text-primary hover:text-primary/80',
  };

  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10',
  };

  return (
    <motion.button
      className={cn(
        baseClasses,
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.default,
        className
      )}
      variants={buttonVariants}
      initial="rest"
      whileHover={disabled ? undefined : "hover"}
      whileTap={disabled ? undefined : "press"}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.5,
      }}
      disabled={disabled}
      {...props}
    />
  );
}

export default Button;
