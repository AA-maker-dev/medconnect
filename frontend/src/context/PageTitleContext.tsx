import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface PageTitleContextValue {
  title: string;
  setTitle: (title: string) => void;
}

const PageTitleContext = createContext<PageTitleContextValue | undefined>(undefined);

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('Dashboard');
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>{children}</PageTitleContext.Provider>
  );
}

export function usePageTitleContext() {
  const ctx = useContext(PageTitleContext);
  if (!ctx) throw new Error('usePageTitleContext must be used within a PageTitleProvider');
  return ctx;
}

/** Call from any dashboard page to set the topbar title on mount. */
export function useSetPageTitle(title: string) {
  const { setTitle } = usePageTitleContext();
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
}
