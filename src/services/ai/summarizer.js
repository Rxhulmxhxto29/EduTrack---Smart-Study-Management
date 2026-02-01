/**
 * Summarizer - Generate concise summaries from notes
 * Uses extractive summarization with TF-IDF sentence ranking
 */

const textProcessor = require('./textProcessor');
const keywordExtractor = require('./keywordExtractor');

class Summarizer {
  /**
   * Calculate sentence importance score
   */
  scoreSentence(sentence, keywords, position, totalSentences) {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();
    const words = textProcessor.tokenize(sentence);

    // Keyword presence (40%)
    const keywordScore = keywords.reduce((acc, kw) => {
      if (lowerSentence.includes(kw.word)) {
        return acc + kw.score;
      }
      return acc;
    }, 0);
    score += Math.min(keywordScore * 20, 40);

    // Position score (15%) - First and last sentences are important
    const positionScore = position < 3 || position > totalSentences - 3 ? 15 : 5;
    score += positionScore;

    // Definition presence (20%)
    if (textProcessor.hasDefinitions(sentence)) {
      score += 20;
    }

    // Formula presence (15%)
    if (textProcessor.hasFormulas(sentence)) {
      score += 15;
    }

    // Length score (10%) - Medium length sentences preferred
    const wordCount = words.length;
    if (wordCount >= 10 && wordCount <= 30) {
      score += 10;
    } else if (wordCount >= 5 && wordCount <= 40) {
      score += 5;
    }

    return score;
  }

  /**
   * Generate short summary (50-100 words)
   */
  generateShortSummary(text, maxWords = 80) {
    if (!text || text.length < 50) return text || '';

    const sentences = textProcessor.splitSentences(text);
    if (sentences.length === 0) return '';

    const keywords = keywordExtractor.extractKeywords(text, 10);
    
    // Score each sentence
    const scoredSentences = sentences.map((sentence, index) => ({
      sentence,
      score: this.scoreSentence(sentence, keywords, index, sentences.length),
      originalIndex: index
    }));

    // Sort by score
    scoredSentences.sort((a, b) => b.score - a.score);

    // Select top sentences until word limit
    const selectedSentences = [];
    let wordCount = 0;

    for (const item of scoredSentences) {
      const sentenceWords = textProcessor.wordCount(item.sentence);
      if (wordCount + sentenceWords <= maxWords) {
        selectedSentences.push(item);
        wordCount += sentenceWords;
      }
      if (wordCount >= maxWords * 0.8) break;
    }

    // Sort by original position for coherence
    selectedSentences.sort((a, b) => a.originalIndex - b.originalIndex);

    return selectedSentences.map(s => s.sentence).join(' ');
  }

  /**
   * Generate detailed summary (200-300 words)
   */
  generateDetailedSummary(text, maxWords = 250) {
    if (!text || text.length < 100) return text || '';

    const sentences = textProcessor.splitSentences(text);
    if (sentences.length === 0) return '';

    const keywords = keywordExtractor.extractKeywords(text, 15);
    
    // Score each sentence
    const scoredSentences = sentences.map((sentence, index) => ({
      sentence,
      score: this.scoreSentence(sentence, keywords, index, sentences.length),
      originalIndex: index
    }));

    // Sort by score
    scoredSentences.sort((a, b) => b.score - a.score);

    // Select top sentences
    const selectedSentences = [];
    let wordCount = 0;

    for (const item of scoredSentences) {
      const sentenceWords = textProcessor.wordCount(item.sentence);
      if (wordCount + sentenceWords <= maxWords) {
        selectedSentences.push(item);
        wordCount += sentenceWords;
      }
      if (wordCount >= maxWords * 0.9) break;
    }

    // Sort by original position
    selectedSentences.sort((a, b) => a.originalIndex - b.originalIndex);

    return selectedSentences.map(s => s.sentence).join(' ');
  }

  /**
   * Generate exam-focused summary with key points
   */
  generateExamSummary(text) {
    if (!text) return { summary: '', keyPoints: [], formulas: [], definitions: [] };

    const shortSummary = this.generateShortSummary(text, 100);
    const keywords = keywordExtractor.extractKeywords(text, 10);
    const definitions = textProcessor.extractDefinitions(text);
    const formulas = textProcessor.extractFormulas(text);

    // Extract key points (important sentences)
    const sentences = textProcessor.splitSentences(text);
    const keyPoints = sentences
      .filter(s => textProcessor.hasImportantIndicators(s) || textProcessor.hasDefinitions(s))
      .slice(0, 5);

    return {
      summary: shortSummary,
      keyPoints,
      formulas: formulas.slice(0, 10),
      definitions: definitions.slice(0, 5),
      keywords: keywords.map(k => k.word),
      wordCount: textProcessor.wordCount(text),
      summaryWordCount: textProcessor.wordCount(shortSummary),
      compressionRatio: Math.round((1 - textProcessor.wordCount(shortSummary) / textProcessor.wordCount(text)) * 100)
    };
  }

  /**
   * Generate bullet point summary
   */
  generateBulletPoints(text, maxPoints = 7) {
    if (!text) return [];

    const sentences = textProcessor.splitSentences(text);
    const keywords = keywordExtractor.extractKeywords(text, 10);

    // Score and select sentences
    const scoredSentences = sentences.map((sentence, index) => ({
      sentence,
      score: this.scoreSentence(sentence, keywords, index, sentences.length)
    }));

    scoredSentences.sort((a, b) => b.score - a.score);

    // Convert to bullet points
    return scoredSentences
      .slice(0, maxPoints)
      .map(item => {
        // Trim and clean the sentence
        let point = item.sentence.trim();
        // Capitalize first letter
        point = point.charAt(0).toUpperCase() + point.slice(1);
        return point;
      });
  }

  /**
   * Generate topic-wise summary
   */
  generateTopicSummary(text, topics) {
    if (!text || !topics || topics.length === 0) return {};

    const sentences = textProcessor.splitSentences(text);
    const topicSummaries = {};

    for (const topic of topics) {
      const topicLower = topic.toLowerCase();
      const relevantSentences = sentences.filter(s => 
        s.toLowerCase().includes(topicLower)
      );

      topicSummaries[topic] = {
        summary: relevantSentences.slice(0, 3).join(' '),
        sentenceCount: relevantSentences.length,
        found: relevantSentences.length > 0
      };
    }

    return topicSummaries;
  }

  /**
   * Generate revision card (ultra-short summary)
   */
  generateRevisionCard(text) {
    if (!text) return { title: '', points: [], quickFacts: [] };

    const keywords = keywordExtractor.extractKeywords(text, 5);
    const definitions = textProcessor.extractDefinitions(text).slice(0, 2);
    const formulas = textProcessor.extractFormulas(text).slice(0, 3);

    // Create quick facts from definitions
    const quickFacts = definitions.map(def => {
      // Shorten definition to key part
      const parts = def.split(/is defined as|refers to|is a|means/i);
      if (parts.length > 1) {
        return `${parts[0].trim()}: ${parts[1].trim().slice(0, 100)}...`;
      }
      return def.slice(0, 100);
    });

    return {
      keywords: keywords.map(k => k.word),
      quickFacts,
      formulas,
      totalWords: textProcessor.wordCount(text)
    };
  }
}

module.exports = new Summarizer();
