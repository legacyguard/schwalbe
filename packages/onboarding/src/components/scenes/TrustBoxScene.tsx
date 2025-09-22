/**
 * Scéna 2: Interactive 3D Trust Box
 * Second scene of "Cesta Strážcu Spomienok" onboarding
 */

import React, { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Box, Text, OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Lock, Heart, Sparkles, ArrowRight } from 'lucide-react'
import * as THREE from 'three'
import { cn } from '@schwalbe/shared'

interface TrustBoxSceneProps {
  onComplete: () => void
  className?: string
}

// 3D Trust Box Component
function TrustBox({
  isOpen,
  onInteraction,
  glowIntensity = 1
}: {
  isOpen: boolean
  onInteraction: () => void
  glowIntensity?: number
}) {
  const boxRef = useRef<THREE.Mesh>(null)
  const lidRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  useFrame((state) => {
    if (boxRef.current) {
      // Gentle floating animation
      boxRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      boxRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }

    if (lidRef.current && isOpen) {
      // Smooth lid opening animation
      lidRef.current.rotation.x = THREE.MathUtils.lerp(
        lidRef.current.rotation.x,
        -Math.PI * 0.7,
        0.02
      )
      lidRef.current.position.z = THREE.MathUtils.lerp(
        lidRef.current.position.z,
        0.3,
        0.02
      )
    }
  })

  const handleClick = () => {
    onInteraction()
  }

  return (
    <group onClick={handleClick} position={[0, 0, 0]}>
      {/* Main box body */}
      <Box
        ref={boxRef}
        args={[2, 1.5, 2]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#8B5CF6"
          metalness={0.3}
          roughness={0.2}
          emissive="#4C1D95"
          emissiveIntensity={glowIntensity * 0.1}
        />
      </Box>

      {/* Box lid */}
      <Box
        ref={lidRef}
        args={[2.1, 0.2, 2.1]}
        position={[0, 0.85, 0]}
      >
        <meshStandardMaterial
          color="#A855F7"
          metalness={0.4}
          roughness={0.1}
          emissive="#6D28D9"
          emissiveIntensity={glowIntensity * 0.15}
        />
      </Box>

      {/* Lock mechanism */}
      {!isOpen && (
        <Box
          args={[0.3, 0.4, 0.2]}
          position={[0, 0.8, 1.1]}
        >
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.8}
            roughness={0.1}
            emissive="#FFA500"
            emissiveIntensity={glowIntensity * 0.2}
          />
        </Box>
      )}

      {/* Trust symbols floating inside when open */}
      {isOpen && (
        <>
          {/* Heart symbol */}
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.15]} />
            <meshStandardMaterial
              color="#FF6B9D"
              emissive="#FF1744"
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Shield symbol */}
          <mesh position={[-0.3, 0.3, 0.2]} rotation={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 0.05]} />
            <meshStandardMaterial
              color="#4FC3F7"
              emissive="#0277BD"
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Key symbol */}
          <mesh position={[0.3, 0.3, -0.2]} rotation={[0, -0.3, 0]}>
            <boxGeometry args={[0.05, 0.2, 0.05]} />
            <meshStandardMaterial
              color="#81C784"
              emissive="#2E7D32"
              emissiveIntensity={0.2}
            />
          </mesh>
        </>
      )}

      {/* Particle effects */}
      {isOpen && (
        <>
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 3,
                Math.random() * 2,
                (Math.random() - 0.5) * 3
              ]}
            >
              <sphereGeometry args={[0.02]} />
              <meshStandardMaterial
                color="#FFD700"
                emissive="#FFA500"
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}

// Ambient lights setup
function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#FFD700" />
      <pointLight position={[-5, 2, -5]} intensity={0.3} color="#8B5CF6" />
    </>
  )
}

export function TrustBoxScene({
  onComplete,
  className
}: TrustBoxSceneProps) {
  const [currentPhase, setCurrentPhase] = useState<'introduction' | 'interaction' | 'opening' | 'revelation' | 'completion'>('introduction')
  const [boxIsOpen, setBoxIsOpen] = useState(false)
  const [userClicked, setUserClicked] = useState(false)

  useEffect(() => {
    // Auto-progress phases with timing
    const timer = setTimeout(() => {
      if (currentPhase === 'introduction') {
        setCurrentPhase('interaction')
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [currentPhase])

  const handleBoxInteraction = () => {
    if (currentPhase === 'interaction' && !userClicked) {
      setUserClicked(true)
      setCurrentPhase('opening')

      setTimeout(() => {
        setBoxIsOpen(true)
        setTimeout(() => {
          setCurrentPhase('revelation')
          setTimeout(() => {
            setCurrentPhase('completion')
          }, 3000)
        }, 1000)
      }, 500)
    }
  }

  const handleContinue = () => {
    onComplete()
  }

  const messages = {
    introduction: "Toto je váš digitálny bezpečnostný box. Miesto, kde budú vaše spomienky v bezpečí.",
    interaction: "Kliknite na box a otvorte ho. Vidíte? Môžete mu dôverovať.",
    opening: "Krásne! Box sa otvára len pre vás...",
    revelation: "Vo vnútri nájdete srdce plné lásky, štít ochrany a kľúč k vašemu odkazu.",
    completion: "Váš dôverný box je pripravený. Budeme do neho spoločne ukladať vaše najcennejšie spomienky."
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 relative flex flex-col",
      className
    )}>
      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas
          shadows
          camera={{ position: [0, 2, 5], fov: 60 }}
          className="w-full h-full"
        >
          <PerspectiveCamera makeDefault position={[0, 2, 5]} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            autoRotate={currentPhase === 'introduction'}
            autoRotateSpeed={0.5}
          />

          <Lights />
          <Environment preset="night" />

          <TrustBox
            isOpen={boxIsOpen}
            onInteraction={handleBoxInteraction}
            glowIntensity={currentPhase === 'interaction' ? 2 : 1}
          />

          {/* 3D Text when box opens */}
          {boxIsOpen && (
            <Text
              position={[0, 3, 0]}
              fontSize={0.3}
              color="#FFD700"
              anchorX="center"
              anchorY="middle"
            >
              DÔVERA
            </Text>
          )}
        </Canvas>

        {/* Interaction hint */}
        <AnimatePresence>
          {currentPhase === 'interaction' && !userClicked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
                className="bg-white/20 rounded-full p-4 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  👆
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message area */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md p-6">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center mb-4">
                {currentPhase === 'introduction' && <Shield className="w-6 h-6 text-purple-300 mr-2" />}
                {currentPhase === 'interaction' && <Sparkles className="w-6 h-6 text-amber-300 mr-2" />}
                {currentPhase === 'opening' && <Lock className="w-6 h-6 text-blue-300 mr-2" />}
                {currentPhase === 'revelation' && <Heart className="w-6 h-6 text-pink-300 mr-2" />}
                {currentPhase === 'completion' && <Shield className="w-6 h-6 text-green-300 mr-2" />}
              </div>

              <p className="text-lg text-white mb-6 leading-relaxed">
                {messages[currentPhase]}
              </p>

              {currentPhase === 'completion' && (
                <motion.button
                  onClick={handleContinue}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl transition-all duration-300 hover:shadow-2xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5" />
                    <span>Rozumiem a dôverujem</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <span>Krok 2 z 4</span>
          <div className="w-20 h-1 bg-white/20 rounded-full">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
              initial={{ width: '25%' }}
              animate={{ width: '50%' }}
              transition={{ duration: 1, delay: 1 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper component for use in onboarding flow
export function TrustBoxStep() {
  return {
    id: 'trust-box',
    title: 'Digitálny Box Dôvery',
    description: 'Spoznajte miesto, kde budú vaše spomienky v bezpečí',
    component: TrustBoxScene,
    estimatedTime: 45, // seconds
    canSkip: false, // Important trust-building moment
    isAnimated: true,
    requires3D: true
  }
}