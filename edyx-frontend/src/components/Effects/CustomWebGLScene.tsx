
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// --------------------------------------------------------
// SHADER: The Core (Liquid Plasma / Gyroid)
// --------------------------------------------------------
const CoreMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColorStart: { value: new THREE.Color("#4f46e5") }, // Indigo/Deep Blue
    uColorEnd: { value: new THREE.Color("#ec4899") },   // Pink/Magenta
  },
  vertexShader: `
    varying vec2 vUv;
    varying float vDisplacement;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;

    // Classic Perlin/Simplex Noise (Simplified)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy; 
      vec3 x3 = x0 - D.yyy;      
      i = mod289(i);
      vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857; 
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z); 
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );  
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                    dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vUv = uv;
      vNormal = normal;
      
      // Complex pulsing noise
      float t = uTime * 0.4;
      float noise = snoise(position * 2.5 + vec3(t));
      
      // Secondary finer noise
      float fineNoise = snoise(position * 5.0 - vec3(t * 1.5)) * 0.2;
      
      vDisplacement = noise + fineNoise;
      vPosition = position + normal * vDisplacement * 0.3; // Scale of displacement
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying float vDisplacement;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    uniform float uTime;

    void main() {
      // Base gradient based on displacement
      float mixFactor = smoothstep(-0.5, 0.8, vDisplacement);
      vec3 finalColor = mix(uColorStart, uColorEnd, mixFactor);
      
      // Add "hot spots" where displacement is high (energy peaks)
      float peak = smoothstep(0.4, 0.8, vDisplacement);
      finalColor += vec3(1.0, 0.9, 0.8) * peak * 0.8; // Warm glow
      
      // Fresnel Effect (Rim Light) for 3D glassy look
      vec3 viewDir = normalize(cameraPosition - vPosition); // Approximate logic in shader w/o uniform
      // For standard three.js shader, we usually pass viewDir or calculate from matrices.
      // Use simple normal-z approx for rim in local space or just z-axis for speed
      float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
      rim = pow(rim, 3.0);
      
      finalColor += vec3(0.5, 0.8, 1.0) * rim * 0.6; // Cyan Rim

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

// --------------------------------------------------------
// PARTICLE SHELL (The "Tech" Layer)
// --------------------------------------------------------
const ParticleMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#ffffff") }
  },
  vertexShader: `
    uniform float uTime;
    varying float vAlpha;
    
    void main() {
      vec3 pos = position;
      
      // Orbit animation
      float angle = uTime * 0.2 + position.y * 2.0;
      float radius = length(pos.xz);
      // pos.x = cos(angle) * radius; // Keep original shape but rotate?
      // Better: slight breathing
      
      float breath = sin(uTime * 0.5 + position.y * 10.0) * 0.05;
      pos += normal * breath;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      gl_PointSize = (4.0 / -mvPosition.z);
      
      // Fade based on position or random
      vAlpha = 0.6 + 0.4 * sin(uTime + position.x * 10.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    varying float vAlpha;
    
    void main() {
      // Circular particle
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;
      
      // Soft edge
      float strength = 1.0 - (r * 2.0);
      strength = pow(strength, 2.0);
      
      gl_FragColor = vec4(uColor, vAlpha * strength);
    }
  `,
  transparent: true,
  depthWrite: false,
};


const DigitalCore = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
      meshRef.current.rotation.y = time * 0.1;
    }

    if (pointsRef.current) {
      (pointsRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
      pointsRef.current.rotation.y = -time * 0.05; // Counter-rotate
      pointsRef.current.rotation.z = time * 0.02;
    }
  });

  return (
    <group scale={1.2}>
      {/* The Solid Core - Optimized Geometry */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial args={[CoreMaterial]} />
      </mesh>

      {/* The Data Shell (PointCloud) */}
      <points ref={pointsRef} scale={1.2}>
        <sphereGeometry args={[1, 48, 48]} />
        <shaderMaterial args={[ParticleMaterial]} />
      </points>
    </group>
  );
};


const CustomWebGLScene: React.FC = () => {
  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1, 1.5]} // Cap at 1.5x to save GPU on retina screens
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.5} />

        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <DigitalCore />
        </Float>
      </Canvas>
    </div>
  );
};

export default CustomWebGLScene;
