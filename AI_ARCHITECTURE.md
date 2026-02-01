# EduTrack AI Architecture

## 🧠 AI-Powered Features Overview

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ AI Dashboard │  │Smart Search │  │ Exam Mode AI Filter    │ │
│  │ - Insights   │  │ - NLP Query │  │ - Important Only       │ │
│  │ - Gap Report │  │ - Relevance │  │ - Summaries View       │ │
│  │ - Weak Areas │  │ - PYQ Match │  │ - Last 24hr Revision   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Note AI Tags │  │ Quality    │  │ Duplicate Detection    │ │
│  │ - Important  │  │  Score     │  │ - Similar Notes        │ │
│  │ - PYQ Match  │  │  Display   │  │ - Merge Suggestions    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Express)                        │
├─────────────────────────────────────────────────────────────────┤
│  POST /api/ai/analyze-note      - Analyze & score a note        │
│  POST /api/ai/summarize         - Generate summary              │
│  GET  /api/ai/insights          - Get study insights            │
│  GET  /api/ai/gap-analysis      - Get gap analysis              │
│  POST /api/ai/smart-search      - AI-powered search             │
│  GET  /api/ai/duplicates        - Find duplicate notes          │
│  GET  /api/ai/exam-ready        - Get exam-ready content        │
│  POST /api/ai/detect-important  - Detect important content      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI SERVICE LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   AIService.js                          │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ ▸ summarizeText(text)         - Extractive summarization│   │
│  │ ▸ extractKeywords(text)       - Keyword extraction      │   │
│  │ ▸ detectImportance(note)      - Importance scoring      │   │
│  │ ▸ scoreNoteQuality(note)      - Quality assessment      │   │
│  │ ▸ findDuplicates(notes)       - Similarity detection    │   │
│  │ ▸ analyzeStudyGaps(progress)  - Gap analysis            │   │
│  │ ▸ smartSearch(query, notes)   - NLP-enhanced search     │   │
│  │ ▸ matchPYQs(note, pyqs)       - PYQ pattern matching    │   │
│  │ ▸ generateRevisionPlan()      - Study plan generation   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ TextProcessor   │  │ SimilarityEngine│  │ KeywordExtractor│ │
│  │ - Tokenize      │  │ - Jaccard       │  │ - TF-IDF        │ │
│  │ - Normalize     │  │ - Cosine        │  │ - N-grams       │ │
│  │ - Stem          │  │ - Levenshtein   │  │ - Frequency     │ │
│  └─────────────────┘  └─────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                           │
├─────────────────────────────────────────────────────────────────┤
│  Note Model (Enhanced):                                         │
│  ├── aiScore: { quality, completeness, examRelevance }         │
│  ├── aiTags: ["Exam Important", "High Weightage", "PYQ Match"] │
│  ├── keywords: [{ word, frequency, importance }]               │
│  ├── summary: { short, detailed }                              │
│  ├── duplicateOf: ObjectId (if duplicate)                      │
│  └── pyqMatches: [{ question, similarity, year }]              │
│                                                                 │
│  Progress Model (Enhanced):                                     │
│  ├── aiInsights: { weakAreas, suggestedTopics }                │
│  └── studyPattern: { timeSpent, efficiency }                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Feature Specifications

### 1. Smart Note Summarization
**Algorithm:** Extractive Summarization using TF-IDF
```
Input: Full note text/content
Process:
  1. Tokenize into sentences
  2. Calculate TF-IDF scores for each sentence
  3. Extract sentences with definitions (contains "is a", "refers to")
  4. Extract sentences with formulas (contains =, mathematical symbols)
  5. Rank and select top N sentences
Output: 
  - shortSummary (50-100 words) - Quick revision
  - detailedSummary (200-300 words) - Exam prep
```

### 2. Important Content Detection
**Algorithm:** Multi-factor Importance Scoring
```
Factors:
  - Keyword frequency (20%)
  - Definition presence (20%)
  - Formula presence (20%)
  - PYQ match (25%)
  - Student ratings (15%)

Tags Applied:
  - "Exam Important" → score > 70
  - "High Weightage" → PYQ match > 2
  - "Quick Revision" → has formulas/definitions
  - "Must Read" → score > 85
```

### 3. PYQ Intelligence
**Algorithm:** Pattern Matching + Topic Mapping
```
Process:
  1. Extract topics from PYQ text
  2. Match against note keywords
  3. Calculate similarity scores
  4. Track frequency across years
  5. Compute probability score

Output:
  - matchedQuestions: []
  - topicFrequency: {}
  - probabilityScore: "High/Medium/Low"
```

### 4. Smart Search
**Algorithm:** NLP Query Processing + Relevance Ranking
```
Query Types:
  - "Explain X for Y marks" → Topic search + mark-based detail
  - "Important questions Unit N" → Filter by unit + importance
  - "Quick revision for X" → Summary search
  - "PYQ topics in X" → PYQ match filter

Ranking Factors:
  - Keyword match (30%)
  - AI importance score (25%)
  - Student ratings (20%)
  - PYQ frequency (15%)
  - Recency (10%)
```

### 5. Note Quality Scoring
**Algorithm:** Multi-criteria Assessment
```
Criteria:
  - Completeness: Length, coverage of topic
  - Clarity: Sentence structure, formatting
  - Exam Relevance: Keywords, formulas, definitions
  - Community Rating: Average student ratings

Score = (completeness * 0.3) + (clarity * 0.2) + 
        (examRelevance * 0.35) + (ratings * 0.15)
```

### 6. Duplicate Detection
**Algorithm:** Text Similarity using Jaccard + Cosine
```
Process:
  1. Tokenize and normalize text
  2. Generate word n-grams (1-3)
  3. Calculate Jaccard similarity
  4. For high matches, calculate cosine similarity
  5. Flag duplicates (similarity > 0.8)

Actions:
  - Suggest merge
  - Keep highest rated
  - Archive duplicates
```

### 7. Study Gap Analysis
**Algorithm:** Progress-based Analysis
```
Inputs:
  - Completed topics
  - Time spent per topic
  - Importance scores
  - Exam date

Analysis:
  - Uncovered important topics
  - Low-time-spent high-importance topics
  - Declining performance areas
  - Suggested priority order

Output:
  - weakAreas: []
  - suggestedTopics: []
  - studyPlan: {}
```

## 🚀 Implementation Priority

| Priority | Feature | Complexity | Impact |
|----------|---------|------------|--------|
| P0 | Note Quality Scoring | Medium | High |
| P0 | Important Content Detection | Medium | High |
| P0 | Smart Search | High | High |
| P1 | Duplicate Detection | Medium | Medium |
| P1 | Study Gap Analysis | High | High |
| P1 | Note Summarization | Medium | High |
| P2 | PYQ Intelligence | High | Medium |
| P2 | Exam Mode AI Filter | Low | High |

## 🔄 Data Flow

```
User uploads note
       │
       ▼
┌──────────────────┐
│ Note Controller  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ AI Analysis      │
│ (async process)  │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│Extract│ │Score  │
│Keywords│ │Quality│
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌───────────────────┐
│ Detect Importance │
│ Apply Tags        │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Generate Summary  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Check Duplicates  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Save to Database  │
│ (with AI metadata)│
└───────────────────┘
```

## 📁 File Structure

```
src/
├── services/
│   └── ai/
│       ├── index.js              # Main AI service
│       ├── textProcessor.js      # Text utilities
│       ├── keywordExtractor.js   # Keyword extraction
│       ├── similarityEngine.js   # Duplicate detection
│       ├── summarizer.js         # Note summarization
│       ├── importanceScorer.js   # Importance detection
│       └── searchEngine.js       # Smart search
├── controllers/
│   └── aiController.js           # AI API handlers
├── routes/
│   └── aiRoutes.js               # AI endpoints
└── models/
    └── Note.js                   # Enhanced with AI fields
```

This architecture is designed to be:
- **Modular**: Each AI feature is independent
- **Scalable**: Easy to add new features
- **Fast**: Optimized for exam-time usage
- **Explainable**: Clear scoring and reasoning
