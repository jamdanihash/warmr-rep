import { Link } from 'react-router-dom';
import { Sun, Users, Target, Shield, Sparkles, Award, Heart, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const values = [
  {
    icon: Target,
    title: 'Precision Matching',
    description: 'We believe in creating meaningful connections that drive real business value.',
  },
  {
    icon: Shield,
    title: 'Trust & Security',
    description: 'Your data and business information are protected with enterprise-grade security.',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'We foster a collaborative ecosystem where businesses help each other grow.',
  },
  {
    icon: Sparkles,
    title: 'Innovation',
    description: 'Continuously improving our platform to deliver the best possible experience.',
  },
];

const achievements = [
  {
    icon: Award,
    title: 'Best B2B Platform',
    description: 'Named Best B2B Matching Platform by Business Tech Review 2025',
  },
  {
    icon: Users,
    title: '5,000+ Businesses',
    description: 'Trusted by companies across all industries',
  },
  {
    icon: Heart,
    title: '96% Satisfaction',
    description: 'Industry-leading customer satisfaction rate',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Connecting businesses across 30+ countries',
  },
];

export function AboutPage() {
  return (
    <div className="bg-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50/80 via-white/20 to-white" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center justify-center mb-8">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg">
                <Sun className="h-8 w-8 text-white" />
              </div>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Transforming How Businesses <span className="text-brand-600">Connect</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
              Our mission is to revolutionize business relationships by creating meaningful connections 
              that drive growth and innovation.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
              These core principles guide everything we do and shape how we serve our community.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-12 w-12 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{value.title}</h3>
                  <p className="mt-2 text-gray-500">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bg-brand-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Our Impact</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
              Recognized excellence in business networking and innovation.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div key={achievement.title} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-12 w-12 rounded-lg bg-brand-100 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{achievement.title}</h3>
                  <p className="mt-2 text-gray-500">{achievement.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
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
  );
}