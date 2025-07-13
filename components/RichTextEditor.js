import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import AudioRecorder from './AudioRecorder';

export default function RichTextEditor({ value, onChangeText, placeholder, onAudioRecorded }) {
  const { theme } = useTheme();
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false
  });
  const textInputRef = useRef(null);

  if (!theme) return null;

  const toggleFormat = (format) => {
    const { start, end } = selection;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      // Wrap selected text
      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);
      let newText = '';
      
      if (format === 'bold') {
        newText = beforeText + '**' + selectedText + '**' + afterText;
      } else if (format === 'italic') {
        newText = beforeText + '*' + selectedText + '*' + afterText;
      }
      
      onChangeText(newText);
    } else {
      // Toggle state and insert appropriate markers
      const isActive = activeFormats[format];
      const beforeText = value.substring(0, start);
      const afterText = value.substring(start);
      
      if (!isActive) {
        // Turn on: insert opening markers
        if (format === 'bold') {
          onChangeText(beforeText + '**' + afterText);
        } else if (format === 'italic') {
          onChangeText(beforeText + '*' + afterText);
        }
      } else {
        // Turn off: only insert closing markers if there's content after the opening markers
        const marker = format === 'bold' ? '**' : '*';
        const lastMarkerIndex = beforeText.lastIndexOf(marker);
        
        if (lastMarkerIndex !== -1 && start > lastMarkerIndex + marker.length) {
          // There's content between markers, add closing marker
          if (format === 'bold') {
            onChangeText(beforeText + '**' + afterText);
          } else if (format === 'italic') {
            onChangeText(beforeText + '*' + afterText);
          }
        }
      }
      
      setActiveFormats(prev => ({
        ...prev,
        [format]: !prev[format]
      }));
    }
  };

  const insertHeader = () => {
    const { start } = selection;
    const beforeText = value.substring(0, start);
    const lineStart = beforeText.lastIndexOf('\n') + 1;
    const lineEnd = value.indexOf('\n', start);
    const currentLine = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);
    
    if (!currentLine.startsWith('# ')) {
      const newText = beforeText.substring(0, lineStart) + '# ' + currentLine + (lineEnd === -1 ? '' : value.substring(lineEnd));
      onChangeText(newText);
    }
  };

  const insertBullet = () => {
    const { start } = selection;
    const beforeText = value.substring(0, start);
    const afterText = value.substring(start);
    const newText = beforeText + '\n• ' + afterText;
    onChangeText(newText);
    
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.setNativeProps({
          selection: { start: start + 3, end: start + 3 }
        });
      }
    }, 10);
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={[styles.toolButton, activeFormats.bold && { backgroundColor: theme.accent }]}
          onPress={() => toggleFormat('bold')}
        >
          <Text style={[styles.toolButtonText, { color: activeFormats.bold ? theme.surface : theme.text }]}>B</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toolButton, activeFormats.italic && { backgroundColor: theme.accent }]}
          onPress={() => toggleFormat('italic')}
        >
          <Text style={[styles.toolButtonTextItalic, { color: activeFormats.italic ? theme.surface : theme.text }]}>I</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={insertHeader}
        >
          <Text style={[styles.toolButtonText, { color: theme.text }]}>H</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={insertBullet}
        >
          <Ionicons name="list" size={16} color={theme.text} />
        </TouchableOpacity>
        <AudioRecorder onAudioRecorded={onAudioRecorded} />
      </View>
      
      <TextInput
        ref={textInputRef}
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor={theme.textLight}
        value={value}
        onChangeText={onChangeText}
        onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
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