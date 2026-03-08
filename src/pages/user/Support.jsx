import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import SimpleFooter from '../../components/SimpleFoot';

// ── EmailJS Config ─────────────────────────────────────────────────────────────
// 1. Go to https://emailjs.com and create a free account
// 2. Create a Service (Gmail/Outlook), get Service ID
// 3. Create an Email Template, get Template ID
// 4. Get your Public Key from Account > API Keys
// Replace the placeholders below with your real EmailJS keys:
const EMAILJS_SERVICE_ID = 'service_zhhl7ts';
const EMAILJS_TEMPLATE_ID = 'template_jq5abdp';
const EMAILJS_PUBLIC_KEY = '-yLqF_ifed2wIUT_E';

const faqs = [
  { q: 'How do I track my order?', a: 'After your order ships, you will receive a tracking email. You can also check your order status in your Profile under "My Orders".' },
  { q: 'What is your return policy?', a: 'We offer a 30-day hassle-free return policy for most items. Products must be in original condition and packaging.' },
  { q: 'How long does shipping take?', a: 'Standard shipping takes 3–5 business days. Express shipping (1–2 days) is available at checkout.' },
  { q: 'Are the products under warranty?', a: 'Yes, all products carry their original manufacturer warranty. Extended warranty plans are available at checkout.' },
  { q: 'Can I change or cancel my order?', a: 'Orders can be modified or cancelled within 2 hours of placement. Contact us immediately via the form below if needed.' },
  { q: 'Do you ship internationally?', a: 'We currently ship within India. International shipping is coming soon. Stay tuned!' },
];

const EchooSupport = () => {
  const formRef = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSending(true);
    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        EMAILJS_PUBLIC_KEY
      );
      toast.success('Message sent! We\'ll get back to you within 24 hours. ✅');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('EmailJS error:', err);
      toast.error('Failed to send. Please try again or email us directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] pt-20 pb-16"
      style={{ fontFamily: "'SF Pro Display', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 pb-12 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Echoo Support</p>
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-gray-900 leading-none mb-4">
          How can we help?
        </h1>
        <p className="text-gray-500 text-lg font-light max-w-xl mx-auto">
          Browse our FAQs below, or reach out directly using the contact form.
        </p>
      </div>

      {/* ── Quick Contact Cards ──────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mb-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
              label: 'Email Us', value: 'support@echoo.com', sub: 'Response within 24 hours'
            },
            {
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
              label: 'Call Us', value: '1800-ECHOO-00', sub: 'Mon–Fri, 9 AM – 6 PM IST'
            },
            {
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
              label: 'Live Chat', value: 'Chat with us', sub: 'Available during business hours'
            },
          ].map((c, i) => (
            <div key={i} className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 flex items-start gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-900 flex items-center justify-center text-white shrink-0 shadow-md">
                {c.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{c.label}</p>
                <p className="text-base font-semibold text-gray-900 mt-0.5">{c.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── FAQ ───────────────────────────────────────── */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-gray-800">{faq.q}</span>
                    <motion.svg
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-4 h-4 text-gray-500 shrink-0 ml-2"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="mt-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Quick Links</h3>
              <div className="flex flex-wrap gap-2">
                {['Track Order', 'Return Request', 'Warranty Check', 'Terms & Conditions'].map((l, i) => (
                  <Link
                    key={i}
                    to={l === 'Terms & Conditions' ? '/terms_conditions' : '#'}
                    className="px-4 py-2 bg-white/60 border border-white/80 rounded-full text-sm font-medium text-gray-700 hover:bg-white shadow-sm transition-all hover:shadow-md"
                  >
                    {l}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Contact Form ──────────────────────────────── */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Send us a Message</h2>
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Name *</label>
                    <input
                      type="text"
                      name="from_name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 rounded-2xl bg-white/60 border border-white/80 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email *</label>
                    <input
                      type="email"
                      name="reply_to"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-2xl bg-white/60 border border-white/80 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="What's this about?"
                    className="w-full px-4 py-3 rounded-2xl bg-white/60 border border-white/80 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    className="w-full px-4 py-3 rounded-2xl bg-white/60 border border-white/80 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-4 rounded-full font-bold tracking-wide text-sm bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white hover:from-gray-400 hover:to-gray-700 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Sending...
                    </span>
                  ) : 'Send Message →'}
                </button>
                <p className="text-center text-xs text-gray-400 mt-2">We typically respond within 24 hours on business days.</p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20"><SimpleFooter /></div>
    </div>
  );
};

export default EchooSupport;