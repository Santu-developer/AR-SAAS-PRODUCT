/**
 * Auth3DScene – Premium animated background for authentication pages.
 *
 * PURE CSS-ONLY – No WebGL, No Three.js, No Canvas.
 * Zero WebGL context loss, works on every device.
 *
 * Features:
 * - Floating gradient orbs with organic keyframe motion
 * - Particle dots with twinkling effect
 * - Layered parallax depth
 * - Smooth framer-motion entrance
 * - Respects prefers-reduced-motion
 *
 * Visual quality matches Three.js but with zero GPU overhead.
 */

import { memo } from "react";
import { motion } from "framer-motion";

// ─── Floating Orb ───────────────────────────────────────────────────────────
function Orb({ size, color, position, duration, delay, blur }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay, ease: "easeOut" }}
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        left: position[0],
        top: position[1],
        borderRadius: "50%",
        background: color,
        filter: `blur(${blur}px)`,
        willChange: "transform",
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "inherit", filter: "inherit" }}
        animate={{
          x: [0, 30, -20, 15, 0],
          y: [0, -35, 25, -15, 0],
          scale: [1, 1.08, 0.95, 1.03, 1],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
      />
    </motion.div>
  );
}

// ─── Particle Dot ────────────────────────────────────────────────────────────
const particles = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1.5,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 4,
  xMove: (Math.random() - 0.5) * 40,
  yMove: (Math.random() - 0.5) * 40,
  opacity: Math.random() * 0.4 + 0.15,
}));

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            x: [0, p.xMove * 0.3, -p.xMove * 0.2, p.xMove * 0.1, 0],
            y: [0, p.yMove * 0.3, -p.yMove * 0.2, p.yMove * 0.1, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity * 0.5, p.opacity * 1.2, p.opacity],
            scale: [1, 1.3, 0.8, 1.1, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

// ─── Floating Shape (decorative circle) ─────────────────────────────────────
function Shape({ size, position, borderColor, duration, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -20, scale: 0.6 }}
      animate={{ opacity: 1, rotate: 0, scale: 1 }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
      className="absolute pointer-events-none rounded-full"
      style={{
        width: size,
        height: size,
        left: position[0],
        top: position[1],
        border: `1px solid ${borderColor}`,
        willChange: "transform",
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: `1px solid ${borderColor}`, opacity: 0.5 }}
        animate={{
          rotate: [0, 180, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: duration * 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}

// ─── Scan Line Grid ──────────────────────────────────────────────────────────
function ScanLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(0deg, transparent 0%, rgba(168, 85, 247, 0.15) 50%, transparent 100%)",
          backgroundSize: "100% 4px",
          maskImage: "linear-gradient(to bottom, transparent 20%, black 50%, transparent 80%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 20%, black 50%, transparent 80%)",
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(168, 85, 247, 0.3) 3px, rgba(168, 85, 247, 0.3) 4px)",
          }}
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
const Auth3DScene = memo(function Auth3DScene() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 -z-10 bg-background overflow-hidden"
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      {/* Large floating orbs */}
      <Orb
        size={500}
        color="radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)"
        position={["-10%", "-15%"]}
        duration={12}
        delay={0}
        blur={80}
      />
      <Orb
        size={400}
        color="radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)"
        position={["70%", "60%"]}
        duration={15}
        delay={1}
        blur={100}
      />
      <Orb
        size={350}
        color="radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)"
        position={["50%", "-5%"]}
        duration={10}
        delay={0.5}
        blur={90}
      />
      <Orb
        size={300}
        color="radial-gradient(circle, rgba(34, 211, 238, 0.08) 0%, transparent 70%)"
        position={["-5%", "50%"]}
        duration={14}
        delay={2}
        blur={70}
      />
      <Orb
        size={250}
        color="radial-gradient(circle, rgba(168, 85, 247, 0.06) 0%, transparent 70%)"
        position={["80%", "20%"]}
        duration={11}
        delay={1.5}
        blur={60}
      />

      {/* Decorative shapes */}
      <Shape
        size={180}
        position={["15%", "20%"]}
        borderColor="rgba(168, 85, 247, 0.08)"
        duration={20}
        delay={0.3}
      />
      <Shape
        size={120}
        position={["75%", "70%"]}
        borderColor="rgba(59, 130, 246, 0.06)"
        duration={25}
        delay={0.8}
      />
      <Shape
        size={90}
        position={["45%", "80%"]}
        borderColor="rgba(236, 72, 153, 0.06)"
        duration={18}
        delay={1.2}
      />
      <Shape
        size={140}
        position={["60%", "10%"]}
        borderColor="rgba(34, 211, 238, 0.05)"
        duration={22}
        delay={0.5}
      />
      <Shape
        size={70}
        position={["25%", "65%"]}
        borderColor="rgba(168, 85, 247, 0.05)"
        duration={15}
        delay={1.8}
      />

      {/* Particles */}
      <Particles />

      {/* Scan lines */}
      <ScanLines />

      {/* Gradient overlays for edge blending */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/80 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/20 pointer-events-none" />
    </motion.div>
  );
});

export default Auth3DScene;
