const AI_SETTINGS_KEY = 'ai_settings';

const DEFAULT_AI_SETTINGS = {
  enabled: false,
  apiKey: '',
  model: 'gemini-2.5-flash',
  features: {
    summarization: true,
    moodDetection: true,
    insights: true,
  }
};

export const getAISettings = () => {
  try {
    const saved = localStorage.getItem(AI_SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(saved) };
    }
    return DEFAULT_AI_SETTINGS;
  } catch (error) {
    console.error('Error loading AI settings:', error);
    return DEFAULT_AI_SETTINGS;
  }
};

export const saveAISettings = (settings) => {
  try {
    localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving AI settings:', error);
    return false;
  }
};

export const isAIEnabled = () => {
  const settings = getAISettings();
  return settings.enabled && settings.apiKey && settings.apiKey.trim().length > 0;
};

export const getGeminiAPIKey = () => {
  const settings = getAISettings();
  return settings.apiKey;
};

export const getGeminiModel = () => {
  const settings = getAISettings();
  return settings.model || DEFAULT_AI_SETTINGS.model;
};
