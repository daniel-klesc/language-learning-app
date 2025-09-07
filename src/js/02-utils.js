// src/js/02-utils.js
// Utility functions and helpers

// ============= LOGGING UTILITIES =============
function devLog(message, type = 'info') {
    if (!DEV_MODE) return;
    
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${message}`);
    
    const logDiv = document.getElementById('dev-logs');
    if (logDiv) {
        const logEntry = document.createElement('div');
        logEntry.className = `dev-log ${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        logDiv.insertBefore(logEntry, logDiv.firstChild);
        
        // Keep only last N logs
        while (logDiv.children.length > UI_CONFIG.maxLogEntries) {
            logDiv.removeChild(logDiv.lastChild);
        }
    }
}

// ============= DOM UTILITIES =============
function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function createElement(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.innerHTML = content;
    return element;
}

function show(element) {
    if (typeof element === 'string') element = $(element);
    if (element) {
        element.classList.remove('hidden');
        element.style.display = '';
    }
}

function hide(element) {
    if (typeof element === 'string') element = $(element);
    if (element) {
        element.classList.add('hidden');
        element.style.display = 'none';
    }
}

function toggleVisibility(element) {
    if (typeof element === 'string') element = $(element);
    if (element) {
        if (element.classList.contains('hidden')) {
            show(element);
        } else {
            hide(element);
        }
    }
}

// ============= STRING UTILITIES =============
function normalizeAnswer(text) {
    return text
        .toLowerCase()
        .normalize('NFD')  // Decompose diacritics
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9\u4e00-\u9fff]/g, ''); // Keep alphanumeric and Chinese chars
}

function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[str2.length][str1.length];
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============= DATE UTILITIES =============
function getToday() {
    return new Date().toDateString();
}

function getYesterday() {
    return new Date(Date.now() - 86400000).toDateString();
}

function daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
}

function formatTime(minutes) {
    if (minutes < 60) {
        return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
}

// ============= ARRAY UTILITIES =============
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const groupKey = typeof key === 'function' ? key(item) : item[key];
        (groups[groupKey] = groups[groupKey] || []).push(item);
        return groups;
    }, {});
}

function unique(array, key) {
    if (!key) return [...new Set(array)];
    const seen = new Set();
    return array.filter(item => {
        const k = typeof key === 'function' ? key(item) : item[key];
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

// ============= ASYNC UTILITIES =============
async function fetchWithFallback(url) {
    try {
        // Try direct fetch first
        let response = await fetch(url);
        
        // If CORS fails and it's a GitHub URL, try with proxy
        if (!response.ok && url.includes('github')) {
            const proxyUrl = `${CORS_PROXY_URL}${encodeURIComponent(url)}`;
            response = await fetch(proxyUrl);
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
    } catch (error) {
        devLog(`Fetch error: ${error.message}`, 'error');
        throw error;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============= VALIDATION UTILITIES =============
function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

function validateVocabularyData(data) {
    if (!data.words || !Array.isArray(data.words)) {
        return { valid: false, error: 'Missing or invalid words array' };
    }
    
    for (const word of data.words) {
        if (!word.word || !word.translation) {
            return { valid: false, error: 'Word missing required fields' };
        }
    }
    
    return { valid: true };
}

// ============= EXPORT/DOWNLOAD UTILITIES =============
function downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function generateExportFilename(prefix) {
    const date = new Date().toISOString().split('T')[0];
    return `${prefix}-${date}.json`;
}