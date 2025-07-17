'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  // State to store our value. We initialize with the initialValue to ensure
  // the server-side render and the first client-side render are identical.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // This effect runs *only once* on the client after the component mounts.
  useEffect(() => {
    try {
      // We read from localStorage inside useEffect, which only runs on the client.
      const item = window.localStorage.getItem(key);
      // If a value exists, we parse it and update our state.
      // This will trigger a re-render, but it happens after the initial hydration is complete.
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  // The empty dependency array ensures this effect runs only once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // This effect runs whenever the stored value changes, saving it to localStorage.
  useEffect(() => {
    // We don't want to write the initialValue to localStorage on the first render,
    // so we can check if it's different from the initial value.
    if (storedValue !== initialValue) {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue, initialValue]);

  return [storedValue, setStoredValue];
}
