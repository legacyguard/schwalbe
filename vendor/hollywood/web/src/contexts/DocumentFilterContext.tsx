
import React, {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from 'react';

export interface DocumentFilter {
  bundleId?: string;
  bundleName?: string;
  category?: string;
  documentType?: string;
  expiringDays?: number;
  isExpiring?: boolean;
  searchQuery?: string;
}

interface DocumentFilterContextType {
  clearFilter: () => void;
  filter: DocumentFilter;
  hasActiveFilter: boolean;
  setFilter: (filter: DocumentFilter) => void;
}

const DocumentFilterContext = createContext<
  DocumentFilterContextType | undefined
>(undefined);

export const useDocumentFilter = () => {
  const context = useContext(DocumentFilterContext);
  if (!context) {
    throw new Error(
      'useDocumentFilter must be used within a DocumentFilterProvider'
    );
  }
  return context;
};

interface DocumentFilterProviderProps {
  children: ReactNode;
}

export const DocumentFilterProvider: React.FC<DocumentFilterProviderProps> = ({
  children,
}) => {
  const [filter, setFilterState] = useState<DocumentFilter>({});

  const setFilter = (newFilter: DocumentFilter) => {
    setFilterState(newFilter);
  };

  const clearFilter = () => {
    setFilterState({});
  };

  const hasActiveFilter = Object.keys(filter).some(key => {
    const value = filter[key as keyof DocumentFilter];
    return value !== undefined && value !== '' && value !== null;
  });

  return (
    <DocumentFilterContext.Provider
      value={{
        filter,
        setFilter,
        clearFilter,
        hasActiveFilter,
      }}
    >
      {children}
    </DocumentFilterContext.Provider>
  );
};
