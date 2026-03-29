import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Save, Tag as TagIcon, Image as ImageIcon, MapPin, Mic, Clock, X, Sparkles, Loader } from 'lucide-react';
import { uploadImage, uploadAudio } from '../utils/mediaUpload';
import { getPredefinedTags } from '../utils/entryUtils';
import { isAIEnabled, getAISettings } from '../utils/aiSettings';
import { detectMoodTags } from '../utils/geminiService';
import { showAlert } from '../utils/appAlert';
import { getMoodTags } from '../utils/moodTags';

export default function EditEntryPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [eventTime, setEventTime] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [existingAudioUrl, setExistingAudioUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [detectingMood, setDetectingMood] = useState(false);
  const [predefinedTags, setPredefinedTags] = useState([]);
  const accentText = theme.onAccentText || '#fff';

  useEffect(() => {
    loadEntry();
    checkAIStatus();
    getMoodTags().then(setPredefinedTags);
  }, [id, user]);

  const checkAIStatus = () => {
    try {
      const enabled = isAIEnabled();
      const settings = getAISettings();
      setAiEnabled(enabled && settings.features.moodDetection);
    } catch (error) {
      console.error('Error checking AI status:', error);
    }
  };

  const loadEntry = async () => {
    if (!user || !id) return;

    try {
      const entryDoc = await getDoc(doc(db, 'entries', id));
      if (entryDoc.exists()) {
        const data = entryDoc.data();
        setContent(data.content || '');
        setTags(data.tags || []);
        setExistingImageUrl(data.imageUrl || null);
        setExistingAudioUrl(data.audioUrl || null);
        setLocation(data.location || null);
        setEventTime(data.eventTime || '');
      }
    } catch (error) {
      console.error('Error loading entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      await showAlert({ title: 'Empty Entry', message: 'Please enter some content' });
      return;
    }

    if (content.length > 50000) {
      await showAlert({ title: 'Entry Too Long', message: 'Your entry exceeds the maximum allowed length (50,000 characters). Please condense it before saving.', confirmTone: 'danger' });
      return;
    }

    setSaving(true);
    try {
      let imageUrl = existingImageUrl;
      let audioUrl = existingAudioUrl;

      // Upload new image if selected
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (error) {
          console.error('Error uploading image:', error);
          await showAlert({ title: 'Warning', message: 'Failed to upload image, but entry will be saved', confirmTone: 'danger' });
        }
      }

      // Upload new audio if recorded
      if (audioFile) {
        try {
          audioUrl = await uploadAudio(audioFile);
        } catch (error) {
          console.error('Error uploading audio:', error);
          await showAlert({ title: 'Warning', message: 'Failed to upload audio, but entry will be saved', confirmTone: 'danger' });
        }
      }

      await updateDoc(doc(db, 'entries', id), {
        content,
        tags,
        imageUrl,
        audioUrl,
        location,
        eventTime: eventTime || null,
        updatedAt: Date.now()
      });
      navigate(`/entry/${id}`);
    } catch (error) {
      console.error('Error updating entry:', error);
      await showAlert({ title: 'Update Failed', message: 'Failed to update entry', confirmTone: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const addTag = (tagName) => {
    if (!tags.includes(tagName)) {
      setTags([...tags, tagName]);
    }
  };

  const removeTag = (tagName) => {
    setTags(tags.filter(t => t !== tagName));
  };

  const addCustomTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleDetectMood = async () => {
    if (!content.trim()) {
      await showAlert({ title: 'No Content', message: 'Please write something before detecting mood' });
      return;
    }

    setDetectingMood(true);
    try {
      const suggestedTags = await detectMoodTags(content);
      const newTags = [...tags];
      suggestedTags.forEach(tag => {
        if (!newTags.includes(tag)) {
          newTags.push(tag);
        }
      });
      setTags(newTags);
      await showAlert({ title: 'Mood Detected', message: `Added tags: ${suggestedTags.join(', ')}` });
    } catch (error) {
      console.error('Mood detection error:', error);
      await showAlert({ title: 'Mood Detection Failed', message: error.message, confirmTone: 'danger' });
    } finally {
      setDetectingMood(false);
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
    setExistingImageUrl(null);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      showAlert({ title: 'Location Unavailable', message: 'Geolocation is not supported by your browser' });
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
        showAlert({ title: 'Location Failed', message: 'Failed to get location', confirmTone: 'danger' });
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
    } catch (error) {
      console.error('Error starting recording:', error);
      showAlert({ title: 'Recording Failed', message: 'Failed to start recording. Please check microphone permissions.', confirmTone: 'danger' });
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
    setExistingAudioUrl(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

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
      alignItems: 'center',
      justifyContent: 'space-between',
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
    headerTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: theme.text,
    },
    saveButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: theme.accent,
      color: accentText,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
    content: {
      flex: 1,
      overflow: 'auto',
      padding: '32px',
    },
    innerContent: {
      maxWidth: '800px',
      margin: '0 auto',
    },
    textarea: {
      width: '100%',
      minHeight: '400px',
      padding: '24px',
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      backgroundColor: theme.surface,
      color: theme.text,
      fontSize: '16px',
      lineHeight: '1.8',
      resize: 'vertical',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    },
    toolbar: {
      display: 'flex',
      gap: '12px',
      marginBottom: '16px',
      paddingBottom: '16px',
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
    tagsSection: {
      marginTop: '24px',
      padding: '24px',
      backgroundColor: theme.surface,
      borderRadius: '12px',
      border: `1px solid ${theme.border}`,
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: theme.text,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    predefinedTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginBottom: '16px',
    },
    tagButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: `1px solid ${theme.border}`,
      backgroundColor: 'transparent',
      color: theme.text,
      cursor: 'pointer',
      fontSize: '14px',
    },
    tagButtonActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
      color: accentText,
    },
    customTagInput: {
      display: 'flex',
      gap: '8px',
      marginTop: '16px',
    },
    input: {
      flex: 1,
      padding: '8px 12px',
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      backgroundColor: theme.background,
      color: theme.text,
      fontSize: '14px',
    },
    addButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: theme.accent,
      color: accentText,
      cursor: 'pointer',
      fontSize: '14px',
    },
    selectedTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: `1px solid ${theme.border}`,
    },
    selectedTag: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      borderRadius: '8px',
      backgroundColor: `${theme.accent}20`,
      color: theme.accent,
      fontSize: '14px',
    },
    removeButton: {
      background: 'none',
      border: 'none',
      color: theme.danger,
      cursor: 'pointer',
      padding: '0',
      fontSize: '16px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backButton} onClick={() => navigate(`/entry/${id}`)}>
            <ArrowLeft size={20} />
            Back
          </button>
          <span style={styles.headerTitle}>Edit Entry</span>
        </div>
        <button style={styles.saveButton} onClick={handleSave} disabled={saving}>
          <Save size={16} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.innerContent}>
          <div style={styles.toolbar}>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              style={{ display: 'none' }}
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
                ...(isRecording ? { backgroundColor: theme.accent, color: accentText } : {}),
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
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts..."
          />

          {(imagePreview || existingImageUrl || location || audioFile || existingAudioUrl || eventTime) && (
            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: theme.background, borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '12px' }}>
                Attachments
              </div>
              
              {(imagePreview || existingImageUrl) && (
                <div style={{ marginBottom: '16px', position: 'relative' }}>
                  <button
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: theme.danger,
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                    }}
                    onClick={removeImage}
                  >
                    <X size={16} />
                  </button>
                  <img 
                    src={imagePreview || existingImageUrl} 
                    alt="Preview" 
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }} 
                  />
                </div>
              )}

              {location && (
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: theme.surface, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color={theme.accent} />
                    <div>
                      <div style={{ fontSize: '14px', color: theme.text, fontWeight: '500' }}>Location</div>
                      <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </div>
                    </div>
                  </div>
                  <button
                    style={{
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
                    }}
                    onClick={removeLocation}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {(audioFile || existingAudioUrl) && (
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: theme.surface, borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mic size={16} color={theme.accent} />
                      <span style={{ fontSize: '14px', color: theme.text, fontWeight: '500' }}>Audio Recording</span>
                    </div>
                    <button
                      style={{
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
                      }}
                      onClick={removeAudio}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {existingAudioUrl && !audioFile && (
                    <audio controls style={{ width: '100%' }}>
                      <source src={existingAudioUrl} type="audio/webm" />
                    </audio>
                  )}
                  {audioFile && (
                    <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                      New recording: {(audioFile.size / 1024).toFixed(1)} KB
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={styles.tagsSection}>
            <div style={styles.sectionTitle}>
              <TagIcon size={18} />
              Tags
            </div>

            <div style={styles.predefinedTags}>
              {predefinedTags.map(tag => (
                <button
                  key={tag.name}
                  style={{
                    ...styles.tagButton,
                    ...(tags.includes(tag.name) ? styles.tagButtonActive : {})
                  }}
                  onClick={() => tags.includes(tag.name) ? removeTag(tag.name) : addTag(tag.name)}
                >
                  {tag.name}
                </button>
              ))}
            </div>

            <div style={styles.customTagInput}>
              <input
                type="text"
                style={styles.input}
                placeholder="Add custom tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
              />
              <button style={styles.addButton} onClick={addCustomTag}>
                Add
              </button>
            </div>

            {aiEnabled && (
              <button
                style={{
                  ...styles.addButton,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  marginTop: '12px',
                  opacity: detectingMood ? 0.7 : 1,
                  cursor: detectingMood ? 'not-allowed' : 'pointer',
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

            {tags.length > 0 && (
              <div style={styles.selectedTags}>
                {tags.map(tag => (
                  <div key={tag} style={styles.selectedTag}>
                    <span>{tag}</span>
                    <button style={styles.removeButton} onClick={() => removeTag(tag)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: '24px', padding: '24px', backgroundColor: theme.surface, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
            <div style={styles.sectionTitle}>
              <Clock size={18} />
              Event Time (Optional)
            </div>
            <input
              type="datetime-local"
              style={styles.input}
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
