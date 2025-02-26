import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface Requirement {
  id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  status: string;
  created_at: string;
  categories: { id: string; name: string }[];
}

export function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequirements() {
      const { data, error } = await supabase
        .from('requirements')
        .select(`
          *,
          requirement_categories (
            industry_categories (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRequirements(data.map(req => ({
          ...req,
          categories: req.requirement_categories.map(rc => ({
            id: rc.industry_categories.id,
            name: rc.industry_categories.name
          }))
        })));
      }
      setLoading(false);
    }

    fetchRequirements();
  }, []);

  function getStatusColor(status: string) {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Find Leads</h1>
          <Link to="/requirements/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post Lead Request
            </Button>
          </Link>
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
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requirements.map((requirement) => (
                    <tr key={requirement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link 
                          to={`/requirements/${requirement.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-brand-600"
                        >
                          {requirement.title}
                        </Link>
                        <div className="text-sm text-gray-500">{requirement.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {requirement.categories.map((category) => (
                            <span
                              key={category.id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-800"
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {requirement.budget_min && requirement.budget_max ? (
                          <>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              notation: 'compact',
                            }).format(requirement.budget_min)}
                            {' - '}
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              notation: 'compact',
                            }).format(requirement.budget_max)}
                          </>
                        ) : 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {requirement.deadline ? (
                          format(new Date(requirement.deadline), 'MMM d, yyyy')
                        ) : 'No deadline'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(requirement.status)}`}>
                          {requirement.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}