"use client";

import Link from "next/link";
import { useState } from "react";
import {
  HelmetIcon,
  HeadsetIcon,
  BookingIcon,
  KiteIcon,
  PaymentIcon,
  EquipmentIcon,
} from "@/svgs";
import { CheckCircle, Users, Wind, Calendar, BarChart3, Zap, ArrowRight } from "lucide-react";
import { ToggleLevantePoniente } from "@/components/ToggleLevantePoniente";

export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const themeClass = isDarkMode ? 'dark' : '';

  const handleThemeChange = (newIsDarkMode: boolean) => {
    setIsDarkMode(newIsDarkMode);
  };
  return (
    <div className={`min-h-screen transition-colors ${themeClass} ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Navigation */}
      <nav className={`border-b px-6 py-4 ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-white'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <KiteIcon className="w-8 h-8 text-[#0058A6]" />
            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>KiteFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/docs" className={`hover:text-[#0058A6] transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              How it works
            </Link>
            {/* Theme Toggle */}
            <ToggleLevantePoniente onThemeChange={handleThemeChange} />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Schedule your kite lessons{" "}
            <span className="text-[#0058A6]">effortlessly</span>
          </h1>
          <p className={`text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            All-in-one kite school management. Connect students with teachers, automate scheduling, 
            and manage lessons with intelligent filtering and real-time updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/" 
              className="px-8 py-4 bg-[#0058A6] text-white text-lg font-semibold rounded-xl hover:bg-[#004088] transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              Start free trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/docs" 
              className="px-8 py-4 border border-gray-300 text-gray-700 text-lg font-semibold rounded-xl hover:border-[#0058A6] hover:text-[#0058A6] transition-colors"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className={`px-6 py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Stop managing lessons with spreadsheets
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-red-600 text-sm">✗</span>
                  </div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Manual scheduling conflicts and double bookings</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-red-600 text-sm">✗</span>
                  </div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Lost student information and payment tracking</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-red-600 text-sm">✗</span>
                  </div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Time wasted on administrative tasks instead of teaching</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#0058A6] mb-6">
                Automated kite school management
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Smart conflict detection and automatic resolution</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Complete student profiles and payment automation</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Focus on teaching while we handle the logistics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className={`text-3xl font-bold text-center mb-16 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Everything you need to run your kite school
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Student Management */}
            <div className={`p-8 rounded-2xl border hover:border-[#0058A6]/20 hover:shadow-lg transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <HelmetIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Student Management</h3>
              <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Track student progress, manage bookings, and maintain detailed profiles with languages, sizes, and preferences.
              </p>
            </div>

            {/* Teacher Scheduling */}
            <div className={`p-8 rounded-2xl border hover:border-[#0058A6]/20 hover:shadow-lg transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <HeadsetIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Smart Scheduling</h3>
              <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Drag-and-drop scheduling with automatic conflict detection and commission management for teachers.
              </p>
            </div>

            {/* Equipment Tracking */}
            <div className={`p-8 rounded-2xl border hover:border-[#0058A6]/20 hover:shadow-lg transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <EquipmentIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Equipment Tracking</h3>
              <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Monitor kite usage, assign equipment to teachers, and track maintenance across all your gear.
              </p>
            </div>

            {/* Booking System */}
            <div className={`p-8 rounded-2xl border hover:border-[#0058A6]/20 hover:shadow-lg transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <BookingIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Package Management</h3>
              <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Create flexible packages with duration, capacity, and pricing. Automatic lesson generation from bookings.
              </p>
            </div>

            {/* Payments */}
            <div className={`p-8 rounded-2xl border hover:border-[#0058A6]/20 hover:shadow-lg transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <PaymentIcon className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Tracking</h3>
              <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Track teacher payments, commission rates, and generate financial reports with ease.
              </p>
            </div>

            {/* Export & Share */}
            <div className={`p-8 rounded-2xl border hover:border-[#0058A6]/20 hover:shadow-lg transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Export & Analytics</h3>
              <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Export schedules to CSV, WhatsApp, or PDF. Generate medical reports and track school performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Interface Section */}
      <section className={`px-6 py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className={`text-3xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Two interfaces, one powerful system
          </h2>
          <p className={`text-xl text-center mb-16 max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Choose the interface that fits your workflow. Mobile-first whiteboard for daily operations, 
            or desktop billboard for complex scheduling.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Whiteboard */}
            <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-800' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#0058A6] rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Whiteboard</h3>
              </div>
              <p className={`mb-6 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Mobile-first interface perfect for on-the-go management. Quick lesson creation, 
                status updates, and teacher assignments.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Mobile-optimized design</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Quick status updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Real-time filtering</span>
                </div>
              </div>
              <Link 
                href="/whiteboard" 
                className="inline-block mt-6 px-6 py-3 bg-[#0058A6] text-white rounded-lg hover:bg-[#004088] transition-colors"
              >
                Try Whiteboard
              </Link>
            </div>

            {/* Billboard */}
            <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-800' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#0058A6] rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Billboard</h3>
              </div>
              <p className={`mb-6 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Desktop drag-and-drop interface for complex scheduling. Visual teacher columns 
                with advanced conflict resolution.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Drag-and-drop scheduling</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Visual teacher layout</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Conflict detection</span>
                </div>
              </div>
              <Link 
                href="/billboard" 
                className="inline-block mt-6 px-6 py-3 bg-[#0058A6] text-white rounded-lg hover:bg-[#004088] transition-colors"
              >
                Try Billboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial/Social Proof */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-3xl font-bold mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Trusted by kite schools worldwide
          </h2>
          <div className={`p-8 rounded-2xl border shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Wind className="w-6 h-6 text-[#0058A6]" />
              <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tarifa Kite Hostel</span>
            </div>
            <p className={`text-lg italic mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              "KiteFlow transformed our operations completely. What used to take hours of manual work 
              now happens automatically. Our teachers love the interface and our students never miss a lesson."
            </p>
            <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              — Leading kite school in Tarifa, Spain
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className={`px-6 py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <h2 className={`text-3xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Simple, transparent pricing
          </h2>
          <p className={`text-xl text-center mb-16 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Start free, scale as you grow. Perfect for kite schools of any size.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Starter</h3>
              <div className="mb-6">
                <span className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Free</span>
              </div>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Perfect for getting started</p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Up to 2 teachers</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Basic scheduling</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Student management</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Basic exports</span>
                </div>
              </div>
              <Link 
                href="/" 
                className={`w-full block text-center px-6 py-3 border rounded-lg transition-colors ${isDarkMode ? 'border-gray-500 text-gray-300 hover:border-[#0058A6] hover:text-[#0058A6]' : 'border-gray-300 text-gray-700 hover:border-[#0058A6] hover:text-[#0058A6]'}`}
              >
                Get Started
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-[#0058A6] p-8 rounded-2xl border border-[#0058A6] relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-white text-[#0058A6] px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">€45</span>
                <span className="text-blue-100">/month</span>
              </div>
              <p className="text-blue-100 mb-6">For growing kite schools</p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span className="text-white">Unlimited teachers</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span className="text-white">Advanced scheduling</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span className="text-white">Payment tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span className="text-white">All export formats</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span className="text-white">Priority support</span>
                </div>
              </div>
              <Link 
                href="/" 
                className="w-full block text-center px-6 py-3 bg-white text-[#0058A6] rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Multi-location */}
            <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Multi-Location</h3>
              <div className="mb-6">
                <span className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>€90</span>
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>/extra school</span>
              </div>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Perfect for multiple locations</p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Everything in Pro</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Multiple school management</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Cross-location analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Dedicated support</span>
                </div>
              </div>
              <Link 
                href="mailto:contact@kiteflow.com" 
                className={`w-full block text-center px-6 py-3 border rounded-lg transition-colors ${isDarkMode ? 'border-gray-500 text-gray-300 hover:border-[#0058A6] hover:text-[#0058A6]' : 'border-gray-300 text-gray-700 hover:border-[#0058A6] hover:text-[#0058A6]'}`}
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Ready to streamline your kite school?
          </h2>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Join kite schools worldwide who trust KiteFlow for their lesson management. 
            Start your free trial today.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0058A6] text-white text-lg font-semibold rounded-xl hover:bg-[#004088] transition-all hover:scale-105"
          >
            <Zap className="w-5 h-5" />
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t px-6 py-8 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <KiteIcon className="w-6 h-6 text-[#0058A6]" />
            <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>KiteFlow</span>
          </div>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            The complete kite school management solution
          </p>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Have questions? <a href="mailto:contact@kiteflow.com" className="text-[#0058A6] hover:underline">Contact me</a>
          </p>
        </div>
      </footer>
    </div>
  );
}