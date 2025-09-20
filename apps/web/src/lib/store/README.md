# Centralized State Management System

This directory contains a comprehensive state management solution that consolidates all application state into a unified, type-safe, and persistent system.

## Overview

The state management system addresses the following issues identified in the codebase:
- Mixed patterns (localStorage + Context + Zustand)
- No centralized validation
- Missing cross-tab synchronization
- Inconsistent persistence strategies

## Architecture

### Core Components

1. **Central Store** (`index.ts`) - Main Zustand store with all application state
2. **Type Definitions** (`types.ts`) - Comprehensive TypeScript interfaces
3. **Validation System** (`validation.ts`) - State validation with auto-fix capabilities
4. **Persistence Strategies** (`persistence.ts`) - Multiple storage backends with fallback
5. **Cross-tab Sync** (`sync.ts`) - Real-time synchronization between browser tabs
6. **Custom Middleware** (`middleware.ts`) - Enhanced Zustand middleware for validation and sync
7. **Store Provider** (`StoreProvider.tsx`) - React component for initialization

### State Slices

The store is organized into logical slices:

- **App State**: UI state, modals, notifications, loading states
- **Wizard State**: Will wizard progress, validation, drafts
- **Assets State**: User assets, filters, summaries
- **Preferences State**: User preferences, unsaved changes

## Usage

### Basic Store Usage

```tsx
import { useAppStore } from '@/lib/store'

function MyComponent() {
  // Select specific state
  const assets = useAppStore(state => state.assets)
  const isLoading = useAppStore(state => state.loading.global)

  // Use actions
  const addAsset = useAppStore(state => state.addAsset)
  const setGlobalLoading = useAppStore(state => state.setGlobalLoading)

  return (
    <div>
      {isLoading ? 'Loading...' : `${assets.length} assets`}
      <button onClick={() => addAsset(newAsset)}>Add Asset</button>
    </div>
  )
}
```

### Using Derived Selectors (Optimized)

```tsx
import { useAppStoreSelectors } from '@/lib/store'

function MyComponent() {
  const { isLoading, hasUnreadNotifications, filteredAssets } = useAppStoreSelectors()

  return (
    <div>
      {hasUnreadNotifications && <NotificationBadge />}
      {filteredAssets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
    </div>
  )
}
```

### Wizard Integration

```tsx
import { useWizardStore } from '@/features/will/wizard/hooks/useWizardStore'

function WizardStep() {
  const {
    state,
    currentStep,
    canProceedToNext,
    validationErrors,
    updateState,
    goNext,
    saveDraft
  } = useWizardStore()

  return (
    <form onSubmit={e => {
      e.preventDefault()
      if (canProceedToNext) goNext()
    }}>
      {/* Form fields */}
      {validationErrors[currentStep]?.map(error => (
        <div key={error} className="error">{error}</div>
      ))}
      <button type="submit" disabled={!canProceedToNext}>Next</button>
    </form>
  )
}
```

### State Validation

```tsx
import { useStateValidation, userPreferencesValidation } from '@/lib/store/validation'

function PreferencesForm() {
  const [preferences, setPreferences] = useState(initialPreferences)

  const { isValid, errors, fixedState, hasAutoFixes } = useStateValidation(
    preferences,
    userPreferencesValidation,
    { autoFix: true, context: 'preferences_form' }
  )

  // Use fixedState if auto-fixes were applied
  useEffect(() => {
    if (hasAutoFixes) {
      setPreferences(fixedState)
    }
  }, [hasAutoFixes, fixedState])

  return (
    <form>
      {Object.entries(errors).map(([field, fieldErrors]) => (
        <div key={field}>
          {fieldErrors.map(error => <span className="error">{error}</span>)}
        </div>
      ))}
    </form>
  )
}
```

### Cross-tab Synchronization

```tsx
import { useTabSync } from '@/lib/store/sync'

function SyncAwareComponent() {
  const handleSync = useCallback((event) => {
    console.log('State synchronized:', event.path, event.value)
  }, [])

  const { broadcast, getStats } = useTabSync('my-feature', handleSync, {
    syncFields: ['preferences', 'drafts'],
    conflictResolution: 'timestamp'
  })

  const handleChange = (field: string, value: any) => {
    // Update local state
    updateLocalState(field, value)

    // Broadcast to other tabs
    broadcast(field, value)
  }

  return <div>...</div>
}
```

### Persistence Strategies

```tsx
import { persistenceManager, SupabaseStrategy } from '@/lib/store/persistence'

// Save with multiple strategies
await persistenceManager.save('user-data', userData, {
  syncToAll: true // Save to all available strategies
})

// Load with conflict resolution
const data = await persistenceManager.load('user-data', {
  mergeStrategy: 'latest' // Use most recent data
})

// Use specific strategy
const supabaseStrategy = new SupabaseStrategy('custom_table')
await supabaseStrategy.save('key', data)
```

## Migration Guide

### From Context to Store

**Before:**
```tsx
// Old Context pattern
const { state, setState } = useWizard()

useEffect(() => {
  localStorage.setItem('wizard_state', JSON.stringify(state))
}, [state])
```

**After:**
```tsx
// New Store pattern
const { state, updateState } = useWizardStore()
// Persistence is automatic with validation and sync
```

### From localStorage to Persistence Manager

**Before:**
```tsx
// Manual localStorage management
const savePreferences = (prefs) => {
  try {
    localStorage.setItem('preferences', JSON.stringify(prefs))
  } catch (error) {
    console.error('Save failed:', error)
  }
}
```

**After:**
```tsx
// Managed persistence with fallbacks
const savePreferences = useAppStore(state => state.savePreferences)
// Handles Supabase, IndexedDB, localStorage automatically
```

### Component Integration

1. **Replace Context Providers**: Remove individual context providers and use `StoreProvider`
2. **Update Hook Usage**: Replace `useContext` calls with `useAppStore` selectors
3. **Migrate State**: Move state from component state/context to store slices
4. **Add Validation**: Implement validation rules for critical state

## Best Practices

### Performance Optimization

1. **Use Specific Selectors**: Select only the state you need
   ```tsx
   // Good
   const assets = useAppStore(state => state.assets)

   // Avoid
   const store = useAppStore()
   ```

2. **Use Derived Selectors**: For computed state that depends on multiple values
   ```tsx
   const filteredAssets = useAppStore(state =>
     state.assets.filter(asset => asset.category === state.filters.category)
   )
   ```

3. **Memoize Selectors**: For expensive computations
   ```tsx
   const expensiveComputation = useAppStore(
     useCallback(state => computeExpensiveValue(state.data), [])
   )
   ```

### State Organization

1. **Keep State Flat**: Avoid deep nesting in state structure
2. **Normalize Data**: Use IDs for relationships between entities
3. **Separate Concerns**: Keep UI state separate from business logic state
4. **Use TypeScript**: Leverage full type safety for state and actions

### Error Handling

1. **Graceful Degradation**: Always provide fallbacks for persistence failures
2. **Validation**: Validate state before critical operations
3. **Logging**: Use structured logging for debugging state issues
4. **Recovery**: Implement auto-recovery mechanisms where possible

## Testing

### Unit Testing Store

```tsx
import { useAppStore } from '@/lib/store'
import { renderHook, act } from '@testing-library/react'

describe('App Store', () => {
  beforeEach(() => {
    // Reset store state
    useAppStore.getState().reset()
  })

  it('should add notification', () => {
    const { result } = renderHook(() => useAppStore())

    act(() => {
      result.current.addNotification({
        type: 'info',
        title: 'Test',
        message: 'Test message'
      })
    })

    expect(result.current.notifications.items).toHaveLength(1)
    expect(result.current.notifications.unreadCount).toBe(1)
  })
})
```

### Integration Testing

```tsx
describe('Wizard Integration', () => {
  it('should persist wizard state', async () => {
    const { result } = renderHook(() => useWizardStore())

    // Update wizard state
    act(() => {
      result.current.updateState({ jurisdiction: 'CZ' })
    })

    // Save draft
    await act(async () => {
      await result.current.saveDraft()
    })

    expect(result.current.isDirty).toBe(false)
    expect(result.current.lastSaved).toBeDefined()
  })
})
```

## Advanced Features

### Custom Middleware

You can extend the store with custom middleware:

```tsx
import { stateValidator, tabSync } from '@/lib/store/middleware'

const customStore = create(
  stateValidator(customValidationRules)(
    tabSync({ key: 'custom-store' })(
      (set, get) => ({
        // Store implementation
      })
    )
  )
)
```

### State Debugging

In development, use the debug hook:

```tsx
import { useStoreDebug } from '@/lib/store/StoreProvider'

function DebugPanel() {
  const debug = useStoreDebug()

  if (!debug) return null // Production build

  return (
    <div>
      <h3>Store Stats</h3>
      <pre>{JSON.stringify(debug.stats, null, 2)}</pre>
      <button onClick={debug.actions.reset}>Reset Store</button>
    </div>
  )
}
```

### Performance Monitoring

Monitor store performance:

```tsx
// Subscribe to all state changes
useAppStore.subscribe((state, prevState) => {
  // Log performance metrics
  console.log('State changed:', {
    timestamp: Date.now(),
    changedFields: Object.keys(state).filter(key => state[key] !== prevState[key])
  })
})
```

## Troubleshooting

### Common Issues

1. **State Not Persisting**: Check if persistence strategies are available
2. **Cross-tab Sync Not Working**: Verify localStorage permissions and same-origin policy
3. **Validation Errors**: Check validation rules and auto-fix capabilities
4. **Performance Issues**: Use specific selectors instead of full store subscriptions

### Debug Tools

1. **Redux DevTools**: The store is compatible with Redux DevTools browser extension
2. **Zustand DevTools**: Use built-in Zustand debugging features
3. **Console Logging**: Enable debug logging for persistence and sync operations
4. **Store Inspector**: Use the `useStoreDebug` hook in development

## Future Enhancements

1. **Offline Support**: Enhanced offline capabilities with conflict resolution
2. **Real-time Sync**: WebSocket-based real-time synchronization
3. **State Snapshots**: Point-in-time state recovery
4. **Advanced Analytics**: State change analytics and insights
5. **Plugin System**: Extensible plugin architecture for custom features