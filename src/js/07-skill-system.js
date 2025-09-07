// src/js/07-skill-system.js
// Skill level system and progression logic

// ============= SKILL LEVEL DETERMINATION =============
function determineCardSkillLevel(cardId) {
    const cardProgress = SpacedRepetition.getCardProgress(cardId);
    const defaultLevel = State.get().defaultSkillLevel;
    
    if (!cardProgress) {
        // New card - use default or beginner
        return defaultLevel === 0 ? SKILL_LEVELS.BEGINNER : defaultLevel;
    }
    
    // Auto mode
    if (defaultLevel === 0) {
        // Use recommended skill level or last used
        return cardProgress.recommendedSkillLevel || cardProgress.skillLevel || SKILL_LEVELS.BEGINNER;
    }
    
    // Manual mode - use selected level
    return defaultLevel;
}

// ============= SKILL LEVEL UI MANAGEMENT =============
function updateSkillLevelDisplay() {
    $$('.skill-level-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.level) === State.get().defaultSkillLevel) {
            btn.classList.add('active');
        }
    });
}

function updateCardSkillDisplay(cardId) {
    const currentSkillLevel = State.get().currentCardSkillLevel || 1;
    const cardProgress = SpacedRepetition.getCardProgress(cardId);
    
    // Update skill pills
    $$('.skill-pill').forEach(pill => {
        pill.classList.remove('active');
        if (parseInt(pill.dataset.level) === currentSkillLevel) {
            pill.classList.add('active');
        }
    });
    
    // Check for promotion (only if card has progress)
    if (cardProgress && cardProgress.skillProgress) {
        checkAndNotifyPromotion(cardProgress, currentSkillLevel);
    }
}

function checkAndNotifyPromotion(cardProgress, currentSkillLevel) {
    const currentStats = cardProgress.skillProgress[currentSkillLevel] || { streak: 0, correct: 0, total: 0 };
    
    if (currentSkillLevel < 3 && 
        currentStats.streak >= PROMOTION_THRESHOLD.streak && 
        currentStats.total >= 3 &&
        (currentStats.correct / currentStats.total) >= PROMOTION_THRESHOLD.accuracy) {
        
        cardProgress.recommendedSkillLevel = currentSkillLevel + 1;
        
        // Show promotion indicator (could be enhanced with a modal or notification)
        const nextLevel = currentSkillLevel + 1;
        const nextPill = $(`.skill-pill[data-level="${nextLevel}"]`);
        if (nextPill) {
            nextPill.style.animation = 'pulse 2s infinite';
        }
        
        devLog(`Card ready for promotion to ${SKILL_NAMES[nextLevel]}!`, 'success');
    }
}

// ============= SKILL-BASED ANSWER VALIDATION =============
function validateAnswer(userAnswer, correctAnswer, skillLevel) {
    const result = {
        isCorrect: false,
        feedback: '',
        feedbackClass: '',
        showAnswer: false
    };
    
    switch (skillLevel) {
        case SKILL_LEVELS.BEGINNER:
            // Multiple choice - handled elsewhere
            result.isCorrect = userAnswer === correctAnswer;
            result.feedback = result.isCorrect ? '✓ Correct!' : `✗ Incorrect. The answer is: <strong>${correctAnswer}</strong>`;
            result.feedbackClass = result.isCorrect ? 'correct' : 'incorrect';
            result.showAnswer = !result.isCorrect;
            break;
            
        case SKILL_LEVELS.INTERMEDIATE:
            // Flexible typing (without diacritics)
            const isCloseEnough = checkIntermediateAnswer(userAnswer, correctAnswer);
            const isExact = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
            
            if (isExact) {
                result.feedback = '✓ Perfect!';
                result.feedbackClass = 'correct';
                result.isCorrect = true;
            } else if (isCloseEnough) {
                result.feedback = `✓ Close enough!`;
                result.feedback += `<div class="user-answer">You typed: ${userAnswer}</div>`;
                result.feedback += `<div class="correct-spelling">Exact spelling: <strong>${correctAnswer}</strong></div>`;
                result.feedbackClass = 'partial';
                result.isCorrect = true; // Count as correct for progression
            } else {
                result.feedback = `✗ Incorrect.`;
                result.feedback += `<div class="user-answer">You typed: ${userAnswer}</div>`;
                result.feedback += `<div class="correct-spelling">Correct answer: <strong>${correctAnswer}</strong></div>`;
                result.feedbackClass = 'incorrect';
                result.isCorrect = false;
            }
            break;
            
        case SKILL_LEVELS.ADVANCED:
            // Exact match required
            result.isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase() || 
                              userAnswer.toLowerCase() === correctAnswer.toLowerCase().replace(/\s+/g, '');
            result.feedback = result.isCorrect ? '✓ Perfect!' : `✗ Incorrect. The answer is: <strong>${correctAnswer}</strong>`;
            result.feedbackClass = result.isCorrect ? 'correct' : 'incorrect';
            result.showAnswer = !result.isCorrect;
            break;
    }
    
    return result;
}

function checkIntermediateAnswer(userAnswer, correctAnswer) {
    const normalized = normalizeAnswer(userAnswer);
    const correct = normalizeAnswer(correctAnswer);
    
    // Exact match (normalized)
    if (normalized === correct) return true;
    
    // Allow 1 character difference for typos
    if (levenshteinDistance(normalized, correct) <= 1) return true;
    
    return false;
}

// ============= MULTIPLE CHOICE GENERATION =============
function generateMultipleChoice(correctCard, allCards) {
    // Filter for good distractors
    const distractors = allCards
        .filter(c => c.id !== correctCard.id)
        .sort((a, b) => {
            // Prioritize same category
            if (a.category === correctCard.category && b.category !== correctCard.category) return -1;
            if (b.category === correctCard.category && a.category !== correctCard.category) return 1;
            // Then similar difficulty
            const aDiff = Math.abs(a.difficulty - correctCard.difficulty);
            const bDiff = Math.abs(b.difficulty - correctCard.difficulty);
            return aDiff - bDiff;
        })
        .slice(0, 3);
    
    // Ensure we have enough distractors
    while (distractors.length < 3) {
        distractors.push({
            id: -1,
            translation: '---',
            romanization: '',
            category: 'placeholder'
        });
    }
    
    // Shuffle options
    const options = shuffle([correctCard, ...distractors]);
    
    return options.map((option, index) => ({
        text: option.translation,
        romanization: option.romanization,
        isCorrect: option.id === correctCard.id,
        index: index
    }));
}

// ============= LONG-PRESS SKILL SWITCHING =============
let longPressTimer = null;
let isLongPress = false;

function setupSkillPillLongPress() {
    $$('.skill-pill').forEach(pill => {
        // Remove any existing listeners first
        const newPill = pill.cloneNode(true);
        pill.parentNode.replaceChild(newPill, pill);
    });
    
    // Re-select after cloning
    $$('.skill-pill').forEach(pill => {
        // Desktop: Simple click on inactive pills
        pill.addEventListener('click', handleSkillPillClick);
        
        // Mobile: Long press on active pill
        pill.addEventListener('touchstart', startLongPress, { passive: false });
        pill.addEventListener('touchend', cancelLongPress);
        pill.addEventListener('touchcancel', cancelLongPress);
        pill.addEventListener('touchmove', cancelLongPress);
        
        // Prevent default actions
        pill.addEventListener('contextmenu', (e) => e.preventDefault());
        pill.addEventListener('dragstart', (e) => e.preventDefault());
    });
}

function handleSkillPillClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const pill = e.currentTarget;
    const level = parseInt(pill.dataset.level);
    
    // If clicking an inactive pill, switch to it
    if (!pill.classList.contains('active') && level) {
        devLog(`Desktop: Switching to ${SKILL_NAMES[level]} via click`, 'info');
        switchSkillLevel(level);
    }
}

function startLongPress(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const pill = e.currentTarget;
    
    // Only allow long-press on the active pill for mobile
    if (!pill.classList.contains('active')) {
        return;
    }
    
    // Cancel any existing timer
    if (longPressTimer) {
        clearTimeout(longPressTimer);
    }
    
    devLog(`Mobile: Long press started on ${pill.textContent} pill`, 'info');
    
    isLongPress = false;
    longPressTimer = setTimeout(() => {
        isLongPress = true;
        devLog('Mobile: Long press triggered - showing menu', 'success');
        showSkillSwitchMenu(e, pill);
    }, UI_CONFIG.longPressDelay);
}

function cancelLongPress(e) {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}

function showSkillSwitchMenu(e, pill) {
    const menu = $('#skill-switch-menu');
    menu.classList.remove('hidden');
    
    // Position the menu based on the pill's position
    const rect = pill.getBoundingClientRect();
    menu.style.left = rect.left + 'px';
    menu.style.top = (rect.bottom + 5) + 'px';
    
    // Mark current level
    const currentLevel = State.get().currentCardSkillLevel || 1;
    $$('.skill-switch-option').forEach(option => {
        option.classList.remove('current');
        if (parseInt(option.dataset.level) === currentLevel) {
            option.classList.add('current');
        }
    });
    
    // Hide menu when touching elsewhere
    setTimeout(() => {
        const hideHandler = (e) => {
            if (!menu.contains(e.target)) {
                hideSkillSwitchMenu();
            }
        };
        document.addEventListener('touchstart', hideHandler, { once: true });
        document.addEventListener('click', hideHandler, { once: true });
    }, 100);
}

function hideSkillSwitchMenu() {
    $('#skill-switch-menu').classList.add('hidden');
}

// ============= SKILL SWITCHING =============
window.switchSkillLevel = function(level) {
    State.get().currentCardSkillLevel = level;
    devLog(`Manually switched to ${SKILL_NAMES[level]} level for current card`, 'info');
    
    // Hide the menu first
    hideSkillSwitchMenu();
    
    // Update the UI to reflect the change
    const currentCard = State.getCurrentCard();
    if (currentCard) {
        updateCardSkillDisplay(currentCard.id);
    }
    
    // Reset answer state
    State.get().isAnswerShown = false;
    State.get().selectedChoiceIndex = -1;
    
    // Clear any existing feedback
    const feedback = $('#feedback');
    if (feedback) feedback.classList.add('hidden');
    
    // Re-show the card with new skill level
    if (typeof showCard === 'function') {
        showCard(true); // Preserve the manually selected level
    }
}

window.setDefaultSkillLevel = function(level) {
    if (State.setDefaultSkillLevel(level)) {
        updateSkillLevelDisplay();
        
        const data = Storage.loadProgress();
        data.defaultSkillLevel = level;
        Storage.saveProgress(data);
        
        devLog(`Default skill level set to: ${level === 0 ? 'Auto' : SKILL_NAMES[level]}`, 'info');
    }
}

// Export skill system functions
window.SkillSystem = {
    determineCardSkillLevel,
    updateSkillLevelDisplay,
    updateCardSkillDisplay,
    validateAnswer,
    generateMultipleChoice,
    setupSkillPillLongPress,
    switchSkillLevel,
    setDefaultSkillLevel,
    checkIntermediateAnswer
};