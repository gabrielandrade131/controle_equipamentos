import { useState, useEffect } from 'react';
import { FilterType } from '../types/filters';

export const useFilters = (storageKey: string, initialFilters: FilterType = {}) => {
  const [filters, setFilters] = useState<FilterType>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : initialFilters;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(filters));
  }, [filters, storageKey]);

  const updateFilters = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return { filters, updateFilters, clearFilters };
};
