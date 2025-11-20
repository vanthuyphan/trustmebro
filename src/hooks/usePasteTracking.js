import { useState, useCallback } from 'react';

export const usePasteTracking = () => {
  const [pasteEvents, setPasteEvents] = useState([]);

  const trackPaste = useCallback((pastedText, position, totalLength) => {
    const pasteEvent = {
      id: `paste_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: pastedText,
      position: position,
      length: pastedText.length,
      timestamp: Date.now(),
      type: 'unknown', // Will be: 'quote', 'citation', 'link', 'own-work', or 'unknown'
      justified: false,
      note: '',
    };

    setPasteEvents(prev => [...prev, pasteEvent]);
    return pasteEvent.id;
  }, []);

  const annotatePaste = useCallback((pasteId, type, note = '') => {
    setPasteEvents(prev =>
      prev.map(event =>
        event.id === pasteId
          ? { ...event, type, justified: true, note }
          : event
      )
    );
  }, []);

  const removePasteAnnotation = useCallback((pasteId) => {
    setPasteEvents(prev =>
      prev.map(event =>
        event.id === pasteId
          ? { ...event, type: 'unknown', justified: false, note: '' }
          : event
      )
    );
  }, []);

  const getPasteStats = useCallback(() => {
    const total = pasteEvents.length;
    const justified = pasteEvents.filter(e => e.justified).length;
    const unjustified = total - justified;

    const byType = pasteEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    const totalPastedChars = pasteEvents.reduce((sum, event) => sum + event.length, 0);

    return {
      total,
      justified,
      unjustified,
      byType,
      totalPastedChars,
      hasUnjustified: unjustified > 0,
    };
  }, [pasteEvents]);

  const loadPasteEvents = useCallback((events) => {
    setPasteEvents(events || []);
  }, []);

  const clearPasteEvents = useCallback(() => {
    setPasteEvents([]);
  }, []);

  return {
    pasteEvents,
    trackPaste,
    annotatePaste,
    removePasteAnnotation,
    getPasteStats,
    loadPasteEvents,
    clearPasteEvents,
  };
};
