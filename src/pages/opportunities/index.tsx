import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Search, Filter, Plus, MapPin, Building2, Calendar, ChevronDown, X, DollarSign, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';
import { CreateOpportunityModal } from '@/components/opportunities/create-opportunity-modal';
import { FilterPanel } from '@/components/opportunities/filter-panel';
import { useOpportunities } from '@/hooks/use-opportunities';
import { supabase } from '@/lib/supabase';

type ViewType = 'buying' | 'selling';
type SortOption = 'date' | 'industry' | 'location';
type SortDirection = 'asc' | 'desc';

interface DeleteModalProps {
  opportunityId: string;
  opportunityName: string;
  onClose: () => void;
  onDelete: () => void;
}

function DeleteModal({ opportunityId, opportunityName, onClose, onDelete }: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);

      if (deleteError) throw deleteError;

      onDelete();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Opportunity</h3>
        
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete "{opportunityName}"? This action cannot be undone.
        </p>

        {error && (
          <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function OpportunitiesPage() {
  const [view, setView] = useState<ViewType>('buying');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showMyOpportunities, setShowMyOpportunities] = useState(false);
  const [myOpportunities, setMyOpportunities] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingOpportunity, setDeletingOpportunity] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { opportunities } = useOpportunities({
    type: view,
    searchTerm,
    industries: selectedIndustries,
    locations: selectedLocations,
    sortBy,
    sortDirection
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setCurrentUserId(user?.id || null);

      if (user) {
        fetchMyOpportunities(user.id);
      }
    };
    checkAuth();
  }, []);

  const fetchMyOpportunities = async (userId: string) => {
    const { data } = await supabase
      .from('opportunities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setMyOpportunities(data);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeletingOpportunity({ id, name });
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    if (currentUserId) {
      fetchMyOpportunities(currentUserId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Opportunities Board</h1>
            <p className="mt-1 text-sm text-gray-500">
              {view === 'buying' 
                ? 'Share your business needs and connect with companies ready to help you grow'
                : 'Offer your solutions and help other businesses reach their goals'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {isAuthenticated && (
              <>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Opportunity
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowMyOpportunities(!showMyOpportunities)}
                >
                  {showMyOpportunities ? 'Show All Opportunities' : 'My Posted Opportunities'}
                </Button>
              </>
            )}
            {!isAuthenticated && (
              <Link to="/sign-in">
                <Button>
                  Sign In to Post
                </Button>
              </Link>
            )}
          </div>
        </div>

        {!showMyOpportunities && (
          <>
            {/* View Toggle */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-2 inline-flex">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'buying'
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setView('buying')}
              >
                Looking for Solutions
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'selling'
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setView('selling')}
              >
                Offering Solutions
              </button>
            </div>

            {/* Search and Filters */}
            <div className="mt-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                      placeholder={view === 'buying' 
                        ? "Search for companies offering solutions..." 
                        : "Search for businesses needing solutions..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-4 flex-shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {(selectedIndustries.length > 0 || selectedLocations.length > 0) && (
                      <span className="ml-2 bg-brand-100 text-brand-700 rounded-full px-2 py-0.5 text-xs">
                        {selectedIndustries.length + selectedLocations.length}
                      </span>
                    )}
                    <ChevronDown className={`ml-2 h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </Button>
                  <select
                    className="block rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                  >
                    <option value="date">Sort by Date</option>
                    <option value="industry">Sort by Industry</option>
                    <option value="location">Sort by Location</option>
                  </select>
                  <Button
                    variant="outline"
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                    title={sortDirection === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                  >
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
              </div>

              {showFilters && (
                <FilterPanel
                  selectedIndustries={selectedIndustries}
                  setSelectedIndustries={setSelectedIndustries}
                  selectedLocations={selectedLocations}
                  setSelectedLocations={setSelectedLocations}
                  onClose={() => setShowFilters(false)}
                />
              )}

              {(selectedIndustries.length > 0 || selectedLocations.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {selectedIndustries.map((industry) => (
                    <span
                      key={industry}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700"
                    >
                      {industry}
                      <button
                        type="button"
                        className="ml-1 inline-flex items-center justify-center"
                        onClick={() => setSelectedIndustries(selectedIndustries.filter(i => i !== industry))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {selectedLocations.map((location) => (
                    <span
                      key={location}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {location}
                      <button
                        type="button"
                        className="ml-1 inline-flex items-center justify-center"
                        onClick={() => setSelectedLocations(selectedLocations.filter(l => l !== location))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      setSelectedIndustries([]);
                      setSelectedLocations([]);
                    }}
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Opportunities List */}
        <div className="mt-6">
          {showMyOpportunities ? (
            myOpportunities.length > 0 ? (
              <div className="space-y-4">
                {myOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {opportunity.business_name}
                        </h3>
                        <div className="mt-1 flex items-center flex-wrap gap-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1" />
                            {opportunity.industry}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {opportunity.location}
                          </span>
                          {opportunity.budget_min || opportunity.budget_max ? (
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {opportunity.budget_min && opportunity.budget_max
                                ? `$${opportunity.budget_min.toLocaleString()} - $${opportunity.budget_max.toLocaleString()}`
                                : opportunity.budget_min
                                ? `From $${opportunity.budget_min.toLocaleString()}`
                                : `Up to $${opportunity.budget_max.toLocaleString()}`}
                            </span>
                          ) : null}
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Posted {formatDistanceToNow(new Date(opportunity.created_at))} ago
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {opportunity.description}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 ml-4"
                        onClick={() => handleDelete(opportunity.id, opportunity.business_name)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No opportunities posted</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by posting your first opportunity
                </p>
                <div className="mt-6">
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post Opportunity
                  </Button>
                </div>
              </div>
            )
          ) : opportunities.length > 0 ? (
            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No opportunities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedIndustries.length > 0 || selectedLocations.length > 0 ? (
                  'Try adjusting your search or filters to find more opportunities.'
                ) : (
                  'Get started by creating a new opportunity.'
                )}
              </p>
              <div className="mt-6">
                {isAuthenticated ? (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post Opportunity
                  </Button>
                ) : (
                  <Link to="/sign-in">
                    <Button>
                      Sign In to Post
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Opportunity Modal */}
      {showCreateModal && (
        <CreateOpportunityModal
          type={view}
          onClose={() => {
            setShowCreateModal(false);
            if (currentUserId) {
              fetchMyOpportunities(currentUserId);
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingOpportunity && (
        <DeleteModal
          opportunityId={deletingOpportunity.id}
          opportunityName={deletingOpportunity.name}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingOpportunity(null);
          }}
          onDelete={handleDeleteSuccess}
        />
      )}
    </div>
  );
}