/**
 * Keyword Extractor - Extract important keywords using TF-IDF
 * Identifies key terms, concepts, and exam-relevant words
 */

const textProcessor = require('./textProcessor');

class KeywordExtractor {
  constructor() {
    // Domain-specific boost words (engineering/academic)
    this.boostWords = new Set([
      'algorithm', 'theorem', 'formula', 'equation', 'principle',
      'definition', 'concept', 'method', 'technique', 'process',
      'structure', 'function', 'system', 'model', 'analysis',
      'design', 'implementation', 'complexity', 'efficiency',
      'data', 'database', 'network', 'memory', 'processor',
      'binary', 'tree', 'graph', 'array', 'list', 'stack', 'queue',
      'sorting', 'searching', 'recursion', 'iteration', 'loop',
      'class', 'object', 'inheritance', 'polymorphism', 'encapsulation',
      'sql', 'html', 'css', 'javascript', 'python', 'java', 'cpp'
    ]);
  }

  /**
   * Calculate Term Frequency (TF)
   */
  calculateTF(tokens) {
    const tf = {};
    const totalTokens = tokens.length;

    for (const token of tokens) {
      tf[token] = (tf[token] || 0) + 1;
    }

    // Normalize by total tokens
    for (const token in tf) {
      tf[token] = tf[token] / totalTokens;
    }

    return tf;
  }

  /**
   * Calculate Inverse Document Frequency (IDF)
   * For single document, use word frequency as proxy
   */
  calculateIDF(tokens) {
    const uniqueTokens = new Set(tokens);
    const totalUnique = uniqueTokens.size;
    const idf = {};

    for (const token of uniqueTokens) {
      // Simple IDF approximation for single document
      const frequency = tokens.filter(t => t === token).length;
      idf[token] = Math.log(tokens.length / frequency) + 1;
    }

    return idf;
  }

  /**
   * Calculate TF-IDF scores
   */
  calculateTFIDF(text) {
    const tokens = textProcessor.process(text);
    const tf = this.calculateTF(tokens);
    const idf = this.calculateIDF(tokens);
    const tfidf = {};

    for (const token in tf) {
      let score = tf[token] * (idf[token] || 1);
      
      // Boost domain-specific words
      if (this.boostWords.has(token)) {
        score *= 1.5;
      }

      tfidf[token] = score;
    }

    return tfidf;
  }

  /**
   * Extract top keywords from text
   */
  extractKeywords(text, topN = 15) {
    if (!text || text.length < 10) return [];

    const tfidf = this.calculateTFIDF(text);
    
    // Sort by score and get top N
    const keywords = Object.entries(tfidf)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word, score]) => ({
        word,
        score: Math.round(score * 100) / 100,
        importance: this.categorizeImportance(score),
        isDomainTerm: this.boostWords.has(word)
      }));

    return keywords;
  }

  /**
   * Categorize keyword importance
   */
  categorizeImportance(score) {
    if (score > 0.15) return 'critical';
    if (score > 0.08) return 'high';
    if (score > 0.04) return 'medium';
    return 'low';
  }

  /**
   * Extract key phrases (2-3 word combinations)
   */
  extractKeyPhrases(text, topN = 10) {
    if (!text) return [];

    const bigrams = textProcessor.generateNgrams(text, 2);
    const trigrams = textProcessor.generateNgrams(text, 3);
    
    // Count phrase frequencies
    const phraseCount = {};
    
    for (const phrase of [...bigrams, ...trigrams]) {
      // Filter out phrases with stop words
      const words = phrase.split(' ');
      const hasStopWord = words.some(w => textProcessor.stopWords.has(w));
      
      if (!hasStopWord) {
        phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
      }
    }

    // Sort and return top phrases
    return Object.entries(phraseCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([phrase, count]) => ({
        phrase,
        frequency: count,
        importance: count > 3 ? 'high' : count > 1 ? 'medium' : 'low'
      }));
  }

  /**
   * Find exam-relevant keywords
   */
  findExamKeywords(text) {
    const keywords = this.extractKeywords(text, 20);
    const phrases = this.extractKeyPhrases(text, 10);
    
    // Filter for exam relevance
    const examKeywords = keywords.filter(k => 
      k.isDomainTerm || k.importance === 'critical' || k.importance === 'high'
    );

    const examPhrases = phrases.filter(p => p.importance !== 'low');

    return {
      keywords: examKeywords,
      phrases: examPhrases,
      totalKeywords: keywords.length,
      examRelevantCount: examKeywords.length
    };
  }

  /**
   * Match keywords against a topic list
   */
  matchTopics(text, topics) {
    const textLower = text.toLowerCase();
    const matches = [];

    for (const topic of topics) {
      const topicLower = topic.toLowerCase();
      if (textLower.includes(topicLower)) {
        matches.push({
          topic,
          found: true,
          frequency: (textLower.match(new RegExp(topicLower, 'g')) || []).length
        });
      }
    }

    return matches;
  }
}

module.exports = new KeywordExtractor();
