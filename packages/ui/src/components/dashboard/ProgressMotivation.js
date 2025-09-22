import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Progress & Motivation Elements
 * Dashboard motivation and progress tracking components
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Calendar, Zap, Heart, Trophy, Clock, ChevronRight, CheckCircle, Circle, Users, FileText, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';
export function ProgressMotivation({ progress, achievements, suggestedActions, onActionClick, onAchievementClick, userName = "Milý používateľ", className }) {
    const [currentMotivation, setCurrentMotivation] = useState(0);
    const [showNewAchievement, setShowNewAchievement] = useState(null);
    const motivationalMessages = [
        `${userName}, každý dokument má svoju hodnotu a príbeh! 📚`,
        `Výborne! Váš digitálny odkaz rastie každým dňom. 🌱`,
        `Ste na správnej ceste k zabezpečeniu svojho odkazu. ✨`,
        `Každý krok vás približuje k pokoju mysle. 🕊️`,
        `Váša rodina ocení túto starostlivosť o budúcnosť. ❤️`
    ];
    // Rotate motivational messages
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMotivation(prev => (prev + 1) % motivationalMessages.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);
    // Check for new achievements
    useEffect(() => {
        const recentAchievement = achievements.find(achievement => Date.now() - achievement.unlockedAt.getTime() < 10000 // Last 10 seconds
        );
        if (recentAchievement && !showNewAchievement) {
            setShowNewAchievement(recentAchievement);
            setTimeout(() => setShowNewAchievement(null), 5000);
        }
    }, [achievements, showNewAchievement]);
    const getProgressMessage = () => {
        if (progress.overallCompletion < 20) {
            return "Začínate svoju cestu";
        }
        else if (progress.overallCompletion < 50) {
            return "Máte dobrý pokrok";
        }
        else if (progress.overallCompletion < 80) {
            return "Skvelé tempo!";
        }
        else {
            return "Takmer dokončené!";
        }
    };
    const getStreakMessage = () => {
        if (progress.streak === 0)
            return "Začnite svoju sériu";
        if (progress.streak === 1)
            return "1 deň aktivity";
        if (progress.streak < 7)
            return `${progress.streak} dní v rade`;
        return `${progress.streak} dní - úžasná séria! 🔥`;
    };
    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'common': return 'from-gray-400 to-gray-600';
            case 'rare': return 'from-blue-400 to-blue-600';
            case 'epic': return 'from-purple-400 to-purple-600';
            case 'legendary': return 'from-yellow-400 to-orange-600';
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'border-gray-300 bg-gray-50';
            case 'medium': return 'border-blue-300 bg-blue-50';
            case 'high': return 'border-orange-300 bg-orange-50';
            case 'urgent': return 'border-red-300 bg-red-50';
        }
    };
    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'low': return _jsx(Circle, { className: "w-4 h-4" });
            case 'medium': return _jsx(Target, { className: "w-4 h-4" });
            case 'high': return _jsx(Zap, { className: "w-4 h-4" });
            case 'urgent': return _jsx(Clock, { className: "w-4 h-4" });
        }
    };
    return (_jsxs("div", { className: cn("space-y-6", className), children: [_jsx(AnimatePresence, { children: showNewAchievement && (_jsxs(motion.div, { initial: { opacity: 0, y: -50, scale: 0.9 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -50, scale: 0.9 }, className: "fixed top-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border-2 border-yellow-200 p-6 max-w-sm", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: cn("w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center", getRarityColor(showNewAchievement.rarity)), children: _jsx("div", { className: "text-white", children: showNewAchievement.icon }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-bold text-gray-900 mb-1", children: "Nov\u00FD \u00FAspech! \uD83C\uDF89" }), _jsx("p", { className: "text-sm text-gray-700 font-medium", children: showNewAchievement.title }), _jsx("p", { className: "text-xs text-gray-500", children: showNewAchievement.description })] })] }), _jsx("div", { className: "absolute inset-0 pointer-events-none overflow-hidden rounded-2xl", children: Array.from({ length: 8 }).map((_, i) => (_jsx(motion.div, { className: "absolute w-2 h-2 bg-yellow-400 rounded-full", style: {
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`
                                }, animate: {
                                    y: [0, -30, 0],
                                    opacity: [1, 0.5, 0],
                                    scale: [0, 1, 0]
                                }, transition: {
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2
                                } }, i))) })] })) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx(TrendingUp, { className: "w-8 h-8" }), _jsxs("span", { className: "text-2xl font-bold", children: [Math.round(progress.overallCompletion), "%"] })] }), _jsx("h3", { className: "font-semibold mb-1", children: "Celkov\u00FD pokrok" }), _jsx("p", { className: "text-blue-100 text-sm", children: getProgressMessage() }), _jsx("div", { className: "mt-4 w-full h-2 bg-white/20 rounded-full overflow-hidden", children: _jsx(motion.div, { className: "h-full bg-white/80 rounded-full", initial: { width: 0 }, animate: { width: `${progress.overallCompletion}%` }, transition: { duration: 1, delay: 0.2 } }) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "bg-white rounded-2xl p-6 border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx(FileText, { className: "w-8 h-8 text-green-500" }), _jsx("span", { className: "text-2xl font-bold text-gray-900", children: progress.documentsCount })] }), _jsx("h3", { className: "font-semibold text-gray-900 mb-1", children: "Dokumenty" }), _jsx("p", { className: "text-gray-600 text-sm", children: "Zabezpe\u010Den\u00E9 s\u00FAbory" }), _jsxs("div", { className: "mt-4 flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-500" }), _jsxs("span", { className: "text-sm text-gray-600", children: [progress.categoriesCompleted, "/", progress.totalCategories, " kateg\u00F3ri\u00ED"] })] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "bg-white rounded-2xl p-6 border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx(Users, { className: "w-8 h-8 text-purple-500" }), _jsx("span", { className: "text-2xl font-bold text-gray-900", children: progress.guardiansSet })] }), _jsx("h3", { className: "font-semibold text-gray-900 mb-1", children: "Str\u00E1\u017Ecovia" }), _jsx("p", { className: "text-gray-600 text-sm", children: "D\u00F4veryhodn\u00E9 osoby" }), _jsxs("div", { className: "mt-4 flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4 text-purple-500" }), _jsx("span", { className: "text-sm text-gray-600", children: "Ochrana nastaven\u00E1" })] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx(Calendar, { className: "w-8 h-8" }), _jsx("span", { className: "text-2xl font-bold", children: progress.streak })] }), _jsx("h3", { className: "font-semibold mb-1", children: "S\u00E9ria dn\u00ED" }), _jsx("p", { className: "text-orange-100 text-sm", children: getStreakMessage() }), progress.streak > 0 && (_jsxs(motion.div, { className: "mt-4 flex items-center gap-1", animate: { scale: [1, 1.05, 1] }, transition: { duration: 2, repeat: Infinity }, children: [Array.from({ length: Math.min(progress.streak, 7) }).map((_, i) => (_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { delay: i * 0.1 }, className: "w-2 h-2 bg-white/80 rounded-full" }, i))), progress.streak > 7 && (_jsxs("span", { className: "text-white/80 text-xs ml-1", children: ["+", progress.streak - 7] }))] }))] })] }), _jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: "bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-200", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(motion.div, { animate: { rotate: [0, 10, -10, 0] }, transition: { duration: 2, repeat: Infinity }, className: "w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white", children: _jsx(Heart, { className: "w-6 h-6" }) }), _jsx("div", { className: "flex-1", children: _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.p, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, className: "text-lg font-medium text-gray-900 leading-relaxed", children: motivationalMessages[currentMotivation] }, currentMotivation) }) }), _jsx("div", { className: "flex gap-1", children: motivationalMessages.map((_, index) => (_jsx("div", { className: cn("w-2 h-2 rounded-full transition-all duration-300", index === currentMotivation ? "bg-purple-400" : "bg-gray-300") }, index))) })] }) }, currentMotivation), _jsxs("div", { className: "bg-white rounded-2xl p-6 border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h3", { className: "text-xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(Target, { className: "w-6 h-6 text-blue-500" }), "Navrhovan\u00E9 akcie"] }), _jsxs("span", { className: "text-sm text-gray-500", children: [suggestedActions.length, " \u00FAloh"] })] }), _jsx("div", { className: "space-y-3", children: suggestedActions.slice(0, 5).map((action, index) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.1 }, onClick: () => onActionClick(action.id), className: cn("flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]", getPriorityColor(action.priority)), children: [_jsx("div", { className: cn("flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center", action.priority === 'urgent' ? "text-red-600" :
                                        action.priority === 'high' ? "text-orange-600" :
                                            action.priority === 'medium' ? "text-blue-600" : "text-gray-600"), children: action.icon }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h4", { className: "font-semibold text-gray-900", children: action.title }), getPriorityIcon(action.priority)] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: action.description }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs text-gray-500", children: ["~", action.estimatedTime, " min\u00FAt"] }), _jsx("p", { className: "text-xs text-gray-700 italic", children: action.motivationalMessage })] })] }), _jsx(ChevronRight, { className: "w-5 h-5 text-gray-400" })] }, action.id))) })] }), achievements.length > 0 && (_jsxs("div", { className: "bg-white rounded-2xl p-6 border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h3", { className: "text-xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(Trophy, { className: "w-6 h-6 text-yellow-500" }), "Ned\u00E1vne \u00FAspechy"] }), _jsxs("span", { className: "text-sm text-gray-500", children: [achievements.length, " odznakov"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: achievements.slice(0, 6).map((achievement, index) => (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { delay: index * 0.1 }, onClick: () => onAchievementClick(achievement.id), className: "relative p-4 rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 cursor-pointer transition-all duration-200 hover:scale-105 group", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: cn("w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white", getRarityColor(achievement.rarity)), children: achievement.icon }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-semibold text-gray-900 text-sm", children: achievement.title }), _jsx("p", { className: "text-xs text-gray-600", children: achievement.description })] })] }), _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: cn("px-2 py-1 rounded-full text-white capitalize", achievement.rarity === 'legendary' ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                                                achievement.rarity === 'epic' ? "bg-gradient-to-r from-purple-400 to-purple-600" :
                                                    achievement.rarity === 'rare' ? "bg-gradient-to-r from-blue-400 to-blue-600" :
                                                        "bg-gradient-to-r from-gray-400 to-gray-600"), children: achievement.rarity }), _jsx("span", { className: "text-gray-500", children: achievement.unlockedAt.toLocaleDateString() })] }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" })] }, achievement.id))) })] }))] }));
}
