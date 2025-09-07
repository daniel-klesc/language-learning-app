// src/js/03-state.js
// Global state management

// ============= APPLICATION STATE =============
const AppState = {
    // Current session state
    currentLanguagePair: 'cs-vi',
    currentSession: [],
    currentCardIndex: 0,
    currentCardSkillLevel: 1,
    isAnswerShown: false,
    selectedChoiceIndex: -1,
    pausedSession: null,
    
    // Session statistics
    sessionStats: {
        correct: 0,
        total: 0,
        startTime: null,
        wordsCompleted: []
    },
    
    // Daily goals
    dailyGoal: {
        new: DEFAULT_DAILY_GOAL.new,
        review: DEFAULT_DAILY_GOAL.review,
        completed: { new: 0, review: 0 },
        adaptiveFactor: 1.0
    },
    
    // User preferences
    defaultSkillLevel: 0, // 0 = Auto, 1-3 = Manual levels
    
    // UI state
    isStudyMode: false,
    currentView: 'home', // home, study, complete
    
    // Vocabulary data
    vocabularyData: {},
    userVocabulary: {},
    vocabularyFiles: {},
    
    // Upload/Preview state
    pendingUpload: null,
    currentFilter: 'all',
    activeCategories: new Set(),
    
    // Vocabulary Manager state
    currentVocabTab: 'cs-vi'
};

// ============= STATE GETTERS =============
function getCurrentLanguagePair() {
    return AppState.currentLanguagePair;
}

function getCurrentSession() {
    return AppState.currentSession;
}

function getCurrentCard() {
    if (AppState.currentSession && AppState.currentCardIndex < AppState.currentSession.length) {
        return AppState.currentSession[AppState.currentCardIndex];
    }
    return null;
}

function getSessionStats() {
    return { ...AppState.sessionStats };
}

function getDailyGoal() {
    return { ...AppState.dailyGoal };
}

function getVocabularyForPair(languagePair) {
    const pair = languagePair || AppState.currentLanguagePair;
    return [
        ...(AppState.vocabularyData[pair] || []),
        ...(AppState.userVocabulary[pair] || [])
    ];
}

// ============= STATE SETTERS =============
function setCurrentLanguagePair(pair) {
    if (LANGUAGE_PAIRS.some(lp => lp.code === pair)) {
        AppState.currentLanguagePair = pair;
        devLog(`Language pair changed to: ${pair}`, 'info');
        return true;
    }
    return false;
}

function setDefaultSkillLevel(level) {
    if (level >= 0 && level <= 3) {
        AppState.defaultSkillLevel = level;
        devLog(`Default skill level set to: ${level === 0 ? 'Auto' : SKILL_NAMES[level]}`, 'info');
        return true;
    }
    return false;
}

function setCurrentView(view) {
    const validViews = ['home', 'study', 'complete'];
    if (validViews.includes(view)) {
        AppState.currentView = view;
        AppState.isStudyMode = view === 'study';
        return true;
    }
    return false;
}

function incrementSessionStats(isCorrect) {
    AppState.sessionStats.total++;
    if (isCorrect) {
        AppState.sessionStats.correct++;
    }
}

function resetSessionStats() {
    AppState.sessionStats = {
        correct: 0,
        total: 0,
        startTime: Date.now(),
        wordsCompleted: []
    };
}

// ============= STATE PERSISTENCE =============
function saveStateToPersistence() {
    const persistentState = {
        currentLanguagePair: AppState.currentLanguagePair,
        defaultSkillLevel: AppState.defaultSkillLevel,
        dailyGoal: AppState.dailyGoal,
        pausedSession: AppState.pausedSession
    };
    
    try {
        localStorage.setItem('appState', JSON.stringify(persistentState));
        return true;
    } catch (error) {
        devLog(`Failed to save state: ${error.message}`, 'error');
        return false;
    }
}

function loadStateFromPersistence() {
    try {
        const saved = localStorage.getItem('appState');
        if (saved) {
            const state = JSON.parse(saved);
            
            // Restore saved state
            if (state.currentLanguagePair) {
                AppState.currentLanguagePair = state.currentLanguagePair;
            }
            if (state.defaultSkillLevel !== undefined) {
                AppState.defaultSkillLevel = state.defaultSkillLevel;
            }
            if (state.dailyGoal) {
                AppState.dailyGoal = { ...AppState.dailyGoal, ...state.dailyGoal };
            }
            if (state.pausedSession) {
                AppState.pausedSession = state.pausedSession;
            }
            
            devLog('State restored from persistence', 'success');
            return true;
        }
    } catch (error) {
        devLog(`Failed to load state: ${error.message}`, 'error');
    }
    return false;
}

// ============= SESSION STATE MANAGEMENT =============
function createSession(cards) {
    AppState.currentSession = cards;
    AppState.currentCardIndex = 0;
    resetSessionStats();
    AppState.isAnswerShown = false;
    AppState.selectedChoiceIndex = -1;
    setCurrentView('study');
    devLog(`Session created with ${cards.length} cards`, 'success');
}

function advanceToNextCard() {
    AppState.currentCardIndex++;
    AppState.isAnswerShown = false;
    AppState.selectedChoiceIndex = -1;
    
    if (AppState.currentCardIndex >= AppState.currentSession.length) {
        return false; // Session complete
    }
    return true; // More cards available
}

function pauseCurrentSession() {
    if (AppState.currentSession.length > 0) {
        AppState.pausedSession = {
            cards: AppState.currentSession,
            currentIndex: AppState.currentCardIndex,
            stats: { ...AppState.sessionStats },
            languagePair: AppState.currentLanguagePair
        };
        saveStateToPersistence();
        devLog('Session paused and saved', 'info');
        return true;
    }
    return false;
}

function resumePausedSession() {
    if (AppState.pausedSession) {
        AppState.currentSession = AppState.pausedSession.cards;
        AppState.currentCardIndex = AppState.pausedSession.currentIndex;
        AppState.sessionStats = AppState.pausedSession.stats;
        AppState.pausedSession = null;
        saveStateToPersistence();
        setCurrentView('study');
        devLog('Session resumed', 'success');
        return true;
    }
    return false;
}

function clearPausedSession() {
    AppState.pausedSession = null;
    saveStateToPersistence();
}

// ============= VOCABULARY STATE MANAGEMENT =============
function addVocabularyData(languagePair, words) {
    if (!AppState.vocabularyData[languagePair]) {
        AppState.vocabularyData[languagePair] = [];
    }
    AppState.vocabularyData[languagePair].push(...words);
    devLog(`Added ${words.length} words to ${languagePair}`, 'success');
}

function addUserVocabulary(languagePair, words) {
    if (!AppState.userVocabulary[languagePair]) {
        AppState.userVocabulary[languagePair] = [];
    }
    AppState.userVocabulary[languagePair].push(...words);
    
    // Save to localStorage
    try {
        localStorage.setItem('userVocabulary', JSON.stringify(AppState.userVocabulary));
        devLog(`Added ${words.length} user words to ${languagePair}`, 'success');
        return true;
    } catch (error) {
        devLog(`Failed to save user vocabulary: ${error.message}`, 'error');
        return false;
    }
}

function loadUserVocabulary() {
    try {
        const saved = localStorage.getItem('userVocabulary');
        if (saved) {
            AppState.userVocabulary = JSON.parse(saved);
            devLog('User vocabulary loaded from storage', 'success');
            return true;
        }
    } catch (error) {
        devLog(`Failed to load user vocabulary: ${error.message}`, 'error');
    }
    return false;
}

// ============= UPLOAD STATE MANAGEMENT =============
function setPendingUpload(file, data, languagePair) {
    AppState.pendingUpload = {
        file: file,
        languagePair: languagePair,
        words: data.words || [],
        metadata: data.metadata || {}
    };
    AppState.currentFilter = 'all';
    AppState.activeCategories.clear();
}

function clearPendingUpload() {
    AppState.pendingUpload = null;
    AppState.currentFilter = 'all';
    AppState.activeCategories.clear();
}

function toggleCategoryFilter(category) {
    if (AppState.activeCategories.has(category)) {
        AppState.activeCategories.delete(category);
        return false; // Category is now inactive
    } else {
        AppState.activeCategories.add(category);
        return true; // Category is now active
    }
}

// Export state management functions
window.State = {
    // Core state
    get: () => AppState,
    
    // Getters
    getCurrentLanguagePair,
    getCurrentSession,
    getCurrentCard,
    getSessionStats,
    getDailyGoal,
    getVocabularyForPair,
    
    // Setters
    setCurrentLanguagePair,
    setDefaultSkillLevel,
    setCurrentView,
    incrementSessionStats,
    
    // Session management
    createSession,
    advanceToNextCard,
    pauseCurrentSession,
    resumePausedSession,
    clearPausedSession,
    
    // Vocabulary management
    addVocabularyData,
    addUserVocabulary,
    loadUserVocabulary,
    
    // Upload management
    setPendingUpload,
    clearPendingUpload,
    toggleCategoryFilter,
    
    // Persistence
    save: saveStateToPersistence,
    load: loadStateFromPersistence
};