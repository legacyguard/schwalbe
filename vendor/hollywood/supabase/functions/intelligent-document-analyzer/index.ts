
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.28.0'
import { ImageAnnotatorClient } from 'https://esm.sh/@google-cloud/vision@4.0.0'

function getCorsHeaders(origin: string) {
  const raw = Deno.env.get('ALLOWED_ORIGINS') || '';
  const list = raw.split(',').map(s => s.trim()).filter(Boolean);
  const isAllowedOrigin = origin && list.includes(origin);
  const fallback = list[0] || 'http://localhost:8082';
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : fallback,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };
}

interface DocumentAnalysisResult {
  // OCR Results
  extractedText: string;
  confidence: number;

  // AI-Powered Analysis
  suggestedCategory: {
    category: string;
    confidence: number;
    icon: string;
    reasoning: string;
  };
  
  suggestedTitle: {
    title: string;
    confidence: number;
    reasoning: string;
  };
  
  expirationDate: {
    date: string | null;
    confidence: number;
    originalText?: string;
    reasoning: string;
  };
  
  keyData: Array<{
    label: string;
    value: string;
    confidence: number;
    type: 'amount' | 'account' | 'reference' | 'contact' | 'other';
  }>;
  
  suggestedTags: string[];
  
  // Bundle Intelligence (Phase 2)
  potentialBundles: Array<{
    bundleId: string;
    bundleName: string;
    bundleCategory: string;
    primaryEntity: string;
    documentCount: number;
    matchScore: number;
    matchReasons: string[];
  }>;
  
  suggestedNewBundle: {
    name: string;
    category: string;
    primaryEntity: string | null;
    entityType: string | null;
    keywords: string[];
    confidence: number;
    reasoning: string;
  } | null;
  
  // Document Versioning (Phase 3)
  potentialVersions: Array<{
    documentId: string;
    fileName: string;
    versionNumber: number;
    versionDate: string;
    similarityScore: number;
    matchReasons: string[];
  }>;
  
  versioningSuggestion: {
    action: 'replace' | 'new_version' | 'separate';
    confidence: number;
    reasoning: string;
    suggestedArchiveReason?: string;
  } | null;
  
  // Processing metadata
  processingId: string;
  processingTime: number;
}

interface DocumentAnalysisRequest {
  fileData: string; // base64 encoded
  fileName: string;
  fileType: string;
  userId?: string; // Optional - for bundle detection in Phase 2
}

serve(async (req) => {
  const origin = req.headers.get('origin') || 'http://localhost:8082';
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    const startTime = Date.now();
    const processingId = `doc_analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const openaiApiKey = Deno.env.get('SOFIA_OPENAI_API_KEY');
    const googleCloudApiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const body: DocumentAnalysisRequest = await req.json();
    
    if (!body.fileData || !body.fileName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fileData, fileName' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // STEP 1: Perform OCR using Google Cloud Vision
    console.log('Starting OCR processing...');
    let extractedText = '';
    let ocrConfidence = 0;
    
    if (googleCloudApiKey) {
      try {
        const visionRequest = {
          requests: [{
            image: {
              content: body.fileData
            },
            features: [
              { type: 'TEXT_DETECTION', maxResults: 1 },
              { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }
            ],
            imageContext: {
              languageHints: ['en', 'sk', 'cs'] // Support multiple languages
            }
          }]
        };

        const visionResponse = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${googleCloudApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(visionRequest)
          }
        );

        if (visionResponse.ok) {
          const visionData = await visionResponse.json();
          const response = visionData.responses[0];
          
          if (response.fullTextAnnotation) {
            extractedText = response.fullTextAnnotation.text;
            ocrConfidence = 0.9; // High confidence for successful OCR
          } else if (response.textAnnotations && response.textAnnotations.length > 0) {
            extractedText = response.textAnnotations[0].description;
            ocrConfidence = 0.8;
          }
        }
      } catch (error) {
        console.error('OCR error:', error);
        // Continue with empty text - AI will handle it
      }
    }

    // STEP 2: AI-Powered Intelligent Analysis
    console.log('Starting AI analysis...');
    let analysisResult: DocumentAnalysisResult;
    
// Create Supabase client for bundle detection (Phase 2) bound to user Authorization
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = supabaseUrl && supabaseAnonKey 
      ? createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } })
      : null;
    
    if (openaiApiKey && extractedText.trim()) {
      try {
        const openai = new OpenAI({ apiKey: openaiApiKey });
        
        const analysisPrompt = `You are an expert document organizer for a family protection app. Analyze this document text and provide structured analysis.

DOCUMENT TEXT:
"${extractedText}"

FILENAME: ${body.fileName}

Please analyze and return ONLY a valid JSON response with this exact structure:
{
  "suggestedCategory": {
    "category": "one of: personal, housing, finances, work, health, legal, vehicles, insurance, other",
    "confidence": 0.0-1.0,
    "icon": "appropriate icon name",
    "reasoning": "brief explanation"
  },
  "suggestedTitle": {
    "title": "short, descriptive title (max 50 chars)",
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation"
  },
  "expirationDate": {
    "date": "YYYY-MM-DD or null if none found",
    "confidence": 0.0-1.0,
    "originalText": "original text where date was found or null",
    "reasoning": "brief explanation"
  },
  "keyData": [
    {
      "label": "descriptive label",
      "value": "extracted value",
      "confidence": 0.0-1.0,
      "type": "amount|account|reference|contact|other"
    }
  ],
  "suggestedTags": ["tag1", "tag2", "tag3"]
}

RULES:
- Be conservative with confidence scores
- Extract only clearly identifiable information
- For expiration dates, look for "expires", "valid until", "due date", etc.
- Key data should include important numbers, amounts, reference numbers
- Tags should be relevant and useful
- Keep titles concise but descriptive`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { 
              role: 'system', 
              content: 'You are a document analysis expert. Always respond with valid JSON only.' 
            },
            { role: 'user', content: analysisPrompt }
          ],
          max_tokens: 800,
          temperature: 0.1 // Low temperature for consistent results
        });

        const aiResponse = completion.choices[0]?.message?.content || '';
        
        try {
          const parsedAnalysis = JSON.parse(aiResponse);
          
          analysisResult = {
            extractedText,
            confidence: ocrConfidence,
            processingId,
            processingTime: Date.now() - startTime,
            ...parsedAnalysis
          };
          
        } catch (parseError) {
          console.error('AI response parsing error:', parseError);
          // Fallback to rule-based analysis
          analysisResult = performRuleBasedAnalysis(extractedText, body.fileName, processingId, ocrConfidence, Date.now() - startTime);
        }
        
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
        // Fallback to rule-based analysis
        analysisResult = performRuleBasedAnalysis(extractedText, body.fileName, processingId, ocrConfidence, Date.now() - startTime);
      }
    } else {
      // No AI available or no text - use rule-based analysis
      analysisResult = performRuleBasedAnalysis(extractedText, body.fileName, processingId, ocrConfidence, Date.now() - startTime);
    }

    // STEP 3: Bundle Intelligence Detection (Phase 2)
    if (supabase && body.userId) {
      console.log('Starting bundle intelligence analysis...');
      
      try {
        // Find potential existing bundles
        const potentialBundles = await findPotentialBundles(
          supabase,
          body.userId,
          analysisResult.suggestedCategory.category,
          analysisResult.suggestedTags,
          analysisResult.extractedText
        );
        
        // Generate suggestion for new bundle if no good matches found
        const suggestedNewBundle = potentialBundles.length === 0 
          ? generateBundleSuggestion(
              analysisResult.suggestedCategory.category,
              analysisResult.extractedText,
              analysisResult.keyData,
              analysisResult.suggestedTags
            )
          : null;
        
        // Update analysis result with bundle intelligence
        analysisResult.potentialBundles = potentialBundles.map(bundle => ({
          bundleId: bundle.bundle_id,
          bundleName: bundle.bundle_name,
          bundleCategory: bundle.bundle_category,
          primaryEntity: bundle.primary_entity || '',
          documentCount: bundle.document_count || 0,
          matchScore: bundle.match_score || 0,
          matchReasons: bundle.match_reasons || []
        }));
        
        analysisResult.suggestedNewBundle = suggestedNewBundle;
        
        // STEP 4: Document Versioning Detection (Phase 3)
        if (analysisResult.potentialBundles.length > 0) {
          console.log('Checking for potential document versions...');
          
          // Check each potential bundle for existing versions
          for (const bundle of analysisResult.potentialBundles) {
            try {
              const potentialVersions = await findPotentialDocumentVersions(
                supabase,
                body.userId,
                bundle.bundleId,
                body.fileName,
                analysisResult.extractedText
              );
              
              if (potentialVersions.length > 0) {
                analysisResult.potentialVersions = potentialVersions.map(version => ({
                  documentId: version.document_id,
                  fileName: version.file_name,
                  versionNumber: version.version_number,
                  versionDate: version.version_date,
                  similarityScore: version.similarity_score,
                  matchReasons: version.match_reasons || []
                }));
                
                // Generate versioning suggestion
                const bestMatch = potentialVersions[0];
                if (bestMatch && bestMatch.similarity_score > 0.7) {
                  analysisResult.versioningSuggestion = generateVersioningSuggestion(
                    body.fileName,
                    analysisResult.extractedText,
                    bestMatch
                  );
                }
                break; // Found versions in this bundle, no need to check others
              }
            } catch (versionError) {
              console.error('Version detection error for bundle:', bundle.bundleId, versionError);
            }
          }
        }
        
      } catch (bundleError) {
        console.error('Bundle intelligence error:', bundleError);
        // Don't fail the entire analysis if bundle detection fails
        analysisResult.potentialBundles = [];
        analysisResult.suggestedNewBundle = null;
      }
    }

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        result: analysisResult
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Document analysis error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Document analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Fallback rule-based analysis when AI is not available
function performRuleBasedAnalysis(
  text: string,
  fileName: string,
  processingId: string,
  confidence: number,
  processingTime: number
): DocumentAnalysisResult {
  const textLower = text.toLowerCase();
  const fileNameLower = fileName.toLowerCase();
  
  // Category detection based on keywords
  let category = 'other';
  let categoryIcon = 'file';
  let categoryReasoning = 'Default categorization';
  
  const categoryPatterns = [
    { category: 'insurance', keywords: ['insurance', 'policy', 'premium', 'coverage'], icon: 'shield' },
    { category: 'finances', keywords: ['bank', 'account', 'statement', 'invoice', 'bill', 'payment'], icon: 'dollar-sign' },
    { category: 'personal', keywords: ['passport', 'license', 'certificate', 'identity'], icon: 'user' },
    { category: 'health', keywords: ['medical', 'doctor', 'hospital', 'health', 'prescription'], icon: 'heart' },
    { category: 'housing', keywords: ['mortgage', 'rent', 'lease', 'property', 'utility'], icon: 'home' },
    { category: 'legal', keywords: ['legal', 'contract', 'agreement', 'will', 'testament'], icon: 'scale' },
    { category: 'work', keywords: ['employment', 'salary', 'contract', 'work', 'company'], icon: 'briefcase' }
  ];
  
  for (const pattern of categoryPatterns) {
    if (pattern.keywords.some(keyword => textLower.includes(keyword) || fileNameLower.includes(keyword))) {
      category = pattern.category;
      categoryIcon = pattern.icon;
      categoryReasoning = `Found keywords: ${pattern.keywords.filter(k => textLower.includes(k) || fileNameLower.includes(k)).join(', ')}`;
      break;
    }
  }
  
  // Simple title generation
  let title = fileName.replace(/\.(pdf|jpg|jpeg|png|gif)$/i, '');
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  // Simple date extraction
  let expirationDate = null;
  let dateConfidence = 0;
  let originalDateText = null;
  const datePatterns = [
    /(?:expires?|valid until|due date|expiry)[\s:]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
    /(?:expires?|valid until|due date|expiry)[\s:]*([A-Za-z]+ \d{1,2},? \d{4})/i
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      expirationDate = match[1];
      originalDateText = match[0];
      dateConfidence = 0.7;
      break;
    }
  }
  
  // Extract key data
  const keyData = [];
  
  // Amount extraction
  const amountMatch = text.match(/\$[\d,]+\.?\d*/);
  if (amountMatch) {
    keyData.push({
      label: 'Amount',
      value: amountMatch[0],
      confidence: 0.8,
      type: 'amount' as const
    });
  }
  
  // Account number extraction
  const accountMatch = text.match(/(?:account|acct)[\s#:]*([0-9-]{8,20})/i);
  if (accountMatch) {
    keyData.push({
      label: 'Account Number',
      value: accountMatch[1],
      confidence: 0.7,
      type: 'account' as const
    });
  }
  
  // Simple tag generation
  const suggestedTags = [];
  if (textLower.includes('important')) suggestedTags.push('important');
  if (expirationDate) suggestedTags.push('expires');
  if (textLower.includes('urgent')) suggestedTags.push('urgent');
  
  return {
    extractedText: text,
    confidence,
    processingId,
    processingTime,
    suggestedCategory: {
      category,
      confidence: 0.6, // Lower confidence for rule-based
      icon: categoryIcon,
      reasoning: categoryReasoning
    },
    suggestedTitle: {
      title,
      confidence: 0.5,
      reasoning: 'Based on filename'
    },
    expirationDate: {
      date: expirationDate,
      confidence: dateConfidence,
      originalText: originalDateText,
      reasoning: expirationDate ? 'Found expiration pattern' : 'No expiration date found'
    },
    keyData,
    suggestedTags,
    // Bundle intelligence - will be populated by main function
    potentialBundles: [],
    suggestedNewBundle: null,
    // Document versioning - will be populated by main function
    potentialVersions: [],
    versioningSuggestion: null
  };
}

// Phase 2: Bundle Intelligence Functions
async function findPotentialBundles(
  supabase: any,
  userId: string,
  category: string,
  tags: string[],
  extractedText: string
) {
  try {
    // Call the database function to find potential bundles
    const { data, error } = await supabase.rpc('find_potential_bundles', {
      doc_user_id: userId,
      doc_category: category,
      doc_keywords: tags,
      doc_ai_extracted_text: extractedText,
      limit_results: 5
    });

    if (error) {
      console.error('Error finding potential bundles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in findPotentialBundles:', error);
    return [];
  }
}

function generateBundleSuggestion(
  category: string,
  extractedText: string,
  keyData: Array<any>,
  tags: string[]
): { name: string; category: string; primaryEntity: string | null; entityType: string | null; keywords: string[]; confidence: number; reasoning: string } | null {
  
  const textLower = extractedText.toLowerCase();
  
  // Vehicle documents
  if (category === 'vehicles') {
    // Try to extract vehicle information
    const vehiclePatterns = [
      /(?:škoda|skoda)\s+([a-z]+)/i,
      /(?:volkswagen|vw)\s+([a-z]+)/i,
      /(?:audi)\s+([a-z0-9]+)/i,
      /(?:bmw)\s+([a-z0-9]+)/i,
      /(?:mercedes|mb)\s+([a-z0-9\s]+)/i,
      /(?:toyota)\s+([a-z]+)/i,
      /(?:ford)\s+([a-z]+)/i
    ];
    
    for (const pattern of vehiclePatterns) {
      const match = extractedText.match(pattern);
      if (match) {
        const vehicleInfo = match[0];
        return {
          name: `Vehicle: ${vehicleInfo}`,
          category: 'vehicles',
          primaryEntity: vehicleInfo,
          entityType: 'vehicle',
          keywords: [vehicleInfo.toLowerCase(), ...tags],
          confidence: 0.8,
          reasoning: `Detected vehicle information: ${vehicleInfo}`
        };
      }
    }
    
    // Generic vehicle bundle
    return {
      name: `Vehicle Documents`,
      category: 'vehicles',
      primaryEntity: null,
      entityType: 'vehicle',
      keywords: tags,
      confidence: 0.6,
      reasoning: 'Vehicle category detected but no specific vehicle identified'
    };
  }
  
  // Housing/Property documents
  if (category === 'housing') {
    // Try to extract address
    const addressPatterns = [
      /(\d+\s+[A-Za-z\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd))/i,
      /([A-Za-z\s]+\s+\d+)/i // Slovak format: "Hlavná 123"
    ];
    
    for (const pattern of addressPatterns) {
      const match = extractedText.match(pattern);
      if (match) {
        const address = match[1].trim();
        return {
          name: `Property: ${address}`,
          category: 'housing',
          primaryEntity: address,
          entityType: 'property',
          keywords: [address.toLowerCase(), ...tags],
          confidence: 0.8,
          reasoning: `Detected property address: ${address}`
        };
      }
    }
    
    return {
      name: `Housing Documents`,
      category: 'housing',
      primaryEntity: null,
      entityType: 'property',
      keywords: tags,
      confidence: 0.6,
      reasoning: 'Housing category detected but no specific property identified'
    };
  }
  
  // Financial documents
  if (category === 'finances') {
    // Try to extract bank/institution name
    const institutionPatterns = [
      /(?:banka|bank)\s+([a-z\s]+)/i,
      /(tatra\s*banka|slovenska\s*sporitelna|vub|csob|unicredit)/i,
      /(account|účet)\s*(?:number|číslo)?\s*:?\s*([0-9\s/-]+)/i
    ];
    
    for (const pattern of institutionPatterns) {
      const match = extractedText.match(pattern);
      if (match) {
        const institution = match[1] || match[0];
        return {
          name: `Financial: ${institution}`,
          category: 'finances',
          primaryEntity: institution,
          entityType: 'institution',
          keywords: [institution.toLowerCase(), ...tags],
          confidence: 0.7,
          reasoning: `Detected financial institution: ${institution}`
        };
      }
    }
    
    return {
      name: `Financial Documents`,
      category: 'finances',
      primaryEntity: null,
      entityType: 'institution',
      keywords: tags,
      confidence: 0.5,
      reasoning: 'Financial category detected but no specific institution identified'
    };
  }
  
  // Insurance documents
  if (category === 'insurance') {
    const insurancePatterns = [
      /(allianz|generali|kooperativa|union|uniqa)/i,
      /policy\s*(?:number|číslo)?\s*:?\s*([A-Z0-9\s-]+)/i
    ];
    
    for (const pattern of insurancePatterns) {
      const match = extractedText.match(pattern);
      if (match) {
        const insurer = match[1] || match[0];
        return {
          name: `Insurance: ${insurer}`,
          category: 'insurance',
          primaryEntity: insurer,
          entityType: 'institution',
          keywords: [insurer.toLowerCase(), ...tags],
          confidence: 0.7,
          reasoning: `Detected insurance company: ${insurer}`
        };
      }
    }
  }
  
  // Default: no specific bundle suggestion
  return null;
}

// Phase 3: Document Versioning Functions
async function findPotentialDocumentVersions(
  supabase: any,
  userId: string,
  bundleId: string,
  fileName: string,
  extractedText: string
) {
  try {
    // Call the database function to find potential document versions
    const { data, error } = await supabase.rpc('find_potential_document_versions', {
      doc_user_id: userId,
      doc_bundle_id: bundleId,
      doc_filename: fileName,
      doc_ai_extracted_text: extractedText,
      similarity_threshold: 0.6
    });

    if (error) {
      console.error('Error finding potential versions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in findPotentialDocumentVersions:', error);
    return [];
  }
}

function generateVersioningSuggestion(
  newFileName: string,
  newFileText: string,
  existingVersion: any
): { action: 'replace' | 'new_version' | 'separate'; confidence: number; reasoning: string; suggestedArchiveReason?: string } {
  
  const newFileNameLower = newFileName.toLowerCase();
  const existingFileNameLower = existingVersion.file_name.toLowerCase();
  
  // Check for year patterns that might indicate versioning
  const newYearMatch = newFileName.match(/20\d{2}/);
  const existingYearMatch = existingVersion.file_name.match(/20\d{2}/);
  
  // Check for explicit version indicators
  const newVersionIndicators = newFileNameLower.match(/(v\d+|version\s*\d+|ver\s*\d+|\d+\.\d+)/);
  const existingVersionIndicators = existingFileNameLower.match(/(v\d+|version\s*\d+|ver\s*\d+|\d+\.\d+)/);
  
  // High similarity score suggests same document type
  if (existingVersion.similarity_score > 0.8) {
    
    // Year-based versioning (most common case)
    if (newYearMatch && existingYearMatch) {
      const newYear = parseInt(newYearMatch[0]);
      const existingYear = parseInt(existingYearMatch[0]);
      
      if (newYear > existingYear) {
        return {
          action: 'replace',
          confidence: 0.9,
          reasoning: `Detected newer version: ${newYear} vs ${existingYear}. This appears to be an updated version of the same document.`,
          suggestedArchiveReason: `Replaced by ${newYear} version`
        };
      } else if (newYear < existingYear) {
        return {
          action: 'separate',
          confidence: 0.8,
          reasoning: `Document appears older (${newYear}) than existing version (${existingYear}). Consider keeping as separate historical record.`
        };
      }
    }
    
    // Version number based
    if (newVersionIndicators || existingVersionIndicators) {
      return {
        action: 'new_version',
        confidence: 0.8,
        reasoning: 'Version indicators detected. This appears to be a new version of an existing document.',
        suggestedArchiveReason: 'Replaced by newer version'
      };
    }
    
    // Same document type, different dates
    const daysSinceExisting = Math.floor(
      (Date.now() - new Date(existingVersion.version_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceExisting > 30) {
      // Likely a renewal or update (insurance, contracts, etc.)
      return {
        action: 'replace',
        confidence: 0.85,
        reasoning: 'Document appears to be an updated version of an existing document (uploaded more than 30 days apart).',
        suggestedArchiveReason: 'Replaced by updated version'
      };
    } else {
      return {
        action: 'separate',
        confidence: 0.6,
        reasoning: 'Similar document uploaded recently. May be a duplicate or separate instance.',
      };
    }
  }
  
  // Medium similarity - possible related document
  if (existingVersion.similarity_score > 0.6) {
    return {
      action: 'separate',
      confidence: 0.5,
      reasoning: 'Document shows some similarity to existing document but may be different enough to keep separate.'
    };
  }
  
  // Default: treat as separate
  return {
    action: 'separate',
    confidence: 0.3,
    reasoning: 'Document appears to be sufficiently different from existing documents.'
  };
}