import { useAuth } from '@/src/context/AuthContext';
import { addConnection, getConnections, removeConnection, searchUsers } from '@/src/lib/connections';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert } from 'react-native';

export function useConnectionsData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // We keep track of the search term here so we don't spam the DB on every keystroke
  const [activeSearchTerm, setActiveSearchTerm] = useState('');

  // 1. Fetch Current Connections
  const {
    data: connectionsData,
    isLoading: isLoadingConnections,
    isRefetching: isRefetchingConnections,
    refetch: refetchConnections,
  } = useQuery({
    queryKey: ['connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return { data: [], tableMissing: false };
      console.log('Fetching connections...');
      const { data, error, tableMissing } = await getConnections(user.id);
      if (error && !tableMissing) throw new Error(error.message);
      
      return { data: data ?? [], tableMissing: !!tableMissing };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const connections = connectionsData?.data ?? [];
  const isTableMissing = connectionsData?.tableMissing ?? false;

  // 2. Fetch Search Results
  const {
    data: searchResults = [],
    isFetching: isSearching,
  } = useQuery({
    queryKey: ['userSearch', activeSearchTerm, user?.id],
    queryFn: async () => {
      if (!user?.id || !activeSearchTerm.trim()) return [];

      // Exclude currently connected users and ourselves from the search results
      const excludeIds = [user.id, ...connections.map(c => c.id)];

      const { data, error } = await searchUsers(activeSearchTerm, excludeIds, user.id);
      if (error) throw new Error(error.message);
      
      return data ?? [];
    },
    enabled: !!user?.id && activeSearchTerm.trim().length > 0,
  });

  // 3. Add Connection Mutation
  const addConnectionMutation = useMutation({
    mutationFn: async (targetUserId) => {
      await addConnection(user.id, targetUserId);
    },
    onSuccess: () => {
      // Refresh both lists instantly!
      queryClient.invalidateQueries({ queryKey: ['connections', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userSearch'] });
    },
    onError: (err) => Alert.alert('Error adding connection', err.message),
  });

  // 4. Remove Connection Mutation
  const removeConnectionMutation = useMutation({
    mutationFn: async (otherUserId) => {
      await removeConnection(otherUserId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections', user?.id] });
    },
    onError: (err) => Alert.alert('Error removing connection', err.message),
  });

  return {
    user,
    connections,
    isTableMissing,
    isLoadingConnections,
    isRefetchingConnections,
    refetchConnections,
    
    searchResults,
    isSearching,
    performSearch: setActiveSearchTerm, // <-- Fix applied here
    
    addConnection: addConnectionMutation.mutateAsync,
    isAdding: addConnectionMutation.isPending,
    
    removeConnection: removeConnectionMutation.mutateAsync,
    isRemoving: removeConnectionMutation.isPending,
  };
}