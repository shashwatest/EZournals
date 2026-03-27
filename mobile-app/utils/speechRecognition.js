import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

/**
 * Check if speech recognition is available on this device
 */
export const checkSpeechSupport = async () => {
  try {
    const result = await ExpoSpeechRecognitionModule.getStateAsync();
    return true;
  } catch {
    return false;
  }
};

/**
 * Custom React hook for speech-to-text transcription using expo-speech-recognition.
 *
 * @param {Object} options
 * @param {function} options.onResult - Called with final transcribed text segments
 * @param {function} [options.onError] - Called on recognition errors
 * @param {string} [options.lang] - BCP-47 language code (default: 'en-US')
 * @returns {{ isListening, interimText, startListening, stopListening }}
 */
export function useSpeechRecognition({ onResult, onError, lang = 'en-US' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    setInterimText('');
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript || '';
    if (event.isFinal) {
      if (onResultRef.current) onResultRef.current(transcript);
      setInterimText('');
    } else {
      setInterimText(transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error);
    if (onErrorRef.current) onErrorRef.current(event.error);
    setIsListening(false);
    setInterimText('');
  });

  const startListening = useCallback(async () => {
    try {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        if (onErrorRef.current) onErrorRef.current('not-allowed');
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang,
        interimResults: true,
        continuous: true,
      });
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      if (onErrorRef.current) onErrorRef.current(err.message);
    }
  }, [lang]);

  const stopListening = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch (_) {}
    setIsListening(false);
    setInterimText('');
  }, []);

  return { isListening, interimText, startListening, stopListening };
}
