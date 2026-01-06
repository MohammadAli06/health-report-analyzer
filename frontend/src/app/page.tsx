'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileSearch,
  AlertTriangle,
  Heart,
  Upload,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full border border-indigo-500/10"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full border border-purple-500/10"
          />
        </div>

        <div className="container-custom relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-indigo-300">AI-Powered Medical Report Analysis</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Understand Your{' '}
              <span className="gradient-text">Medical Reports</span>{' '}
              in Simple Terms
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Upload your lab reports and get instant AI-powered analysis. We translate
              complex medical terminology into clear, patient-friendly language with
              actionable health insights.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/dashboard"
                className="gradient-btn inline-flex items-center gap-2 text-lg py-4 px-8"
              >
                <Upload className="w-5 h-5" />
                Analyze Your Report
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
              >
                See How It Works
              </a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-12 text-zinc-500 text-sm"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                HIPAA Compliant
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Results in Seconds
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                No Medical Jargon
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Features for Your Health
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive analysis of your medical
              reports with features designed to give you clarity and peace of mind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={FileSearch}
              title="Medical Term Simplification"
              description="Complex medical terminology explained in simple, easy-to-understand language."
              color="from-indigo-500 to-blue-500"
              delay={0}
            />
            <FeatureCard
              icon={AlertTriangle}
              title="Abnormal Value Detection"
              description="Automatically flags values outside normal reference ranges with color-coded indicators."
              color="from-amber-500 to-orange-500"
              delay={0.1}
            />
            <FeatureCard
              icon={Heart}
              title="Health Insights & Alerts"
              description="Clear indicators for values that may require medical attention with actionable guidance."
              color="from-rose-500 to-pink-500"
              delay={0.2}
            />
            <FeatureCard
              icon={BarChart3}
              title="Visual Analytics"
              description="Interactive charts and visualizations to track and understand your health data."
              color="from-emerald-500 to-teal-500"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 relative bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Get your medical report analyzed in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step={1}
              title="Upload Your Report"
              description="Simply drag and drop your PDF or image of your medical lab report. We support all common formats."
              delay={0}
            />
            <StepCard
              step={2}
              title="AI Analysis"
              description="Our advanced AI extracts all test parameters, detects abnormal values, and determines severity levels."
              delay={0.1}
            />
            <StepCard
              step={3}
              title="Get Clear Insights"
              description="Receive easy-to-understand explanations, health score, and actionable recommendations."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-12 text-center relative overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Understand Your Health Better?
              </h2>
              <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                Upload your medical report now and get instant AI-powered insights.
                No registration required.
              </p>
              <Link
                href="/dashboard"
                className="gradient-btn inline-flex items-center gap-2 text-lg py-4 px-8"
              >
                <Upload className="w-5 h-5" />
                Start Analyzing
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-6 group"
    >
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StepCard({
  step,
  title,
  description,
  delay,
}: {
  step: number;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative"
    >
      {/* Connector line */}
      {step < 3 && (
        <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-500/50 to-transparent" />
      )}

      <div className="glass-card p-8 text-center relative">
        {/* Step number */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white mx-auto mb-5">
          {step}
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
