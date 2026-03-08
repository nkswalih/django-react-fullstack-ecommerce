import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SimpleFooter from '../../components/SimpleFoot';

const sections = [
  {
    num: '01', title: 'Introduction',
    content: `Welcome to EchOo. These Terms and Conditions govern your use of our website, mobile applications, and all associated services. By accessing or using EchOo, you agree to be bound by these terms in full.

EchOo specialises in premium smart devices including iPhones, Mac computers, laptops, and accessories from all major brands. Our commitment is to deliver high-quality technology products paired with exceptional customer service.`
  },
  {
    num: '02', title: 'Products & Services',
    bullets: [
      'Apple iPhones and iOS devices', 'Mac computers — MacBook, iMac, Mac Pro, Mac Studio',
      'Laptops from all major brands (Dell, HP, Lenovo, ASUS, Acer, and more)',
      'Smart home devices and accessories', 'Wearable technology and smart watches',
      'Tablets and mobile computing devices',
    ]
  },
  {
    num: '03', title: 'Account Registration',
    content: 'To purchase products from EchOo, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials, all activities that occur under your account, providing accurate and complete information at registration, and keeping your information current and up to date.'
  },
  {
    num: '04', title: 'Orders & Payment',
    pairs: [
      ['Pricing', 'All prices are shown in Indian Rupees (₹) and are subject to change without notice.'],
      ['Order Acceptance', 'Your order constitutes an offer to purchase. We reserve the right to refuse or cancel any order at our discretion.'],
      ['Payment Methods', 'We accept major credit/debit cards, UPI, net banking, and other methods as indicated at checkout.'],
      ['Taxes', 'Applicable GST or other taxes will be added to your order total at checkout.'],
    ]
  },
  {
    num: '05', title: 'Shipping & Delivery',
    pairs: [
      ['Shipping Times', 'Estimated delivery times are shown at checkout and may vary by location.'],
      ['Shipping Costs', 'Costs are calculated based on weight, destination, and method selected.'],
      ['Free Shipping', 'Free standard shipping is available on orders above a certain value — see checkout for current threshold.'],
      ['Order Tracking', 'Tracking information will be sent to your registered email once your order ships.'],
    ]
  },
  {
    num: '06', title: 'Returns & Refunds',
    pairs: [
      ['Return Window', 'We offer a 30-day return policy for most items in original, unopened condition.'],
      ['Refund Processing', 'Refunds are processed within 5–10 business days after we receive the returned item.'],
      ['Non-Returnable Items', 'Opened software, digital downloads, and personalised products are not eligible for return.'],
      ['Defective Products', 'Contact us immediately if you receive a defective product — we will arrange a replacement or full refund.'],
    ]
  },
  {
    num: '07', title: 'Warranty',
    pairs: [
      ['Manufacturer Warranty', 'All products carry the full original manufacturer warranty.'],
      ['Extended Warranty', 'Optional extended warranty plans may be available for purchase at checkout.'],
      ['Warranty Claims', 'Contact the manufacturer directly for warranty claims or reach our support team for guidance.'],
    ]
  },
  {
    num: '08', title: 'Intellectual Property',
    content: `All content on this website — including text, graphics, logos, and images — is the property of EchOo or its content suppliers, protected under applicable copyright laws.

Apple, iPhone, Mac, iPad, and other product names are trademarks of their respective owners. EchOo is an authorised reseller and is not affiliated with Apple Inc. or other manufacturers unless explicitly stated.`
  },
  {
    num: '09', title: 'Limitation of Liability',
    content: `EchOo shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service or products.

Our total liability for any claim arising out of these terms shall not exceed the amount you paid for the specific products giving rise to the claim.`
  },
  {
    num: '10', title: 'Changes to Terms',
    content: 'We reserve the right to modify these terms at any time. We will notify registered users of significant changes by email or by posting a notice on our website. Continued use of EchOo after changes are posted constitutes your acceptance of the modified terms.'
  },
  {
    num: '11', title: 'Contact Information',
    contact: true
  },
];

const Terms = () => {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] pt-20 pb-16"
      style={{ fontFamily: "'SF Pro Display', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 pt-6 pb-12">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Legal</p>
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-gray-900 leading-none mb-3">Terms & Conditions</h1>
        <p className="text-gray-500 text-base">
          Last updated: <span className="text-gray-700 font-medium">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/support" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/80 text-sm font-medium text-gray-700 hover:bg-white shadow-sm transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Support Centre
          </Link>
          <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/80 text-sm font-medium text-gray-700 hover:bg-white shadow-sm transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* ── Acceptance Banner ─────────────────────────────── */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 mb-10">
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-900 flex items-center justify-center text-white shrink-0 shadow-md mt-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Acceptance of Terms</p>
            <p className="text-sm text-gray-600 leading-relaxed">By using our website and purchasing our products, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part, please do not use our website or services.</p>
          </div>
        </div>
      </div>

      {/* ── Sections ──────────────────────────────────────── */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 space-y-4 mb-16">
        {sections.map((s) => (
          <div key={s.num} className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-sm">
            <button
              className="w-full flex items-center justify-between px-6 py-5 text-left"
              onClick={() => setActiveSection(activeSection === s.num ? null : s.num)}
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 tracking-widest w-6">{s.num}</span>
                <span className="text-base font-semibold text-gray-900">{s.title}</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${activeSection === s.num ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeSection === s.num && (
              <div className="px-6 pb-6 border-t border-white/50">
                <div className="pt-4 text-sm text-gray-700 leading-relaxed">
                  {s.content && <p className="whitespace-pre-line">{s.content}</p>}
                  {s.bullets && (
                    <ul className="space-y-2 mt-2">
                      {s.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"></span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  {s.pairs && (
                    <div className="space-y-3 mt-2">
                      {s.pairs.map(([k, v], i) => (
                        <div key={i}>
                          <span className="font-semibold text-gray-900">{k}: </span>
                          <span className="text-gray-600">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {s.contact && (
                    <div className="space-y-3 mt-2">
                      <div><span className="font-semibold text-gray-900">Customer Support: </span><a href="mailto:support@echoo.com" className="text-blue-600 hover:underline">support@echoo.com</a></div>
                      <div><span className="font-semibold text-gray-900">Sales Inquiries: </span><a href="mailto:sales@echoo.com" className="text-blue-600 hover:underline">sales@echoo.com</a></div>
                      <div><span className="font-semibold text-gray-900">Phone: </span>1800-ECHOO-00</div>
                      <div><span className="font-semibold text-gray-900">Business Hours: </span>Monday–Friday, 9:00 AM – 6:00 PM IST</div>
                      <Link to="/support" className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors">
                        Contact Support →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <SimpleFooter />
    </div>
  );
};

export default Terms;
