import { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, ChevronDown, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  is_primary: boolean;
}

interface Prospect {
  id: string;
  company_name: string;
  description: string;
  employee_count: number;
  annual_revenue: number;
  website: string;
  phone: string;
  email: string;
  address: string;
  categories: Category[];
  relevance: number;
}

interface SearchFilters {
  category_ids: string[];
  minEmployees: number | null;
  maxEmployees: number | null;
  minRevenue: number | null;
  maxRevenue: number | null;
  sortBy: string;
  sortDirection: string;
}

interface MessageModal {
  isOpen: boolean;
  prospectId: string | null;
  prospectName: string;
}

export function ProspectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    category_ids: [],
    minEmployees: null,
    maxEmployees: null,
    minRevenue: null,
    maxRevenue: null,
    sortBy: 'relevance',
    sortDirection: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageModal, setMessageModal] = useState<MessageModal>({
    isOpen: false,
    prospectId: null,
    prospectName: '',
  });
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('industry_categories')
        .select('id, name')
        .order('name');
      
      if (!error && data) {
        setCategories(data);
      }
    }
    fetchCategories();
  }, []);

  // Fetch prospects
  useEffect(() => {
    async function fetchProspects() {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('search_prospects', {
          search_term: debouncedSearch,
          category_ids: filters.category_ids.length > 0 ? filters.category_ids : null,
          min_employees: filters.minEmployees,
          max_employees: filters.maxEmployees,
          min_revenue: filters.minRevenue,
          max_revenue: filters.maxRevenue,
          sort_by: filters.sortBy,
          sort_direction: filters.sortDirection,
        });

      if (!error && data) {
        setProspects(data);
      }
      setLoading(false);
    }
    fetchProspects();
  }, [debouncedSearch, filters]);

  const formatRevenue = (revenue: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(revenue);
  };

  const formatEmployeeCount = (count: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(count);
  };

  const handleMessageClick = (prospectId: string, companyName: string) => {
    setMessageModal({
      isOpen: true,
      prospectId,
      prospectName: companyName,
    });
  };

  const handleSendMessage = async () => {
    if (!messageModal.prospectId || !messageContent.trim()) return;

    setSendingMessage(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Create or get existing thread
      const { data: thread, error: threadError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.user.id,
          recipient_id: messageModal.prospectId,
          content: messageContent,
          is_read: false,
        })
        .select()
        .single();

      if (threadError) throw threadError;

      // Reset form
      setMessageContent('');
      setMessageModal({
        isOpen: false,
        prospectId: null,
        prospectName: '',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Show error message to user
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Prospects</h1>
          <div className="flex space-x-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Prospect
            </Button>
          </div>
        </div>

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
                  placeholder="Search prospects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
                <ChevronDown className={`h-4 w-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categories</label>
                  <select
                    multiple
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                    value={filters.category_ids}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions, (option) => option.value);
                      setFilters({ ...filters, category_ids: options });
                    }}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee Count</label>
                  <div className="mt-1 flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="block w-full rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                      value={filters.minEmployees || ''}
                      onChange={(e) => setFilters({ ...filters, minEmployees: e.target.value ? Number(e.target.value) : null })}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="block w-full rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                      value={filters.maxEmployees || ''}
                      onChange={(e) => setFilters({ ...filters, maxEmployees: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Annual Revenue</label>
                  <div className="mt-1 flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="block w-full rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                      value={filters.minRevenue || ''}
                      onChange={(e) => setFilters({ ...filters, minRevenue: e.target.value ? Number(e.target.value) : null })}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="block w-full rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                      value={filters.maxRevenue || ''}
                      onChange={(e) => setFilters({ ...filters, maxRevenue: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sort By</label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    >
                      <option value="relevance">Relevance</option>
                      <option value="company_name">Company Name</option>
                      <option value="employee_count">Employee Count</option>
                      <option value="annual_revenue">Annual Revenue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Direction</label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                      value={filters.sortDirection}
                      onChange={(e) => setFilters({ ...filters, sortDirection: e.target.value })}
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      category_ids: [],
                      minEmployees: null,
                      maxEmployees: null,
                      minRevenue: null,
                      maxRevenue: null,
                      sortBy: 'relevance',
                      sortDirection: 'desc',
                    });
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {prospects.map((prospect) => (
                    <tr key={prospect.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{prospect.company_name}</div>
                        <div className="text-sm text-gray-500">{prospect.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {prospect.categories.map((category) => (
                            <span
                              key={category.id}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                ${category.is_primary
                                  ? 'bg-brand-100 text-brand-800'
                                  : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatEmployeeCount(prospect.employee_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatRevenue(prospect.annual_revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{prospect.phone}</div>
                        <div>{prospect.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMessageClick(prospect.id, prospect.company_name)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Message Modal */}
        {messageModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Message {messageModal.prospectName}
              </h3>
              <textarea
                className="w-full h-32 p-2 border rounded-md focus:border-brand-500 focus:ring-brand-500"
                placeholder="Type your message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
              <div className="mt-4 flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMessageModal({ isOpen: false, prospectId: null, prospectName: '' });
                    setMessageContent('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageContent.trim()}
                >
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}