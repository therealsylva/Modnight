'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Mail, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

import { useRouter } from 'next/navigation';

export default function BecomeACreatorPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-background md:pl-20 flex flex-col">
      <div className="fixed top-6 left-20 z-50">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-sm text-foreground hover:border-foreground/30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                className="bg-card border border-border p-10 text-center space-y-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Application Received!</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Thanks for applying! We'll review your GitHub and get back to you at <span className="text-foreground">{email}</span> within a few days.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 px-6 py-2.5 text-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Home
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="bg-card border border-border p-8 text-center space-y-2">
                  <h1 className="text-4xl font-bold text-foreground tracking-tight">Become a Creator</h1>
                  <p className="text-sm text-muted-foreground">Publish your plugins & mods to thousands of users</p>
                </div>

                {/* Perks */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Publish Plugins', desc: 'Upload & manage your mods directly' },
                    { label: 'Earn Donations', desc: 'Accept support from your users' },
                    { label: 'Creator Badge', desc: 'Stand out with a verified badge' },
                  ].map((perk) => (
                    <div key={perk.label} className="bg-card border border-border p-3 space-y-1">
                      <p className="text-xs font-medium text-foreground">{perk.label}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{perk.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-card border border-border p-6 space-y-4">
                  <h2 className="text-sm font-medium text-foreground mb-2">Apply for Creator Access</h2>

                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full bg-background border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-foreground/40 transition-colors ${
                        errors.email ? 'border-red-400/60' : 'border-border'
                      }`}
                    />
                    {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5" /> GitHub Username
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 bg-muted border border-r-0 border-border text-xs text-muted-foreground">
                        github.com/
                      </span>
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value.replace(/^@/, ''))}
                        placeholder="yourusername"
                        className={`flex-1 bg-background border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-foreground/40 transition-colors ${
                          errors.github ? 'border-red-400/60' : 'border-border'
                        }`}
                      />
                    </div>
                    {errors.github && <p className="text-xs text-red-400">{errors.github}</p>}
                    <p className="text-[11px] text-muted-foreground">We'll review your public repos to verify your work.</p>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-sm font-medium text-foreground bg-primary border border-border hover:border-foreground/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      </>
                    )}
                  </motion.button>

                  <p className="text-[11px] text-muted-foreground text-center">
                    Applications are reviewed manually. You'll hear back within 3–5 business days.
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
