import React, { useState, useRef } from 'react';
import { Image, Modal } from 'react-native';
import { pickImage } from '../utils/media';
import { getCurrentLocation, formatLocation } from '../utils/location';
import { useUISettings } from '../contexts/UISettingsContext';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import AudioRecorder from './AudioRecorder';
import TimestampButton from './TimestampButton';
import TimeRangeButton from './TimeRangeButton';

export default function RichTextEditor({ value, onChangeText, placeholder, onAudioRecorded }) {
  const { theme } = useTheme();
  const { getFontFamily, getFontSizes } = useUISettings();
  const fontFamily = getFontFamily();
  const fontSizes = getFontSizes();
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false });
  const textInputRef = useRef(null);
  const [showAttach, setShowAttach] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeText, setRangeText] = useState('');
  const [lastTimeRange, setLastTimeRange] = useState(null);

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

  const insertTimestamp = (timestamp) => {
    const { start } = selection;
    const beforeText = value.substring(0, start);
    const afterText = value.substring(start);
    onChangeText(beforeText + timestamp + afterText);
  };

  const insertTimeRange = (timeRange) => {
    const { start } = selection;
    const beforeText = value.substring(0, start);
    const afterText = value.substring(start);
    onChangeText(beforeText + timeRange + afterText);
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={[styles.toolButton, activeFormats.bold && { backgroundColor: theme.accent }]}
          onPress={() => toggleFormat('bold')}
        >
          <Text style={[styles.toolButtonText, { color: activeFormats.bold ? theme.surface : theme.text, fontFamily, fontSize: fontSizes.base }]}>B</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toolButton, activeFormats.italic && { backgroundColor: theme.accent }]}
          onPress={() => toggleFormat('italic')}
        >
          <Text style={[styles.toolButtonTextItalic, { color: activeFormats.italic ? theme.surface : theme.text, fontFamily, fontSize: fontSizes.base }]}>I</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={insertHeader}
        >
          <Text style={[styles.toolButtonText, { color: theme.text, fontFamily, fontSize: fontSizes.base }]}>H</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={insertBullet}
        >
          <Ionicons name="list" size={16} color={theme.text} />
        </TouchableOpacity>
        {/* Time range toggle icon */}
        <TouchableOpacity style={styles.toolButton} onPress={() => {
          if (!tracking) {
            setRangeStart(new Date());
            setTracking(true);
            setRangeText('');
          } else {
            const endTime = new Date();
            const startTimeString = rangeStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTimeString = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            // Only wrap the text entered during tracking
            const trackedText = rangeText.trim();
            if (trackedText) {
              const timeRange = `<rs:${startTimeString}-${endTimeString}>${trackedText}<re>`;
              onChangeText(value + timeRange);
              setLastTimeRange({ start: startTimeString, end: endTimeString, text: trackedText });
            }
            setTracking(false);
            setRangeStart(null);
            setRangeText('');
          }
        }}>
          <Ionicons name="timer-outline" size={18} color={tracking ? theme.accent : theme.text} />
        </TouchableOpacity>
        {/* Attach icon clubs all features except time range */}
        <TouchableOpacity style={styles.toolButton} onPress={() => setShowAttach(true)}>
          <Ionicons name="attach-outline" size={18} color={theme.text} />
        </TouchableOpacity>
      </View>
      <TextInput
        ref={textInputRef}
        style={[styles.textInput, { fontFamily, fontSize: fontSizes.base }]}
        placeholder={placeholder}
        placeholderTextColor={theme.textLight}
        value={tracking ? rangeText : value}
        onChangeText={text => {
          if (tracking) {
            setRangeText(text);
          } else {
            onChangeText(text);
          }
        }}
        onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
        multiline
        textAlignVertical="top"
        selectionColor={theme.accent}
      />
      {/* Attach Modal */}
      <Modal visible={showAttach} transparent animationType="fade" onRequestClose={() => setShowAttach(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <View style={{ backgroundColor: theme.surface, borderRadius: 12, padding: 20, minWidth: 220 }}>
            <Text style={{ color: theme.text, fontFamily, fontSize: fontSizes.title, marginBottom: 12 }}>Attach</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              <TouchableOpacity style={{ alignItems: 'center', margin: 8 }} onPress={() => {
                setShowAttach(false);
                const now = new Date();
                const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const timestamp = `<t:${timeString}>`;
                onChangeText(value + timestamp);
              }}>
                <Ionicons name="time-outline" size={22} color={theme.text} />
                <Text style={{ color: theme.text, fontSize: 12, fontFamily }}>Timestamp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ alignItems: 'center', margin: 8 }} onPress={async () => {
                setShowAttach(false);
                try {
                  const uri = await pickImage();
                  setImageUri(uri);
                  if (onImageSelected) onImageSelected(uri);
                } catch (e) { Alert.alert('Error', e.message); }
              }}>
                <Ionicons name="image-outline" size={22} color={theme.text} />
                <Text style={{ color: theme.text, fontSize: 12, fontFamily }}>Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ alignItems: 'center', margin: 8 }} onPress={async () => {
                setShowAttach(false);
                try {
                  const loc = await getCurrentLocation();
                  setLocation(loc);
                  if (onLocationTagged) onLocationTagged(loc);
                } catch (e) { Alert.alert('Error', e.message); }
              }}>
                <Ionicons name="location-outline" size={22} color={theme.text} />
                <Text style={{ color: theme.text, fontSize: 12, fontFamily }}>Location</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ alignItems: 'center', margin: 8 }} onPress={() => { setShowAttach(false); }}>
                <Ionicons name="mic-outline" size={22} color={theme.text} />
                <AudioRecorder onAudioRecorded={onAudioRecorded} />
                <Text style={{ color: theme.text, fontSize: 12, fontFamily }}>Audio</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{ marginTop: 16, alignSelf: 'center' }} onPress={() => setShowAttach(false)}>
              <Text style={{ color: theme.accent, fontFamily, fontSize: fontSizes.base }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Preview attached image/location */}
      {lastTimeRange && (
        <View style={{ marginTop: 8, alignItems: 'center' }}>
          <Ionicons name="timer-outline" size={16} color={theme.accent} />
          <Text style={{ color: theme.textSecondary, fontSize: 12, fontFamily }}>Time Range: {lastTimeRange.start} - {lastTimeRange.end} ({lastTimeRange.text})</Text>
        </View>
      )}
      {imageUri && (
        <View style={{ marginTop: 12, alignItems: 'center' }}>
          <Image source={{ uri: imageUri }} style={{ width: 120, height: 120, borderRadius: 8 }} />
        </View>
      )}
      {location && location.coords && (
        <View style={{ marginTop: 8, alignItems: 'center' }}>
          <Text style={{ color: theme.textSecondary, fontSize: 12, fontFamily }}>Location: {formatLocation(location)}</Text>
        </View>
      )}
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
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 4
  },
  toolButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
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