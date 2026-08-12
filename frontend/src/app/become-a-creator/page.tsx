'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Mail, ChevronLeft, Check, Loader2, Upload, Coins, BadgeCheck, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { usePluginStats } from '@/hooks/use-plugins';
import { useRouter } from 'next/navigation';

const steps = [
  { number: '01', title: 'Apply', desc: 'Submit your email and GitHub. We review your public work.' },
  { number: '02', title: 'Get Approved', desc: 'We verify your profile and send you creator access within 3–5 days.' },
  { number: '03', title: 'Publish & Earn', desc: 'Upload your plugins, get downloaded, and receive donations from users.' },
];

const perks = [
  {
    icon: Upload,
    label: 'Publish Plugins',
    desc: 'Upload and manage your mods, tools, and plugins directly from your creator dashboard.',
  },
  {
    icon: Coins,
    label: 'Earn Donations',
    desc: 'Accept support from your users. Every download is a chance for someone to say thanks.',
  },
  {
    icon: BadgeCheck,
    label: 'Creator Badge',
    desc: 'Stand out with a verified creator badge displayed on all your plugins.',
  },
];

export default function BecomeACreatorPage() {
  const router = useRouter();
  const { data: statsData } = usePluginStats();
  const stats = statsData?.data;
  const [email, setEmail] = useState('');
  const [github, setGithub] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; github?: string }>({});

  const validate = () => {
    const errs: { email?: string; github?: string } = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!github || !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(github.replace(/^@/, ''))) {
      errs.github = 'Please enter a valid GitHub username.';
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await api.creators.apply(email, github);
    } catch (_) {}
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0C0C] md:pl-20 flex flex-col relative overflow-hidden">

      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Subtle radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Back button */}
      <div className="fixed top-6 left-6 md:left-24 z-50">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/20 transition-all rounded-md"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="relative flex-1 flex flex-col items-center px-6 pt-24 pb-20">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              className="w-full max-w-md mt-20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-10 text-center space-y-4 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-white">Application Received!</h2>
                <p className="text-sm text-white/50 leading-relaxed">
                  Thanks for applying! We'll review your GitHub and get back to you at{' '}
                  <span className="text-white">{email}</span> within a few days.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 px-6 py-2.5 text-sm border border-white/10 text-white/50 hover:text-white transition-colors rounded-md"
                >
                  Back to Home
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="w-full max-w-2xl space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <img src="/logo.svg" alt="ModNight" className="h-10 w-10" />
                </div>
                <motion.h1
                  className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Build. Publish.
                  <br />
                  <span className="text-white/30">Get Downloaded.</span>
                </motion.h1>
                <motion.p
                  className="text-sm text-white/40 max-w-md mx-auto leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Join the ModNight creator community. Publish your plugins, mods, and PC tools to thousands of users — completely free.
                </motion.p>
              </div>

              {/* Stats bar */}
              <motion.div
                className="flex flex-wrap justify-center gap-6 md:gap-12 py-5 border-y border-white/[0.06]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-white font-mono">
                    {stats ? stats.total_downloads.toLocaleString() : '—'}
                  </div>
                  <div className="text-xs text-white/30 mt-0.5">Total Downloads</div>
                </div>
                <div className="hidden md:block w-px bg-white/[0.06]" />
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-white font-mono">
                    {stats ? stats.total_plugins.toLocaleString() : '—'}
                  </div>
                  <div className="text-xs text-white/30 mt-0.5">Active Plugins</div>
                </div>
                <div className="hidden md:block w-px bg-white/[0.06]" />
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-white font-mono">Free</div>
                  <div className="text-xs text-white/30 mt-0.5">Always</div>
                </div>
              </motion.div>

              {/* Perks */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {perks.map((perk) => (
                  <div
                    key={perk.label}
                    className="relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-xl p-5 overflow-hidden hover:border-white/[0.15] transition-all duration-300"
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-4">
                      <perk.icon className="w-4 h-4 text-white/60" />
                    </div>
                    <p className="text-sm font-semibold text-white mb-1.5">{perk.label}</p>
                    <p className="text-xs text-white/35 leading-relaxed">{perk.desc}</p>
                  </div>
                ))}
              </motion.div>

              {/* How it works */}
              <motion.div
                className="relative bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <p className="text-xs font-medium text-white/30 uppercase tracking-widest mb-6">How it works</p>
                <div className="flex flex-col md:flex-row gap-6">
                  {steps.map((step, i) => (
                    <div key={step.number} className="flex-1 flex gap-4 items-start">
                      <span className="font-mono text-xs text-white/20 flex-shrink-0 mt-0.5">{step.number}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white mb-1">{step.title}</p>
                        <p className="text-xs text-white/35 leading-relaxed">{step.desc}</p>
                      </div>
                      {i < steps.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-white/10 flex-shrink-0 hidden md:block mt-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Form */}
              <motion.div
                className="relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6 overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                <h2 className="text-sm font-semibold text-white mb-5">Apply for Creator Access</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full bg-white/[0.04] border px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/25 transition-colors rounded-md ${
                        errors.email ? 'border-red-400/60' : 'border-white/[0.08]'
                      }`}
                    />
                    {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40 flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5" /> GitHub Username
                    </label>
                    <div className="flex items-center rounded-md overflow-hidden border border-white/[0.08] focus-within:border-white/25 transition-colors">
                      <span className="px-3 py-2.5 bg-white/[0.03] border-r border-white/[0.08] text-xs text-white/25 whitespace-nowrap">
                        github.com/
                      </span>
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value.replace(/^@/, ''))}
                        placeholder="yourusername"
                        className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none"
                      />
                    </div>
                    {errors.github && <p className="text-xs text-red-400">{errors.github}</p>}
                    <p className="text-[11px] text-white/25">We'll review your public repos to verify your work.</p>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-sm font-semibold text-white bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.12] hover:border-white/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-md"
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.99 }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>

                  <p className="text-[11px] text-white/25 text-center">
                    Applications are reviewed manually. You'll hear back within 3–5 business days.
                  </p>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
