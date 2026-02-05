
import { useRef, Suspense } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";


const FlagShader = {
  uniforms: {
    uTime: { value: 0 },
    uTexture: { value: null }
  },
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Wave effect
      float wave = sin(pos.x * 5.0 + uTime * 3.0) * 0.1;
      float wave2 = sin(pos.y * 3.0 + uTime * 2.0) * 0.05;
      pos.z += wave + wave2;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    varying vec2 vUv;
    
    void main() {
      // Sample the texture
      vec4 textureColor = texture2D(uTexture, vUv);
      
      // Add shadow/lighting fake based on uv (Depth)
      float shadow = 0.9 + 0.1 * sin(vUv.x * 10.0);
      
      gl_FragColor = vec4(textureColor.rgb * shadow, 1.0);
    }
  `
};


const EarthShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorWater: { value: new THREE.Color("#1e40af") }, // Deep Blue
    uColorLand: { value: new THREE.Color("#10b981") },  // Emerald Green
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPos;
    
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColorWater;
    uniform vec3 uColorLand;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPos;

    // Simplex Noise (simplified)
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
       // Simple continents via noise
       float noise = snoise(vPos * 2.0); 
       vec3 color = mix(uColorWater, uColorLand, step(0.1, noise)); // Threshold for land

       // Atmosphere rim
       float rim = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
       color += vec3(0.4, 0.6, 1.0) * pow(rim, 4.0) * 0.5;

       gl_FragColor = vec4(color, 1.0);
    }
  `
}



const FlagMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  // Load the texture
  const texture = useLoader(THREE.TextureLoader, "/indian-flag.jpg");

  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} rotation={[0.1, 0, 0]}>
      <planeGeometry args={[2, 1.3, 32, 32]} />
      <shaderMaterial
        args={[FlagShader]}
        uniforms-uTexture-value={texture}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const EarthMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.2, 32, 32]} />
      <shaderMaterial args={[EarthShader]} />
    </mesh>
  )
}

export const WavingFlagConfig = { fov: 40, cameraPos: [0, 0, 3] };
export const WavingFlag = () => (
  <Suspense fallback={null}>
    <FlagMesh />
  </Suspense>
);

export const SpinningEarthConfig = { fov: 45, cameraPos: [0, 0, 4] };
export const SpinningEarth = () => <EarthMesh />
