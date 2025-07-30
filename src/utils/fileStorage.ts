// utils/fileStorage.ts

const FILE_ID_KEY = "isiPython_fileId";

// Save fileId to localStorage (overrides any existing one)
export const saveFileIdToLocalStorage = (fileId: string) => {
  localStorage.setItem(FILE_ID_KEY, fileId);
};

// Retrieve fileId from localStorage
export const getFileIdFromLocalStorage = (): string | null => {
  return localStorage.getItem(FILE_ID_KEY);
};

// Optional: Clear the fileId from localStorage
export const clearFileIdFromLocalStorage = () => {
  localStorage.removeItem(FILE_ID_KEY);
};
