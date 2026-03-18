import React from 'react';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmTone = 'accent',
  onConfirm,
  onCancel,
  theme,
}) {
  if (!open) return null;

  const confirmColor = confirmTone === 'danger' ? theme.danger : theme.accent;

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      zIndex: 2000,
    },
    dialog: {
      width: '100%',
      maxWidth: '420px',
      backgroundColor: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: '16px',
      boxShadow: '0 24px 80px rgba(0, 0, 0, 0.35)',
      padding: '24px',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
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
      color: confirmTone === 'danger' ? theme.danger : theme.accent,
    },
  };

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>
        <div style={styles.actions}>
          <button style={styles.button} onClick={onCancel}>
            {cancelLabel}
          </button>
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
