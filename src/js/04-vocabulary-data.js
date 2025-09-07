// src/js/04-vocabulary-data.js
// Default fallback vocabulary data

// ============= FALLBACK VOCABULARY =============
const FALLBACK_VOCABULARY = {
    'cs-vi': [
        // Greetings & Politeness (5 words)
        { id: 1, word: 'ahoj', translation: 'xin chào', romanization: 'sin chào', category: 'greetings', difficulty: 1 },
        { id: 2, word: 'děkuji', translation: 'cảm ơn', romanization: 'cảm ơn', category: 'greetings', difficulty: 1 },
        { id: 41, word: 'prosím', translation: 'làm ơn', romanization: 'làm ơn', category: 'greetings', difficulty: 1 },
        { id: 42, word: 'promiňte', translation: 'xin lỗi', romanization: 'sin lỗi', category: 'greetings', difficulty: 1 },
        { id: 43, word: 'nashledanou', translation: 'tạm biệt', romanization: 'tạm biệt', category: 'greetings', difficulty: 1 },
        
        // Basics (6 words)
        { id: 3, word: 'ano', translation: 'vâng', romanization: 'vâng', category: 'basics', difficulty: 1 },
        { id: 4, word: 'ne', translation: 'không', romanization: 'không', category: 'basics', difficulty: 1 },
        { id: 15, word: 'dům', translation: 'nhà', romanization: 'nhà', category: 'basics', difficulty: 1 },
        { id: 16, word: 'škola', translation: 'trường học', romanization: 'trường học', category: 'basics', difficulty: 2 },
        { id: 17, word: 'kniha', translation: 'sách', romanization: 'sách', category: 'basics', difficulty: 2 },
        { id: 20, word: 'práce', translation: 'công việc', romanization: 'công việc', category: 'basics', difficulty: 2 },
        
        // Numbers (5 words)
        { id: 7, word: 'jeden', translation: 'một', romanization: 'một', category: 'numbers', difficulty: 1 },
        { id: 8, word: 'dva', translation: 'hai', romanization: 'hai', category: 'numbers', difficulty: 1 },
        { id: 9, word: 'tři', translation: 'ba', romanization: 'ba', category: 'numbers', difficulty: 1 },
        { id: 10, word: 'čtyři', translation: 'bốn', romanization: 'bốn', category: 'numbers', difficulty: 2 },
        { id: 11, word: 'pět', translation: 'năm', romanization: 'năm', category: 'numbers', difficulty: 2 },
        
        // Family (3 words)
        { id: 12, word: 'rodina', translation: 'gia đình', romanization: 'gia đình', category: 'family', difficulty: 2 },
        { id: 13, word: 'matka', translation: 'mẹ', romanization: 'mẹ', category: 'family', difficulty: 1 },
        { id: 14, word: 'otec', translation: 'bố', romanization: 'bố', category: 'family', difficulty: 1 },
        
        // Food & Drink (2 words)
        { id: 5, word: 'voda', translation: 'nước', romanization: 'nước', category: 'food', difficulty: 1 },
        { id: 6, word: 'chléb', translation: 'bánh mì', romanization: 'bánh mì', category: 'food', difficulty: 2 }
    ],
    
    'vi-zh': [
        // Greetings (2 words)
        { id: 21, word: 'xin chào', translation: '你好', romanization: 'nǐ hǎo', category: 'greetings', difficulty: 1 },
        { id: 22, word: 'cảm ơn', translation: '谢谢', romanization: 'xiè xie', category: 'greetings', difficulty: 1 },
        
        // Numbers (3 words)
        { id: 23, word: 'một', translation: '一', romanization: 'yī', category: 'numbers', difficulty: 1 },
        { id: 24, word: 'hai', translation: '二', romanization: 'èr', category: 'numbers', difficulty: 1 },
        { id: 25, word: 'ba', translation: '三', romanization: 'sān', category: 'numbers', difficulty: 1 },
        
        // Food (2 words)
        { id: 26, word: 'nước', translation: '水', romanization: 'shuǐ', category: 'food', difficulty: 1 },
        { id: 27, word: 'cơm', translation: '米饭', romanization: 'mǐ fàn', category: 'food', difficulty: 2 },
        
        // Family (3 words)
        { id: 28, word: 'gia đình', translation: '家庭', romanization: 'jiā tíng', category: 'family', difficulty: 2 },
        { id: 29, word: 'mẹ', translation: '妈妈', romanization: 'mā ma', category: 'family', difficulty: 1 },
        { id: 30, word: 'bố', translation: '爸爸', romanization: 'bà ba', category: 'family', difficulty: 1 }
    ],
    
    'vi-en': [
        // Greetings (2 words)
        { id: 31, word: 'xin chào', translation: 'hello', romanization: '', category: 'greetings', difficulty: 1 },
        { id: 32, word: 'cảm ơn', translation: 'thank you', romanization: '', category: 'greetings', difficulty: 1 },
        
        // Numbers (3 words)
        { id: 33, word: 'một', translation: 'one', romanization: '', category: 'numbers', difficulty: 1 },
        { id: 34, word: 'hai', translation: 'two', romanization: '', category: 'numbers', difficulty: 1 },
        { id: 35, word: 'ba', translation: 'three', romanization: '', category: 'numbers', difficulty: 1 },
        
        // Food (2 words)
        { id: 36, word: 'nước', translation: 'water', romanization: '', category: 'food', difficulty: 1 },
        { id: 37, word: 'bánh mì', translation: 'bread', romanization: '', category: 'food', difficulty: 1 },
        
        // Family (1 word)
        { id: 38, word: 'gia đình', translation: 'family', romanization: '', category: 'family', difficulty: 1 },
        
        // Basics (2 words)
        { id: 39, word: 'nhà', translation: 'house', romanization: '', category: 'basics', difficulty: 1 },
        { id: 40, word: 'trường học', translation: 'school', romanization: '', category: 'basics', difficulty: 2 }
    ]
};

// ============= VOCABULARY LOADING =============
async function loadVocabulary(languagePair, forceRefresh = false) {
    const cacheKey = `vocabularyCache_${languagePair}`;
    const cache = localStorage.getItem(cacheKey);
    const now = Date.now();
    
    // Check cache (24 hour expiry)
    if (!forceRefresh && cache) {
        const cached = JSON.parse(cache);
        if (cached.timestamp && (now - cached.timestamp) < 86400000) {
            devLog(`Loading vocabulary from cache for ${languagePair}`, 'info');
            return cached.words;
        }
    }
    
    // Try to load from external files
    try {
        devLog(`Fetching vocabulary files for ${languagePair}...`, 'info');
        const response = await fetch(`./vocabulary/${languagePair}/core.json`);
        
        if (response.ok) {
            const data = await response.json();
            const words = data.words || data;
            
            // Cache the loaded vocabulary
            localStorage.setItem(cacheKey, JSON.stringify({
                timestamp: now,
                words: words
            }));
            
            devLog(`Loaded ${words.length} words from external file for ${languagePair}`, 'success');
            return words;
        }
    } catch (error) {
        devLog(`Failed to load external vocabulary for ${languagePair}: ${error.message}`, 'error');
    }
    
    // Fallback to embedded vocabulary
    devLog(`Using fallback vocabulary for ${languagePair}`, 'info');
    return FALLBACK_VOCABULARY[languagePair] || [];
}

// ============= VOCABULARY INITIALIZATION =============
async function initializeVocabulary() {
    devLog('Initializing vocabulary system...', 'info');
    
    // Load vocabulary for all language pairs
    for (const pair of LANGUAGE_PAIRS) {
        const words = await loadVocabulary(pair.code);
        State.addVocabularyData(pair.code, words);
    }
    
    // Load user vocabulary
    State.loadUserVocabulary();
    
    devLog('Vocabulary initialization complete', 'success');
}

// ============= VOCABULARY REFRESH =============
async function refreshVocabulary() {
    devLog('Refreshing all vocabulary...', 'info');
    
    // Clear existing vocabulary
    State.get().vocabularyData = {};
    
    // Reload all vocabulary
    for (const pair of LANGUAGE_PAIRS) {
        const words = await loadVocabulary(pair.code, true);
        State.addVocabularyData(pair.code, words);
    }
    
    devLog('Vocabulary refresh complete', 'success');
}

// ============= VOCABULARY HELPERS =============
function getVocabularyStats() {
    const stats = {};
    
    for (const pair of LANGUAGE_PAIRS) {
        const vocab = State.getVocabularyForPair(pair.code);
        stats[pair.code] = {
            total: vocab.length,
            byCategory: groupBy(vocab, 'category'),
            byDifficulty: groupBy(vocab, 'difficulty')
        };
    }
    
    return stats;
}

function findWordById(id, languagePair) {
    const vocab = State.getVocabularyForPair(languagePair);
    return vocab.find(word => word.id === id);
}

function getWordsByCategory(category, languagePair) {
    const vocab = State.getVocabularyForPair(languagePair);
    return vocab.filter(word => word.category === category);
}

function getWordsByDifficulty(difficulty, languagePair) {
    const vocab = State.getVocabularyForPair(languagePair);
    return vocab.filter(word => word.difficulty === difficulty);
}

// Export vocabulary functions
window.Vocabulary = {
    load: loadVocabulary,
    initialize: initializeVocabulary,
    refresh: refreshVocabulary,
    getStats: getVocabularyStats,
    findById: findWordById,
    getByCategory: getWordsByCategory,
    getByDifficulty: getWordsByDifficulty,
    getFallback: () => FALLBACK_VOCABULARY
};