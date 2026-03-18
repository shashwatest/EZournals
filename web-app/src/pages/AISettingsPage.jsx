import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Sparkles, Info, Eye, EyeOff, Save, Zap, Check, Shield, FileText, BarChart3 } from 'lucide-react';

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

const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Latest and fastest' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Fast and efficient' },
  { id: 'gemma-3-27b-it', name: 'Gemma 3 27B IT', description: 'Open model, instruction-tuned' },
];

export default function AISettingsPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(DEFAULT_AI_SETTINGS);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem(AI_SETTINGS_KEY);
      if (saved) {
        setSettings({ ...DEFAULT_AI_SETTINGS, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  };

  const saveSettings = (newSettings) => {
    try {
      localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving AI settings:', error);
      alert('Failed to save settings');
    }
  };

  const toggleAI = (value) => {
    if (value && !settings.apiKey.trim()) {
      alert('Please enter your Gemini API key before enabling AI features.');
      return;
    }
    const newSettings = { ...settings, enabled: value };
    saveSettings(newSettings);
  };

  const updateApiKey = (key) => {
    setSettings({ ...settings, apiKey: key });
  };

  const handleSaveApiKey = () => {
    saveSettings(settings);
    alert('API key saved successfully');
  };

  const selectModel = (modelId) => {
    const newSettings = { ...settings, model: modelId };
    saveSettings(newSettings);
  };

  const toggleFeature = (feature) => {
    const newSettings = {
      ...settings,
      features: {
        ...settings.features,
        [feature]: !settings.features[feature]
      }
    };
    saveSettings(newSettings);
  };

  const handleTestConnection = async () => {
    if (!settings.apiKey.trim()) {
      alert('Please enter your Gemini API key first.');
      return;
    }

    setTesting(true);
    setTestMessage('');
    
    try {
      // Save settings first
      saveSettings(settings);

      // Test connection
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${settings.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello! Please respond with "Connection successful"'
            }]
          }],
          generationConfig: {
            maxOutputTokens: 50,
          }
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

      setTestMessage('✓ Connection successful!');
      setTimeout(() => setTestMessage(''), 3000);
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestMessage(`✗ ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const styles = {
    container: {
      padding: '32px',
      maxWidth: '900px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '32px',
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      color: theme.text,
      cursor: 'pointer',
      fontSize: '14px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: theme.text,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: `1px solid ${theme.border}`,
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px',
    },
    cardHeaderLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: theme.text,
    },
    cardDescription: {
      fontSize: '14px',
      color: theme.textSecondary,
      lineHeight: '1.6',
    },
    toggle: {
      position: 'relative',
      width: '48px',
      height: '28px',
      backgroundColor: theme.border,
      borderRadius: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    toggleActive: {
      backgroundColor: theme.accent,
    },
    toggleThumb: {
      position: 'absolute',
      top: '3px',
      left: '3px',
      width: '22px',
      height: '22px',
      backgroundColor: '#fff',
      borderRadius: '50%',
      transition: 'transform 0.2s',
    },
    toggleThumbActive: {
      transform: 'translateX(20px)',
    },
    infoCard: {
      display: 'flex',
      gap: '12px',
      padding: '16px',
      backgroundColor: `${theme.accent}15`,
      border: `1px solid ${theme.accent}30`,
      borderRadius: '12px',
      marginBottom: '24px',
      alignItems: 'flex-start',
    },
    infoText: {
      flex: 1,
      fontSize: '13px',
      color: theme.textSecondary,
      lineHeight: '1.6',
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: theme.text,
      marginBottom: '4px',
    },
    sectionDescription: {
      fontSize: '13px',
      color: theme.textSecondary,
      marginBottom: '16px',
      lineHeight: '1.6',
    },
    inputGroup: {
      marginBottom: '16px',
    },
    inputLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: theme.textSecondary,
      marginBottom: '8px',
    },
    apiKeyContainer: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      padding: '12px',
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      backgroundColor: theme.background,
      color: theme.text,
      fontSize: '14px',
    },
    eyeButton: {
      padding: '12px',
      cursor: 'pointer',
      color: theme.textSecondary,
    },
    linkButton: {
      marginTop: '8px',
      color: theme.accent,
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      textDecoration: 'none',
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
    },
    button: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      border: `1px solid ${theme.border}`,
      color: theme.text,
    },
    buttonPrimary: {
      backgroundColor: theme.accent,
      color: '#fff',
    },
    testMessage: {
      marginTop: '12px',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      textAlign: 'center',
    },
    modelOption: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      borderRadius: '8px',
      border: `1px solid ${theme.border}`,
      marginBottom: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    modelOptionActive: {
      borderColor: theme.accent,
      backgroundColor: `${theme.accent}10`,
    },
    modelInfo: {
      flex: 1,
    },
    modelName: {
      fontSize: '15px',
      fontWeight: '600',
      color: theme.text,
      marginBottom: '4px',
    },
    modelDescription: {
      fontSize: '13px',
      color: theme.textLight,
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: '16px',
      paddingBottom: '16px',
      borderBottom: `1px solid ${theme.border}`,
    },
    featureInfo: {
      flex: 1,
    },
    featureLabel: {
      fontSize: '15px',
      fontWeight: '500',
      color: theme.text,
      marginBottom: '4px',
    },
    featureDescription: {
      fontSize: '13px',
      color: theme.textLight,
      lineHeight: '1.5',
    },
    privacyCard: {
      display: 'flex',
      gap: '12px',
      padding: '16px',
      backgroundColor: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      alignItems: 'flex-start',
    },
    privacyText: {
      flex: 1,
    },
    privacyTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: theme.text,
      marginBottom: '4px',
    },
    privacyDescription: {
      fontSize: '13px',
      color: theme.textSecondary,
      lineHeight: '1.6',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/settings')}>
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 style={styles.title}>AI Settings</h1>
      </div>

      {/* Master Toggle */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardHeaderLeft}>
            <Sparkles size={24} color={theme.accent} />
            <div>
              <div style={styles.cardTitle}>AI Features</div>
            </div>
          </div>
          <div
            style={{
              ...styles.toggle,
              ...(settings.enabled ? styles.toggleActive : {}),
            }}
            onClick={() => toggleAI(!settings.enabled)}
          >
            <div
              style={{
                ...styles.toggleThumb,
                ...(settings.enabled ? styles.toggleThumbActive : {}),
              }}
            />
          </div>
        </div>
        <div style={styles.cardDescription}>
          {settings.enabled ? 'AI features are enabled' : 'Enable AI-powered features'}
        </div>
      </div>

      {/* Info Card */}
      <div style={styles.infoCard}>
        <Info size={20} color={theme.accent} />
        <div style={styles.infoText}>
          AI features require a Gemini API key. Your key is stored locally and never shared.
        </div>
      </div>

      {/* API Key Section */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>API Configuration</div>
        <div style={styles.sectionDescription}>
          Configure your Gemini API key and test the connection
        </div>
        
        <div style={styles.inputGroup}>
          <div style={styles.inputLabel}>Gemini API Key</div>
          <div style={styles.apiKeyContainer}>
            <input
              type={showApiKey ? 'text' : 'password'}
              style={styles.input}
              placeholder="Enter your API key"
              value={settings.apiKey}
              onChange={(e) => updateApiKey(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
            />
            <div style={styles.eyeButton} onClick={() => setShowApiKey(!showApiKey)}>
              {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.linkButton}
          >
            Get a free API key →
          </a>
        </div>

        <div style={styles.buttonGroup}>
          <button style={{ ...styles.button, ...styles.buttonSecondary }} onClick={handleSaveApiKey}>
            <Save size={18} />
            Save Key
          </button>
          
          <button
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onClick={handleTestConnection}
            disabled={testing}
          >
            <Zap size={18} />
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {testMessage && (
          <div
            style={{
              ...styles.testMessage,
              backgroundColor: testMessage.startsWith('✓') ? `${theme.accent}20` : `${theme.danger}20`,
              color: testMessage.startsWith('✓') ? theme.accent : theme.danger,
            }}
          >
            {testMessage}
          </div>
        )}
      </div>

      {/* Model Selection */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>AI Model</div>
        <div style={styles.sectionDescription}>
          Choose which Gemini model to use
        </div>
        
        {AVAILABLE_MODELS.map((model) => (
          <div
            key={model.id}
            style={{
              ...styles.modelOption,
              ...(settings.model === model.id ? styles.modelOptionActive : {}),
            }}
            onClick={() => selectModel(model.id)}
          >
            <div style={styles.modelInfo}>
              <div style={styles.modelName}>{model.name}</div>
              <div style={styles.modelDescription}>{model.description}</div>
            </div>
            {settings.model === model.id && <Check size={24} color={theme.accent} />}
          </div>
        ))}
      </div>

      {/* Feature Toggles */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>AI Features</div>
        <div style={styles.sectionDescription}>
          Enable or disable specific AI features. Each feature can be toggled independently.
        </div>
        
        <div style={styles.featureItem}>
          <div style={styles.featureInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <FileText size={20} color={theme.accent} />
              <div style={styles.featureLabel}>Entry Summarization</div>
            </div>
            <div style={{ ...styles.featureDescription, paddingLeft: '28px' }}>
              Generate brief summaries of your entries with one click
            </div>
          </div>
          <div
            style={{
              ...styles.toggle,
              ...(settings.features.summarization ? styles.toggleActive : {}),
              ...(settings.enabled ? {} : { opacity: 0.5, cursor: 'not-allowed' }),
            }}
            onClick={() => settings.enabled && toggleFeature('summarization')}
          >
            <div
              style={{
                ...styles.toggleThumb,
                ...(settings.features.summarization ? styles.toggleThumbActive : {}),
              }}
            />
          </div>
        </div>

        <div style={styles.featureItem}>
          <div style={styles.featureInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sparkles size={20} color={theme.accent} />
              <div style={styles.featureLabel}>Mood Detection</div>
            </div>
            <div style={{ ...styles.featureDescription, paddingLeft: '28px' }}>
              Automatically detect emotions and suggest mood tags
            </div>
          </div>
          <div
            style={{
              ...styles.toggle,
              ...(settings.features.moodDetection ? styles.toggleActive : {}),
              ...(settings.enabled ? {} : { opacity: 0.5, cursor: 'not-allowed' }),
            }}
            onClick={() => settings.enabled && toggleFeature('moodDetection')}
          >
            <div
              style={{
                ...styles.toggleThumb,
                ...(settings.features.moodDetection ? styles.toggleThumbActive : {}),
              }}
            />
          </div>
        </div>

        <div style={styles.featureItem}>
          <div style={styles.featureInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <BarChart3 size={20} color={theme.accent} />
              <div style={styles.featureLabel}>Insights & Patterns</div>
            </div>
            <div style={{ ...styles.featureDescription, paddingLeft: '28px' }}>
              Discover patterns and trends in your journaling
            </div>
          </div>
          <div
            style={{
              ...styles.toggle,
              ...(settings.features.insights ? styles.toggleActive : {}),
              ...(settings.enabled ? {} : { opacity: 0.5, cursor: 'not-allowed' }),
            }}
            onClick={() => settings.enabled && toggleFeature('insights')}
          >
            <div
              style={{
                ...styles.toggleThumb,
                ...(settings.features.insights ? styles.toggleThumbActive : {}),
              }}
            />
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div style={styles.privacyCard}>
        <Shield size={20} color={theme.accent} />
        <div style={styles.privacyText}>
          <div style={styles.privacyTitle}>Privacy First</div>
          <div style={styles.privacyDescription}>
            Your API key and journal entries are processed securely. We never store your data on external servers.
          </div>
        </div>
      </div>
    </div>
  );
}
