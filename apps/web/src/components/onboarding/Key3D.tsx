import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, Sphere } from '@react-three/drei';
import { Mesh, Group } from 'three';
import { motion } from 'framer-motion';
import { ANIMATION_TIMING, EASING, MATERIALS, CONTEXT_ANIMATIONS, COMPONENT_STANDARDS } from '../../design/tokens';

interface Key3DProps {
  name?: string;
  className?: string;
}

function AnimatedKey({ name = '' }: { name: string }) {
  const groupRef = useRef<Group>(null);
  const keyRef = useRef<Mesh>(null);
  const [isEngraving, setIsEngraving] = useState(false);

  // Gentle swaying animation using design tokens
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      groupRef.current.rotation.y = Math.sin(time * COMPONENT_STANDARDS.key3d.swayingSpeed) * CONTEXT_ANIMATIONS.idle.intensity;
      groupRef.current.rotation.z = Math.sin(time * COMPONENT_STANDARDS.key3d.swayingSpeed * 1.3) * CONTEXT_ANIMATIONS.idle.intensity * 0.3;
    }
  });

  // Trigger engraving animation when name changes using design tokens
  useMemo(() => {
    if (name.trim()) {
      setIsEngraving(true);
      const timer = setTimeout(() => setIsEngraving(false), COMPONENT_STANDARDS.key3d.engravingDuration * 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [name]);

  return (
    <group ref={groupRef}>
      {/* Key shaft */}
      <mesh ref={keyRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 3, 16]} />
        <meshStandardMaterial {...MATERIALS.gold} />
      </mesh>

      {/* Key head */}
      <mesh position={[-1.8, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.2, 16]} />
        <meshStandardMaterial {...MATERIALS.gold} />
      </mesh>

      {/* Decorative pattern on key head */}
      <mesh position={[-1.8, 0, 0.12]}>
        <cylinderGeometry args={[0.4, 0.4, 0.05, 16]} />
        <meshStandardMaterial
          color="#FFA500"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Key teeth */}
      <mesh position={[1.3, 0, 0]}>
        <boxGeometry args={[0.4, 0.25, 0.1]} />
        <meshStandardMaterial {...MATERIALS.gold} />
      </mesh>

      {/* Individual teeth cuts */}
      <mesh position={[1.4, 0.1, 0]}>
        <boxGeometry args={[0.05, 0.05, 0.12]} />
        <meshStandardMaterial {...MATERIALS.gold} />
      </mesh>

      <mesh position={[1.4, -0.1, 0]}>
        <boxGeometry args={[0.05, 0.05, 0.12]} />
        <meshStandardMaterial {...MATERIALS.gold} />
      </mesh>

      <mesh position={[1.2, 0.15, 0]}>
        <boxGeometry args={[0.05, 0.05, 0.12]} />
        <meshStandardMaterial {...MATERIALS.gold} />
      </mesh>

      {/* Engraving text */}
      <Text
        position={[-1.8, 0, 0.25]}
        fontSize={0.25}
        color="#8B4513"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {name || 'For ___'}
      </Text>

      {/* Engraving effect */}
      {isEngraving && (
        <mesh position={[-1.8, 0, 0.25]}>
          <planeGeometry args={[1.2, 0.3]} />
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={0.8}
            side={2}
          />
        </mesh>
      )}

      {/* Magical sparkles */}
      {name.trim() && [...Array(COMPONENT_STANDARDS.key3d.sparkleCount)].map((_, i) => (
        <Sphere key={i} args={[0.03, 8, 8]} position={[
          -1.8 + (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          0.25 + (Math.random() - 0.5) * 0.5
        ]}>
          <meshBasicMaterial
            color={MATERIALS.gold.color}
            transparent
            opacity={0.8}
          />
        </Sphere>
      ))}

      {/* Light beam effect */}
      {isEngraving && (
        <pointLight
          position={[-1.8, 0, 0.25]}
          intensity={2}
          color="#FFFFFF"
          distance={3}
        />
      )}
    </group>
  );
}

export default function Key3D({ name = '', className = '' }: Key3DProps) {
  return (
    <motion.div
      className={`w-full h-64 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: ANIMATION_TIMING.slow, ease: EASING.liquid }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight
          position={[-3, 2, 2]}
          intensity={0.8}
          color="#FFE4B5"
        />

        <AnimatedKey name={name} />

        <Environment preset="studio" />
      </Canvas>
    </motion.div>
  );
}