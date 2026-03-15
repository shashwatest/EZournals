import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { uploadProfilePicture } from '../utils/mediaUpload';
import { User, Mail, Lock, Save, Camera, Calendar, MapPin, Globe, Heart, AtSign, ChevronDown } from 'lucide-react';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const validateUsername = (u) => /^[a-zA-Z0-9_]{3,20}$/.test(u);
const validateDOB = (dob) => {
  if (!dob) return true;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  const age = (now - d) / (1000 * 60 * 60 * 24 * 365.25);
  return age >= 0 && age <= 120;
};

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'trans', label: 'Transgender' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function ProfilePage() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePic, setProfilePic] = useState(user?.photoURL || '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [languages, setLanguages] = useState('');
  const [interests, setInterests] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    try {
      const profileDoc = await getDoc(doc(db, 'userProfiles', user.uid));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setUsername(data.username || '');
        setDateOfBirth(data.dateOfBirth || '');
        setGender(data.gender || '');
        setAddress(data.address || '');
        setLanguages(data.languages || '');
        setInterests(data.interests || '');
        if (data.photoURL) setProfilePic(data.photoURL);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const isUsernameAvailable = async (uname) => {
    const q = query(collection(db, 'userProfiles'), where('username', '==', uname.toLowerCase()));
    const snap = await getDocs(q);
    return snap.empty || (snap.docs.length === 1 && snap.docs[0].id === user.uid);
  };

  const handleSaveAll = async () => {
    if (!displayName.trim()) { setError('Name is required'); return; }
    if (!username.trim()) { setError('Username is required'); return; }
    if (!validateUsername(username.trim())) { setError('Username must be 3–20 characters, letters, numbers, or underscores only'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    if (!validateEmail(email)) { setError('Enter a valid email address'); return; }
    if (newPassword && newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword && newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (dateOfBirth && !validateDOB(dateOfBirth)) { setError('Enter a valid date of birth'); return; }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const available = await isUsernameAvailable(username.trim());
      if (!available) { setError('Username is already taken'); setLoading(false); return; }

      await updateProfile(user, { displayName, photoURL: profilePic });
      if (email !== user.email) await updateEmail(user, email);
      if (newPassword) await updatePassword(user, newPassword);

      await setDoc(doc(db, 'userProfiles', user.uid), {
        displayName,
        username: username.toLowerCase().trim(),
        photoURL: profilePic,
        dateOfBirth,
        gender,
        address,
        languages,
        interests,
        userId: user.uid,
        updatedAt: Date.now(),
      }, { merge: true });

      setMessage('Profile updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const downloadURL = await uploadProfilePicture(file);
      await updateProfile(user, { photoURL: downloadURL });
      setProfilePic(downloadURL);
      await setDoc(doc(db, 'userProfiles', user.uid), { photoURL: downloadURL, updatedAt: Date.now() }, { merge: true });
      setMessage('Profile picture updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to upload profile picture: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const s = {
    container: { padding: '32px', maxWidth: '700px', margin: '0 auto' },
    title: { fontSize: '28px', fontWeight: '700', color: theme.text, marginBottom: '4px' },
    subtitle: { fontSize: '15px', color: theme.textSecondary, marginBottom: '32px' },
    card: {
      backgroundColor: theme.surface, borderRadius: '16px',
      border: `1px solid ${theme.border}`, padding: '24px', marginBottom: '20px',
    },
    avatarRow: { display: 'flex', alignItems: 'center', gap: '24px' },
    avatar: {
      width: '88px', height: '88px', borderRadius: '50%', backgroundColor: theme.accent,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: '28px', fontWeight: '600', overflow: 'hidden', flexShrink: 0,
    },
    cameraLabel: {
      position: 'absolute', bottom: 0, right: 0,
      backgroundColor: theme.accent, borderRadius: '50%',
      width: '28px', height: '28px', display: 'flex', alignItems: 'center',
      justifyContent: 'center', cursor: 'pointer', border: `2px solid ${theme.surface}`,
    },
    userMeta: { flex: 1 },
    userName: { fontSize: '18px', fontWeight: '600', color: theme.text },
    userEmail: { fontSize: '14px', color: theme.textSecondary, marginTop: '2px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px' },
    required: { color: theme.danger || '#ef4444' },
    inputRow: {
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 14px', borderRadius: '10px',
      border: `1px solid ${theme.border}`, backgroundColor: theme.background,
    },
    input: { flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', color: theme.text, fontSize: '15px' },
    select: {
      flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent',
      color: theme.text, fontSize: '15px', cursor: 'pointer', appearance: 'none',
    },
    textarea: { flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', color: theme.text, fontSize: '15px', resize: 'vertical', minHeight: '60px' },
    saveBtn: {
      display: 'flex', alignItems: 'center', gap: '8px', padding: '13px 28px',
      backgroundColor: theme.accent, color: '#fff', border: 'none',
      borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', width: '100%',
      justifyContent: 'center',
    },
    successMsg: { padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px', backgroundColor: '#dcfce7', color: '#166534' },
    errorMsg: { padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px', backgroundColor: '#fee2e2', color: '#991b1b' },
  };

  return (
    <div style={s.container}>
      <h1 style={s.title}>Profile</h1>
      <p style={s.subtitle}>Manage your account information</p>

      {message && <div style={s.successMsg}>{message}</div>}
      {error && <div style={s.errorMsg}>{error}</div>}

      {/* Avatar */}
      <div style={s.card}>
        <div style={s.avatarRow}>
          <div style={{ position: 'relative' }}>
            <div style={s.avatar}>
              {profilePic
                ? <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <User size={32} />
              }
            </div>
            <label style={s.cameraLabel} htmlFor="profile-pic-input" title={uploading ? 'Uploading...' : 'Change photo'}>
              <Camera size={14} color="#fff" />
              <input id="profile-pic-input" type="file" accept="image/*" onChange={handleProfilePicture} style={{ display: 'none' }} disabled={uploading} />
            </label>
          </div>
          <div style={s.userMeta}>
            <div style={s.userName}>{user?.displayName || 'User'}</div>
            <div style={s.userEmail}>{user?.email}</div>
            {username && <div style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '2px' }}>@{username}</div>}
          </div>
        </div>
      </div>

      {/* Main fields */}
      <div style={s.card}>
        <div style={s.grid}>
          <div style={s.formGroup}>
            <label style={s.label}>Name <span style={s.required}>*</span></label>
            <div style={s.inputRow}>
              <User size={17} color={theme.textSecondary} style={{ flexShrink: 0 }} />
              <input style={s.input} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Username <span style={s.required}>*</span></label>
            <div style={s.inputRow}>
              <AtSign size={17} color={theme.textSecondary} style={{ flexShrink: 0 }} />
              <input style={s.input} value={username} onChange={e => setUsername(e.target.value)} placeholder="unique_username" autoComplete="off" />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Email <span style={s.required}>*</span></label>
            <div style={s.inputRow}>
              <Mail size={17} color={theme.textSecondary} style={{ flexShrink: 0 }} />
              <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Date of Birth</label>
            <div style={s.inputRow}>
              <Calendar size={17} color={theme.textSecondary} style={{ flexShrink: 0 }} />
              <input style={s.input} type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} max={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Gender</label>
            <div style={s.inputRow}>
              <User size={17} color={theme.textSecondary} style={{ flexShrink: 0 }} />
              <select style={s.select} value={gender} onChange={e => setGender(e.target.value)}>
                {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={15} color={theme.textSecondary} style={{ flexShrink: 0 }} />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Languages</label>
            <div style={s.inputRow}>
              <Globe size={17} color={theme.textSecondary} style={{ flexShrink: 0 }} />
              <input style={s.input} value={languages} onChange={e => setLanguages(e.target.value)} placeholder="e.g., English, Spanish" />
            </div>
          </div>
        </div>

        <div style={s.formGroup}>
          <label style={s.label}>Address</label>
          <div style={s.inputRow}>
            <MapPin size={17} color={theme.textSecondary} style={{ flexShrink: 0, alignSelf: 'flex-start', marginTop: '2px' }} />
            <textarea style={s.textarea} value={address} onChange={e => setAddress(e.target.value)} placeholder="Your address" />
          </div>
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Interests & Hobbies</label>
          <div style={s.inputRow}>
            <Heart size={17} color={theme.textSecondary} style={{ flexShrink: 0, alignSelf: 'flex-start', marginTop: '2px' }} />
            <textarea style={s.textarea} value={interests} onChange={e => setInterests(e.target.value)} placeholder="e.g., Reading, Photography, Travel" />
          </div>
        </div>
      </div>

      {/* Password */}
      <div style={s.card}>
        <div style={{ fontSize: '15px', fontWeight: '600', color: theme.text, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={17} /> Change Password
        </div>
        <div style={s.grid}>
          <div style={s.formGroup}>
            <label style={s.label}>New Password</label>
            <div style={s.inputRow}>
              <Lock size={17} color={theme.textSecondary} style={{ flexShrink: 0 }} />
              <input style={s.input} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Confirm Password</label>
            <div style={s.inputRow}>
              <Lock size={17} color={theme.textSecondary} style={{ flexShrink: 0 }} />
              <input style={s.input} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
            </div>
          </div>
        </div>
      </div>

      <button style={s.saveBtn} onClick={handleSaveAll} disabled={loading}>
        <Save size={17} />
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
