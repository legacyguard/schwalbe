import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ParticleSystemProps {
  count?: number;
  colors?: string[];
  size?: { min: number; max: number };
  speed?: { min: number; max: number };
  life?: { min: number; max: number };
  className?: string;
  type?: 'ambient' | 'celebration' | 'magical' | 'soothing';
  interactive?: boolean;
}

const particlePresets = {
  ambient: {
    colors: ['#E8F4FD', '#F0F8FF', '#FFF8DC', '#F5F5F5'],
    size: { min: 1, max: 3 },
    speed: { min: 0.1, max: 0.5 },
    life: { min: 100, max: 200 },
  },
  celebration: {
    colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
    size: { min: 2, max: 6 },
    speed: { min: 0.5, max: 2 },
    life: { min: 60, max: 120 },
  },
  magical: {
    colors: ['#9370DB', '#FF1493', '#00CED1', '#32CD32', '#FFD700'],
    size: { min: 1, max: 4 },
    speed: { min: 0.2, max: 1 },
    life: { min: 150, max: 300 },
  },
  soothing: {
    colors: ['#E0F2F1', '#F3E5F5', '#FFF3E0', '#E8F5E8'],
    size: { min: 1, max: 2 },
    speed: { min: 0.05, max: 0.3 },
    life: { min: 200, max: 400 },
  },
};

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  count = 20,
  colors,
  size = { min: 1, max: 3 },
  speed = { min: 0.1, max: 0.5 },
  life = { min: 100, max: 200 },
  className = '',
  type = 'ambient',
  interactive = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const preset = particlePresets[type];
  const particleColors = colors || preset.colors;

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Initialize particles
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * (speed.max - speed.min) + speed.min,
        vy: (Math.random() - 0.5) * (speed.max - speed.min) + speed.min,
        size: Math.random() * (size.max - size.min) + size.min,
        opacity: Math.random() * 0.6 + 0.2,
        color: particleColors[Math.floor(Math.random() * particleColors.length)] || '#E8F4FD',
        life: Math.random() * (life.max - life.min) + life.min,
        maxLife: Math.random() * (life.max - life.min) + life.min,
      });
    }
    particlesRef.current = particles;

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Boundary wrapping
        if (particle.x < 0) particle.x = dimensions.width;
        if (particle.x > dimensions.width) particle.x = 0;
        if (particle.y < 0) particle.y = dimensions.height;
        if (particle.y > dimensions.height) particle.y = 0;

        // Interactive behavior
        if (interactive) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.vx += (dx / distance) * force * 0.01;
            particle.vy += (dy / distance) * force * 0.01;
          }
        }

        // Apply some friction
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Update life
        particle.life--;

        // Respawn particle if dead
        if (particle.life <= 0) {
          particle.x = Math.random() * dimensions.width;
          particle.y = Math.random() * dimensions.height;
          particle.vx = (Math.random() - 0.5) * (speed.max - speed.min) + speed.min;
          particle.vy = (Math.random() - 0.5) * (speed.max - speed.min) + speed.min;
          particle.life = particle.maxLife;
          particle.opacity = Math.random() * 0.6 + 0.2;
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity * (particle.life / particle.maxLife);

        // Create glow effect
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = particle.size * 2;

        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, count, particleColors, speed, size, life, interactive]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={`particle-system ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: interactive ? 'auto' : 'none',
        zIndex: 1,
      }}
      onMouseMove={interactive ? handleMouseMove : undefined}
    />
  );
};

// Preset components for common use cases
export const AmbientParticles: React.FC<Omit<ParticleSystemProps, 'type'>> = (props) => (
  <ParticleSystem {...props} type="ambient" />
);

export const CelebrationParticles: React.FC<Omit<ParticleSystemProps, 'type'>> = (props) => (
  <ParticleSystem {...props} type="celebration" />
);

export const MagicalParticles: React.FC<Omit<ParticleSystemProps, 'type'>> = (props) => (
  <ParticleSystem {...props} type="magical" />
);

export const SoothingParticles: React.FC<Omit<ParticleSystemProps, 'type'>> = (props) => (
  <ParticleSystem {...props} type="soothing" />
);