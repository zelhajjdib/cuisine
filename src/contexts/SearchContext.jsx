import React, { createContext, useContext, useState, useCallback } from 'react';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [shouldFocusSearch, setShouldFocusSearch] = useState(false);

  const triggerSearch = useCallback(() => {
    setShouldFocusSearch(true);
  }, []);

  const clearSearchFocus = useCallback(() => {
    setShouldFocusSearch(false);
  }, []);

  return (
    <SearchContext.Provider value={{ 
      globalSearchQuery, 
      setGlobalSearchQuery,
      shouldFocusSearch,
      triggerSearch,
      clearSearchFocus
    }}>
      {children}
    </SearchContext.Provider>
  );
};
