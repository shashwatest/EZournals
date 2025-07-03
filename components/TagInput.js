import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPredefinedTags, getUserTags, saveUserTag, getTagColor } from '../utils/storage';
import { theme } from '../styles/theme';

export default function TagInput({ selectedTags, onTagsChange }) {
  const [predefinedTags, setPredefinedTags] = useState([]);
  const [userTags, setUserTags] = useState([]);


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

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm
  },
  selectedTags: {
    marginBottom: theme.spacing.sm
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs
  },
  selectedTagText: {
    color: 'white',
    fontSize: 14,
    marginRight: theme.spacing.xs,
    fontWeight: '500'
  },
  tagsList: {
    marginBottom: theme.spacing.sm
  },
  tag: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500'
  },

});