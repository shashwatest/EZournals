import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useTheme } from '../contexts/ThemeContext';

export default function AudioPlayer({ audioUri }) {
  const { theme } = useTheme();
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  if (!theme) return null;

  useEffect(() => {
    return player
      ? () => {
          player.unloadAsync();
        }
      : undefined;
  }, [player]);

  const playPauseAudio = async () => {
    try {
      if (player) {
        if (isPlaying) {
          await player.pauseAsync();
          setIsPlaying(false);
        } else {
          await player.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        
        setPlayer(newSound);
        setIsPlaying(true);
        
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setDuration(status.durationMillis || 0);
            setPosition(status.positionMillis || 0);
            
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const formatTime = (millis) => {
    const seconds = Math.floor(millis / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.playButton} onPress={playPauseAudio}>
        <Ionicons 
          name={isPlaying ? "pause" : "play"} 
          size={16} 
          color={theme.surface} 
        />
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={styles.timeText}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progress, 
              { width: duration > 0 ? `${(position / duration) * 100}%` : '0%' }
            ]} 
          />
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  playButton: {
    backgroundColor: theme.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  info: {
    flex: 1,
    marginLeft: 12
  },
  timeText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.border,
    borderRadius: 2
  },
  progress: {
    height: 4,
    backgroundColor: theme.accent,
    borderRadius: 2
  }
});