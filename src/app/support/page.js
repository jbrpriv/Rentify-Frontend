'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import {
  HeadphonesIcon, Mail, Phone, MessageSquare,
  CheckCircle, Loader2, ChevronDown, ChevronUp,
  Home, AlertCircle, FileText, CreditCard, Wrench, Shield,
} from 'lucide-react';

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
    q: 'I am having trouble paying my rent online — what should I do?',
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

export default function SupportPage() {
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
    <div style={{ minHeight: '100vh', background: '#F8FAFF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Header ── */}
      <div style={{ background: '#0F2B5B', padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.2rem', color: 'white', textDecoration: 'none' }}>
            RentifyPro
          </Link>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/browse" style={{ color: '#93C5FD', fontSize: '0.85rem', textDecoration: 'none' }}>Browse</Link>
            <Link href="/(auth)/login" style={{ color: '#93C5FD', fontSize: '0.85rem', textDecoration: 'none' }}>Sign In</Link>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg, #0F2B5B 0%, #1A56DB 100%)', padding: '60px 24px 80px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <HeadphonesIcon size={28} color="white" />
        </div>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2.4rem', fontWeight: 800, color: 'white', margin: '0 0 12px' }}>
          How can we help?
        </h1>
        <p style={{ color: '#93C5FD', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
          Have a question about a lease, payment, or your account? Our support team is here to assist — no login required.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '-40px auto 0', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>

        {/* ── Contact Form ── */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15,43,91,0.08)', padding: '32px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.2rem', color: '#0F172A', margin: '0 0 24px' }}>
            Send us a message
          </h2>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CheckCircle size={48} color="#059669" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>Message Received!</h3>
              <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                We&apos;ve received your message and will respond to <strong>{form.email}</strong> within 24 hours.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', category: 'general', message: '' }); }}
                style={{ marginTop: 20, padding: '10px 24px', background: '#0F2B5B', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', color: '#DC2626', fontSize: '0.85rem', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                    Full Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="Ali Hassan"
                    style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '9px 12px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                    Email <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="you@example.com"
                    style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '9px 12px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Phone (optional)</label>
                  <input
                    type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="+92 300 0000000"
                    style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '9px 12px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Category</label>
                  <select
                    value={form.category} onChange={e => set('category', e.target.value)}
                    style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '9px 12px', fontSize: '0.875rem', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Subject</label>
                <input
                  type="text" value={form.subject} onChange={e => set('subject', e.target.value)}
                  placeholder="Brief description of your issue"
                  style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '9px 12px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                  Message <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  required value={form.message} onChange={e => set('message', e.target.value)}
                  placeholder="Please describe your issue in detail..."
                  rows={5}
                  style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '9px 12px', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
                <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 4 }}>{form.message.length}/2000 characters</p>
              </div>

              <button
                type="submit" disabled={submitting}
                style={{ padding: '12px', background: submitting ? '#94A3B8' : '#0F2B5B', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.9rem', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</> : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* ── Right column: Contact info + FAQs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Contact channels */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15,43,91,0.08)', padding: '28px' }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#0F172A', margin: '0 0 20px' }}>Other ways to reach us</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: Mail, label: 'Email', value: 'support@rentifypro.com', href: 'mailto:support@rentifypro.com', color: '#1A56DB' },
                { icon: Phone, label: 'Phone', value: '+92 311 0000000', href: 'tel:+923110000000', color: '#059669' },
                { icon: MessageSquare, label: 'Live Chat', value: 'Available 9am–6pm PKT', href: null, color: '#7C3AED' },
              ].map(({ icon: Icon, label, value, href, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
                    {href ? (
                      <a href={href} style={{ fontSize: '0.88rem', fontWeight: 600, color: color, textDecoration: 'none' }}>{value}</a>
                    ) : (
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#374151', margin: 0 }}>{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: '12px 16px', background: '#F0F7FF', borderRadius: 12, border: '1px solid #BFDBFE' }}>
              <p style={{ fontSize: '0.8rem', color: '#1D4ED8', margin: 0 }}>
                <strong>Response time:</strong> We typically respond within 24 hours on business days.
              </p>
            </div>
          </div>

          {/* FAQs */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15,43,91,0.08)', padding: '28px' }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#0F172A', margin: '0 0 20px' }}>Frequently Asked Questions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FAQS.map((faq, i) => (
                <div key={i} style={{ border: '1px solid #F1F5F9', borderRadius: 12, overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: openFaq === i ? '#F8FAFF' : 'white', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1F2937' }}>{faq.q}</span>
                    {openFaq === i ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 16px 14px', borderTop: '1px solid #F1F5F9' }}>
                      <p style={{ fontSize: '0.83rem', color: '#6B7280', lineHeight: 1.6, margin: '10px 0 0' }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sign in prompt */}
          <div style={{ background: 'linear-gradient(135deg, #0F2B5B, #1A56DB)', borderRadius: 20, padding: '28px', textAlign: 'center' }}>
            <p style={{ color: '#93C5FD', fontSize: '0.85rem', margin: '0 0 12px' }}>Have an account? Get faster support from your dashboard.</p>
            <Link href="/(auth)/login" style={{ display: 'inline-block', padding: '10px 24px', background: 'white', color: '#0F2B5B', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#0F2B5B', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#93C5FD', fontSize: '0.8rem', margin: 0 }}>
          © {new Date().getFullYear()} RentifyPro · <Link href="/privacy" style={{ color: '#93C5FD' }}>Privacy</Link> · <Link href="/pricing" style={{ color: '#93C5FD' }}>Pricing</Link>
        </p>
      </div>
    </div>
  );
}
