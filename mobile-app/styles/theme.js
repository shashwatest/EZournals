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

// Matte Black theme – calm, elegant, solid block-on-wall feel
export const matteBlackTheme = {
  background: '#121212',
  surface: '#141414',        // Darker cards – closer to BG
  surfaceHover: '#171717',
  text: '#F0F0F0',           // Brighter primary text
  textSecondary: '#B0B0B0',  // Brighter secondary text
  textLight: '#6A6A6A',
  accent: '#7C8A97',        // Muted steel-blue
  accentGlow: 'rgba(124, 138, 151, 0.3)',
  primary: '#F0F0F0',
  danger: '#B85C5C',        // Desaturated red
  border: '#1E1E1E',        // Subtler border
  borderSolid: '#1A1A1A',
  borderGlow: 'rgba(124, 138, 151, 0.2)',
  success: '#6B9E8A',       // Desaturated teal
  warning: '#C9A84C',       // Desaturated gold
  heading: '#F0F0F0',
  headingSize: 32,
  subheadingSize: 22,
  fontFamily: 'System',
  cardRadius: 14,
  // Matte card – sharp shadow, solid feel
  glass: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2,         // Tight shadow = solid block
    elevation: 4,
  },
  // Matte button – dark bg, no fill color
  glossyButton: {
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 3,
  },
  whiteButton: {
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  // Very subtle hover – no color shift, tiny scale
  buttonHover: {
    backgroundColor: '#1C1C1C',
    borderColor: '#222222',
    shadowOpacity: 0.35,
    transform: [{ scale: 1.012 }],
  },
  cardShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 4,
  },
  // Web-specific extras
  edit: '#7C8A97',
  editGlow: 'rgba(124, 138, 151, 0.15)',
  dangerGlow: 'rgba(184, 92, 92, 0.15)',
};

// Matte White theme – calm, elegant, solid block-on-wall feel (light variant)
export const matteWhiteTheme = {
  background: '#F0F0F0',        // Warm off-white
  surface: '#FFFFFF',            // Pure white cards
  surfaceHover: '#FAFAFA',
  text: '#1A1A1A',               // Near-black text
  textSecondary: '#5A5A5A',
  textLight: '#8A8A8A',
  accent: '#5A6B7A',            // Muted steel-blue (darker for light bg)
  accentGlow: 'rgba(90, 107, 122, 0.2)',
  primary: '#1A1A1A',
  danger: '#C45A5A',            // Desaturated red
  border: '#E0E0E0',
  borderSolid: '#D8D8D8',
  borderGlow: 'rgba(90, 107, 122, 0.15)',
  success: '#5A8E7A',           // Desaturated teal
  warning: '#B8974A',           // Desaturated gold
  heading: '#1A1A1A',
  headingSize: 32,
  subheadingSize: 22,
  fontFamily: 'System',
  cardRadius: 14,
  // Matte card – sharp shadow, solid feel
  glass: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 4,
  },
  // Matte button – light bg, no fill color
  glossyButton: {
    backgroundColor: '#E8E8E8',
    borderWidth: 1,
    borderColor: '#D8D8D8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 1,
    elevation: 3,
  },
  whiteButton: {
    backgroundColor: '#E8E8E8',
    borderWidth: 1,
    borderColor: '#D8D8D8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 2,
  },
  // Very subtle hover – no color shift, tiny scale
  buttonHover: {
    backgroundColor: '#E0E0E0',
    borderColor: '#D0D0D0',
    shadowOpacity: 0.1,
    transform: [{ scale: 1.012 }],
  },
  cardShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 4,
  },
  // Web-specific extras
  edit: '#5A6B7A',
  editGlow: 'rgba(90, 107, 122, 0.12)',
  dangerGlow: 'rgba(196, 90, 90, 0.12)',
  buttonBg: '#E8E8E8',
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
  matteBlack: matteBlackTheme,
  matteWhite: matteWhiteTheme,
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