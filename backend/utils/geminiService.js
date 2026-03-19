import { getGeminiAPIKey, getGeminiModel, isAIEnabled } from './aiSettings';
import { getMoodTags } from './moodTags';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Call Gemini API with the given prompt
 * @param {string} prompt - The prompt to send to Gemini
 * @param {object} options - Additional options (temperature, maxTokens, etc.)
 * @returns {Promise<string>} - The generated text response
 */
export const callGemini = async (prompt, options = {}) => {
  // Check if AI is enabled
  const enabled = await isAIEnabled();
  if (!enabled) {
    throw new Error('AI features are disabled. Please enable AI and configure your API key in settings.');
  }

  const apiKey = await getGeminiAPIKey();
  const model = await getGeminiModel();

  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const {
    temperature = 0.7,
    maxOutputTokens = 1024,
    topP = 0.95,
    topK = 40,
  } = options;

  try {
    const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature,
          maxOutputTokens,
          topP,
          topK,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE'
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini');
    }

    const text = data.candidates[0].content.parts[0].text;
    return text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
};

/**
 * Summarize a journal entry
 * @param {string} content - The journal entry content
 * @returns {Promise<string>} - A brief summary
 */
export const summarizeEntry = async (content) => {
  const prompt = `You are a helpful assistant that summarizes journal entries. 

Please provide a brief, concise summary (2-3 sentences) of the following journal entry. Focus on the main themes, emotions, and key events mentioned.

Journal Entry:
${content}

Summary:`;

  try {
    const summary = await callGemini(prompt, {
      temperature: 0.5,
      maxOutputTokens: 200,
    });
    return summary.trim();
  } catch (error) {
    throw new Error(`Failed to summarize entry: ${error.message}`);
  }
};

/**
 * Detect mood/emotions from journal entry and suggest tags
 * @param {string} content - The journal entry content
 * @returns {Promise<Array<string>>} - Array of suggested mood tags
 */
export const detectMoodTags = async (content) => {
  const moodTags = await getMoodTags();
  const availableTags = moodTags.map((tag) => tag.name);
  const fallbackTag = availableTags.includes('Reflective') ? 'Reflective' : availableTags[0];

  const prompt = `You are an emotion detection assistant for a journaling app. Analyze the following journal entry and identify the emotions present.

Available mood tags: ${availableTags.join(', ')}

Journal Entry:
${content}

Instructions:
- Select 1-3 mood tags that best match the emotions in this entry
- Only use tags from the available list
- Return ONLY the tag names, separated by commas, nothing else
- If no clear emotion is detected, return "${fallbackTag}"

Mood tags:`;

  try {
    const response = await callGemini(prompt, {
      temperature: 0.3,
      maxOutputTokens: 50,
    });
    
    // Parse the response and extract valid tags
    const suggestedTags = response
      .trim()
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => availableTags.includes(tag))
      .slice(0, 3); // Limit to 3 tags
    
    return suggestedTags.length > 0 ? suggestedTags : [fallbackTag];
  } catch (error) {
    throw new Error(`Failed to detect mood: ${error.message}`);
  }
};

/**
 * Detect recurring themes and topics from journal entries
 * @param {Array} entries - Array of journal entries
 * @param {number} limit - Number of top themes to return
 * @returns {Promise<Array>} - Array of themes with counts
 */
export const detectThemes = async (entries, limit = 5) => {
  if (!entries || entries.length === 0) {
    return [];
  }

  // Combine recent entries (last 20 or all if less)
  const recentEntries = entries.slice(0, Math.min(20, entries.length));
  const combinedText = recentEntries.map(e => e.content).join('\n\n---\n\n');

  const prompt = `You are analyzing journal entries to identify recurring themes and topics.

Journal Entries:
${combinedText}

Instructions:
- Identify the ${limit} most common themes or topics across these entries
- Focus on concrete topics like: work, family, health, relationships, hobbies, goals, etc.
- Return ONLY a comma-separated list of themes, nothing else
- Use single words or short phrases (2-3 words max)
- Order by frequency (most common first)

Themes:`;

  try {
    const response = await callGemini(prompt, {
      temperature: 0.3,
      maxOutputTokens: 100,
    });
    
    const themes = response
      .trim()
      .split(',')
      .map(theme => theme.trim())
      .filter(theme => theme.length > 0)
      .slice(0, limit);
    
    return themes;
  } catch (error) {
    throw new Error(`Failed to detect themes: ${error.message}`);
  }
};

/**
 * Generate AI insights summary from journal data
 * @param {Object} stats - Statistics object with mood trends, patterns, etc.
 * @returns {Promise<string>} - Narrative summary of insights
 */
export const generateInsightsSummary = async (stats) => {
  const { 
    totalEntries, 
    timeRange, 
    topMoods, 
    writingFrequency,
    themes,
    avgWordsPerEntry 
  } = stats;

  const prompt = `You are a journaling insights assistant. Generate a brief, encouraging summary of the user's journaling patterns.

Data:
- Time period: ${timeRange}
- Total entries: ${totalEntries}
- Top moods: ${topMoods.join(', ')}
- Writing frequency: ${writingFrequency}
- Common themes: ${themes.join(', ')}
- Average words per entry: ${avgWordsPerEntry}

Instructions:
- Write 2-3 sentences in a warm, supportive tone
- Highlight positive patterns and growth
- Be specific about their journaling habits
- Avoid being overly clinical or robotic
- Focus on insights, not just restating data

Summary:`;

  try {
    const summary = await callGemini(prompt, {
      temperature: 0.7,
      maxOutputTokens: 200,
    });
    
    return summary.trim();
  } catch (error) {
    throw new Error(`Failed to generate insights: ${error.message}`);
  }
};

/**
 * Test the Gemini API connection
 * @returns {Promise<boolean>} - True if connection is successful
 */
export const testGeminiConnection = async () => {
  try {
    const response = await callGemini('Hello! Please respond with "Connection successful"', {
      maxOutputTokens: 50,
    });
    return response.length > 0;
  } catch (error) {
    throw error;
  }
};
