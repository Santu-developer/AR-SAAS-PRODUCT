// ─── src/features/ar/components/ARViewer3D.jsx ─────────────────────────
// Premium WebAR 3D Model Viewer
// Full-screen GLTF/GLB viewer with OrbitControls, auto-rotate, loading/error states
// Uses @react-three/fiber and @react-three/drei
// ────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, Suspense, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Environment, ContactShadows, Html, useProgress } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCw, ZoomIn, ZoomOut, Loader2, AlertTriangle, RefreshCw, Maximize2 } from "lucide-react";
import { cn } from "../../../shared/lib/utils";

// ─── Loading Progress ────────────────────────────────────────────────────────
function Loader() {
  const { progress, active } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Loader2 size={32} className="animate-spin text-primary" />
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ boxShadow: ["0 0 0 0 rgba(99,102,241,0.4)", "0 0 0 15px rgba(99,102,241,0)"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-[10px] font-medium text-white/70 tabular-nums">{Math.round(progress)}%</span>
        </div>
        <p className="text-xs text-white/40">Loading 3D model...</p>
      </div>
    </Html>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────
function ErrorState({ onRetry, onClose }) {
  return (
    <Html center>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 text-center max-w-[240px]"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Failed to load 3D model</p>
          <p className="text-xs text-white/50 mt-1">The model may be unavailable or broken</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose}
            className="rounded-xl bg-white/10 px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/20 transition-colors"
          >Close</button>
          <button onClick={onRetry}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/80 transition-colors flex items-center gap-1.5"
          ><RefreshCw size={12} />Retry</button>
        </div>
      </motion.div>
    </Html>
  );
}

// ─── Model Scene ──────────────────────────────────────────────────────────────
function Model({ url, onLoad }) {
  const { scene } = useGLTF(url, true);

  useEffect(() => {
    if (scene) {
      onLoad?.();
    }
  }, [scene, onLoad]);

  return (
    <>
      {/* Environment lighting for realistic reflections */}
      <Environment preset="studio" environmentIntensity={0.6} />

      {/* Ambient fill */}
      <ambientLight intensity={0.4} />

      {/* Key light */}
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <directionalLight position={[-3, 4, -5]} intensity={0.5} />

      {/* Rim light */}
      <directionalLight position={[0, -2, -8]} intensity={0.3} />

      {/* Center and display the model */}
      <Center center top>
        <primitive
          object={scene}
          scale={1}
          position={[0, 0, 0]}
        />
      </Center>

      {/* Subtle contact shadow */}
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.3}
        scale={6}
        blur={3}
        far={4}
      />
    </>
  );
}

// ─── Scene Error Boundary (catches GLTF parse errors) ────────────────────────
class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn("[3D Viewer] Scene error:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          onRetry={() => {
            this.setState({ hasError: false });
            this.props.onRetry?.();
          }}
          onClose={this.props.onClose}
        />
      );
    }
    return this.props.children;
  }
}

// ─── Main ARViewer3D Component ───────────────────────────────────────────────
export default function ARViewer3D({ isOpen, onClose, modelUrl, itemName }) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const controlsRef = useRef(null);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    setHasError(false);
  }, []);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setLoaded(false);
    setRetryKey((k) => k + 1);
  }, []);

  const handleZoomIn = useCallback(() => {
    if (controlsRef.current) {
      const cam = controlsRef.current.object;
      const dir = cam.position.clone().normalize();
      cam.position.add(dir.multiplyScalar(-0.5));
      controlsRef.current.update();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (controlsRef.current) {
      const cam = controlsRef.current.object;
      const dir = cam.position.clone().normalize();
      cam.position.add(dir.multiplyScalar(0.5));
      controlsRef.current.update();
    }
  }, []);

  if (!modelUrl) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
          />

          {/* Viewer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
            className="fixed inset-0 z-50 flex flex-col"
          >
            {/* ─── Top Bar ────────────────────────────────────────────── */}
            <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center gap-3">
                <button onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
                >
                  <X size={18} />
                </button>
                <div>
                  <p className="text-sm font-semibold text-white">{itemName || "3D Model"}</p>
                  {loaded && <p className="text-[10px] text-white/50">Drag to rotate • Scroll to zoom</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom controls */}
                <button onClick={handleZoomIn}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20 hover:text-white transition-all"
                  title="Zoom in"
                ><ZoomIn size={16} /></button>
                <button onClick={handleZoomOut}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20 hover:text-white transition-all"
                  title="Zoom out"
                ><ZoomOut size={16} /></button>
                <button onClick={() => setAutoRotate(!autoRotate)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl backdrop-blur-sm transition-all",
                    autoRotate ? "bg-primary/30 text-primary" : "bg-white/10 text-white/50 hover:bg-white/20"
                  )}
                  title={autoRotate ? "Disable auto-rotate" : "Enable auto-rotate"}
                ><RotateCw size={16} className={cn("transition-transform duration-700", autoRotate && "rotate-180")} /></button>
              </div>
            </div>

            {/* ─── 3D Canvas ──────────────────────────────────────────── */}
            <div className="flex-1 relative">
              <div key={retryKey} className="absolute inset-0">
                <Canvas
                  camera={{ position: [0, 1.5, 4], fov: 40 }}
                  dpr={[1, 1.5]}
                  gl={{ antialias: true, alpha: true }}
                  style={{ background: "transparent" }}
                >
                  {/* Loading progress */}
                  <Suspense fallback={<Loader />}>
                    <SceneErrorBoundary onClose={onClose} onRetry={handleRetry}>
                      <Model
                        url={modelUrl}
                        onLoad={handleLoad}
                      />
                    </SceneErrorBoundary>
                  </Suspense>

                  {/* Controls */}
                  {!hasError && (
                    <OrbitControls
                      ref={controlsRef}
                      autoRotate={autoRotate}
                      autoRotateSpeed={4}
                      enablePan={false}
                      minDistance={1.5}
                      maxDistance={12}
                      minPolarAngle={Math.PI / 6}
                      maxPolarAngle={Math.PI / 1.5}
                      enableDamping
                      dampingFactor={0.1}
                    />
                  )}
                </Canvas>
              </div>

              {/* Error overlay (when not in Canvas) */}
              {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <ErrorState onRetry={handleRetry} onClose={onClose} />
                </div>
              )}

              {/* Bottom gradient hint */}
              {loaded && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent py-4 px-4">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-md px-5 py-2 border border-white/10">
                      <Maximize2 size={12} className="text-primary/70" />
                      <span className="text-[11px] text-white/60">Drag to explore • Pinch to zoom</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
