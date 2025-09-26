import { useState, useEffect, useMemo } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useSearch = (items, searchFields, searchQuery) => {
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredItems = useMemo(() => {
    // Safety check for undefined items
    if (!items || !Array.isArray(items)) return [];
    if (!debouncedSearchQuery.trim()) return items;

    return items.filter(item => {
      return searchFields.some(field => {
        const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], item);
        return fieldValue?.toString().toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      });
    });
  }, [items, searchFields, debouncedSearchQuery]);

  return filteredItems;
};