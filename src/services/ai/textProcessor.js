/**
 * Text Processor - Core text processing utilities
 * Handles tokenization, normalization, and text analysis
 */

class TextProcessor {
  constructor() {
    // Common English stop words to filter out
    this.stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
      'we', 'they', 'what', 'which', 'who', 'whom', 'when', 'where', 'why',
      'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
      'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than',
      'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then'
    ]);

    // Technical/academic terms that are important
    this.importantIndicators = [
      'definition', 'formula', 'theorem', 'algorithm', 'principle',
      'law', 'equation', 'important', 'key', 'main', 'primary',
      'fundamental', 'essential', 'critical', 'significant', 'major',
      'note', 'remember', 'example', 'proof', 'derivation', 'solution'
    ];

    // Patterns for identifying definitions
    this.definitionPatterns = [
      /is defined as/gi,
      /refers to/gi,
      /is a/gi,
      /are called/gi,
      /known as/gi,
      /means/gi,
      /definition:/gi
    ];

    // Patterns for identifying formulas
    this.formulaPatterns = [
      /[a-zA-Z]\s*=\s*[a-zA-Z0-9\s\+\-\*\/\(\)]+/g,
      /∑|∏|∫|√|±|≠|≤|≥|∞/g,
      /\^[0-9]+/g,
      /[a-zA-Z]_[a-zA-Z0-9]/g
    ];
  }

  /**
   * Tokenize text into words
   */
  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  /**
   * Remove stop words from tokens
   */
  removeStopWords(tokens) {
    return tokens.filter(token => !this.stopWords.has(token));
  }

  /**
   * Simple stemming (remove common suffixes)
   */
  stem(word) {
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 's', 'es', 'tion', 'ness'];
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.slice(0, -suffix.length);
      }
    }
    return word;
  }

  /**
   * Process text - full pipeline
   */
  process(text) {
    const tokens = this.tokenize(text);
    const filtered = this.removeStopWords(tokens);
    const stemmed = filtered.map(token => this.stem(token));
    return stemmed;
  }

  /**
   * Split text into sentences
   */
  splitSentences(text) {
    if (!text) return [];
    return text
      .replace(/([.!?])\s+/g, '$1|')
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }

  /**
   * Count words in text
   */
  wordCount(text) {
    if (!text) return 0;
    return text.split(/\s+/).filter(w => w.length > 0).length;
  }

  /**
   * Check if text contains definitions
   */
  hasDefinitions(text) {
    if (!text) return false;
    return this.definitionPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Check if text contains formulas
   */
  hasFormulas(text) {
    if (!text) return false;
    return this.formulaPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Extract definitions from text
   */
  extractDefinitions(text) {
    if (!text) return [];
    const sentences = this.splitSentences(text);
    return sentences.filter(sentence => 
      this.definitionPatterns.some(pattern => pattern.test(sentence))
    );
  }

  /**
   * Extract formulas from text
   */
  extractFormulas(text) {
    if (!text) return [];
    const formulas = [];
    for (const pattern of this.formulaPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        formulas.push(...matches);
      }
    }
    return [...new Set(formulas)];
  }

  /**
   * Check if text contains important indicators
   */
  hasImportantIndicators(text) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return this.importantIndicators.some(indicator => 
      lowerText.includes(indicator)
    );
  }

  /**
   * Calculate text complexity score (0-100)
   */
  calculateComplexity(text) {
    if (!text) return 0;
    
    const sentences = this.splitSentences(text);
    const words = this.tokenize(text);
    
    if (sentences.length === 0 || words.length === 0) return 0;

    const avgSentenceLength = words.length / sentences.length;
    const uniqueWords = new Set(words).size;
    const vocabularyRichness = uniqueWords / words.length;

    // Score based on sentence length and vocabulary
    let score = 0;
    score += Math.min(avgSentenceLength * 2, 40); // Max 40 for sentence length
    score += vocabularyRichness * 60; // Max 60 for vocabulary richness

    return Math.round(Math.min(score, 100));
  }

  /**
   * Generate n-grams from text
   */
  generateNgrams(text, n = 2) {
    const tokens = this.tokenize(text);
    const ngrams = [];
    
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(' '));
    }
    
    return ngrams;
  }
}

module.exports = new TextProcessor();
