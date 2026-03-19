import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmDialog from './ConfirmDialog';
import { registerAppAlertHandler } from '../utils/appAlert';

export default function AppAlertHost() {
  const { theme } = useTheme();
  const [request, setRequest] = React.useState(null);
  const resolverRef = React.useRef(null);

  React.useEffect(() => registerAppAlertHandler((nextRequest) => new Promise((resolve) => {
    resolverRef.current = resolve;
    setRequest(nextRequest);
  })), []);

  const closeWith = (result) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setRequest(null);
    resolve?.(result);
  };

  return (
    <ConfirmDialog
      open={Boolean(request)}
      title={request?.title || ''}
      message={request?.message || ''}
      confirmLabel={request?.confirmLabel || 'OK'}
      cancelLabel={request?.cancelLabel || 'Cancel'}
      confirmTone={request?.confirmTone || 'accent'}
      hideCancel={request?.type !== 'confirm'}
      onCancel={() => closeWith(false)}
      onConfirm={() => closeWith(request?.type === 'confirm' ? true : undefined)}
      theme={theme}
    />
  );
}
