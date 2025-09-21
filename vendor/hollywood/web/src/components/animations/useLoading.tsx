
import React from 'react';

// Context for managing loading states
interface LoadingContextType {
  isLoading: boolean;
  loadingText?: string;
  setLoading: (loading: boolean, text?: string) => void;
}

const LoadingContext = React.createContext<LoadingContextType>({
  isLoading: false,
  setLoading: () => {},
});

export const LoadingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingText, setLoadingText] = React.useState<string>();

  const setLoading = (loading: boolean, text?: string) => {
    setIsLoading(loading);
    setLoadingText(text);
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        ...(loadingText ? { loadingText } : {}),
        setLoading
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => React.useContext(LoadingContext);
