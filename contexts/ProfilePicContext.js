import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../utils/firebase';
import PlatformStorage from '../utils/platformStorage';
import { getProfileFromCloud } from '../utils/cloudStorage';

const ProfilePicContext = createContext({
  profilePic: null,
  setProfilePic: () => {},
  resetProfilePic: () => {}
});

export function ProfilePicProvider({ children, initialPic }) {
  const [profilePic, setProfilePic] = useState(initialPic || null);

  // Load profile picture from storage, Firebase, and cloud
  useEffect(() => {
    const loadProfilePic = async () => {
      try {
        // First try local storage
        const stored = await PlatformStorage.getItem('profile_picture');
        if (stored) {
          setProfilePic(stored);
        }
        
        // Then check Firebase user
        const user = auth.currentUser;
        if (user && user.photoURL) {
          setProfilePic(user.photoURL);
          // Update local storage
          await PlatformStorage.setItem('profile_picture', user.photoURL);
        }
        
        // Finally check cloud profile (highest priority)
        const cloudProfile = await getProfileFromCloud();
        if (cloudProfile && cloudProfile.photoURL) {
          setProfilePic(cloudProfile.photoURL);
          // Update local storage
          await PlatformStorage.setItem('profile_picture', cloudProfile.photoURL);
        }
      } catch (error) {
        console.error('Error loading profile picture:', error);
      }
    };

    loadProfilePic();

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && user.photoURL) {
        setProfilePic(user.photoURL);
        await PlatformStorage.setItem('profile_picture', user.photoURL);
      } else {
        setProfilePic(null);
      }
    });
    
    return () => unsubscribe && unsubscribe();
  }, []);

  const resetProfilePic = () => setProfilePic(null);

  return (
    <ProfilePicContext.Provider value={{ profilePic, setProfilePic, resetProfilePic }}>
      {children}
    </ProfilePicContext.Provider>
  );
}

export function useProfilePic() {
  return useContext(ProfilePicContext);
}
