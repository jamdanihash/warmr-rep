import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Building2, Calendar, Star, StarOff, MessageSquare, X, User, DollarSign, Clock, AlertCircle, Ban, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { formatBudgetRange } from '@/lib/utils/format';
import { Link } from 'react-router-dom';
import { MessageModal } from '@/components/messaging/message-modal';

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
  company_size?: string;
  timeline?: string;
  budget_min?: number;
  budget_max?: number;
  requirements?: string;
  preferred_contact?: 'email' | 'phone';
  is_name_private?: boolean;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'accepted' | 'declined'>('none');
  const [userProfile, setUserProfile] = useState<{ avatar_url: string | null } | null>(null);

  useEffect(() => {
    // Check authentication status and connection status
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setCurrentUserId(user?.id || null);

      if (user) {
        // Check if there's an existing connection
        const { data: connection } = await supabase
          .from('connections')
          .select('status')
          .or(`and(requester_id.eq.${user.id},recipient_id.eq.${opportunity.user_id}),and(requester_id.eq.${opportunity.user_id},recipient_id.eq.${user.id})`)
          .maybeSingle();

        setConnectionStatus(connection?.status || 'none');

        // Check if opportunity is favorited
        const { data: favorite } = await supabase
          .from('favorite_opportunities')
          .select('is_favorite')
          .eq('user_id', user.id)
          .eq('opportunity_id', opportunity.id)
          .maybeSingle();

        setIsFavorite(favorite?.is_favorite || false);

        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', opportunity.user_id)
          .single();

        if (profile) {
          setUserProfile(profile);
        }
      }
    };

    checkStatus();
  }, [opportunity.user_id, opportunity.id]);

  const toggleFavorite = async () => {
    // Prevent favoriting own opportunity
    if (currentUserId === opportunity.user_id) {
      setError('You cannot favorite your own opportunity');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('favorite_opportunities')
        .upsert({
          user_id: user.id,
          opportunity_id: opportunity.id,
          is_favorite: !isFavorite
        });

      if (!error) {
        setIsFavorite(!isFavorite);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleSendConnectionRequest = async () => {
    // Prevent connecting with own opportunity
    if (currentUserId === opportunity.user_id) {
      setError('You cannot connect with your own opportunity');
      return;
    }

    if (!connectionMessage.trim()) return;

    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be signed in to send connection requests');

      // Create connection request
      const { error: connectionError } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: opportunity.user_id,
          request_message: connectionMessage.trim(),
          status: 'pending'
        });

      if (connectionError) throw connectionError;

      setSuccess(true);
      setConnectionMessage('');
      setConnectionStatus('pending');
      setTimeout(() => {
        setShowConnectionModal(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // Don't show interaction options for own opportunities
  if (currentUserId === opportunity.user_id) {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-brand-600" />
                    </div>
                  )}
                </div>
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
                        {formatBudgetRange(opportunity.budget_min || null, opportunity.budget_max || null)}
                      </span>
                    ) : null}
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDistanceToNow(new Date(opportunity.created_at))} ago
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4">
              <span className="text-sm text-gray-500">Your opportunity</span>
            </div>
          </div>

          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {opportunity.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {userProfile?.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-brand-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {opportunity.is_name_private && connectionStatus !== 'accepted' ? (
                      <span className="italic">[Company Name Hidden]</span>
                    ) : (
                      opportunity.business_name
                    )}
                    {opportunity.is_name_private && connectionStatus === 'accepted' && (
                      <span className="ml-2 text-sm text-green-600 font-normal">
                        (Name Revealed)
                      </span>
                    )}
                  </h3>
                  {isAuthenticated && (
                    <button
                      onClick={toggleFavorite}
                      className="text-gray-400 hover:text-yellow-400 transition-colors ml-2"
                    >
                      {isFavorite ? (
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>
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
                      {formatBudgetRange(opportunity.budget_min || null, opportunity.budget_max || null)}
                    </span>
                  ) : null}
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDistanceToNow(new Date(opportunity.created_at))} ago
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="ml-4 flex items-center space-x-2">
            {!isAuthenticated ? (
              <Link to="/sign-in">
                <Button size="sm">
                  Sign in to Connect
                </Button>
              </Link>
            ) : connectionStatus === 'accepted' ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowContact(!showContact)}>
                  {showContact ? 'Hide Contact' : 'Show Contact'}
                </Button>
                <Button size="sm" onClick={() => setShowMessageModal(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </>
            ) : connectionStatus === 'pending' ? (
              <Button disabled variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Pending
              </Button>
            ) : connectionStatus === 'declined' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConnectionModal(true)}
              >
                Request Again
              </Button>
            ) : (
              <Button size="sm" onClick={() => setShowConnectionModal(true)}>
                Connect
              </Button>
            )}
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {opportunity.description}
        </p>

        {error && (
          <div className="mt-2 p-2 bg-red-50 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {showContact && connectionStatus === 'accepted' && (
          <div className="mt-2 p-2 bg-gray-50 rounded-md">
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Email:</span>{' '}
                <a href={`mailto:${opportunity.contact_email}`} className="text-brand-600 hover:text-brand-500">
                  {opportunity.contact_email}
                </a>
              </p>
              <p>
                <span className="font-medium">Phone:</span>{' '}
                <a href={`tel:${opportunity.contact_phone}`} className="text-brand-600 hover:text-brand-500">
                  {opportunity.contact_phone}
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Connection Request Modal */}
      {showConnectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Connect with {opportunity.is_name_private ? '[Company Name Hidden]' : opportunity.business_name}
              </h3>
              <button
                onClick={() => setShowConnectionModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 rounded-md bg-green-50 border border-green-200">
                <p className="text-sm text-green-600">Connection request sent successfully!</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Introduction Message
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Briefly introduce yourself and explain why you'd like to connect
                </p>
                <textarea
                  id="message"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                  placeholder="Hi, I'm interested in discussing potential collaboration..."
                  value={connectionMessage}
                  onChange={(e) => setConnectionMessage(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowConnectionModal(false)}
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendConnectionRequest}
                  disabled={sending || !connectionMessage.trim()}
                >
                  {sending ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <MessageModal
          recipientId={opportunity.user_id}
          recipientName={opportunity.is_name_private ? '[Company Name Hidden]' : opportunity.business_name}
          onClose={() => setShowMessageModal(false)}
        />
      )}
    </div>
  );
}