// Example: Refactored PeopleScreen using centralized API definitions
// BEFORE: Used direct API calls scattered throughout the component
// AFTER: Uses centralized, typed API with consistent error handling

/* global __DEV__ */
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Button, Text } from '@legacyguard/ui';
import { legacyGuardAPI } from '@/api/legacyGuardAPI';
import {
  type Guardian,
  type GuardianInsert,
  LegacyGuardApiError,
} from '@legacyguard/logic';

interface PeopleScreenState {
  error: null | string;
  guardians: Guardian[];
  isLoading: boolean;
  isSubmitting: boolean;
}

export default function PeopleScreenRefactored() {
  const [state, setState] = useState<PeopleScreenState>({
    guardians: [],
    isLoading: true,
    error: null,
    isSubmitting: false,
  });

  // Fetch guardians using centralized API
  const fetchGuardians = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // ✅ NEW: Single method call with full type safety
      const guardians = await legacyGuardAPI.guardians.getAll();

      setState(prev => ({
        ...prev,
        guardians,
        isLoading: false,
      }));
    } catch (error) {
      // ✅ NEW: Consistent error handling
      if (error instanceof LegacyGuardApiError) {
        if (__DEV__) console.log('Guardian fetch failed:', error.message);

        // Handle specific error types
        if (error.isAuthError()) {
          setState(prev => ({
            ...prev,
            error: 'Please sign in to view your guardians',
            isLoading: false,
          }));
        } else if (error.isNetworkError()) {
          setState(prev => ({
            ...prev,
            error: 'Network error. Please check your connection.',
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: error.message,
            isLoading: false,
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          error: 'An unexpected error occurred',
          isLoading: false,
        }));
      }
    }
  };

  // Add new guardian using centralized API
  const addGuardian = async (guardianData: GuardianInsert) => {
    try {
      setState(prev => ({ ...prev, isSubmitting: true }));

      // ✅ NEW: Strongly typed with validation
      const newGuardian = await legacyGuardAPI.guardians.create(guardianData);

      // Update local state
      setState(prev => ({
        ...prev,
        guardians: [newGuardian, ...prev.guardians],
        isSubmitting: false,
      }));

      Alert.alert(
        'Success',
        `${newGuardian.name} has been added as a guardian`
      );
    } catch (error) {
      setState(prev => ({ ...prev, isSubmitting: false }));

      if (error instanceof LegacyGuardApiError) {
        // ✅ NEW: Specific validation error handling
        if (error.status === 400) {
          Alert.alert('Validation Error', error.message);
        } else if (error.isAuthError()) {
          Alert.alert(
            'Authentication Error',
            'Please sign in to add guardians'
          );
        } else {
          Alert.alert('Error', error.message);
        }
      } else {
        Alert.alert('Error', 'Failed to add guardian. Please try again.');
      }
    }
  };

  // Update guardian using centralized API
  const _updateGuardian = async (id: string, updates: Partial<Guardian>) => {
    try {
      // ✅ NEW: Type-safe update with validation
      const updatedGuardian = await legacyGuardAPI.guardians.update(
        id,
        updates
      );

      setState(prev => ({
        ...prev,
        guardians: prev.guardians.map(g => (g.id === id ? updatedGuardian : g)),
      }));

      Alert.alert('Success', 'Guardian updated successfully');
    } catch (error) {
      if (error instanceof LegacyGuardApiError) {
        if (error.status === 404) {
          Alert.alert('Error', 'Guardian not found');
        } else {
          Alert.alert('Error', error.message);
        }
      } else {
        Alert.alert('Error', 'Failed to update guardian');
      }
    }
  };

  // Delete guardian using centralized API
  const deleteGuardian = async (id: string, name: string) => {
    Alert.alert(
      'Delete Guardian',
      `Are you sure you want to remove ${name} as a guardian?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // ✅ NEW: Simple, typed deletion
              await legacyGuardAPI.guardians.delete(id);

              setState(prev => ({
                ...prev,
                guardians: prev.guardians.filter(g => g.id !== id),
              }));

              Alert.alert('Success', `${name} has been removed`);
            } catch (error) {
              if (error instanceof LegacyGuardApiError) {
                Alert.alert('Error', error.message);
              } else {
                Alert.alert('Error', 'Failed to delete guardian');
              }
            }
          },
        },
      ]
    );
  };

  // Get only active guardians
  const _fetchActiveGuardians = async () => {
    try {
      // ✅ NEW: Convenient helper method
      const activeGuardians = await legacyGuardAPI.guardians.getActive();
      setState(prev => ({ ...prev, guardians: activeGuardians }));
    } catch (error) {
      if (__DEV__) console.error('Failed to fetch active guardians:', error);
    }
  };

  // Toggle guardian active status
  const toggleGuardianStatus = async (id: string, currentStatus: boolean) => {
    try {
      // ✅ NEW: Semantic method name
      await legacyGuardAPI.guardians.setActive(id, !currentStatus);

      // Refresh the list
      await fetchGuardians();
    } catch (error) {
      if (error instanceof LegacyGuardApiError) {
        Alert.alert(
          'Error',
          `Failed to ${currentStatus ? 'deactivate' : 'activate'} guardian: ${error.message}`
        );
      }
    }
  };

  useEffect(() => {
    fetchGuardians();
  }, []);

  const { guardians, isLoading, error, isSubmitting } = state;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading guardians...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 16 }}>
          {error}
        </Text>
        <Button onPress={fetchGuardians} title='Try Again' />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        My Trusted Circle
      </Text>

      {guardians.length === 0 ? (
        <View style={{ alignItems: 'center', padding: 40 }}>
          <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 16 }}>
            You haven't added any guardians yet
          </Text>
          <Text
            style={{ textAlign: 'center', color: 'gray', marginBottom: 20 }}
          >
            Add trusted people who can help your family access important
            information when needed.
          </Text>
          <Button
            title='Add First Guardian'
            onPress={() => {
              // Example guardian data - in real app, this would come from a form
              const exampleGuardian: GuardianInsert = {
                user_id: 'current-user-id', // This would be provided automatically
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1-555-0123',
                relationship: 'Brother',
                is_active: true,
              };
              addGuardian(exampleGuardian);
            }}
            disabled={isSubmitting}
          />
        </View>
      ) : (
        <View>
          {guardians.map(guardian => (
            <View
              key={guardian.id}
              style={{
                backgroundColor: 'white',
                padding: 16,
                marginBottom: 12,
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                    {guardian.name}
                  </Text>
                  {guardian.relationship && (
                    <Text style={{ color: 'gray', marginBottom: 8 }}>
                      {guardian.relationship}
                    </Text>
                  )}
                  <Text style={{ marginBottom: 4 }}>📧 {guardian.email}</Text>
                  {guardian.phone && (
                    <Text style={{ marginBottom: 4 }}>📱 {guardian.phone}</Text>
                  )}
                  {guardian.notes && (
                    <Text
                      style={{
                        fontStyle: 'italic',
                        color: 'gray',
                        marginTop: 8,
                      }}
                    >
                      {guardian.notes}
                    </Text>
                  )}
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button
                    title={guardian.is_active ? 'Active' : 'Inactive'}
                    onPress={() =>
                      toggleGuardianStatus(guardian.id, guardian.is_active)
                    }
                    style={{
                      backgroundColor: guardian.is_active ? 'green' : 'gray',
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                    }}
                  />
                  <Button
                    title='Delete'
                    onPress={() => deleteGuardian(guardian.id, guardian.name)}
                    style={{
                      backgroundColor: 'red',
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                    }}
                  />
                </View>
              </View>
            </View>
          ))}

          <Button
            title='Add Another Guardian'
            onPress={() => {
              // In a real app, this would open a form modal
              if (__DEV__) console.log('Open guardian form');
            }}
            style={{ marginTop: 20 }}
          />
        </View>
      )}
    </ScrollView>
  );
}

/**
 * Key Improvements in this refactored version:
 *
 * ✅ TYPE SAFETY
 * - Full TypeScript support with Supabase-generated types
 * - Compile-time error checking
 * - Auto-completion in IDE
 *
 * ✅ CENTRALIZED API CALLS
 * - All guardian operations through legacyGuardAPI.guardians
 * - No scattered API logic throughout the component
 * - Consistent interface across all operations
 *
 * ✅ COMPREHENSIVE ERROR HANDLING
 * - LegacyGuardApiError provides detailed error information
 * - Different error types handled appropriately
 * - User-friendly error messages
 *
 * ✅ VALIDATION
 * - Automatic validation on all API calls
 * - Clear validation error messages
 * - No invalid requests sent to backend
 *
 * ✅ SEMANTIC METHODS
 * - guardians.getActive() instead of manual filtering
 * - guardians.setActive() instead of generic update
 * - Clear, intent-revealing method names
 *
 * ✅ RETRY LOGIC
 * - Automatic retry for network errors (built into API layer)
 * - Exponential backoff for failed requests
 * - Better reliability in poor network conditions
 *
 * ✅ REDUCED BOILERPLATE
 * - Less code needed for common operations
 * - No manual error handling boilerplate
 * - Cleaner, more readable component code
 */
