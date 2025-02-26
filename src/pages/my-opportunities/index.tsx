import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, Building2, MapPin, Target, ChevronDown, Star, MessageSquare, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow, format } from 'date-fns';

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
}

interface BoardOpportunity {
  id: string;
  type: 'buying' | 'selling';
  business_name: string;
  industry: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  location: string;
  created_at: string;
}

export function MyOpportunitiesPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<OpportunityStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [opportunities] = useState<Opportunity[]>([]);
  const [boardOpportunities, setBoardOpportunities] = useState<BoardOpportunity[]>([]);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBoardOpportunities();
  }, []);

  const fetchBoardOpportunities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBoardOpportunities(data || []);
    } catch (err) {
      console.error('Error fetching board opportunities:', err);
      setError('Failed to load your posted opportunities');
    } finally {
      setLoadingBoard(false);
    }
  };

  const handleDelete = async (opportunityId: string) => {
    try {
      setDeleteLoading(opportunityId);
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);

      if (error) throw error;

      // Refresh the opportunities list
      setBoardOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      setError('Failed to delete opportunity');
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">My Opportunities</h2>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage your business opportunities
            </p>
          </div>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            >
              {view === 'grid' ? 'List View' : 'Grid View'}
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900">My Board Posts</h2>
          <p className="mt-1 text-sm text-gray-500">
            Opportunities you've posted on the Opportunities Board
          </p>

          {error && (
            <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-6">
            {loadingBoard ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : boardOpportunities.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {boardOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {opportunity.business_name}
                        </h3>
                        <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1" />
                            {opportunity.industry}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {opportunity.location}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        opportunity.type === 'buying' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {opportunity.type === 'buying' ? 'Buying' : 'Selling'}
                      </span>
                    </div>

                    <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                      {opportunity.description}
                    </p>

                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Posted {formatDistanceToNow(new Date(opportunity.created_at))} ago
                    </div>

                    <div className="mt-6 flex justify-end space-x-4">
                      <Button variant="outline" size="sm">
                        Edit Post
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(opportunity.id)}
                        disabled={deleteLoading === opportunity.id}
                      >
                        {deleteLoading === opportunity.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No board posts</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by posting an opportunity on the board.
                </p>
                <div className="mt-6">
                  <Link to="/opportunities">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Post Opportunity
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}