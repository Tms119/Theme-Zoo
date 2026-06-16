import { Compass, Coins, Download } from 'lucide-react';

export default function Features() {
  const steps = [
    {
      num: "01",
      icon: <Compass size={36} color="var(--primary)" />,
      title: "Select Your Template",
      desc: "Browse our premium portfolio of WordPress themes, landing pages, and web layout designs. Each template is tested for SEO, responsiveness, and speed."
    },
    {
      num: "02",
      icon: <Coins size={36} color="var(--accent-cyan)" />,
      title: "Secure Crypto Payment",
      desc: "Pay instantly with BTC, ETH, USDT, SOL, or other major crypto coins. Our secure checkout calculates conversion rates automatically with near-zero gas fees."
    },
    {
      num: "03",
      icon: <Download size={36} color="var(--accent-emerald)" />,
      title: "Instant Secure Delivery",
      desc: "Upon blockchain verification, a unique, secure time-limited download link is generated and sent directly to your registered email address."
    }
  ];

  return (
    <section id="how-it-works" className="feature-section">
      <div className="container">
        <div className="section-header">
          <div className="section-title-wrapper">
            <h2 className="section-title">Seamless Purchase Flow</h2>
            <p className="section-subtitle">
              Acquiring production-ready web assets has never been more straightforward or cost-effective.
            </p>
          </div>
        </div>
        
        <div className="grid-3">
          {steps.map((step, idx) => (
            <div className="feature-step" key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ marginBottom: '1.5rem' }}>{step.icon}</div>
                <div className="feature-step-num">{step.num}</div>
              </div>
              <h3 className="feature-step-title">{step.title}</h3>
              <p className="feature-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
