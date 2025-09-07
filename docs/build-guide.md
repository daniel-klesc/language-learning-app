# Language Learning App - Modular Structure

## Directory Structure

```
language-learning-app/
├── src/
│   ├── html/
│   │   ├── index.html           # Base HTML structure
│   │   ├── home.html            # Home screen template
│   │   ├── study.html           # Study screen template
│   │   ├── complete.html        # Complete screen template
│   │   └── modals/
│   │       ├── settings.html    # Settings menu
│   │       ├── vocab-manager.html # Vocabulary manager
│   │       └── preview.html     # Upload preview modal
│   │
│   ├── css/
│   │   ├── 01-base.css         # Reset, typography, colors
│   │   ├── 02-layout.css       # Container, grid, flexbox
│   │   ├── 03-components.css   # Buttons, cards, forms
│   │   ├── 04-home.css         # Home screen styles
│   │   ├── 05-study.css        # Study mode styles
│   │   ├── 06-vocabulary.css   # Vocabulary manager styles
│   │   ├── 07-library.css      # Library system styles
│   │   └── 08-mobile.css       # Mobile responsive styles
│   │
│   ├── js/
│   │   ├── 01-config.js        # Constants, configuration
│   │   ├── 02-utils.js         # Utility functions, logging
│   │   ├── 03-state.js         # State management
│   │   ├── 04-vocabulary-data.js # Default vocabulary
│   │   ├── 05-storage.js       # LocalStorage operations
│   │   ├── 06-spaced-repetition.js # SR algorithm
│   │   ├── 07-skill-system.js  # Skill levels logic
│   │   ├── 08-study-session.js # Study session management
│   │   ├── 09-progress.js      # Progress tracking
│   │   ├── 10-vocabulary-loader.js # Vocabulary loading
│   │   ├── 11-vocabulary-manager.js # Vocab manager UI
│   │   ├── 12-library-system.js # Library functionality
│   │   ├── 13-github-integration.js # GitHub loading
│   │   ├── 14-ui-controllers.js # UI event handlers
│   │   └── 15-init.js          # App initialization
│   │
│   └── templates/              # Reusable HTML templates
│       ├── card.html
│       ├── library-source.html
│       └── preview-item.html
│
├── dist/
│   └── index.html              # Final combined file
│
├── build/
│   ├── build.js                # Node.js build script
│   └── build.sh                # Bash build script
│
├── package.json                # Node dependencies (optional)
└── README.md                   # Documentation
```

## Build Script (Node.js)

```javascript
// build/build.js
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    srcDir: path.join(__dirname, '../src'),
    distDir: path.join(__dirname, '../dist'),
    outputFile: 'index.html',
    minify: process.argv.includes('--minify')
};

// Ensure dist directory exists
if (!fs.existsSync(config.distDir)) {
    fs.mkdirSync(config.distDir, { recursive: true });
}

// Read base HTML
let html = fs.readFileSync(
    path.join(config.srcDir, 'html/index.html'), 
    'utf-8'
);

// Function to read all files from a directory
function readDirectory(dir, extension) {
    const files = fs.readdirSync(dir)
        .filter(file => file.endsWith(extension))
        .sort(); // Ensure consistent order
    
    return files.map(file => 
        fs.readFileSync(path.join(dir, file), 'utf-8')
    ).join('\n');
}

// Replace placeholders with actual content
function injectContent() {
    // Inject HTML sections
    const homeHtml = fs.readFileSync(path.join(config.srcDir, 'html/home.html'), 'utf-8');
    const studyHtml = fs.readFileSync(path.join(config.srcDir, 'html/study.html'), 'utf-8');
    const completeHtml = fs.readFileSync(path.join(config.srcDir, 'html/complete.html'), 'utf-8');
    const settingsHtml = fs.readFileSync(path.join(config.srcDir, 'html/modals/settings.html'), 'utf-8');
    const vocabManagerHtml = fs.readFileSync(path.join(config.srcDir, 'html/modals/vocab-manager.html'), 'utf-8');
    const previewHtml = fs.readFileSync(path.join(config.srcDir, 'html/modals/preview.html'), 'utf-8');
    
    html = html.replace('<!-- HOME_CONTENT -->', homeHtml);
    html = html.replace('<!-- STUDY_CONTENT -->', studyHtml);
    html = html.replace('<!-- COMPLETE_CONTENT -->', completeHtml);
    html = html.replace('<!-- SETTINGS_MODAL -->', settingsHtml);
    html = html.replace('<!-- VOCAB_MANAGER_MODAL -->', vocabManagerHtml);
    html = html.replace('<!-- PREVIEW_MODAL -->', previewHtml);
    
    // Inject CSS
    const css = readDirectory(path.join(config.srcDir, 'css'), '.css');
    const cssContent = config.minify ? minifyCSS(css) : css;
    html = html.replace('<!-- STYLES -->', `<style>\n${cssContent}\n    </style>`);
    
    // Inject JavaScript
    const js = readDirectory(path.join(config.srcDir, 'js'), '.js');
    const jsContent = config.minify ? minifyJS(js) : js;
    html = html.replace('<!-- SCRIPTS -->', `<script>\n${jsContent}\n    </script>`);
}

// Simple CSS minification (you can use a proper minifier)
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around symbols
        .trim();
}

// Simple JS minification (you can use a proper minifier)
function minifyJS(js) {
    // This is very basic - use a proper minifier for production
    return js
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim();
}

// Build process
console.log('🔨 Building Language Learning App...');

try {
    injectContent();
    
    // Write output file
    fs.writeFileSync(
        path.join(config.distDir, config.outputFile),
        html,
        'utf-8'
    );
    
    // Calculate file size
    const stats = fs.statSync(path.join(config.distDir, config.outputFile));
    const fileSizeKB = Math.round(stats.size / 1024);
    
    console.log(`✅ Build successful!`);
    console.log(`📦 Output: dist/${config.outputFile} (${fileSizeKB} KB)`);
    
    if (fileSizeKB > 500) {
        console.log(`⚠️  Warning: File size is large. Consider minification.`);
    }
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}
```

## Package.json

```json
{
  "name": "language-learning-app",
  "version": "2.1.0",
  "description": "Modular language learning app with spaced repetition",
  "scripts": {
    "build": "node build/build.js",
    "build:min": "node build/build.js --minify",
    "watch": "nodemon --watch src --exec npm run build",
    "serve": "npx serve dist"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

## Base HTML Template (src/html/index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Language Learning App - Smart Vocabulary System</title>
    <!-- STYLES -->
</head>
<body>
    <div class="container" id="main-container">
        <!-- Settings Icon -->
        <svg class="settings-icon" onclick="toggleSettings()" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>

        <!-- HOME_CONTENT -->
        <!-- STUDY_CONTENT -->
        <!-- COMPLETE_CONTENT -->
    </div>

    <!-- SETTINGS_MODAL -->
    <!-- VOCAB_MANAGER_MODAL -->
    <!-- PREVIEW_MODAL -->
    
    <!-- Skill Switch Menu -->
    <div class="skill-switch-menu hidden" id="skill-switch-menu">
        <div class="skill-switch-option" data-level="1" onclick="switchSkillLevel(1)">🌱 Beginner</div>
        <div class="skill-switch-option" data-level="2" onclick="switchSkillLevel(2)">📘 Intermediate</div>
        <div class="skill-switch-option" data-level="3" onclick="switchSkillLevel(3)">🎯 Advanced</div>
    </div>

    <!-- Development Console -->
    <button class="dev-toggle hidden" id="dev-toggle" onclick="toggleDevConsole()">Show Dev Console</button>
    <div class="dev-console hidden" id="dev-console">
        <div class="dev-console-header">🔧 Development Console</div>
        <div id="dev-logs"></div>
    </div>

    <!-- SCRIPTS -->
</body>
</html>
```

## Development Workflow

1. **Install dependencies** (optional, for watch mode):
   ```bash
   npm install
   ```

2. **Development with watch mode**:
   ```bash
   npm run watch
   ```

3. **Build for production**:
   ```bash
   npm run build:min
   ```

4. **Test locally**:
   ```bash
   npm run serve
   ```

## Benefits of This Structure

1. **Maintainable**: Each file has a single responsibility
2. **Debuggable**: Line numbers in errors map to actual source files
3. **Version Control Friendly**: Git diffs show meaningful changes
4. **IDE Support**: Full autocomplete, syntax highlighting, and linting
5. **Scalable**: Easy to add new features in separate files
6. **Single Deployment**: Still outputs one HTML file
7. **Optional Optimization**: Can add minification, compression later

## Next Steps

1. I'll create the individual module files for each component
2. Each module will be self-contained with clear interfaces
3. The build script will combine them in the correct order
4. You can develop in comfort and deploy with simplicity

Would you like me to start creating the individual module files?