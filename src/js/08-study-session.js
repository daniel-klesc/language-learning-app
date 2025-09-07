// src/js/08-study-session.js
// Study session management and flow control

// ============= SESSION CREATION =============
function startSession(size) {
    devLog(`Starting session with size: ${size}`, 'info');
    
    const languagePair = State.getCurrentLanguagePair();
    const cards = SpacedRepetition.getCardsForSession(size, languagePair);
    
    if (cards.length === 0) {
        showNoCardsMessage();
        return false;
    }
    
    // Create session in state
    State.createSession(cards);
    
    // Clear paused session if any
    State.clearPausedSession();
    
    // Switch to study mode UI
    switchToStudyMode();
    
    // Setup skill pills for interaction
    SkillSystem.setupSkillPillLongPress();
    
    // Show first card
    showCard();
    
    return true;
}

function continueSession() {
    if (State.resumePausedSession()) {
        switchToStudyMode();
        SkillSystem.setupSkillPillLongPress();
        showCard();
        return true;
    }
    return false;
}

function pauseSession() {
    const data = Storage.loadProgress();
    
    // Update time spent
    const sessionStats = State.getSessionStats();
    if (sessionStats.startTime) {
        const timeSpent = (Date.now() - sessionStats.startTime) / 60000;
        data.dailyProgress.timeSpent = (data.dailyProgress.timeSpent || 0) + timeSpent;
    }
    
    Storage.saveProgress(data);
    
    // Pause session in state
    State.pauseCurrentSession();
    
    // Return to home
    backToStart();
}

// ============= CARD DISPLAY =============
function showCard(preserveSkillLevel = false) {
    const card = State.getCurrentCard();
    
    if (!card) {
        completeSession();
        return;
    }
    
    // Determine skill level if not preserving
    if (!preserveSkillLevel) {
        State.get().currentCardSkillLevel = SkillSystem.determineCardSkillLevel(card.id);
    }
    
    const skillLevel = State.get().currentCardSkillLevel;
    devLog(`Showing card ${card.id} at ${SKILL_NAMES[skillLevel]} level`, 'info');
    
    // Update skill display
    SkillSystem.updateCardSkillDisplay(card.id);
    
    // Reset UI
    resetCardUI();
    
    // Display card content
    displayCardContent(card);
    
    // Setup input method based on skill level
    setupInputMethod(card, skillLevel);
    
    // Update progress display
    updateSessionProgressDisplay();
}

function resetCardUI() {
    State.get().isAnswerShown = false;
    State.get().selectedChoiceIndex = -1;
    
    const feedback = $('#feedback');
    if (feedback) feedback.classList.add('hidden');
    
    const button = $('#action-button');
    if (button) {
        button.textContent = 'Check Answer';
        button.classList.remove('next');
    }
}

function displayCardContent(card) {
    $('#word').textContent = card.word;
    $('#category').textContent = card.category;
    
    // Hide romanization initially
    const romanizationEl = $('#romanization');
    if (romanizationEl) {
        if (card.romanization) {
            romanizationEl.textContent = card.romanization;
            romanizationEl.classList.add('hidden');
        } else {
            romanizationEl.classList.add('hidden');
        }
    }
}

function setupInputMethod(card, skillLevel) {
    const choiceGrid = $('#choice-grid');
    const inputGroup = $('#input-group');
    
    if (skillLevel === SKILL_LEVELS.BEGINNER) {
        // Multiple choice
        show(choiceGrid);
        hide(inputGroup);
        
        const vocab = State.getVocabularyForPair();
        const options = SkillSystem.generateMultipleChoice(card, vocab);
        renderMultipleChoice(options);
        
    } else {
        // Text input for intermediate and advanced
        hide(choiceGrid);
        show(inputGroup);
        
        const input = $('#answer');
        if (input) {
            input.value = '';
            input.focus();
            
            // Update placeholder based on level
            input.placeholder = skillLevel === SKILL_LEVELS.INTERMEDIATE ?
                'Type the translation (diacritics optional)...' :
                'Type the exact translation...';
        }
    }
}

function renderMultipleChoice(options) {
    const grid = $('#choice-grid');
    grid.innerHTML = '';
    
    options.forEach((option, index) => {
        const btn = createElement('button', 'choice-btn');
        btn.onclick = () => selectChoice(index);
        btn.innerHTML = `
            <span class="choice-text">${option.text}</span>
            ${option.romanization ? `<span class="choice-romanization">${option.romanization}</span>` : ''}
        `;
        btn.dataset.index = index;
        btn.dataset.correct = option.isCorrect;
        grid.appendChild(btn);
    });
}

// ============= ANSWER HANDLING =============
window.selectChoice = function(index) {
    if (State.get().isAnswerShown) return;
    
    // Clear previous selection
    $$('.choice-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Mark new selection
    const btn = $(`.choice-btn[data-index="${index}"]`);
    if (btn) {
        btn.classList.add('selected');
        State.get().selectedChoiceIndex = index;
    }
}

window.handleButtonClick = function() {
    const button = $('#action-button');
    if (button.classList.contains('next')) {
        nextCard();
    } else {
        checkAnswer();
    }
}

function checkAnswer() {
    if (State.get().isAnswerShown) {
        nextCard();
        return;
    }
    
    const card = State.getCurrentCard();
    const skillLevel = State.get().currentCardSkillLevel;
    let userAnswer = '';
    let result;
    
    if (skillLevel === SKILL_LEVELS.BEGINNER) {
        // Multiple choice
        if (State.get().selectedChoiceIndex === -1) {
            devLog('No choice selected', 'error');
            return;
        }
        
        const choices = $$('.choice-btn');
        const selectedBtn = choices[State.get().selectedChoiceIndex];
        const isCorrect = selectedBtn.dataset.correct === 'true';
        
        // Visual feedback for multiple choice
        choices.forEach(btn => {
            if (btn.dataset.correct === 'true') {
                btn.classList.add('correct');
            } else if (btn === selectedBtn && !isCorrect) {
                btn.classList.add('incorrect');
            } else {
                btn.classList.add('dimmed');
            }
            btn.disabled = true;
        });
        
        result = {
            isCorrect: isCorrect,
            feedback: isCorrect ? '✓ Correct!' : `✗ Incorrect. The answer is: <strong>${card.translation}</strong>`,
            feedbackClass: isCorrect ? 'correct' : 'incorrect'
        };
        
    } else {
        // Text input
        userAnswer = $('#answer').value.trim();
        result = SkillSystem.validateAnswer(userAnswer, card.translation, skillLevel);
    }
    
    // Show romanization when answer is checked
    const romanizationEl = $('#romanization');
    if (romanizationEl && card.romanization) {
        romanizationEl.classList.remove('hidden');
    }
    
    // Show feedback
    showFeedback(result);
    
    // Update progress
    SpacedRepetition.updateCardProgress(card.id, result.isCorrect, skillLevel, card.type);
    
    // Update session stats
    State.incrementSessionStats(result.isCorrect);
    State.get().sessionStats.wordsCompleted.push(card.id);
    
    State.get().isAnswerShown = true;
    
    // Change button to "Next Card"
    const button = $('#action-button');
    const isLastCard = State.get().currentCardIndex === State.getCurrentSession().length - 1;
    button.textContent = isLastCard ? 'Finish' : 'Next Card';
    button.classList.add('next');
    
    updateSessionProgressDisplay();
}

function showFeedback(result) {
    const feedback = $('#feedback');
    if (feedback) {
        feedback.classList.remove('hidden');
        feedback.className = `feedback ${result.feedbackClass}`;
        feedback.innerHTML = result.feedback;
    }
}

function nextCard() {
    if (State.advanceToNextCard()) {
        showCard();
    } else {
        completeSession();
    }
}

// ============= SESSION COMPLETION =============
function completeSession() {
    const data = Storage.loadProgress();
    const sessionStats = State.getSessionStats();
    
    // Calculate session time
    const sessionTime = sessionStats.startTime ? 
        Math.round((Date.now() - sessionStats.startTime) / 60000) : 0;
    
    // Update time spent
    data.dailyProgress.timeSpent = (data.dailyProgress.timeSpent || 0) + sessionTime;
    
    // Add to session history
    if (!data.dailyProgress.sessions) data.dailyProgress.sessions = [];
    data.dailyProgress.sessions.push({
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        words: sessionStats.total,
        accuracy: sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0
    });
    
    // Adaptive goal adjustment
    SpacedRepetition.adjustDailyGoals();
    
    Storage.saveProgress(data);
    showCompleteScreen();
}

function showCompleteScreen() {
    const data = Storage.loadProgress();
    const dailyGoal = State.getDailyGoal();
    const totalGoal = dailyGoal.new + dailyGoal.review;
    const totalComplete = (data.dailyProgress?.new || 0) + (data.dailyProgress?.review || 0);
    const sessionStats = State.getSessionStats();
    
    // Update complete screen content
    const achievementEl = $('#achievement');
    if (achievementEl) {
        if (totalComplete >= totalGoal) {
            achievementEl.classList.remove('hidden');
        } else {
            achievementEl.classList.add('hidden');
        }
    }
    
    $('#session-words').textContent = sessionStats.total;
    $('#session-accuracy-final').textContent = 
        sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) + '%' : '0%';
    $('#session-time').textContent = 
        sessionStats.startTime ? Math.round((Date.now() - sessionStats.startTime) / 60000) : 0;
    
    // Switch views
    switchToCompleteMode();
    updateStats();
}

function showNoCardsMessage() {
    const html = `
        <div class="no-cards">
            <h2>No Cards Available</h2>
            <p style="margin: 20px 0;">
                All cards are scheduled for future review. Great job! Come back tomorrow.
            </p>
            <p style="color: #666; font-size: 14px;">
                Next review: Tomorrow<br>
                Cards mastered: ${$('#total-learned').textContent}
            </p>
            <button class="btn-primary" onclick="backToStart()">Back to Home</button>
        </div>
    `;
    
    const completeScreen = $('#complete-screen');
    completeScreen.innerHTML = html;
    
    hide('#start-screen');
    show('#complete-screen');
}

// ============= UI MODE SWITCHING =============
function switchToStudyMode() {
    $('#main-container').classList.add('study-mode');
    hide('#home-content');
    hide('#complete-screen');
    show('#study-screen');
    State.setCurrentView('study');
}

function switchToCompleteMode() {
    hide('#study-screen');
    hide('#home-content');
    show('#complete-screen');
    $('#main-container').classList.remove('study-mode');
    State.setCurrentView('complete');
}

window.backToStart = function() {
    hide('#study-screen');
    hide('#complete-screen');
    show('#home-content');
    $('#main-container').classList.remove('study-mode');
    State.setCurrentView('home');
    
    updateDailyGoal();
    updateStats();
    checkPausedSession();
    updateSessionHistory();
}

window.finishForToday = function() {
    backToStart();
}

// ============= PROGRESS DISPLAY =============
function updateSessionProgressDisplay() {
    const session = State.getCurrentSession();
    const stats = State.getSessionStats();
    const currentIndex = State.get().currentCardIndex;
    
    if (session.length === 0) return;
    
    // Update progress bar
    const progress = ((currentIndex) / session.length) * 100;
    $('#session-bar').style.width = `${progress}%`;
    
    // Update numbers
    $('#current-word-num').textContent = currentIndex + 1;
    $('#total-words').textContent = session.length;
    $('#session-correct').textContent = `Correct: ${stats.correct}`;
    
    // Update accuracy
    const accuracy = stats.total > 0 
        ? Math.round((stats.correct / stats.total) * 100) 
        : 0;
    $('#session-accuracy').textContent = `Accuracy: ${accuracy}%`;
}

// Export session functions
window.StudySession = {
    start: startSession,
    continue: continueSession,
    pause: pauseSession,
    showCard,
    checkAnswer,
    nextCard,
    complete: completeSession,
    backToStart,
    selectChoice,
    handleButtonClick
};