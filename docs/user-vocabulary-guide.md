# Vocabulary Extension Guide

## AI Extraction Prompt Template

When using AI (Claude, ChatGPT, etc.) to extract vocabulary from a text, use this template:

### Prompt Structure

```
I need vocabulary extracted from the following text for a language learning app.

SOURCE LANGUAGE: [e.g., Czech]
TARGET LANGUAGE: [e.g., Vietnamese]
LANGUAGE PAIR CODE: [e.g., cs-vi]

TEXT TO ANALYZE:
[Paste your text here]

Please extract vocabulary in this exact JSON format:
{
  "language_pair": "cs-vi",
  "words": [
    {
      "id": [unique_number],
      "word": "[word in source language]",
      "translation": "[word in target language]",
      "romanization": "[pronunciation guide if needed]",
      "category": "[one of: greetings, basics, numbers, family, food, travel, health, work, time, weather, shopping, emotions, people, places, activities]",
      "difficulty": [1-3, where 1=beginner, 2=intermediate, 3=advanced]
    }
  ]
}

REQUIREMENTS:
1. Extract 15-20 most useful words/phrases from the text
2. Focus on practical, high-frequency vocabulary
3. Include romanization for non-Latin scripts (Chinese, Vietnamese tones, etc.)
4. Categorize appropriately based on context
5. Assess difficulty based on:
   - Frequency of use (common = 1, less common = 2, rare = 3)
   - Complexity (simple = 1, compound = 2, abstract = 3)
   - Length (short = 1, medium = 2, long = 3)
6. Avoid duplicates
7. Ensure translations are accurate and commonly used
8. For Vietnamese: Include tone marks in both translation and romanization
9. For Chinese: Include pinyin with tone numbers or marks
10. Start IDs from 1001 to avoid conflicts with built-in vocabulary

EXAMPLE OUTPUT:
{
  "language_pair": "cs-vi",
  "words": [
    {
      "id": 1001,
      "word": "restaurace",
      "translation": "nhà hàng",
      "romanization": "nhà hàng",
      "category": "food",
      "difficulty": 1
    },
    {
      "id": 1002,
      "word": "účet",
      "translation": "hóa đơn",
      "romanization": "hóa đơn",
      "category": "shopping",
      "difficulty": 2
    }
  ]
}
```

## Manual Entry Format

When adding vocabulary manually, use this structure:

### Required Fields:
- **Word**: The word in the source language
- **Translation**: The word in the target language
- **Category**: Choose from predefined categories
- **Difficulty**: Rate 1-3

### Optional Fields:
- **Romanization**: Pronunciation guide (important for Chinese, useful for Vietnamese)
- **Notes**: Context or usage notes
- **Example**: Example sentence (optional)

## Category Guidelines

### Standard Categories:
- **greetings**: Hello, goodbye, please, thanks
- **basics**: Yes, no, common verbs
- **numbers**: Numbers, counting, quantities
- **family**: Family members, relationships
- **food**: Food items, meals, restaurants
- **travel**: Transportation, directions, accommodation
- **health**: Body parts, symptoms, medical
- **work**: Job-related, office, professional
- **time**: Days, months, time expressions
- **weather**: Weather conditions, seasons
- **shopping**: Money, clothes, stores
- **emotions**: Feelings, states of mind
- **people**: Descriptions, professions
- **places**: Locations, buildings
- **activities**: Verbs, hobbies, daily activities

## Difficulty Assessment

### Level 1 (Beginner):
- High-frequency words used daily
- Concrete nouns (things you can see/touch)
- Simple present tense verbs
- Numbers 1-100
- Basic greetings and courtesy phrases

### Level 2 (Intermediate):
- Less frequent but still common words
- Abstract concepts that are easily understood
- Past and future tense verbs
- Compound words
- Descriptive adjectives

### Level 3 (Advanced):
- Low-frequency or specialized vocabulary
- Abstract concepts
- Idiomatic expressions
- Cultural-specific terms
- Professional or technical vocabulary

## Tips for Effective Vocabulary Selection

1. **Relevance**: Choose words relevant to your daily life and interests
2. **Frequency**: Prioritize high-frequency words you'll actually use
3. **Context**: Group related words together (e.g., restaurant vocabulary)
4. **Balance**: Mix different categories and difficulty levels
5. **Personal**: Add words specific to your situation (workplace, hobbies)
6. **Cultural**: Include culturally important terms and expressions
7. **Practical**: Focus on words that enable communication

## Import Format

Save your vocabulary as a `.json` file with this structure:

```json
{
  "source": "user_generated",
  "date": "2024-01-15",
  "language_pair": "cs-vi",
  "words": [
    {
      "id": 1001,
      "word": "káva",
      "translation": "cà phê",
      "romanization": "cà phê",
      "category": "food",
      "difficulty": 1
    }
  ]
}
```

## Batch Import via AI

For importing multiple vocabulary sets, you can ask AI to process multiple texts at once:

```
Process these 3 texts and extract vocabulary for Czech->Vietnamese learning:

TEXT 1 (Restaurant Context):
[text here]

TEXT 2 (Travel Context):
[text here]

TEXT 3 (Work Context):
[text here]

Provide separate JSON blocks for each text, maintaining unique IDs starting from 1001, 1021, 1041 respectively.
```

## Quality Checklist

Before importing vocabulary, verify:
- [ ] No duplicate words within the set
- [ ] Translations are accurate
- [ ] Romanization is correct (especially tones)
- [ ] Categories make sense
- [ ] Difficulty levels are appropriate
- [ ] IDs don't conflict with existing vocabulary
- [ ] Special characters display correctly
- [ ] Word pairs are practical and useful