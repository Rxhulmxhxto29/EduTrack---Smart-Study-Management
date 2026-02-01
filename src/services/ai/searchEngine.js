/**
 * Search Engine - AI-powered smart search
 * Natural language query processing and relevance ranking
 */

const textProcessor = require('./textProcessor');
const keywordExtractor = require('./keywordExtractor');
const similarityEngine = require('./similarityEngine');

class SearchEngine {
  constructor() {
    // Query patterns for NLP parsing
    this.queryPatterns = [
      {
        pattern: /explain\s+(.+?)\s+for\s+(\d+)\s*marks?/i,
        type: 'detailed',
        extract: (match) => ({ topic: match[1], marks: parseInt(match[2]) })
      },
      {
        pattern: /important\s+(?:questions?|topics?)\s+(?:for|in|of)?\s*(?:unit)?\s*(\d+|.+)/i,
        type: 'important',
        extract: (match) => ({ unit: match[1] })
      },
      {
        pattern: /quick\s+revision\s+(?:for|of)?\s*(.+)/i,
        type: 'revision',
        extract: (match) => ({ topic: match[1] })
      },
      {
        pattern: /pyq\s+(?:topics?|questions?)?\s*(?:in|for|of)?\s*(.+)/i,
        type: 'pyq',
        extract: (match) => ({ topic: match[1] })
      },
      {
        pattern: /formula(?:s)?\s+(?:for|in|of)?\s*(.+)/i,
        type: 'formula',
        extract: (match) => ({ topic: match[1] })
      },
      {
        pattern: /definition(?:s)?\s+(?:for|in|of)?\s*(.+)/i,
        type: 'definition',
        extract: (match) => ({ topic: match[1] })
      },
      {
        pattern: /what\s+is\s+(.+)/i,
        type: 'definition',
        extract: (match) => ({ topic: match[1] })
      }
    ];
  }

  /**
   * Parse natural language query
   */
  parseQuery(query) {
    const normalizedQuery = query.trim().toLowerCase();

    // Try to match patterns
    for (const { pattern, type, extract } of this.queryPatterns) {
      const match = normalizedQuery.match(pattern);
      if (match) {
        return {
          type,
          params: extract(match),
          originalQuery: query,
          keywords: textProcessor.process(query)
        };
      }
    }

    // Default: keyword search
    return {
      type: 'keyword',
      params: {},
      originalQuery: query,
      keywords: textProcessor.process(query)
    };
  }

  /**
   * Calculate relevance score for a note against query
   */
  calculateRelevance(note, parsedQuery, options = {}) {
    const content = this.getNoteContent(note);
    let score = 0;

    // Keyword match score (30%)
    const keywordScore = this.keywordMatchScore(content, parsedQuery.keywords);
    score += keywordScore * 0.3;

    // Title match bonus (15%)
    if (note.title) {
      const titleMatch = this.keywordMatchScore(note.title.toLowerCase(), parsedQuery.keywords);
      score += titleMatch * 0.15;
    }

    // AI importance score (25%)
    if (note.aiScore?.importanceScore) {
      score += (note.aiScore.importanceScore / 100) * 0.25;
    }

    // Student rating (15%)
    const rating = note.averageRating || note.rating || 3;
    score += (rating / 5) * 0.15;

    // PYQ frequency bonus (10%)
    if (note.pyqMatches && note.pyqMatches.length > 0) {
      score += Math.min(note.pyqMatches.length * 0.02, 0.1);
    }

    // Recency bonus (5%)
    if (note.updatedAt) {
      const daysSinceUpdate = (Date.now() - new Date(note.updatedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 30) {
        score += 0.05 * (1 - daysSinceUpdate / 30);
      }
    }

    // Query type specific bonuses
    score += this.queryTypeBonus(note, parsedQuery);

    return Math.min(score * 100, 100);
  }

  /**
   * Calculate keyword match score
   */
  keywordMatchScore(text, keywords) {
    if (!text || !keywords || keywords.length === 0) return 0;

    const textLower = text.toLowerCase();
    const textTokens = new Set(textProcessor.process(text));
    
    let matchCount = 0;
    for (const keyword of keywords) {
      if (textLower.includes(keyword) || textTokens.has(keyword)) {
        matchCount++;
      }
    }

    return matchCount / keywords.length;
  }

  /**
   * Query type specific scoring bonus
   */
  queryTypeBonus(note, parsedQuery) {
    const content = this.getNoteContent(note);
    let bonus = 0;

    switch (parsedQuery.type) {
      case 'formula':
        if (textProcessor.hasFormulas(content)) {
          bonus += 0.15;
        }
        break;
      
      case 'definition':
        if (textProcessor.hasDefinitions(content)) {
          bonus += 0.15;
        }
        break;
      
      case 'revision':
        // Prefer shorter, summary-like notes
        const wordCount = textProcessor.wordCount(content);
        if (wordCount < 500) {
          bonus += 0.1;
        }
        if (note.aiTags?.includes('Quick Revision')) {
          bonus += 0.1;
        }
        break;
      
      case 'important':
        if (note.aiTags?.includes('Exam Important') || note.aiTags?.includes('Must Read')) {
          bonus += 0.15;
        }
        break;
      
      case 'pyq':
        if (note.pyqMatches && note.pyqMatches.length > 0) {
          bonus += 0.2;
        }
        break;
      
      case 'detailed':
        // Prefer longer, comprehensive notes for high marks questions
        if (parsedQuery.params.marks >= 10) {
          const wordCount = textProcessor.wordCount(content);
          if (wordCount > 500) {
            bonus += 0.1;
          }
        }
        break;
    }

    return bonus;
  }

  /**
   * Get note content for search
   */
  getNoteContent(note) {
    let content = note.title || '';
    content += ' ' + (note.description || '');
    content += ' ' + (note.content || '');
    if (note.topics && Array.isArray(note.topics)) {
      content += ' ' + note.topics.join(' ');
    }
    if (note.aiKeywords) {
      content += ' ' + note.aiKeywords.map(k => k.word).join(' ');
    }
    return content;
  }

  /**
   * Smart search across notes
   */
  search(query, notes, options = {}) {
    if (!query || !notes || notes.length === 0) {
      return { results: [], parsedQuery: null };
    }

    const parsedQuery = this.parseQuery(query);
    
    // Calculate relevance for each note
    const scoredNotes = notes.map(note => ({
      note,
      relevance: this.calculateRelevance(note, parsedQuery, options),
      matchType: parsedQuery.type
    }));

    // Filter by minimum relevance
    const minRelevance = options.minRelevance || 10;
    const filteredNotes = scoredNotes.filter(n => n.relevance >= minRelevance);

    // Sort by relevance
    filteredNotes.sort((a, b) => b.relevance - a.relevance);

    // Limit results
    const maxResults = options.maxResults || 20;
    const results = filteredNotes.slice(0, maxResults);

    return {
      results,
      parsedQuery,
      totalMatches: filteredNotes.length,
      queryType: parsedQuery.type
    };
  }

  /**
   * Search with filters
   */
  searchWithFilters(query, notes, filters = {}) {
    let filteredNotes = [...notes];

    // Apply filters before search
    if (filters.subject) {
      filteredNotes = filteredNotes.filter(n => n.subject === filters.subject);
    }

    if (filters.unit) {
      filteredNotes = filteredNotes.filter(n => n.unit === filters.unit);
    }

    if (filters.minRating) {
      filteredNotes = filteredNotes.filter(n => 
        (n.averageRating || n.rating || 0) >= filters.minRating
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredNotes = filteredNotes.filter(n =>
        filters.tags.some(tag => n.aiTags?.includes(tag))
      );
    }

    if (filters.examMode) {
      filteredNotes = filteredNotes.filter(n =>
        n.aiScore?.importanceScore >= 60 || n.aiTags?.includes('Exam Important')
      );
    }

    return this.search(query, filteredNotes);
  }

  /**
   * Get search suggestions based on partial query
   */
  getSuggestions(partialQuery, notes, maxSuggestions = 5) {
    const keywords = textProcessor.process(partialQuery);
    
    if (keywords.length === 0) return [];

    // Collect all unique topics and titles
    const allTerms = new Set();
    
    for (const note of notes) {
      if (note.title) {
        const titleWords = textProcessor.tokenize(note.title);
        titleWords.forEach(w => allTerms.add(w));
      }
      if (note.topics) {
        note.topics.forEach(t => allTerms.add(t.toLowerCase()));
      }
      if (note.aiKeywords) {
        note.aiKeywords.forEach(k => allTerms.add(k.word));
      }
    }

    // Find matching terms
    const suggestions = [];
    const lastKeyword = keywords[keywords.length - 1];

    for (const term of allTerms) {
      if (term.startsWith(lastKeyword) && term !== lastKeyword) {
        suggestions.push(term);
      }
    }

    return suggestions.slice(0, maxSuggestions);
  }

  /**
   * Find related searches
   */
  getRelatedSearches(query, notes) {
    const parsedQuery = this.parseQuery(query);
    const relatedTerms = new Set();

    // Find notes that match the query
    const results = this.search(query, notes, { maxResults: 10 });

    // Extract keywords from matching notes
    for (const result of results.results) {
      if (result.note.aiKeywords) {
        result.note.aiKeywords.slice(0, 3).forEach(k => relatedTerms.add(k.word));
      }
      if (result.note.topics) {
        result.note.topics.slice(0, 2).forEach(t => relatedTerms.add(t));
      }
    }

    // Remove original query terms
    parsedQuery.keywords.forEach(k => relatedTerms.delete(k));

    return Array.from(relatedTerms).slice(0, 5);
  }
}

module.exports = new SearchEngine();
