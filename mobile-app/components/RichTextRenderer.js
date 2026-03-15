import React from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function RichTextRenderer({ content, style }) {
  const { theme } = useTheme();
  const { getFontFamily, getFontSizes } = require('../contexts/UISettingsContext').useUISettings();
  const fontFamily = getFontFamily();
  const fontSizes = getFontSizes();

  if (!theme || !content) return null;

  const parseText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      // Check if line has timestamp or time range markers
      const hasTimestamp = /<t:/.test(line);
      const hasTimeRange = /<r:/.test(line) || /<rs:/.test(line);
      
      const textColor = hasTimestamp ? theme.accent : 
                       hasTimeRange ? theme.primary : theme.text;
      
      // Get time value for clickability - simplified approach
      const timeMatch = line.match(/<([tr]):([^>]+)>/) || line.match(/<(rs):([^>]+)>/);
      const timeValue = timeMatch ? timeMatch[2] : null;
      const timeType = timeMatch ? timeMatch[1] : null;
      const isClickable = timeValue && (timeType === 't' || timeType === 'r' || timeType === 'rs');
      
      // Handle headers
      if (line.startsWith('# ')) {
        const headerText = line.substring(2).replace(/<[trs][^>]*>/g, '').replace(/<re>/g, '');
        const headerContent = (
          <Text style={[style, { 
            color: textColor, 
            fontSize: fontSizes.header, 
            fontWeight: 'bold',
            fontFamily
          }]}> 
            {headerText}
            {lineIndex < lines.length - 1 && '\n'}
          </Text>
        );
        
        if (isClickable) {
          return (
            <TouchableOpacity key={lineIndex} onPress={() => Alert.alert(timeType === 't' ? 'Timestamp' : 'Time Range', timeValue)}>
              {headerContent}
            </TouchableOpacity>
          );
        }
        return <View key={lineIndex}>{headerContent}</View>;
      }
      
      // Handle bullet points
      if (line.startsWith('• ')) {
        const bulletText = line.replace(/<[trs][^>]*>/g, '').replace(/<re>/g, '');
        const bulletContent = (
          <Text style={[style, { 
            color: textColor,
            fontFamily,
            fontSize: fontSizes.base
          }]}> 
            {bulletText}
            {lineIndex < lines.length - 1 && '\n'}
          </Text>
        );
        
        if (isClickable) {
          return (
            <TouchableOpacity key={lineIndex} onPress={() => Alert.alert(timeType === 't' ? 'Timestamp' : 'Time Range', timeValue)}>
              {bulletContent}
            </TouchableOpacity>
          );
        }
        return <View key={lineIndex}>{bulletContent}</View>;
      }

      const parts = [];
      let currentIndex = 0;
      let partIndex = 0;

      // Remove time markers from text but keep the content
      const cleanLine = line.replace(/<[trs][^>]*>/g, '').replace(/<re>/g, '');

      // Handle bold text **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      let boldMatch;
      
      while ((boldMatch = boldRegex.exec(cleanLine)) !== null) {
        if (boldMatch.index > currentIndex) {
          parts.push(
            <Text key={partIndex++} style={[style, { color: textColor, fontFamily, fontSize: fontSizes.base }]}> 
              {cleanLine.substring(currentIndex, boldMatch.index)}
            </Text>
          );
        }
        
        parts.push(
          <Text key={partIndex++} style={[style, { color: textColor, fontWeight: 'bold', fontFamily, fontSize: fontSizes.base }]}> 
            {boldMatch[1]}
          </Text>
        );
        
        currentIndex = boldMatch.index + boldMatch[0].length;
      }

      // Handle italic text *text*
      const remainingText = cleanLine.substring(currentIndex);
      const italicRegex = /\*(.*?)\*/g;
      let italicMatch;
      let italicCurrentIndex = 0;

      while ((italicMatch = italicRegex.exec(remainingText)) !== null) {
        if (italicMatch.index > italicCurrentIndex) {
          parts.push(
            <Text key={partIndex++} style={[style, { color: textColor, fontFamily, fontSize: fontSizes.base }]}> 
              {remainingText.substring(italicCurrentIndex, italicMatch.index)}
            </Text>
          );
        }
        
        parts.push(
          <Text key={partIndex++} style={[style, { color: textColor, fontStyle: 'italic', fontFamily, fontSize: fontSizes.base }]}> 
            {italicMatch[1]}
          </Text>
        );
        
        italicCurrentIndex = italicMatch.index + italicMatch[0].length;
      }

      if (italicCurrentIndex < remainingText.length) {
        parts.push(
            <Text key={partIndex++} style={[style, { color: textColor, fontFamily, fontSize: fontSizes.base }]}> 
            {remainingText.substring(italicCurrentIndex)}
          </Text>
        );
      }

      if (parts.length === 0) {
        parts.push(
          <Text key={partIndex++} style={[style, { color: textColor, fontFamily, fontSize: fontSizes.base }]}> 
            {cleanLine}
          </Text>
        );
      }

      const textContent = (
        <Text style={[style, { color: textColor, fontFamily, fontSize: fontSizes.base }]}> 
          {parts}
          {lineIndex < lines.length - 1 && '\n'}
        </Text>
      );

      if (isClickable) {
        return (
          <TouchableOpacity key={lineIndex} onPress={() => Alert.alert(timeType === 't' ? 'Timestamp' : 'Time Range', timeValue)}>
            {textContent}
          </TouchableOpacity>
        );
      }
      
      return <View key={lineIndex}>{textContent}</View>;
    });
  };

  return <View>{parseText(content)}</View>;
}