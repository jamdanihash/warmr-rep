import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Users, Search, Filter, Building2, MapPin, MessageSquare, X, ChevronDown, Clock, Check, XCircle, Ban, AlertCircle, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConnections } from '@/lib/hooks/use-connections';
import { CONNECTION_STATUS, CONNECTION_FILTERS, CONNECTION_STATUS_COLORS } from '@/lib/constants/connections';
import { supabase } from '@/lib/supabase';
import { MessageModal } from '@/components/messaging/message-modal';

interface BlockModalProps {
  connectionId: string;
  companyName: string;
  onClose: () => void;
  onBlock: () => void;
}

interface UnblockModalProps {
  userId: string;
  companyName: string;
  onClose: () => void;
  onUnblock: () => void;
}

function BlockModal({ connectionId, companyName, onClose, onBlock }: BlockModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBlock = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the connection details
      const { data: connection } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .eq('id', connectionId)
        .single();

      if (!connection) throw new Error('Connection not found');

      // Determine which user to block
      const blockedId = connection.requester_id === user.id 
        ? connection.recipient_id 
        : connection.requester_id;

      // Check if block already exists
      const { data: existingBlock } = await supabase
        .from('blocked_users')
        .select('blocker_id, blocked_id')
        .match({ blocker_id: user.id, blocked_id: blockedId })
        .maybeSingle();

      if (!existingBlock) {
        // Create block record only if it doesn't exist
        const { error: blockError } = await supabase
          .from('blocked_users')
          .insert({
            blocker_id: user.id,
            blocked_id: blockedId,
            reason: reason.trim() || null
          });

        if (blockError) throw blockError;
      }

      // Delete the connection
      const { error: deleteError } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (deleteError) throw deleteError;

      onBlock();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-red-600">
            <Ban className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-medium">Block {companyName}</h3>
          </div>
          <button
            onClick={onClose}
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

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Important Note</h4>
                <div className="mt-1 text-sm text-yellow-700">
                  <div>Blocking will:</div>
                  <ul className="mt-1 ml-4 list-disc">
                    <li>Remove the connection</li>
                    <li>Prevent future connection requests</li>
                    <li>Block all communication</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason (optional)
            </label>
            <textarea
              id="reason"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
              placeholder="Why are you blocking this user?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBlock}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {loading ? 'Blocking...' : 'Block User'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UnblockModal({ userId, companyName, onClose, onUnblock }: UnblockModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnblock = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete the block record
      const { error: unblockError } = await supabase
        .from('blocked_users')
        .delete()
        .match({ blocker_id: user.id, blocked_id: userId });

      if (unblockError) throw unblockError;

      onUnblock();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-brand-600">
            <Unlock className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-medium">Unblock {companyName}</h3>
          </div>
          <button
            onClick={onClose}
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

        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to unblock {companyName}? This will allow them to:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Send you connection requests</li>
            <li>Message you if connected</li>
            <li>View your shared content</li>
          </ul>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnblock}
              disabled={loading}
            >
              {loading ? 'Unblocking...' : 'Unblock User'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConnectionsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>(CONNECTION_FILTERS.ALL);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { connections, loading, error, updateConnection, fetchConnections } = useConnections();
  const [selectedConnection, setSelectedConnection] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [blockingConnection, setBlockingConnection] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<{
    id: string;
    company_name: string;
  }[]>([]);

  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      if (user) {
        // Fetch blocked users
        const { data: blocks } = await supabase
          .from('blocked_users')
          .select(`
            blocked_id,
            blocked_user:profiles!blocked_id(company_name)
          `)
          .eq('blocker_id', user.id);

        if (blocks) {
          setBlockedUsers(blocks.map(block => ({
            id: block.blocked_id,
            company_name: block.blocked_user.company_name
          })));
        }
      }
    };
    initUser();
  }, []);

  const filteredConnections = connections.filter(connection => {
    const matchesFilter = filter === 'all' || connection.status === filter;
    const searchString = `${connection.requester_profile.company_name} ${connection.requester_profile.industry} ${connection.recipient_profile.company_name} ${connection.recipient_profile.industry}`.toLowerCase();
    const matchesSearch = searchTerm === '' || searchString.includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleMessage = (connection: any) => {
    if (!currentUserId) return;

    const isRequester = connection.requester_id === currentUserId;
    const profile = isRequester ? connection.recipient_profile : connection.requester_profile;
    const userId = isRequester ? connection.recipient_id : connection.requester_id;

    setSelectedConnection({
      id: userId,
      name: profile.company_name
    });
  };

  const handleBlock = (connection: any) => {
    if (!currentUserId) return;

    const isRequester = connection.requester_id === currentUserId;
    const profile = isRequester ? connection.recipient_profile : connection.requester_profile;

    setBlockingConnection({
      id: connection.id,
      name: profile.company_name
    });
    setShowBlockModal(true);
  };

  const handleUnblock = (userId: string, companyName: string) => {
    setBlockingConnection({
      id: userId,
      name: companyName
    });
    setShowUnblockModal(true);
  };

  const getConnectionStatus = (status: string) => {
    switch (status) {
      case CONNECTION_STATUS.PENDING:
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CONNECTION_STATUS_COLORS.pending}`}>
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case CONNECTION_STATUS.ACCEPTED:
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CONNECTION_STATUS_COLORS.accepted}`}>
            <Check className="w-3 h-3 mr-1" />
            Connected
          </span>
        );
      case CONNECTION_STATUS.DECLINED:
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CONNECTION_STATUS_COLORS.declined}`}>
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">My Connections</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your business network and connection requests
            </p>
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
                  placeholder="Search connections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                className="block rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'accepted')}
              >
                <option value={CONNECTION_FILTERS.ALL}>All Connections</option>
                <option value={CONNECTION_FILTERS.PENDING}>Pending</option>
                <option value={CONNECTION_FILTERS.ACCEPTED}>Connected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConnections.length > 0 || blockedUsers.length > 0 ? (
            <div className="space-y-4">
              {/* Active Connections */}
              {filteredConnections.map((connection) => {
                const isRequester = connection.requester_id === currentUserId;
                const profile = isRequester ? connection.recipient_profile : connection.requester_profile;

                return (
                  <div key={connection.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-brand-600" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-medium text-gray-900">
                                {profile.company_name}
                              </h3>
                              {getConnectionStatus(connection.status)}
                            </div>
                            <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Building2 className="h-4 w-4 mr-1" />
                                {profile.industry}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {profile.location}
                              </span>
                            </div>
                            {connection.request_message && (
                              <p className="mt-2 text-sm text-gray-600">
                                {connection.request_message}
                              </p>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                              {connection.status === 'pending' ? 'Requested' : 'Connected'}{' '}
                              {formatDistanceToNow(new Date(connection.created_at))} ago
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!isRequester && connection.status === CONNECTION_STATUS.PENDING && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateConnection(connection.id, CONNECTION_STATUS.DECLINED)}
                                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => updateConnection(connection.id, CONNECTION_STATUS.ACCEPTED)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Accept
                              </Button>
                            </>
                          )}
                          {connection.status === CONNECTION_STATUS.ACCEPTED && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMessage(connection)}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Message
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBlock(connection)}
                                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Block
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Blocked Users */}
              {blockedUsers.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Blocked Users</h3>
                  <div className="space-y-4">
                    {blockedUsers.map((user) => (
                      <div key={user.id} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <Ban className="h-6 w-6 text-gray-400" />
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{user.company_name}</h4>
                              <p className="text-sm text-gray-500">Blocked</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnblock(user.id, user.company_name)}
                          >
                            <Unlock className="h-4 w-4 mr-2" />
                            Unblock
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No connections found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? (
                  'Try adjusting your search to find more connections.'
                ) : (
                  'Start building your network by connecting with other businesses.'
                )}
              </p>
              <div className="mt-6">
                <Link to="/opportunities">
                  <Button>
                    Browse Opportunities
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      {selectedConnection && (
        <MessageModal
          recipientId={selectedConnection.id}
          recipientName={selectedConnection.name}
          onClose={() => setSelectedConnection(null)}
        />
      )}

      {/* Block Modal */}
      {showBlockModal && blockingConnection && (
        <BlockModal
          connectionId={blockingConnection.id}
          companyName={blockingConnection.name}
          onClose={() => {
            setShowBlockModal(false);
            setBlockingConnection(null);
          }}
          onBlock={() => {
            fetchConnections();
            setShowBlockModal(false);
            setBlockingConnection(null);
          }}
        />
      )}

      {/* Unblock Modal */}
      {showUnblockModal && blockingConnection && (
        <UnblockModal
          userId={blockingConnection.id}
          companyName={blockingConnection.name}
          onClose={() => {
            setShowUnblockModal(false);
            setBlockingConnection(null);
          }}
          onUnblock={() => {
            // Remove from blocked users list
            setBlockedUsers(prev => prev.filter(user => user.id !== blockingConnection.id));
            setShowUnblockModal(false);
            setBlockingConnection(null);
          }}
        />
      )}
    </div>
  );
}