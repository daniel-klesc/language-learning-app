Excellent points! Given that skill switching will be rarely used, I'm changing my recommendation to keep the UI even cleaner.

## 📋 Revised Implementation Plan

### 1. **Skill Level Switching (Rarely Used)**

Given the rare usage, I now recommend **Long-press on active pill** approach:
- Keeps UI completely clean (no extra buttons)
- Prevents accidental switches
- Only shows options when deliberately invoked
- Long-press (500ms) on the active skill pill shows a small popup
- More appropriate for an advanced/optional feature

```
Normal state:           Long-press on [I]:
[B][I][A]              [B][I][A]
                           ↓
                       ┌─────────┐
                       │ Switch: │
                       │ • Begin │
                       │ ○ Inter │
                       │ ○ Advan │
                       └─────────┘
```

### 2. **Vocabulary Persistence & Management**

Architecture:
- **LocalStorage**: Cache loaded vocabulary with timestamps
- **Refresh Check**: On app load, check if files changed (compare timestamps)
- **Manual Refresh**: Small refresh icon in settings area
- **Auto-merge**: Combine all vocabulary files per language pair

### 3. **Vocabulary Management UI**

I'll create a separate "Vocabulary Manager" page accessed via settings menu:

```
Main Page (unchanged):          Settings Menu:
┌──────────────┐                ┌──────────────┐
│ 🎯 Smart     │                │ ⚙️ Settings  │
│ Learning     │                ├──────────────┤
│              │     [⚙️] →      │ 📚 Vocab Mgr │ → Separate page
│ [Start]      │                │ 🔄 Refresh   │
│              │                │ 📊 Statistics │
└──────────────┘                └──────────────┘

Vocabulary Manager Page:
┌─────────────────────────┐
│ ← Back  Vocabulary Mgr  │
├─────────────────────────┤
│ Czech → Vietnamese (75) │
│ ├─ ✓ core.json (20)    │
│ ├─ ✓ food.json (15)    │
│ └─ ✓ custom.json (40)  │
│                         │
│ Vietnamese → English    │
│ ├─ ✓ core.json (40)    │
│ └─ ✗ travel.json       │
│                         │
│ [Upload Files] [Refresh]│
│ [Clear Cache] [Export]  │
└─────────────────────────┘
```

### 4. **File Structure & Loading**

```javascript
// Vocabulary file structure (vocabulary/cs-vi/core.json):
{
  "metadata": {
    "id": "cs-vi-core",
    "name": "Core Czech-Vietnamese",
    "language_pair": "cs-vi",
    "version": "1.0",
    "created": "2024-01-15",
    "author": "system"
  },
  "words": [...]
}

// Loading priority:
1. Check localStorage for cached vocabulary
2. If cache expired (>24h) or manual refresh:
   - Fetch all files from vocabulary/{pair}/*.json
   - Merge and deduplicate by ID
   - Update cache
3. If fetch fails, use localStorage cache
4. If no cache, use hardcoded fallback
```

## 🎨 Complete Feature Set

### Main App (Minimal Changes):
1. **Settings Icon**: Small gear icon in top-right corner
2. **Skill Pills**: Fixed highlighting + long-press to switch
3. **Everything else**: Remains exactly as is

### Settings Menu (Slide-in Panel):
```
┌─────────────┐
│ Settings  ✕ │
├─────────────┤
│ 📚 Manage   │
│ Vocabulary  │
├─────────────┤
│ 🔄 Refresh  │
│ Vocabulary  │
├─────────────┤
│ 📊 Stats    │
├─────────────┤
│ 💾 Export   │
│ Progress    │
├─────────────┤
│ 🗑️ Reset    │
│ All Data    │
└─────────────┘
```

### Vocabulary Manager Features:
- **View**: See all loaded vocabulary files
- **Toggle**: Enable/disable specific files
- **Upload**: Add custom vocabulary JSON
- **Delete**: Remove user-uploaded files
- **Export**: Download current vocabulary as JSON
- **Stats**: Words per category, mastery levels
- **Search**: Find specific words
- **Edit**: Modify user vocabulary (future)

## 📦 Deliverables

I'll create:

1. **Updated index.html** with:
   - Fixed skill pill highlighting
   - Long-press skill switching
   - Settings menu integration
   - Vocabulary loading system

2. **vocabulary-manager.html** (or integrated as SPA):
   - Full vocabulary management UI
   - Upload/delete/toggle functionality
   - Statistics and search

3. **Vocabulary JSON files**:
   - `vocabulary/cs-vi/core.json`
   - `vocabulary/vi-zh/core.json`
   - `vocabulary/vi-en/core.json`
   - Each with proper structure

4. **Documentation**:
   - How to add vocabulary files
   - JSON format specification
   - Deployment instructions

## 🚀 Implementation Approach

Phase 1 (Immediate fixes):
- Fix skill pill highlighting
- Fix partial correct color
- Add long-press skill switching

Phase 2 (Vocabulary system):
- Extract vocabulary to JSON files
- Implement file loading with fallback
- Add localStorage caching

Phase 3 (Management UI):
- Create settings menu
- Build vocabulary manager page
- Add upload/toggle/delete features

This approach keeps the main learning interface clean and focused while providing powerful vocabulary management for users who need it.

**Shall I proceed with this implementation?** I'll start with the immediate fixes and vocabulary extraction, then build the management UI.