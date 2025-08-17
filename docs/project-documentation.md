# Language Learning App - Project Documentation v1.6
*Last Updated: After bug fixes and development console implementation*

## 🎯 Project Overview

A personalized, adaptive language learning application designed for busy professionals learning languages in a Czech-Vietnamese relationship context. The app focuses on micro-learning sessions that can be completed throughout the day without pressure.

### Supported Language Pairs
- **Czech → Vietnamese** (20 words implemented)
- **Vietnamese → Chinese** (10 words implemented)  
- **Vietnamese → English** (10 words implemented)

### Core Philosophy
- **Flexibility over rigidity**: Unlike Duolingo, progress saves after each word
- **Adaptive learning**: Goals adjust based on user performance
- **Micro-sessions**: 1-5 minute sessions that fit into busy schedules
- **Science-based**: Spaced repetition with intervals of 1, 3, 7, 14, 30, 90 days

## 📱 Current Features (Phase 1.6 Completed)

### 1. Smart Daily Goals System
- **Default daily goal**: 3 new words + 5 review words
- **Visual progress bar**: Shows completion percentage
- **Tracked metrics**:
  - New words learned today
  - Review words completed today
  - Total time spent (in minutes)
  - Sessions completed with timestamps

### 2. Flexible Session Management
- **Session sizes available**:
  - 1 word (~1 minute) - Quick practice
  - 3 words (~3 minutes) - Recommended (badge only, no pre-selection)
  - 5 words (~5 minutes) - Standard
  - All remaining - Complete daily goal
- **Pauseable sessions**: Save progress mid-session and resume later
- **Auto-save**: Progress saves after every word answered
- **Session history**: View all sessions from current day
- **Beyond daily goals**: Can practice extra cards after meeting goals

### 3. Spaced Repetition Algorithm
- **Current implementation**: Simple fixed intervals
  - Level 0 (new/failed): Review tomorrow (1 day)
  - Level 1: Review in 3 days
  - Level 2: Review in 7 days
  - Level 3: Review in 14 days
  - Level 4: Review in 30 days
  - Level 5: Review in 90 days
- **Card progression**:
  - Correct answer: Move up one level
  - Incorrect answer: Reset to level 0

### 4. Adaptive Learning System
- **Performance tracking per card**:
  - Times seen
  - Times correct
  - Current level
  - Next review date
- **Daily goal adjustment** (after 2+ sessions):
  - If accuracy >85% and goals met: +1 word to tomorrow's goals
  - If accuracy <60%: -1 word from tomorrow's goals
  - Minimum: 2 new, 3 review words
  - Maximum: 10 new, 15 review words

### 5. Development Console (NEW in v1.6)
- **Toggle button**: Bottom-right corner (DEV_MODE = true)
- **Real-time logging**: All actions and state changes
- **Vocabulary status display**:
  - Card status (NEW, DUE, FUTURE)
  - Spaced repetition levels
  - Days until review
  - Daily progress tracking
- **Production mode**: Set `DEV_MODE = false` to hide
- **Log types**: info, success, error
- **Auto-scrolling**: Latest logs appear at top

### 6. Progress Persistence
- **Local Storage structure**:
```javascript
{
  progress: {
    'language-pair': {
      'cardId': {
        level: 0-5,
        lastSeen: timestamp,
        nextReview: timestamp,
        timesCorrect: number,
        timesSeen: number
      }
    }
  },
  streak: number,
  lastStudied: dateString,
  dailyProgress: {
    new: number,
    review: number,
    sessions: [{time, words, accuracy}],
    timeSpent: minutes
  },
  accuracy: {correct: number, total: number},
  totalLearned: number,
  adaptiveGoal: {new: number, review: number},
  pausedSession: {
    cards: array,
    currentIndex: number,
    stats: object,
    languagePair: string
  }
}
```

### 7. User Interface Elements
- **Home screen**:
  - Daily goal card with progress bar
  - Statistics (streak, words learned, accuracy)
  - Language pair selector
  - Session size options (no pre-selection)
  - Today's session history
  - Continue paused session button (when applicable)

- **Study screen**:
  - Session progress indicator (X of Y words)
  - Pause & Save button
  - Word display with romanization
  - Category badge
  - Input field for answer
  - Check/Skip buttons
  - Feedback display (correct/incorrect)

- **Complete screen**:
  - Session statistics
  - Achievement notification (if daily goal met)
  - Continue or Finish options
  - Special message when no cards available

## 🐛 Bug Fixes in v1.6

### Fixed Issues:
1. **"Session Complete" on start**: Now properly handles when no cards are due
2. **Session size logic**: Allows practice beyond daily goals when needed
3. **Pre-selected recommended button**: Removed confusing visual pre-selection
4. **Empty sessions**: Shows appropriate message when all cards scheduled for future

### Session Selection Improvements:
- Prioritizes review cards up to daily limit
- Then adds new cards up to daily limit
- Adds extra cards if daily goals already met
- Clear messaging when no cards available

## 🗂️ Vocabulary Structure

### Data Format
```javascript
{
  id: unique_number,
  word: 'source_language_word',
  translation: 'target_language_word',
  romanization: 'pronunciation_guide',
  category: 'category_name',
  difficulty: 1-3  // Used for future smart ordering
}
```

### Current Categories
- greetings
- basics
- numbers
- family
- food
- people
- emotions

## 🔧 Technical Implementation

### Technology Stack
- **Frontend**: Pure HTML, CSS, JavaScript (no framework)
- **Storage**: Browser localStorage
- **Deployment ready**: Single HTML file, works offline
- **Mobile responsive**: Flexbox/Grid layout, touch-friendly

### Key Functions
- `initApp()`: Initialize application on load
- `startSession(size)`: Begin learning session with X words
- `pauseSession()`: Save current progress and exit
- `continueSession()`: Resume paused session
- `updateCardProgress()`: Update spaced repetition data
- `adjustDailyGoal()`: Adaptive goal modification
- `loadProgress()`/`saveProgress()`: Local storage management
- `devLog(message, type)`: Development console logging
- `showVocabularyStatus()`: Display all cards' current state

### Development Mode Functions
- `toggleDevConsole()`: Show/hide development console
- `DEV_MODE`: Boolean flag for production/development

## 📋 Known Limitations & Planned Improvements

### Current Limitations
1. **No audio**: Pronunciation must be learned separately
2. **Basic input**: No tone markers or special character input
3. **Single device**: Progress doesn't sync across devices
4. **Limited vocabulary**: 40 words total across all languages
5. **No sentences**: Only single word translations

### Phase 2 Plans (Audio & Tones)
- Audio pronunciation for each word
- Tone visualization for Vietnamese (6 tones)
- Tone input methods (number keys for tones)
- Visual tone contour diagrams
- Pinyin display for Chinese

### Phase 3 Plans (Smart Features)
- Enhanced spaced repetition (SM-2 algorithm)
- Multiple exercise types
- Time-of-day optimization
- Weekly pattern detection
- Import/export vocabulary
- Basic analytics dashboard

### Phase 4 Plans (Language-Specific)
- Vietnamese tone minimal pairs
- Chinese character stroke order
- English stress patterns
- Classifier/measure word exercises

### Phase 5 Plans (Advanced)
- Sentence learning
- Grammar patterns
- Cultural notes
- Speech recognition
- Cloud sync
- Social features

## 🚀 Development Setup

### To Run Locally
1. Save the HTML file as `index.html`
2. Open in any modern browser
3. No server or dependencies required
4. Set `DEV_MODE = true` for development console

### To Deploy
1. **GitHub Pages** (recommended):
   - Create repository
   - Upload HTML file
   - Enable Pages in settings
   - Access at: `https://[username].github.io/[repo-name]`

2. **Netlify Drop**:
   - Drag HTML file to app.netlify.com/drop
   - Get instant URL (temporary without account)

### To Continue Development
1. Load this documentation in new chat
2. Provide current HTML file
3. Specify which phase/feature to implement next
4. AI assistant will have full context

### Using Development Console
1. Ensure `DEV_MODE = true` in code
2. Click "Show Dev Console" button (bottom-right)
3. View real-time logs of all operations
4. Check vocabulary status and scheduling
5. Set `DEV_MODE = false` for production

## 📊 Testing Checklist

### Core Functionality
- [x] Start each session size (1, 3, 5, all)
- [x] Answer correctly and incorrectly
- [x] Pause mid-session
- [x] Resume paused session
- [x] Complete daily goal
- [x] Check streak maintenance
- [x] Verify spaced repetition intervals
- [x] Test adaptive goal adjustment
- [x] Handle no cards available scenario
- [x] Practice beyond daily goals

### Edge Cases
- [x] No cards due for review
- [x] Switching language pairs mid-session
- [x] Browser refresh during session
- [x] Clear localStorage and restart
- [x] Complete all available words
- [x] Session with mix of new and review cards

### Development Console Tests
- [x] Toggle console visibility
- [x] View vocabulary status
- [x] Track card progress updates
- [x] Monitor session creation
- [x] Check logging accuracy

## 💡 Usage Instructions for Users

### Getting Started
1. Choose your language pair
2. Start with 1 or 3 word sessions
3. Type the translation and press Enter
4. Practice daily to maintain streak

### Best Practices
- Do at least one session daily
- Use pause feature when interrupted
- Focus on accuracy over speed
- Review words appear based on your performance
- Let the app adapt to your learning pace
- Practice beyond daily goals for faster progress

### Tips for Busy Schedules
- Morning: 1 word with coffee
- Commute: 3-5 words
- Lunch: Quick 3 word session
- Evening: Complete remaining goals
- Pause anytime - progress is saved!

### Understanding the System
- **New cards**: Never seen before
- **Review cards**: Due based on spaced repetition
- **Daily goals**: Adaptive based on performance
- **Session sizes**: Choose what fits your available time
- **No pressure**: Every word counts, pause anytime

## 🔄 Version History

### v1.0 - Basic MVP
- Core spaced repetition
- Fixed 20-word sessions
- Basic progress tracking

### v1.5 - Adaptive Micro-Learning
- Flexible session sizes
- Pauseable sessions
- Daily goals system
- Adaptive difficulty
- Session history
- Improved UI/UX

### v1.6 - Bug Fixes & Dev Tools (Current)
- Fixed "session complete" bug
- Removed confusing pre-selection
- Added development console
- Improved session logic for beyond-goal practice
- Better handling of no available cards
- Real-time debugging capabilities

## 📝 Next Steps for Developer

### Immediate Priority
1. Test with development console active
2. Monitor spaced repetition scheduling
3. Add more vocabulary (expand to 100+ words)
4. Consider implementing Phase 2 (Audio support)

### Questions to Consider
1. Should we add more language pairs?
2. What categories of vocabulary are most needed?
3. Should we implement user-added vocabulary?
4. Do we need offline audio caching?
5. When to add sentence learning?
6. How to handle tone input methods?

## 🤝 Contributing & Support

### For Developers
- Keep code simple and readable
- Comment complex logic
- Maintain single-file structure for now
- Test on mobile devices
- Preserve localStorage structure
- Use development console for debugging

### For Bug Reports
Document:
- Browser and version
- Device type
- Steps to reproduce
- Expected vs actual behavior
- localStorage data (if relevant)
- Development console logs (if available)

### Code Quality Guidelines
- Set `DEV_MODE = false` before production
- Test all session sizes
- Verify spaced repetition intervals
- Check adaptive goal adjustments
- Ensure mobile responsiveness

---

*This documentation represents the current state of the Language Learning App after Phase 1.6 implementation with bug fixes and development console. Use this as a reference for continuing development in new conversations or with other AI assistants.*