import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function RichTextRenderer({ content, style }) {
  const { theme } = useTheme();

  if (!theme || !content) return null;

  const parseText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      // Handle headers
      if (line.startsWith('# ')) {
        return (
          <Text key={lineIndex} style={[style, { color: theme.text, fontSize: 24, fontWeight: 'bold' }]}>
            {line.substring(2)}
            {lineIndex < lines.length - 1 && '\n'}
          </Text>
        );
      }
      
      // Handle bullet points
      if (line.startsWith('• ')) {
        return (
          <Text key={lineIndex} style={[style, { color: theme.text }]}>
            {line}
            {lineIndex < lines.length - 1 && '\n'}
          </Text>
        );
      }

      const parts = [];
      let currentIndex = 0;
      let partIndex = 0;

      // Handle bold text **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      let boldMatch;
      
      while ((boldMatch = boldRegex.exec(line)) !== null) {
        if (boldMatch.index > currentIndex) {
          parts.push(
            <Text key={partIndex++} style={[style, { color: theme.text }]}>
              {line.substring(currentIndex, boldMatch.index)}
            </Text>
          );
        }
        
        parts.push(
          <Text key={partIndex++} style={[style, { color: theme.text, fontWeight: 'bold' }]}>
            {boldMatch[1]}
          </Text>
        );
        
        currentIndex = boldMatch.index + boldMatch[0].length;
      }

      // Handle italic text *text*
      const remainingText = line.substring(currentIndex);
      const italicRegex = /\*(.*?)\*/g;
      let italicMatch;
      let italicCurrentIndex = 0;

      while ((italicMatch = italicRegex.exec(remainingText)) !== null) {
        if (italicMatch.index > italicCurrentIndex) {
          parts.push(
            <Text key={partIndex++} style={[style, { color: theme.text }]}>
              {remainingText.substring(italicCurrentIndex, italicMatch.index)}
            </Text>
          );
        }
        
        parts.push(
          <Text key={partIndex++} style={[style, { color: theme.text, fontStyle: 'italic' }]}>
            {italicMatch[1]}
          </Text>
        );
        
        italicCurrentIndex = italicMatch.index + italicMatch[0].length;
      }

      if (italicCurrentIndex < remainingText.length) {
        parts.push(
          <Text key={partIndex++} style={[style, { color: theme.text }]}>
            {remainingText.substring(italicCurrentIndex)}
          </Text>
        );
      }

      if (parts.length === 0) {
        parts.push(
          <Text key={partIndex++} style={[style, { color: theme.text }]}>
            {line}
          </Text>
        );
      }

      return (
        <Text key={lineIndex} style={[style, { color: theme.text }]}>
          {parts}
          {lineIndex < lines.length - 1 && '\n'}
        </Text>
      );
    });
  };

  return <View>{parseText(content)}</View>;
}