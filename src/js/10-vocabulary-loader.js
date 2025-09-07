// src/js/10-vocabulary-loader.js
// Vocabulary file loading and management

// ============= FILE LOADING =============
async function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        await handleFiles(files);
        // Reset the file input so the same file can be selected again
        event.target.value = '';
    }
}

async function handleFiles(files) {
    console.log('handleFiles called with', files.length, 'files');
    
    for (const file of files) {
        console.log('Processing file:', file.name, file.type);
        
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
            try {
                const text = await file.text();
                console.log('File text read, length:', text.length);
                
                const data = JSON.parse(text);
                console.log('JSON parsed, words count:', data.words ? data.words.length : 0);
                
                // Validate structure
                const validation = validateVocabularyData(data);
                if (validation.valid) {
                    const metadata = data.metadata || {};
                    const languagePair = metadata.language_pair || State.get().currentVocabTab;
                    
                    console.log('Calling showUploadPreview for', languagePair);
                    // Show preview instead of directly importing
                    showUploadPreview(file, data, languagePair);
                } else {
                    alert(`Invalid file format in ${file.name}: ${validation.error}`);
                }
            } catch (error) {
                console.error('Error in handleFiles:', error);
                devLog(`Error processing ${file.name}: ${error.message}`, 'error');
                alert(`Error processing ${file.name}: ${error.message}`);
            }
        } else {
            alert(`${file.name} is not a JSON file`);
        }
    }
}

// ============= DRAG AND DROP =============
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const uploadZone = $('#upload-zone');
    if (uploadZone) {
        uploadZone.classList.add('dragover');
    }
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const uploadZone = $('#upload-zone');
    if (uploadZone) {
        uploadZone.classList.remove('dragover');
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const uploadZone = $('#upload-zone');
    if (uploadZone) {
        uploadZone.classList.remove('dragover');
    }
    
    const files = e.dataTransfer.files;
    handleFiles(files);
}

// ============= DUPLICATE DETECTION =============
function checkDuplicates(newWords, languagePair) {
    const existingVocab = State.getVocabularyForPair(languagePair);
    const results = [];
    
    newWords.forEach(newWord => {
        const duplicate = existingVocab.find(existing => 
            existing.word.toLowerCase() === newWord.word.toLowerCase()
        );
        
        results.push({
            ...newWord,
            status: duplicate ? 'duplicate' : 'new',
            existingWord: duplicate,
            selected: true // Default to selected
        });
    });
    
    return results;
}

// ============= UPLOAD PREVIEW =============
function showUploadPreview(file, data, languagePair) {
    console.log('showUploadPreview called', file.name, data, languagePair);
    devLog(`Showing preview for ${file.name}`, 'info');
    
    try {
        const words = data.words || [];
        const analyzedWords = checkDuplicates(words, languagePair);
        
        // Store pending upload data
        State.setPendingUpload(file, {
            words: analyzedWords,
            metadata: data.metadata
        }, languagePair);
        
        // Update preview header
        const fileNameElement = $('#upload-file-name');
        if (fileNameElement) {
            fileNameElement.textContent = `File: ${file.name}`;
        }
        
        // Count status
        const newCount = analyzedWords.filter(w => w.status === 'new').length;
        const duplicateCount = analyzedWords.filter(w => w.status === 'duplicate').length;
        
        const summaryElement = $('#upload-summary');
        if (summaryElement) {
            summaryElement.innerHTML = `
                <span class="summary-item new">New: ${newCount}</span>
                <span class="summary-item duplicate">Duplicates: ${duplicateCount}</span>
                <span class="summary-item total">Total: ${words.length}</span>
            `;
        }
        
        // Create category filters
        const categories = [...new Set(analyzedWords.map(w => w.category))].sort();
        const categoryContainer = $('#upload-preview-categories');
        if (categoryContainer) {
            let categoryHTML = '';
            if (categories.length > 0) {
                categoryHTML = `
                    <div class="category-filters-label">Filter by Category:</div>
                    <div class="category-filters-grid">
                        ${categories.map(cat => `
                            <button class="category-filter-btn" onclick="toggleCategoryFilter('${cat}')">
                                ${capitalizeFirst(cat)}
                            </button>
                        `).join('')}
                    </div>
                `;
            }
            categoryContainer.innerHTML = categoryHTML;
        }
        
        // Display words
        updatePreviewDisplay();
        
        // Show preview modal
        const modal = $('#upload-preview-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            console.log('Preview modal shown');
            devLog('Preview modal displayed', 'success');
        } else {
            console.error('Upload preview modal element not found');
            alert('Preview modal not found. Please refresh the page.');
        }
    } catch (error) {
        console.error('Error in showUploadPreview:', error);
        devLog(`Error showing preview: ${error.message}`, 'error');
        alert(`Error showing preview: ${error.message}`);
    }
}

// ============= IMPORT CONFIRMATION =============
function confirmUpload() {
    const pendingUpload = State.get().pendingUpload;
    if (!pendingUpload) return;
    
    const strategy = $('#duplicate-strategy').value;
    const languagePair = pendingUpload.languagePair;
    const selectedWords = pendingUpload.words.filter(w => w.selected);
    
    let addedCount = 0;
    let skippedCount = 0;
    let replacedCount = 0;
    
    // Initialize user vocabulary if needed
    const userVocab = State.get().userVocabulary;
    if (!userVocab[languagePair]) {
        userVocab[languagePair] = [];
    }
    
    // Get max ID
    const existingIds = State.getVocabularyForPair(languagePair).map(w => w.id);
    let maxId = Math.max(...existingIds, 1000);
    
    selectedWords.forEach(word => {
        if (word.status === 'new') {
            // Add new word
            if (!word.id) {
                word.id = ++maxId;
            }
            userVocab[languagePair].push(word);
            addedCount++;
        } else if (word.status === 'duplicate') {
            // Handle duplicate based on strategy
            if (strategy === 'skip') {
                skippedCount++;
            } else if (strategy === 'replace') {
                // Find and replace existing word
                const existingIndex = userVocab[languagePair].findIndex(w => 
                    w.word.toLowerCase() === word.word.toLowerCase()
                );
                if (existingIndex !== -1) {
                    word.id = userVocab[languagePair][existingIndex].id;
                    userVocab[languagePair][existingIndex] = word;
                } else {
                    // It's in the main vocabulary, so add to user vocabulary as override
                    if (!word.id) {
                        word.id = ++maxId;
                    }
                    userVocab[languagePair].push(word);
                }
                replacedCount++;
            } else if (strategy === 'add') {
                // Add as alternate translation
                if (!word.id) {
                    word.id = ++maxId;
                }
                word.word = word.word + ' (alt)'; // Mark as alternate
                userVocab[languagePair].push(word);
                addedCount++;
            }
        }
    });
    
    // Save to localStorage
    Storage.saveUserVocabulary(userVocab);
    
    // Track file
    const vocabularyFiles = State.get().vocabularyFiles;
    if (!vocabularyFiles[languagePair]) {
        vocabularyFiles[languagePair] = [];
    }
    vocabularyFiles[languagePair].push({
        name: pendingUpload.file.name,
        wordCount: selectedWords.length,
        uploadedAt: new Date().toISOString()
    });
    Storage.saveVocabularyFiles(vocabularyFiles);
    
    // Update main vocabulary data
    State.addUserVocabulary(languagePair, userVocab[languagePair]);
    
    // Show result message
    let message = `Import complete!\n`;
    if (addedCount > 0) message += `✓ Added: ${addedCount} words\n`;
    if (replacedCount > 0) message += `✓ Replaced: ${replacedCount} words\n`;
    if (skippedCount > 0) message += `✓ Skipped: ${skippedCount} duplicates`;
    
    alert(message);
    
    // Close preview and refresh display
    cancelUploadPreview();
    displayVocabulary(State.get().currentVocabTab);
    
    devLog(`Import complete: ${addedCount} added, ${replacedCount} replaced, ${skippedCount} skipped`, 'success');
}

// ============= EXPORT FUNCTIONALITY =============
function exportVocabulary(languagePair) {
    const lang = languagePair || State.get().currentVocabTab;
    const vocab = State.getVocabularyForPair(lang);
    
    const exportData = {
        metadata: {
            language_pair: lang,
            exported_at: new Date().toISOString(),
            word_count: vocab.length,
            version: APP_VERSION
        },
        words: vocab
    };
    
    const filename = generateExportFilename(`vocabulary-${lang}`);
    downloadJSON(exportData, filename);
    
    devLog(`Exported ${vocab.length} words to ${filename}`, 'success');
}

// ============= VOCABULARY DISPLAY =============
function displayVocabulary(lang) {
    const vocabList = $('#vocab-list');
    if (!vocabList) return;
    
    const vocab = State.getVocabularyForPair(lang);
    
    // Group by category
    const categories = groupBy(vocab, 'category');
    
    // Build HTML
    let html = '';
    Object.keys(categories).sort().forEach(category => {
        html += `
            <div class="vocab-category">
                <div class="vocab-category-header">
                    <span>${capitalizeFirst(category)}</span>
                    <span>${categories[category].length} words</span>
                </div>`;
        
        categories[category].forEach(word => {
            const difficultyClass = word.difficulty === 1 ? 'easy' : 
                                  word.difficulty === 2 ? 'medium' : 'hard';
            const difficultyText = word.difficulty === 1 ? 'Easy' : 
                                 word.difficulty === 2 ? 'Medium' : 'Hard';
            
            html += `
                <div class="vocab-item" data-word="${(word.word || '').toLowerCase()}" data-translation="${(word.translation || '').toLowerCase()}">
                    <div class="vocab-item-text">
                        <div class="vocab-word">${word.word}</div>
                        <div class="vocab-translation">${word.translation} ${word.romanization ? `(${word.romanization})` : ''}</div>
                    </div>
                    <div class="vocab-item-actions">
                        <span class="vocab-difficulty ${difficultyClass}">${difficultyText}</span>
                    </div>
                </div>`;
        });
        
        html += '</div>';
    });
    
    vocabList.innerHTML = html || '<p style="text-align: center; color: #999;">No vocabulary loaded</p>';
    
    // Update stats
    const statsElement = $('#vocab-stats-text');
    if (statsElement) {
        statsElement.textContent = `Total: ${vocab.length} words across ${Object.keys(categories).length} categories`;
    }
}

// ============= SEARCH FUNCTIONALITY =============
function searchVocabulary(query) {
    const items = $$('.vocab-item');
    const categories = $$('.vocab-category');
    const searchTerm = query.toLowerCase();
    
    if (!searchTerm) {
        // Show all
        items.forEach(item => item.style.display = 'flex');
        categories.forEach(cat => cat.style.display = 'block');
        return;
    }
    
    // Hide/show based on search
    categories.forEach(category => {
        let hasVisibleItems = false;
        const categoryItems = category.querySelectorAll('.vocab-item');
        
        categoryItems.forEach(item => {
            const word = item.dataset.word || '';
            const translation = item.dataset.translation || '';
            
            if (word.includes(searchTerm) || translation.includes(searchTerm)) {
                item.style.display = 'flex';
                hasVisibleItems = true;
            } else {
                item.style.display = 'none';
            }
        });
        
        category.style.display = hasVisibleItems ? 'block' : 'none';
    });
}

// Export loader functions
window.VocabularyLoader = {
    handleFileSelect,
    handleFiles,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    checkDuplicates,
    showUploadPreview,
    confirmUpload,
    exportVocabulary,
    displayVocabulary,
    searchVocabulary
};

// Make functions globally available for HTML onclick handlers
window.handleFileSelect = handleFileSelect;
window.handleFiles = handleFiles;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.confirmUpload = confirmUpload;
window.searchVocabulary = searchVocabulary;