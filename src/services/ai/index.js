/**
 * AI Service - Main entry point for all AI features
 * Combines all AI modules into a unified service
 */

const textProcessor = require('./textProcessor');
const keywordExtractor = require('./keywordExtractor');
const similarityEngine = require('./similarityEngine');
const summarizer = require('./summarizer');
const importanceScorer = require('./importanceScorer');
const searchEngine = require('./searchEngine');

class AIService {
  /**
   * Analyze a note - Full AI analysis
   */
  analyzeNote(note) {
    const content = this.getNoteContent(note);
    
    // Get importance analysis
    const importanceAnalysis = importanceScorer.analyzeNote(note);
    
    // Generate summaries
    const examSummary = summarizer.generateExamSummary(content);
    
    // Extract keywords
    const keywords = keywordExtractor.findExamKeywords(content);

    return {
      noteId: note._id,
      title: note.title,
      aiScore: {
        quality: this.calculateQualityScore(note),
        completeness: this.calculateCompletenessScore(content),
        examRelevance: importanceAnalysis.importanceScore,
        overall: Math.round(
          (this.calculateQualityScore(note) * 0.3) +
          (this.calculateCompletenessScore(content) * 0.3) +
          (importanceAnalysis.importanceScore * 0.4)
        )
      },
      aiTags: importanceAnalysis.tags,
      keywords: keywords.keywords,
      summary: {
        short: examSummary.summary,
        detailed: summarizer.generateDetailedSummary(content),
        bulletPoints: summarizer.generateBulletPoints(content),
        keyPoints: examSummary.keyPoints
      },
      stats: importanceAnalysis.stats,
      examRelevance: importanceAnalysis.examRelevance,
      recommendations: importanceAnalysis.recommendations,
      formulas: examSummary.formulas,
      definitions: examSummary.definitions
    };
  }

  /**
   * Calculate note quality score
   */
  calculateQualityScore(note) {
    let score = 0;
    const content = this.getNoteContent(note);

    // Title quality (15%)
    if (note.title && note.title.length > 5) {
      score += 15;
    }

    // Content length (25%)
    const wordCount = textProcessor.wordCount(content);
    if (wordCount > 500) score += 25;
    else if (wordCount > 200) score += 20;
    else if (wordCount > 100) score += 15;
    else if (wordCount > 50) score += 10;

    // Has description (10%)
    if (note.description && note.description.length > 20) {
      score += 10;
    }

    // Has topics/tags (10%)
    if (note.topics && note.topics.length > 0) {
      score += 10;
    }

    // Complexity score (20%)
    const complexity = textProcessor.calculateComplexity(content);
    score += (complexity / 100) * 20;

    // Student rating (20%)
    const rating = note.averageRating || note.rating || 3;
    score += (rating / 5) * 20;

    return Math.round(Math.min(score, 100));
  }

  /**
   * Calculate completeness score
   */
  calculateCompletenessScore(content) {
    let score = 0;

    // Word count (30%)
    const wordCount = textProcessor.wordCount(content);
    if (wordCount > 1000) score += 30;
    else if (wordCount > 500) score += 25;
    else if (wordCount > 200) score += 20;
    else if (wordCount > 100) score += 15;
    else score += (wordCount / 100) * 10;

    // Has definitions (25%)
    const definitions = textProcessor.extractDefinitions(content);
    if (definitions.length >= 3) score += 25;
    else if (definitions.length >= 1) score += definitions.length * 8;

    // Has formulas (25%)
    const formulas = textProcessor.extractFormulas(content);
    if (formulas.length >= 3) score += 25;
    else if (formulas.length >= 1) score += formulas.length * 8;

    // Sentence variety (20%)
    const sentences = textProcessor.splitSentences(content);
    if (sentences.length >= 10) score += 20;
    else score += sentences.length * 2;

    return Math.round(Math.min(score, 100));
  }

  /**
   * Get note content string
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
   * Smart search with NLP
   */
  smartSearch(query, notes, options = {}) {
    return searchEngine.search(query, notes, options);
  }

  /**
   * Search with filters
   */
  searchWithFilters(query, notes, filters = {}) {
    return searchEngine.searchWithFilters(query, notes, filters);
  }

  /**
   * Get search suggestions
   */
  getSearchSuggestions(partialQuery, notes) {
    return searchEngine.getSuggestions(partialQuery, notes);
  }

  /**
   * Find duplicate notes
   */
  findDuplicates(notes, threshold = 0.75) {
    return similarityEngine.findDuplicates(notes, threshold);
  }

  /**
   * Find similar notes
   */
  findSimilarNotes(targetNote, allNotes, topN = 5) {
    return similarityEngine.findSimilarNotes(targetNote, allNotes, topN);
  }

  /**
   * Generate note summary
   */
  generateSummary(text, type = 'short') {
    if (type === 'detailed') {
      return summarizer.generateDetailedSummary(text);
    } else if (type === 'exam') {
      return summarizer.generateExamSummary(text);
    } else if (type === 'bullets') {
      return summarizer.generateBulletPoints(text);
    } else if (type === 'revision') {
      return summarizer.generateRevisionCard(text);
    }
    return summarizer.generateShortSummary(text);
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text, topN = 15) {
    return keywordExtractor.extractKeywords(text, topN);
  }

  /**
   * Analyze study progress and find gaps
   */
  analyzeStudyGaps(progress, subjects, notes) {
    const analysis = {
      completedTopics: [],
      pendingTopics: [],
      weakAreas: [],
      strongAreas: [],
      suggestedTopics: [],
      overallProgress: 0
    };

    // Analyze each subject
    for (const subject of subjects) {
      const subjectNotes = notes.filter(n => 
        n.subject?.toString() === subject._id?.toString()
      );
      
      const subjectProgress = progress.find(p => 
        p.subject?.toString() === subject._id?.toString()
      );

      // Get completed topics
      const completedTopics = subjectProgress?.completedTopics || [];
      const allTopics = subject.units?.flatMap(u => u.topics) || [];
      const pendingTopics = allTopics.filter(t => !completedTopics.includes(t));

      analysis.completedTopics.push(...completedTopics.map(t => ({
        topic: t,
        subject: subject.name
      })));

      analysis.pendingTopics.push(...pendingTopics.map(t => ({
        topic: t,
        subject: subject.name
      })));

      // Analyze weak areas (low confidence or unvisited important topics)
      const importantNotes = subjectNotes.filter(n => 
        n.aiScore?.examRelevance >= 70 || n.aiTags?.includes('Exam Important')
      );

      for (const note of importantNotes) {
        const isCompleted = completedTopics.some(t => 
          note.title?.toLowerCase().includes(t.toLowerCase())
        );

        if (!isCompleted) {
          analysis.weakAreas.push({
            topic: note.title,
            subject: subject.name,
            importance: note.aiScore?.examRelevance || 50,
            reason: 'Important topic not yet studied'
          });
        }
      }
    }

    // Calculate overall progress
    const totalTopics = analysis.completedTopics.length + analysis.pendingTopics.length;
    analysis.overallProgress = totalTopics > 0 
      ? Math.round((analysis.completedTopics.length / totalTopics) * 100)
      : 0;

    // Generate suggested topics (prioritize important pending topics)
    analysis.suggestedTopics = analysis.weakAreas
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5)
      .map(w => ({
        topic: w.topic,
        subject: w.subject,
        priority: w.importance >= 80 ? 'High' : w.importance >= 60 ? 'Medium' : 'Low',
        reason: w.reason
      }));

    return analysis;
  }

  /**
   * Get exam-ready notes (filtered by AI importance)
   */
  getExamReadyNotes(notes, minScore = 60) {
    const analyzed = notes.map(note => ({
      ...note,
      aiAnalysis: this.analyzeNote(note)
    }));

    return analyzed
      .filter(n => n.aiAnalysis.aiScore.examRelevance >= minScore)
      .sort((a, b) => b.aiAnalysis.aiScore.examRelevance - a.aiAnalysis.aiScore.examRelevance);
  }

  /**
   * Generate study insights
   */
  generateInsights(notes, progress) {
    const insights = {
      totalNotes: notes.length,
      analyzedNotes: 0,
      importantNotes: 0,
      averageQuality: 0,
      topKeywords: [],
      duplicatesFound: 0,
      recommendations: []
    };

    // Analyze all notes
    let totalQuality = 0;
    const allKeywords = {};

    for (const note of notes) {
      const analysis = this.analyzeNote(note);
      insights.analyzedNotes++;
      
      if (analysis.aiScore.examRelevance >= 70) {
        insights.importantNotes++;
      }

      totalQuality += analysis.aiScore.quality;

      // Collect keywords
      for (const kw of analysis.keywords) {
        allKeywords[kw.word] = (allKeywords[kw.word] || 0) + 1;
      }
    }

    // Calculate average quality
    insights.averageQuality = insights.analyzedNotes > 0
      ? Math.round(totalQuality / insights.analyzedNotes)
      : 0;

    // Get top keywords
    insights.topKeywords = Object.entries(allKeywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    // Find duplicates
    const duplicates = this.findDuplicates(notes);
    insights.duplicatesFound = duplicates.length;

    // Generate recommendations
    if (insights.importantNotes < notes.length * 0.3) {
      insights.recommendations.push('Most notes have low exam relevance. Consider adding more important content.');
    }
    if (insights.averageQuality < 60) {
      insights.recommendations.push('Note quality can be improved. Add more definitions and formulas.');
    }
    if (insights.duplicatesFound > 0) {
      insights.recommendations.push(`Found ${insights.duplicatesFound} potential duplicate notes. Consider merging them.`);
    }

    return insights;
  }

  /**
   * Match notes with PYQs (Previous Year Questions)
   */
  matchPYQs(note, pyqs) {
    const noteContent = this.getNoteContent(note);
    const matches = [];

    for (const pyq of pyqs) {
      const pyqContent = pyq.question || pyq.content || '';
      const similarity = similarityEngine.calculateSimilarity(noteContent, pyqContent);

      if (similarity > 0.3) {
        matches.push({
          pyqId: pyq._id,
          question: pyq.question,
          year: pyq.year,
          similarity: Math.round(similarity * 100),
          marks: pyq.marks
        });
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Generate last 24-hour revision content
   */
  getLast24HourRevision(notes) {
    // Get top importance notes
    const analyzed = notes.map(note => ({
      note,
      analysis: this.analyzeNote(note)
    }));

    // Sort by exam relevance
    analyzed.sort((a, b) => 
      b.analysis.aiScore.examRelevance - a.analysis.aiScore.examRelevance
    );

    // Get top 20 most important notes with revision cards
    return analyzed.slice(0, 20).map(item => ({
      noteId: item.note._id,
      title: item.note.title,
      subject: item.note.subject,
      importance: item.analysis.aiScore.examRelevance,
      revisionCard: summarizer.generateRevisionCard(this.getNoteContent(item.note)),
      quickSummary: item.analysis.summary.short,
      keyPoints: item.analysis.summary.keyPoints?.slice(0, 3),
      tags: item.analysis.aiTags
    }));
  }
}

module.exports = new AIService();
