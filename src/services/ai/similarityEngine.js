/**
 * Similarity Engine - Detect duplicate and similar content
 * Uses Jaccard similarity and Cosine similarity for comparison
 */

const textProcessor = require('./textProcessor');

class SimilarityEngine {
  /**
   * Calculate Jaccard Similarity between two sets
   */
  jaccardSimilarity(set1, set2) {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  /**
   * Calculate Cosine Similarity between two texts
   */
  cosineSimilarity(text1, text2) {
    const tokens1 = textProcessor.process(text1);
    const tokens2 = textProcessor.process(text2);
    
    // Build vocabulary
    const vocabulary = new Set([...tokens1, ...tokens2]);
    
    // Build vectors
    const vector1 = this.buildVector(tokens1, vocabulary);
    const vector2 = this.buildVector(tokens2, vocabulary);
    
    // Calculate dot product
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      magnitude1 += vector1[i] * vector1[i];
      magnitude2 += vector2[i] * vector2[i];
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Build frequency vector from tokens
   */
  buildVector(tokens, vocabulary) {
    const freqMap = {};
    for (const token of tokens) {
      freqMap[token] = (freqMap[token] || 0) + 1;
    }
    
    return Array.from(vocabulary).map(word => freqMap[word] || 0);
  }

  /**
   * Calculate Levenshtein Distance (Edit Distance)
   */
  levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    
    // Create distance matrix
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    // Initialize first row and column
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    // Fill the matrix
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(
            dp[i - 1][j],     // deletion
            dp[i][j - 1],     // insertion
            dp[i - 1][j - 1]  // substitution
          );
        }
      }
    }
    
    return dp[m][n];
  }

  /**
   * Calculate combined similarity score
   */
  calculateSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;

    const tokens1 = new Set(textProcessor.process(text1));
    const tokens2 = new Set(textProcessor.process(text2));

    const jaccard = this.jaccardSimilarity(tokens1, tokens2);
    const cosine = this.cosineSimilarity(text1, text2);

    // Weighted combination
    return (jaccard * 0.4) + (cosine * 0.6);
  }

  /**
   * Find duplicates in a list of notes
   */
  findDuplicates(notes, threshold = 0.75) {
    const duplicates = [];
    const processed = new Set();

    for (let i = 0; i < notes.length; i++) {
      if (processed.has(notes[i]._id?.toString())) continue;

      const noteContent1 = this.getNoteContent(notes[i]);
      const duplicateGroup = {
        original: notes[i],
        duplicates: []
      };

      for (let j = i + 1; j < notes.length; j++) {
        if (processed.has(notes[j]._id?.toString())) continue;

        const noteContent2 = this.getNoteContent(notes[j]);
        const similarity = this.calculateSimilarity(noteContent1, noteContent2);

        if (similarity >= threshold) {
          duplicateGroup.duplicates.push({
            note: notes[j],
            similarity: Math.round(similarity * 100)
          });
          processed.add(notes[j]._id?.toString());
        }
      }

      if (duplicateGroup.duplicates.length > 0) {
        duplicates.push(duplicateGroup);
        processed.add(notes[i]._id?.toString());
      }
    }

    return duplicates;
  }

  /**
   * Get content from note for comparison
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
   * Find similar notes (not duplicates, but related)
   */
  findSimilarNotes(targetNote, allNotes, topN = 5, minSimilarity = 0.3) {
    const targetContent = this.getNoteContent(targetNote);
    const similarities = [];

    for (const note of allNotes) {
      // Skip the target note itself
      if (note._id?.toString() === targetNote._id?.toString()) continue;

      const noteContent = this.getNoteContent(note);
      const similarity = this.calculateSimilarity(targetContent, noteContent);

      if (similarity >= minSimilarity) {
        similarities.push({
          note,
          similarity: Math.round(similarity * 100)
        });
      }
    }

    // Sort by similarity and return top N
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN);
  }

  /**
   * Check if two texts are near-duplicates
   */
  isNearDuplicate(text1, text2, threshold = 0.8) {
    return this.calculateSimilarity(text1, text2) >= threshold;
  }

  /**
   * Calculate title similarity (for quick duplicate check)
   */
  titleSimilarity(title1, title2) {
    if (!title1 || !title2) return 0;
    
    const words1 = new Set(title1.toLowerCase().split(/\s+/));
    const words2 = new Set(title2.toLowerCase().split(/\s+/));
    
    return this.jaccardSimilarity(words1, words2);
  }
}

module.exports = new SimilarityEngine();
