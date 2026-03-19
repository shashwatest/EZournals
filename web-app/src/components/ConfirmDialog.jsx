import React from 'react';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  hideCancel = false,
  confirmTone = 'accent',
  onConfirm,
  onCancel,
  theme,
}) {
  if (!open) return null;

  const isGlassTheme = theme.id === 'glassmorphism';
  const confirmColor = confirmTone === 'danger' ? theme.danger : theme.accent;

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: isGlassTheme
        ? 'radial-gradient(circle at center, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.14) 24%, rgba(0, 0, 0, 0.38) 100%)'
        : 'rgba(0, 0, 0, 0.42)',
      backdropFilter: isGlassTheme ? 'blur(5px) saturate(135%)' : 'none',
      WebkitBackdropFilter: isGlassTheme ? 'blur(5px) saturate(135%)' : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      zIndex: 2000,
    },
    dialog: {
      width: '100%',
      maxWidth: '420px',
      backgroundColor: isGlassTheme ? 'rgba(0, 0, 0, 0.16)' : theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: '16px',
      boxShadow: isGlassTheme ? '0 24px 80px rgba(0, 0, 0, 0.35)' : '0 18px 48px rgba(0, 0, 0, 0.22)',
      padding: '24px',
      backdropFilter: isGlassTheme ? 'blur(5px) saturate(150%)' : 'none',
      WebkitBackdropFilter: isGlassTheme ? 'blur(5px) saturate(150%)' : 'none',
    },
    title: {
      margin: 0,
      marginBottom: '12px',
      fontSize: '20px',
      fontWeight: '600',
      color: theme.text,
    },
    message: {
      margin: 0,
      fontSize: '14px',
      lineHeight: '1.6',
      color: theme.textSecondary,
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '24px',
    },
    button: {
      padding: '10px 16px',
      borderRadius: '10px',
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.buttonBg || theme.background,
      color: theme.text,
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    confirmButton: {
      borderColor: confirmColor,
      color: confirmColor,
      backgroundColor: 'transparent',
    },
  };

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>
        <div style={styles.actions}>
          {!hideCancel && (
            <button style={styles.button} onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button
            style={{ ...styles.button, ...styles.confirmButton }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
