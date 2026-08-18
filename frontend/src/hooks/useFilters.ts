import { useState, useEffect } from 'react';
import { FilterType } from '../types/filters';

export const useFilters = (
  storageKey: string,
  initialFilters: FilterType = {},
  persist = true,
) => {
  const [filters, setFilters] = useState<FilterType>(() => {
    if (!persist) return initialFilters;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return initialFilters;

    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(storageKey);
      return initialFilters;
    }
  });

  useEffect(() => {
    if (!persist) return;
    localStorage.setItem(storageKey, JSON.stringify(filters));
  }, [filters, storageKey, persist]);

  const updateFilters = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return { filters, updateFilters, clearFilters };
};
