/**
 * Importance Scorer - Detect and score content importance
 * Multi-factor scoring for exam relevance
 */

const textProcessor = require('./textProcessor');
const keywordExtractor = require('./keywordExtractor');

class ImportanceScorer {
  constructor() {
    // Tags that can be applied based on analysis
    this.availableTags = [
      'Exam Important',
      'High Weightage',
      'Quick Revision',
      'Must Read',
      'Formula Heavy',
      'Definition Rich',
      'PYQ Frequent',
      'Low Priority'
    ];

    // Weights for different scoring factors
    this.weights = {
      keywordDensity: 0.20,
      definitionPresence: 0.20,
      formulaPresence: 0.20,
      pyqMatch: 0.25,
      studentRating: 0.15
    };
  }

  /**
   * Calculate overall importance score (0-100)
   */
  calculateImportanceScore(note, options = {}) {
    const content = this.getNoteContent(note);
    if (!content) return 0;

    let score = 0;

    // Keyword Density Score (0-20)
    const keywords = keywordExtractor.extractKeywords(content, 15);
    const examKeywords = keywords.filter(k => k.isDomainTerm || k.importance === 'critical');
    const keywordScore = Math.min((examKeywords.length / 15) * 20, 20);
    score += keywordScore * this.weights.keywordDensity * 5;

    // Definition Presence Score (0-20)
    const definitions = textProcessor.extractDefinitions(content);
    const definitionScore = Math.min(definitions.length * 5, 20);
    score += definitionScore * this.weights.definitionPresence * 5;

    // Formula Presence Score (0-20)
    const formulas = textProcessor.extractFormulas(content);
    const formulaScore = Math.min(formulas.length * 4, 20);
    score += formulaScore * this.weights.formulaPresence * 5;

    // PYQ Match Score (0-25) - Based on provided PYQ data
    const pyqScore = options.pyqMatches ? Math.min(options.pyqMatches * 5, 25) : 10;
    score += pyqScore * this.weights.pyqMatch * 4;

    // Student Rating Score (0-15)
    const rating = note.averageRating || note.rating || 3;
    const ratingScore = (rating / 5) * 15;
    score += ratingScore * this.weights.studentRating * 6.67;

    // Bonus for important indicators in title
    if (note.title && textProcessor.hasImportantIndicators(note.title)) {
      score += 5;
    }

    return Math.round(Math.min(score, 100));
  }

  /**
   * Determine tags based on note analysis
   */
  determineTags(note, importanceScore) {
    const tags = [];
    const content = this.getNoteContent(note);

    // Exam Important (score > 70)
    if (importanceScore >= 70) {
      tags.push('Exam Important');
    }

    // Must Read (score > 85)
    if (importanceScore >= 85) {
      tags.push('Must Read');
    }

    // High Weightage (based on PYQ or high score)
    if (importanceScore >= 75 || (note.pyqMatches && note.pyqMatches > 2)) {
      tags.push('High Weightage');
    }

    // Quick Revision (has formulas or definitions)
    const hasFormulas = textProcessor.hasFormulas(content);
    const hasDefinitions = textProcessor.hasDefinitions(content);
    if (hasFormulas || hasDefinitions) {
      tags.push('Quick Revision');
    }

    // Formula Heavy
    const formulas = textProcessor.extractFormulas(content);
    if (formulas.length >= 3) {
      tags.push('Formula Heavy');
    }

    // Definition Rich
    const definitions = textProcessor.extractDefinitions(content);
    if (definitions.length >= 3) {
      tags.push('Definition Rich');
    }

    // Low Priority (score < 40)
    if (importanceScore < 40 && tags.length === 0) {
      tags.push('Low Priority');
    }

    return tags;
  }

  /**
   * Get combined content from note
   */
  getNoteContent(note) {
    let content = note.title || '';
    content += ' ' + (note.description || '');
    content += ' ' + (note.content || '');
    if (note.topics && Array.isArray(note.topics)) {
      content += ' ' + note.topics.join(' ');
    }
    return content;
  }

  /**
   * Full analysis of a note
   */
  analyzeNote(note, options = {}) {
    const content = this.getNoteContent(note);
    const importanceScore = this.calculateImportanceScore(note, options);
    const tags = this.determineTags(note, importanceScore);
    const keywords = keywordExtractor.extractKeywords(content, 10);
    const definitions = textProcessor.extractDefinitions(content);
    const formulas = textProcessor.extractFormulas(content);

    return {
      importanceScore,
      tags,
      keywords: keywords.map(k => ({ word: k.word, importance: k.importance })),
      stats: {
        wordCount: textProcessor.wordCount(content),
        definitionCount: definitions.length,
        formulaCount: formulas.length,
        keywordCount: keywords.filter(k => k.isDomainTerm).length,
        complexity: textProcessor.calculateComplexity(content)
      },
      examRelevance: this.categorizeExamRelevance(importanceScore),
      recommendations: this.generateRecommendations(importanceScore, tags, content)
    };
  }

  /**
   * Categorize exam relevance level
   */
  categorizeExamRelevance(score) {
    if (score >= 85) return { level: 'Critical', color: 'red', priority: 1 };
    if (score >= 70) return { level: 'High', color: 'orange', priority: 2 };
    if (score >= 50) return { level: 'Medium', color: 'yellow', priority: 3 };
    if (score >= 30) return { level: 'Low', color: 'blue', priority: 4 };
    return { level: 'Optional', color: 'gray', priority: 5 };
  }

  /**
   * Generate recommendations for improvement
   */
  generateRecommendations(score, tags, content) {
    const recommendations = [];

    if (score < 50) {
      recommendations.push('Consider adding more definitions and key concepts');
    }

    if (!textProcessor.hasFormulas(content)) {
      recommendations.push('Add relevant formulas if applicable');
    }

    if (textProcessor.wordCount(content) < 100) {
      recommendations.push('Content seems brief - consider adding more detail');
    }

    if (!textProcessor.hasDefinitions(content)) {
      recommendations.push('Include clear definitions for key terms');
    }

    if (!tags.includes('Exam Important') && score > 40) {
      recommendations.push('Link to previous year questions to boost relevance');
    }

    return recommendations;
  }

  /**
   * Batch analyze multiple notes
   */
  batchAnalyze(notes, options = {}) {
    return notes.map(note => ({
      noteId: note._id,
      title: note.title,
      ...this.analyzeNote(note, options)
    }));
  }

  /**
   * Rank notes by importance
   */
  rankByImportance(notes) {
    const analyzed = this.batchAnalyze(notes);
    return analyzed.sort((a, b) => b.importanceScore - a.importanceScore);
  }

  /**
   * Filter exam-ready notes
   */
  filterExamReady(notes, minScore = 60) {
    const analyzed = this.batchAnalyze(notes);
    return analyzed.filter(n => n.importanceScore >= minScore);
  }
}

module.exports = new ImportanceScorer();
