
import {
  type ActionButton,
  COMMON_ACTIONS,
  type SofiaContext,
} from './sofia-types';

// Sofia Knowledge Base - Fast, cost-effective answers to common questions
// Uses pre-written responses instead of AI for 80% of queries

interface KnowledgeEntry {
  content: string;
  contextConditions?: (context: SofiaContext) => boolean;
  followupActions?: ActionButton[];
  id: string;
  question: string;
  tags: string[];
}

class SofiaKnowledgeBase {
  private knowledge: KnowledgeEntry[] = [
    // Security & Privacy
    {
      id: 'faq_security',
      question: 'How is my data protected?',
      content: `🔒 **Your data is maximally secure:**

• **End-to-End encryption**: All documents are encrypted directly in your browser before upload
• **Zero-Knowledge**: We cannot see the content of your files
• **Personal key**: Only you have access to the decryption key
• **European servers**: Data is stored in compliance with GDPR

Your documents are safer than in a bank! 🏛️`,
      tags: ['security', 'privacy', 'encryption'],
      followupActions: [
        COMMON_ACTIONS.ADD_DOCUMENT,
        {
          id: 'security_details',
          text: '🔍 Technical details',
          icon: 'info',
          category: 'ai_query',
          cost: 'low_cost',
          payload: { topic: 'technical_security' },
        },
      ],
    },

    {
      id: 'technical_security',
      question: 'Technical security details',
      content: `🛡️ **Technical security of LegacyGuard:**

**Encryption:**
• AES-256 in GCM mode for files
• TweetNaCl for keys and metadata
• Unique nonce for each file

**Infrastructure:**
• Supabase with Row Level Security
• Clerk authentication
• EU servers (GDPR compliant)

**Key Management:**
• Client-side key generation
• PBKDF2 key derivation
• Secure key storage in IndexedDB

Your security is our top priority! 🔐`,
      tags: ['security', 'technical', 'encryption', 'infrastructure'],
      followupActions: [COMMON_ACTIONS.ADD_DOCUMENT],
    },

    // Guardians & Family Protection
    {
      id: 'faq_guardians',
      question: 'What are guardians?',
      content: `👥 **Guardians are your Circle of Trust:**

• **Trusted people** who can help your family in emergencies
• **Secure access** to your important documents when needed
• **Peace of mind** knowing your family is protected
• **Flexible permissions** - you control what each guardian can see

Think of them as digital keys to help your loved ones when you can't. 🔑`,
      tags: ['guardians', 'family', 'emergency', 'trust'],
      followupActions: [
        COMMON_ACTIONS.GO_TO_GUARDIANS,
        {
          id: 'guardian_permissions',
          text: '⚙️ Guardian permissions',
          icon: 'settings',
          category: 'ai_query',
          cost: 'low_cost',
          payload: { topic: 'permissions' },
        },
      ],
    },

    {
      id: 'add_guardian_help',
      question: 'How do I add a guardian?',
      content: `➕ **Adding a guardian is simple:**

1. **Go to Guardians** section
2. **Click "Add Guardian"**
3. **Enter their details** (name, email, relationship)
4. **Set permissions** (what they can access)
5. **Send invitation** - they'll receive secure access

**Pro tip:** Start with your most trusted family member or friend! 👨‍👩‍👧‍👦`,
      tags: ['guardians', 'howto', 'family'],
      followupActions: [COMMON_ACTIONS.GO_TO_GUARDIANS],
      contextConditions: context => context.guardianCount === 0,
    },

    // Documents & Vault
    {
      id: 'faq_documents',
      question: 'What documents should I upload?',
      content: `📄 **Essential documents for family protection:**

**Identity & Legal:**
• Passport, driver's license, birth certificate
• Marriage certificate, divorce decree
• Will, power of attorney

**Financial:**
• Bank account info, insurance policies
• Investment accounts, retirement plans
• Mortgage, loan documents

**Medical:**
• Medical records, prescriptions
• Health insurance cards
• Emergency medical contacts

**Digital:**
• Password manager export
• Digital asset information
• Social media account details

Start with what's most important to your family! 📋`,
      tags: ['documents', 'vault', 'important', 'family'],
      followupActions: [
        COMMON_ACTIONS.ADD_DOCUMENT,
        COMMON_ACTIONS.GO_TO_VAULT,
      ],
    },

    {
      id: 'upload_help',
      question: 'How do I upload documents?',
      content: `⬆️ **Uploading documents is easy:**

1. **Go to your Vault**
2. **Click "Add Document"**
3. **Drag & drop** or browse for your file
4. **Add description** (what it is, why it's important)
5. **Set expiry** (if applicable)
6. **Save** - it's automatically encrypted!

**Supported formats:** PDF, images (JPG, PNG), Word docs, and more 📁`,
      tags: ['documents', 'upload', 'howto', 'vault'],
      followupActions: [
        COMMON_ACTIONS.GO_TO_VAULT,
        COMMON_ACTIONS.ADD_DOCUMENT,
      ],
    },

    // Progress & Completion
    {
      id: 'faq_progress',
      question: 'How is my progress calculated?',
      content: `📊 **Your progress is based on key milestones:**

**Documents (40%):**
• Each important document adds ~8%
• Goal: 5+ essential documents

**Guardians (30%):**
• Each trusted guardian adds ~15%
• Goal: 2+ guardians for full coverage

**Legacy Planning (30%):**
• Will creation, video messages
• Financial summaries, instructions
• Personal letters to loved ones

**Current progress:** ${(() => '${context.completionPercentage}%')()}

Every step makes your family more secure! 🛡️`,
      tags: ['progress', 'completion', 'milestones'],
      followupActions: [COMMON_ACTIONS.VIEW_PROGRESS, COMMON_ACTIONS.NEXT_STEP],
    },

    // Pricing & Features
    {
      id: 'faq_pricing',
      question: 'How much does LegacyGuard cost?',
      content: `💰 **LegacyGuard Pricing:**

**Free Plan:**
• Up to 10 documents
• 2 guardians
• Basic security
• Perfect for getting started! 🌱

**Family Plan - $9.99/month:**
• Unlimited documents
• Unlimited guardians
• Premium AI features
• Advanced legacy tools
• Priority support 👨‍👩‍👧‍👦

**Business Plan - $29.99/month:**
• Everything in Family
• Multi-user management
• Advanced permissions
• Audit logs
• Custom branding 🏢

**Start free** and upgrade when you're ready!`,
      tags: ['pricing', 'plans', 'features', 'cost'],
      followupActions: [
        {
          id: 'upgrade_plan',
          text: '⬆️ Upgrade plan',
          icon: 'star',
          category: 'ui_action',
          cost: 'free',
          payload: { action: 'show_pricing' },
        },
      ],
    },

    // Getting Started
    {
      id: 'getting_started',
      question: 'How do I get started?',
      content: `🚀 **Getting started with LegacyGuard:**

**Step 1: Add your first document** 📄
• Start with an ID document (passport, license)
• This establishes your digital identity

**Step 2: Add a trusted guardian** 👥
• Choose your most trusted family member
• They'll help your family in emergencies

**Step 3: Build your vault** 🏦
• Add financial documents
• Include important contacts
• Upload medical information

**Step 4: Create your legacy** 💝
• Write instructions for your family
• Record personal messages
• Set up your digital will

Take it one step at a time - I'm here to help! 😊`,
      tags: ['getting-started', 'onboarding', 'help', 'guide'],
      followupActions: [
        COMMON_ACTIONS.ADD_DOCUMENT,
        COMMON_ACTIONS.GO_TO_GUARDIANS,
      ],
      contextConditions: context =>
        context.documentCount === 0 && context.guardianCount === 0,
    },

    // Emergencies
    {
      id: 'faq_emergency',
      question: 'What happens in an emergency?',
      content: `🚨 **In an emergency, your guardians can:**

**Access your vault:**
• View important documents you've shared
• Get emergency contact information
• Find medical records and instructions

**Help your family:**
• Contact insurance companies
• Access bank account information
• Find legal documents like your will

**Follow your instructions:**
• Carry out your wishes
• Distribute important information
• Ensure nothing is forgotten

**Your family will know exactly what to do** because you prepared ahead! 🛡️`,
      tags: ['emergency', 'guardians', 'family', 'access'],
      followupActions: [
        COMMON_ACTIONS.GO_TO_GUARDIANS,
        COMMON_ACTIONS.ADD_DOCUMENT,
      ],
    },
  ];

  /**
   * Search knowledge base for relevant entries
   */
  search(query: string, context: SofiaContext): KnowledgeEntry[] {
    const lowerQuery = query.toLowerCase();
    const words = lowerQuery.split(' ').filter(word => word.length > 2);

    return this.knowledge
      .filter(entry => {
        // Check if context conditions are met
        if (entry.contextConditions && !entry.contextConditions(context)) {
          return false;
        }

        // Search in question, content, and tags
        const searchText =
          `${entry.question} ${entry.content} ${entry.tags.join(' ')}`.toLowerCase();

        return (
          words.some(word => searchText.includes(word)) ||
          entry.tags.some(tag => lowerQuery.includes(tag))
        );
      })
      .sort((a, b) => {
        // Prioritize entries with more matching words
        const aMatches = words.filter(word =>
          `${a.question} ${a.content}`.toLowerCase().includes(word)
        ).length;
        const bMatches = words.filter(word =>
          `${b.question} ${b.content}`.toLowerCase().includes(word)
        ).length;

        return bMatches - aMatches;
      })
      .slice(0, 3); // Return top 3 matches
  }

  /**
   * Get entry by ID
   */
  getById(id: string): KnowledgeEntry | undefined {
    return this.knowledge.find(entry => entry.id === id);
  }

  /**
   * Get contextual suggestions based on user state
   */
  getContextualSuggestions(context: SofiaContext): KnowledgeEntry[] {
    const suggestions: KnowledgeEntry[] = [];

    // New user suggestions
    if (context.documentCount === 0 && context.guardianCount === 0) {
      const gettingStarted = this.getById('getting_started');
      if (gettingStarted) suggestions.push(gettingStarted);
    }

    // No guardians yet
    if (context.guardianCount === 0 && context.familyStatus !== 'single') {
      const guardianHelp = this.getById('add_guardian_help');
      if (guardianHelp) suggestions.push(guardianHelp);
    }

    // Low document count
    if (context.documentCount < 5) {
      const documentHelp = this.getById('faq_documents');
      if (documentHelp) suggestions.push(documentHelp);
    }

    return suggestions.slice(0, 2);
  }
}

// Export singleton instance
export const sofiaKnowledgeBase = new SofiaKnowledgeBase();
