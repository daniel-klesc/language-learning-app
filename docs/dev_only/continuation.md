# Language Learning App - Development Continuation Documentation
*Version 2.0 - January 2025*

## 🚀 Current State Summary

### Implemented Features (v2.0)
1. **Adaptive Skill Levels** - Per-card progression tracking with three levels:
   - Beginner: Multiple choice (4 options)
   - Intermediate: Flexible typing (diacritics optional)
   - Advanced: Exact match required

2. **Smart Spaced Repetition** - Skill-level adjusted intervals:
   - Beginner: 50% progression speed
   - Intermediate: 75% progression speed
   - Advanced: 100% progression speed

3. **Partial Correct Feedback** - Three-tier feedback system:
   - Green: Perfect match
   - Yellow/Amber: Close enough (Intermediate level)
   - Red: Incorrect

4. **Vocabulary System** - External JSON loading:
   - Fallback to embedded vocabulary if files not found
   - Support for multiple vocabulary files per language pair
   - LocalStorage caching for performance

5. **Session Management**:
   - Pauseable sessions with auto-save
   - Flexible session sizes (1, 3, 5, or all remaining)
   - Daily goals with adaptive adjustment

6. **UI Improvements**:
   - Compact skill pills in session progress bar
   - Long-press skill switching (rarely used feature)
   - Mobile-optimized responsive design
   - Development console for debugging

## 📁 File Structure

```
project-root/
├── index.html                 # Main application
├── vocabulary/               # Vocabulary files directory
│   ├── cs-vi/               # Czech to Vietnamese
│   │   └── core.json        # Core vocabulary (75 words)
│   ├── vi-zh/               # Vietnamese to Chinese
│   │   └── core.json        # Core vocabulary (30 words)
│   └── vi-en/               # Vietnamese to English
│       └── core.json        # Core vocabulary (40 words)
```

## 🔧 Pending Implementation

### Phase 1: Immediate Fixes (COMPLETED in v2.0)
- ✅ Fixed skill pill highlighting
- ✅ Fixed partial correct color (yellow/amber)
- ✅ Added long-press skill switching
- ✅ Extracted vocabulary to JSON files
- ✅ Implemented fallback vocabulary system

### Phase 2: Vocabulary Management UI (TO DO)
1. **Settings Menu**
   - Small gear icon in top-right corner
   - Slide-in panel from right
   - Options: Vocabulary Manager, Refresh, Stats, Export, Reset

2. **Vocabulary Manager Page**
   ```
   Features needed:
   - View all loaded vocabulary files
   - Toggle files on/off
   - Upload custom JSON files
   - Delete user files
   - Export vocabulary
   - Search functionality
   - Statistics view
   ```

3. **File Upload System**
   - Drag & drop zone
   - Multiple file selection
   - Validation and error handling
   - Progress indicators

### Phase 3: Advanced Features (FUTURE)
1. **Audio Support**
   - Pronunciation for each word
   - Text-to-speech integration
   - Recording user pronunciation

2. **Sync & Backup**
   - Cloud sync (Firebase/Supabase)
   - Export/import progress
   - Multiple device support

3. **Gamification**
   - Achievements system
   - Leaderboards
   - Daily challenges

## 💾 LocalStorage Structure

```javascript
{
  // User progress data
  "languageApp": {
    "progress": {...},
    "streak": 0,
    "lastStudied": "date",
    "dailyProgress": {...},
    "accuracy": {...},
    "totalLearned": 0,
    "adaptiveGoal": {...},
    "defaultSkillLevel": 0
  },
  
  // Vocabulary cache (new in v2.0)
  "vocabularyCache": {
    "cs-vi": {
      "timestamp": 1234567890,
      "files": ["core.json"],
      "words": [...]
    },
    "vi-zh": {...},
    "vi-en": {...}
  },
  
  // User uploaded vocabulary (future)
  "userVocabulary": {
    "cs-vi": [...],
    "vi-zh": [...],
    "vi-en": [...]
  }
}
```

## 🎨 Design Decisions

### Skill Level Switching
- **Long-press implementation** chosen for rare usage
- 500ms press duration to show menu
- Prevents accidental switches
- Clean UI without extra buttons

### Vocabulary Loading Strategy
1. Check localStorage cache
2. If expired (>24h) or manual refresh:
   - Fetch from `./vocabulary/{pair}/*.json`
   - Merge and deduplicate
   - Update cache
3. Fallback to embedded vocabulary if fetch fails
4. Console warning when using fallback

### Color Scheme
- Primary: `#667eea` to `#764ba2` (purple gradient)
- Success: `#28a745` (green)
- Partial: `#ffc107` (amber/yellow) 
- Error: `#dc3545` (red)
- Background: `#f8f9fa` (light gray)

## 🐛 Known Issues & Solutions

### Issue 1: Skill Pills Not Highlighting
**Status**: FIXED in v2.0
**Solution**: Added proper event handling and CSS classes

### Issue 2: Partial Correct Missing Color
**Status**: FIXED in v2.0
**Solution**: Added `.partial` CSS class with amber background

### Issue 3: Vocabulary Files Not Loading
**Status**: Handled with fallback
**Solution**: Embedded vocabulary as fallback, console warnings

## 📝 Code Architecture

### Key Functions
```javascript
// Vocabulary loading
loadVocabulary(languagePair)     // Load from files or cache
refreshVocabulary()               // Force reload from files
mergeVocabularyFiles(files)       // Combine multiple JSON files

// Skill level management
determineCardSkillLevel(cardId)   // Get appropriate level
switchSkillLevel(newLevel)        // Change during session
updateSkillProgress(cardId, level, correct)

// New feedback system
checkIntermediateAnswer(user, correct)  // Flexible validation
showPartialCorrectFeedback()            // Yellow feedback
```

### Event Handlers
```javascript
// Long-press for skill switching
onSkillPillLongPress(event)       // 500ms hold detection
showSkillLevelMenu(x, y)          // Popup menu
selectSkillLevel(level)           // Apply selection

// Vocabulary management
onVocabularyUpload(files)         // Handle file upload
toggleVocabularyFile(fileId)      // Enable/disable
deleteVocabularyFile(fileId)      // Remove user file
```

## 🚦 Testing Checklist

### Core Functionality
- [ ] Skill pills highlight correctly
- [ ] Long-press shows skill menu
- [ ] Partial correct shows yellow
- [ ] Vocabulary loads from files
- [ ] Fallback works when files missing
- [ ] LocalStorage caching works
- [ ] Session pause/resume works
- [ ] Daily goals update correctly

### Edge Cases
- [ ] No vocabulary files present
- [ ] Corrupted JSON files
- [ ] Mixed skill levels in session
- [ ] Switching skill mid-card
- [ ] Browser storage full
- [ ] Offline mode

## 🔄 Migration Guide

### From v1.6 to v2.0
1. User progress is preserved
2. Skill progress auto-migrated
3. Vocabulary extracted to files
4. Cache system initialized

### Adding Custom Vocabulary
1. Create JSON file following format
2. Place in `vocabulary/{language-pair}/`
3. Refresh vocabulary in app
4. Verify in console logs

## 📚 Next Development Session

### Priority 1: Vocabulary Manager UI
```javascript
// Components needed:
- SettingsMenu component
- VocabularyManager page
- FileUpload handler
- VocabularyList view
- SearchFilter component
```

### Priority 2: User Upload System
```javascript
// Features needed:
- Drag & drop zone
- File validation
- Progress indicators
- Error handling
- Success notifications
```

### Priority 3: Statistics Dashboard
```javascript
// Metrics to show:
- Words per category
- Mastery distribution
- Learning velocity
- Time spent per level
- Success rate trends
```

## 🔗 Resources

### Vocabulary JSON Schema
```json
{
  "metadata": {
    "id": "unique-identifier",
    "name": "Display name",
    "language_pair": "cs-vi",
    "version": "1.0",
    "created": "2024-01-15",
    "author": "username"
  },
  "words": [
    {
      "id": 1001,
      "word": "source",
      "translation": "target",
      "romanization": "pronunciation",
      "category": "category-name",
      "difficulty": 1
    }
  ]
}
```

### API Endpoints (Future)
```
GET  /api/vocabulary/{language-pair}
POST /api/vocabulary/upload
GET  /api/user/progress
POST /api/user/sync
```

## 🎯 Success Metrics

- **User Engagement**: Sessions per day
- **Learning Efficiency**: Words mastered per week
- **Retention Rate**: 7-day active users
- **Performance**: Load time < 2 seconds
- **Accuracy**: Overall success rate > 70%

## 📞 Contact & Support

For development questions or issues:
1. Check console logs (DEV_MODE = true)
2. Verify vocabulary file format
3. Clear localStorage if corrupted
4. Use fallback vocabulary for testing

---

*This documentation provides everything needed to continue development in a new chat session. The current implementation is stable and ready for the vocabulary management UI phase.*