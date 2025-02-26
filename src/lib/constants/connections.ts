export const CONNECTION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined'
} as const;

export const CONNECTION_FILTERS = {
  ALL: 'all',
  PENDING: 'pending',
  ACCEPTED: 'accepted'
} as const;

export const CONNECTION_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800'
} as const;