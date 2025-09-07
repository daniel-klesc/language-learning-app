// src/js/15-init.js
// Application initialization and startup

// ============= INITIALIZATION SEQUENCE =============
async function initApp() {
    devLog('Initializing Language Learning App v' + APP_VERSION, 'info');
    
    try {
        // 1. Load saved state
        State.load();
        
        // 2. Initialize vocabulary system
        await Vocabulary.initialize();
        
        // 3. Load progress data
        Storage.loadProgress();
        
        // 4. Setup UI
        initializeUI();
        
        // 5. Update displays
        updateAllDisplays();
        
        // 6. Setup event listeners
        setupEventListeners();
        
        // 7. Check for paused session
        checkPausedSession();
        
        // 8. Setup skill system
        SkillSystem.setupSkillPillLongPress();
        
        devLog('App initialized successfully', 'success');
        
    } catch (error) {
        devLog(`Initialization error: ${error.message}`, 'error');
        console.error('Full error:', error);
        
        // Show error to user
        alert('Error initializing app. Some features may not work properly.');
    }
}

// ============= UI INITIALIZATION =============
function initializeUI() {
    // Ensure proper initial screen state
    show('#home-content');
    hide('#study-screen');
    hide('#complete-screen');
    $('#main-container').classList.remove('study-mode');
    
    // Initialize skill level display
    SkillSystem.updateSkillLevelDisplay();
    
    // Set up language buttons
    setupLanguageButtons();
    
    // Initialize development console if enabled
    if (DEV_MODE) {
        $('#dev-toggle').classList.remove('hidden');
        devLog('Development mode enabled', 'success');
        devLog('Set DEV_MODE = false for production', 'info');
    }
}

// ============= EVENT LISTENERS SETUP =============
function setupEventListeners() {
    // Language selector
    setupLanguageButtons();
    
    // Session buttons
    setupSessionButtons();
    
    // Enter key for answer input
    const answerInput = $('#answer');
    if (answerInput) {
        answerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                StudySession.handleButtonClick();
            }
        });
    }
    
    // Settings menu
    setupSettingsListeners();
    
    // Window resize handler
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // Before unload warning for active session
    window.addEventListener('beforeunload', handleBeforeUnload);
}

function setupLanguageButtons() {
    $$('.language-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            $$('.language-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const newPair = this.dataset.pair;
            State.setCurrentLanguagePair(newPair);
            
            updateDailyGoal();
            checkPausedSession();
        });
    });
    
    // Set active button based on current state
    const currentPair = State.getCurrentLanguagePair();
    $$('.language-btn').forEach(btn => {
        if (btn.dataset.pair === currentPair) {
            btn.classList.add('active');
        }
    });
}

function setupSessionButtons() {
    // Session size buttons are set up inline in HTML
    // But we can add additional logic here if needed
}

function setupSettingsListeners() {
    // These are mostly inline in HTML, but we can enhance here
}

function handleResize() {
    // Handle responsive adjustments if needed
    const width = window.innerWidth;
    
    if (width < 480) {
        // Mobile adjustments
        devLog('Mobile view detected', 'info');
    } else if (width < 768) {
        // Tablet adjustments
        devLog('Tablet view detected', 'info');
    } else {
        // Desktop adjustments
        devLog('Desktop view detected', 'info');
    }
}

function handleBeforeUnload(e) {
    // Warn if there's an active session
    if (State.get().currentView === 'study' && State.getCurrentSession().length > 0) {
        e.preventDefault();
        e.returnValue = 'You have an active study session. Are you sure you want to leave?';
        return e.returnValue;
    }
}

// ============= DISPLAY UPDATES =============
function updateAllDisplays() {
    updateDailyGoal();
    updateStats();
    updateSessionHistory();
}

function updateDailyGoal() {
    const data = Storage.loadProgress();
    const dailyProgress = data.dailyProgress || { new: 0, review: 0 };
    const dailyGoal = State.getDailyGoal();
    
    const totalGoal = dailyGoal.new + dailyGoal.review;
    const totalComplete = dailyProgress.new + dailyProgress.review;
    
    $('#goal-progress').textContent = `${totalComplete}/${totalGoal}`;
    $('#goal-bar').style.width = `${(totalComplete / totalGoal) * 100}%`;
    $('#words-new').textContent = `New: ${dailyProgress.new}/${dailyGoal.new}`;
    $('#words-review').textContent = `Review: ${dailyProgress.review}/${dailyGoal.review}`;
    $('#time-spent').textContent = `Time: ${Math.round(dailyProgress.timeSpent || 0)} min`;
    
    const remainingWords = totalGoal - totalComplete;
    const estimatedTime = Math.max(0, remainingWords * 1);
    $('#time-estimate').textContent = 
        remainingWords > 0 ? `~${estimatedTime} minutes remaining today` : `Daily goal complete! 🎉`;
    
    $('#all-time').textContent = `~${remainingWords} min`;
}

function updateStats() {
    const data = Storage.loadProgress();
    $('#streak').textContent = data.streak || 0;
    
    // Count mastered words
    let masteredCount = 0;
    if (data.progress) {
        Object.values(data.progress).forEach(langPair => {
            Object.values(langPair).forEach(card => {
                const advancedStats = card.skillProgress?.[3];
                if (advancedStats && advancedStats.total >= 3 && 
                    (advancedStats.correct / advancedStats.total) >= 0.8) {
                    masteredCount++;
                }
            });
        });
    }
    $('#total-learned').textContent = masteredCount;
    
    if (data.accuracy && data.accuracy.total > 0) {
        const acc = Math.round((data.accuracy.correct / data.accuracy.total) * 100);
        $('#accuracy').textContent = acc + '%';
    } else {
        $('#accuracy').textContent = '0%';
    }
}

function checkPausedSession() {
    const state = State.get();
    const pausedSession = state.pausedSession;
    
    if (pausedSession && pausedSession.languagePair === state.currentLanguagePair) {
        $('#continue-session-btn').classList.remove('hidden');
        $('#remaining-words').textContent = 
            pausedSession.cards.length - pausedSession.currentIndex;
    } else {
        $('#continue-session-btn').classList.add('hidden');
    }
}

function updateSessionHistory() {
    const data = Storage.loadProgress();
    const sessions = data.dailyProgress?.sessions || [];
    const historyDiv = $('#session-history');
    
    if (!historyDiv) return;
    
    if (sessions.length === 0) {
        historyDiv.innerHTML = '<div style="color: #999; font-size: 13px;">No sessions yet today</div>';
        return;
    }
    
    historyDiv.innerHTML = sessions.map(s => `
        <div class="history-item">
            <span>${s.time}</span>
            <span>${s.words} words • ${s.accuracy}%</span>
        </div>
    `).join('');
}

// ============= SETTINGS FUNCTIONS =============
window.toggleSettings = function() {
    const menu = $('#settings-menu');
    const overlay = $('#settings-overlay');
    
    if (menu.classList.contains('open')) {
        menu.classList.remove('open');
        overlay.classList.remove('open');
    } else {
        menu.classList.add('open');
        overlay.classList.add('open');
    }
}

window.refreshVocabulary = async function() {
    devLog('Refreshing vocabulary...', 'info');
    
    try {
        await Vocabulary.refresh();
        alert('Vocabulary refreshed successfully!');
        toggleSettings();
    } catch (error) {
        alert('Error refreshing vocabulary: ' + error.message);
    }
}

window.showStatistics = function() {
    const data = Storage.loadProgress();
    const stats = SpacedRepetition.getReviewStatistics(State.getCurrentLanguagePair());
    
    let message = 'Learning Statistics\n\n';
    message += `Current Streak: ${data.streak || 0} days\n`;
    message += `Overall Accuracy: ${data.accuracy?.total ? Math.round((data.accuracy.correct / data.accuracy.total) * 100) : 0}%\n\n`;
    message += `Vocabulary Status:\n`;
    message += `- New: ${stats.new}\n`;
    message += `- Due for Review: ${stats.due}\n`;
    message += `- Future: ${stats.future}\n`;
    message += `- Mastered: ${stats.mastered}\n\n`;
    message += `Skill Distribution:\n`;
    message += `- Beginner: ${stats.bySkillLevel[1] || 0}\n`;
    message += `- Intermediate: ${stats.bySkillLevel[2] || 0}\n`;
    message += `- Advanced: ${stats.bySkillLevel[3] || 0}`;
    
    alert(message);
    toggleSettings();
}

window.exportProgress = function() {
    Storage.exportAllData();
    toggleSettings();
}

window.resetAllData = function() {
    if (Storage.clearAllData()) {
        location.reload();
    }
}

// ============= GLOBAL EXPORTS =============
// Make key functions globally available
window.startSession = StudySession.start;
window.continueSession = StudySession.continue;
window.pauseSession = StudySession.pause;
window.showCard = StudySession.showCard;
window.checkAnswer = StudySession.checkAnswer;
window.nextCard = StudySession.nextCard;
window.backToStart = StudySession.backToStart;
window.finishForToday = StudySession.finishForToday;

// ============= STARTUP =============
// Initialize when page loads
window.onload = function() {
    // Force proper initial state
    const studyScreen = $('#study-screen');
    const completeScreen = $('#complete-screen');
    const homeContent = $('#home-content');
    
    if (studyScreen) {
        studyScreen.classList.add('hidden');
        studyScreen.style.display = 'none';
    }
    if (completeScreen) {
        completeScreen.classList.add('hidden');
        completeScreen.style.display = 'none';
    }
    if (homeContent) {
        homeContent.style.display = 'block';
    }
    
    // Remove study mode from container
    $('#main-container').classList.remove('study-mode');
    
    // Initialize app
    initApp();
};

// Export for testing/debugging
window.App = {
    version: APP_VERSION,
    init: initApp,
    updateDailyGoal,
    updateStats,
    checkPausedSession,
    updateSessionHistory
};