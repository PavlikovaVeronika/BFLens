// FileContext.js
"use client";
import { createContext, useContext, useState, useEffect } from "react";

const FileContext = createContext();

export function FileProvider({ children }) {
  const [selectedFile, setSelectedFileState] = useState(null);

  const setSelectedFile = (file) => {
    setSelectedFileState(file);
    if (file) {
      localStorage.setItem("selectedFile", file);
    } else {
      localStorage.removeItem("selectedFile");
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("selectedFile");
    if (stored) setSelectedFileState(stored);
  }, []);

  return (
    <FileContext.Provider value={{ selectedFile, setSelectedFile }}>
      {children}
    </FileContext.Provider>
  );
}

export function useFile() {
  return useContext(FileContext);
}