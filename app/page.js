"use client";

import { useState } from 'react';
import Link from 'next/link';
import Logo, { LogoMark } from './components/Logo';

// Icons
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

// Testimonial data
const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Founder, Crafty Designs",
    text: "This tool has completely transformed how we handle customer support. It's so simple to set up and our customers love the quick response times.",
    avatar: "/api/placeholder/40/40",
  },
  {
    name: "Michael Chen",
    role: "Solo Developer, CodeMaster",
    text: "As a one-person team, I needed something lightweight that wouldn't overwhelm me with features I don't need. This is perfect - easy to use and my clients are impressed!",
    avatar: "/api/placeholder/40/40",
  },
  {
    name: "Priya Sharma",
    role: "Customer Service, Bloom Boutique",
    text: "We tried several complex helpdesk solutions before finding this. The real-time chat is smooth, and we can manage everything without a complicated setup.",
    avatar: "/api/placeholder/40/40",
  },
];

// FAQ data
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
  },
];

export default function HomePage() {
  const [activeQuestion, setActiveQuestion] = useState(null);
  
  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
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
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">Simple customer support for small teams</h1>
              <p className="text-xl mb-8 text-blue-100">Set up your support chat in minutes. No complex systems. No steep learning curves. Just simple, effective customer conversations.</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/register" className="px-6 py-3 bg-white text-blue-600 rounded-md font-medium text-center hover:bg-blue-50">
                  Get Started Free
                </Link>
                <Link href="#demo" className="px-6 py-3 bg-transparent border border-white text-white rounded-md font-medium text-center hover:bg-white/10">
                  View Demo
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full h-64 flex items-center justify-center border-4 border-blue-200">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800">SupportLink Dashboard</h3>
                  <p className="text-gray-600 mt-2">Real-time customer chat interface</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Feature Highlights */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need, nothing you don't</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">Support tools shouldn't be complicated. We've focused on the features that actually matter to small teams.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Chat</h3>
              <p className="text-gray-600">Connect with customers instantly through WebSocket-powered real-time chat. No delays, no refreshing.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 010-5.656l4-4a4 4 0 015.656 5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Shareable Links</h3>
              <p className="text-gray-600">Generate unique conversation links for different customer issues. Organize conversations by category.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Conversation History</h3>
              <p className="text-gray-600">Keep a complete record of all customer conversations. Never lose important information again.</p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Setup Required</h3>
              <p className="text-gray-600">Create your account, generate a link, and start chatting with customers in under 5 minutes. It's that simple.</p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Category Organization</h3>
              <p className="text-gray-600">Organize customer inquiries by category. Technical support, billing questions, or feature requests - everything has its place.</p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Conversations</h3>
              <p className="text-gray-600">All conversations are protected with secure authentication. Only you and your customer can access the chat.</p>
            </div>
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
            {/* Step 1 */}
            <div>
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Create Your Portal</h3>
              <p className="text-gray-600">Sign up and create your customer support portal in less than a minute.</p>
            </div>
            
            {/* Step 2 */}
            <div>
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Generate Support Links</h3>
              <p className="text-gray-600">Create unique conversation links for different types of support queries.</p>
            </div>
            
            {/* Step 3 */}
            <div>
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Chat With Customers</h3>
              <p className="text-gray-600">Respond to customer inquiries in real-time through our simple chat interface.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">Choose the plan that works for your support needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold tracking-tight">$9</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </div>
                <p className="mt-5 text-gray-500">Perfect for solo entrepreneurs and small businesses just getting started.</p>
              </div>
              <div className="px-6 pt-6 pb-8">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">1 Support portal</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">Up to 100 conversations/month</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">Real-time chat</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">7-day message history</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/register" className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden border-2 border-blue-600 relative">
              <div className="absolute top-0 w-full text-center py-1.5 bg-blue-600 text-white text-sm font-semibold">
                Most Popular
              </div>
              <div className="p-6 pt-10">
                <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold tracking-tight">$29</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </div>
                <p className="mt-5 text-gray-500">For growing businesses with moderate support volume.</p>
              </div>
              <div className="px-6 pt-6 pb-8">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">3 Support portals</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">Up to 500 conversations/month</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">Real-time chat</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">30-day message history</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">2 team members</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">Email notifications</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/register" className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Business Plan */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900">Business</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold tracking-tight">$79</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </div>
                <p className="mt-5 text-gray-500">For businesses with high support volume and multiple team members.</p>
              </div>
              <div className="px-6 pt-6 pb-8">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">Unlimited support portals</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">Unlimited conversations</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">Real-time chat</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">Unlimited message history</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">10 team members</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">Email notifications</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <p className="ml-3 text-base text-gray-700">Priority support</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/register" className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
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
              <div key={index} className="bg-white rounded-lg shadow p-6">
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
      
      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-xl text-gray-600">Everything you need to know about our service</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  className="flex justify-between items-center w-full px-6 py-4 text-left font-semibold"
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
            <Link href="/register" className="px-8 py-3 bg-blue-600 text-white rounded-md font-medium text-center hover:bg-blue-700">
              Sign Up for Free
            </Link>
            <Link href="#demo" className="px-8 py-3 bg-white text-blue-600 border border-blue-600 rounded-md font-medium text-center hover:bg-blue-50">
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
                <li><Link href="#features" className="text-gray-300 hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="text-gray-300 hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Documentation</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white">About</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Blog</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Careers</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white">Community</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Partners</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white">Privacy</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Terms</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400">
              © 2025 Reach. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}