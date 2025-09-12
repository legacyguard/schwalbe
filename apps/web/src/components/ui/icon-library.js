import { jsx as _jsx } from "react/jsx-runtime";
import { FileText, Shield, Folder, Check, Users, User, Gift, Vault, Heart, Key, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
const iconMap = {
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
export const Icon = ({ name, className, size }) => {
    const IconComponent = iconMap[name];
    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in icon library`);
        return null;
    }
    return _jsx(IconComponent, { className: className, size: size });
};
