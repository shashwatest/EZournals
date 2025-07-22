import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { auth } from '../utils/firebase';
import { updateProfile } from 'firebase/auth';
import { updateEmail, updatePassword, signOut } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function AccountInfoScreen({ navigation }) {
  const { theme } = useTheme();
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [profilePic, setProfilePic] = useState(user?.photoURL || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile(user, { displayName, photoURL: profilePic });
      setSuccess('Profile updated successfully!');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateEmail(user, newEmail);
      setEmail(newEmail);
      setSuccess('Email updated successfully!');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updatePassword(user, newPassword);
      setSuccess('Password updated successfully!');
      setNewPassword('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace('Login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      <Text style={[styles.title, { color: theme.text }]}>Account Information</Text>
      <View style={styles.profilePicContainer}>
        <TouchableOpacity onPress={handlePickImage}>
          {profilePic ? (
            <View style={styles.profilePicWrapper}>
              <Ionicons name="camera" size={20} color={theme.textLight} style={styles.cameraIcon} />
              <Image source={{ uri: profilePic }} style={styles.profilePic} />
            </View>
          ) : (
            <View style={styles.profilePicPlaceholder}>
              <Ionicons name="person-circle-outline" size={64} color={theme.textLight} />
              <Ionicons name="camera" size={20} color={theme.textLight} style={styles.cameraIcon} />
            </View>
          )}
        </TouchableOpacity>
      </View>
      <Text style={[styles.label, { color: theme.textSecondary }]}>Display Name</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleUpdateProfile} disabled={loading}>
        <Text style={[styles.buttonText, { color: theme.surface }]}>{loading ? 'Updating...' : 'Update Name & Picture'}</Text>
      </TouchableOpacity>
      <Text style={[styles.label, { color: theme.textSecondary }]}>Update Email</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
        value={newEmail}
        onChangeText={setNewEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleUpdateEmail} disabled={loading}>
        <Text style={[styles.buttonText, { color: theme.surface }]}>Update Email</Text>
      </TouchableOpacity>
      <Text style={[styles.label, { color: theme.textSecondary }]}>Update Password</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleUpdatePassword} disabled={loading || !newPassword}>
        <Text style={[styles.buttonText, { color: theme.surface }]}>Update Password</Text>
      </TouchableOpacity>
      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
      {success ? <Text style={[styles.success, { color: theme.success }]}>{success}</Text> : null}
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.danger }]} onPress={handleLogout}>
        <Text style={[styles.buttonText, { color: theme.surface }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 24
  },
  profilePicWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0'
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2
  },
  profilePicPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  error: {
    marginBottom: 8
  },
  success: {
    marginBottom: 8
  }
});
