// utils/storage.ts
export interface EditorState {
  code: string;
  fileName: string;
  fileId?: string | null; // Add fileId to the interface
  hasUnsavedChanges: boolean;
  lastModified: number;
}

export interface AppState {
  currentView: string;
  editorState: EditorState | null;
  lastRoute: string;
}

const STORAGE_KEY = "isipython_ide_state";

export const saveState = (state: Partial<AppState>) => {
  try {
    const existingState = loadState();
    const newState = { ...existingState, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } catch (error) {
    console.warn("Failed to save state to localStorage:", error);
  }
};

export const loadState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn("Failed to load state from localStorage:", error);
  }

  return {
    currentView: "home",
    editorState: null,
    lastRoute: "/dash",
  };
};

export const saveEditorState = (editorState: EditorState) => {
  saveState({
    editorState: {
      ...editorState,
      lastModified: Date.now(),
    },
  });
};

export const saveCurrentView = (view: string) => {
  saveState({ currentView: view });
};

export const saveCurrentRoute = (route: string) => {
  saveState({ lastRoute: route });
};

export const clearEditorState = () => {
  saveState({ editorState: null });
};
