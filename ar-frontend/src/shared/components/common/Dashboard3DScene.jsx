// ─── src/shared/components/common/Dashboard3DScene.jsx ────────────────────
// Premium CSS-Only Animated Background for Dashboard Pages
// Zero WebGL dependency – no context loss, works on every device
// Floating particles + gradient orbs + subtle geometric shapes
// ────────────────────────────────────────────────────────────────────────────

import { memo } from 'react';
import { motion } from 'framer-motion';

// ─── Floating Orb ────────────────────────────────────────────────────────────
function Orb({ size, color, position, duration, delay, blur }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
      className="absolute pointer-events-none"
      style={{
        left: position[0],
        top: position[1],
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        filter: `blur(${blur}px)`,
        willChange: 'transform',
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: 'inherit', filter: 'inherit' }}
        animate={{
          x: [0, 25, -15, 10, 0],
          y: [0, -20, 18, -10, 0],
          scale: [1, 1.05, 0.97, 1.02, 1],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        }}
      />
    </motion.div>
  );
}

// ─── Particles ───────────────────────────────────────────────────────────────
const particles = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 1,
  duration: Math.random() * 10 + 8,
  delay: Math.random() * 5,
  xMove: (Math.random() - 0.5) * 30,
  yMove: (Math.random() - 0.5) * 30,
  opacity: Math.random() * 0.3 + 0.08,
}));

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-400/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            x: [0, p.xMove * 0.3, -p.xMove * 0.2, 0],
            y: [0, p.yMove * 0.3, -p.yMove * 0.2, 0],
            opacity: [p.opacity, p.opacity * 1.6, p.opacity * 0.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

// ─── Decorative Shape ────────────────────────────────────────────────────────
function Shape({ size, position, borderColor, duration, delay, radius = '50%' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1.5, delay, ease: 'easeOut' }}
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        left: position[0],
        top: position[1],
        borderRadius: radius,
        border: `1px solid ${borderColor}`,
        willChange: 'transform',
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          borderRadius: radius,
          border: `1px solid ${borderColor}`,
          opacity: 0.4,
        }}
        animate={{ rotate: [0, 360], scale: [1, 1.08, 1] }}
        transition={{ duration: duration * 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
}

// ─── Subtle Grid Pattern ─────────────────────────────────────────────────────
function GridPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.015]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
const Dashboard3DScene = memo(function Dashboard3DScene() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      {/* Gradient orbs */}
      <Orb
        size={450}
        color="radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)"
        position={['-8%', '-10%']}
        duration={14}
        delay={0}
        blur={90}
      />
      <Orb
        size={350}
        color="radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)"
        position={['75%', '65%']}
        duration={16}
        delay={1}
        blur={80}
      />
      <Orb
        size={280}
        color="radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 70%)"
        position={['20%', '70%']}
        duration={12}
        delay={0.5}
        blur={70}
      />
      <Orb
        size={200}
        color="radial-gradient(circle, rgba(236, 72, 153, 0.05) 0%, transparent 70%)"
        position={['85%', '15%']}
        duration={13}
        delay={2}
        blur={60}
      />

      {/* Decorative shapes */}
      <Shape
        size={150}
        position={['10%', '25%']}
        borderColor="rgba(139, 92, 246, 0.06)"
        duration={22}
        delay={0.3}
      />
      <Shape
        size={100}
        position={['80%', '75%']}
        borderColor="rgba(59, 130, 246, 0.05)"
        duration={25}
        delay={0.8}
        radius="30%"
      />
      <Shape
        size={70}
        position={['50%', '85%']}
        borderColor="rgba(6, 182, 212, 0.04)"
        duration={18}
        delay={1.2}
      />
      <Shape
        size={120}
        position={['30%', '10%']}
        borderColor="rgba(236, 72, 153, 0.04)"
        duration={20}
        delay={0.5}
        radius="40%"
      />

      {/* Particles */}
      <Particles />

      {/* Subtle grid */}
      <GridPattern />

      {/* Edge fade overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/20 to-background/80" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
});

export default Dashboard3DScene;
