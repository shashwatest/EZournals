import { useState, useEffect, useRef, useCallback } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

/**
 * Check if the browser supports the Web Speech API
 */
export const isSpeechSupported = () => Boolean(SpeechRecognition);

/**
 * Custom React hook for speech-to-text transcription using the Web Speech API.
 *
 * @param {Object} options
 * @param {function} options.onResult - Called with final transcribed text segments
 * @param {function} [options.onError] - Called on recognition errors
 * @param {string} [options.lang] - BCP-47 language code (default: 'en-US')
 * @returns {{ isListening, interimText, startListening, stopListening, isSupported }}
 */
export function useSpeechRecognition({ onResult, onError, lang = 'en-US' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  // Keep callback refs up to date without restarting recognition
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const isSupported = Boolean(SpeechRecognition);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    // Avoid duplicate instances
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript;
          if (onResultRef.current) onResultRef.current(text);
          setInterimText('');
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) setInterimText(interim);
    };

    recognition.onerror = (event) => {
      // "aborted" is expected when we call stop/abort ourselves
      if (event.error === 'aborted') return;
      console.error('Speech recognition error:', event.error);
      if (onErrorRef.current) onErrorRef.current(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      // If we're still supposed to be listening (e.g. browser auto-stopped),
      // restart to keep continuous mode working reliably.
      if (recognitionRef.current === recognition && isListening) {
        try { recognition.start(); } catch (_) {}
        return;
      }
      setIsListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      if (onErrorRef.current) onErrorRef.current(err.message);
    }
  }, [isSupported, lang]);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognitionRef.current = null; // clear ref first to prevent auto-restart in onend
      try { recognition.stop(); } catch (_) {}
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
        recognitionRef.current = null;
      }
    };
  }, []);

  return { isListening, interimText, startListening, stopListening, isSupported };
}
