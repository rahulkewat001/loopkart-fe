import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Sparkles } from '@react-three/drei';

function HaloRing({ position, scale, color, speed }) {
  const ringRef = useRef(null);
  const coreRef = useRef(null);

  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * speed * 0.25;
      ringRef.current.rotation.y += delta * speed;
    }

    if (coreRef.current) {
      coreRef.current.rotation.x -= delta * speed * 0.55;
      coreRef.current.rotation.z += delta * speed * 0.4;
      coreRef.current.position.y = Math.sin(state.clock.elapsedTime * speed) * 0.08;
    }
  });

  return (
    <group ref={ringRef} position={position} scale={scale}>
      <mesh>
        <torusGeometry args={[1.55, 0.045, 32, 140]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} metalness={0.8} roughness={0.18} />
      </mesh>
      <mesh ref={coreRef}>
        <torusKnotGeometry args={[0.52, 0.16, 140, 18]} />
        <meshStandardMaterial color="#dffaf4" emissive="#7dd3fc" emissiveIntensity={0.35} metalness={0.72} roughness={0.25} />
      </mesh>
    </group>
  );
}

function FloatingTag({ position, scale, color, rotation }) {
  const ref = useRef(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.22;
    ref.current.rotation.y += delta * 0.38;
    ref.current.position.z = position[2] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.24;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.55} floatIntensity={0.8}>
      <RoundedBox ref={ref} args={[1, 1, 0.18]} radius={0.12} smoothness={4} position={position} rotation={rotation} scale={scale}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} metalness={0.55} roughness={0.2} />
      </RoundedBox>
    </Float>
  );
}

export default function EcoScene({ variant = 'full' }) {
  const compact = variant === 'compact';

  return (
    <Canvas
      camera={{ position: [0, 0, compact ? 8.4 : 9.4], fov: compact ? 48 : 44 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#030712', 7, 16]} />
      <ambientLight intensity={1.1} />
      <pointLight position={[4, 5, 5]} intensity={55} color="#2dd4bf" />
      <pointLight position={[-5, 2, 4]} intensity={40} color="#38bdf8" />
      <pointLight position={[0, -4, 6]} intensity={24} color="#f59e0b" />

      <Suspense fallback={null}>
        <group scale={compact ? 0.82 : 1}>
          <HaloRing position={[0.1, 0.2, 0]} scale={compact ? 0.82 : 1} color="#2dd4bf" speed={0.35} />
          <HaloRing position={[-2.7, 1.65, -0.8]} scale={0.48} color="#38bdf8" speed={0.48} />
          <HaloRing position={[2.95, -1.5, -1.2]} scale={0.38} color="#f59e0b" speed={0.64} />

          <FloatingTag position={[-3.45, -1.7, 0.6]} scale={0.42} color="#0ea5e9" rotation={[0.2, 0.8, 0.1]} />
          <FloatingTag position={[3.35, 1.55, 0.3]} scale={0.34} color="#22c55e" rotation={[0.5, 0.4, 0.5]} />
          <FloatingTag position={[-1.45, 2.8, -1.2]} scale={0.26} color="#fde68a" rotation={[0.9, 0.2, 0.4]} />
          <FloatingTag position={[1.75, -2.8, -1.4]} scale={0.3} color="#99f6e4" rotation={[0.3, 0.5, 0.9]} />
        </group>
      </Suspense>

      <Sparkles count={compact ? 45 : 85} scale={[12, 8, 7]} speed={0.4} size={1.7} color="#cffafe" />
    </Canvas>
  );
}
