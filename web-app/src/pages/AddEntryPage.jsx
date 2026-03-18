import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Save, Tag, Image as ImageIcon, MapPin, Mic, Clock, X, Sparkles, Loader } from 'lucide-react';
import { uploadImage, uploadAudio } from '../utils/mediaUpload';
import { getPredefinedTags } from '../utils/entryUtils';
import { isAIEnabled, getAISettings } from '../utils/aiSettings';
import { detectMoodTags } from '../utils/geminiService';

export default function AddEntryPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [eventTime, setEventTime] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [detectingMood, setDetectingMood] = useState(false);

  const predefinedTags = getPredefinedTags();

  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = () => {
    try {
      const enabled = isAIEnabled();
      const settings = getAISettings();
      setAiEnabled(enabled && settings.features.moodDetection);
    } catch (error) {
      console.error('Error checking AI status:', error);
    }
  };

  const handleDetectMood = async () => {
    if (!content.trim()) {
      alert('Please write something before detecting mood');
      return;
    }

    setDetectingMood(true);
    try {
      const suggestedTags = await detectMoodTags(content);
      
      // Add suggested tags that aren't already selected
      const newTags = [...tags];
      suggestedTags.forEach(tag => {
        if (!newTags.includes(tag)) {
          newTags.push(tag);
        }
      });
      
      setTags(newTags);
      alert(`Mood detected! Added tags: ${suggestedTags.join(', ')}`);
    } catch (error) {
      console.error('Mood detection error:', error);
      alert(`Mood Detection Failed: ${error.message}`);
    } finally {
      setDetectingMood(false);
    }
  };

  const handleContentChange = (e) => {
    const text = e.target.value;
    setContent(text);
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addPresetTag = (tagName) => {
    if (!tags.includes(tagName)) {
      setTags([...tags, tagName]);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Failed to get location');
        setGettingLocation(false);
      }
    );
  };

  const removeLocation = () => {
    setLocation(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioFile(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks(chunks);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const removeAudio = () => {
    setAudioFile(null);
    setAudioChunks([]);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      alert('Please write something before saving');
      return;
    }
    
    setSaving(true);
    try {
      let imageUrl = null;
      let audioUrl = null;

      // Upload image if exists
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Warning: Failed to upload image, but entry will be saved');
        }
      }

      // Upload audio if exists
      if (audioFile) {
        try {
          audioUrl = await uploadAudio(audioFile);
        } catch (error) {
          console.error('Error uploading audio:', error);
          alert('Warning: Failed to upload audio, but entry will be saved');
        }
      }

      const entry = {
        content,
        tags,
        date: new Date().toISOString(),
        userId: user.uid,
        updatedAt: new Date().toISOString(),
        imageUrl,
        audioUrl,
        location,
        eventTime: eventTime || null,
      };
      
      await addDoc(collection(db, 'entries'), entry);
      
      // Also save to local storage for offline access
      try {
        const localEntries = JSON.parse(localStorage.getItem('journal_entries') || '[]');
        localEntries.unshift({ ...entry, id: Date.now().toString() });
        localStorage.setItem('journal_entries', JSON.stringify(localEntries));
      } catch (e) {
        console.error('Error saving to local storage:', e);
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const styles = {
    container: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.background,
    },
    header: {
      padding: '24px 32px',
      borderBottom: `1px solid ${theme.border}`,
      backgroundColor: theme.surface,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      color: theme.text,
      cursor: 'pointer',
      fontSize: '16px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: theme.text,
    },
    saveButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      backgroundColor: content.trim() ? theme.accent : theme.border,
      color: '#fff',
      fontSize: '16px',
      fontWeight: '600',
      cursor: content.trim() ? 'pointer' : 'not-allowed',
    },
    content: {
      flex: 1,
      overflow: 'auto',
      padding: '32px',
    },
    form: {
      maxWidth: '900px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    editorCard: {
      backgroundColor: theme.surface,
      borderRadius: '16px',
      border: `1px solid ${theme.border}`,
      padding: '24px',
      boxShadow: `0 0 10px ${theme.border}`,
    },
    textarea: {
      width: '100%',
      minHeight: '400px',
      padding: '0',
      border: 'none',
      backgroundColor: 'transparent',
      color: theme.text,
      fontSize: '17px',
      lineHeight: '1.6',
      resize: 'vertical',
      outline: 'none',
      fontFamily: 'inherit',
    },
    toolbar: {
      display: 'flex',
      gap: '12px',
      paddingBottom: '16px',
      marginBottom: '16px',
      borderBottom: `1px solid ${theme.border}`,
    },
    toolButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 12px',
      borderRadius: '8px',
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.background,
      color: theme.text,
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    toolButtonActive: {
      backgroundColor: theme.accent,
      color: '#fff',
      borderColor: theme.accent,
    },
    metaCard: {
      backgroundColor: theme.surface,
      borderRadius: '16px',
      border: `1px solid ${theme.border}`,
      padding: '24px',
      boxShadow: `0 0 10px ${theme.border}`,
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    tagInputContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      padding: '12px',
      borderRadius: '12px',
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.background,
      minHeight: '48px',
      marginBottom: '20px',
    },
    presetTagsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginBottom: '16px',
    },
    presetTag: {
      padding: '8px 16px',
      borderRadius: '20px',
      border: '2px solid',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    tag: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '8px',
      backgroundColor: `${theme.accent}20`,
      color: theme.accent,
      fontSize: '14px',
      fontWeight: '500',
    },
    tagRemove: {
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
    },
    tagInput: {
      flex: 1,
      minWidth: '120px',
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      color: theme.text,
      fontSize: '14px',
    },
    attachmentSection: {
      marginBottom: '20px',
    },
    attachmentGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '12px',
    },
    attachmentCard: {
      position: 'relative',
      padding: '16px',
      borderRadius: '12px',
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.background,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    removeButton: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: theme.danger,
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
    },
    imagePreview: {
      width: '100%',
      maxHeight: '200px',
      objectFit: 'cover',
      borderRadius: '8px',
      marginBottom: '8px',
    },
    eventTimeInput: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.background,
      color: theme.text,
      fontSize: '14px',
      marginBottom: '20px',
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '16px',
      marginTop: '16px',
      borderTop: `1px solid ${theme.border}`,
    },
    wordCount: {
      fontSize: '14px',
      color: theme.textSecondary,
      fontWeight: '500',
    },
    timestamp: {
      fontSize: '14px',
      color: theme.textLight,
    },
    hiddenInput: {
      display: 'none',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backButton} onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 style={styles.title}>New Entry</h1>
        </div>
        <button 
          style={styles.saveButton} 
          onClick={handleSave} 
          disabled={!content.trim() || saving}
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Entry'}
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.form}>
          <div style={styles.editorCard}>
            <div style={styles.toolbar}>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                style={styles.hiddenInput}
                onChange={handleImageSelect}
              />
              <button
                style={styles.toolButton}
                onClick={() => document.getElementById('image-upload').click()}
                title="Add Image"
              >
                <ImageIcon size={16} />
                Image
              </button>

              <button
                style={styles.toolButton}
                onClick={gettingLocation ? null : getLocation}
                disabled={gettingLocation}
                title="Add Location"
              >
                <MapPin size={16} />
                {gettingLocation ? 'Getting...' : 'Location'}
              </button>

              <button
                style={{
                  ...styles.toolButton,
                  ...(isRecording ? styles.toolButtonActive : {}),
                }}
                onClick={isRecording ? stopRecording : startRecording}
                title={isRecording ? 'Stop Recording' : 'Record Audio'}
              >
                <Mic size={16} />
                {isRecording ? 'Stop' : 'Audio'}
              </button>
            </div>

            <textarea
              style={styles.textarea}
              placeholder="What's on your mind?"
              value={content}
              onChange={handleContentChange}
              autoFocus
            />
          </div>

          <div style={styles.metaCard}>
            <div style={styles.sectionTitle}>
              <Tag size={16} />
              Tags & Mood
            </div>
            
            <div style={styles.presetTagsContainer}>
              {predefinedTags.map(tag => (
                <button
                  key={tag.name}
                  style={{
                    ...styles.presetTag,
                    backgroundColor: tags.includes(tag.name) ? tag.color : `${tag.color}30`,
                    color: tags.includes(tag.name) ? '#fff' : tag.color,
                    borderColor: tag.color,
                  }}
                  onClick={() => addPresetTag(tag.name)}
                >
                  {tag.name}
                </button>
              ))}
            </div>

            <div style={styles.tagInputContainer}>
              {tags.map((tag, index) => (
                <span key={index} style={styles.tag}>
                  {tag}
                  <span 
                    style={styles.tagRemove} 
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </span>
                </span>
              ))}
              <input
                type="text"
                style={styles.tagInput}
                placeholder="Add tags (press Enter or comma)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>

            {/* AI Mood Detection Button */}
            {aiEnabled && (
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  marginTop: '12px',
                  marginBottom: '20px',
                  backgroundColor: theme.accent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: detectingMood ? 'not-allowed' : 'pointer',
                  opacity: detectingMood ? 0.7 : 1,
                  width: '100%',
                }}
                onClick={handleDetectMood}
                disabled={detectingMood}
              >
                {detectingMood ? (
                  <>
                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Detecting Mood...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    AI Detect Mood
                  </>
                )}
              </button>
            )}

            <div style={styles.sectionTitle}>
              <Clock size={16} />
              Event Time (Optional)
            </div>
            <input
              type="datetime-local"
              style={styles.eventTimeInput}
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
            />

            {(imagePreview || location || audioFile) && (
              <div style={styles.attachmentSection}>
                <div style={styles.sectionTitle}>Attachments</div>
                <div style={styles.attachmentGrid}>
                  {imagePreview && (
                    <div style={styles.attachmentCard}>
                      <button style={styles.removeButton} onClick={removeImage}>
                        <X size={14} />
                      </button>
                      <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
                      <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                        <ImageIcon size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Image attached
                      </div>
                    </div>
                  )}

                  {location && (
                    <div style={styles.attachmentCard}>
                      <button style={styles.removeButton} onClick={removeLocation}>
                        <X size={14} />
                      </button>
                      <MapPin size={20} color={theme.accent} />
                      <div>
                        <div style={{ fontSize: '14px', color: theme.text, fontWeight: '500' }}>
                          Location
                        </div>
                        <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  )}

                  {audioFile && (
                    <div style={styles.attachmentCard}>
                      <button style={styles.removeButton} onClick={removeAudio}>
                        <X size={14} />
                      </button>
                      <Mic size={20} color={theme.accent} />
                      <div>
                        <div style={{ fontSize: '14px', color: theme.text, fontWeight: '500' }}>
                          Audio Recording
                        </div>
                        <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                          {(audioFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={styles.footer}>
              <div style={styles.wordCount}>
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </div>
              <div style={styles.timestamp}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
