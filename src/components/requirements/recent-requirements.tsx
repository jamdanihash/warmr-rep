import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Clock, DollarSign, Building2, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Requirement {
  id: string;
  title: string;
  description: string;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string;
  deadline: string | null;
  categories: { id: string; name: string }[];
}

function formatBudgetRange(min: number | null, max: number | null) {
  if (!min && !max) return 'Budget not specified';
  if (!min) return `Up to ${formatCurrency(max!)}`;
  if (!max) return `From ${formatCurrency(min)}`;
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

function getDescriptionPreview(description: string): string {
  const descriptionSection = description.split('Target Customer:')[0].replace('Description:', '').trim();
  return descriptionSection.split('\n')[0];
}

function getTargetCustomer(description: string): string {
  const targetSection = description.split('Target Customer:')[1];
  return targetSection ? targetSection.trim().split('\n')[0] : '';
}

export function RecentRequirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchRequirements() {
    const { data, error } = await supabase
      .from('requirements')
      .select(`
        id,
        title,
        description,
        budget_min,
        budget_max,
        created_at,
        deadline,
        requirement_categories (
          industry_categories (
            id,
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
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

  useEffect(() => {
    fetchRequirements();
    const interval = setInterval(fetchRequirements, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const isNew = (date: string) => {
    return new Date(date) > new Date(Date.now() - 24 * 60 * 60 * 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Recently Posted Opportunities</h2>
        <Link
          to="/requirements"
          className="inline-flex items-center text-brand-600 hover:text-brand-500"
        >
          Find More Opportunities
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))
        ) : (
          requirements.map((req) => (
            <div
              key={req.id}
              className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {isNew(req.created_at) && (
                <div className="absolute top-4 right-4 bg-brand-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  New
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                  {req.title}
                </h3>
                
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {getDescriptionPreview(req.description)}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {req.categories.map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600 line-clamp-2">
                        {getTargetCustomer(req.description)}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600">
                        {formatBudgetRange(req.budget_min, req.budget_max)}
                      </span>
                    </div>

                    {req.deadline && (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-sm text-gray-600">
                          Due {formatDistanceToNow(new Date(req.deadline), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    Posted {formatDistanceToNow(new Date(req.created_at))} ago
                  </div>
                </div>
              </div>

              <Link
                to={`/requirements/${req.id}`}
                className="absolute inset-0"
                aria-label={`View details for ${req.title}`}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}