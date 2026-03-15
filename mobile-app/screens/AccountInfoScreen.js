import React, { useState, useEffect } from 'react';
import { Image, ScrollView, Platform, Modal } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { auth } from '../../backend/firebase/config';
import { useProfilePic } from '../contexts/ProfilePicContext';
import { updateProfile, updateEmail, updatePassword, signOut } from 'firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import PlatformStorage from '../../backend/utils/platformStorage';
import { useResponsive } from '../utils/responsive';
import { saveProfileToCloud, getProfileFromCloud, isUsernameAvailable } from '../../backend/firebase/cloudStorage';
import { handleProfilePictureUpload } from '../../backend/utils/mediaUpload';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const validateUsername = (u) => /^[a-zA-Z0-9_]{3,20}$/.test(u);

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'trans', label: 'Transgender' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

// Field component defined OUTSIDE the screen component to prevent remount on every render
const Field = ({ label, icon, required, theme, children }) => (
  <View style={fieldStyles.fieldGroup}>
    <Text style={[fieldStyles.label, { color: theme.textSecondary }]}>
      {label}{required && <Text style={{ color: theme.danger }}> *</Text>}
    </Text>
    <View style={[fieldStyles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
      <Ionicons name={icon} size={20} color={theme.textSecondary} />
      {children}
    </View>
  </View>
);

const fieldStyles = StyleSheet.create({
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
});

export default function AccountInfoScreen({ navigation }) {
  const { profilePic, setProfilePic } = useProfilePic();
  const { theme } = useTheme();
  const { isDesktop, isMobile } = useResponsive();
  const user = auth.currentUser;

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState('');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // stored as YYYY-MM-DD string
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [address, setAddress] = useState('');
  const [languages, setLanguages] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const cloudProfile = await getProfileFromCloud();
      if (cloudProfile) {
        setUsername(cloudProfile.username || '');
        setDateOfBirth(cloudProfile.dateOfBirth || '');
        setGender(cloudProfile.gender || '');
        setAddress(cloudProfile.address || '');
        setLanguages(cloudProfile.languages || '');
        setInterests(cloudProfile.interests || '');
        await PlatformStorage.setItem('user_profile', JSON.stringify(cloudProfile));
        return;
      }
      const stored = await PlatformStorage.getItem('user_profile');
      if (stored) {
        const data = JSON.parse(stored);
        setUsername(data.username || '');
        setDateOfBirth(data.dateOfBirth || '');
        setGender(data.gender || '');
        setAddress(data.address || '');
        setLanguages(data.languages || '');
        setInterests(data.interests || '');
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    }
  };

  const handleSaveAll = async () => {
    if (!displayName.trim()) { setError('Name is required'); return; }
    if (!username.trim()) { setError('Username is required'); return; }
    if (!validateUsername(username.trim())) { setError('Username must be 3–20 characters, letters, numbers, or underscores only'); return; }
    if (!newEmail.trim()) { setError('Email is required'); return; }
    if (!validateEmail(newEmail)) { setError('Enter a valid email address'); return; }
    if (newPassword && newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const available = await isUsernameAvailable(username.trim(), user.uid);
      if (!available) { setError('Username is already taken'); setLoading(false); return; }

      await updateProfile(user, { displayName, photoURL: profilePic });
      if (newEmail !== user.email) await updateEmail(user, newEmail);
      if (newPassword) await updatePassword(user, newPassword);

      const profileData = {
        displayName,
        username: username.toLowerCase().trim(),
        photoURL: profilePic,
        dateOfBirth,
        gender,
        address,
        languages,
        interests,
      };

      await PlatformStorage.setItem('user_profile', JSON.stringify(profileData));
      await saveProfileToCloud(profileData);

      setSuccess('Profile updated successfully!');
      setNewPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    setLoading(true);
    setError('');
    try {
      launchImageLibrary(
        { mediaType: 'photo', includeBase64: false, quality: 0.5 },
        async (response) => {
          if (response.didCancel || !response.assets?.length) { setLoading(false); return; }
          if (response.errorCode) { setError(response.errorMessage); setLoading(false); return; }
          try {
            const uri = response.assets[0].uri;
            const downloadURL = await handleProfilePictureUpload(uri);
            setProfilePic(downloadURL);
            setSuccess('Profile picture updated!');
            setTimeout(() => setSuccess(''), 3000);
          } catch (e) {
            setError('Failed to update profile picture: ' + e.message);
          } finally {
            setLoading(false);
          }
        }
      );
    } catch (e) {
      setError('Failed to update profile picture: ' + e.message);
      setLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    setLoading(true);
    setError('');
    try {
      await updateProfile(user, { photoURL: null });
      await user.reload();
      setProfilePic(null);
      await PlatformStorage.removeItem('profile_picture');
    } catch (e) {
      setError('Failed to remove profile picture.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace('Login');
  };

  const dobDate = dateOfBirth ? new Date(dateOfBirth) : new Date(2000, 0, 1);
  const dobDisplay = dateOfBirth
    ? new Date(dateOfBirth + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Select date';

  const genderLabel = GENDER_OPTIONS.find(o => o.value === gender)?.label || 'Select gender';

  const dynamicStyles = createDynamicStyles(isDesktop, isMobile);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={theme.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView style={dynamicStyles.scrollView} contentContainerStyle={dynamicStyles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile picture */}
        <View style={styles.profilePicContainer}>
          <TouchableOpacity onPress={handlePickImage}>
            <View style={styles.profilePicWrapper}>
              {profilePic
                ? <Image source={{ uri: profilePic }} style={styles.profilePic} />
                : <Ionicons name="person-circle-outline" size={120} color={theme.textLight} />
              }
              <View style={[styles.cameraIcon, { backgroundColor: theme.accent }]}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          {profilePic && (
            <TouchableOpacity onPress={handleRemoveImage} style={styles.removePhotoButton}>
              <Text style={{ color: theme.danger, fontSize: 14 }}>Remove Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={dynamicStyles.formContainer}>
          <Field label="Name" icon="person-outline" required theme={theme}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholderTextColor={theme.textLight}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
            />
          </Field>

          <Field label="Username" icon="at-outline" required theme={theme}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholderTextColor={theme.textLight}
              value={username}
              onChangeText={setUsername}
              placeholder="unique_username"
              autoCapitalize="none"
            />
          </Field>

          <Field label="Email" icon="mail-outline" required theme={theme}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholderTextColor={theme.textLight}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="your@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </Field>

          <Field label="New Password" icon="lock-closed-outline" theme={theme}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholderTextColor={theme.textLight}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Leave blank to keep current"
              secureTextEntry
            />
          </Field>

          {/* Date of Birth — native date picker */}
          <Field label="Date of Birth" icon="calendar-outline" theme={theme}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowDatePicker(true)}>
              <Text style={{ color: dateOfBirth ? theme.text : theme.textLight, fontSize: 16 }}>
                {dobDisplay}
              </Text>
            </TouchableOpacity>
          </Field>

          {showDatePicker && (
            <DateTimePicker
              value={dobDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              onChange={(event, selected) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selected) {
                  const y = selected.getFullYear();
                  const m = String(selected.getMonth() + 1).padStart(2, '0');
                  const d = String(selected.getDate()).padStart(2, '0');
                  setDateOfBirth(`${y}-${m}-${d}`);
                }
              }}
            />
          )}

          {/* Gender — modal picker */}
          <Field label="Gender" icon="male-female-outline" theme={theme}>
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} onPress={() => setShowGenderPicker(true)}>
              <Text style={{ color: gender ? theme.text : theme.textLight, fontSize: 16 }}>{genderLabel}</Text>
              <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </Field>

          <Field label="Languages" icon="language-outline" theme={theme}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholderTextColor={theme.textLight}
              value={languages}
              onChangeText={setLanguages}
              placeholder="e.g., English, Spanish"
            />
          </Field>

          <Field label="Address" icon="location-outline" theme={theme}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholderTextColor={theme.textLight}
              value={address}
              onChangeText={setAddress}
              placeholder="Your address"
              multiline
            />
          </Field>

          <Field label="Interests & Hobbies" icon="heart-outline" theme={theme}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholderTextColor={theme.textLight}
              value={interests}
              onChangeText={setInterests}
              placeholder="e.g., Reading, Photography"
              multiline
            />
          </Field>

          {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
          {success ? <Text style={[styles.success, { color: '#22c55e' }]}>{success}</Text> : null}

          <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.accent }]} onPress={handleSaveAll} disabled={loading}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Gender picker modal */}
      <Modal visible={showGenderPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowGenderPicker(false)}>
          <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Gender</Text>
            {GENDER_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.modalOption, gender === opt.value && { backgroundColor: theme.accent + '20' }]}
                onPress={() => { setGender(opt.value); setShowGenderPicker(false); }}
              >
                <Text style={[styles.modalOptionText, { color: gender === opt.value ? theme.accent : theme.text }]}>
                  {opt.label}
                </Text>
                {gender === opt.value && <Ionicons name="checkmark" size={18} color={theme.accent} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.modalCancel, { borderTopColor: theme.border }]} onPress={() => setShowGenderPicker(false)}>
              <Text style={{ color: theme.textSecondary, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const createDynamicStyles = (isDesktop, isMobile) => StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: isDesktop ? 60 : 24, paddingBottom: 40 },
  formContainer: { maxWidth: isDesktop ? 600 : undefined, alignSelf: 'center', width: '100%' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  logoutButton: { padding: 8 },
  profilePicContainer: { alignItems: 'center', marginVertical: 32 },
  profilePicWrapper: {
    position: 'relative', width: 120, height: 120, borderRadius: 60,
    overflow: 'visible', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F0F0',
  },
  profilePic: { width: 120, height: 120, borderRadius: 60 },
  cameraIcon: { position: 'absolute', bottom: 4, right: 4, borderRadius: 16, padding: 6 },
  removePhotoButton: { marginTop: 12 },
  input: { flex: 1, fontSize: 16 },
  error: { marginBottom: 12, fontSize: 14 },
  success: { marginBottom: 12, fontSize: 14 },
  saveButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 12, marginTop: 24, gap: 8,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 16, fontWeight: '600', textAlign: 'center',
    paddingVertical: 16, paddingHorizontal: 24,
  },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 24,
  },
  modalOptionText: { fontSize: 16 },
  modalCancel: {
    alignItems: 'center', paddingVertical: 16, marginTop: 8, borderTopWidth: 1,
  },
});
