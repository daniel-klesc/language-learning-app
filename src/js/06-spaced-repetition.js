// src/js/06-spaced-repetition.js
// Spaced repetition algorithm implementation

// ============= CARD PROGRESS MANAGEMENT =============
function getCardProgress(cardId, languagePair) {
    const data = Storage.loadProgress();
    const pair = languagePair || State.getCurrentLanguagePair();
    
    if (!data.progress) data.progress = {};
    if (!data.progress[pair]) data.progress[pair] = {};
    
    return data.progress[pair][cardId] || null;
}

function initializeCardProgress(cardId, languagePair, skillLevel) {
    return {
        id: cardId,
        level: 0,
        lastSeen: Date.now(),
        nextReview: Date.now(),
        timesCorrect: 0,
        timesSeen: 0,
        skillLevel: skillLevel || 1,
        skillProgress: {
            1: { correct: 0, total: 0, streak: 0 },
            2: { correct: 0, total: 0, streak: 0 },
            3: { correct: 0, total: 0, streak: 0 }
        },
        recommendedSkillLevel: 1
    };
}

// ============= SPACED REPETITION ALGORITHM =============
function calculateNextReview(cardProgress) {
    // Calculate effective level (with fractional support)
    const effectiveLevel = Math.floor(cardProgress.level);
    const fraction = cardProgress.level - effectiveLevel;
    
    let daysUntilNext;
    
    if (effectiveLevel >= BASE_INTERVALS.length - 1) {
        // Max level reached
        daysUntilNext = BASE_INTERVALS[BASE_INTERVALS.length - 1];
    } else {
        // Interpolate between intervals based on fractional level
        const lowerDays = BASE_INTERVALS[effectiveLevel];
        const upperDays = BASE_INTERVALS[effectiveLevel + 1] || lowerDays * 2;
        daysUntilNext = lowerDays + (upperDays - lowerDays) * fraction;
    }
    
    // Convert days to milliseconds
    return Date.now() + (daysUntilNext * 86400000);
}

function updateCardProgress(cardId, isCorrect, skillLevel, cardType) {
    const data = Storage.loadProgress();
    const languagePair = State.getCurrentLanguagePair();
    
    devLog(`Updating card ${cardId}: ${isCorrect ? 'CORRECT' : 'INCORRECT'} at ${SKILL_NAMES[skillLevel]} level (${cardType})`, isCorrect ? 'success' : 'error');
    
    if (!data.progress) data.progress = {};
    if (!data.progress[languagePair]) data.progress[languagePair] = {};
    
    let cardProgress = data.progress[languagePair][cardId];
    const isNewCard = !cardProgress;
    
    if (!cardProgress) {
        cardProgress = initializeCardProgress(cardId, languagePair, skillLevel);
    }
    
    // Ensure skill progress exists
    if (!cardProgress.skillProgress) {
        cardProgress.skillProgress = {
            1: { correct: 0, total: 0, streak: 0 },
            2: { correct: 0, total: 0, streak: 0 },
            3: { correct: 0, total: 0, streak: 0 }
        };
    }
    
    // Update skill-specific statistics
    const skillStats = cardProgress.skillProgress[skillLevel];
    skillStats.total++;
    
    if (isCorrect) {
        skillStats.correct++;
        skillStats.streak++;
        
        // Apply skill multiplier to level progression
        const multiplier = SKILL_MULTIPLIERS[skillLevel];
        cardProgress.level = Math.min(5, cardProgress.level + multiplier);
        cardProgress.timesCorrect++;
        
        devLog(`Card level increased by ${multiplier} to ${cardProgress.level}`, 'info');
    } else {
        skillStats.streak = 0;
        
        // Bigger penalty for failing at easier levels
        const penalty = skillLevel === SKILL_LEVELS.BEGINNER ? 0.5 : 1.0;
        cardProgress.level = Math.max(0, cardProgress.level - penalty);
        
        devLog(`Card level decreased by ${penalty} to ${cardProgress.level}`, 'info');
    }
    
    // Update general statistics
    cardProgress.timesSeen++;
    cardProgress.lastSeen = Date.now();
    cardProgress.skillLevel = skillLevel;
    
    // Calculate next review time
    cardProgress.nextReview = calculateNextReview(cardProgress);
    
    const daysUntilNext = Math.round((cardProgress.nextReview - Date.now()) / 86400000);
    devLog(`Next review in ${daysUntilNext} days`, 'info');
    
    // Check for skill level promotion
    checkForSkillPromotion(cardProgress, skillLevel);
    
    // Save progress
    data.progress[languagePair][cardId] = cardProgress;
    
    // Update daily progress
    updateDailyProgress(data, isNewCard, cardId, cardType, isCorrect, skillLevel);
    
    // Update overall accuracy
    updateOverallAccuracy(data, isCorrect);
    
    Storage.saveProgress(data);
    
    return cardProgress;
}

// ============= SKILL PROMOTION SYSTEM =============
function checkForSkillPromotion(cardProgress, currentSkillLevel) {
    const skillStats = cardProgress.skillProgress[currentSkillLevel];
    
    if (currentSkillLevel < 3 && 
        skillStats.streak >= PROMOTION_THRESHOLD.streak && 
        skillStats.total >= 3 &&
        (skillStats.correct / skillStats.total) >= PROMOTION_THRESHOLD.accuracy) {
        
        cardProgress.recommendedSkillLevel = currentSkillLevel + 1;
        devLog(`Card ready for promotion to ${SKILL_NAMES[currentSkillLevel + 1]}!`, 'success');
        
        // Show promotion notification (you can enhance this)
        if (typeof showNotification === 'function') {
            showNotification(`Ready for ${SKILL_NAMES[currentSkillLevel + 1]} level!`, 'success');
        }
    }
}

// ============= DAILY PROGRESS TRACKING =============
function updateDailyProgress(data, isNewCard, cardId, cardType, isCorrect, skillLevel) {
    if (!data.dailyProgress) {
        data.dailyProgress = { new: 0, review: 0, sessions: [], timeSpent: 0, cardsSeen: {} };
    }
    
    // Track if this card was already counted in today's progress
    const cardSeenToday = data.dailyProgress.cardsSeen[cardId];
    
    if (!cardSeenToday) {
        // First time seeing this card today
        data.dailyProgress.cardsSeen[cardId] = true;
        
        if (isNewCard || cardType === 'new') {
            // This is a new card
            const dailyGoal = State.getDailyGoal();
            data.dailyProgress.new = Math.min(dailyGoal.new + 10, (data.dailyProgress.new || 0) + 1);
            devLog(`Daily new words: ${data.dailyProgress.new}/${dailyGoal.new}`, 'info');
            
            // Count as learned if mastered at advanced level
            if (isCorrect && skillLevel === SKILL_LEVELS.ADVANCED) {
                data.totalLearned = (data.totalLearned || 0) + 1;
            }
        } else {
            // This is a review card
            const dailyGoal = State.getDailyGoal();
            data.dailyProgress.review = Math.min(dailyGoal.review + 10, (data.dailyProgress.review || 0) + 1);
            devLog(`Daily review words: ${data.dailyProgress.review}/${dailyGoal.review}`, 'info');
        }
    }
}

function updateOverallAccuracy(data, isCorrect) {
    if (!data.accuracy) data.accuracy = { correct: 0, total: 0 };
    data.accuracy.total++;
    if (isCorrect) data.accuracy.correct++;
}

// ============= CARD SELECTION FOR SESSIONS =============
function getCardsForSession(size, languagePair) {
    const data = Storage.loadProgress();
    const now = Date.now();
    const vocab = State.getVocabularyForPair(languagePair);
    
    const newCards = [];
    const reviewCards = [];
    
    vocab.forEach(card => {
        const cardProgress = getCardProgress(card.id, languagePair);
        if (!cardProgress) {
            newCards.push({...card, type: 'new'});
        } else if (cardProgress.nextReview <= now) {
            reviewCards.push({...card, type: 'review', progress: cardProgress});
        }
    });
    
    devLog(`Available: ${newCards.length} new, ${reviewCards.length} review cards`, 'info');
    
    // Sort review cards by priority (overdue first)
    reviewCards.sort((a, b) => a.progress.nextReview - b.progress.nextReview);
    
    // Build session based on size and daily goals
    const completedNew = data.dailyProgress?.new || 0;
    const completedReview = data.dailyProgress?.review || 0;
    const dailyGoal = State.getDailyGoal();
    
    let targetNew = 0;
    let targetReview = 0;
    
    if (size === 0) {
        // "All" - complete daily goals
        targetNew = Math.max(0, dailyGoal.new - completedNew);
        targetReview = Math.max(0, dailyGoal.review - completedReview);
    } else {
        // Fixed size session
        let remainingSize = size;
        
        // Prioritize review cards needed for daily goal
        const reviewsNeeded = Math.max(0, dailyGoal.review - completedReview);
        targetReview = Math.min(remainingSize, reviewCards.length, reviewsNeeded);
        remainingSize -= targetReview;
        
        // Then add new cards if space remains
        if (remainingSize > 0) {
            const newNeeded = Math.max(0, dailyGoal.new - completedNew);
            targetNew = Math.min(remainingSize, newCards.length, newNeeded);
        }
        
        // If daily goals met, add extra cards
        if (targetNew + targetReview < size && completedNew >= dailyGoal.new && completedReview >= dailyGoal.review) {
            const extraSpace = size - targetNew - targetReview;
            const extraReviews = Math.min(extraSpace, reviewCards.length - targetReview);
            targetReview += extraReviews;
            
            if (targetNew + targetReview < size) {
                const extraNew = Math.min(size - targetNew - targetReview, newCards.length - targetNew);
                targetNew += extraNew;
            }
        }
    }
    
    // Build final session
    const sessionCards = [
        ...reviewCards.slice(0, targetReview),
        ...newCards.slice(0, targetNew)
    ];
    
    // Shuffle for variety
    return shuffle(sessionCards);
}

// ============= REVIEW STATISTICS =============
function getReviewStatistics(languagePair) {
    const data = Storage.loadProgress();
    const now = Date.now();
    const vocab = State.getVocabularyForPair(languagePair);
    
    const stats = {
        total: vocab.length,
        new: 0,
        due: 0,
        future: 0,
        mastered: 0,
        byLevel: [0, 0, 0, 0, 0, 0],
        bySkillLevel: { 1: 0, 2: 0, 3: 0 }
    };
    
    vocab.forEach(card => {
        const progress = getCardProgress(card.id, languagePair);
        
        if (!progress) {
            stats.new++;
        } else {
            if (progress.nextReview <= now) {
                stats.due++;
            } else {
                stats.future++;
            }
            
            // Count by spaced repetition level
            const level = Math.floor(progress.level);
            if (level >= 0 && level < 6) {
                stats.byLevel[level]++;
            }
            
            // Count by skill level
            if (progress.skillLevel) {
                stats.bySkillLevel[progress.skillLevel]++;
            }
            
            // Check if mastered (Advanced level with high accuracy)
            const advancedStats = progress.skillProgress?.[3];
            if (advancedStats && advancedStats.total >= 3 && 
                (advancedStats.correct / advancedStats.total) >= 0.8) {
                stats.mastered++;
            }
        }
    });
    
    return stats;
}

// ============= ADAPTIVE GOAL ADJUSTMENT =============
function adjustDailyGoals() {
    const data = Storage.loadProgress();
    const dailyProgress = data.dailyProgress;
    const sessions = dailyProgress?.sessions || [];
    
    // Only adjust after completing at least 2 sessions
    if (sessions.length < 2) return;
    
    // Calculate average accuracy for today
    const todayAccuracy = sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length;
    const dailyGoal = State.getDailyGoal();
    
    // Adjust goals for tomorrow
    if (todayAccuracy > 85 && dailyProgress.new >= dailyGoal.new && dailyProgress.review >= dailyGoal.review) {
        // Increase slightly if doing well and completing goals
        dailyGoal.new = Math.min(DEFAULT_DAILY_GOAL.max.new, dailyGoal.new + 1);
        dailyGoal.review = Math.min(DEFAULT_DAILY_GOAL.max.review, dailyGoal.review + 1);
        devLog('Daily goals increased due to excellent performance!', 'success');
    } else if (todayAccuracy < 60) {
        // Decrease if struggling
        dailyGoal.new = Math.max(DEFAULT_DAILY_GOAL.min.new, dailyGoal.new - 1);
        dailyGoal.review = Math.max(DEFAULT_DAILY_GOAL.min.review, dailyGoal.review - 1);
        devLog('Daily goals decreased to reduce pressure', 'info');
    }
    
    // Save adjusted goals
    data.adaptiveGoal = dailyGoal;
    Storage.saveProgress(data);
}

// Export spaced repetition functions
window.SpacedRepetition = {
    getCardProgress,
    updateCardProgress,
    getCardsForSession,
    getReviewStatistics,
    adjustDailyGoals,
    calculateNextReview,
    checkForSkillPromotion
};