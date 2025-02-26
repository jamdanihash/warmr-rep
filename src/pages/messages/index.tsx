import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Mail, Search, Filter, Bell, Settings, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'];
type Connection = Database['public']['Tables']['connections']['Row'];

export function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'requests'>('inbox');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMessages();
    fetchConnections();
  }, []);

  async function fetchMessages() {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && messages) {
      setMessages(messages);
    }
    setLoading(false);
  }

  async function fetchConnections() {
    const { data: connections, error } = await supabase
      .from('connections')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!error && connections) {
      setConnections(connections);
    }
  }

  async function handleConnectionResponse(connectionId: string, accept: boolean) {
    const { error } = await supabase
      .from('connections')
      .update({ status: accept ? 'accepted' : 'declined' })
      .eq('id', connectionId);

    if (!error) {
      fetchConnections();
    }
  }

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="border-b border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
                  <div className="flex space-x-1">
                    <Button
                      variant={activeTab === 'inbox' ? 'primary' : 'outline'}
                      onClick={() => setActiveTab('inbox')}
                      className="relative"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Inbox
                      {messages.filter(m => !m.is_read).length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {messages.filter(m => !m.is_read).length}
                        </span>
                      )}
                    </Button>
                    <Button
                      variant={activeTab === 'requests' ? 'primary' : 'outline'}
                      onClick={() => setActiveTab('requests')}
                      className="relative"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Requests
                      {connections.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {connections.length}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="outline">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Search and filters */}
              <div className="mt-4 flex space-x-4">
                <div className="flex-1 min-w-0">
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
              </div>
            ) : activeTab === 'inbox' ? (
              filteredMessages.length > 0 ? (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      !message.is_read ? 'bg-brand-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-brand-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {message.sender_id}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {message.content}
                          </p>
                          <div className="mt-2 text-xs text-gray-500">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">No messages found</div>
              )
            ) : (
              connections.map((connection) => (
                <div key={connection.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-brand-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {connection.requester_id}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {connection.request_message}
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          {formatDistanceToNow(new Date(connection.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnectionResponse(connection.id, false)}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleConnectionResponse(connection.id, true)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}