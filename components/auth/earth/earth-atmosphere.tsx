"use client";

import { useMemo } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  uniform float uIntensity;

  void main() {
    vec3 viewDir = normalize(-vViewPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.1);
    vec3 blueGlow = vec3(0.28, 0.65, 0.95);
    vec3 warmRim = vec3(0.95, 0.96, 1.0);
    vec3 color = mix(blueGlow, warmRim, smoothstep(0.55, 1.0, fresnel));
    float alpha = fresnel * uIntensity;
    gl_FragColor = vec4(color, alpha);
  }
`;

type EarthAtmosphereProps = {
  radius: number;
  segments: number;
  scale: number;
  intensity: number;
};

export function EarthAtmosphere({
  radius,
  segments,
  scale,
  intensity,
}: EarthAtmosphereProps) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uIntensity: { value: intensity },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
      }),
    [intensity],
  );

  return (
    <mesh scale={scale} material={material}>
      <sphereGeometry args={[radius, segments, segments]} />
    </mesh>
  );
}
