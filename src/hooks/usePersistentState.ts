import { useState, useEffect } from 'react';

export function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item);
      }
    } catch (error) {
      console.warn(`Error parsing localStorage for ${key}`, error);
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      if (state === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (error) {
      console.warn(`Error setting localStorage for ${key}`, error);
    }
  }, [key, state]);

  return [state, setState];
}
