"use client"

import { createContext, useContext } from "react";

export interface SearchContextType {
  onSearch?: (query: string) => void;
  setSearchHandler: (handler: (query: string) => void) => void;
}

export const SearchContext = createContext<SearchContextType>({
  setSearchHandler: () => {},
});

export const useSearchContext = () => useContext(SearchContext);
