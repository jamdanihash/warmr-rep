import { supabase } from '@/lib/supabase';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: 'message' | 'connection' | 'opportunity' | 'system';
  actionUrl?: string;
  relatedId?: string;
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  actionUrl,
  relatedId
}: CreateNotificationParams) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        action_url: actionUrl,
        related_id: relatedId,
        read: false
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function createConnectionNotification(
  recipientId: string,
  requesterName: string,
  connectionId: string,
  type: 'request' | 'accepted'
) {
  const title = type === 'request' ? 'New Connection Request' : 'Connection Accepted';
  const message = type === 'request'
    ? `${requesterName} wants to connect with you`
    : `${requesterName} accepted your connection request`;

  await createNotification({
    userId: recipientId,
    title,
    message,
    type: 'connection',
    actionUrl: '/connections',
    relatedId: connectionId
  });
}

export async function createMessageNotification(
  recipientId: string,
  senderName: string,
  messageId: string
) {
  await createNotification({
    userId: recipientId,
    title: 'New Message',
    message: `You have a new message from ${senderName}`,
    type: 'message',
    actionUrl: '/messages',
    relatedId: messageId
  });
}

export async function createOpportunityNotification(
  userId: string,
  opportunityTitle: string,
  opportunityId: string
) {
  await createNotification({
    userId,
    title: 'Opportunity Match',
    message: `New opportunity matching your criteria: "${opportunityTitle}"`,
    type: 'opportunity',
    actionUrl: `/opportunities/${opportunityId}`,
    relatedId: opportunityId
  });
}