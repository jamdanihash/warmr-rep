import { useState, useEffect, useRef } from 'react';
import { X, Building2, MapPin, Clock, Send, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface MessageModalProps {
  recipientId: string;
  recipientName: string;
  onClose: () => void;
}

interface RecipientProfile {
  company_name: string;
  industry: string;
  location: string;
  description: string;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export function MessageModal({ recipientId, recipientName, onClose }: MessageModalProps) {
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipientProfile, setRecipientProfile] = useState<RecipientProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);

        // Fetch recipient's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_name, industry, location, description')
          .eq('id', recipientId)
          .single();

        if (profile) {
          setRecipientProfile(profile);
        }

        // Fetch message history
        if (user) {
          const { data: messageHistory } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
            .order('created_at', { ascending: true });

          setMessages(messageHistory || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Set up real-time subscription
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${recipientId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [recipientId]);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    setSending(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be signed in to send messages');

      // Generate a thread ID if this is the first message
      const threadId = crypto.randomUUID();

      // Create a new message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          recipient_id: recipientId,
          content: messageContent.trim(),
          is_read: false
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Add the new message to the list
      if (message) {
        setMessages(prev => [...prev, message]);
      }

      setMessageContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              {recipientName}
            </h3>
            {recipientProfile && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  {recipientProfile.industry}
                </span>
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {recipientProfile.location}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message, index) => {
              const isSender = message.sender_id === currentUserId;
              const showDate = index === 0 || 
                new Date(message.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isSender ? 'bg-brand-600 text-white' : 'bg-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                        isSender ? 'text-brand-200' : 'text-gray-400'
                      }`}>
                        <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
                        {isSender && (
                          message.is_read ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          {error && (
            <div className="mb-2 p-2 rounded-md bg-red-50 border border-red-200">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={messageContent}
                onChange={(e) => {
                  setMessageContent(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="w-full rounded-lg border-gray-300 focus:border-brand-500 focus:ring-brand-500 py-2 resize-none max-h-32"
                rows={1}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={sending || !messageContent.trim()}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}