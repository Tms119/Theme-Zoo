export default function Ticker() {
  const items = [
    "WordPress Templates",
    "Website Templates",
    "Elementor Themes",
    "Crypto Payment Gateways",
    "Instant File Delivery",
    "Clean Source Files",
    "Ecommerce Stores",
    "Fully Responsive UI",
  ];

  // Duplicate the array to ensure smooth seamless infinite scrolling
  const listItems = [...items, ...items, ...items];

  return (
    <div className="ticker-container">
      <div className="ticker-track">
        {listItems.map((item, index) => (
          <div className="ticker-item" key={index}>
            <span></span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
