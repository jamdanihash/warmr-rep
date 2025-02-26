import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Phone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8">
        <div className="relative">
          <Link
            to="/"
            className="absolute -top-16 left-0 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Join Warmr Today
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Connect with businesses, find opportunities, and grow your network
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">What you can do</h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start">
                    <Phone className="h-5 w-5 text-brand-600 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Connect with qualified leads and decision-makers</span>
                  </li>
                  <li className="flex items-start">
                    <Building2 className="h-5 w-5 text-brand-600 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Find and connect with potential partners and suppliers</span>
                  </li>
                  <li className="flex items-start">
                    <Phone className="h-5 w-5 text-brand-600 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Post and discover business opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <Building2 className="h-5 w-5 text-brand-600 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Access detailed company insights and analytics</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Get Started</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Create your account to start connecting with businesses
                  </p>
                </div>
                <div className="mt-6 space-y-4">
                  <Link to="/register" className="block w-full">
                    <Button className="w-full justify-center">
                      Create Account
                    </Button>
                  </Link>
                  <p className="text-sm text-gray-500 text-center">
                    Already have an account?{' '}
                    <Link to="/sign-in" className="text-brand-600 hover:text-brand-500 font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center space-y-4">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <ShieldCheck className="h-4 w-4 text-brand-600 mr-2" />
            Your data is protected by enterprise-grade security
          </div>
        </div>
      </div>
    </div>
  );
}