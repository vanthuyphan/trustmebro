import { useState, useCallback, useRef } from 'react';

export const useVersionHistory = () => {
  const [versions, setVersions] = useState([]);
  const saveTimeoutRef = useRef();

  const saveVersion = useCallback((content) => {
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const charCount = content.length;

    const newVersion = {
      id: `v_${Date.now()}`,
      content,
      timestamp: Date.now(),
      charCount,
      wordCount,
    };

    setVersions(prev => [...prev, newVersion]);
  }, []);

  const autoSaveVersion = useCallback((content) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Save version after 2 seconds of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      if (content.trim()) {
        saveVersion(content);
      }
    }, 2000);
  }, [saveVersion]);

  const getVersionCount = useCallback(() => versions.length, [versions]);

  const getLatestVersion = useCallback(() => {
    return versions[versions.length - 1] || null;
  }, [versions]);

  return {
    versions,
    saveVersion,
    autoSaveVersion,
    getVersionCount,
    getLatestVersion,
  };
};
