import { useState, useEffect, useRef } from 'react';
import {
  Search, X, Sparkles, Clock, TrendingUp, FileText,
  BookOpen, Star, Tag, Filter, ChevronDown
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function SmartSearch({ onResultSelect, className = '' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [queryType, setQueryType] = useState(null);
  const [filters, setFilters] = useState({
    examMode: false,
    minRating: 0
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    if (query.length >= 2) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      
      debounceRef.current = setTimeout(async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(
            `${API_URL}/ai/search-suggestions?q=${encodeURIComponent(query)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          if (data.success) {
            setSuggestions(data.data);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      }, 300);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setShowResults(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/ai/smart-search`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          filters
        })
      });

      const data = await res.json();
      if (data.success) {
        setResults(data.data.results);
        setQueryType(data.data.queryType);
        
        // Save to recent searches
        const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('recentSearches', JSON.stringify(newRecent));
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleResultClick = (result) => {
    if (onResultSelect) {
      onResultSelect(result.note);
    }
    setShowResults(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setShowResults(false);
  };

  const queryTypeLabels = {
    detailed: '📝 Detailed explanation',
    important: '⭐ Important topics',
    revision: '🔄 Quick revision',
    pyq: '📋 Previous year questions',
    formula: '🔢 Formulas',
    definition: '📖 Definitions',
    keyword: '🔍 Keyword search'
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(true)}
          placeholder='Try "Explain BST for 10 marks" or "Important topics Unit 3"'
          className="w-full pl-11 pr-24 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />

        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-lg transition-colors ${
              showFilters ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
            }`}
          >
            <Filter className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || loading}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3" />
            <span className="text-sm">AI</span>
          </button>
        </div>
      </div>

      {/* Filters Dropdown */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[100]">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Search Filters</h4>
          
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.examMode}
                onChange={(e) => setFilters({ ...filters, examMode: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Exam Important Only</span>
            </label>
            
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300 block mb-1">
                Minimum Rating: {filters.minRating} stars
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[100] max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Searching with AI...</p>
            </div>
          ) : results.length > 0 ? (
            <div>
              {/* Query type indicator */}
              {queryType && (
                <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">
                    {queryTypeLabels[queryType] || '🔍 Search results'}
                  </p>
                </div>
              )}

              {/* Results list */}
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {results.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-left transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {result.note.title}
                          </h4>
                          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-full">
                            {result.relevance}% match
                          </span>
                        </div>
                        
                        {result.note.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {result.note.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-1">
                          {result.note.aiTags?.slice(0, 2).map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          
                          {result.note.aiScore?.examRelevance && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {result.note.aiScore.examRelevance}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : query ? (
            <div className="p-6 text-center">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No results found</p>
              <p className="text-sm text-gray-400 mt-1">Try different keywords or filters</p>
            </div>
          ) : (
            <div className="p-4">
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Suggestions</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(suggestion);
                          handleSearch(suggestion);
                        }}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Recent Searches
                  </h4>
                  <div className="space-y-1">
                    {recentSearches.map((recent, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(recent);
                          handleSearch(recent);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Clock className="w-3 h-3 text-gray-400" />
                        {recent}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search tips */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Smart Search Tips
                </h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>• "Explain [topic] for 10 marks" - Get detailed content</p>
                  <p>• "Important topics Unit 3" - Find high-value topics</p>
                  <p>• "Quick revision [subject]" - Get summaries</p>
                  <p>• "Formulas for [topic]" - Find formula-heavy notes</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SmartSearch;
