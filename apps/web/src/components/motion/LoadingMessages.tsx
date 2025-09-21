import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';

export type LoadingContext =
  | 'document-upload'
  | 'document-analysis'
  | 'will-generation'
  | 'family-invitation'
  | 'professional-review'
  | 'data-sync'
  | 'ai-processing'
  | 'file-encryption'
  | 'backup-creation'
  | 'report-generation';

export type EmotionalTone = 'encouraging' | 'calm' | 'professional' | 'friendly' | 'motivational';

interface LoadingMessage {
  text: string;
  subtext?: string;
  emoji?: string;
  duration?: number;
}

interface ContextAwareLoadingProps {
  context: LoadingContext;
  isLoading: boolean;
  progress?: number;
  emotionalTone?: EmotionalTone;
  className?: string;
  showProgress?: boolean;
  autoRotate?: boolean;
  rotationInterval?: number;
}

const loadingMessageLibrary: Record<LoadingContext, Record<EmotionalTone, LoadingMessage[]>> = {
  'document-upload': {
    encouraging: [
      { text: "Uploading your document securely", subtext: "Almost there!", emoji: "📤" },
      { text: "Safely storing your information", subtext: "Your data is protected", emoji: "🔒" },
      { text: "Processing your document", subtext: "Making it searchable and organized", emoji: "⚡" },
    ],
    calm: [
      { text: "Uploading document", subtext: "Please wait a moment", emoji: "📄" },
      { text: "Storing securely", subtext: "Your information is safe", emoji: "🛡️" },
      { text: "Processing content", subtext: "Analyzing your document", emoji: "🔍" },
    ],
    professional: [
      { text: "Document upload in progress", subtext: "Secure transmission", emoji: "📊" },
      { text: "Encryption and storage", subtext: "Bank-level security", emoji: "🔐" },
      { text: "Content analysis", subtext: "AI-powered processing", emoji: "🤖" },
    ],
    friendly: [
      { text: "Bringing your document on board", subtext: "Getting cozy in our secure vault", emoji: "📋" },
      { text: "Tucking it away safely", subtext: "Like a digital safety deposit box", emoji: "💼" },
      { text: "Waking up our AI assistant", subtext: "To help organize everything", emoji: "☕" },
    ],
    motivational: [
      { text: "Your document is joining the family", subtext: "One step closer to peace of mind", emoji: "🎯" },
      { text: "Building your protection layer by layer", subtext: "Strength in every detail", emoji: "🛡️" },
      { text: "Creating your digital safety net", subtext: "One document at a time", emoji: "🕸️" },
    ],
  },
  'document-analysis': {
    encouraging: [
      { text: "Analyzing your document", subtext: "Extracting key information", emoji: "🔍" },
      { text: "AI is reading carefully", subtext: "Understanding every detail", emoji: "📖" },
      { text: "Categorizing content", subtext: "Making it easily findable", emoji: "📂" },
    ],
    calm: [
      { text: "Analyzing document", subtext: "Processing content", emoji: "📄" },
      { text: "Reading carefully", subtext: "Understanding details", emoji: "👀" },
      { text: "Organizing information", subtext: "Creating structure", emoji: "📁" },
    ],
    professional: [
      { text: "Document analysis in progress", subtext: "AI-powered content extraction", emoji: "🔬" },
      { text: "Information processing", subtext: "Advanced text recognition", emoji: "⚙️" },
      { text: "Categorization system", subtext: "Intelligent classification", emoji: "🏷️" },
    ],
    friendly: [
      { text: "Our AI friend is reading your document", subtext: "Like having a super-smart assistant", emoji: "🤓" },
      { text: "Peeking into all the details", subtext: "Nothing escapes our digital eyes", emoji: "👁️" },
      { text: "Sorting everything neatly", subtext: "Like organizing a perfect filing cabinet", emoji: "📚" },
    ],
    motivational: [
      { text: "Uncovering the hidden gems", subtext: "Every detail matters for your protection", emoji: "💎" },
      { text: "Building your fortress of information", subtext: "Stronger with every analysis", emoji: "🏰" },
      { text: "Creating order from complexity", subtext: "Your path to clarity", emoji: "🧭" },
    ],
  },
  'will-generation': {
    encouraging: [
      { text: "Crafting your will", subtext: "With care and precision", emoji: "✍️" },
      { text: "Translating your wishes", subtext: "Into legal protection", emoji: "⚖️" },
      { text: "Building your legacy", subtext: "One clause at a time", emoji: "🏛️" },
    ],
    calm: [
      { text: "Generating will document", subtext: "Creating legal framework", emoji: "📝" },
      { text: "Structuring provisions", subtext: "Organizing your wishes", emoji: "📋" },
      { text: "Finalizing document", subtext: "Preparing for review", emoji: "✅" },
    ],
    professional: [
      { text: "Will generation in progress", subtext: "Legal document creation", emoji: "📜" },
      { text: "Legal framework assembly", subtext: "Professional standards", emoji: "🏛️" },
      { text: "Document validation", subtext: "Ensuring legal compliance", emoji: "✔️" },
    ],
    friendly: [
      { text: "Writing down your heartfelt wishes", subtext: "Like a letter to your loved ones", emoji: "💌" },
      { text: "Putting your intentions on paper", subtext: "With all the care they deserve", emoji: "🖊️" },
      { text: "Creating your family's roadmap", subtext: "For whatever the future holds", emoji: "🗺️" },
    ],
    motivational: [
      { text: "Building your family's shield", subtext: "Protection that lasts generations", emoji: "🛡️" },
      { text: "Creating peace of mind", subtext: "For you and those you love", emoji: "🕊️" },
      { text: "Securing your legacy", subtext: "Your love letter to the future", emoji: "💖" },
    ],
  },
  'family-invitation': {
    encouraging: [
      { text: "Sending invitation", subtext: "Connecting with loved ones", emoji: "👥" },
      { text: "Extending family circle", subtext: "Building your support network", emoji: "🤝" },
      { text: "Sharing the protection", subtext: "Inviting family to join", emoji: "📬" },
    ],
    calm: [
      { text: "Sending invitation", subtext: "Family member notification", emoji: "📨" },
      { text: "Extending access", subtext: "Granting permissions", emoji: "🔑" },
      { text: "Connecting family", subtext: "Building shared access", emoji: "👨‍👩‍👧‍👦" },
    ],
    professional: [
      { text: "Invitation dispatch", subtext: "Secure access provisioning", emoji: "📧" },
      { text: "Permission assignment", subtext: "Role-based access control", emoji: "🔐" },
      { text: "Family integration", subtext: "Multi-user system setup", emoji: "⚙️" },
    ],
    friendly: [
      { text: "Sending a warm invitation", subtext: "Like inviting family for dinner", emoji: "🍽️" },
      { text: "Opening the family circle", subtext: "Welcoming those who matter most", emoji: "🤗" },
      { text: "Sharing the love and protection", subtext: "Because family takes care of family", emoji: "💕" },
    ],
    motivational: [
      { text: "Building your family's safety net", subtext: "Stronger together", emoji: "🔗" },
      { text: "Creating your tribe of protection", subtext: "United in care and support", emoji: "🛡️" },
      { text: "Extending the circle of trust", subtext: "Love multiplied by connection", emoji: "💫" },
    ],
  },
  'professional-review': {
    encouraging: [
      { text: "Expert review in progress", subtext: "Professional legal analysis", emoji: "👨‍⚖️" },
      { text: "Legal expert reviewing", subtext: "Ensuring everything is perfect", emoji: "🔍" },
      { text: "Professional validation", subtext: "Expert eyes on your documents", emoji: "✅" },
    ],
    calm: [
      { text: "Professional review", subtext: "Legal expert analysis", emoji: "📋" },
      { text: "Expert examination", subtext: "Detailed document review", emoji: "🔬" },
      { text: "Quality assurance", subtext: "Professional validation", emoji: "✔️" },
    ],
    professional: [
      { text: "Legal review in progress", subtext: "Attorney examination", emoji: "⚖️" },
      { text: "Professional analysis", subtext: "Expert document assessment", emoji: "📊" },
      { text: "Quality verification", subtext: "Standards compliance check", emoji: "🏆" },
    ],
    friendly: [
      { text: "Our legal friend is taking a look", subtext: "Like having a knowledgeable uncle review", emoji: "👴" },
      { text: "Getting the expert opinion", subtext: "Because two heads are better than one", emoji: "🧠" },
      { text: "Professional seal of approval", subtext: "The gold standard of legal review", emoji: "🏅" },
    ],
    motivational: [
      { text: "Elevating to professional standards", subtext: "The highest level of protection", emoji: "⭐" },
      { text: "Achieving legal excellence", subtext: "Beyond good, to exceptional", emoji: "🎯" },
      { text: "Professional-grade peace of mind", subtext: "When only the best will do", emoji: "💎" },
    ],
  },
  'data-sync': {
    encouraging: [
      { text: "Syncing your data", subtext: "Keeping everything up to date", emoji: "🔄" },
      { text: "Updating information", subtext: "Fresh and current", emoji: "📱" },
      { text: "Synchronizing devices", subtext: "Seamless across platforms", emoji: "☁️" },
    ],
    calm: [
      { text: "Data synchronization", subtext: "Updating information", emoji: "💾" },
      { text: "System update", subtext: "Refreshing data", emoji: "🔄" },
      { text: "Cross-device sync", subtext: "Maintaining consistency", emoji: "📲" },
    ],
    professional: [
      { text: "Data synchronization", subtext: "System-wide update", emoji: "⚙️" },
      { text: "Information refresh", subtext: "Database optimization", emoji: "🗃️" },
      { text: "Multi-platform sync", subtext: "Consistency maintenance", emoji: "🔗" },
    ],
    friendly: [
      { text: "Making sure everything is chatting nicely", subtext: "Like a family dinner where everyone gets along", emoji: "🍽️" },
      { text: "Updating the family album", subtext: "Keeping all the memories fresh", emoji: "📸" },
      { text: "Devices having a conversation", subtext: "Sharing the latest news", emoji: "💬" },
    ],
    motivational: [
      { text: "Keeping your protection current", subtext: "Always at peak performance", emoji: "🚀" },
      { text: "Maintaining your digital fortress", subtext: "Stronger every day", emoji: "🏰" },
      { text: "Evolving your safety net", subtext: "Growing with your needs", emoji: "🌱" },
    ],
  },
  'ai-processing': {
    encouraging: [
      { text: "AI is thinking", subtext: "Processing your request", emoji: "🤔" },
      { text: "Smart analysis underway", subtext: "AI working its magic", emoji: "✨" },
      { text: "Intelligent processing", subtext: "AI understanding your needs", emoji: "🧠" },
    ],
    calm: [
      { text: "AI processing", subtext: "Analyzing request", emoji: "🤖" },
      { text: "Machine learning", subtext: "Pattern recognition", emoji: "🔬" },
      { text: "Data analysis", subtext: "Information processing", emoji: "📊" },
    ],
    professional: [
      { text: "AI computation", subtext: "Advanced algorithms", emoji: "⚙️" },
      { text: "Neural processing", subtext: "Deep learning analysis", emoji: "🧬" },
      { text: "Intelligent analysis", subtext: "Machine reasoning", emoji: "🎯" },
    ],
    friendly: [
      { text: "Our AI buddy is pondering", subtext: "Thinking really hard about your request", emoji: "🤔" },
      { text: "AI having a lightbulb moment", subtext: "Connecting all the dots", emoji: "💡" },
      { text: "Smart computer doing smart things", subtext: "Like having Einstein as your assistant", emoji: "🧑‍🔬" },
    ],
    motivational: [
      { text: "AI unlocking new possibilities", subtext: "Intelligence beyond imagination", emoji: "🚀" },
      { text: "Technology meeting wisdom", subtext: "The future of smart assistance", emoji: "🔮" },
      { text: "AI elevating your experience", subtext: "Intelligence that inspires", emoji: "⭐" },
    ],
  },
  'file-encryption': {
    encouraging: [
      { text: "Encrypting your files", subtext: "Maximum security protection", emoji: "🔐" },
      { text: "Security in progress", subtext: "Bank-level encryption", emoji: "🛡️" },
      { text: "Protection activated", subtext: "Your data is safe", emoji: "🔒" },
    ],
    calm: [
      { text: "File encryption", subtext: "Security processing", emoji: "🔐" },
      { text: "Data protection", subtext: "Encryption in progress", emoji: "🛡️" },
      { text: "Security measures", subtext: "Access control", emoji: "🔒" },
    ],
    professional: [
      { text: "Encryption protocol", subtext: "AES-256 encryption", emoji: "🔐" },
      { text: "Security implementation", subtext: "Military-grade protection", emoji: "🛡️" },
      { text: "Access control", subtext: "Permission management", emoji: "🔑" },
    ],
    friendly: [
      { text: "Wrapping your files in a security blanket", subtext: "Cozy and completely protected", emoji: "🛡️" },
      { text: "Putting your data in a safe", subtext: "Like a digital Fort Knox", emoji: "🏦" },
      { text: "Tucking away your secrets", subtext: "Safe from prying eyes", emoji: "🤫" },
    ],
    motivational: [
      { text: "Fortifying your digital fortress", subtext: "Impenetrable protection", emoji: "🏰" },
      { text: "Building walls of security", subtext: "Nothing gets through uninvited", emoji: "🧱" },
      { text: "Creating your safety bubble", subtext: "Protected from every angle", emoji: "🛡️" },
    ],
  },
  'backup-creation': {
    encouraging: [
      { text: "Creating backup", subtext: "Your safety net is forming", emoji: "💾" },
      { text: "Securing your data", subtext: "Double protection activated", emoji: "🗂️" },
      { text: "Backup in progress", subtext: "Your information is safe", emoji: "📦" },
    ],
    calm: [
      { text: "Backup creation", subtext: "Data duplication", emoji: "💾" },
      { text: "File backup", subtext: "Redundancy creation", emoji: "📋" },
      { text: "Data preservation", subtext: "Archive generation", emoji: "🗃️" },
    ],
    professional: [
      { text: "Backup protocol", subtext: "Data redundancy system", emoji: "⚙️" },
      { text: "Archive creation", subtext: "Information preservation", emoji: "📚" },
      { text: "Disaster recovery", subtext: "Business continuity", emoji: "🔄" },
    ],
    friendly: [
      { text: "Making a copy of your important stuff", subtext: "Like having a spare key", emoji: "🔑" },
      { text: "Creating a backup buddy", subtext: "So you never lose anything important", emoji: "👯" },
      { text: "Saving everything twice", subtext: "Because better safe than sorry", emoji: "😌" },
    ],
    motivational: [
      { text: "Building your backup fortress", subtext: "Double the protection, double the peace", emoji: "🏰" },
      { text: "Creating your safety duplicate", subtext: "Your insurance policy for data", emoji: "📋" },
      { text: "Securing your digital legacy", subtext: "Protected today, preserved forever", emoji: "💎" },
    ],
  },
  'report-generation': {
    encouraging: [
      { text: "Generating report", subtext: "Compiling your information", emoji: "📊" },
      { text: "Creating insights", subtext: "Analyzing your data", emoji: "📈" },
      { text: "Building summary", subtext: "Organizing key details", emoji: "📋" },
    ],
    calm: [
      { text: "Report generation", subtext: "Data compilation", emoji: "📄" },
      { text: "Analysis processing", subtext: "Information synthesis", emoji: "🔍" },
      { text: "Document creation", subtext: "Content assembly", emoji: "📝" },
    ],
    professional: [
      { text: "Report compilation", subtext: "Data aggregation", emoji: "📊" },
      { text: "Analytics processing", subtext: "Statistical analysis", emoji: "📈" },
      { text: "Documentation", subtext: "Formal report creation", emoji: "📋" },
    ],
    friendly: [
      { text: "Putting together your report", subtext: "Like creating a family photo album", emoji: "📸" },
      { text: "Gathering all the important bits", subtext: "Making sure nothing is missed", emoji: "🤲" },
      { text: "Creating your information summary", subtext: "All the highlights in one place", emoji: "📑" },
    ],
    motivational: [
      { text: "Crafting your success story", subtext: "Every detail tells your journey", emoji: "📖" },
      { text: "Building your achievement report", subtext: "Celebrating every milestone", emoji: "🏆" },
      { text: "Creating your progress narrative", subtext: "Your path to success documented", emoji: "🗺️" },
    ],
  },
};

export const ContextAwareLoading: React.FC<ContextAwareLoadingProps> = ({
  context,
  isLoading,
  progress = 0,
  emotionalTone = 'encouraging',
  className,
  showProgress = true,
  autoRotate = true,
  rotationInterval = 3000,
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);

  const messages = loadingMessageLibrary[context]?.[emotionalTone] || [];
  const currentMessage = messages[currentMessageIndex] || { text: 'Loading...', subtext: 'Please wait' };

  // Auto-rotate messages
  useEffect(() => {
    if (!autoRotate || !isLoading || messages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, isLoading, messages.length, rotationInterval]);

  // Animate progress
  useEffect(() => {
    if (!isLoading) {
      setDisplayedProgress(0);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedProgress(progress);
    }, 300);

    return () => clearTimeout(timer);
  }, [progress, isLoading]);

  if (!isLoading) return null;

  return (
    <motion.div
      className={cn(
        'context-aware-loading flex flex-col items-center justify-center p-6',
        'bg-white rounded-xl shadow-lg border border-gray-100',
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      {/* Progress Circle */}
      {showProgress && (
        <div className="relative mb-4">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <motion.path
              className="text-blue-500"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${displayedProgress}, 100`}
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${displayedProgress}, 100` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {Math.round(displayedProgress)}%
            </span>
          </div>
        </div>
      )}

      {/* Message Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMessageIndex}
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl mr-2">{currentMessage.emoji}</span>
            <h3 className="text-lg font-semibold text-gray-800">
              {currentMessage.text}
            </h3>
          </div>
          {currentMessage.subtext && (
            <p className="text-sm text-gray-600 max-w-xs">
              {currentMessage.subtext}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Loading Dots */}
      <div className="flex space-x-1 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Specialized loading components for common contexts
export const DocumentUploadLoading: React.FC<Omit<ContextAwareLoadingProps, 'context'>> = (props) => (
  <ContextAwareLoading {...props} context="document-upload" />
);

export const WillGenerationLoading: React.FC<Omit<ContextAwareLoadingProps, 'context'>> = (props) => (
  <ContextAwareLoading {...props} context="will-generation" />
);

export const ProfessionalReviewLoading: React.FC<Omit<ContextAwareLoadingProps, 'context'>> = (props) => (
  <ContextAwareLoading {...props} context="professional-review" />
);

export const AIPProcessingLoading: React.FC<Omit<ContextAwareLoadingProps, 'context'>> = (props) => (
  <ContextAwareLoading {...props} context="ai-processing" />
);