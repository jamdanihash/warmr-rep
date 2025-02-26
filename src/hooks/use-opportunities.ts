import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UseOpportunitiesParams {
  type: 'buying' | 'selling';
  searchTerm?: string;
  industries?: string[];
  locations?: string[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

interface Opportunity {
  id: string;
  type: 'buying' | 'selling';
  business_name: string;
  industry: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  location: string;
  created_at: string;
  user_id: string;
  company_size: string;
  timeline: string;
  budget_min: number | null;
  budget_max: number | null;
  requirements: string;
  preferred_contact: 'email' | 'phone';
}

export function useOpportunities({
  type,
  searchTerm = '',
  industries = [],
  locations = [],
  sortBy = 'date',
  sortDirection = 'desc'
}: UseOpportunitiesParams) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        let query = supabase
          .from('opportunities')
          .select('*')
          .eq('type', type);

        // Apply search filter
        if (searchTerm) {
          query = query.or(`business_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        // Apply industry filter
        if (industries.length > 0) {
          query = query.in('industry', industries);
        }

        // Apply location filter
        if (locations.length > 0) {
          query = query.in('location', locations);
        }

        // Apply sorting
        const sortColumn = sortBy === 'date' ? 'created_at' : sortBy;
        query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

        const { data } = await query;
        setOpportunities(data || []);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setOpportunities([]);
      }
    }

    fetchOpportunities();
  }, [type, searchTerm, industries, locations, sortBy, sortDirection]);

  return { opportunities };
}