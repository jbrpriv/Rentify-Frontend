'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import {
  HeadphonesIcon, Mail, Phone, MessageSquare,
  CheckCircle, Loader2, ChevronDown, ChevronUp,
  Home, AlertCircle, FileText, CreditCard, Wrench, Shield, ArrowRight,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MotionRevealSection } from '@/components/ui/Motion';
import { useReveal } from '@/hooks/useReveal';

// ─── Data ──────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'general', label: 'General Enquiry', icon: MessageSquare },
  { value: 'billing', label: 'Billing & Payments', icon: CreditCard },
  { value: 'account', label: 'Account & Login', icon: Shield },
  { value: 'dispute', label: 'Dispute / Complaint', icon: AlertCircle },
  { value: 'agreement', label: 'Lease Agreement', icon: FileText },
  { value: 'maintenance', label: 'Maintenance Issue', icon: Wrench },
  { value: 'property', label: 'Property Listing', icon: Home },
];

const FAQS = [
  {
    q: 'How do I submit a maintenance request?',
    a: 'Log into your tenant dashboard and navigate to Maintenance. Click "New Request", describe the issue, and submit. Your landlord or property manager will be notified immediately.',
  },
  {
    q: 'I\'m having trouble paying my rent online — what should I do?',
    a: 'Ensure your payment method is valid and has sufficient funds. If the problem persists, try a different card or contact your bank. You can also reach us via this form and we will assist you.',
  },
  {
    q: 'How do I dispute a late fee?',
    a: 'Navigate to Disputes in your dashboard and file a dispute with the relevant agreement selected. Our team reviews all disputes within 2–3 business days.',
  },
  {
    q: 'Can I view my lease agreement without logging in?',
    a: 'Yes — lease agreements can be viewed and signed via a unique link sent to your email. Check your inbox for the signing invitation from RentifyPro.',
  },
  {
    q: 'How do I update my contact details or phone number?',
    a: 'Log in and go to your Profile page. You can update your phone number, address, and notification preferences from there.',
  },
  {
    q: 'What happens when my lease expires?',
    a: 'Your landlord can propose a renewal from the Agreements page. You will receive an email notification and can accept or decline the renewal from your dashboard.',
  },
];

const CONTACT_CHANNELS = [
  { icon: Mail, label: 'Email', value: 'support@rentifypro.com', href: 'mailto:support@rentifypro.com', accent: '#0992C2' },
];

// ─── Reveal wrapper ────────────────────────────────────────────────────────────
function RevealCard({ children, delay = 0, className = '' }) {
  const [ref, revealed] = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${revealed ? 'revealed' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Shared glass input style ──────────────────────────────────────────────────
const glassInput = {
  width: '100%',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  padding: '10px 14px',
  fontSize: '0.875rem',
  color: 'white',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: 'rgba(255,255,255,0.5)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  display: 'block',
  marginBottom: 6,
};

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function SupportPage() {
  const { user } = useUser();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', category: 'general', message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/support', form, { headers: { Authorization: undefined } });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#040C23' }}>
      <Navbar />

      <main className="flex-grow">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #040C23 0%, #0B2D72 55%, #0992C2 100%)',
            paddingTop: 140,
            paddingBottom: 100,
          }}
        >
          {/* Ambient blobs */}
          <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30"
            style={{ background: 'radial-gradient(circle, #0992C2 0%, transparent 70%)' }} />
          <div className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, #0AC4E0 0%, transparent 70%)' }} />
          {/* Grid texture */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

          <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
            {/* Eyebrow */}
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-[0.67rem] font-semibold uppercase tracking-[0.26em] ring-1"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)', ringColor: 'rgba(255,255,255,0.12)' }}>
              <HeadphonesIcon className="h-3.5 w-3.5" style={{ color: '#0AC4E0' }} />
              Support Centre
            </span>

            <h1
              className="text-white"
              style={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, fontSize: 'clamp(2.4rem, 4vw, 3.6rem)', textShadow: '0 4px 40px rgba(0,0,0,0.4)' }}
            >
              How can we{' '}
              <span style={{ color: '#0AC4E0' }}>help you?</span>
            </h1>

            <p className="mt-5 text-[0.97rem] leading-relaxed mx-auto"
              style={{ color: 'rgba(255,255,255,0.58)', maxWidth: 460 }}>
              Whether it&apos;s a lease question, a payment issue, or an account problem — our support team has you covered. No login required.
            </p>

            {/* Response time pill */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl px-5 py-3"
              style={{ background: 'rgba(9,146,194,0.15)', border: '1px solid rgba(9,146,194,0.3)' }}>
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: '#0AC4E0' }} />
              <span className="text-[0.78rem] font-semibold" style={{ color: '#93C5FD' }}>
                We typically respond within <strong style={{ color: 'white' }}>24 hours</strong> on business days
              </span>
            </div>
          </div>
        </section>

        {/* ── CONTACT CHANNELS ─────────────────────────────────────────────── */}
        <MotionRevealSection className="py-12" style={{ background: '#040C23' }}>
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {CONTACT_CHANNELS.map(({ icon: Icon, label, value, href, accent }, i) => (
                <RevealCard key={label} delay={i * 80}>
                  <div
                    className="flex items-center gap-4 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${accent}22`, border: `1px solid ${accent}40` }}>
                      <Icon className="h-5 w-5" style={{ color: accent }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em]"
                        style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                      {href ? (
                        <a href={href} className="text-[0.9rem] font-semibold transition-colors hover:opacity-80"
                          style={{ color: accent }}>{value}</a>
                      ) : (
                        <p className="text-[0.9rem] font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>{value}</p>
                      )}
                    </div>
                  </div>
                </RevealCard>
              ))}
            </div>
          </div>
        </MotionRevealSection>

        {/* ── FORM + FAQ ────────────────────────────────────────────────────── */}
        <MotionRevealSection className="pb-24" style={{ background: '#040C23' }}>
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">

              {/* ── Contact Form ── */}
              <RevealCard>
                <div
                  className="rounded-3xl p-8"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}
                >
                  <div className="mb-7">
                    <h2 className="text-white text-xl font-bold tracking-tight">Send us a message</h2>
                    <p className="mt-1 text-[0.82rem]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      Fill in the form and we&apos;ll get back to you within 24 hours.
                    </p>
                  </div>

                  {submitted ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full"
                        style={{ background: 'rgba(10,196,224,0.15)', border: '1px solid rgba(10,196,224,0.3)' }}>
                        <CheckCircle className="h-8 w-8" style={{ color: '#0AC4E0' }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Message received!</h3>
                        <p className="mt-1 text-[0.84rem]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          We&apos;ll respond to <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{form.email}</strong> within 24 hours.
                        </p>
                      </div>
                      <button
                        onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', category: 'general', message: '' }); }}
                        className="mt-2 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:brightness-110"
                        style={{ background: 'linear-gradient(135deg, #0B2D72, #0992C2)', boxShadow: '0 4px 20px rgba(9,146,194,0.4)' }}
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {error && (
                        <div className="flex items-center gap-2 rounded-xl p-3 text-sm"
                          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label style={labelStyle}>Full Name <span style={{ color: '#0AC4E0' }}>*</span></label>
                          <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                            placeholder="Ali Hassan" style={glassInput}
                            onFocus={e => e.target.style.borderColor = 'rgba(9,146,194,0.6)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Email <span style={{ color: '#0AC4E0' }}>*</span></label>
                          <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                            placeholder="you@example.com" style={glassInput}
                            onFocus={e => e.target.style.borderColor = 'rgba(9,146,194,0.6)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label style={labelStyle}>Phone (optional)</label>
                          <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                            placeholder="+92 300 0000000" style={glassInput}
                            onFocus={e => e.target.style.borderColor = 'rgba(9,146,194,0.6)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Category</label>
                          <select value={form.category} onChange={e => set('category', e.target.value)}
                            style={{ ...glassInput, appearance: 'none', cursor: 'pointer' }}
                            onFocus={e => e.target.style.borderColor = 'rgba(9,146,194,0.6)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                          >
                            {CATEGORIES.map(c => (
                              <option key={c.value} value={c.value} style={{ background: '#0B2D72', color: 'white' }}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>Subject</label>
                        <input type="text" value={form.subject} onChange={e => set('subject', e.target.value)}
                          placeholder="Brief description of your issue" style={glassInput}
                          onFocus={e => e.target.style.borderColor = 'rgba(9,146,194,0.6)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Message <span style={{ color: '#0AC4E0' }}>*</span></label>
                        <textarea required value={form.message} onChange={e => set('message', e.target.value)}
                          placeholder="Please describe your issue in detail..." rows={5}
                          style={{ ...glassInput, resize: 'vertical' }}
                          onFocus={e => e.target.style.borderColor = 'rgba(9,146,194,0.6)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                        />
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                          {form.message.length}/2000 characters
                        </p>
                      </div>

                      <button
                        type="submit" disabled={submitting}
                        className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl py-3 text-[0.88rem] font-bold text-white transition-all hover:scale-[1.01] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                        style={{ background: 'linear-gradient(135deg, #0B2D72, #0992C2)', boxShadow: '0 4px 24px rgba(9,146,194,0.4)' }}
                      >
                        {submitting
                          ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                          : <>Send Message <ArrowRight className="h-4 w-4" /></>}
                      </button>
                    </form>
                  )}
                </div>
              </RevealCard>

              {/* ── Right column ── */}
              <div className="flex flex-col gap-6">

                {/* FAQ accordion */}
                <RevealCard delay={100}>
                  <div
                    className="rounded-3xl p-6"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
                  >
                    <h3 className="mb-5 text-[1rem] font-bold text-white">Frequently Asked Questions</h3>
                    <div className="flex flex-col gap-2">
                      {FAQS.map((faq, i) => (
                        <div key={i}
                          className="overflow-hidden rounded-xl transition-all duration-200"
                          style={{ border: '1px solid rgba(255,255,255,0.07)', background: openFaq === i ? 'rgba(9,146,194,0.1)' : 'transparent' }}>
                          <button
                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
                          >
                            <span className="text-[0.83rem] font-semibold" style={{ color: openFaq === i ? 'white' : 'rgba(255,255,255,0.75)' }}>
                              {faq.q}
                            </span>
                            {openFaq === i
                              ? <ChevronUp className="h-4 w-4 shrink-0" style={{ color: '#0AC4E0' }} />
                              : <ChevronDown className="h-4 w-4 shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }} />}
                          </button>
                          {openFaq === i && (
                            <div className="px-4 pb-4">
                              <p className="text-[0.8rem] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                {faq.a}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </RevealCard>

                {/* Sign-in CTA — only shown to guests */}
                {!user && (
                <RevealCard delay={180}>
                  <div
                    className="relative overflow-hidden rounded-3xl p-6 text-center"
                    style={{ background: 'linear-gradient(135deg, rgba(11,45,114,0.7) 0%, rgba(9,146,194,0.5) 100%)', border: '1px solid rgba(9,146,194,0.3)' }}
                  >
                    <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full blur-2xl opacity-30"
                      style={{ background: '#0AC4E0' }} />
                    <div className="relative z-10">
                      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl"
                        style={{ background: 'rgba(10,196,224,0.2)', border: '1px solid rgba(10,196,224,0.35)' }}>
                        <HeadphonesIcon className="h-5 w-5" style={{ color: '#0AC4E0' }} />
                      </div>
                      <p className="text-[0.88rem] font-semibold text-white">Have an account?</p>
                      <p className="mt-1 text-[0.78rem]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        Sign in for faster, personalised support from your dashboard
                      </p>
                      <Link
                        href="/login"
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-[0.82rem] font-bold text-white transition-all hover:scale-[1.03] hover:brightness-110"
                        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
                      >
                        Sign In <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </RevealCard>
                )}

              </div>
            </div>
          </div>
        </MotionRevealSection>

      </main>

      <Footer />
    </div>
  );
}