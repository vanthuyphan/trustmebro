// LocalStorage utilities for saving drafts

const STORAGE_KEY = 'verified-editor-drafts';
const CURRENT_DRAFT_KEY = 'verified-editor-current-draft';

export const saveDraft = (draft) => {
  try {
    const drafts = getAllDrafts();
    const existingIndex = drafts.findIndex(d => d.id === draft.id);

    const draftToSave = {
      ...draft,
      updatedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      drafts[existingIndex] = draftToSave;
    } else {
      drafts.push(draftToSave);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    localStorage.setItem(CURRENT_DRAFT_KEY, draft.id);

    return true;
  } catch (error) {
    console.error('Failed to save draft:', error);
    return false;
  }
};

export const getAllDrafts = () => {
  try {
    const draftsJson = localStorage.getItem(STORAGE_KEY);
    return draftsJson ? JSON.parse(draftsJson) : [];
  } catch (error) {
    console.error('Failed to get drafts:', error);
    return [];
  }
};

export const getDraft = (id) => {
  const drafts = getAllDrafts();
  return drafts.find(d => d.id === id);
};

export const getCurrentDraftId = () => {
  return localStorage.getItem(CURRENT_DRAFT_KEY);
};

export const deleteDraft = (id) => {
  try {
    const drafts = getAllDrafts();
    const filtered = drafts.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    if (getCurrentDraftId() === id) {
      localStorage.removeItem(CURRENT_DRAFT_KEY);
    }

    return true;
  } catch (error) {
    console.error('Failed to delete draft:', error);
    return false;
  }
};

export const createNewDraft = () => {
  return {
    id: 'draft_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    title: 'Untitled Document',
    content: '',
    pasteEvents: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const clearAllDrafts = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_DRAFT_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear drafts:', error);
    return false;
  }
};
