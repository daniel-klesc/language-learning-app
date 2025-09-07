// src/js/11-vocabulary-manager.js
// Vocabulary Manager UI and controls

// ============= VOCABULARY MANAGER STATE =============
let currentVocabTab = 'cs-vi';
let currentFilter = 'all';
let activeCategories = new Set();

// ============= MANAGER INITIALIZATION =============
function openVocabManager() {
    console.log('openVocabManager called');
    devLog('Opening Vocabulary Manager...', 'info');
    
    try {
        toggleSettings(); // Close settings menu
        
        const vocabManager = $('#vocab-manager');
        if (!vocabManager) {
            console.error('Vocabulary Manager element not found!');
            alert('Vocabulary Manager element not found!');
            return;
        }
        
        vocabManager.classList.remove('hidden');
        vocabManager.style.display = 'flex';
        
        currentVocabTab = State.getCurrentLanguagePair() || 'cs-vi';
        switchVocabTab(currentVocabTab);
        loadVocabManagerData();
        
        devLog('Vocabulary Manager opened', 'success');
    } catch (error) {
        console.error('Error opening vocabulary manager:', error);
        alert('Error opening vocabulary manager: ' + error.message);
    }
}

function closeVocabManager() {
    const vocabManager = $('#vocab-manager');
    if (vocabManager) {
        vocabManager.classList.add('hidden');
        vocabManager.style.display = 'none';
    }
}

// ============= TAB MANAGEMENT =============
function switchVocabTab(lang) {
    currentVocabTab = lang;
    State.get().currentVocabTab = lang;
    
    // Update tab UI
    $$('.vocab-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.lang === lang) {
            tab.classList.add('active');
        }
    });
    
    VocabularyLoader.displayVocabulary(lang);
}

function switchUploadTab(tab) {
    // Update tab buttons
    $$('.upload-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show/hide tab content
    $('#local-upload').style.display = tab === 'local' ? 'block' : 'none';
    $('#github-upload').style.display = tab === 'github' ? 'block' : 'none';
    $('#library-upload').style.display = tab === 'library' ? 'block' : 'none';
    
    // Load library if switching to library tab
    if (tab === 'library' && typeof loadVocabularyLibrary === 'function') {
        loadVocabularyLibrary();
    }
}

// ============= DATA LOADING =============
function loadVocabManagerData() {
    // Load user vocabulary from localStorage
    State.loadUserVocabulary();
    
    // Load file tracking
    const files = Storage.loadVocabularyFiles();
    State.get().vocabularyFiles = files;
    
    VocabularyLoader.displayVocabulary(currentVocabTab);
}

// ============= PREVIEW DISPLAY =============
function updatePreviewDisplay() {
    const pendingUpload = State.get().pendingUpload;
    if (!pendingUpload) return;
    
    const viewMode = $('#preview-view-mode').value;
    const sortBy = $('#preview-sort-language').value;
    let wordsToDisplay = [...pendingUpload.words];
    
    // Apply status filter
    if (currentFilter === 'new') {
        wordsToDisplay = wordsToDisplay.filter(w => w.status === 'new');
    } else if (currentFilter === 'duplicate') {
        wordsToDisplay = wordsToDisplay.filter(w => w.status === 'duplicate');
    }
    
    // Apply category filter
    if (activeCategories.size > 0) {
        wordsToDisplay = wordsToDisplay.filter(w => activeCategories.has(w.category));
    }
    
    // Sort words
    wordsToDisplay.sort((a, b) => {
        const fieldA = sortBy === 'source' ? a.word : a.translation;
        const fieldB = sortBy === 'source' ? b.word : b.translation;
        return fieldA.toLowerCase().localeCompare(fieldB.toLowerCase());
    });
    
    // Build HTML based on view mode
    let html = '';
    
    if (viewMode === 'category') {
        // Group by category
        const grouped = groupBy(wordsToDisplay, 'category');
        
        // Sort categories alphabetically
        Object.keys(grouped).sort().forEach(category => {
            const categoryWords = grouped[category];
            html += `
                <div class="preview-category-section">
                    <div class="preview-category-header">
                        <span>${capitalizeFirst(category)}</span>
                        <span class="preview-category-count">${categoryWords.length} words</span>
                    </div>`;
            
            categoryWords.forEach(word => {
                const originalIndex = pendingUpload.words.indexOf(word);
                html += createPreviewItemHTML(word, originalIndex);
            });
            
            html += '</div>';
        });
    } else {
        // Alphabetical view without categories
        wordsToDisplay.forEach(word => {
            const originalIndex = pendingUpload.words.indexOf(word);
            html += createPreviewItemHTML(word, originalIndex);
        });
    }
    
    const listElement = $('#upload-preview-list');
    if (listElement) {
        listElement.innerHTML = html || '<p style="text-align: center; color: #999;">No words match the current filters</p>';
    }
}

function createPreviewItemHTML(word, index) {
    const statusClass = word.status;
    const statusText = word.status === 'new' ? 'NEW' : 'DUPLICATE';
    const checked = word.selected ? 'checked' : '';
    
    return `
        <div class="preview-item ${statusClass}" data-index="${index}" data-status="${statusClass}">
            <input type="checkbox" class="preview-checkbox" ${checked} onchange="toggleWordSelection(${index})">
            <div class="preview-item-content">
                <div class="preview-word">${word.word}</div>
                <div class="preview-translation">${word.translation} ${word.romanization ? `(${word.romanization})` : ''}</div>
                ${word.status === 'duplicate' ? `
                    <div class="preview-duplicate-info">
                        Existing: ${word.existingWord.translation} 
                        ${word.existingWord.romanization ? `(${word.existingWord.romanization})` : ''}
                    </div>
                ` : ''}
            </div>
            <span class="preview-status ${statusClass}">${statusText}</span>
        </div>
    `;
}

// ============= FILTER CONTROLS =============
function toggleFilterSection() {
    const filterContent = $('#filter-content');
    const toggleIcon = $('#filter-toggle-icon');
    
    if (filterContent.classList.contains('collapsed')) {
        filterContent.classList.remove('collapsed');
        toggleIcon.classList.remove('collapsed');
        toggleIcon.textContent = '▼';
    } else {
        filterContent.classList.add('collapsed');
        toggleIcon.classList.add('collapsed');
        toggleIcon.textContent = '▶';
    }
}

function toggleCategoryFilter(category) {
    const btn = event.target;
    
    if (State.toggleCategoryFilter(category)) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
    
    updatePreviewDisplay();
}

function selectAllWords(select) {
    const pendingUpload = State.get().pendingUpload;
    if (pendingUpload) {
        pendingUpload.words.forEach(word => {
            word.selected = select;
        });
        
        // Update all checkboxes
        $$('.preview-checkbox').forEach(checkbox => {
            checkbox.checked = select;
        });
    }
}

function toggleWordSelection(index) {
    const pendingUpload = State.get().pendingUpload;
    if (pendingUpload && pendingUpload.words[index]) {
        pendingUpload.words[index].selected = !pendingUpload.words[index].selected;
    }
}

function filterPreview(filter) {
    currentFilter = filter;
    State.get().currentFilter = filter;
    
    // Update filter button states
    $$('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    updatePreviewDisplay();
}

function cancelUploadPreview() {
    State.clearPendingUpload();
    currentFilter = 'all';
    activeCategories.clear();
    
    const modal = $('#upload-preview-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

// ============= VOCABULARY STATISTICS =============
function getVocabularyManagerStats() {
    const stats = {};
    
    LANGUAGE_PAIRS.forEach(pair => {
        const vocab = State.getVocabularyForPair(pair.code);
        const userVocab = State.get().userVocabulary[pair.code] || [];
        
        stats[pair.code] = {
            total: vocab.length,
            builtin: vocab.length - userVocab.length,
            user: userVocab.length,
            categories: unique(vocab.map(w => w.category)).length,
            files: State.get().vocabularyFiles[pair.code]?.length || 0
        };
    });
    
    return stats;
}

// ============= DELETE/EDIT FUNCTIONALITY (PLACEHOLDER) =============
function deleteWord(wordId, languagePair) {
    if (!confirm('Are you sure you want to delete this word?')) {
        return;
    }
    
    const userVocab = State.get().userVocabulary[languagePair];
    if (userVocab) {
        const index = userVocab.findIndex(w => w.id === wordId);
        if (index !== -1) {
            userVocab.splice(index, 1);
            Storage.saveUserVocabulary(State.get().userVocabulary);
            VocabularyLoader.displayVocabulary(languagePair);
            devLog(`Word ${wordId} deleted`, 'info');
        }
    }
}

function editWord(wordId, languagePair) {
    // This would open an edit modal
    // For now, it's a placeholder
    alert('Edit functionality coming soon!');
}

// ============= BATCH OPERATIONS =============
function deleteSelectedWords() {
    const selected = $$('.vocab-item-checkbox:checked');
    if (selected.length === 0) {
        alert('No words selected');
        return;
    }
    
    if (!confirm(`Delete ${selected.length} selected words?`)) {
        return;
    }
    
    // Implementation would go here
    devLog(`Batch delete: ${selected.length} words`, 'info');
}

function exportSelectedWords() {
    const selected = $$('.vocab-item-checkbox:checked');
    if (selected.length === 0) {
        alert('No words selected');
        return;
    }
    
    // Implementation would go here
    devLog(`Batch export: ${selected.length} words`, 'info');
}

// Export manager functions
window.VocabularyManager = {
    open: openVocabManager,
    close: closeVocabManager,
    switchTab: switchVocabTab,
    switchUploadTab,
    loadData: loadVocabManagerData,
    updatePreviewDisplay,
    toggleFilterSection,
    toggleCategoryFilter,
    selectAllWords,
    toggleWordSelection,
    filterPreview,
    cancelUploadPreview,
    getStats: getVocabularyManagerStats,
    deleteWord,
    editWord,
    deleteSelectedWords,
    exportSelectedWords
};

// Make functions globally available for HTML onclick handlers
window.openVocabManager = openVocabManager;
window.closeVocabManager = closeVocabManager;
window.switchVocabTab = switchVocabTab;
window.switchUploadTab = switchUploadTab;
window.updatePreviewDisplay = updatePreviewDisplay;
window.toggleFilterSection = toggleFilterSection;
window.toggleCategoryFilter = toggleCategoryFilter;
window.selectAllWords = selectAllWords;
window.toggleWordSelection = toggleWordSelection;
window.filterPreview = filterPreview;
window.cancelUploadPreview = cancelUploadPreview;