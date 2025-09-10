/**
 * Text Analyzer for Sofia AI Assistant
 * Analyzes user text to detect preferred communication style
 */

export interface TextAnalysisResult {
  confidence: number;
  empatheticScore: number;
  keywords: {
    empathetic: string[];
    pragmatic: string[];
  };
  pragmaticScore: number;
  suggestedMode: 'balanced' | 'empathetic' | 'pragmatic';
}

// Keywords that suggest empathetic communication preference
const EMPATHETIC_KEYWORDS = [
  // Emotional expressions
  'feel',
  'feeling',
  'feelings',
  'emotion',
  'emotional',
  'heart',
  'soul',
  'spirit',
  'love',
  'care',
  'worried',
  'anxious',
  'scared',
  'happy',
  'sad',
  'comfort',
  'support',
  'help',
  'understand',
  'understanding',

  // Personal connection
  'family',
  'children',
  'loved ones',
  'memories',
  'legacy',
  'story',
  'stories',
  'personal',
  'meaningful',
  'precious',

  // Qualitative language
  'hope',
  'wish',
  'dream',
  'believe',
  'faith',
  'beautiful',
  'wonderful',
  'amazing',
  'special',

  // Supportive language
  'please',
  'thank you',
  'grateful',
  'appreciate',
  'kind',
  'gentle',
  'patient',
  'together',
];

// Keywords that suggest pragmatic communication preference
const PRAGMATIC_KEYWORDS = [
  // Task-oriented
  'complete',
  'finish',
  'done',
  'task',
  'goal',
  'efficient',
  'effective',
  'quick',
  'fast',
  'speed',
  'process',
  'system',
  'organize',
  'structure',

  // Data and facts
  'data',
  'facts',
  'numbers',
  'statistics',
  'percentage',
  'measure',
  'metrics',
  'results',
  'outcome',
  'performance',

  // Direct language
  'need',
  'require',
  'must',
  'should',
  'will',
  'direct',
  'specific',
  'exact',
  'precise',
  'clear',

  // Business-like
  'document',
  'file',
  'record',
  'list',
  'checklist',
  'deadline',
  'schedule',
  'plan',
  'strategy',
  'secure',
  'protect',
  'ensure',
  'guarantee',
];

export class TextAnalyzer {
  /**
   * Analyzes user text to determine communication style preference
   * Uses keyword matching and scoring algorithms to detect communication style
   *
   * @param text - The user's input text to analyze
   * @returns Analysis result with scores, suggested mode, and confidence
   */
  analyzeUserText(text: string): TextAnalysisResult {
    if (!text || text.trim().length === 0) {
      return {
        empatheticScore: 0,
        pragmaticScore: 0,
        suggestedMode: 'balanced',
        confidence: 0,
        keywords: { empathetic: [], pragmatic: [] },
      };
    }

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);

    // Find matching keywords using fuzzy matching
    const foundEmpathetic = this.findKeywords(words, EMPATHETIC_KEYWORDS);
    const foundPragmatic = this.findKeywords(words, PRAGMATIC_KEYWORDS);

    // Calculate normalized scores (0-100 scale)
    // Using 500x multiplier to ensure meaningful scores even with few keywords
    const empatheticScore = Math.min(
      100,
      (foundEmpathetic.length / Math.max(words.length, 1)) * 500
    );
    const pragmaticScore = Math.min(
      100,
      (foundPragmatic.length / Math.max(words.length, 1)) * 500
    );

    // Determine suggested mode based on score differential
    const suggestedMode = this.determineSuggestedMode(
      empatheticScore,
      pragmaticScore
    );

    // Calculate confidence based on keyword density and score difference
    // Higher confidence when more keywords are found and scores are clearly different
    const keywordDensity =
      (foundEmpathetic.length + foundPragmatic.length) / Math.max(words.length, 1);
    const scoreDifference = Math.abs(empatheticScore - pragmaticScore);
    const confidence = Math.min(100, keywordDensity * 100 + scoreDifference);

    return {
      empatheticScore,
      pragmaticScore,
      suggestedMode,
      confidence,
      keywords: {
        empathetic: foundEmpathetic,
        pragmatic: foundPragmatic,
      },
    };
  }

  /**
   * Analyzes multiple text samples to get a more accurate preference
   */
  analyzeTextHistory(texts: string[]): TextAnalysisResult {
    if (!texts || texts.length === 0) {
      return this.analyzeUserText('');
    }

    const results = texts.map(text => this.analyzeUserText(text));

    // Average the scores
    const avgEmpatheticScore =
      results.reduce((sum, r) => sum + r.empatheticScore, 0) / results.length;
    const avgPragmaticScore =
      results.reduce((sum, r) => sum + r.pragmaticScore, 0) / results.length;

    // Collect all keywords
    const allEmpatheticKeywords = new Set<string>();
    const allPragmaticKeywords = new Set<string>();

    results.forEach(r => {
      r.keywords.empathetic.forEach(k => allEmpatheticKeywords.add(k));
      r.keywords.pragmatic.forEach(k => allPragmaticKeywords.add(k));
    });

    // Determine suggested mode based on averages
    const suggestedMode = this.determineSuggestedMode(
      avgEmpatheticScore,
      avgPragmaticScore
    );

    // Higher confidence with more samples
    const baseConfidence = Math.min(
      100,
      Math.abs(avgEmpatheticScore - avgPragmaticScore) + texts.length * 5
    );

    return {
      empatheticScore: avgEmpatheticScore,
      pragmaticScore: avgPragmaticScore,
      suggestedMode,
      confidence: baseConfidence,
      keywords: {
        empathetic: Array.from(allEmpatheticKeywords),
        pragmatic: Array.from(allPragmaticKeywords),
      },
    };
  }

  /**
   * Find keywords in word list using fuzzy matching
   * Checks both word inclusion and substring matching for flexibility
   *
   * @param words - Array of words from user text
   * @param keywords - Array of keywords to search for
   * @returns Array of found keywords (unique)
   */
  private findKeywords(words: string[], keywords: string[]): string[] {
    const found: string[] = [];

    words.forEach(word => {
      keywords.forEach(keyword => {
        // Check if word contains keyword or keyword contains word (case-insensitive)
        if (word.toLowerCase().includes(keyword.toLowerCase()) ||
            keyword.toLowerCase().includes(word.toLowerCase())) {
          if (!found.includes(keyword)) {
            found.push(keyword);
          }
        }
      });
    });

    return found;
  }

  /**
   * Determine suggested communication mode based on score differential
   * Uses a threshold-based approach to avoid frequent mode switching
   *
   * @param empatheticScore - Score for empathetic communication (0-100)
   * @param pragmaticScore - Score for pragmatic communication (0-100)
   * @returns Suggested mode based on score difference
   */
  private determineSuggestedMode(
    empatheticScore: number,
    pragmaticScore: number
  ): 'balanced' | 'empathetic' | 'pragmatic' {
    const threshold = 15; // Minimum score difference to suggest specific mode

    if (Math.abs(empatheticScore - pragmaticScore) < threshold) {
      return 'balanced';
    }

    return empatheticScore > pragmaticScore ? 'empathetic' : 'pragmatic';
  }

  /**
   * Determines if a mode change should be suggested based on analysis
   * Considers confidence, current mode, and score differentials
   *
   * @param currentMode - Current communication mode
   * @param analysisResult - Text analysis result
   * @returns True if mode change should be suggested
   */
  shouldSuggestModeChange(
    currentMode: 'balanced' | 'empathetic' | 'pragmatic',
    analysisResult: TextAnalysisResult
  ): boolean {
    // Only suggest if we have high confidence in our analysis
    if (analysisResult.confidence < 60) {
      return false;
    }

    // Don't suggest if already in the recommended mode
    if (currentMode === analysisResult.suggestedMode) {
      return false;
    }

    // For balanced mode, only suggest change if there's a strong preference
    if (currentMode === 'balanced') {
      const maxScore = Math.max(
        analysisResult.empatheticScore,
        analysisResult.pragmaticScore
      );
      return maxScore > 70;
    }

    // For specific modes, suggest change if opposite score is significantly higher
    const scoreDifference = 30; // Minimum difference to trigger change

    if (
      currentMode === 'empathetic' &&
      analysisResult.pragmaticScore > analysisResult.empatheticScore + scoreDifference
    ) {
      return true;
    }

    if (
      currentMode === 'pragmatic' &&
      analysisResult.empatheticScore > analysisResult.pragmaticScore + scoreDifference
    ) {
      return true;
    }

    return false;
  }
}

export const createTextAnalyzer = () => new TextAnalyzer();
