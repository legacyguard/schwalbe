import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Environment } from '@react-three/drei';
import { Mesh, Group } from 'three';
import { motion } from 'framer-motion';
import { ANIMATION_TIMING, EASING, MATERIALS, CONTEXT_ANIMATIONS, COMPONENT_STANDARDS } from '../../design/tokens';

interface Box3DProps {
  items?: string[];
  className?: string;
}

function AnimatedBox({ items = [] }: { items: string[] }) {
  const groupRef = useRef<Group>(null);
  const boxRef = useRef<Mesh>(null);

  // Gentle floating animation using design tokens
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      groupRef.current.rotation.y = Math.sin(time * COMPONENT_STANDARDS.box3d.rotationSpeed) * COMPONENT_STANDARDS.box3d.floatingAmplitude;
      groupRef.current.position.y = Math.sin(time * COMPONENT_STANDARDS.box3d.rotationSpeed * 0.6) * COMPONENT_STANDARDS.box3d.floatingAmplitude * 0.5;
    }
  });

  // Generate floating items around the box using design tokens
  const floatingItems = useMemo(() => {
    return items.slice(0, 8).map((item, index) => {
      const angle = (index / items.length) * Math.PI * 2;
      const radius = 3;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.sin(index) * 2) - 1;

      return {
        text: item,
        position: [x, y, z] as [number, number, number],
        delay: index * ANIMATION_TIMING.fast,
      };
    });
  }, [items]);

  return (
    <group ref={groupRef}>
      {/* Main treasure box */}
      <Box ref={boxRef} args={[2, 1.2, 1.5]} position={[0, 0, 0]}>
        <meshStandardMaterial {...MATERIALS.wood} />
      </Box>

      {/* Box lid */}
      <Box args={[2.1, 0.1, 1.6]} position={[0, 0.65, 0]}>
        <meshStandardMaterial
          color="#654321"
          metalness={0.2}
          roughness={0.7}
        />
      </Box>

      {/* Decorative metal bands */}
      <Box args={[2.05, 0.05, 1.55]} position={[0, -0.5, 0]}>
        <meshStandardMaterial {...MATERIALS.gold} />
      </Box>

      <Box args={[0.1, 1.25, 1.55]} position={[-1, 0, 0]}>
        <meshStandardMaterial {...MATERIALS.gold} />
      </Box>

      <Box args={[0.1, 1.25, 1.55]} position={[1, 0, 0]}>
        <meshStandardMaterial {...MATERIALS.gold} />
      </Box>

      {/* Lock mechanism */}
      <Box args={[0.3, 0.3, 0.1]} position={[0, 0, 0.8]}>
        <meshStandardMaterial
          color="#C0C0C0"
          metalness={0.9}
          roughness={0.1}
        />
      </Box>

      {/* Floating text items */}
      {floatingItems.map((item, index) => (
        <Text
          key={index}
          position={item.position}
          fontSize={0.3}
          color={MATERIALS.gold.color}
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          {item.text}
        </Text>
      ))}

      {/* Magical particles */}
      {[...Array(COMPONENT_STANDARDS.box3d.particleCount)].map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 6
        ]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={MATERIALS.gold.color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export default function Box3D({ items = [], className = '' }: Box3DProps) {
  return (
    <motion.div
      className={`w-full h-64 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: ANIMATION_TIMING.slow, ease: EASING.liquid }}
    >
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#FFE4B5" />

        <AnimatedBox items={items} />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          autoRotate
          autoRotateSpeed={COMPONENT_STANDARDS.box3d.rotationSpeed}
        />

        <Environment preset="sunset" />
      </Canvas>
    </motion.div>
  );
}