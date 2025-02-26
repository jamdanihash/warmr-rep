import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { SignInPage } from '@/pages/auth/sign-in';
import { RegisterPage } from '@/pages/auth/register';
import { ForgotPasswordPage } from '@/pages/auth/forgot-password';
import { ProspectsPage } from '@/pages/prospects';
import { OpportunitiesPage } from '@/pages/opportunities';
import { SelectionPage } from '@/pages/selection';
import { ConnectionsPage } from '@/pages/connections';
import { AboutPage } from '@/pages/about';
import { HelpPage } from '@/pages/help';
import { ProfilePage } from '@/pages/profile';
import { SettingsPage } from '@/pages/settings';
import { HowItWorksPage } from '@/pages/how-it-works';
import { NotificationsPage } from '@/pages/notifications';
import { Sun, Users, Target, Shield, Sparkles, Award, Heart, Globe, Star, Zap, Search, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';

function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  return (
    <div className="bg-white">
      <div className="relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50/80 via-white/20 to-white pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-brand-50/50 to-transparent pointer-events-none" />
        </div>
        <div className="relative px-6 pt-6 lg:px-8">
          <Header />
          <div className="mx-auto max-w-7xl pt-8 sm:pt-12 lg:pt-16">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-brand-100 mb-6 relative -z-10">
                <Star className="h-4 w-4 text-yellow-400 animate-pulse" />
                <span className="text-sm font-medium text-gray-600">Trusted by 5,000+ businesses</span>
              </div>
              <div className="relative z-10">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:leading-tight">
                  Find Your Perfect <span className="text-brand-600">Business Match</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Our AI-powered platform precisely matches your business with ideal partners, 
                  suppliers, and solutions. Skip the cold calls and connect directly with 
                  pre-qualified opportunities that align with your needs.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to={isAuthenticated ? "/opportunities" : "/selection"}>
                    <Button size="lg" className="w-full sm:w-auto">
                      Start Matching Now
                    </Button>
                  </Link>
                  <Link to="/how-it-works">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mb-3">
            <Target className="h-6 w-6 text-brand-600" />
          </div>
          <dt className="text-2xl font-bold text-brand-600">96%</dt>
          <dd className="mt-1 text-sm text-gray-500">Match Success Rate</dd>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mb-3">
            <Users className="h-6 w-6 text-brand-600" />
          </div>
          <dt className="text-2xl font-bold text-brand-600">10,000+</dt>
          <dd className="mt-1 text-sm text-gray-500">Active Matches</dd>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mb-3">
            <Shield className="h-6 w-6 text-brand-600" />
          </div>
          <dt className="text-2xl font-bold text-brand-600">30+</dt>
          <dd className="mt-1 text-sm text-gray-500">Industries Served</dd>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mb-3">
            <Zap className="h-6 w-6 text-brand-600" />
          </div>
          <dt className="text-2xl font-bold text-brand-600">3.5x</dt>
          <dd className="mt-1 text-sm text-gray-500">Faster Connections</dd>
        </div>
      </div>

      <div className="mx-auto max-w-7xl py-16 sm:py-24 px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-brand-600">Intelligent Matching</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Precision-engineered business matching
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our advanced algorithm analyzes thousands of data points to connect you with 
            opportunities that perfectly match your business needs and capabilities.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {[
              {
                icon: Search,
                name: 'Advanced Filtering',
                description: `Filter opportunities by industry, location, company size, revenue, and more. Find exactly what you're looking for with precision.`,
              },
              {
                icon: Shield,
                name: 'Verified Profiles',
                description: `Every business profile is thoroughly verified. Connect with confidence knowing you're dealing with legitimate opportunities.`,
              },
              {
                icon: Building2,
                name: 'Business Intelligence',
                description: `Access detailed company insights and analytics to make informed decisions about potential partnerships.`,
              },
            ].map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-brand-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="relative isolate mt-16 px-6 py-24 sm:mt-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-50/20" />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to find your perfect match?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Join thousands of businesses already using our platform to find their ideal partners, 
            suppliers, and solutions.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/selection">
              <Button size="lg">
                Get Started Free
              </Button>
            </Link>
            <Link
              to="/how-it-works"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>{children}</main>
    </div>
  );
}

function App() {
  return (
    <AnalyticsProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/selection" element={<SelectionPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/opportunities" element={<AppLayout><OpportunitiesPage /></AppLayout>} />
        <Route path="/connections" element={<AppLayout><ConnectionsPage /></AppLayout>} />
        <Route path="/notifications" element={<AppLayout><NotificationsPage /></AppLayout>} />
        <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
        <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
        <Route path="/about" element={<AppLayout><AboutPage /></AppLayout>} />
        <Route path="/help" element={<AppLayout><HelpPage /></AppLayout>} />
        <Route path="/how-it-works" element={<AppLayout><HowItWorksPage /></AppLayout>} />
      </Routes>
    </AnalyticsProvider>
  );
}

export default App;