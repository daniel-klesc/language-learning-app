// src/js/01-config.js
// Configuration and constants module

// ============= DEVELOPMENT MODE =============
const DEV_MODE = true;

// ============= CONSTANTS =============
const APP_VERSION = '2.1.0';
const STORAGE_KEY = 'languageApp';

// Skill level constants
const SKILL_LEVELS = {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    ADVANCED: 3
};

const SKILL_NAMES = {
    1: 'Beginner',
    2: 'Intermediate', 
    3: 'Advanced'
};

// Spaced repetition configuration
const BASE_INTERVALS = [1, 3, 7, 14, 30, 90]; // Days

// Skill level multipliers for progression
const SKILL_MULTIPLIERS = {
    1: 0.5,    // Beginner: 50% progression
    2: 0.75,   // Intermediate: 75% progression
    3: 1.0     // Advanced: 100% progression
};

// Promotion thresholds
const PROMOTION_THRESHOLD = {
    streak: 3,      // Consecutive correct answers
    accuracy: 0.8   // 80% accuracy at level
};

// Daily goal defaults
const DEFAULT_DAILY_GOAL = {
    new: 3,
    review: 5,
    min: {
        new: 2,
        review: 3
    },
    max: {
        new: 10,
        review: 15
    }
};

// URLs and endpoints
const DEFAULT_LIBRARY_URL = 'https://raw.githubusercontent.com/daniel-klesc/language-learning-app-vocabulary/main/index.json';
const CORS_PROXY_URL = 'https://corsproxy.io/?';

// UI Configuration
const UI_CONFIG = {
    animationDuration: 300,
    longPressDelay: 500,
    maxLogEntries: 50,
    sessionSizes: [1, 3, 5, 0], // 0 means "all"
    difficultyColors: {
        1: 'easy',
        2: 'medium',
        3: 'hard'
    }
};

// Categories
const VOCABULARY_CATEGORIES = [
    'greetings',
    'basics',
    'numbers',
    'family',
    'food',
    'travel',
    'health',
    'work',
    'time',
    'weather',
    'shopping',
    'emotions',
    'people',
    'places',
    'activities'
];

// Language pairs
const LANGUAGE_PAIRS = [
    { code: 'cs-vi', name: 'Czech → Vietnamese', icon: '🇨🇿→🇻🇳' },
    { code: 'vi-zh', name: 'Vietnamese → Chinese', icon: '🇻🇳→🇨🇳' },
    { code: 'vi-en', name: 'Vietnamese → English', icon: '🇻🇳→🇬🇧' }
];