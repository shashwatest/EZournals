import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useUISettings } from '../contexts/UISettingsContext';
import { getTagColor } from '../../backend/utils/storage';
import RichTextRenderer from './RichTextRenderer';
import GlassButton from './GlassButton';

import { Platform } from 'react-native';

import { Animated } from 'react-native';

export default function EntryCard({ entry, onPress, onDelete }) {
  const { theme } = useTheme();
  const { settings, getFontSizes, getFontFamily, getSpacing } = useUISettings();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const isInteracting = isHovered || isPressed;
    const targetScale = isInteracting
      ? (theme.is3D ? 1.03 : 1.01)
      : 1;

    Animated.timing(scaleAnim, {
      toValue: targetScale,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [isHovered, isPressed, theme.is3D]);
  
  if (!theme) return null;

  const handleMouseEnter = () => {
    if (Platform.OS === 'web') setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (Platform.OS === 'web') setIsHovered(false);
  };

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);
  
  const fontSizes = getFontSizes();
  const fontFamily = getFontFamily();
  const spacing = getSpacing();
  
  const screenWidth = Dimensions.get('window').width;
  const isGrid = settings.cardLayout === 'grid';
  const cardWidth = isGrid ? (screenWidth - 48) / 2 : screenWidth - 32; // 48 = margins + padding for grid, 32 for list
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today, ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday, ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
             ', ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
  };

  const getEventTimeText = (eventTime) => {
    return eventTime || null;
  };

  const getGradientColors = () => {
    if (!entry.tags || entry.tags.length === 0) {
      return null;
    }
    
    const colors = entry.tags.slice(0, 2).map(tag => getTagColor(tag));
    if (colors.length === 1) {
      colors.push(colors[0] + '80');
    }
    return colors;
  };

  const gradientColors = getGradientColors();

  const styles = createStyles(theme, fontSizes, fontFamily, spacing, settings, isGrid, cardWidth);
  
  const isInteracting = isHovered || isPressed;

  const hoverStyles = isInteracting ? {
    shadowOpacity: theme.is3D ? 0.2 : 0.15,
    shadowOffset: theme.is3D ? { width: 0, height: 8 } : { width: 0, height: 4 },
    shadowRadius: theme.is3D ? 16 : 8,
    backgroundColor: theme.is3D ? theme.surfaceHover : undefined
  } : {};

  const CardWrapper = gradientColors ? LinearGradient : View;
  const cardProps = gradientColors ? {
    colors: gradientColors,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    style: [styles.card, hoverStyles]
  } : { style: [styles.plainCard, hoverStyles] };

  const webProps = Platform.OS === 'web' ? {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  } : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      {...webProps}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <CardWrapper {...cardProps}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.date}>{formatDate(entry.date)}</Text>
          {entry.eventTime && (
            <Text style={styles.eventTime}>{getEventTimeText(entry.eventTime)}</Text>
          )}
          {entry.timeRange && (
            <Text style={styles.timeRange}>
              {entry.timeRange.start} - {entry.timeRange.end}
            </Text>
          )}
        </View>
        <View style={styles.deleteButton}>
          <GlassButton
            isIconButton={true}
            icon={<Ionicons name="trash-outline" size={18} color={theme.danger} />}
            onPress={onDelete}
          />
        </View>
      </View>
      
      <View style={styles.previewContainer}>
        <RichTextRenderer 
          content={entry.content.substring(0, isGrid ? 80 : 200) + (entry.content.length > (isGrid ? 80 : 200) ? '...' : '')} 
          style={styles.preview} 
        />
      </View>
      </CardWrapper>
      </Animated.View>
    </TouchableOpacity>
  );
}

const createStyles = (theme, fontSizes, fontFamily, spacing, settings, isGrid, cardWidth) => StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    marginHorizontal: isGrid ? 8 : 16,
    marginBottom: isGrid ? 12 : 16,
    padding: isGrid ? 16 : spacing.padding,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: isGrid ? cardWidth : undefined,
    minHeight: isGrid ? cardWidth * 0.8 : undefined
  },
  plainCard: {
    backgroundColor: theme.surface,
    marginHorizontal: isGrid ? 8 : 16,
    marginBottom: isGrid ? 12 : 16,
    padding: isGrid ? 16 : spacing.padding,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: isGrid ? cardWidth : undefined,
    minHeight: isGrid ? cardWidth * 0.8 : undefined
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  date: {
    fontSize: fontSizes.subtitle,
    color: theme.textSecondary,
    fontWeight: '500',
    fontFamily: fontFamily
  },
  eventTime: {
    fontSize: fontSizes.subtitle * 0.85,
    color: theme.accent,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: fontFamily
  },
  timeRange: {
    fontSize: fontSizes.subtitle * 0.85,
    color: theme.success,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: fontFamily
  },
  tagsContainer: {
    marginBottom: 8
  },
  tag: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    borderWidth: 1
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500'
  },
  deleteButton: {
    padding: 4
  },
  previewContainer: {
    flex: isGrid ? 1 : undefined,
    marginBottom: isGrid ? 0 : 16
  },
  preview: {
    fontSize: isGrid ? fontSizes.base * 0.85 : fontSizes.base,
    lineHeight: isGrid ? fontSizes.base * 1.3 : fontSizes.base * spacing.text,
    color: theme.text,
    fontFamily: fontFamily
  },
  headerContent: {
    flex: 1
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 8
  },
  wordCount: {
    fontSize: 12,
    color: theme.textLight,
    textAlign: 'right'
  }
});