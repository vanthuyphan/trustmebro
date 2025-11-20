import { useState, useCallback, useRef } from 'react';

export const useKeystrokeTracking = () => {
  const [keystrokes, setKeystrokes] = useState([]);
  const [typingStats, setTypingStats] = useState({
    totalKeystrokes: 0,
    averageTypingSpeed: 0,
    totalTimeSpent: 0,
    pauseCount: 0,
    backspaceCount: 0,
    copyPasteDetected: false,
  });

  const lastKeystrokeTime = useRef(0);
  const startTime = useRef(Date.now());
  const keydownTimes = useRef(new Map());

  const trackKeyDown = useCallback((e) => {
    const now = Date.now();
    const key = e.key;

    // Detect copy-paste
    if ((e.ctrlKey || e.metaKey) && (key === 'v' || key === 'c')) {
      if (key === 'v') {
        setTypingStats(prev => ({ ...prev, copyPasteDetected: true }));
      }
      return;
    }

    // Track pause (more than 2 seconds between keystrokes)
    if (lastKeystrokeTime.current && now - lastKeystrokeTime.current > 2000) {
      setTypingStats(prev => ({ ...prev, pauseCount: prev.pauseCount + 1 }));
    }

    keydownTimes.current.set(key, now);
    lastKeystrokeTime.current = now;

    const keystroke = {
      key,
      timestamp: now,
      type: 'keydown',
    };

    setKeystrokes(prev => [...prev, keystroke]);

    setTypingStats(prev => ({
      ...prev,
      totalKeystrokes: prev.totalKeystrokes + 1,
      backspaceCount: key === 'Backspace' ? prev.backspaceCount + 1 : prev.backspaceCount,
      totalTimeSpent: Math.floor((now - startTime.current) / 1000),
    }));
  }, []);

  const trackKeyUp = useCallback((e) => {
    const now = Date.now();
    const key = e.key;
    const keydownTime = keydownTimes.current.get(key);

    if (keydownTime) {
      const duration = now - keydownTime;
      const keystroke = {
        key,
        timestamp: now,
        type: 'keyup',
        duration,
      };

      setKeystrokes(prev => [...prev, keystroke]);
      keydownTimes.current.delete(key);
    }
  }, []);

  const calculateWPM = useCallback(() => {
    if (keystrokes.length < 5) return 0;

    const timeInMinutes = typingStats.totalTimeSpent / 60;
    if (timeInMinutes === 0) return 0;

    // Rough estimate: 5 keystrokes = 1 word
    const words = typingStats.totalKeystrokes / 5;
    return Math.round(words / timeInMinutes);
  }, [keystrokes, typingStats]);

  const resetTracking = useCallback(() => {
    setKeystrokes([]);
    setTypingStats({
      totalKeystrokes: 0,
      averageTypingSpeed: 0,
      totalTimeSpent: 0,
      pauseCount: 0,
      backspaceCount: 0,
      copyPasteDetected: false,
    });
    startTime.current = Date.now();
    lastKeystrokeTime.current = 0;
    keydownTimes.current.clear();
  }, []);

  return {
    keystrokes,
    typingStats: {
      ...typingStats,
      averageTypingSpeed: calculateWPM(),
    },
    trackKeyDown,
    trackKeyUp,
    resetTracking,
  };
};
