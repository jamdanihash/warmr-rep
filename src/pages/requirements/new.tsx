import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export function NewRequirementPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetCustomer: '',
    budget_min: '',
    budget_max: '',
    deadline: '',
    selectedCategories: [] as string[]
  });

  // Fetch categories on mount
  useState(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('industry_categories')
        .select('id, name')
        .order('name');
      
      if (data) {
        setCategories(data);
      }
    }
    fetchCategories();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fullDescription = `
Description:
${formData.description}

Target Customer:
${formData.targetCustomer}
    `.trim();

    try {
      // Insert requirement
      const { data: requirement, error: reqError } = await supabase
        .from('requirements')
        .insert({
          title: formData.title,
          description: fullDescription,
          budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
          deadline: formData.deadline || null,
          status: 'open'
        })
        .select()
        .single();

      if (reqError) throw reqError;

      // Insert requirement categories
      if (formData.selectedCategories.length > 0) {
        const { error: catError } = await supabase
          .from('requirement_categories')
          .insert(
            formData.selectedCategories.map(categoryId => ({
              requirement_id: requirement.id,
              category_id: categoryId
            }))
          );

        if (catError) throw catError;
      }

      navigate('/requirements');
    } catch (error) {
      console.error('Error creating requirement:', error);
      // TODO: Show error message to user
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Post a New Lead Request</h1>
        
        <form onSubmit={handleSubmit} className="mt-6 bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                What are you looking for?
              </label>
              <input
                type="text"
                id="title"
                required
                placeholder="e.g., Looking for a CRM implementation partner"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Tell us more about your needs
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Describe your project, requirements, and what you're trying to achieve.
              </p>
              <textarea
                id="description"
                rows={4}
                placeholder="e.g., We need help implementing a CRM system that can handle our growing customer base..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="targetCustomer" className="block text-sm font-medium text-gray-700">
                Who is this for?
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Describe your company, team, or organization.
              </p>
              <textarea
                id="targetCustomer"
                rows={3}
                placeholder="e.g., We are a mid-sized marketing agency with 50+ employees..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                value={formData.targetCustomer}
                onChange={(e) => setFormData({ ...formData, targetCustomer: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="budget_min" className="block text-sm font-medium text-gray-700">
                  Minimum Budget
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="budget_min"
                    placeholder="0"
                    className="pl-7 block w-full rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="budget_max" className="block text-sm font-medium text-gray-700">
                  Maximum Budget
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="budget_max"
                    placeholder="100000"
                    className="pl-7 block w-full rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                When do you need this by?
              </label>
              <input
                type="date"
                id="deadline"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
                Industry Categories
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Select all that apply to your request.
              </p>
              <select
                id="categories"
                multiple
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                value={formData.selectedCategories}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData({ ...formData, selectedCategories: options });
                }}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/requirements')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post Lead Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}