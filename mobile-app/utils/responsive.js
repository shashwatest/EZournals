import { useWindowDimensions, Platform } from 'react-native';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 1024;
  const isTablet = isWeb && width >= 768 && width < 1024;
  const isMobile = !isWeb || width < 768;

  return {
    isWeb,
    isDesktop,
    isTablet,
    isMobile,
    width,
    height,
    containerWidth: isDesktop ? Math.min(1200, width * 0.9) : width,
    sidebarWidth: isDesktop ? 280 : 0,
    contentPadding: isDesktop ? 40 : isMobile ? 16 : 24,
    cardColumns: isDesktop ? 3 : isTablet ? 2 : 1,
  };
};
