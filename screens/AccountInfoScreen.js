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

  const handleSaveAll = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile(user, { displayName, photoURL: profilePic });
      await updateEmail(user, newEmail);
      if (newPassword) await updatePassword(user, newPassword);
      setEmail(newEmail);
      setSuccess('Account updated successfully!');
      setNewPassword('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
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
            <View style={[styles.profilePicWrapper, { width: 160, height: 160, borderRadius: 80 }] }>
              <Ionicons name="camera" size={28} color={theme.textLight} style={styles.cameraIcon} />
              <Image source={{ uri: profilePic }} style={{ width: 160, height: 160, borderRadius: 80 }} />
            </View>
          ) : (
            <View style={styles.profilePicPlaceholder}>
              <Ionicons name="person-circle-outline" size={160} color={theme.textLight} />
              <Ionicons name="camera" size={28} color={theme.textLight} style={styles.cameraIcon} />
            </View>
          )}
        </TouchableOpacity>
      </View>
      <Text style={[styles.label, { color: theme.textSecondary }]}>Display Name</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface, flex: 1 }]}
          value={displayName}
          onChangeText={setDisplayName}
        />
        <Ionicons name="person-outline" size={20} color={theme.textSecondary} style={{ marginLeft: 8 }} />
      </View>
      <Text style={[styles.label, { color: theme.textSecondary }]}>Update Email</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface, flex: 1 }]}
          value={newEmail}
          onChangeText={setNewEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Ionicons name="mail-outline" size={20} color={theme.textSecondary} style={{ marginLeft: 8 }} />
      </View>
      <Text style={[styles.label, { color: theme.textSecondary }]}>Update Password</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface, flex: 1 }]}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={{ marginLeft: 8 }} />
      </View>
      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
      {success ? <Text style={[styles.success, { color: theme.success }]}>{success}</Text> : null}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
        <TouchableOpacity style={{ padding: 12 }} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={28} color={theme.danger} />
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 12 }} onPress={handleSaveAll}>
          <Ionicons name="checkmark-circle" size={32} color={theme.accent} />
        </TouchableOpacity>
      </View>
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
    width: 100,
    height: 100,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0'
  },
  profilePic: {
    width: 100,
    height: 100,
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
    width: 90,
    height: 90,
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
