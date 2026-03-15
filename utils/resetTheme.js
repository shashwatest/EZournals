// Utility to force reset theme to glassmorphism
// Run this in browser console or call from code

import PlatformStorage from './platformStorage';

export const forceGlasmorphismTheme = async () => {
  try {
    await PlatformStorage.setItem('app_theme', 'glassmorphism');
    console.log('✅ Theme reset to glassmorphism!');
    console.log('🔄 Reload the page to see changes.');
    return true;
  } catch (error) {
    console.error('❌ Failed to reset theme:', error);
    return false;
  }
};

// For browser console use
if (typeof window !== 'undefined') {
  window.forceGlasmorphismTheme = () => {
    localStorage.setItem('app_theme', 'glassmorphism');
    console.log('✅ Theme set to glassmorphism!');
    console.log('🔄 Reloading page...');
    setTimeout(() => window.location.reload(), 500);
  };
  
  console.log('💡 To force glassmorphism theme, run: forceGlasmorphismTheme()');
}

export default forceGlasmorphismTheme;
