import React, { useState, useEffect } from 'react';
import { Image, ScrollView, Platform } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { auth, storage } from '../utils/firebase';
import { useProfilePic } from '../contexts/ProfilePicContext';
import { updateProfile, updateEmail, updatePassword, signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import PlatformStorage from '../utils/platformStorage';
import { useResponsive } from '../utils/responsive';
import { saveProfileToCloud, getProfileFromCloud } from '../utils/cloudStorage';

export default function AccountInfoScreen({ navigation }) {
  const { profilePic, setProfilePic } = useProfilePic();
  const { theme } = useTheme();
  const { isDesktop, isMobile } = useResponsive();
  const user = auth.currentUser;
  
  // Basic info
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  
  // Extended profile info
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [languages, setLanguages] = useState('');
  const [interests, setInterests] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load extended profile data
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // First try cloud (highest priority)
      try {
        const cloudProfile = await getProfileFromCloud();
        if (cloudProfile) {
          setDateOfBirth(cloudProfile.dateOfBirth || '');
          setGender(cloudProfile.gender || '');
          setAddress(cloudProfile.address || '');
          setLanguages(cloudProfile.languages || '');
          setInterests(cloudProfile.interests || '');
          
          // Save to local storage as cache
          await PlatformStorage.setItem('user_profile', JSON.stringify({
            dateOfBirth: cloudProfile.dateOfBirth,
            gender: cloudProfile.gender,
            address: cloudProfile.address,
            languages: cloudProfile.languages,
            interests: cloudProfile.interests
          }));
          return;
        }
      } catch (cloudError) {
        console.log('Could not load from cloud, using local storage:', cloudError.message);
      }
      
      // Fallback to local storage
      const profile = await PlatformStorage.getItem('user_profile');
      if (profile) {
        const data = JSON.parse(profile);
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
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Update Firebase auth profile
      await updateProfile(user, { displayName, photoURL: profilePic });
      if (newEmail !== user.email) {
        await updateEmail(user, newEmail);
      }
      if (newPassword) {
        await updatePassword(user, newPassword);
      }
      
      // Save extended profile to storage and cloud
      const profileData = {
        displayName,
        photoURL: profilePic,
        dateOfBirth,
        gender,
        address,
        languages,
        interests
      };
      await PlatformStorage.setItem('user_profile', JSON.stringify(profileData));
      
      // Sync to cloud
      await saveProfileToCloud(profileData);
      console.log('Profile synced to cloud');
      
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
    if (Platform.OS === 'web') {
      // Web: use file input and upload to Firebase Storage
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            setLoading(true);
            setError('');
            try {
              console.log('Uploading image to Firebase Storage...');
              
              // Upload to Firebase Storage
              const storageRef = ref(storage, `profile_pictures/${user.uid}`);
              await uploadBytes(storageRef, file);
              
              // Get download URL
              const downloadURL = await getDownloadURL(storageRef);
              console.log('Image uploaded, URL:', downloadURL);
              
              // Update context
              setProfilePic(downloadURL);
              
              // Save to local storage
              await PlatformStorage.setItem('profile_picture', downloadURL);
              
              // Update Firebase profile
              await updateProfile(user, { photoURL: downloadURL });
              await user.reload();
              
              // Sync to cloud
              await saveProfileToCloud({ photoURL: downloadURL });
              
              console.log('Profile picture updated successfully');
              setSuccess('Profile picture updated!');
              setTimeout(() => setSuccess(''), 3000);
            } catch (e) {
              console.error('Error updating profile picture:', e);
              setError('Failed to update profile picture: ' + e.message);
            } finally {
              setLoading(false);
            }
          }
        };
        input.click();
      } catch (e) {
        console.error('Error creating file input:', e);
        setError('Failed to open file picker: ' + e.message);
      }
    } else {
      // Mobile: use ImagePicker and upload to Firebase Storage
      setLoading(true);
      setError('');
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        try {
          console.log('Uploading image to Firebase Storage...');
          
          // Convert URI to blob for upload
          const response = await fetch(uri);
          const blob = await response.blob();
          
          // Upload to Firebase Storage
          const storageRef = ref(storage, `profile_pictures/${user.uid}`);
          await uploadBytes(storageRef, blob);
          
          // Get download URL
          const downloadURL = await getDownloadURL(storageRef);
          console.log('Image uploaded, URL:', downloadURL);
          
          // Update context
          setProfilePic(downloadURL);
          
          // Save to local storage
          await PlatformStorage.setItem('profile_picture', downloadURL);
          
          // Update Firebase profile
          await updateProfile(user, { photoURL: downloadURL });
          await user.reload();
          
          // Sync to cloud
          await saveProfileToCloud({ photoURL: downloadURL });
          
          console.log('Profile picture updated successfully');
          setSuccess('Profile picture updated!');
          setTimeout(() => setSuccess(''), 3000);
        } catch (e) {
          console.error('Error updating profile picture:', e);
          setError('Failed to update profile picture: ' + e.message);
        }
      }
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

  const dynamicStyles = createDynamicStyles(isDesktop, isMobile);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      {/* Header with back button */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={theme.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture */}
        <View style={styles.profilePicContainer}>
          <TouchableOpacity onPress={handlePickImage}>
            {profilePic ? (
              <View style={styles.profilePicWrapper}>
                <Image source={{ uri: profilePic }} style={styles.profilePic} />
                <View style={[styles.cameraIcon, { backgroundColor: theme.accent }]}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </View>
              </View>
            ) : (
              <View style={styles.profilePicWrapper}>
                <Ionicons name="person-circle-outline" size={120} color={theme.textLight} />
                <View style={[styles.cameraIcon, { backgroundColor: theme.accent }]}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </View>
              </View>
            )}
          </TouchableOpacity>
          {profilePic && (
            <TouchableOpacity onPress={handleRemoveImage} style={styles.removePhotoButton}>
              <Text style={{ color: theme.danger, fontSize: 14 }}>Remove Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Form Fields */}
        <View style={dynamicStyles.formContainer}>
          {/* Display Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Display Name</Text>
            <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Ionicons name="person-outline" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor={theme.textLight}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
            <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Ionicons name="mail-outline" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="your@email.com"
                placeholderTextColor={theme.textLight}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>New Password</Text>
            <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Leave blank to keep current"
                placeholderTextColor={theme.textLight}
                secureTextEntry
              />
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Date of Birth</Text>
            <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={theme.textLight}
              />
            </View>
          </View>

          {/* Gender */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Gender</Text>
            <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Ionicons name="male-female-outline" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={gender}
                onChangeText={setGender}
                placeholder="Your gender"
                placeholderTextColor={theme.textLight}
              />
            </View>
          </View>

          {/* Languages */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Languages</Text>
            <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Ionicons name="language-outline" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={languages}
                onChangeText={setLanguages}
                placeholder="e.g., English, Spanish, French"
                placeholderTextColor={theme.textLight}
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Address</Text>
            <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Ionicons name="location-outline" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={address}
                onChangeText={setAddress}
                placeholder="Your address"
                placeholderTextColor={theme.textLight}
                multiline
              />
            </View>
          </View>

          {/* Interests */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Interests & Hobbies</Text>
            <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Ionicons name="heart-outline" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={interests}
                onChangeText={setInterests}
                placeholder="e.g., Reading, Photography, Travel"
                placeholderTextColor={theme.textLight}
                multiline
              />
            </View>
          </View>

          {/* Messages */}
          {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
          {success ? <Text style={[styles.success, { color: theme.success }]}>{success}</Text> : null}

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.accent }]} 
            onPress={handleSaveAll}
            disabled={loading}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const createDynamicStyles = (isDesktop, isMobile) => StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: isDesktop ? 60 : 24,
    paddingBottom: 40,
  },
  formContainer: {
    maxWidth: isDesktop ? 600 : undefined,
    alignSelf: 'center',
    width: '100%',
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 8,
  },
  profilePicContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  profilePicWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    borderRadius: 16,
    padding: 6,
  },
  removePhotoButton: {
    marginTop: 12,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  error: {
    marginBottom: 12,
    fontSize: 14,
  },
  success: {
    marginBottom: 12,
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
