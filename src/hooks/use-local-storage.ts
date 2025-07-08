'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  // State to store our value. Initialize with the initialValue to ensure
  // server-side and initial client-side renders are the same.
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  
  // State to track if the component has mounted. We'll use this to avoid
  // writing to localStorage on the server or on the initial client render.
  const [hasMounted, setHasMounted] = useState(false);

  // This effect runs once after the component mounts on the client.
  useEffect(() => {
    setHasMounted(true);
    try {
      const item = window.localStorage.getItem(key);
      // If a value exists in localStorage, parse it and update the state.
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // This effect runs whenever the stored value changes, but only after the component has mounted.
  useEffect(() => {
    if (hasMounted) {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue, hasMounted]);

  return [storedValue, setStoredValue];
}
