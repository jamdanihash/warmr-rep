import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface Profile {
  company_name: string;
  industry: string;
  location: string;
  description: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined';
  request_message: string | null;
  created_at: string;
  requester_profile: Profile;
  recipient_profile: Profile;
}

interface ConnectionState {
  connections: Connection[];
  loading: boolean;
  error: string | null;
}

export function useConnections() {
  const [state, setState] = useState<ConnectionState>({
    connections: [],
    loading: true,
    error: null
  });

  const fetchConnections = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          requester_profile:profiles!requester_id(
            company_name,
            industry,
            location,
            description
          ),
          recipient_profile:profiles!recipient_id(
            company_name,
            industry,
            location,
            description
          )
        `)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        connections: data || [],
        loading: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load connections',
        loading: false
      }));
    }
  }, []);

  const updateConnection = useCallback(async (connectionId: string, status: 'accepted' | 'declined') => {
    try {
      setState(prev => ({ ...prev, error: null }));

      const { error } = await supabase
        .from('connections')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId);

      if (error) throw error;
      await fetchConnections();
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to update connection'
      }));
    }
  }, [fetchConnections]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return {
    ...state,
    fetchConnections,
    updateConnection
  };
}