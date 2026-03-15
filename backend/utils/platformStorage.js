import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Platform-agnostic storage wrapper
 * Uses AsyncStorage on mobile, localStorage on web
 */

const isWeb = Platform.OS === 'web';

const webStorage = {
  async getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage getItem error:', error);
      return null;
    }
  },

  async setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('localStorage setItem error:', error);
      throw error;
    }
  },

  async removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage removeItem error:', error);
      throw error;
    }
  },

  async clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('localStorage clear error:', error);
      throw error;
    }
  },

  async getAllKeys() {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('localStorage getAllKeys error:', error);
      return [];
    }
  },

  async multiGet(keys) {
    try {
      return keys.map(key => [key, localStorage.getItem(key)]);
    } catch (error) {
      console.error('localStorage multiGet error:', error);
      return [];
    }
  },

  async multiSet(keyValuePairs) {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (error) {
      console.error('localStorage multiSet error:', error);
      throw error;
    }
  },

  async multiRemove(keys) {
    try {
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('localStorage multiRemove error:', error);
      throw error;
    }
  }
};

// Export the appropriate storage based on platform
export const PlatformStorage = isWeb ? webStorage : AsyncStorage;

export default PlatformStorage;
