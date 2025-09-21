import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FadeIn } from '@/components/motion/FadeIn';
import {
  PersonalityAwareAnimation,
  ContextAwareAnimation,
  EmotionalAnimation,
  PersonalityHoverEffect,
  PersonalityAnimationUtils
} from '@/components/animations/PersonalityAwareAnimations';
import {
  useSofiaPersonality,
  PersonalityPresets
} from '@/components/sofia-firefly/SofiaFireflyPersonality';
import { LiquidMotion } from '@/components/animations/LiquidMotion';
import SofiaFirefly from '@/components/sofia-firefly/SofiaFirefly';

interface Document {
  id: string;
  name: string;
  type: 'passport' | 'license' | 'contract' | 'certificate' | 'insurance' | 'financial' | 'medical' | 'other';
  category: 'personal' | 'property' | 'financial' | 'health' | 'work' | 'family';
  status: 'processing' | 'analyzed' | 'categorized' | 'complete';
  uploadDate: Date;
  expiryDate?: Date;
  confidence: number;
  tags: string[];
  aiAnalysis?: {
    extractedData: Record<string, any>;
    suggestions: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Passport_John_Doe.pdf',
      type: 'passport',
      category: 'personal',
      status: 'complete',
      uploadDate: new Date('2024-01-15'),
      expiryDate: new Date('2029-01-15'),
      confidence: 0.95,
      tags: ['ID', 'Travel', 'Official'],
      aiAnalysis: {
        extractedData: {
          fullName: 'John Doe',
          dateOfBirth: '1985-03-15',
          passportNumber: 'AB1234567',
          issueDate: '2024-01-15',
          expiryDate: '2029-01-15'
        },
        suggestions: ['Consider renewing 6 months before expiry', 'Keep digital copy for travel'],
        riskLevel: 'low'
      }
    },
    {
      id: '2',
      name: 'Home_Insurance_Policy.pdf',
      type: 'insurance',
      category: 'property',
      status: 'processing',
      uploadDate: new Date('2024-09-20'),
      expiryDate: new Date('2025-09-20'),
      confidence: 0.87,
      tags: ['Property', 'Insurance', 'Annual'],
      aiAnalysis: {
        extractedData: {
          policyNumber: 'POL987654',
          coverageAmount: '€250,000',
          annualPremium: '€450',
          provider: 'Allianz Insurance'
        },
        suggestions: ['Set renewal reminder 30 days before expiry', 'Consider increasing coverage'],
        riskLevel: 'low'
      }
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // Initialize Sofia personality for document guidance
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.experiencedUser);

  useEffect(() => {
    // Track user interactions for personality learning
    if (isInteracting) {
      learnFromInteraction({
        type: 'click',
        duration: 500,
        context: 'helping'
      });
      adaptToContext('helping');
    }
  }, [isInteracting, learnFromInteraction, adaptToContext]);

  const handleFileUpload = () => {
    setIsUploading(true);
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      // Add new document
      const newDoc: Document = {
        id: Date.now().toString(),
        name: 'New_Document.pdf',
        type: 'other',
        category: 'personal',
        status: 'processing',
        uploadDate: new Date(),
        confidence: 0.0,
        tags: ['New'],
      };
      setDocuments(prev => [newDoc, ...prev]);
    }, 2000);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'processing': return 'bg-yellow-500';
      case 'analyzed': return 'bg-blue-500';
      case 'categorized': return 'bg-purple-500';
      case 'complete': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: Document['category']) => {
    switch (category) {
      case 'personal': return '👤';
      case 'property': return '🏠';
      case 'financial': return '💰';
      case 'health': return '🏥';
      case 'work': return '💼';
      case 'family': return '👨‍👩‍👧';
      default: return '📄';
    }
  };

  return (
    <PersonalityAwareAnimation personality={personality} context="helping">
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
        {/* Sofia Firefly - Document Assistant */}
        <SofiaFirefly
          personality="pragmatic"
          context="helping"
          size="medium"
          variant="contextual"
          glowIntensity={0.5}
        />

        <div className='container mx-auto px-4 py-8'>
          {/* Header Section */}
          <motion.div
            className='text-center mb-12'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className='text-4xl font-heading bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4'
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Living Archive
            </motion.h1>
            <motion.p
              className='text-muted-foreground text-lg max-w-2xl mx-auto'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Your AI-powered document management system. Upload, organize, and protect your important documents with intelligent categorization.
            </motion.p>
          </motion.div>

          {/* Upload Section */}
          <FadeIn duration={0.8}>
            <Card className='mb-8 border-primary/20 shadow-xl bg-background/95 backdrop-blur'>
              <CardContent className='pt-6'>
                <div className='flex flex-col items-center justify-center py-8'>
                  <motion.div
                    className='w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mb-4'
                    animate={isUploading ? { rotate: 360 } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <span className='text-2xl'>📄</span>
                  </motion.div>
                  <h3 className='text-xl font-semibold mb-2'>Upload New Document</h3>
                  <p className='text-muted-foreground mb-4 text-center'>
                    Drag and drop files here or click to browse
                  </p>
                  <Button
                    onClick={handleFileUpload}
                    disabled={isUploading}
                    className='bg-primary hover:bg-primary/90'
                  >
                    {isUploading ? 'Processing...' : 'Choose Files'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Search and Filter */}
          <div className='flex flex-col md:flex-row gap-4 mb-8'>
            <div className='flex-1'>
              <Input
                placeholder='Search documents...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='bg-background/50 border-primary/20'
              />
            </div>
            <div className='flex gap-2 flex-wrap'>
              {['all', 'personal', 'property', 'financial', 'health', 'work', 'family'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'outline'}
                  size='sm'
                  onClick={() => setSelectedCategory(category)}
                  className='capitalize'
                >
                  {category === 'all' ? 'All' : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Documents Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <AnimatePresence>
              {filteredDocuments.map((doc, index) => (
                <PersonalityHoverEffect key={doc.id} personality={personality}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className='cursor-pointer border-primary/20 hover:border-primary/40 transition-all duration-300 h-full'>
                      <CardHeader className='pb-3'>
                        <div className='flex items-start justify-between'>
                          <div className='flex items-center gap-2'>
                            <span className='text-lg'>{getCategoryIcon(doc.category)}</span>
                            <CardTitle className='text-base truncate'>{doc.name}</CardTitle>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(doc.status)}`} />
                        </div>
                      </CardHeader>
                      <CardContent className='pt-0'>
                        <div className='space-y-3'>
                          <div className='flex flex-wrap gap-1'>
                            <div className='px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs'>
                              {doc.category}
                            </div>
                            <div className='px-2 py-1 border border-border rounded text-xs'>
                              {doc.type}
                            </div>
                          </div>

                          {doc.aiAnalysis && (
                            <div className='text-xs text-muted-foreground'>
                              <div className='flex justify-between mb-1'>
                                <span>AI Confidence:</span>
                                <span className='text-primary'>{Math.round(doc.confidence * 100)}%</span>
                              </div>
                              <div className='flex justify-between'>
                                <span>Risk Level:</span>
                                <div
                                  className={`px-2 py-1 rounded text-xs ${
                                    doc.aiAnalysis.riskLevel === 'low'
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-destructive text-destructive-foreground'
                                  }`}
                                >
                                  {doc.aiAnalysis.riskLevel}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className='flex justify-between items-center pt-2'>
                            <span className='text-xs text-muted-foreground'>
                              {doc.uploadDate.toLocaleDateString()}
                            </span>
                            <Button variant='ghost' size='sm' className='h-8 px-2'>
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </PersonalityHoverEffect>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <FadeIn duration={0.8}>
              <Card className='border-primary/20 shadow-xl bg-background/95 backdrop-blur'>
                <CardContent className='pt-6'>
                  <div className='text-center py-12'>
                    <div className='w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <span className='text-2xl'>📄</span>
                    </div>
                    <h3 className='text-xl font-semibold mb-2'>No documents found</h3>
                    <p className='text-muted-foreground mb-4'>
                      {searchTerm || selectedCategory !== 'all'
                        ? 'Try adjusting your search or filter criteria'
                        : 'Start by uploading your first document'
                      }
                    </p>
                    {!searchTerm && selectedCategory === 'all' && (
                      <Button onClick={handleFileUpload} disabled={isUploading}>
                        Upload Document
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Sofia AI Contextual Assistance */}
          <FadeIn duration={0.8} delay={0.6}>
            <Card className='mt-8 border-primary/20 shadow-xl bg-background/95 backdrop-blur'>
              <CardContent className='pt-6'>
                <div className='flex items-start gap-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg'>
                    <span className='text-lg'>✨</span>
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold mb-2'>Sofia's Analysis</h3>
                    <p className='text-muted-foreground mb-4'>
                      I've analyzed your documents and found that your passport expires in 5 years.
                      Consider setting up a renewal reminder 6 months in advance.
                    </p>
                    <div className='flex gap-2'>
                      <Button size='sm'>Set Reminder</Button>
                      <Button variant='outline' size='sm'>Learn More</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </PersonalityAwareAnimation>
  );
}