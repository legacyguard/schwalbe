import { useState, useCallback, useRef, useEffect } from 'react';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface ApiOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  abortOnUnmount?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Base API hook for common patterns
 */
export function useApi<T = any>(options: ApiOptions = {}) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const {
    retries = 0,
    retryDelay = 1000,
    timeout = 10000,
    onSuccess,
    onError,
    abortOnUnmount = true
  } = options;

  useEffect(() => {
    return () => {
      if (abortOnUnmount && abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [abortOnUnmount]);

  const execute = useCallback(async (
    apiCall: (signal: AbortSignal) => Promise<T>
  ): Promise<T | null> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false
    }));

    let lastError: string | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Timeout wrapper
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeout);
        });

        const result = await Promise.race([
          apiCall(signal),
          timeoutPromise
        ]);

        setState({
          data: result,
          loading: false,
          error: null,
          success: true
        });

        onSuccess?.(result);
        return result;

      } catch (error: any) {
        if (signal.aborted) {
          setState(prev => ({ ...prev, loading: false }));
          return null;
        }

        lastError = error.message || 'An unexpected error occurred';

        // Don't retry on certain errors
        if (error.status === 401 || error.status === 403 || error.status === 404) {
          break;
        }

        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    setState({
      data: null,
      loading: false,
      error: lastError,
      success: false
    });

    onError?.(lastError || 'Request failed');
    return null;
  }, [retries, retryDelay, timeout, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    ...state,
    execute,
    reset,
    abort
  };
}

/**
 * Hook for CRUD operations
 */
export function useCrud<T = any>(baseUrl: string, options: ApiOptions = {}) {
  const api = useApi<T>(options);

  const create = useCallback(async (data: Partial<T>) => {
    return api.execute(async (signal) => {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    });
  }, [api, baseUrl]);

  const read = useCallback(async (id?: string) => {
    return api.execute(async (signal) => {
      const url = id ? `${baseUrl}/${id}` : baseUrl;
      const response = await fetch(url, { signal });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    });
  }, [api, baseUrl]);

  const update = useCallback(async (id: string, data: Partial<T>) => {
    return api.execute(async (signal) => {
      const response = await fetch(`${baseUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    });
  }, [api, baseUrl]);

  const remove = useCallback(async (id: string) => {
    return api.execute(async (signal) => {
      const response = await fetch(`${baseUrl}/${id}`, {
        method: 'DELETE',
        signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.ok;
    });
  }, [api, baseUrl]);

  return {
    ...api,
    create,
    read,
    update,
    remove
  };
}

/**
 * Hook for paginated data
 */
export function usePaginatedApi<T = any>(
  baseUrl: string,
  initialParams: PaginationParams = { page: 1, limit: 10 },
  options: ApiOptions = {}
) {
  const [params, setParams] = useState<PaginationParams>(initialParams);
  const api = useApi<PaginatedResponse<T>>(options);

  const fetchPage = useCallback(async (newParams?: Partial<PaginationParams>) => {
    const finalParams = { ...params, ...newParams };
    setParams(finalParams);

    return api.execute(async (signal) => {
      const searchParams = new URLSearchParams({
        page: finalParams.page.toString(),
        limit: finalParams.limit.toString(),
        ...(finalParams.offset && { offset: finalParams.offset.toString() })
      });

      const response = await fetch(`${baseUrl}?${searchParams}`, { signal });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    });
  }, [api, baseUrl, params]);

  const nextPage = useCallback(() => {
    if (api.data?.hasNext) {
      fetchPage({ page: params.page + 1 });
    }
  }, [api.data?.hasNext, fetchPage, params.page]);

  const prevPage = useCallback(() => {
    if (api.data?.hasPrev) {
      fetchPage({ page: params.page - 1 });
    }
  }, [api.data?.hasPrev, fetchPage, params.page]);

  const goToPage = useCallback((page: number) => {
    fetchPage({ page });
  }, [fetchPage]);

  const changeLimit = useCallback((limit: number) => {
    fetchPage({ page: 1, limit });
  }, [fetchPage]);

  return {
    ...api,
    params,
    fetchPage,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    refresh: () => fetchPage()
  };
}

/**
 * Hook for form submission with API integration
 */
export function useFormApi<T = any, R = any>(
  submitFn: (data: T) => Promise<R>,
  options: ApiOptions = {}
) {
  const api = useApi<R>(options);

  const submit = useCallback(async (data: T) => {
    return api.execute(async () => {
      return await submitFn(data);
    });
  }, [api, submitFn]);

  return {
    ...api,
    submit
  };
}

/**
 * Hook for file upload
 */
export function useFileUpload(
  uploadUrl: string,
  options: ApiOptions & {
    onProgress?: (progress: number) => void;
    maxSize?: number;
    allowedTypes?: string[];
  } = {}
) {
  const [progress, setProgress] = useState(0);
  const api = useApi<{ url: string; fileName: string }>(options);

  const upload = useCallback(async (file: File) => {
    const { maxSize, allowedTypes, onProgress } = options;

    // Validate file size
    if (maxSize && file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize} bytes`);
    }

    // Validate file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    return api.execute(async (signal) => {
      const formData = new FormData();
      formData.append('file', file);

      return new Promise<{ url: string; fileName: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progressPercent = (event.loaded / event.total) * 100;
            setProgress(progressPercent);
            onProgress?.(progressPercent);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });

        signal.addEventListener('abort', () => {
          xhr.abort();
        });

        xhr.open('POST', uploadUrl);
        xhr.send(formData);
      });
    });
  }, [api, uploadUrl, options]);

  return {
    ...api,
    upload,
    progress
  };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate<T = any>(
  initialData: T[],
  updateFn: (id: string, data: Partial<T>) => Promise<T>
) {
  const [items, setItems] = useState<T[]>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);

  const optimisticUpdate = useCallback(async (
    id: string,
    updates: Partial<T>,
    optimisticData?: Partial<T>
  ) => {
    setIsUpdating(true);

    // Apply optimistic update
    const rollbackData = [...items];
    setItems(prev => prev.map(item =>
      (item as any).id === id
        ? { ...item, ...(optimisticData || updates) }
        : item
    ));

    try {
      const updatedItem = await updateFn(id, updates);
      setItems(prev => prev.map(item =>
        (item as any).id === id ? updatedItem : item
      ));
      return updatedItem;
    } catch (error) {
      // Rollback on error
      setItems(rollbackData);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [items, updateFn]);

  return {
    items,
    setItems,
    isUpdating,
    optimisticUpdate
  };
}