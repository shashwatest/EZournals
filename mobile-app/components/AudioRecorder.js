import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useTheme } from '../contexts/ThemeContext';
import { showAlert } from '../utils/appAlert';

export default function AudioRecorder({ onAudioRecorded }) {
  const { theme } = useTheme();
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  if (!theme) return null;

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        await showAlert({ title: 'Permission Required', message: 'Please grant microphone permission to record audio' });
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      await showAlert({ title: 'Error', message: 'Failed to start recording', confirmTone: 'danger' });
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri && onAudioRecorded) {
        onAudioRecorded(uri);
      }
      
      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
      await showAlert({ title: 'Error', message: 'Failed to stop recording', confirmTone: 'danger' });
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recordingButton]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Ionicons 
          name={isRecording ? "stop" : "mic"} 
          size={20} 
          color={isRecording ? theme.surface : theme.text} 
        />
      </TouchableOpacity>
      {isRecording && (
        <Text style={styles.recordingText}>Recording...</Text>
      )}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8
  },
  recordButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border
  },
  recordingButton: {
    backgroundColor: theme.danger
  },
  recordingText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.danger,
    fontWeight: '500'
  }
});
