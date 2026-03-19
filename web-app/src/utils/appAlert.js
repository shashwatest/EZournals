let handler = null;

export const registerAppAlertHandler = (nextHandler) => {
  handler = nextHandler;
  return () => {
    if (handler === nextHandler) {
      handler = null;
    }
  };
};

export const showAlert = ({ title, message, confirmLabel = 'OK', confirmTone = 'accent' }) => {
  if (!handler) return Promise.resolve();
  return handler({ type: 'alert', title, message, confirmLabel, confirmTone });
};

export const showConfirm = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmTone = 'accent',
}) => {
  if (!handler) return Promise.resolve(false);
  return handler({ type: 'confirm', title, message, confirmLabel, cancelLabel, confirmTone });
};
