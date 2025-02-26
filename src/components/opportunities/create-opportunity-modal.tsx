import { useState } from 'react';
import { X, Building2, MapPin, Calendar, DollarSign, Clock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { CURRENCIES, COUNTRIES } from '@/lib/constants/locations';

interface CreateOpportunityModalProps {
  type: 'buying' | 'selling';
  onClose: () => void;
}

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Manufacturing',
  'Retail',
  'Professional Services',
  'Real Estate',
  'Education',
  'Energy',
  'Media & Entertainment'
];

export function CreateOpportunityModal({ type, onClose }: CreateOpportunityModalProps) {
  const [formData, setFormData] = useState({
    business_name: '',
    industry: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    country: '',
    city: '',
    company_size: '',
    timeline: '',
    budget_min: '',
    budget_max: '',
    currency: 'USD',
    requirements: '',
    preferred_contact: 'email' as 'email' | 'phone',
    is_name_private: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to post an opportunity');

      const { error } = await supabase
        .from('opportunities')
        .insert({
          ...formData,
          budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
          location: `${formData.city}, ${formData.country}`,
          type,
          user_id: user.id
        });

      if (error) throw error;
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (country: string) => {
    setFormData(prev => ({
      ...prev,
      country,
      city: ''
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {type === 'buying' 
                ? 'Share Your Business Needs'
                : 'Offer Your Solutions'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <input
                type="text"
                id="business_name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              />
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_name_private"
                  checked={formData.is_name_private}
                  onChange={(e) => setFormData({ ...formData, is_name_private: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="is_name_private" className="text-sm text-gray-600 flex items-center">
                  {formData.is_name_private ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  Keep Company Name Private
                </label>
              </div>
              {formData.is_name_private && (
                <p className="mt-1 text-xs text-gray-500">
                  Your company name will be shown as "[Company Name Hidden]" and will only be revealed when you accept a connection request.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                Industry
              </label>
              <select
                id="industry"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              >
                <option value="">Select an industry</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="company_size" className="block text-sm font-medium text-gray-700">
                Company Size
              </label>
              <select
                id="company_size"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                value={formData.company_size}
                onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                {type === 'buying' ? 'What are you looking for?' : 'What solutions do you offer?'}
              </label>
              <p className="mt-1 text-sm text-gray-500">
                {type === 'buying' 
                  ? 'Describe your business needs and requirements'
                  : 'Describe your solutions and capabilities'}
              </p>
              <textarea
                id="description"
                required
                maxLength={200}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length}/200 characters
              </p>
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                {type === 'buying' 
                  ? 'Required Qualifications/Capabilities'
                  : 'Ideal Client Profile'}
              </label>
              <textarea
                id="requirements"
                required
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder={type === 'buying'
                  ? "List specific qualifications, certifications, or capabilities required"
                  : "Describe your ideal client or customer profile"}
              />
            </div>

            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-700">
                Timeline
              </label>
              <select
                id="timeline"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              >
                <option value="">Select timeline</option>
                <option value="immediate">Immediate (within 1 month)</option>
                <option value="soon">Soon (1-3 months)</option>
                <option value="flexible">Flexible (3-6 months)</option>
                <option value="long-term">Long-term (6+ months)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  id="currency"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  {CURRENCIES.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="budget_min" className="block text-sm font-medium text-gray-700">
                    Minimum Budget
                  </label>
                  <input
                    type="number"
                    id="budget_min"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label htmlFor="budget_max" className="block text-sm font-medium text-gray-700">
                    Maximum Budget
                  </label>
                  <input
                    type="number"
                    id="budget_max"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  id="country"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                  value={formData.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                >
                  <option value="">Select a country</option>
                  {Object.keys(COUNTRIES).map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <select
                  id="city"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!formData.country}
                >
                  <option value="">Select a city</option>
                  {formData.country && COUNTRIES[formData.country as keyof typeof COUNTRIES]?.map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Contact Method
              </label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-brand-600"
                    name="preferred_contact"
                    value="email"
                    checked={formData.preferred_contact === 'email'}
                    onChange={(e) => setFormData({ ...formData, preferred_contact: e.target.value as 'email' | 'phone' })}
                  />
                  <span className="ml-2">Email</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-brand-600"
                    name="preferred_contact"
                    value="phone"
                    checked={formData.preferred_contact === 'phone'}
                    onChange={(e) => setFormData({ ...formData, preferred_contact: e.target.value as 'email' | 'phone' })}
                  />
                  <span className="ml-2">Phone</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contact_email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contact_phone"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Posting...' : 'Post Opportunity'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}