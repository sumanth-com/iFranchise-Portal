"use client";

import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { cn } from "@/lib/utils";

import { EarthGlobe } from "./earth-globe";
import { EarthLoader } from "./earth-loader";

type EarthCanvasProps = {
  className?: string;
  mini?: boolean;
};

export function EarthCanvas({ className, mini = false }: EarthCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const handleReady = useCallback(() => setIsReady(true), []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setIsActive(false);
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setIsActive(rect.bottom > 0 && rect.top < window.innerHeight);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting && !document.hidden);
      },
      { threshold: 0.05, rootMargin: "50px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setIsReady(false);
  }, [mini]);

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
      {!isReady ? <EarthLoader mini={mini} /> : null}
      <Canvas
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          isReady ? "opacity-100" : "opacity-0",
        )}
        frameloop={isActive && isReady ? "always" : "demand"}
        dpr={mini ? [1, 1.5] : [1, 2]}
        camera={{
          position: mini ? [0, 0, 3.6] : [0, 0, 9.6],
          fov: mini ? 50 : 34,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        style={{ background: "transparent" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.78;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <hemisphereLight
          args={["#87CEEB", "#0a1428", mini ? 0.55 : 0.65]}
        />
        <ambientLight intensity={mini ? 0.45 : 0.5} color="#e8f4ff" />
        <directionalLight
          position={mini ? [16, 2, 4] : [24, 2, 3]}
          intensity={mini ? 2.8 : 4.2}
          color="#fffaf0"
        />
        <directionalLight
          position={mini ? [12, 0, -6] : [18, 0, -10]}
          intensity={mini ? 0.8 : 1.4}
          color="#93c5fd"
        />
        <directionalLight
          position={mini ? [-12, -2, 6] : [-16, -3, 8]}
          intensity={mini ? 0.15 : 0.18}
          color="#1e3a5f"
        />
        {!mini ? (
          <Stars
            radius={60}
            depth={30}
            count={500}
            factor={2.8}
            saturation={0}
            fade
            speed={0.15}
          />
        ) : null}
        <Suspense fallback={null}>
          <EarthGlobe
            isActive={isActive}
            mini={mini}
            onReady={handleReady}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
