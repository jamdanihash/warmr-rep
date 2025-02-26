export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  CONNECTION: 'connection',
  OPPORTUNITY: 'opportunity',
  SYSTEM: 'system'
} as const;

export const NOTIFICATION_FILTERS = {
  ALL: 'all',
  UNREAD: 'unread'
} as const;

export const NOTIFICATION_TYPE_COLORS = {
  message: 'text-blue-500',
  connection: 'text-green-500',
  opportunity: 'text-purple-500',
  system: 'text-gray-500'
} as const;