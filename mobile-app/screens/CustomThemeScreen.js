import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { classyBWTheme } from '../styles/theme';
import ColorPickerModal from '../components/ColorPicker';

export default function CustomThemeScreen({ navigation, route }) {
  const { theme, currentTheme, saveCustomTheme, updateCustomTheme } = useTheme();
  const editTheme = route?.params?.editTheme;
  const [customColors, setCustomColors] = useState(editTheme || classyBWTheme);
  const [selectedField, setSelectedField] = useState(null);

  const [themeName, setThemeName] = useState(editTheme?.name || 'My Custom Theme');

  const colorFields = [
    { key: 'background', label: 'Background', description: 'Main app background' },
    { key: 'surface', label: 'Surface', description: 'Cards and panels' },
    { key: 'text', label: 'Text', description: 'Primary text color' },
    { key: 'textSecondary', label: 'Secondary Text', description: 'Subtitle text' },
    { key: 'textLight', label: 'Light Text', description: 'Placeholder text' },
    { key: 'accent', label: 'Accent', description: 'Buttons and highlights' },
    { key: 'primary', label: 'Primary', description: 'Main theme color' },
    { key: 'danger', label: 'Danger', description: 'Error and delete actions' },
    { key: 'border', label: 'Border', description: 'Lines and separators' }
  ];

  const updateColor = (key, value) => {
    if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
      setCustomColors(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleColorSelect = (color) => {
    if (selectedField) {
      setCustomColors(prev => ({ ...prev, [selectedField]: color }));
      setSelectedField(null);
    }
  };

  const saveTheme = async () => {
    if (editTheme) {
      // Update existing theme
      const updatedTheme = {
        ...editTheme,
        ...customColors,
        name: themeName
      };
      await updateCustomTheme(updatedTheme.id, updatedTheme);
    } else {
      // Create new theme
      const themeData = {
        ...customColors,
        name: themeName
      };
      await saveCustomTheme(themeData);
    }
    navigation.goBack();
  };

  const resetToDefault = () => {
    setCustomColors(classyBWTheme);
  };
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Custom Theme</Text>
        <TouchableOpacity onPress={saveTheme}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.nameSection}>
          <Text style={styles.nameLabel}>Theme Name</Text>
          <TextInput
            style={styles.nameInput}
            value={themeName}
            onChangeText={setThemeName}
            placeholder="Enter theme name"
            placeholderTextColor={theme.textLight}
          />
        </View>
        
        <View style={styles.previewCard}>
          <Text style={[styles.previewTitle, { color: customColors.text }]}>Preview</Text>
          <View style={[styles.previewSurface, { backgroundColor: customColors.surface }]}>
            <Text style={[styles.previewText, { color: customColors.text }]}>Sample Text</Text>
            <Text style={[styles.previewSecondary, { color: customColors.textSecondary }]}>Secondary text</Text>
            <TouchableOpacity style={[styles.previewButton, { backgroundColor: customColors.accent }]}>
              <Text style={[styles.previewButtonText, { color: customColors.surface }]}>Button</Text>
            </TouchableOpacity>
          </View>
        </View>

        {colorFields.map((field) => (
          <View key={field.key} style={styles.colorField}>
            <View style={styles.colorInfo}>
              <Text style={styles.colorLabel}>{field.label}</Text>
              <Text style={styles.colorDescription}>{field.description}</Text>
            </View>
            <View style={styles.colorInput}>
              <TouchableOpacity 
                style={[styles.colorPreview, { backgroundColor: customColors[field.key] }]} 
                onPress={() => setSelectedField(field.key)}
              />
              <TextInput
                style={styles.colorTextInput}
                value={customColors[field.key]}
                onChangeText={(value) => updateColor(field.key, value)}
                placeholder="#000000"
                placeholderTextColor={theme.textLight}
                autoCapitalize="none"
              />
            </View>
          </View>
        ))}



        <TouchableOpacity style={styles.resetButton} onPress={resetToDefault}>
          <Text style={styles.resetButtonText}>Reset to Default</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <ColorPickerModal
        visible={selectedField !== null}
        onClose={() => setSelectedField(null)}
        onSelectColor={handleColorSelect}
        initialColor={selectedField ? customColors[selectedField] : '#2196F3'}
        title={`Choose ${colorFields.find(f => f.key === selectedField)?.label || 'Color'}`}
      />
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text
  },
  saveButton: {
    fontSize: 16,
    color: theme.accent,
    fontWeight: '600'
  },
  content: {
    flex: 1,
    padding: 20
  },
  nameSection: {
    marginBottom: 20
  },
  nameLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8
  },
  nameInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.surface
  },
  previewCard: {
    marginBottom: 30
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  previewSurface: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border
  },
  previewText: {
    fontSize: 16,
    marginBottom: 5
  },
  previewSecondary: {
    fontSize: 14,
    marginBottom: 15
  },
  previewButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '600'
  },
  colorField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  colorInfo: {
    flex: 1
  },
  colorLabel: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500'
  },
  colorDescription: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2
  },
  colorInput: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  colorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.border
  },
  colorTextInput: {
    width: 80,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 6,
    color: theme.text,
    fontSize: 12,
    fontFamily: 'monospace'
  },
  resetButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: theme.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center'
  },
  resetButtonText: {
    color: theme.danger,
    fontSize: 16,
    fontWeight: '600'
  }
});
