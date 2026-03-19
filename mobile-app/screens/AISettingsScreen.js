import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Platform, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { getAISettings, saveAISettings } from '../../backend/utils/aiSettings';
import { testGeminiConnection } from '../../backend/utils/geminiService';
import { showAlert } from '../utils/appAlert';

const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Latest and fastest' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Fast and efficient' },
  { id: 'gemma-3-27b-it', name: 'Gemma 3 27B IT', description: 'Open model, instruction-tuned' },
];

export default function AISettingsScreen({ navigation }) {
  const { theme } = useTheme();
  const accentText = theme.onAccentText || '#fff';
  const [settings, setSettings] = useState({
    enabled: false,
    apiKey: '',
    model: 'gemini-2.5-flash',
    features: {
      summarization: true,
      moodDetection: true,
      insights: true,
    }
  });
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await getAISettings();
      setSettings(saved);
    } catch (error) {
      console.error('Error loading AI settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newSettings) => {
    try {
      await saveAISettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving AI settings:', error);
      await showAlert({ title: 'Error', message: 'Failed to save settings', confirmTone: 'danger' });
    }
  };

  const toggleAI = async (value) => {
    if (value && !settings.apiKey.trim()) {
      await showAlert({ title: 'API Key Required', message: 'Please enter your Gemini API key before enabling AI features.' });
      return;
    }
    const newSettings = { ...settings, enabled: value };
    await handleSave(newSettings);
  };

  const updateApiKey = async (key) => {
    const newSettings = { ...settings, apiKey: key };
    setSettings(newSettings);
  };

  const saveApiKey = async () => {
    await handleSave(settings);
    await showAlert({ title: 'Success', message: 'API key saved successfully' });
  };

  const selectModel = async (modelId) => {
    const newSettings = { ...settings, model: modelId };
    await handleSave(newSettings);
  };

  const toggleFeature = async (feature) => {
    const newSettings = {
      ...settings,
      features: {
        ...settings.features,
        [feature]: !settings.features[feature]
      }
    };
    await handleSave(newSettings);
  };

  const handleTestConnection = async () => {
    if (!settings.apiKey.trim()) {
      await showAlert({ title: 'API Key Required', message: 'Please enter your Gemini API key first.' });
      return;
    }

    setTesting(true);
    try {
      // Save current settings first
      await handleSave(settings);
      
      // Test connection
      await testGeminiConnection();
      await showAlert({ title: 'Success', message: 'Connection to Gemini API successful!' });
    } catch (error) {
      await showAlert({ title: 'Connection Failed', message: error.message || 'Failed to connect to Gemini API. Please check your API key.', confirmTone: 'danger' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>AI Settings</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>AI Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Master Toggle */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="sparkles" size={24} color={theme.accent} />
              <View style={styles.cardHeaderText}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>AI Features</Text>
                <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
                  {settings.enabled ? 'AI features are enabled' : 'Enable AI-powered features'}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={toggleAI}
              trackColor={{ false: theme.border, true: theme.accent }}
              thumbColor={Platform.OS === 'android' ? theme.surface : undefined}
            />
          </View>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.accent + '15', borderColor: theme.accent + '30' }]}>
          <Ionicons name="information-circle-outline" size={20} color={theme.accent} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            AI features require a Gemini API key. Your key is stored locally and never shared.
          </Text>
        </View>

        {/* API Key Section */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>API Configuration</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Gemini API Key</Text>
            <View style={styles.apiKeyContainer}>
              <TextInput
                style={[styles.input, { 
                  borderColor: theme.border, 
                  color: theme.text,
                  backgroundColor: theme.background,
                  flex: 1
                }]}
                placeholder="Enter your API key"
                placeholderTextColor={theme.textLight}
                value={settings.apiKey}
                onChangeText={updateApiKey}
                secureTextEntry={!showApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowApiKey(!showApiKey)}
              >
                <Ionicons 
                  name={showApiKey ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.linkButton, { marginTop: 8 }]}
              onPress={() => {
                showAlert({
                  title: 'Get API Key',
                  message: 'Visit https://aistudio.google.com/app/apikey to get your free Gemini API key.',
                });
              }}
            >
              <Text style={[styles.linkText, { color: theme.accent }]}>
                Get a free API key →
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonSecondary, { borderColor: theme.border }]}
              onPress={saveApiKey}
            >
              <Ionicons name="save-outline" size={18} color={theme.text} />
              <Text style={[styles.buttonText, { color: theme.text }]}>Save Key</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.buttonPrimary, { backgroundColor: theme.accent }]}
              onPress={handleTestConnection}
              disabled={testing}
            >
              {testing ? (
                <ActivityIndicator size="small" color={accentText} />
              ) : (
                <Ionicons name="flash-outline" size={18} color={accentText} />
              )}
              <Text style={[styles.buttonText, { color: accentText }]}>
                {testing ? 'Testing...' : 'Test Connection'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Model Selection */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>AI Model</Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Choose which Gemini model to use
          </Text>
          
          {AVAILABLE_MODELS.map((model) => (
            <TouchableOpacity
              key={model.id}
              style={[
                styles.modelOption,
                { borderColor: theme.border },
                settings.model === model.id && { 
                  borderColor: theme.accent, 
                  backgroundColor: theme.accent + '10' 
                }
              ]}
              onPress={() => selectModel(model.id)}
            >
              <View style={styles.modelInfo}>
                <Text style={[styles.modelName, { color: theme.text }]}>
                  {model.name}
                </Text>
                <Text style={[styles.modelDescription, { color: theme.textLight }]}>
                  {model.description}
                </Text>
              </View>
              {settings.model === model.id && (
                <Ionicons name="checkmark-circle" size={24} color={theme.accent} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Feature Toggles */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>AI Features</Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Enable or disable specific AI features. Each feature can be toggled independently.
          </Text>
          
          <View style={[styles.featureItem, { borderBottomColor: theme.border }]}>
            <View style={styles.featureInfo}>
              <View style={styles.featureHeader}>
                <Ionicons name="document-text-outline" size={20} color={theme.accent} />
                <Text style={[styles.featureLabel, { color: theme.text }]}>Entry Summarization</Text>
              </View>
              <Text style={[styles.featureDescription, { color: theme.textLight }]}>
                Generate brief summaries of your entries with one tap
              </Text>
            </View>
            <Switch
              value={settings.features.summarization}
              onValueChange={() => toggleFeature('summarization')}
              trackColor={{ false: theme.border, true: theme.accent }}
              thumbColor={Platform.OS === 'android' ? theme.surface : undefined}
              disabled={!settings.enabled}
            />
          </View>

          <View style={[styles.featureItem, { borderBottomColor: theme.border }]}>
            <View style={styles.featureInfo}>
              <View style={styles.featureHeader}>
                <Ionicons name="happy-outline" size={20} color={theme.accent} />
                <Text style={[styles.featureLabel, { color: theme.text }]}>Mood Detection</Text>
              </View>
              <Text style={[styles.featureDescription, { color: theme.textLight }]}>
                Automatically detect emotions and suggest mood tags
              </Text>
            </View>
            <Switch
              value={settings.features.moodDetection}
              onValueChange={() => toggleFeature('moodDetection')}
              trackColor={{ false: theme.border, true: theme.accent }}
              thumbColor={Platform.OS === 'android' ? theme.surface : undefined}
              disabled={!settings.enabled}
            />
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureInfo}>
              <View style={styles.featureHeader}>
                <Ionicons name="analytics-outline" size={20} color={theme.accent} />
                <Text style={[styles.featureLabel, { color: theme.text }]}>Insights & Patterns</Text>
              </View>
              <Text style={[styles.featureDescription, { color: theme.textLight }]}>
                Discover patterns and trends in your journaling
              </Text>
            </View>
            <Switch
              value={settings.features.insights}
              onValueChange={() => toggleFeature('insights')}
              trackColor={{ false: theme.border, true: theme.accent }}
              thumbColor={Platform.OS === 'android' ? theme.surface : undefined}
              disabled={!settings.enabled}
            />
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={[styles.privacyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="shield-checkmark-outline" size={20} color={theme.accent} />
          <View style={styles.privacyText}>
            <Text style={[styles.privacyTitle, { color: theme.text }]}>Privacy First</Text>
            <Text style={[styles.privacyDescription, { color: theme.textSecondary }]}>
              Your API key and journal entries are processed securely. We never store your data on external servers.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  apiKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  eyeButton: {
    padding: 12,
  },
  linkButton: {
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: 13,
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  buttonSecondary: {
    borderWidth: 1,
  },
  buttonPrimary: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  modelInfo: {
    flex: 1,
    marginRight: 12,
  },
  modelName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  modelDescription: {
    fontSize: 13,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  featureInfo: {
    flex: 1,
    marginRight: 12,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  featureLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
    paddingLeft: 28,
  },
  privacyCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  privacyText: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});
