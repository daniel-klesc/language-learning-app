// src/js/05-storage.js
// LocalStorage operations and progress management

// ============= STORAGE KEYS =============
const STORAGE_KEYS = {
    PROGRESS: STORAGE_KEY,
    APP_STATE: 'appState',
    USER_VOCABULARY: 'userVocabulary',
    VOCABULARY_FILES: 'vocabularyFiles',
    GITHUB_SOURCES: 'githubSources',
    LIBRARY_URL: 'libraryUrl',
    LAST_GITHUB_URL: 'lastGitHubUrl'
};

// ============= PROGRESS MANAGEMENT =============
function loadProgress() {
    const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    
    if (saved) {
        const data = JSON.parse(saved);
        
        // Migrate old data to include skill levels if needed
        if (data.progress) {
            Object.keys(data.progress).forEach(lang => {
                Object.keys(data.progress[lang]).forEach(cardId => {
                    const card = data.progress[lang][cardId];
                    if (!card.skillLevel) {
                        card.skillLevel = 1;
                        card.skillProgress = {
                            1: { correct: 0, total: 0, streak: 0 },
                            2: { correct: 0, total: 0, streak: 0 },
                            3: { correct: 0, total: 0, streak: 0 }
                        };
                        card.recommendedSkillLevel = 1;
                    }
                });
            });
        }
        
        // Check if it's a new day
        const today = getToday();
        if (data.lastStudied !== today) {
            data.dailyProgress = {
                new: 0,
                review: 0,
                sessions: [],
                timeSpent: 0,
                cardsSeen: {}
            };
            
            // Update streak
            const yesterday = getYesterday();
            if (data.lastStudied === yesterday && data.dailyProgress?.completed) {
                data.streak = (data.streak || 0) + 1;
                devLog(`Streak increased to ${data.streak} days!`, 'success');
            } else if (data.lastStudied !== yesterday) {
                data.streak = 0;
                devLog('Streak reset - study daily to maintain it', 'info');
            }
            
            data.lastStudied = today;
            saveProgress(data);
        }
        
        // Load saved default skill level
        if (data.defaultSkillLevel !== undefined) {
            State.setDefaultSkillLevel(data.defaultSkillLevel);
        }
        
        // Load daily goal adjustments
        if (data.adaptiveGoal) {
            Object.assign(State.getDailyGoal(), data.adaptiveGoal);
        }
        
        return data;
    }
    
    // Initialize new user data
    const newData = {
        progress: {},
        streak: 0,
        lastStudied: getToday(),
        dailyProgress: {
            new: 0,
            review: 0,
            sessions: [],
            timeSpent: 0,
            cardsSeen: {}
        },
        accuracy: { correct: 0, total: 0 },
        totalLearned: 0,
        adaptiveGoal: State.getDailyGoal(),
        defaultSkillLevel: 0
    };
    
    saveProgress(newData);
    return newData;
}

function saveProgress(data) {
    try {
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data));
        return true;
    } catch (error) {
        devLog(`Failed to save progress: ${error.message}`, 'error');
        
        // Try to clear some space if storage is full
        if (error.name === 'QuotaExceededError') {
            clearOldSessions(data);
            try {
                localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data));
                return true;
            } catch (retryError) {
                devLog('Storage full even after cleanup', 'error');
            }
        }
        return false;
    }
}

function clearOldSessions(data) {
    // Keep only last 7 days of session history
    if (data.sessionHistory && data.sessionHistory.length > 7) {
        data.sessionHistory = data.sessionHistory.slice(-7);
        devLog('Cleared old session history to save space', 'info');
    }
}

// ============= USER VOCABULARY STORAGE =============
function saveUserVocabulary(vocabulary) {
    try {
        localStorage.setItem(STORAGE_KEYS.USER_VOCABULARY, JSON.stringify(vocabulary));
        return true;
    } catch (error) {
        devLog(`Failed to save user vocabulary: ${error.message}`, 'error');
        return false;
    }
}

function loadUserVocabularyFromStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.USER_VOCABULARY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        devLog(`Failed to load user vocabulary: ${error.message}`, 'error');
    }
    return {};
}

// ============= VOCABULARY FILES TRACKING =============
function saveVocabularyFiles(files) {
    try {
        localStorage.setItem(STORAGE_KEYS.VOCABULARY_FILES, JSON.stringify(files));
        return true;
    } catch (error) {
        devLog(`Failed to save vocabulary files: ${error.message}`, 'error');
        return false;
    }
}

function loadVocabularyFiles() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.VOCABULARY_FILES);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        devLog(`Failed to load vocabulary files: ${error.message}`, 'error');
    }
    return {};
}

// ============= GITHUB SOURCES STORAGE =============
function saveGitHubSources(sources) {
    try {
        localStorage.setItem(STORAGE_KEYS.GITHUB_SOURCES, JSON.stringify(sources));
        return true;
    } catch (error) {
        devLog(`Failed to save GitHub sources: ${error.message}`, 'error');
        return false;
    }
}

function loadGitHubSources() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.GITHUB_SOURCES);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        devLog(`Failed to load GitHub sources: ${error.message}`, 'error');
    }
    return {};
}

// ============= EXPORT/IMPORT FUNCTIONALITY =============
function exportAllData() {
    const exportData = {
        version: APP_VERSION,
        exportDate: new Date().toISOString(),
        progress: loadProgress(),
        userVocabulary: loadUserVocabularyFromStorage(),
        vocabularyFiles: loadVocabularyFiles(),
        githubSources: loadGitHubSources(),
        appState: State.get()
    };
    
    const filename = generateExportFilename('language-learning-backup');
    downloadJSON(exportData, filename);
    
    devLog(`Data exported to ${filename}`, 'success');
}

function importData(jsonData) {
    try {
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        
        if (!data.version || !data.progress) {
            throw new Error('Invalid import file format');
        }
        
        // Import progress
        if (data.progress) {
            saveProgress(data.progress);
        }
        
        // Import user vocabulary
        if (data.userVocabulary) {
            saveUserVocabulary(data.userVocabulary);
        }
        
        // Import vocabulary files
        if (data.vocabularyFiles) {
            saveVocabularyFiles(data.vocabularyFiles);
        }
        
        // Import GitHub sources
        if (data.githubSources) {
            saveGitHubSources(data.githubSources);
        }
        
        devLog('Data imported successfully', 'success');
        return true;
    } catch (error) {
        devLog(`Import failed: ${error.message}`, 'error');
        return false;
    }
}

// ============= STORAGE UTILITIES =============
function getStorageSize() {
    let totalSize = 0;
    
    for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length + key.length;
        }
    }
    
    return {
        bytes: totalSize,
        kilobytes: Math.round(totalSize / 1024),
        megabytes: Math.round(totalSize / (1024 * 1024) * 100) / 100
    };
}

function clearAllData() {
    if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
        localStorage.clear();
        devLog('All data cleared', 'info');
        return true;
    }
    return false;
}

function clearProgressOnly() {
    if (confirm('Are you sure you want to reset your learning progress? Vocabulary will be kept.')) {
        localStorage.removeItem(STORAGE_KEYS.PROGRESS);
        localStorage.removeItem(STORAGE_KEYS.APP_STATE);
        devLog('Progress reset', 'info');
        return true;
    }
    return false;
}

// ============= CACHE MANAGEMENT =============
function clearVocabularyCache() {
    const keys = Object.keys(localStorage);
    let cleared = 0;
    
    keys.forEach(key => {
        if (key.startsWith('vocabularyCache_')) {
            localStorage.removeItem(key);
            cleared++;
        }
    });
    
    devLog(`Cleared ${cleared} vocabulary cache entries`, 'info');
    return cleared;
}

// Export storage functions
window.Storage = {
    // Progress
    loadProgress,
    saveProgress,
    
    // User vocabulary
    saveUserVocabulary,
    loadUserVocabulary: loadUserVocabularyFromStorage,
    
    // File tracking
    saveVocabularyFiles,
    loadVocabularyFiles,
    
    // GitHub sources
    saveGitHubSources,
    loadGitHubSources,
    
    // Import/Export
    exportAllData,
    importData,
    
    // Utilities
    getStorageSize,
    clearAllData,
    clearProgressOnly,
    clearVocabularyCache,
    
    // Direct access to keys
    KEYS: STORAGE_KEYS
};