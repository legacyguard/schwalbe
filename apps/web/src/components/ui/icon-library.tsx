import React from 'react';
import {
  FileText,
  Shield,
  Folder,
  Check,
  Users,
  User,
  Gift,
  Vault,
  Heart,
  Key,
  Sparkles,
  BookOpen,
  ShieldCheck,
  LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'file-text': FileText,
  shield: Shield,
  folder: Folder,
  check: Check,
  users: Users,
  user: User,
  gift: Gift,
  vault: Vault,
  legacy: BookOpen, // Using BookOpen for legacy icon
  heart: Heart,
  key: Key,
  sparkles: Sparkles,
  'book-open': BookOpen,
  'shield-check': ShieldCheck
};

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className, size }) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon library`);
    return null;
  }

  return <IconComponent className={className} size={size} />;
};