/**
 * Natural Language Processing Interface
 * Advanced query processing and intent recognition for Sofia AI
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LiquidMotion } from '@/components/animations/LiquidMotion';
import { PersonalityAwareAnimation } from '@/components/animations/PersonalityAwareAnimations';
import {
  useSofiaPersonality,
  PersonalityPresets
} from '@/components/sofia-firefly/SofiaFireflyPersonality';

interface QueryAnalysis {
  query: string;
  intent: {
    primary: string;
    confidence: number;
    category: 'information' | 'action' | 'navigation' | 'help' | 'emergency';
    subcategory?: string;
  };
  entities: Array<{
    type: 'person' | 'document' | 'date' | 'location' | 'family_member' | 'legal_term' | 'amount';
    value: string;
    confidence: number;
    position: { start: number; end: number };
  }>;
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative' | 'urgent' | 'confused';
    confidence: number;
    emotional_indicators: string[];
  };
  context: {
    topic: string;
    domain: 'family' | 'legal' | 'emergency' | 'documents' | 'general';
    complexity: 'simple' | 'moderate' | 'complex';
    requires_action: boolean;
    suggested_responses: string[];
  };
  language: {
    detected: string;
    confidence: number;
    formal_level: 'casual' | 'professional' | 'formal';
  };
}

interface ProcessedResponse {
  id: string;
  query: string;
  analysis: QueryAnalysis;
  response: {
    type: 'direct_answer' | 'clarification' | 'action_required' | 'redirect';
    content: string;
    confidence: number;
    follow_up_questions?: string[];
    suggested_actions?: Array<{
      label: string;
      action: string;
      data?: any;
    }>;
  };
  timestamp: Date;
  processing_time: number;
}

interface NaturalLanguageProcessorProps {
  onQueryProcessed?: (result: ProcessedResponse) => void;
  onActionSuggested?: (action: string, data?: any) => void;
  context?: {
    currentPage?: string;
    familyData?: any;
    documentData?: any;
    userPreferences?: any;
  };
}

const sampleQueries = [
  {
    category: 'Family Management',
    queries: [
      'Who are my emergency contacts?',
      'How do I add a new guardian?',
      'Show me my family protection score',
      'What happens if I miss a health check?'
    ]
  },
  {
    category: 'Document Questions',
    queries: [
      'What documents do I need for my will?',
      'Are my insurance policies up to date?',
      'Find documents that mention my children',
      'Which documents need signatures?'
    ]
  },
  {
    category: 'Legal & Compliance',
    queries: [
      'Is my will legally valid?',
      'What are the requirements in California?',
      'Do I need a notary for this document?',
      'Are there any compliance issues?'
    ]
  },
  {
    category: 'Emergency Scenarios',
    queries: [
      'How do I trigger an emergency alert?',
      'What if I become incapacitated?',
      'Who gets notified in an emergency?',
      'Test my emergency contacts'
    ]
  }
];

export default function NaturalLanguageProcessor({
  onQueryProcessed,
  onActionSuggested,
  context
}: NaturalLanguageProcessorProps) {
  const [currentQuery, setCurrentQuery] = useState('');
  const [queryHistory, setQueryHistory] = useState<ProcessedResponse[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [analysisDetails, setAnalysisDetails] = useState<QueryAnalysis | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Sofia personality for NLP processing
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.analyticalUser);

  useEffect(() => {
    adaptToContext('analyzing');
  }, [adaptToContext]);

  const processQuery = async (query: string): Promise<ProcessedResponse> => {
    const startTime = Date.now();

    // Simulate advanced NLP processing
    const analysis = await analyzeQuery(query);
    const response = await generateResponse(query, analysis);

    const result: ProcessedResponse = {
      id: `query_${Date.now()}`,
      query,
      analysis,
      response,
      timestamp: new Date(),
      processing_time: Date.now() - startTime
    };

    return result;
  };

  const analyzeQuery = async (query: string): Promise<QueryAnalysis> => {
    // Simulate comprehensive query analysis
    const words = query.toLowerCase().split(/\s+/);

    // Intent detection
    const intent = detectIntent(query, words);

    // Entity extraction
    const entities = extractEntities(query);

    // Sentiment analysis
    const sentiment = analyzeSentiment(query, words);

    // Context analysis
    const contextAnalysis = analyzeContext(query, words, intent);

    // Language detection
    const language = detectLanguage(query);

    return {
      query,
      intent,
      entities,
      sentiment,
      context: contextAnalysis,
      language
    };
  };

  const detectIntent = (query: string, words: string[]) => {
    const intentPatterns = {
      information: ['what', 'who', 'where', 'when', 'how', 'show', 'tell', 'explain'],
      action: ['add', 'create', 'delete', 'update', 'send', 'trigger', 'start', 'upload'],
      navigation: ['go to', 'navigate', 'open', 'show me', 'take me'],
      help: ['help', 'how do i', 'i need', 'confused', 'explain'],
      emergency: ['emergency', 'urgent', 'critical', 'alert', 'help me']
    };

    let primaryIntent = 'information';
    let maxMatches = 0;

    Object.entries(intentPatterns).forEach(([intent, patterns]) => {
      const matches = patterns.filter(pattern =>
        words.some(word => word.includes(pattern.split(' ')[0])) ||
        query.toLowerCase().includes(pattern)
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        primaryIntent = intent;
      }
    });

    const category = primaryIntent as QueryAnalysis['intent']['category'];
    const confidence = Math.min(0.95, 0.5 + (maxMatches * 0.15));

    return {
      primary: primaryIntent,
      confidence,
      category,
      subcategory: getSubcategory(query, category)
    };
  };

  const getSubcategory = (query: string, category: string): string | undefined => {
    const subcategories = {
      information: ['status', 'list', 'details', 'summary'],
      action: ['create', 'modify', 'delete', 'send'],
      navigation: ['dashboard', 'documents', 'family', 'settings'],
      help: ['tutorial', 'explanation', 'troubleshooting'],
      emergency: ['activation', 'contacts', 'protocols']
    };

    const cats = subcategories[category as keyof typeof subcategories] || [];
    return cats.find(sub => query.toLowerCase().includes(sub));
  };

  const extractEntities = (query: string): QueryAnalysis['entities'] => {
    const entities: QueryAnalysis['entities'] = [];

    // Person names (simplified detection)
    const personPattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    let match;
    while ((match = personPattern.exec(query)) !== null) {
      entities.push({
        type: 'person',
        value: match[0],
        confidence: 0.8,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }

    // Document types
    const documentTypes = ['will', 'insurance', 'policy', 'document', 'certificate', 'deed'];
    documentTypes.forEach(type => {
      const index = query.toLowerCase().indexOf(type);
      if (index !== -1) {
        entities.push({
          type: 'document',
          value: type,
          confidence: 0.9,
          position: { start: index, end: index + type.length }
        });
      }
    });

    // Family relationships
    const familyTerms = ['spouse', 'child', 'children', 'parent', 'guardian', 'beneficiary', 'family'];
    familyTerms.forEach(term => {
      const index = query.toLowerCase().indexOf(term);
      if (index !== -1) {
        entities.push({
          type: 'family_member',
          value: term,
          confidence: 0.85,
          position: { start: index, end: index + term.length }
        });
      }
    });

    // Dates (simplified)
    const datePattern = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g;
    while ((match = datePattern.exec(query)) !== null) {
      entities.push({
        type: 'date',
        value: match[0],
        confidence: 0.95,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }

    return entities;
  };

  const analyzeSentiment = (query: string, words: string[]): QueryAnalysis['sentiment'] => {
    const sentimentWords = {
      positive: ['good', 'great', 'excellent', 'happy', 'satisfied', 'perfect'],
      negative: ['bad', 'terrible', 'awful', 'frustrated', 'angry', 'disappointed'],
      urgent: ['urgent', 'emergency', 'immediately', 'asap', 'critical', 'help'],
      confused: ['confused', 'unclear', 'dont understand', "don't know", 'lost', 'stuck']
    };

    let sentiment: QueryAnalysis['sentiment']['overall'] = 'neutral';
    let maxScore = 0;
    const indicators: string[] = [];

    Object.entries(sentimentWords).forEach(([sent, sentWords]) => {
      const score = sentWords.filter(word =>
        words.some(w => w.includes(word)) || query.toLowerCase().includes(word)
      ).length;

      if (score > maxScore) {
        maxScore = score;
        sentiment = sent as QueryAnalysis['sentiment']['overall'];
      }

      sentWords.forEach(word => {
        if (query.toLowerCase().includes(word)) {
          indicators.push(word);
        }
      });
    });

    return {
      overall: sentiment,
      confidence: Math.min(0.95, 0.6 + (maxScore * 0.1)),
      emotional_indicators: indicators
    };
  };

  const analyzeContext = (query: string, words: string[], intent: QueryAnalysis['intent']): QueryAnalysis['context'] => {
    const domainKeywords = {
      family: ['family', 'guardian', 'emergency contact', 'relative', 'spouse', 'child'],
      legal: ['will', 'legal', 'law', 'attorney', 'notary', 'witness', 'compliance'],
      emergency: ['emergency', 'alert', 'urgent', 'critical', 'activate', 'trigger'],
      documents: ['document', 'file', 'upload', 'download', 'scan', 'pdf'],
      general: ['help', 'how', 'what', 'explain', 'show']
    };

    let domain: QueryAnalysis['context']['domain'] = 'general';
    let maxMatches = 0;

    Object.entries(domainKeywords).forEach(([dom, keywords]) => {
      const matches = keywords.filter(keyword =>
        query.toLowerCase().includes(keyword)
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        domain = dom as QueryAnalysis['context']['domain'];
      }
    });

    const complexity = words.length > 15 ? 'complex' : words.length > 8 ? 'moderate' : 'simple';
    const requiresAction = intent.category === 'action' || intent.category === 'emergency';

    return {
      topic: extractTopic(query, domain),
      domain,
      complexity,
      requires_action: requiresAction,
      suggested_responses: generateSuggestedResponses(query, intent, domain)
    };
  };

  const extractTopic = (query: string, domain: string): string => {
    const topics = {
      family: 'family_management',
      legal: 'legal_compliance',
      emergency: 'emergency_response',
      documents: 'document_management',
      general: 'general_inquiry'
    };

    return topics[domain as keyof typeof topics] || 'general_inquiry';
  };

  const generateSuggestedResponses = (query: string, intent: QueryAnalysis['intent'], domain: string): string[] => {
    const suggestions = {
      family: [
        'Show me my family tree',
        'Add a new emergency contact',
        'Check my protection score'
      ],
      legal: [
        'Review document compliance',
        'Find attorney recommendations',
        'Check legal requirements'
      ],
      emergency: [
        'Test emergency contacts',
        'Review emergency protocols',
        'Update emergency information'
      ],
      documents: [
        'Upload a new document',
        'Search my documents',
        'Get document recommendations'
      ]
    };

    return suggestions[domain as keyof typeof suggestions] || [
      'Tell me more about this',
      'Show me related information',
      'Get help with this topic'
    ];
  };

  const detectLanguage = (query: string): QueryAnalysis['language'] => {
    // Simplified language detection
    const commonWords = {
      en: ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'],
      es: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no'],
      fr: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir']
    };

    const words = query.toLowerCase().split(/\s+/);
    let detectedLang = 'en';
    let maxMatches = 0;

    Object.entries(commonWords).forEach(([lang, langWords]) => {
      const matches = words.filter(word => langWords.includes(word)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedLang = lang;
      }
    });

    const formalityIndicators = ['please', 'could you', 'would you', 'kindly', 'sir', 'madam'];
    const formalLevel = formalityIndicators.some(indicator =>
      query.toLowerCase().includes(indicator)
    ) ? 'formal' : query.includes('?') ? 'professional' : 'casual';

    return {
      detected: detectedLang,
      confidence: Math.min(0.95, 0.7 + (maxMatches * 0.05)),
      formal_level: formalLevel as QueryAnalysis['language']['formal_level']
    };
  };

  const generateResponse = async (query: string, analysis: QueryAnalysis): Promise<ProcessedResponse['response']> => {
    const responses = {
      information: {
        family: "I can help you with family-related information. Based on your query, you might want to check your family tree, review emergency contacts, or see your protection score.",
        legal: "For legal questions, I can analyze your documents, check compliance status, or connect you with professional attorneys in our network.",
        emergency: "For emergency information, I can show you your emergency contacts, explain activation procedures, or help you test your emergency systems.",
        documents: "I can help you find, analyze, or organize your documents. Would you like me to search for specific information or run an analysis?",
        general: "I'm here to help! Could you be more specific about what information you're looking for?"
      },
      action: {
        family: "I can help you take action with family management. Let me guide you through the process step by step.",
        legal: "For legal actions, I recommend reviewing the requirements first. Would you like me to check compliance or connect you with a professional?",
        emergency: "Emergency actions require careful consideration. Let me help you understand the process and confirm you want to proceed.",
        documents: "I can help you with document actions like uploading, analyzing, or organizing. What would you like to do?",
        general: "I can help you take action. Could you specify what you'd like to accomplish?"
      }
    };

    const category = analysis.intent.category === 'help' ? 'information' : analysis.intent.category;
    const domain = analysis.context.domain;

    const responseCategory = responses[category as keyof typeof responses] || responses.information;
    const content = responseCategory[domain as keyof typeof responseCategory] || responseCategory.general;

    return {
      type: analysis.context.requires_action ? 'action_required' : 'direct_answer',
      content,
      confidence: analysis.intent.confidence * 0.9,
      follow_up_questions: analysis.context.suggested_responses.slice(0, 3),
      suggested_actions: analysis.context.requires_action ? [
        { label: 'Get Started', action: 'start_process', data: { domain, intent: analysis.intent.primary } },
        { label: 'Learn More', action: 'show_help', data: { topic: analysis.context.topic } }
      ] : undefined
    };
  };

  const handleSubmitQuery = async () => {
    if (!currentQuery.trim()) return;

    setIsProcessing(true);

    try {
      const result = await processQuery(currentQuery);
      setQueryHistory(prev => [result, ...prev].slice(0, 10)); // Keep last 10 queries
      setAnalysisDetails(result.analysis);

      onQueryProcessed?.(result);

      learnFromInteraction({
        type: 'nlp_query',
        duration: result.processing_time,
        context: 'analyzing'
      });

      // Handle suggested actions
      if (result.response.suggested_actions) {
        result.response.suggested_actions.forEach(action => {
          // Auto-execute non-destructive actions
          if (action.action === 'show_help') {
            onActionSuggested?.(action.action, action.data);
          }
        });
      }

    } catch (error) {
      console.error('Query processing failed:', error);
    } finally {
      setIsProcessing(false);
      setCurrentQuery('');
    }
  };

  const handleSampleQuery = (query: string) => {
    setCurrentQuery(query);
    setTimeout(() => handleSubmitQuery(), 100);
  };

  const filteredSamples = selectedCategory === 'all'
    ? sampleQueries
    : sampleQueries.filter(cat => cat.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <PersonalityAwareAnimation personality={personality} context="analyzing">
      <div className="w-full space-y-6">
        {/* Header */}
        <LiquidMotion.ScaleIn delay={0.1}>
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                🧠 Natural Language Processing
                <motion.div
                  className="text-sm px-3 py-1 rounded-full bg-green-500 text-white"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Advanced NLP
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ask Sofia anything using natural language. Advanced AI processes your queries to understand intent, extract entities, and provide intelligent responses.
              </p>
            </CardContent>
          </Card>
        </LiquidMotion.ScaleIn>

        {/* Query Input */}
        <LiquidMotion.ScaleIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💬 Ask Sofia Anything
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={currentQuery}
                    onChange={(e) => setCurrentQuery(e.target.value)}
                    placeholder="Ask me anything about your family protection, documents, or emergency planning..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitQuery()}
                    disabled={isProcessing}
                  />
                  <Button
                    onClick={handleSubmitQuery}
                    disabled={!currentQuery.trim() || isProcessing}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {isProcessing ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      '🚀 Process'
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? '📊 Hide Analysis' : '🔍 Show Analysis'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Processed {queryHistory.length} queries this session
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </LiquidMotion.ScaleIn>

        {/* Analysis Details */}
        <AnimatePresence>
          {showAdvanced && analysisDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🔬 Query Analysis Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Intent Analysis */}
                      <div className="space-y-3">
                        <h3 className="font-medium">Intent Detection</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span>Primary Intent:</span>
                            <span className="font-medium capitalize">{analysisDetails.intent.primary}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Category:</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm capitalize">
                              {analysisDetails.intent.category}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Confidence:</span>
                            <span className={`font-medium ${
                              analysisDetails.intent.confidence > 0.8 ? 'text-green-600' :
                              analysisDetails.intent.confidence > 0.6 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {Math.round(analysisDetails.intent.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Entities */}
                      <div className="space-y-3">
                        <h3 className="font-medium">Extracted Entities</h3>
                        {analysisDetails.entities.length > 0 ? (
                          <div className="space-y-2">
                            {analysisDetails.entities.map((entity, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs capitalize">
                                    {entity.type.replace('_', ' ')}
                                  </span>
                                  <span className="font-medium">{entity.value}</span>
                                </div>
                                <span className="text-muted-foreground">
                                  {Math.round(entity.confidence * 100)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No entities detected</p>
                        )}
                      </div>

                      {/* Sentiment */}
                      <div className="space-y-3">
                        <h3 className="font-medium">Sentiment Analysis</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span>Overall Sentiment:</span>
                            <span className={`px-2 py-1 rounded text-sm capitalize ${
                              analysisDetails.sentiment.overall === 'positive' ? 'bg-green-100 text-green-800' :
                              analysisDetails.sentiment.overall === 'negative' ? 'bg-red-100 text-red-800' :
                              analysisDetails.sentiment.overall === 'urgent' ? 'bg-orange-100 text-orange-800' :
                              analysisDetails.sentiment.overall === 'confused' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {analysisDetails.sentiment.overall}
                            </span>
                          </div>
                          {analysisDetails.sentiment.emotional_indicators.length > 0 && (
                            <div>
                              <span className="text-sm text-muted-foreground">Indicators:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {analysisDetails.sentiment.emotional_indicators.map((indicator, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                                    {indicator}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Context */}
                      <div className="space-y-3">
                        <h3 className="font-medium">Context Analysis</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span>Domain:</span>
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm capitalize">
                              {analysisDetails.context.domain}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Complexity:</span>
                            <span className={`text-sm capitalize ${
                              analysisDetails.context.complexity === 'simple' ? 'text-green-600' :
                              analysisDetails.context.complexity === 'moderate' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {analysisDetails.context.complexity}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Requires Action:</span>
                            <span className={analysisDetails.context.requires_action ? 'text-orange-600' : 'text-green-600'}>
                              {analysisDetails.context.requires_action ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Query History */}
        {queryHistory.length > 0 && (
          <LiquidMotion.ScaleIn delay={0.4}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📜 Recent Queries ({queryHistory.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {queryHistory.slice(0, 5).map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium mb-1">{result.query}</div>
                          <div className="text-sm text-muted-foreground mb-2">{result.response.content}</div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>⏱️ {result.processing_time}ms</span>
                            <span>🎯 {Math.round(result.response.confidence * 100)}% confidence</span>
                            <span>📊 {result.analysis.intent.category}</span>
                            <span>🌐 {result.analysis.context.domain}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {result.timestamp.toLocaleTimeString()}
                        </div>
                      </div>

                      {result.response.follow_up_questions && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {result.response.follow_up_questions.map((question, qIdx) => (
                            <Button
                              key={qIdx}
                              size="sm"
                              variant="outline"
                              className="text-xs h-6"
                              onClick={() => handleSampleQuery(question)}
                            >
                              {question}
                            </Button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </LiquidMotion.ScaleIn>
        )}

        {/* Sample Queries */}
        <LiquidMotion.ScaleIn delay={0.5}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  💡 Try These Sample Queries
                </CardTitle>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="all">All Categories</option>
                  {sampleQueries.map(cat => (
                    <option key={cat.category} value={cat.category.toLowerCase()}>
                      {cat.category}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSamples.map((category, catIdx) => (
                  <div key={category.category}>
                    <h3 className="font-medium mb-2">{category.category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {category.queries.map((query, queryIdx) => (
                        <motion.div
                          key={queryIdx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (catIdx * 0.1) + (queryIdx * 0.05) }}
                        >
                          <Button
                            variant="outline"
                            className="w-full text-left justify-start h-auto p-3"
                            onClick={() => handleSampleQuery(query)}
                            disabled={isProcessing}
                          >
                            <div>
                              <div className="font-medium">{query}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Click to process with NLP
                              </div>
                            </div>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </LiquidMotion.ScaleIn>

        {/* Sofia Guidance */}
        <LiquidMotion.ScaleIn delay={0.6}>
          <motion.div
            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-3"
            animate={{
              boxShadow: [
                '0 0 15px rgba(34, 197, 94, 0.1)',
                '0 0 25px rgba(34, 197, 94, 0.15)',
                '0 0 15px rgba(34, 197, 94, 0.1)',
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-green-700 text-sm font-medium">
                ✨ Sofia: "{queryHistory.length === 0
                  ? 'Try asking me anything! I understand natural language and can help with family protection, documents, emergencies, and more.'
                  : queryHistory.length < 3
                    ? 'Great questions! I\'m learning about your needs. Feel free to ask follow-up questions or try different topics.'
                    : 'Excellent! I\'m getting a better understanding of your family protection needs. Let me know how I can help you take action on these insights.'}"
              </p>
            </div>
          </motion.div>
        </LiquidMotion.ScaleIn>
      </div>
    </PersonalityAwareAnimation>
  );
}