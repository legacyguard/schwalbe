
export interface DocumentFilter {
  bundleId?: string;
  bundleName?: string;
  category?: string;
  documentType?: string;
  expiringDays?: number;
  isExpiring?: boolean;
  searchQuery?: string;
}

export interface DocumentFilterContextType {
  clearFilter: () => void;
  filter: DocumentFilter;
  hasActiveFilter: boolean;
  setFilter: (filter: DocumentFilter) => void;
}
