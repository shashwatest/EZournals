export const isGlassTheme = (currentTheme) => currentTheme === 'glassmorphism';

export const getGlassPanelStyle = (theme, currentTheme, overrides = {}) => {
  if (!isGlassTheme(currentTheme)) {
    return overrides;
  }

  return {
    backgroundColor: theme.glass?.backgroundColor || 'rgba(0, 0, 0, 0.18)',
    borderColor: theme.glass?.borderColor || 'rgba(255, 255, 255, 0.18)',
    borderWidth: theme.glass?.borderWidth ?? 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 20,
    overflow: 'hidden',
    ...overrides,
  };
};

export const getGlassBackdropStyle = (currentTheme) => (
  isGlassTheme(currentTheme)
    ? { backgroundColor: 'rgba(0, 0, 0, 0.08)' }
    : { backgroundColor: 'rgba(0, 0, 0, 0.4)' }
);

export const getGlassSheenStyle = (currentTheme) => (
  isGlassTheme(currentTheme)
    ? {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.06)',
      }
    : null
);
