import { X, ChevronDown, DollarSign, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { CURRENCIES, COUNTRIES } from '@/lib/constants/locations';

interface FilterPanelProps {
  selectedIndustries: string[];
  setSelectedIndustries: (industries: string[]) => void;
  selectedLocations: string[];
  setSelectedLocations: (locations: string[]) => void;
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

const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+'
];

const TIMELINES = [
  { value: 'immediate', label: 'Immediate (within 1 month)' },
  { value: 'soon', label: 'Soon (1-3 months)' },
  { value: 'flexible', label: 'Flexible (3-6 months)' },
  { value: 'long-term', label: 'Long-term (6+ months)' }
];

export function FilterPanel({
  selectedIndustries,
  setSelectedIndustries,
  selectedLocations,
  setSelectedLocations,
  onClose
}: FilterPanelProps) {
  const [expandedCountries, setExpandedCountries] = useState<string[]>(['United States']);
  const [budgetRange, setBudgetRange] = useState({ min: '', max: '' });
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedTimelines, setSelectedTimelines] = useState<string[]>([]);
  
  const toggleCountry = (country: string) => {
    setExpandedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const clearFilters = () => {
    setSelectedIndustries([]);
    setSelectedLocations([]);
    setBudgetRange({ min: '', max: '' });
    setSelectedCurrency('USD');
    setSelectedSizes([]);
    setSelectedTimelines([]);
  };

  const toggleAllLocationsForCountry = (country: string, selected: boolean) => {
    const countryLocations = COUNTRIES[country as keyof typeof COUNTRIES];
    if (selected) {
      setSelectedLocations([...new Set([...selectedLocations, ...countryLocations])]);
    } else {
      setSelectedLocations(selectedLocations.filter(loc => !countryLocations.includes(loc)));
    }
  };

  const isCountryFullySelected = (country: string) => {
    const countryLocations = COUNTRIES[country as keyof typeof COUNTRIES];
    return countryLocations.every(location => selectedLocations.includes(location));
  };

  const isCountryPartiallySelected = (country: string) => {
    const countryLocations = COUNTRIES[country as keyof typeof COUNTRIES];
    return countryLocations.some(location => selectedLocations.includes(location));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Industries */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Industries</h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {INDUSTRIES.map((industry) => (
              <label key={industry} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  checked={selectedIndustries.includes(industry)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIndustries([...selectedIndustries, industry]);
                    } else {
                      setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
                    }
                  }}
                />
                <span className="ml-2 text-sm text-gray-600">{industry}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Budget Range */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Budget Range</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Min"
                    className="pl-8 block w-full rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                    value={budgetRange.min}
                    onChange={(e) => setBudgetRange({ ...budgetRange, min: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Max"
                    className="pl-8 block w-full rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                    value={budgetRange.max}
                    onChange={(e) => setBudgetRange({ ...budgetRange, max: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <select
              className="block w-full rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              {CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Company Size */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Company Size</h4>
          <div className="space-y-2">
            {COMPANY_SIZES.map((size) => (
              <label key={size} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  checked={selectedSizes.includes(size)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSizes([...selectedSizes, size]);
                    } else {
                      setSelectedSizes(selectedSizes.filter(s => s !== size));
                    }
                  }}
                />
                <span className="ml-2 text-sm text-gray-600">{size} employees</span>
              </label>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
          <div className="space-y-2">
            {TIMELINES.map((timeline) => (
              <label key={timeline.value} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  checked={selectedTimelines.includes(timeline.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTimelines([...selectedTimelines, timeline.value]);
                    } else {
                      setSelectedTimelines(selectedTimelines.filter(t => t !== timeline.value));
                    }
                  }}
                />
                <span className="ml-2 text-sm text-gray-600">{timeline.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div className="lg:col-span-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Locations</h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {Object.entries(COUNTRIES).map(([country, cities]) => (
              <div key={country} className="border-b border-gray-100 last:border-0 pb-2 mb-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      checked={isCountryFullySelected(country)}
                      ref={input => {
                        if (input) {
                          input.indeterminate = !isCountryFullySelected(country) && isCountryPartiallySelected(country);
                        }
                      }}
                      onChange={(e) => toggleAllLocationsForCountry(country, e.target.checked)}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">{country}</span>
                  </label>
                  <button
                    onClick={() => toggleCountry(country)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transform transition-transform ${
                        expandedCountries.includes(country) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
                {expandedCountries.includes(country) && (
                  <div className="ml-6 mt-2 grid grid-cols-2 gap-2">
                    {cities.map((location) => (
                      <label key={location} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                          checked={selectedLocations.includes(location)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLocations([...selectedLocations, location]);
                            } else {
                              setSelectedLocations(selectedLocations.filter(l => l !== location));
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-600">{location}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={clearFilters}
          className="mr-4"
        >
          Clear Filters
        </Button>
        <Button onClick={onClose}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}