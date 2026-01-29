"use client";

import { useState, createContext, useContext } from "react";
import { PrimaryHeader } from "@/components/core-components/primary-header";
import Footer from "@/components/core-components/footer";
import { useHeaderIntersection } from "@/hooks/useHeaderIntersection";

interface SearchContextType {
  onSearch: ((query: string) => void) | undefined;
  setSearchHandler: (handler: (query: string) => void) => void;
}

const SearchContext = createContext<SearchContextType>({
  setSearchHandler: () => { },
  onSearch: undefined
});

export const useSearchContext = () => useContext(SearchContext);

export default function PublicPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerRef, outOfView] = useHeaderIntersection();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchHandler, setSearchHandlerState] = useState<((query: string) => void) | undefined>();

  const setSearchHandler = (handler: (query: string) => void) => {
    setSearchHandlerState(() => handler);
  };

  return (
    <SearchContext.Provider value={{ onSearch: searchHandler, setSearchHandler }}>
      <PrimaryHeader
        menuActive={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
        onSearch={searchHandler}
      />
      <div ref={headerRef} />
      <main className="pt-14 w-full">
        {children}
      </main>
      <Footer />
    </SearchContext.Provider>
  );
}
