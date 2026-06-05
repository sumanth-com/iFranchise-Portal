"use client";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { EarthAtmosphere } from "./earth-atmosphere";

const EARTH_TEXTURE = "/textures/earth-blue-marble.jpg";

type EarthGlobeProps = {
  isActive: boolean;
  mini?: boolean;
  onReady?: () => void;
};

export function EarthGlobe({
  isActive,
  mini = false,
  onReady,
}: EarthGlobeProps) {
  const spinRef = useRef<THREE.Group>(null);

  const texture = useTexture(EARTH_TEXTURE);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    onReady?.();
  }, [onReady, texture]);

  const segments = mini ? 32 : 72;
  const radius = mini ? 1.35 : 2.5;

  const earthMaterial = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        map: texture,
        specular: new THREE.Color("#3b82f6"),
        shininess: 28,
        color: new THREE.Color("#ffffff"),
      }),
    [texture],
  );

  const miniAtmosphereMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#38BDF8",
        transparent: true,
        opacity: 0.14,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );

  useFrame((_, delta) => {
    if (!spinRef.current || !isActive) return;

    const cappedDelta = Math.min(delta, 0.05);
    spinRef.current.rotation.y += cappedDelta * (mini ? 0.04 : 0.038);
  });

  return (
    <group
      ref={spinRef}
      position={[0, 0, 0]}
      rotation={mini ? [0.1, 1.6, 0] : [0.08, 1.72, 0]}
    >
      <mesh material={earthMaterial}>
        <sphereGeometry args={[radius, segments, segments]} />
      </mesh>
      {!mini ? (
        <>
          <EarthAtmosphere
            radius={radius}
            segments={segments}
            scale={1.018}
            intensity={0.34}
          />
          <EarthAtmosphere
            radius={radius}
            segments={segments / 2}
            scale={1.032}
            intensity={0.14}
          />
        </>
      ) : (
        <mesh scale={1.02} material={miniAtmosphereMaterial}>
          <sphereGeometry args={[radius, segments / 2, segments / 2]} />
        </mesh>
      )}
    </group>
  );
}
