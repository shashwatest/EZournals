import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function RichTextEditor({ value, onChangeText, placeholder }) {
  const { theme } = useTheme();

  if (!theme) return null;

  const insertFormatting = (format) => {
    const formats = {
      bold: '**',
      italic: '*',
      bullet: '\n• '
    };
    
    const formatChar = formats[format];
    if (format === 'bullet') {
      onChangeText(value + formatChar);
    } else {
      onChangeText(value + formatChar + formatChar);
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={() => insertFormatting('bold')}
        >
          <Text style={[styles.toolButtonText, { color: theme.text }]}>B</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={() => insertFormatting('italic')}
        >
          <Text style={[styles.toolButtonTextItalic, { color: theme.text }]}>I</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={() => insertFormatting('bullet')}
        >
          <Ionicons name="list" size={16} color={theme.text} />
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor={theme.textLight}
        value={value}
        onChangeText={onChangeText}
        multiline
        textAlignVertical="top"
        selectionColor={theme.accent}
      />
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  toolButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 4,
    backgroundColor: theme.background
  },
  toolButtonText: {
    fontWeight: 'bold',
    fontSize: 16
  },
  toolButtonTextItalic: {
    fontStyle: 'italic',
    fontSize: 16
  },
  textInput: {
    padding: 24,
    fontSize: 17,
    lineHeight: 26,
    color: theme.text,
    fontWeight: '400',
    minHeight: 200
  }
});