// components/LandingPageSections.js
import { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { useRotatingText } from '../hooks/useRotatingText';

// Navigation Component
export function Navigation() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Logo className="h-8 w-auto" />
          </div>
          <div className="flex items-center space-x-4">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">Log in</Link>
            <Link href="/register" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Sign up</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Chat Interface SVG
const ChatInterfaceIllustration = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full">
    <rect x="20" y="20" width="360" height="260" rx="12" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2"/>
    <rect x="20" y="20" width="360" height="50" rx="12" fill="#3b82f6"/>
    <rect x="20" y="58" width="360" height="12" fill="#3b82f6"/>
    <circle cx="50" cy="45" r="8" fill="#ffffff" opacity="0.9"/>
    <rect x="70" y="38" width="80" height="6" rx="3" fill="#ffffff" opacity="0.9"/>
    <rect x="70" y="48" width="60" height="4" rx="2" fill="#ffffff" opacity="0.7"/>
    <circle cx="340" cy="45" r="4" fill="#10b981"/>
    <rect x="40" y="90" width="180" height="35" rx="18" fill="#f3f4f6"/>
    <rect x="50" y="100" width="120" height="4" rx="2" fill="#6b7280"/>
    <rect x="50" y="108" width="90" height="4" rx="2" fill="#6b7280"/>
    <rect x="50" y="116" width="60" height="4" rx="2" fill="#6b7280"/>
    <rect x="180" y="135" width="160" height="35" rx="18" fill="#3b82f6"/>
    <rect x="190" y="145" width="100" height="4" rx="2" fill="#ffffff" opacity="0.9"/>
    <rect x="190" y="153" width="80" height="4" rx="2" fill="#ffffff" opacity="0.9"/>
    <rect x="190" y="161" width="50" height="4" rx="2" fill="#ffffff" opacity="0.9"/>
    <rect x="40" y="180" width="200" height="25" rx="12" fill="#f3f4f6"/>
    <rect x="50" y="190" width="140" height="4" rx="2" fill="#6b7280"/>
    <rect x="50" y="198" width="100" height="4" rx="2" fill="#6b7280"/>
    <rect x="200" y="215" width="140" height="25" rx="12" fill="#3b82f6"/>
    <rect x="210" y="225" width="90" height="4" rx="2" fill="#ffffff" opacity="0.9"/>
    <rect x="210" y="233" width="70" height="4" rx="2" fill="#ffffff" opacity="0.9"/>
    <rect x="30" y="250" width="340" height="20" rx="10" fill="#f9fafb" stroke="#e5e7eb"/>
    <rect x="40" y="257" width="200" height="6" rx="3" fill="#d1d5db"/>
    <circle cx="350" cy="260" r="8" fill="#3b82f6"/>
    <path d="M346 260 L350 257 L354 260 L350 263 Z" fill="#ffffff"/>
    <circle cx="80" cy="50" r="2" fill="#ffffff" opacity="0.6"/>
    <circle cx="380" cy="100" r="3" fill="#3b82f6" opacity="0.3"/>
    <circle cx="30" cy="180" r="2" fill="#10b981" opacity="0.5"/>
    <circle cx="360" cy="30" r="4" fill="#ef4444"/>
    <text x="360" y="33" textAnchor="middle" fontSize="6" fill="#ffffff" fontWeight="bold">3</text>
  </svg>
);

// Hero Section Component
export function HeroSection() {
  const rotatingWord = useRotatingText(['support', 'research', 'chat'], 1000);

  return (
    <section className="bg-white text-gray-900 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Launch your{' '}
              <span className="inline-block min-w-[120px] text-blue-600 transition-all duration-300 ease-in-out">
                {rotatingWord}
              </span>{''}
              portal in minutes
            </h1>
            <p className="text-xl mb-8 text-gray-600">
              Share link and start chatting. No complex systems. No steep learning curves. 
              Just simple, effective conversations with your customers.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/register" className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium text-center hover:bg-blue-700 transition-colors">
                Get Started Free
              </Link>
              <Link href="#demo" className="px-6 py-3 bg-transparent border border-gray-300 text-gray-700 rounded-md font-medium text-center hover:bg-gray-50 transition-colors">
                View Demo
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-gray-50 p-8 rounded-2xl shadow-xl border border-gray-200">
              <ChatInterfaceIllustration />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Features and How It Works Combined Section
export function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "Real-time Chat",
      description: "Connect with customers instantly through WebSocket-powered real-time chat. No delays, no refreshing."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 010-5.656l4-4a4 4 0 015.656 5.656l-1.1 1.1" />
        </svg>
      ),
      title: "Shareable Links",
      description: "Generate unique conversation links for different customer issues. Organize conversations by category."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      title: "Conversation History",
      description: "Keep a complete record of all customer conversations. Never lose important information again."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "No Setup Required",
      description: "Create your account, generate a link, and start chatting with customers in under 5 minutes. It's that simple."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Category Organization",
      description: "Organize customer inquiries by category. Technical support, billing questions, or feature requests - everything has its place."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Secure Conversations",
      description: "All conversations are protected with secure authentication. Only you and your customer can access the chat."
    }
  ];

  const steps = [
    {
      stepNumber: 1,
      title: "Create Your Portal",
      description: "Sign up and create your customer support portal in less than a minute."
    },
    {
      stepNumber: 2,
      title: "Generate Support Links",
      description: "Create unique conversation links for different types of support queries."
    },
    {
      stepNumber: 3,
      title: "Chat With Customers",
      description: "Respond to customer inquiries in real-time through our simple chat interface."
    }
  ];

  return (
    <>
      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need, nothing you do not</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">Support tools should not be complicated. We have focused on the features that actually matter to small teams.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">Three simple steps to better customer support</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {steps.map((step, index) => (
              <div key={index} className="group">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 group-hover:bg-blue-700 transition-colors">
                  {step.stepNumber}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// Pricing and Testimonials Combined Section
export function PricingTestimonialsSection() {
  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );

const pricingPlans = [
    {
      name: "Free",
      price: 0,
      description: "Perfect for trying out our platform or personal projects.",
      features: [
        "1 Support portal",
        "Up to 20 conversations/month",
        "Real-time chat",
        "3-day message history",
        "Basic email support"
      ]
    },
    {
      name: "Starter",
      price: 5,
      description: "Great for freelancers and small businesses getting started.",
      isPopular: true,
      features: [
        "3 Support portals",
        "Up to 200 conversations/month",
        "Real-time chat",
        "30-day message history",
        "Email notifications",
        "Priority email support"
      ]
    },
    {
      name: "Pro",
      price: 9,
      description: "For growing businesses that need more conversations and features.",
      features: [
        "Unlimited support portals",
        "Up to 1000 conversations/month",
        "Real-time chat",
        "90-day message history",
        "Email notifications",
        "2 team members",
        "Priority support",
        "Advanced analytics"
      ]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Founder, Crafty Designs",
      text: "This tool has completely transformed how we handle customer support. It's so simple to set up and our customers love the quick response times."
    },
    {
      name: "Michael Chen",
      role: "Solo Developer, CodeMaster",
      text: "As a one-person team, I needed something lightweight that wouldn't overwhelm me with features I don't need. This is perfect - easy to use and my clients are impressed!"
    },
    {
      name: "Priya Sharma",
      role: "Customer Service, Bloom Boutique",
      text: "We tried several complex helpdesk solutions before finding this. The real-time chat is smooth, and we can manage everything without a complicated setup."
    }
  ];

  return (
    <>
      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">Choose the plan that works for your support needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-lg shadow overflow-hidden ${
                plan.isPopular 
                  ? 'shadow-xl border-2 border-blue-600 relative transform hover:scale-105 transition-transform' 
                  : 'hover:shadow-lg transition-shadow'
              }`}>
                {plan.isPopular && (
                  <div className="absolute top-0 w-full text-center py-1.5 bg-blue-600 text-white text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className={`p-6 ${plan.isPopular ? 'pt-10' : ''}`}>
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-extrabold tracking-tight">${plan.price}</span>
                    <span className="ml-1 text-xl font-semibold">/month</span>
                  </div>
                  <p className="mt-5 text-gray-500">{plan.description}</p>
                </div>
                <div className="px-6 pt-6 pb-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <div className="flex-shrink-0">
                          <CheckIcon />
                        </div>
                        <p className="ml-3 text-base text-gray-700">{feature}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link href="/register" className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                      Get Started
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Trusted by Small Businesses Everywhere</h2>
            <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">See what our customers are saying about our simple support solution</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <p className="text-gray-600 mb-6">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <img src="/img/avatar-1.svg" alt={testimonial.name} className="h-10 w-10 rounded-full mr-4 bg-gray-200" />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// FAQ, CTA, and Footer Combined Section
export function FAQFooterSection() {
  const [activeQuestion, setActiveQuestion] = useState(null);
  
  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const faqs = [
    {
      question: "How quickly can I get started?",
      answer: "Setup takes less than 5 minutes. Just register, create your support portal, and share the generated link with your customers. No technical expertise required!"
    },
    {
      question: "Is there a limit to how many conversations I can have?",
      answer: "Our Starter plan includes 100 conversations per month, Pro offers 500, and Business provides unlimited conversations. Choose the plan that fits your support volume."
    },
    {
      question: "Can I customize the look and feel?",
      answer: "Yes! You can add your logo, customize colors, and create personalized chat categories to match your brand identity."
    },
    {
      question: "Do you offer integrations with other tools?",
      answer: "We currently offer integrations with email notifications. Additional integrations with popular CRM and project management tools are coming soon."
    },
    {
      question: "Is the chat functionality real-time?",
      answer: "Absolutely! All our plans include real-time WebSocket-based chat so your customers get instant responses without refreshing the page."
    },
    {
      question: "Can multiple team members access the same portal?",
      answer: "Our Pro and Business plans support team collaboration with multiple agent accounts. The Starter plan is designed for solo operators."
    }
  ];

  return (
    <>
      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-xl text-gray-600">Everything you need to know about our service</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <button
                  className="flex justify-between items-center w-full px-6 py-4 text-left font-semibold hover:bg-gray-50 transition-colors"
                  onClick={() => toggleQuestion(index)}
                >
                  <span>{faq.question}</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${activeQuestion === index ? 'transform rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {activeQuestion === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to simplify your customer support?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of small businesses providing exceptional support experiences without the complexity.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/register" className="px-8 py-3 bg-blue-600 text-white rounded-md font-medium text-center hover:bg-blue-700 transition-colors">
              Sign Up for Free
            </Link>
            <Link href="#demo" className="px-8 py-3 bg-white text-blue-600 border border-blue-600 rounded-md font-medium text-center hover:bg-blue-50 transition-colors">
              Schedule a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-300 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Community</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Partners</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400">
              © 2025 Reach. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}