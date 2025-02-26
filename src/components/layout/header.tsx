import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { UserCircle, Menu, X, LogOut, Settings, Bell, User, Building2, Mail, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { supabase } from '@/lib/supabase';
import { useNotifications } from '@/lib/hooks/use-notifications';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { 
    notifications, 
    unreadCount, 
    loading: notificationsLoading, 
    markAsRead,
    markAllAsRead 
  } = useNotifications();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchUserProfile(user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      if (newUser) {
        fetchUserProfile(newUser.id);
      } else {
        setUserProfile(null);
      }
    });

    // Handle clicks outside menus
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <Mail className="h-5 w-5 text-blue-500" />;
      case 'connection':
        return <User className="h-5 w-5 text-green-500" />;
      case 'opportunity':
        return <Building2 className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const navigation = [
    { name: 'About Us', href: '/about' },
    { name: 'Opportunities Board', href: '/opportunities' },
    { name: 'My Connections', href: '/connections', protected: true },
    { name: 'Help', href: '/help' },
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo section */}
          <div className="flex-shrink-0">
            <Logo size="md" />
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              (!item.protected || user) && (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    type="button"
                    className="relative p-1 text-gray-400 hover:text-gray-500"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                  >
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-brand-600 hover:text-brand-500"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notificationsLoading ? (
                          <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600 mx-auto"></div>
                          </div>
                        ) : notifications.length > 0 ? (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 transition-colors ${
                                  !notification.read ? 'bg-brand-50' : ''
                                }`}
                                onClick={() => markAsRead(notification.id)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {notification.message}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </p>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-gray-400" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No notifications
                          </div>
                        )}
                      </div>
                      <div className="p-4 border-t border-gray-100">
                        <Link
                          to="/notifications"
                          className="text-sm text-brand-600 hover:text-brand-500 font-medium"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center">
                      <UserCircle className="h-5 w-5 text-brand-600" />
                    </div>
                    <span className="hidden lg:inline-block">{user.email}</span>
                  </button>

                  {/* User dropdown menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-brand-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {userProfile?.company_name || 'Your Company'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        {userProfile && (
                          <div className="mt-3 space-y-1">
                            {userProfile.phone_number && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Phone className="h-4 w-4 mr-2" />
                                {userProfile.phone_number}
                              </div>
                            )}
                            {userProfile.location && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Building2 className="h-4 w-4 mr-2" />
                                {userProfile.location}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mt-4">
                          <Link
                            to="/profile"
                            className="text-sm text-brand-600 hover:text-brand-500 font-medium"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            View and edit profile
                          </Link>
                        </div>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            handleSignOut();
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link to="/sign-in">
                  <Button variant="outline" size="sm">
                    <UserCircle className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/selection">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white z-40 relative">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {user && (
              <div className="py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userProfile?.company_name || 'Your Company'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                {userProfile && (
                  <div className="mt-3 space-y-1">
                    {userProfile.phone_number && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-2" />
                        {userProfile.phone_number}
                      </div>
                    )}
                    {userProfile.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Building2 className="h-4 w-4 mr-2" />
                        {userProfile.location}
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-4">
                  <Link
                    to="/profile"
                    className="text-sm text-brand-600 hover:text-brand-500 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    View and edit profile
                  </Link>
                </div>
              </div>
            )}

            {navigation.map((item) => (
              (!item.protected || user) && (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            ))}

            {user ? (
              <>
                <Link
                  to="/settings"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
                <Link
                  to="/sign-in"
                  className="block w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full justify-center" size="sm">
                    <UserCircle className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link
                  to="/selection"
                  className="block w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full justify-center" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}