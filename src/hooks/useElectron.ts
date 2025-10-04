import { useEffect, useState } from 'react';

// Hook to check if we're running in Electron
export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && !!window.electronAPI);
  }, []);

  return {
    isElectron,
    electronAPI: window.electronAPI,
  };
};

// Example usage in components:
// const { isElectron, electronAPI } = useElectron();
// 
// if (isElectron && electronAPI) {
//   const documents = await electronAPI.getDocuments();
// }

