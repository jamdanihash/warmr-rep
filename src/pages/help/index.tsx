import { useState } from 'react';
import { Search, Book, MessageCircle, AlertCircle, HelpCircle, Mail, Phone, ExternalLink, ChevronDown, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface HelpSection {
  id: string;
  title: string;
  icon: any;
  description: string;
  topics: HelpTopic[];
}

interface HelpTopic {
  id: string;
  title: string;
  content: string;
}

interface EmailModalProps {
  onClose: () => void;
}

interface CallModalProps {
  onClose: () => void;
}

const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Book,
    description: 'Learn the basics of using Warmr',
    topics: [
      {
        id: 'account-setup',
        title: 'Setting up your account',
        content: `
1. Click the "Get Started" button in the top right corner
2. Choose whether you're looking to buy or sell
3. Fill in your business details and create your account
4. Verify your email address
5. Complete your business profile with additional information

Your profile helps us match you with relevant opportunities and partners.
        `,
      },
      {
        id: 'first-steps',
        title: 'First steps after signing up',
        content: `
After creating your account, we recommend:

1. Browse the Opportunities Board to see available listings
2. Set up your notification preferences
3. Create your first opportunity or requirement
4. Connect with potential partners
5. Explore the platform features

Remember to keep your profile updated to improve matching accuracy.
        `,
      },
    ],
  },
  {
    id: 'opportunities',
    title: 'Managing Opportunities',
    icon: MessageCircle,
    description: 'Learn how to post and manage business opportunities',
    topics: [
      {
        id: 'create-opportunity',
        title: 'Creating a new opportunity',
        content: `
To create a new opportunity:

1. Navigate to the Opportunities Board
2. Click "Post Opportunity"
3. Select opportunity type (buying/selling)
4. Fill in the required details:
   - Business name
   - Industry
   - Description (max 200 characters)
   - Contact information
   - Location
5. Review and submit

Tips for effective opportunities:
- Be clear and specific about your requirements
- Include relevant industry keywords
- Provide accurate contact information
- Set realistic expectations
        `,
      },
      {
        id: 'manage-opportunities',
        title: 'Managing your opportunities',
        content: `
From the My Opportunities page, you can:

1. View all your opportunities
2. Track opportunity status
3. Update opportunity details
4. Mark opportunities as complete
5. Archive old opportunities
6. Monitor engagement metrics

Keep your opportunities updated to maintain visibility and relevance.
        `,
      },
    ],
  },
  {
    id: 'communication',
    title: 'Communication Tools',
    icon: Mail,
    description: 'Learn about messaging and connection features',
    topics: [
      {
        id: 'messaging',
        title: 'Using the messaging system',
        content: `
Our messaging system allows you to:

1. Send direct messages to connections
2. Share additional information securely
3. Track conversation history
4. Set message notifications
5. Use message templates

Best practices:
- Respond promptly to messages
- Keep conversations professional
- Use clear and concise language
- Follow up appropriately
        `,
      },
      {
        id: 'connections',
        title: 'Managing connections',
        content: `
To manage your business connections:

1. View connection requests in the Messages tab
2. Accept or decline connection requests
3. View connection profiles
4. Manage blocked connections
5. Export connection details

Remember to:
- Verify connection authenticity
- Maintain professional relationships
- Report any suspicious activity
        `,
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: AlertCircle,
    description: 'Common issues and their solutions',
    topics: [
      {
        id: 'common-issues',
        title: 'Common issues and solutions',
        content: `
Common Issues:

1. Login Problems
   - Clear browser cache
   - Reset password
   - Check email verification status

2. Messaging Issues
   - Check internet connection
   - Verify recipient is still active
   - Clear message cache

3. Opportunity Posting
   - Verify all required fields
   - Check character limits
   - Ensure proper formatting

4. Connection Problems
   - Check account status
   - Verify email address
   - Update contact information
        `,
      },
      {
        id: 'account-security',
        title: 'Account security',
        content: `
Protect your account:

1. Use strong passwords
2. Enable two-factor authentication
3. Monitor account activity
4. Report suspicious behavior
5. Keep contact info updated

Security best practices:
- Regular password updates
- Verify connection requests
- Use secure networks
- Log out from shared devices
        `,
      },
    ],
  },
];

export function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  const handleEmailSupport = () => {
    window.location.href = 'mailto:hello@warmr.space?subject=Support Request';
  };

  const handleScheduleCall = () => {
    window.location.href = 'mailto:hello@warmr.space?subject=Schedule a Support Call';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <HelpCircle className="h-12 w-12 text-brand-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">How can we help?</h1>
          <p className="mt-4 text-lg text-gray-500">
            Find answers to common questions and learn how to make the most of Warmr
          </p>
        </div>

        {/* Search */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border-gray-300 pl-10 focus:border-brand-500 focus:ring-brand-500"
              placeholder="Search help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Help Sections */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="space-y-6">
            {helpSections.map((section) => (
              <div key={section.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                >
                  <div className="flex items-center">
                    <section.icon className="h-6 w-6 text-brand-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                      <p className="text-sm text-gray-500">{section.description}</p>
                    </div>
                  </div>
                  {expandedSection === section.id ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {expandedSection === section.id && (
                  <div className="border-t border-gray-200">
                    {section.topics.map((topic) => (
                      <div key={topic.id} className="border-b border-gray-200 last:border-0">
                        <button
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
                          onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                        >
                          <h4 className="text-base font-medium text-gray-900">{topic.title}</h4>
                          {expandedTopic === topic.id ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </button>

                        {expandedTopic === topic.id && (
                          <div className="px-6 py-4 bg-gray-50">
                            <div className="prose prose-sm max-w-none">
                              {topic.content.split('\n').map((line, index) => (
                                <p key={index} className="mb-2 last:mb-0">
                                  {line}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900">Still need help?</h2>
            <p className="mt-2 text-gray-500">
              Our support team is available to assist you with any questions or concerns.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 hover:bg-brand-50"
                onClick={handleEmailSupport}
                aria-label="Send email to support"
              >
                <Mail className="h-5 w-5" />
                <span>Email Support</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 hover:bg-brand-50"
                onClick={handleScheduleCall}
                aria-label="Schedule a support call"
              >
                <Phone className="h-5 w-5" />
                <span>Schedule a Call</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Resources</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <a
              href="#"
              className="group block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-brand-600">
                Video Tutorials
              </h3>
              <p className="mt-2 text-gray-500">
                Watch step-by-step guides on using Warmr's features
              </p>
              <div className="mt-4 flex items-center text-brand-600">
                Learn more
                <ExternalLink className="h-4 w-4 ml-2" />
              </div>
            </a>
            <a
              href="#"
              className="group block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-brand-600">
                API Documentation
              </h3>
              <p className="mt-2 text-gray-500">
                Technical documentation for developers
              </p>
              <div className="mt-4 flex items-center text-brand-600">
                View docs
                <ExternalLink className="h-4 w-4 ml-2" />
              </div>
            </a>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-12 text-center text-sm text-gray-500">
          Last updated: February 19, 2025 | Version 1.0.0
        </div>
      </div>
    </div>
  );
}