import { Shield } from 'lucide-react';

export const metadata = {
  title: "Privacy Policy | ThemeZoo",
  description: "Privacy Policy and data practices for ThemeZoo.",
};

export default function PrivacyPolicy() {
  return (
    <>
      <div className="bg-glow-container">
        <div className="bg-glow-1" />
      </div>

      <main style={{ minHeight: '80vh', paddingTop: '4rem', paddingBottom: '6rem', position: 'relative', zIndex: 10 }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
              <Shield size={24} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px' }}>
              Privacy Policy
            </h1>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '3rem', color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              <strong>Last Updated: {new Date().toLocaleDateString()}</strong>
            </p>
            
            <p style={{ marginBottom: '2rem' }}>
              At ThemeZoo, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 800, marginTop: '2.5rem', marginBottom: '1rem' }}>
              1. Information We Collect
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              We collect information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products, or otherwise contact us.
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Personal Information:</strong> We may collect your name, email address, and authentication data via Clerk authentication.</li>
              <li><strong>Payment Data:</strong> We do not store your raw cryptocurrency wallet keys. All transactions are securely processed via NOWPayments API, which only provides us with the transaction hash and payment status.</li>
            </ul>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 800, marginTop: '2.5rem', marginBottom: '1rem' }}>
              2. How We Use Your Information
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              We use the information we collect or receive:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>To facilitate account creation and logon process.</li>
              <li>To fulfill and manage your orders, payments, and digital asset delivery.</li>
              <li>To send you the digital products you have purchased.</li>
              <li>To respond to your inquiries via our Support system.</li>
            </ul>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 800, marginTop: '2.5rem', marginBottom: '1rem' }}>
              3. Data Security
            </h2>
            <p style={{ marginBottom: '2rem' }}>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 800, marginTop: '2.5rem', marginBottom: '1rem' }}>
              4. Contact Us
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              If you have questions or comments about this Privacy Policy, please contact us via the Support portal on our website.
            </p>

          </div>
        </div>
      </main>
    </>
  );
}
