// src/js/13-github-integration.js
// GitHub API integration for vocabulary loading

// ============= GITHUB URL PARSING =============
function parseGitHubUrl(url) {
    // Parse various GitHub URL formats
    // https://github.com/username/repo/tree/branch/path
    // https://github.com/username/repo/tree/main/vocabulary
    
    const patterns = [
        /github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/(.*)/,
        /github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)$/,
        /github\.com\/([^\/]+)\/([^\/]+)$/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            const owner = match[1];
            const repo = match[2];
            const branch = match[3] || 'main';
            const path = match[4] || '';
            
            // Construct GitHub API URL
            let apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/`;
            if (path) {
                apiUrl += path;
            }
            apiUrl += `?ref=${branch}`;
            
            return {
                apiUrl,
                owner,
                repo,
                branch,
                path,
                rawBaseUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`
            };
        }
    }
    
    return null;
}

// ============= GITHUB LOADING =============
async function loadFromGitHub() {
    const urlInput = $('#github-url');
    const statusDiv = $('#github-status');
    const loadBtn = $('.github-load-btn');
    
    const githubUrl = urlInput.value.trim();
    
    if (!githubUrl) {
        showGitHubStatus('error', 'Please enter a GitHub URL');
        return;
    }
    
    // Parse GitHub URL
    const parsed = parseGitHubUrl(githubUrl);
    
    if (!parsed) {
        showGitHubStatus('error', 'Invalid GitHub URL format. Please use: https://github.com/username/repo/tree/branch/path');
        return;
    }
    
    // Save URL for future use
    localStorage.setItem(Storage.KEYS.LAST_GITHUB_URL, githubUrl);
    
    // Show loading status
    showGitHubStatus('loading', 'Loading vocabulary files from GitHub...');
    loadBtn.disabled = true;
    
    try {
        // Try to fetch with CORS handling
        const response = await fetchWithFallback(parsed.apiUrl);
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const files = await response.json();
        
        // Handle both array (directory listing) and object (single file) responses
        const fileList = Array.isArray(files) ? files : [files];
        
        // Filter for JSON files
        const jsonFiles = fileList.filter(file => 
            file.name && file.name.endsWith('.json')
        );
        
        if (jsonFiles.length === 0) {
            showGitHubStatus('error', 'No JSON files found in the specified directory');
            loadBtn.disabled = false;
            return;
        }
        
        // Load each JSON file
        const loadedFiles = await loadGitHubFiles(jsonFiles, parsed);
        
        if (loadedFiles.length > 0) {
            showGitHubStatus('success', 
                `Successfully loaded ${loadedFiles.length} file(s) with ${loadedFiles.reduce((sum, f) => sum + f.wordCount, 0)} words total`);
        } else {
            showGitHubStatus('error', 'No valid vocabulary files could be loaded');
        }
        
    } catch (error) {
        console.error('GitHub loading error:', error);
        
        // Try alternative approach with raw URLs
        if (parsed.rawBaseUrl) {
            await tryRawGitHubApproach(parsed, githubUrl);
        } else {
            showGitHubStatus('error', `Error: ${error.message}. Make sure the repository is public.`);
        }
    } finally {
        loadBtn.disabled = false;
    }
}

async function loadGitHubFiles(jsonFiles, parsed) {
    const loadedFiles = [];
    const statusDiv = $('#github-status');
    
    for (const file of jsonFiles) {
        try {
            statusDiv.textContent = `Loading ${file.name}...`;
            
            // Use download_url if available, otherwise construct it
            const fileUrl = file.download_url || 
                           `${parsed.rawBaseUrl}${parsed.path ? parsed.path + '/' : ''}${file.name}`;
            
            const contentResponse = await fetchWithFallback(fileUrl);
            if (!contentResponse.ok) continue;
            
            const content = await contentResponse.text();
            const data = JSON.parse(content);
            
            // Validate and process
            const validation = validateVocabularyData(data);
            if (validation.valid) {
                const metadata = data.metadata || {};
                const languagePair = metadata.language_pair || State.get().currentVocabTab;
                
                // Create a fake File object for compatibility
                const fakeFile = { 
                    name: file.name,
                    size: file.size || content.length
                };
                
                // Show preview for each file
                VocabularyLoader.showUploadPreview(fakeFile, data, languagePair);
                
                loadedFiles.push({
                    name: file.name,
                    wordCount: data.words.length,
                    languagePair
                });
                
                // Store GitHub source info
                storeGitHubSource(languagePair, parsed, file.name);
            }
        } catch (error) {
            console.error(`Error loading ${file.name}:`, error);
            devLog(`Failed to load ${file.name}: ${error.message}`, 'error');
        }
    }
    
    return loadedFiles;
}

async function tryRawGitHubApproach(parsed, githubUrl) {
    const statusDiv = $('#github-status');
    
    try {
        // Try to load an index.json file first
        const indexUrl = `${parsed.rawBaseUrl}${parsed.path ? parsed.path + '/' : ''}index.json`;
        const indexResponse = await fetchWithFallback(indexUrl);
        
        if (indexResponse.ok) {
            const indexData = await indexResponse.json();
            
            // Process index file if it has the library structure
            if (indexData.sources) {
                await processLibraryIndex(indexData, parsed);
            } else if (indexData.files) {
                // Simple file list
                await processFileList(indexData.files, parsed);
            }
        } else {
            // Try common file names
            await tryCommonFiles(parsed);
        }
    } catch (error) {
        showGitHubStatus('error', 
            'Could not load files from GitHub. Try using the Vocabulary Library tab if you have an index.json file.');
    }
}

async function processFileList(files, parsed) {
    const loadedFiles = [];
    
    for (const filename of files) {
        try {
            const fileUrl = `${parsed.rawBaseUrl}${parsed.path ? parsed.path + '/' : ''}${filename}`;
            const response = await fetchWithFallback(fileUrl);
            
            if (response.ok) {
                const data = await response.json();
                if (data.words) {
                    const fakeFile = { name: filename };
                    VocabularyLoader.showUploadPreview(fakeFile, data, State.get().currentVocabTab);
                    loadedFiles.push(filename);
                }
            }
        } catch (error) {
            console.error(`Failed to load ${filename}:`, error);
        }
    }
    
    if (loadedFiles.length > 0) {
        showGitHubStatus('success', `Loaded ${loadedFiles.length} files`);
    }
}

async function tryCommonFiles(parsed) {
    const commonFiles = [
        'vocabulary.json',
        'words.json',
        'core.json',
        '1A-essentials.json',
        'level-1.json'
    ];
    
    const loadedFiles = [];
    
    for (const filename of commonFiles) {
        try {
            const fileUrl = `${parsed.rawBaseUrl}${parsed.path ? parsed.path + '/' : ''}${filename}`;
            const response = await fetchWithFallback(fileUrl);
            
            if (response.ok) {
                const data = await response.json();
                if (data.words) {
                    const fakeFile = { name: filename };
                    VocabularyLoader.showUploadPreview(fakeFile, data, State.get().currentVocabTab);
                    loadedFiles.push(filename);
                }
            }
        } catch (error) {
            // Silent fail for common file attempts
        }
    }
    
    if (loadedFiles.length > 0) {
        showGitHubStatus('success', `Found and loaded ${loadedFiles.length} vocabulary files`);
    } else {
        showGitHubStatus('error', 
            'No vocabulary files found. Make sure your repository contains JSON files with a "words" array.');
    }
}

// ============= GITHUB SOURCE TRACKING =============
function storeGitHubSource(languagePair, parsed, filename) {
    const sources = Storage.loadGitHubSources();
    
    if (!sources[languagePair]) {
        sources[languagePair] = [];
    }
    
    // Check if already stored
    const exists = sources[languagePair].some(s => 
        s.repo === `${parsed.owner}/${parsed.repo}` && 
        s.file === filename
    );
    
    if (!exists) {
        sources[languagePair].push({
            repo: `${parsed.owner}/${parsed.repo}`,
            branch: parsed.branch,
            path: parsed.path,
            file: filename,
            loadedAt: new Date().toISOString()
        });
        
        Storage.saveGitHubSources(sources);
    }
}

function getStoredGitHubSources(languagePair) {
    const sources = Storage.loadGitHubSources();
    return sources[languagePair] || [];
}

function removeGitHubSource(languagePair, sourceIndex) {
    const sources = Storage.loadGitHubSources();
    
    if (sources[languagePair] && sources[languagePair][sourceIndex]) {
        sources[languagePair].splice(sourceIndex, 1);
        Storage.saveGitHubSources(sources);
        return true;
    }
    
    return false;
}

// ============= STATUS DISPLAY =============
function showGitHubStatus(type, message) {
    const statusDiv = $('#github-status');
    if (statusDiv) {
        statusDiv.className = `github-status ${type}`;
        statusDiv.textContent = message;
        statusDiv.style.display = 'block';
    }
}

// ============= AUTO-LOAD ON STARTUP =============
function initializeGitHubIntegration() {
    // Load last used GitHub URL
    const lastUrl = localStorage.getItem(Storage.KEYS.LAST_GITHUB_URL);
    if (lastUrl) {
        const urlInput = $('#github-url');
        if (urlInput) {
            urlInput.value = lastUrl;
            devLog(`Last GitHub URL restored: ${lastUrl}`, 'info');
        }
    }
    
    // Set up GitHub sources display
    displayGitHubSources();
}

function displayGitHubSources() {
    // This would show stored GitHub sources in the UI
    const sources = Storage.loadGitHubSources();
    const sourceCount = Object.values(sources).reduce((sum, arr) => sum + arr.length, 0);
    
    if (sourceCount > 0) {
        devLog(`${sourceCount} GitHub sources stored`, 'info');
    }
}

// ============= GITHUB RATE LIMITING =============
async function checkGitHubRateLimit() {
    try {
        const response = await fetch('https://api.github.com/rate_limit');
        const data = await response.json();
        
        const remaining = data.rate.remaining;
        const reset = new Date(data.rate.reset * 1000);
        
        if (remaining < 10) {
            devLog(`GitHub API rate limit low: ${remaining} requests remaining until ${reset.toLocaleTimeString()}`, 'error');
            return false;
        }
        
        return true;
    } catch (error) {
        // Assume it's okay if we can't check
        return true;
    }
}

// Export GitHub functions
window.GitHubIntegration = {
    parseUrl: parseGitHubUrl,
    load: loadFromGitHub,
    loadFiles: loadGitHubFiles,
    storeSource: storeGitHubSource,
    getSources: getStoredGitHubSources,
    removeSource: removeGitHubSource,
    initialize: initializeGitHubIntegration,
    checkRateLimit: checkGitHubRateLimit,
    showStatus: showGitHubStatus
};

// Make function globally available for HTML onclick handler
window.loadFromGitHub = loadFromGitHub;