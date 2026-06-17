import { FileText } from 'lucide-react';

export const metadata = {
  title: "Terms & Conditions | ThemeZoo",
  description: "Terms and conditions for using ThemeZoo templates.",
};

export default function TermsAndConditions() {
  return (
    <>
      <div className="bg-glow-container">
        <div className="bg-glow-2" />
      </div>

      <main style={{ minHeight: '80vh', paddingTop: '4rem', paddingBottom: '6rem', position: 'relative', zIndex: 10 }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
              <FileText size={24} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px' }}>
              Terms & Conditions
            </h1>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '3rem', color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              <strong>Last Updated: {new Date().toLocaleDateString()}</strong>
            </p>
            
            <p style={{ marginBottom: '2rem' }}>
              Welcome to ThemeZoo. By accessing this website and purchasing products, you accept these terms and conditions in full. Do not continue to use ThemeZoo if you do not accept all of the terms and conditions stated on this page.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 800, marginTop: '2.5rem', marginBottom: '1rem' }}>
              1. Digital Products and Delivery
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              All products available for purchase on ThemeZoo are digital goods (e.g., WordPress themes, website templates, HTML files). 
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Upon successful payment confirmation via our cryptocurrency processor (NOWPayments), you will automatically receive an email containing a secure download link.</li>
              <li>The download link is uniquely tied to your account or email address and cannot be shared.</li>
              <li>You can also download your purchased files anytime by logging into your Dashboard.</li>
            </ul>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 800, marginTop: '2.5rem', marginBottom: '1rem' }}>
              2. License and Usage Rights
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              Unless otherwise stated, ThemeZoo grants you a non-exclusive, non-transferable license to use the templates you purchase.
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>You may use the templates for personal or commercial projects.</li>
              <li>You may NOT resell, redistribute, or sub-license the raw templates as your own products.</li>
              <li>You may modify the code and design to fit your project's needs.</li>
            </ul>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 800, marginTop: '2.5rem', marginBottom: '1rem' }}>
              3. Refund Policy
            </h2>
            <p style={{ marginBottom: '2rem' }}>
              Due to the nature of digital goods and the irreversibility of cryptocurrency transactions, all sales are considered final. We do not offer refunds once the download link has been generated and dispatched. However, if you experience technical issues downloading or installing your template, please open a Support Ticket and we will assist you immediately.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 800, marginTop: '2.5rem', marginBottom: '1rem' }}>
              4. Disclaimer of Warranties
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              The products are provided "as is" without warranty of any kind, either expressed or implied. In no event shall ThemeZoo be liable for any damages arising out of the use or inability to use our templates.
            </p>

          </div>
        </div>
      </main>
    </>
  );
}
