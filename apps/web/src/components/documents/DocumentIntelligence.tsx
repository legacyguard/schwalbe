/**
 * Document Intelligence Features
 * AI-powered document analysis, categorization, and smart recommendations
 */

import React, { useState, useEffect } from 'react';
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
import {
  sofiaAIService,
  DocumentAnalysisResult,
  AIRecommendation,
  DocumentIntelligence as DocumentIntelligenceType
} from '@/services/sofia-ai.service';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  content?: string;
  thumbnail?: string;
  status: 'analyzing' | 'analyzed' | 'error' | 'pending';
}

interface DocumentIntelligenceProps {
  documents?: Document[];
  onDocumentAnalyzed?: (documentId: string, analysis: DocumentAnalysisResult) => void;
  onRecommendationAccepted?: (recommendation: AIRecommendation) => void;
  onDocumentSearch?: (query: string, results: any[]) => void;
}

interface AnalysisFilter {
  type: 'all' | 'document' | 'action' | 'professional' | 'family' | 'legal';
  confidence: number;
  urgency: 'all' | 'low' | 'medium' | 'high' | 'urgent';
}

const analysisTypes = [
  {
    key: 'categorization',
    label: 'Document Categorization',
    icon: '📂',
    description: 'Automatically classify documents by type and purpose'
  },
  {
    key: 'compliance',
    label: 'Legal Compliance Check',
    icon: '⚖️',
    description: 'Verify legal requirements and compliance status'
  },
  {
    key: 'missing_info',
    label: 'Missing Information',
    icon: '❓',
    description: 'Identify gaps and missing required information'
  },
  {
    key: 'recommendations',
    label: 'Smart Recommendations',
    icon: '💡',
    description: 'Get AI-powered suggestions for improvements'
  },
  {
    key: 'relationships',
    label: 'Document Relationships',
    icon: '🔗',
    description: 'Find connections between related documents'
  }
];

const mockDocuments: Document[] = [
  {
    id: 'doc_1',
    name: 'Last Will and Testament.pdf',
    type: 'application/pdf',
    size: 2048576,
    uploadDate: new Date('2025-09-15'),
    status: 'analyzed',
    content: 'Sample will content with beneficiary information and asset distribution...'
  },
  {
    id: 'doc_2',
    name: 'Life Insurance Policy.pdf',
    type: 'application/pdf',
    size: 1536000,
    uploadDate: new Date('2025-09-18'),
    status: 'analyzing'
  },
  {
    id: 'doc_3',
    name: 'Medical Directive.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 512000,
    uploadDate: new Date('2025-09-20'),
    status: 'pending'
  }
];

export default function DocumentIntelligence({
  documents = mockDocuments,
  onDocumentAnalyzed,
  onRecommendationAccepted,
  onDocumentSearch
}: DocumentIntelligenceProps) {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Map<string, DocumentAnalysisResult>>(new Map());
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'analyze' | 'recommendations' | 'search' | 'insights'>('analyze');
  const [filter, setFilter] = useState<AnalysisFilter>({
    type: 'all',
    confidence: 0.7,
    urgency: 'all'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize Sofia personality for document analysis
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.analytical);

  useEffect(() => {
    adaptToContext('analyzing');
    loadInitialData();
  }, [adaptToContext]);

  const loadInitialData = async () => {
    // Load recommendations
    try {
      const recs = await sofiaAIService.getRecommendations('current_user', {
        documents: documents.map(d => d.id),
        familyStatus: { protectionScore: 65 }
      });
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const analyzeDocument = async (documentId: string, analysisTypes: string[] = ['categorization', 'compliance', 'recommendations']) => {
    const document = documents.find(d => d.id === documentId);
    if (!document || !document.content) return;

    setIsAnalyzing(true);

    try {
      const analysis = await sofiaAIService.analyzeDocument(
        documentId,
        document.content,
        analysisTypes as DocumentAnalysisResult['analysisType'][]
      );

      setAnalyses(prev => new Map(prev).set(documentId, analysis));
      onDocumentAnalyzed?.(documentId, analysis);

      learnFromInteraction({
        type: 'document_analysis',
        duration: analysis.metadata.processingTime,
        context: 'analyzing'
      });

    } catch (error) {
      console.error('Document analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await sofiaAIService.searchDocuments(
        searchQuery,
        documents.map(d => d.id),
        { semantic: true, fuzzy: true }
      );

      setSearchResults(results);
      onDocumentSearch?.(searchQuery, results);

      learnFromInteraction({
        type: 'document_search',
        duration: 1000,
        context: 'analyzing'
      });

    } catch (error) {
      console.error('Document search failed:', error);
    }
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'analyzed': return 'text-green-600';
      case 'analyzing': return 'text-blue-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'analyzed': return '✅';
      case 'analyzing': return '🔄';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '📄';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (filter.type !== 'all' && rec.type !== filter.type) return false;
    if (filter.urgency !== 'all' && rec.priority !== filter.urgency) return false;
    if (rec.confidence < filter.confidence) return false;
    return true;
  });

  return (
    <PersonalityAwareAnimation personality={personality} context="analyzing">
      <div className="w-full space-y-6">
        {/* Header */}
        <LiquidMotion.ScaleIn delay={0.1}>
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                🧠 Document Intelligence
                <motion.div
                  className="text-sm px-3 py-1 rounded-full bg-purple-500 text-white"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  AI Powered
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Advanced AI analysis for your documents. Get smart categorization, compliance checks, and intelligent recommendations.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div className="text-center p-3 bg-white rounded-lg shadow-sm" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl text-blue-600">📄</div>
                  <div className="font-medium">{documents.length}</div>
                  <div className="text-sm text-muted-foreground">Documents</div>
                </motion.div>

                <motion.div className="text-center p-3 bg-white rounded-lg shadow-sm" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl text-green-600">✅</div>
                  <div className="font-medium">{documents.filter(d => d.status === 'analyzed').length}</div>
                  <div className="text-sm text-muted-foreground">Analyzed</div>
                </motion.div>

                <motion.div className="text-center p-3 bg-white rounded-lg shadow-sm" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl text-purple-600">💡</div>
                  <div className="font-medium">{recommendations.length}</div>
                  <div className="text-sm text-muted-foreground">Recommendations</div>
                </motion.div>

                <motion.div className="text-center p-3 bg-white rounded-lg shadow-sm" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl text-orange-600">⚠️</div>
                  <div className="font-medium">{recommendations.filter(r => r.priority === 'high' || r.priority === 'urgent').length}</div>
                  <div className="text-sm text-muted-foreground">Urgent Items</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </LiquidMotion.ScaleIn>

        {/* Tab Navigation */}
        <LiquidMotion.ScaleIn delay={0.2}>
          <div className="flex space-x-1 bg-muted rounded-lg p-1">
            {[
              { key: 'analyze', label: 'Analyze Documents', icon: '🔍' },
              { key: 'recommendations', label: 'Recommendations', icon: '💡' },
              { key: 'search', label: 'Smart Search', icon: '🔎' },
              { key: 'insights', label: 'Insights', icon: '📊' }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "ghost"}
                className="flex-1"
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </Button>
            ))}
          </div>
        </LiquidMotion.ScaleIn>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'analyze' && (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Document List */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        📂 Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {documents.map((document, index) => (
                          <motion.div
                            key={document.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedDocument === document.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedDocument(document.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">
                                  {document.type.includes('pdf') ? '📄' :
                                   document.type.includes('word') ? '📝' :
                                   document.type.includes('image') ? '🖼️' : '📎'}
                                </div>
                                <div>
                                  <h3 className="font-medium">{document.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {(document.size / 1024 / 1024).toFixed(1)} MB • {document.uploadDate.toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-sm ${getStatusColor(document.status)}`}>
                                  {getStatusIcon(document.status)} {document.status}
                                </span>
                                {document.status === 'analyzed' && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                                )}
                              </div>
                            </div>

                            {selectedDocument === document.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-3 pt-3 border-t"
                              >
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => analyzeDocument(document.id)}
                                    disabled={isAnalyzing || !document.content}
                                  >
                                    {isAnalyzing ? '🔄 Analyzing...' : '🔍 Analyze'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => analyzeDocument(document.id, ['categorization'])}
                                    disabled={isAnalyzing}
                                  >
                                    📂 Categorize
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Analysis Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        🧠 Analysis Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedDocument && analyses.has(selectedDocument) ? (
                        <div className="space-y-4">
                          {(() => {
                            const analysis = analyses.get(selectedDocument)!;
                            return (
                              <>
                                {/* Analysis Metadata */}
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <div>
                                    <div className="font-medium">Analysis Complete</div>
                                    <div className="text-sm text-muted-foreground">
                                      Processed in {analysis.metadata.processingTime}ms
                                    </div>
                                  </div>
                                  <div className={`text-lg font-bold ${getConfidenceColor(analysis.confidence)}`}>
                                    {Math.round(analysis.confidence * 100)}% confident
                                  </div>
                                </div>

                                {/* Category Results */}
                                {analysis.results.category && (
                                  <div className="border rounded-lg p-3">
                                    <h4 className="font-medium mb-2">📂 Document Category</h4>
                                    <div className="flex items-center gap-2">
                                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm capitalize">
                                        {analysis.results.category.primary}
                                      </span>
                                      {analysis.results.category.secondary && (
                                        <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm capitalize">
                                          {analysis.results.category.secondary}
                                        </span>
                                      )}
                                      <span className={`text-sm ${getConfidenceColor(analysis.results.category.confidence)}`}>
                                        {Math.round(analysis.results.category.confidence * 100)}%
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Compliance Results */}
                                {analysis.results.compliance && (
                                  <div className="border rounded-lg p-3">
                                    <h4 className="font-medium mb-2">⚖️ Compliance Status</h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm ${
                                          analysis.results.compliance.status === 'compliant'
                                            ? 'bg-green-100 text-green-800'
                                            : analysis.results.compliance.status === 'needs_review'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : 'bg-red-100 text-red-800'
                                        }`}>
                                          {analysis.results.compliance.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                          {analysis.results.compliance.jurisdiction}
                                        </span>
                                      </div>

                                      {analysis.results.compliance.issues.length > 0 && (
                                        <div className="mt-2">
                                          <div className="text-sm font-medium mb-1">Issues Found:</div>
                                          {analysis.results.compliance.issues.map((issue, idx) => (
                                            <div key={idx} className="text-sm p-2 bg-muted rounded">
                                              <div className={`inline-block px-2 py-1 rounded text-xs mr-2 ${
                                                issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                issue.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                                issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                              }`}>
                                                {issue.severity}
                                              </div>
                                              {issue.description}
                                              {issue.suggestion && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                  💡 {issue.suggestion}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Missing Information */}
                                {analysis.results.missingInfo && analysis.results.missingInfo.length > 0 && (
                                  <div className="border rounded-lg p-3">
                                    <h4 className="font-medium mb-2">❓ Missing Information</h4>
                                    <div className="space-y-2">
                                      {analysis.results.missingInfo.map((missing, idx) => (
                                        <div key={idx} className="p-2 bg-muted rounded">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                              missing.importance === 'required' ? 'bg-red-100 text-red-800' :
                                              missing.importance === 'recommended' ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-blue-100 text-blue-800'
                                            }`}>
                                              {missing.importance}
                                            </span>
                                            <span className="text-sm font-medium">{missing.field.replace('_', ' ')}</span>
                                          </div>
                                          <div className="text-sm text-muted-foreground">{missing.description}</div>
                                          {missing.suggestions && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                              Suggestions: {missing.suggestions.join(', ')}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Recommendations */}
                                {analysis.results.recommendations && analysis.results.recommendations.length > 0 && (
                                  <div className="border rounded-lg p-3">
                                    <h4 className="font-medium mb-2">💡 Recommendations</h4>
                                    <div className="space-y-2">
                                      {analysis.results.recommendations.map((rec, idx) => (
                                        <div key={idx} className="p-2 bg-muted rounded">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(rec.priority)}`}>
                                              {rec.priority}
                                            </span>
                                            <span className="text-sm font-medium">{rec.title}</span>
                                          </div>
                                          <div className="text-sm text-muted-foreground">{rec.description}</div>
                                          {rec.estimatedTime && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                              ⏱️ Estimated time: {rec.estimatedTime}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      ) : selectedDocument ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="text-4xl mb-4">🔍</div>
                          <p>Click "Analyze" to get AI-powered insights</p>
                          <p className="text-sm">Advanced analysis includes categorization, compliance checks, and recommendations</p>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="text-4xl mb-4">📄</div>
                          <p>Select a document to view analysis results</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        💡 AI Recommendations ({filteredRecommendations.length})
                      </CardTitle>
                      <div className="flex items-center gap-4">
                        <select
                          value={filter.type}
                          onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value as any }))}
                          className="px-3 py-1 border rounded text-sm"
                        >
                          <option value="all">All Types</option>
                          <option value="document">Documents</option>
                          <option value="action">Actions</option>
                          <option value="professional">Professional</option>
                          <option value="family">Family</option>
                        </select>
                        <select
                          value={filter.urgency}
                          onChange={(e) => setFilter(prev => ({ ...prev, urgency: e.target.value as any }))}
                          className="px-3 py-1 border rounded text-sm"
                        >
                          <option value="all">All Priorities</option>
                          <option value="urgent">Urgent</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredRecommendations.map((recommendation, index) => (
                        <motion.div
                          key={recommendation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(recommendation.priority)}`}>
                                  {recommendation.priority} priority
                                </span>
                                <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm capitalize">
                                  {recommendation.type}
                                </span>
                                <span className={`text-sm ${getConfidenceColor(recommendation.confidence)}`}>
                                  {Math.round(recommendation.confidence * 100)}% confidence
                                </span>
                              </div>

                              <h3 className="font-medium text-lg mb-2">{recommendation.title}</h3>
                              <p className="text-muted-foreground mb-3">{recommendation.description}</p>

                              <div className="text-sm text-muted-foreground mb-3">
                                <strong>Reasoning:</strong> {recommendation.reasoning}
                              </div>

                              {recommendation.actionSteps && (
                                <div className="mb-3">
                                  <div className="text-sm font-medium mb-2">Action Steps:</div>
                                  <div className="space-y-1">
                                    {recommendation.actionSteps.map((step, stepIdx) => (
                                      <div key={stepIdx} className="flex items-center gap-2 text-sm">
                                        <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs">
                                          {step.step}
                                        </span>
                                        <span className={step.required ? 'font-medium' : 'text-muted-foreground'}>
                                          {step.description}
                                          {step.required && <span className="text-red-500 ml-1">*</span>}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {recommendation.estimatedTime && (
                                  <span>⏱️ {recommendation.estimatedTime}</span>
                                )}
                                {recommendation.estimatedCost && (
                                  <span>💰 {recommendation.estimatedCost}</span>
                                )}
                                <span>🎯 {recommendation.targetAudience}</span>
                              </div>
                            </div>

                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => onRecommendationAccepted?.(recommendation)}
                              >
                                ✅ Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                              >
                                📋 View Details
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                              >
                                ❌ Dismiss
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {filteredRecommendations.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="text-4xl mb-4">💡</div>
                          <p>No recommendations match your current filters</p>
                          <p className="text-sm">Try adjusting the filter settings above</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🔎 Smart Document Search
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Search Input */}
                      <div className="flex gap-2">
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Ask anything about your documents... e.g., 'Who are my beneficiaries?' or 'What insurance do I have?'"
                          className="flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
                          🔍 Search
                        </Button>
                      </div>

                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-medium">Search Results ({searchResults.length})</h3>
                          {searchResults.map((result, index) => (
                            <motion.div
                              key={result.documentId}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">
                                  {documents.find(d => d.id === result.documentId)?.name || 'Unknown Document'}
                                </div>
                                <div className={`text-sm ${getConfidenceColor(result.relevanceScore)}`}>
                                  {Math.round(result.relevanceScore * 100)}% relevant
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground mb-3">{result.explanation}</p>

                              {result.matchedSegments.map((segment: any, segIdx: number) => (
                                <div key={segIdx} className="bg-muted p-3 rounded text-sm">
                                  <div className="font-medium">{segment.text}</div>
                                  <div className="text-muted-foreground text-xs mt-1">{segment.context}</div>
                                </div>
                              ))}
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Example Queries */}
                      <div>
                        <h3 className="font-medium mb-2">Try these example queries:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[
                            'Who are my beneficiaries?',
                            'What insurance policies do I have?',
                            'Are there any missing signatures?',
                            'What documents need updating?',
                            'Show me compliance issues',
                            'Find deadline information'
                          ].map((query) => (
                            <Button
                              key={query}
                              size="sm"
                              variant="outline"
                              className="justify-start text-left"
                              onClick={() => {
                                setSearchQuery(query);
                                handleSearch();
                              }}
                            >
                              {query}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📊 Document Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="text-4xl mb-4">📈</div>
                      <p>Advanced analytics and insights coming soon!</p>
                      <p className="text-sm">Get comprehensive reports on document health, compliance trends, and optimization opportunities.</p>
                    </div>
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sofia Guidance */}
        <LiquidMotion.ScaleIn delay={0.5}>
          <motion.div
            className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl px-4 py-3"
            animate={{
              boxShadow: [
                '0 0 15px rgba(139, 92, 246, 0.1)',
                '0 0 25px rgba(139, 92, 246, 0.15)',
                '0 0 15px rgba(139, 92, 246, 0.1)',
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
                className="w-2 h-2 bg-purple-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-purple-700 text-sm font-medium">
                ✨ Sofia: "{documents.filter(d => d.status === 'analyzed').length === 0
                  ? 'Upload and analyze your first document to unlock powerful AI insights and recommendations!'
                  : recommendations.filter(r => r.priority === 'urgent' || r.priority === 'high').length > 0
                    ? `You have ${recommendations.filter(r => r.priority === 'urgent' || r.priority === 'high').length} high-priority recommendations. Review them to strengthen your family protection.`
                    : 'Your documents look well-organized! I\'m here to help with analysis, search, and smart recommendations whenever you need them.'}"
              </p>
            </div>
          </motion.div>
        </LiquidMotion.ScaleIn>
      </div>
    </PersonalityAwareAnimation>
  );
}