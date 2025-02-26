import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Mail, User, Building2, Bell, ChevronLeft, MessageSquare, Archive, Check, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/lib/hooks/use-notifications';

export function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const {
    notifications,
    groupedNotifications,
    loading,
    markAsRead,
    markAllAsRead,
    archiveNotification
  } = useNotifications();

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case 'message':
        return <Mail className="h-5 w-5 text-blue-500" />;
      case 'connection':
        return <User className="h-5 w-5 text-green-500" />;
      case 'opportunity':
        return <Building2 className="h-5 w-5 text-purple-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || (filter === 'unread' && !n.read)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              to="/"
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
          </div>
          <div className="flex items-center space-x-4">
            <select
              className="block rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
            </select>
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={!notifications.some(n => !n.read)}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start space-x-3">
                    <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {/* Grouped Notifications */}
              {groupedNotifications.map(group => (
                <div key={group.id} className="bg-white rounded-lg shadow-sm">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700">
                      {group.notifications.length} Similar Notifications
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {group.notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 ${!notification.read ? 'bg-brand-50' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {getNotificationIcon(notification.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  getPriorityStyles(notification.priority)
                                }`}>
                                  {notification.priority}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">
                                {notification.message}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => archiveNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Individual Notifications */}
              {filteredNotifications
                .filter(n => !n.group_id)
                .map(notification => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-lg shadow-sm ${!notification.read ? 'bg-brand-50' : ''}`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                getPriorityStyles(notification.priority)
                              }`}>
                                {notification.priority}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => archiveNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'unread' ? (
                  'You have no unread notifications.'
                ) : (
                  'You\'re all caught up!'
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}