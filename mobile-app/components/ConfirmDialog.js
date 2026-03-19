import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { getGlassBackdropStyle, getGlassPanelStyle, getGlassSheenStyle } from '../utils/glassStyles';

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmTone = 'accent',
  hideCancel = false,
  onConfirm,
  onCancel,
}) {
  const { theme, currentTheme } = useTheme();
  const isGlassTheme = currentTheme === 'glassmorphism';

  if (!visible) return null;

  const confirmColor = confirmTone === 'danger' ? theme.danger : theme.accent;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        {isGlassTheme && (
          <BlurView
            intensity={20}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={[StyleSheet.absoluteFill, styles.overlayTint, getGlassBackdropStyle(currentTheme)]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.dialogWrap}>
          <View
            style={[
              styles.dialog,
              isGlassTheme
                ? getGlassPanelStyle(theme, currentTheme)
                : { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {isGlassTheme && <BlurView intensity={60} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />}
            {isGlassTheme && <View pointerEvents="none" style={styles.panelTint} />}
            {isGlassTheme && <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glassSheen, getGlassSheenStyle(currentTheme)]} />}
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
            <View style={styles.actions}>
              {!hideCancel && (
                <Pressable
                  style={[
                    styles.button,
                    isGlassTheme
                      ? { backgroundColor: 'rgba(0, 0, 0, 0.08)', borderColor: 'rgba(255, 255, 255, 0.18)' }
                      : { backgroundColor: theme.buttonBg || theme.background, borderColor: theme.border },
                  ]}
                  onPress={onCancel}
                >
                  <Text style={[styles.buttonText, { color: theme.text }]}>{cancelLabel}</Text>
                </Pressable>
              )}
              <Pressable
                  style={[
                    styles.button,
                    isGlassTheme
                      ? { backgroundColor: 'rgba(0, 0, 0, 0.04)', borderColor: confirmColor }
                      : { backgroundColor: 'transparent', borderColor: confirmColor },
                  ]}
                  onPress={onConfirm}
                >
                <Text style={[styles.buttonText, { color: confirmColor }]}>{confirmLabel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  overlayTint: {
    backgroundColor: 'rgba(0, 0, 0, 0.26)',
  },
  dialogWrap: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
  },
  dialog: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 14,
  },
  panelTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: 18,
  },
  glassSheen: {
    borderRadius: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  button: {
    minWidth: 108,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
