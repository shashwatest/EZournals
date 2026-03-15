// Glassmorphism theme - Pitch black with purple edge glow
export const glassmorphismTheme = {
  background: '#000000', // Pitch black
  surface: '#0a0a0a', // Almost black for cards
  surfaceHover: '#141414', // Slightly lighter on hover
  text: '#FFFFFF',
  textSecondary: '#D1D1E0',
  textLight: '#9090A8',
  accent: '#A78BFA', // Bright purple (lighter for better visibility)
  accentGlow: 'rgba(167, 139, 250, 0.6)',
  primary: '#FFFFFF', // White for primary buttons
  danger: '#FF6B9D',
  border: 'rgba(167, 139, 250, 0.25)', // Purple glow border
  borderSolid: '#1a1a1a',
  borderGlow: 'rgba(167, 139, 250, 0.6)',
  success: '#4ECDC4',
  warning: '#FFE66D',
  heading: '#FFFFFF',
  headingSize: 32,
  subheadingSize: 22,
  fontFamily: 'System',
  cardRadius: 16,
  // Card with edge glow
  glass: {
    backgroundColor: '#0a0a0a', // Pitch black card
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.25)', // Purple edge glow
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  // Bright purple button
  glossyButton: {
    backgroundColor: '#A78BFA', // Bright purple
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.6)',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 10,
  },
  // White button variant
  whiteButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  // Hover/Press effects
  buttonHover: {
    backgroundColor: '#B99DFF', // Lighter purple on hover
    borderColor: 'rgba(185, 157, 255, 0.7)',
    shadowOpacity: 0.9,
    transform: [{ scale: 1.03 }],
  },
  cardShadow: {
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  }
};

export const classyBWTheme = {
  background: '#000000', // true black
  surface: '#1A1A1A',    // dark gray for cards
  text: '#FFFFFF',       // pure white text
  textSecondary: '#CCCCCC',
  textLight: '#888888',
  accent: '#FFD700',     // gold accent for visibility
  primary: '#FFFFFF',    // white for icons/buttons
  danger: '#FF5252',
  border: '#333333',
  success: '#4CAF50',
  warning: '#FFC107',
  heading: '#FFD700',    // gold headings
  headingSize: 32,
  subheadingSize: 22,
  fontFamily: 'System',
  cardRadius: 20,
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8
  }
};

export const themes = {
  glassmorphism: glassmorphismTheme, // Set as first/default
  classyBW: classyBWTheme,
  oceanTeal: {
    background: '#E0F2F1',
    surface: '#FFFFFF',
    text: '#004D40',
    textSecondary: '#00695C',
    textLight: '#80CBC4',
    accent: '#00ACC1',
    primary: '#00897B',
    danger: '#D32F2F',
    border: '#B2DFDB',
    success: '#388E3C',
    warning: '#F57C00'
  },
  custom: glassmorphismTheme // Default to glassmorphism
};

export const theme = {
  colors: {
    primary: '#2C3E50',
    secondary: '#34495E',
    accent: '#3498DB',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#2C3E50',
    textSecondary: '#7F8C8D',
    textLight: '#BDC3C7',
    success: '#27AE60',
    warning: '#F39C12',
    danger: '#E74C3C',
    border: '#ECF0F1'
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24
  },
  shadows: {
    light: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5
    }
  }
};