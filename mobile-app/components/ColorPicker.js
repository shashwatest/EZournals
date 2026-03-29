import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import ColorPicker, { Panel1, HueSlider, OpacitySlider, Preview, Swatches } from 'reanimated-color-picker';
import { useTheme } from '../contexts/ThemeContext';
import { getGlassBackdropStyle, getGlassPanelStyle, getGlassSheenStyle, isGlassTheme as isGlassThemeEnabled } from '../utils/glassStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PICKER_WIDTH = Math.min(SCREEN_WIDTH - 48, 320);

// Quick-select preset colors for convenience
const PRESET_COLORS = [
  '#FF3B30', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#607D8B',
  '#000000', '#FFFFFF', '#F44336', '#1976D2', '#388E3C', '#FBC02D'
];

/**
 * Reusable color picker component with full spectrum support
 * @param {boolean} visible - Whether the picker modal is visible
 * @param {function} onClose - Callback when picker is closed
 * @param {function} onSelectColor - Callback with selected color hex value
 * @param {string} initialColor - Initial color to display (hex format)
 * @param {string} title - Title to display in the picker header
 * @param {boolean} showOpacity - Whether to show opacity slider (default: false)
 */
export default function ColorPickerModal({ 
  visible, 
  onClose, 
  onSelectColor, 
  initialColor = '#2196F3',
  title = 'Choose Color',
  showOpacity = false 
}) {
  const { theme, currentTheme } = useTheme();
  const isGlassTheme = isGlassThemeEnabled(currentTheme);
  
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [hexInput, setHexInput] = useState(initialColor);

  // Update internal state when initialColor changes
  React.useEffect(() => {
    if (visible) {
      setSelectedColor(initialColor);
      setHexInput(initialColor);
    }
  }, [initialColor, visible]);

  const onColorChange = useCallback((color) => {
    'worklet';
    // This runs on UI thread, we need to update JS state
  }, []);

  const onColorChangeComplete = useCallback((color) => {
    setSelectedColor(color.hex);
    setHexInput(color.hex);
  }, []);

  const handleHexInputChange = (text) => {
    setHexInput(text);
    // Validate hex and update color if valid
    if (/^#[0-9A-Fa-f]{6}$/.test(text)) {
      setSelectedColor(text);
    }
  };

  const handlePresetSelect = (color) => {
    setSelectedColor(color);
    setHexInput(color);
  };

  const handleConfirm = () => {
    onSelectColor(selectedColor);
    onClose();
  };

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, getGlassBackdropStyle(currentTheme)]}>
        <View
          style={[
            styles.modalContent,
            isGlassTheme
              ? getGlassPanelStyle(theme, currentTheme, { borderRadius: 20 })
              : { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {isGlassTheme && (
            <BlurView 
              intensity={96} 
              tint="dark" 
              experimentalBlurMethod="dimezisBlurView" 
              style={StyleSheet.absoluteFill} 
            />
          )}
          {isGlassTheme && (
            <View 
              pointerEvents="none" 
              style={[StyleSheet.absoluteFill, styles.modalGlassSheen, getGlassSheenStyle(currentTheme)]} 
            />
          )}
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Color Picker */}
            <View style={styles.pickerContainer}>
              <ColorPicker
                value={selectedColor}
                onChange={onColorChange}
                onComplete={onColorChangeComplete}
                style={styles.picker}
              >
                <Preview style={styles.previewStyle} />
                <Panel1 style={styles.panelStyle} />
                <HueSlider style={styles.sliderStyle} />
                {showOpacity && <OpacitySlider style={styles.sliderStyle} />}
              </ColorPicker>
            </View>

            {/* Hex Input */}
            <View style={styles.hexInputContainer}>
              <Text style={styles.hexLabel}>HEX</Text>
              <TextInput
                style={styles.hexInput}
                value={hexInput}
                onChangeText={handleHexInputChange}
                placeholder="#000000"
                placeholderTextColor={theme.textLight}
                autoCapitalize="characters"
                maxLength={7}
              />
            </View>

            {/* Preset Colors */}
            <View style={styles.presetsContainer}>
              <Text style={styles.presetsLabel}>Quick Select</Text>
              <View style={styles.presetsGrid}>
                {PRESET_COLORS.map((color, index) => (
                  <TouchableOpacity
                    key={`${color}-${index}`}
                    style={[
                      styles.presetColor,
                      { backgroundColor: color },
                      selectedColor.toUpperCase() === color.toUpperCase() && styles.presetColorSelected
                    ]}
                    onPress={() => handlePresetSelect(color)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.confirmButton, { backgroundColor: theme.accent }]} onPress={handleConfirm}>
              <Text style={[styles.confirmButtonText, { color: theme.onAccentText || '#fff' }]}>Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '90%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalGlassSheen: {
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  pickerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  picker: {
    width: PICKER_WIDTH,
    gap: 16,
  },
  previewStyle: {
    height: 50,
    borderRadius: 12,
  },
  panelStyle: {
    height: 180,
    borderRadius: 12,
  },
  sliderStyle: {
    height: 32,
    borderRadius: 16,
  },
  hexInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  hexLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    width: 40,
  },
  hexInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: 'monospace',
    color: theme.text,
    backgroundColor: theme.background,
  },
  presetsContainer: {
    marginBottom: 8,
  },
  presetsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  presetColor: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetColorSelected: {
    borderColor: theme.text,
    transform: [{ scale: 1.1 }],
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  confirmButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
