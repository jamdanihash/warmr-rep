import { useState, useEffect } from 'react';
import { Bell, Mail, Phone, Globe, MapPin, Briefcase, Calendar, User, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { COUNTRIES } from '@/lib/constants/locations';

interface Profile {
  id: string;
  company_name: string;
  phone_number: string;
  location: string;
  country: string;
  city: string;
  industry: string;
  website: string;
  description: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
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

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First try to get the existing profile
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // If no profile exists, create one
      if (!profile && !error) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              company_name: user.user_metadata?.company_name || '',
              phone_number: user.user_metadata?.phone_number || ''
            }
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        profile = newProfile;
      } else if (error) {
        throw error;
      }

      setProfile(profile);
      setFormData(profile || {});
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData,
          location: formData.city && formData.country ? `${formData.city}, ${formData.country}` : null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSuccess(true);
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      const file = e.target.files?.[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload the file
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      fetchProfile();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update the profile to remove the avatar_url
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      fetchProfile();
    } catch (error) {
      console.error('Error removing avatar:', error);
      setError('Failed to remove avatar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              My Profile
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Button
              onClick={() => setEditing(!editing)}
              variant={editing ? 'outline' : 'primary'}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 rounded-md bg-green-50 border border-green-200">
            <p className="text-sm text-green-600">Profile updated successfully</p>
          </div>
        )}

        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          {editing ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profile Picture
                </label>
                <div className="mt-2 flex items-center space-x-4">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-brand-600" />
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="relative"
                      disabled={uploading}
                    >
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                    {profile?.avatar_url && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveAvatar}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company_name"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                  value={formData.company_name || ''}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industry
                </label>
                <select
                  id="industry"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                  value={formData.industry || ''}
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
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Company Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="text"
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <select
                    id="country"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                    value={formData.city || ''}
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
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  value={formData.phone_number || ''}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setFormData(profile || {});
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="divide-y divide-gray-200">
              <div className="px-6 py-5">
                <div className="flex items-center space-x-3">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-brand-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {profile?.company_name || 'Company Name Not Set'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {profile?.industry || 'Industry Not Set'}
                    </p>
                  </div>
                </div>
                {profile?.description && (
                  <p className="mt-4 text-sm text-gray-600">
                    {profile.description}
                  </p>
                )}
              </div>

              <div className="px-6 py-5">
                <h4 className="text-sm font-medium text-gray-900">Contact Information</h4>
                <dl className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <dt className="flex items-center text-sm text-gray-500 w-32">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {profile?.website ? (
                        <a
                          href={profile.website.startsWith('http') ? profile.website : `http://${profile.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-500"
                        >
                          {profile.website}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center">
                    <dt className="flex items-center text-sm text-gray-500 w-32">
                      <MapPin className="h-4 w-4 mr-2" />
                      Location
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {profile?.city && profile?.country ? `${profile.city}, ${profile.country}` : 'Not provided'}
                    </dd>
                  </div>
                  <div className="flex items-center">
                    <dt className="flex items-center text-sm text-gray-500 w-32">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {profile?.phone_number || 'Not provided'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="px-6 py-5">
                <h4 className="text-sm font-medium text-gray-900">Account Information</h4>
                <dl className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <dt className="flex items-center text-sm text-gray-500 w-32">
                      <Calendar className="h-4 w-4 mr-2" />
                      Member since
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {profile?.created_at ? format(new Date(profile.created_at), 'MMMM d, yyyy') : 'Unknown'}
                    </dd>
                  </div>
                  <div className="flex items-center">
                    <dt className="flex items-center text-sm text-gray-500 w-32">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Last updated
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {profile?.updated_at ? format(new Date(profile.updated_at), 'MMMM d, yyyy') : 'Never'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}