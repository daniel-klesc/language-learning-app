// src/js/09-progress.js
// Progress tracking and UI updates

// ============= PROGRESS DISPLAY FUNCTIONS =============
function updateDailyGoal() {
    const data = Storage.loadProgress();
    const dailyProgress = data.dailyProgress || { new: 0, review: 0, timeSpent: 0 };
    const dailyGoal = State.getDailyGoal();
    
    const totalGoal = dailyGoal.new + dailyGoal.review;
    const totalComplete = dailyProgress.new + dailyProgress.review;
    
    // Update goal card
    const goalProgressEl = $('#goal-progress');
    if (goalProgressEl) {
        goalProgressEl.textContent = `${totalComplete}/${totalGoal}`;
    }
    
    // Update progress bar
    const goalBar = $('#goal-bar');
    if (goalBar) {
        const percentage = totalGoal > 0 ? (totalComplete / totalGoal) * 100 : 0;
        goalBar.style.width = `${Math.min(100, percentage)}%`;
    }
    
    // Update individual counts
    $('#words-new').textContent = `New: ${dailyProgress.new}/${dailyGoal.new}`;
    $('#words-review').textContent = `Review: ${dailyProgress.review}/${dailyGoal.review}`;
    $('#time-spent').textContent = `Time: ${formatTime(dailyProgress.timeSpent || 0)}`;
    
    // Update time estimate
    const remainingWords = Math.max(0, totalGoal - totalComplete);
    const estimatedTime = remainingWords * 1; // 1 minute per word estimate
    
    const timeEstimateEl = $('#time-estimate');
    if (timeEstimateEl) {
        if (remainingWords > 0) {
            timeEstimateEl.textContent = `~${estimatedTime} minutes remaining today`;
        } else {
            timeEstimateEl.textContent = `Daily goal complete! 🎉`;
        }
    }
    
    // Update "All" session time
    const allTimeEl = $('#all-time');
    if (allTimeEl) {
        allTimeEl.textContent = `~${remainingWords} min`;
    }
    
    devLog(`Daily progress updated: ${totalComplete}/${totalGoal} words`, 'info');
}

function updateStats() {
    const data = Storage.loadProgress();
    
    // Update streak
    const streakEl = $('#streak');
    if (streakEl) {
        streakEl.textContent = data.streak || 0;
    }
    
    // Count mastered words (Advanced level with high accuracy)
    let masteredCount = 0;
    if (data.progress) {
        Object.values(data.progress).forEach(langPair => {
            Object.values(langPair).forEach(card => {
                const advancedStats = card.skillProgress?.[3];
                if (advancedStats && 
                    advancedStats.total >= 3 && 
                    (advancedStats.correct / advancedStats.total) >= 0.8) {
                    masteredCount++;
                }
            });
        });
    }
    
    const totalLearnedEl = $('#total-learned');
    if (totalLearnedEl) {
        totalLearnedEl.textContent = masteredCount;
    }
    
    // Update accuracy
    const accuracyEl = $('#accuracy');
    if (accuracyEl) {
        if (data.accuracy && data.accuracy.total > 0) {
            const acc = Math.round((data.accuracy.correct / data.accuracy.total) * 100);
            accuracyEl.textContent = `${acc}%`;
        } else {
            accuracyEl.textContent = '0%';
        }
    }
    
    devLog(`Stats updated: ${data.streak} day streak, ${masteredCount} mastered`, 'info');
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
    
    // Show sessions in reverse order (most recent first)
    const sessionsHtml = sessions
        .slice()
        .reverse()
        .slice(0, 5) // Show only last 5 sessions
        .map(s => `
            <div class="history-item">
                <span>${s.time}</span>
                <span>${s.words} words • ${s.accuracy}%</span>
            </div>
        `)
        .join('');
    
    historyDiv.innerHTML = sessionsHtml;
}

function checkPausedSession() {
    const state = State.get();
    const pausedSession = state.pausedSession;
    const continueBtn = $('#continue-session-btn');
    
    if (!continueBtn) return;
    
    if (pausedSession && pausedSession.languagePair === state.currentLanguagePair) {
        continueBtn.classList.remove('hidden');
        
        const remainingWords = pausedSession.cards.length - pausedSession.currentIndex;
        const remainingWordsEl = $('#remaining-words');
        if (remainingWordsEl) {
            remainingWordsEl.textContent = remainingWords;
        }
        
        devLog(`Paused session found: ${remainingWords} words remaining`, 'info');
    } else {
        continueBtn.classList.add('hidden');
    }
}

// ============= PROGRESS VISUALIZATION =============
function getProgressSummary() {
    const data = Storage.loadProgress();
    const languagePair = State.getCurrentLanguagePair();
    const stats = SpacedRepetition.getReviewStatistics(languagePair);
    
    return {
        daily: {
            new: data.dailyProgress?.new || 0,
            review: data.dailyProgress?.review || 0,
            timeSpent: data.dailyProgress?.timeSpent || 0,
            sessions: data.dailyProgress?.sessions?.length || 0
        },
        overall: {
            streak: data.streak || 0,
            totalWords: stats.total,
            mastered: stats.mastered,
            due: stats.due,
            new: stats.new
        },
        accuracy: {
            today: calculateTodayAccuracy(data),
            overall: data.accuracy?.total > 0 
                ? Math.round((data.accuracy.correct / data.accuracy.total) * 100)
                : 0
        }
    };
}

function calculateTodayAccuracy(data) {
    const sessions = data.dailyProgress?.sessions || [];
    if (sessions.length === 0) return 0;
    
    const totalAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0);
    return Math.round(totalAccuracy / sessions.length);
}

// ============= ACHIEVEMENT TRACKING =============
function checkAchievements() {
    const data = Storage.loadProgress();
    const achievements = [];
    
    // Streak achievements
    if (data.streak === 7) {
        achievements.push({
            title: 'Week Warrior',
            description: '7 day streak achieved!',
            icon: '🔥'
        });
    } else if (data.streak === 30) {
        achievements.push({
            title: 'Monthly Master',
            description: '30 day streak achieved!',
            icon: '🏆'
        });
    } else if (data.streak === 100) {
        achievements.push({
            title: 'Century Champion',
            description: '100 day streak achieved!',
            icon: '👑'
        });
    }
    
    // Mastery achievements
    const stats = SpacedRepetition.getReviewStatistics(State.getCurrentLanguagePair());
    if (stats.mastered === 10) {
        achievements.push({
            title: 'First Ten',
            description: '10 words mastered!',
            icon: '⭐'
        });
    } else if (stats.mastered === 50) {
        achievements.push({
            title: 'Fifty Fantastic',
            description: '50 words mastered!',
            icon: '🌟'
        });
    } else if (stats.mastered === 100) {
        achievements.push({
            title: 'Vocabulary Centurion',
            description: '100 words mastered!',
            icon: '💫'
        });
    }
    
    // Show achievements (you can enhance this with a modal or toast)
    achievements.forEach(achievement => {
        devLog(`Achievement unlocked: ${achievement.title}`, 'success');
        // Could trigger a notification here
    });
    
    return achievements;
}

// ============= PROGRESS CHARTS (PLACEHOLDER) =============
// These functions prepare data for potential chart integration
function getWeeklyProgressData() {
    const data = Storage.loadProgress();
    const weekData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        // Get data for this date (would need to store historical data)
        weekData.push({
            date: date.toLocaleDateString('en', { weekday: 'short' }),
            words: 0, // Would need historical tracking
            accuracy: 0
        });
    }
    
    return weekData;
}

function getSkillDistribution() {
    const data = Storage.loadProgress();
    const distribution = { 1: 0, 2: 0, 3: 0 };
    
    if (data.progress) {
        Object.values(data.progress).forEach(langPair => {
            Object.values(langPair).forEach(card => {
                const level = card.skillLevel || 1;
                distribution[level]++;
            });
        });
    }
    
    return distribution;
}

function getCategoryProgress() {
    const data = Storage.loadProgress();
    const languagePair = State.getCurrentLanguagePair();
    const vocab = State.getVocabularyForPair(languagePair);
    const categoryStats = {};
    
    // Initialize categories
    vocab.forEach(word => {
        if (!categoryStats[word.category]) {
            categoryStats[word.category] = {
                total: 0,
                learned: 0,
                mastered: 0
            };
        }
        categoryStats[word.category].total++;
        
        const progress = data.progress?.[languagePair]?.[word.id];
        if (progress) {
            categoryStats[word.category].learned++;
            
            const advancedStats = progress.skillProgress?.[3];
            if (advancedStats && 
                advancedStats.total >= 3 && 
                (advancedStats.correct / advancedStats.total) >= 0.8) {
                categoryStats[word.category].mastered++;
            }
        }
    });
    
    return categoryStats;
}

// ============= MOTIVATIONAL MESSAGES =============
function getMotivationalMessage() {
    const data = Storage.loadProgress();
    const stats = getProgressSummary();
    const messages = [];
    
    // Streak-based messages
    if (data.streak > 0) {
        messages.push(`${data.streak} day streak! Keep it up!`);
    }
    
    // Progress-based messages
    if (stats.daily.new >= State.getDailyGoal().new) {
        messages.push('Daily new words goal achieved! 🎯');
    }
    
    if (stats.daily.review >= State.getDailyGoal().review) {
        messages.push('Daily review goal complete! ✅');
    }
    
    // Accuracy-based messages
    if (stats.accuracy.today >= 90) {
        messages.push('Outstanding accuracy today! 🌟');
    } else if (stats.accuracy.today >= 80) {
        messages.push('Great job! Keep practicing! 💪');
    }
    
    // Random encouragement
    const encouragements = [
        'Every word counts!',
        'Consistency is key!',
        'You\'re making progress!',
        'Language learning is a journey!',
        'Small steps, big results!'
    ];
    
    if (messages.length === 0) {
        messages.push(encouragements[Math.floor(Math.random() * encouragements.length)]);
    }
    
    return messages;
}

// ============= EXPORT PROGRESS DATA =============
function generateProgressReport() {
    const summary = getProgressSummary();
    const categoryProgress = getCategoryProgress();
    
    const report = {
        date: new Date().toISOString(),
        summary: summary,
        categories: categoryProgress,
        skillDistribution: getSkillDistribution(),
        achievements: checkAchievements()
    };
    
    return report;
}

// Export progress functions
window.Progress = {
    updateDailyGoal,
    updateStats,
    updateSessionHistory,
    checkPausedSession,
    getProgressSummary,
    checkAchievements,
    getWeeklyProgressData,
    getSkillDistribution,
    getCategoryProgress,
    getMotivationalMessage,
    generateProgressReport
};