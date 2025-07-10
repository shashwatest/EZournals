import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPredefinedTags, getUserTags, saveUserTag, getTagColor } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

export default function TagInput({ selectedTags, onTagsChange }) {
  const { theme } = useTheme();
  const [predefinedTags, setPredefinedTags] = useState([]);
  const [userTags, setUserTags] = useState([]);

  if (!theme) return null;


  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setPredefinedTags(getPredefinedTags());
    const tags = await getUserTags();
    setUserTags(tags);
  };

  const addTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tag) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };



  const allTags = [...predefinedTags.map(t => t.name), ...userTags];

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tags</Text>
      
      {selectedTags.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedTags}>
          {selectedTags.map(tag => (
            <TouchableOpacity key={tag} style={[styles.selectedTag, { backgroundColor: getTagColor(tag) }]} onPress={() => removeTag(tag)}>
              <Text style={styles.selectedTagText}>{tag}</Text>
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsList}>
        {allTags.filter(tag => !selectedTags.includes(tag)).map(tag => (
          <TouchableOpacity key={tag} style={[styles.tag, { borderColor: getTagColor(tag) }]} onPress={() => addTag(tag)}>
            <Text style={[styles.tagText, { color: getTagColor(tag) }]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>


    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8
  },
  selectedTags: {
    marginBottom: 8
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4
  },
  selectedTagText: {
    color: 'white',
    fontSize: 14,
    marginRight: 4,
    fontWeight: '500'
  },
  tagsList: {
    marginBottom: 8
  },
  tag: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500'
  },

});