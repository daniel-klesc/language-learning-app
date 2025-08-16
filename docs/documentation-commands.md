# Documentation Command Reference

## Quick Command Guide for AI Assistant

Add this section to your project instructions to enable quick documentation generation in any chat session.

---

## 📚 Documentation Commands

When working with an AI assistant on this language learning app project, use these commands to quickly generate specific documentation:

### Available Commands:

#### `/doc dev` - Development Documentation
Generates technical documentation including:
- Current implementation status
- Code architecture and structure
- Functions and data models
- LocalStorage schema
- Development setup instructions
- Testing procedures
- Bug tracking and fixes
- Version history
- Technical debt and TODOs

#### `/doc feat` - Feature Documentation
Generates user-facing feature documentation including:
- Complete feature list with descriptions
- How each feature works
- User interface elements
- Session management details
- Spaced repetition system explanation
- Daily goals and adaptation logic
- Progress tracking mechanisms
- Available language pairs and vocabulary

#### `/doc user` - User Guide
Generates end-user documentation including:
- Getting started guide
- How to use the app effectively
- Best practices for learning
- Tips for busy schedules
- Understanding the metrics
- Troubleshooting common issues
- FAQ section
- Mobile usage instructions

#### `/doc all` - Complete Documentation
Generates all three documentation types in one comprehensive document with clear sections.

### Additional Specialized Commands:

#### `/doc api` - API/Function Reference
Generates detailed function documentation with parameters and return values.

#### `/doc todo` - Development Roadmap
Generates prioritized list of pending features and improvements.

#### `/doc bugs` - Known Issues
Generates list of known bugs, their status, and workarounds.

#### `/doc vocab` - Vocabulary Database
Generates current vocabulary list organized by language pair and category.

#### `/doc test` - Testing Guide
Generates comprehensive testing procedures and checklists.

---

## 📝 Usage Instructions for AI Assistant

When you see one of these commands, generate the appropriate documentation based on the current project state. The documentation should:

1. **Be up-to-date** with the latest changes in the code
2. **Be formatted in Markdown** for easy copying
3. **Include relevant code snippets** where appropriate
4. **Be comprehensive** but well-organized
5. **Match the target audience** (developers vs users)

### Example Response Format:

When user types: `/doc feat`

Assistant should respond with:
```markdown
# Language Learning App - Feature Documentation
*Generated on: [Current Date]*
*Version: 1.6*

## Core Features

### 1. Adaptive Daily Goals
[Detailed feature description...]

### 2. Flexible Session Management
[Detailed feature description...]

[etc...]
```

---

## 🔧 Custom Command Creation

To add new documentation commands, follow this pattern:

```
/doc [keyword] - [Description]
```

Suggested additions:
- `/doc phase2` - Generate Phase 2 implementation plan
- `/doc deploy` - Deployment instructions
- `/doc data` - Data structure documentation
- `/doc ux` - UI/UX guidelines

---

## 📌 Implementation Note

Add this entire command reference to your project instructions. When starting a new chat session with an AI assistant, include:

1. The main project documentation
2. This command reference
3. Current code

The AI will then respond to these commands throughout your development session.

---

## Quick Copy Section

Add this to your project instructions:

```
DOCUMENTATION COMMANDS:
The following commands trigger specific documentation generation:
- /doc dev - Technical development documentation
- /doc feat - Feature documentation
- /doc user - User guide
- /doc all - Complete documentation
- /doc api - Function reference
- /doc todo - Development roadmap
- /doc bugs - Known issues
- /doc vocab - Vocabulary database
- /doc test - Testing procedures

When these commands are used, generate appropriate up-to-date documentation in Markdown format.
```