import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Users, MessageSquare, Target, Shield, Star, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Step {
  id: string;
  title: string;
  description: string;
  image: string;
  features: string[];
}

const steps: Step[] = [
  {
    id: 'profile',
    title: 'Create Your Business Profile',
    description: 'Set up your company profile with key information that helps our AI matching system find the perfect opportunities for you.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
    features: [
      'Add company details and industry focus',
      'Specify business size and target market',
      'Upload company logo and team information',
      'Set preferences for matching criteria'
    ]
  },
  {
    id: 'discover',
    title: 'Discover Opportunities',
    description: 'Browse through AI-curated opportunities that match your business profile and requirements.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2940&auto=format&fit=crop',
    features: [
      'Advanced filtering by industry, location, and size',
      'Real-time opportunity notifications',
      'Detailed company insights and analytics',
      'Save and track interesting prospects'
    ]
  },
  {
    id: 'connect',
    title: 'Connect Securely',
    description: 'Reach out to potential partners through our secure messaging system and start building relationships.',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2940&auto=format&fit=crop',
    features: [
      'End-to-end encrypted messaging',
      'Document sharing capabilities',
      'Video call integration',
      'Meeting scheduler'
    ]
  },
  {
    id: 'grow',
    title: 'Grow Your Network',
    description: 'Build and maintain valuable business relationships that drive growth and success.',
    image: 'https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=2940&auto=format&fit=crop',
    features: [
      'Track relationship progress',
      'Set follow-up reminders',
      'Measure engagement metrics',
      'Generate performance reports'
    ]
  }
];

const faqs = [
  {
    question: 'How does the matching algorithm work?',
    answer: 'Our AI-powered algorithm analyzes over 50 data points from your business profile and requirements to find the most relevant matches. It considers factors like industry alignment, company size, location, and business goals to ensure high-quality connections.'
  },
  {
    question: 'Is my business information secure?',
    answer: 'Yes, we implement enterprise-grade security measures including end-to-end encryption for messages, secure data storage, and strict access controls. Your data is only visible to verified users you choose to connect with.'
  },
  {
    question: 'How much does it cost?',
    answer: 'We offer a free basic plan that includes profile creation and basic matching. Premium features like advanced analytics and priority matching are available through our paid plans. View our pricing page for detailed information.'
  },
  {
    question: 'Can I control who sees my information?',
    answer: 'Absolutely. You have full control over your privacy settings and can choose what information is visible to other users. You can also approve or decline connection requests and block users if needed.'
  }
];

export function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState<string>('profile');
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium">How It Works</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-white pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="relative">
          <div className="text-center mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-8 lg:max-w-7xl">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              How Warmr Works
            </h1>
            <p className="mt-5 mx-auto max-w-prose text-xl text-gray-500">
              Transform your business networking with our AI-powered platform. Follow these simple steps to start making meaningful connections.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Quick Start Guide</h2>
            <p className="mt-4 text-lg text-gray-600">Get up and running in minutes</p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              { icon: Users, text: 'Create Account' },
              { icon: Search, text: 'Complete Profile' },
              { icon: Target, text: 'Find Matches' },
              { icon: MessageSquare, text: 'Start Connecting' }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">{step.text}</p>
                </div>
                {index < 3 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-brand-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Step Navigation */}
          <div className="lg:col-span-4">
            <nav className="space-y-1" aria-label="Steps">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full group flex items-center px-3 py-4 text-sm font-medium rounded-lg transition-colors ${
                    activeStep === step.id
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{step.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Step Content */}
          <div className="mt-8 lg:mt-0 lg:col-span-8">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`transition-opacity duration-200 ${
                  activeStep === step.id ? 'opacity-100' : 'hidden opacity-0'
                }`}
              >
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-gray-900">{step.title}</h3>
                <p className="mt-4 text-lg text-gray-500">{step.description}</p>
                <ul className="mt-8 space-y-4">
                  {step.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Shield className="h-5 w-5 text-brand-600 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to know about using Warmr
            </p>
          </div>

          <div className="mt-12 max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm">
                  <button
                    onClick={() => setActiveFaq(activeFaq === faq.question ? null : faq.question)}
                    className="w-full text-left px-6 py-4 focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                      <ChevronRight
                        className={`h-5 w-5 text-gray-500 transform transition-transform ${
                          activeFaq === faq.question ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                    {activeFaq === faq.question && (
                      <p className="mt-4 text-gray-600">{faq.answer}</p>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-brand-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="pt-16 pb-12 px-6 sm:pt-20 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
              <div className="lg:self-center">
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  <span className="block">Ready to transform your</span>
                  <span className="block">business connections?</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-brand-50">
                  Join thousands of businesses already growing with Warmr.
                </p>
                <Link
                  to="/selection"
                  className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-brand-600 bg-white hover:bg-brand-50 transition-colors"
                >
                  Get Started Today
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}