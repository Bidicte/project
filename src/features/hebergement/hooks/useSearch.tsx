// ===== src/hooks/useSearch.tsx =====
import { useState, useCallback } from 'react';

export const useSearch = (initialValue: string = '') => {
  const [searchValue, setSearchValue] = useState(initialValue);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchValue('');
  }, []);

  return {
    searchValue,
    handleSearchChange,
    clearSearch
  };
};

