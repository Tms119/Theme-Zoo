import { Resend } from 'resend';

const resend = new Resend('re_b6oKN2cQ_G7uiFiwGGu1h65Bk2A4KX6zs');

async function sendTest() {
  const buyerEmail = "mohammadsayemweb@gmail.com";
  const buyerName = "Mohammad Sayem";
  const totalAmount = "29.00";
  const baseUrl = "https://yourdomain.com"; // mock

  const mockOrder = {
    _id: "mock_order_id_123",
    product_name: "AstraGlow - Cyberpunk Portfolio WordPress Theme",
    price_usd: 29.00
  };

  const itemsHtml = `
    <div style="padding: 20px; margin-bottom: 16px; background-color: #121214; border: 1px solid #27272a; border-radius: 12px;">
      <h3 style="margin: 0 0 6px 0; color: #f4f4f5; font-size: 18px; font-weight: 600;">${mockOrder.product_name}</h3>
      <p style="margin: 0 0 16px 0; color: #a1a1aa; font-size: 14px;">Price: $${mockOrder.price_usd.toFixed(2)} USD</p>
      <a href="${baseUrl}/download/${mockOrder._id}" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Download Asset</a>
    </div>
  `;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; padding: 40px 24px; color: #ededed; border: 1px solid #18181b; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-flex; justify-content: center; align-items: center; width: 48px; height: 48px; border-radius: 50%; background-color: rgba(16, 189, 129, 0.1); margin-bottom: 16px;">
          <span style="font-size: 24px; color: #10b981;">✓</span>
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.5px;">Payment Confirmed</h1>
        <p style="color: #10b981; font-weight: 600; font-size: 14px; margin: 0;">Crypto Transaction Verified</p>
      </div>
      
      <p style="font-size: 15px; line-height: 1.6; color: #d4d4d8; margin-bottom: 24px;">Hi ${buyerName},</p>
      <p style="font-size: 15px; line-height: 1.6; color: #d4d4d8;">Thank you for your purchase. Your crypto payment equivalent to <strong>$${totalAmount} USD</strong> has been successfully verified on the blockchain. Your source files are now unlocked and ready for download.</p>
      
      <div style="margin: 40px 0;">
        <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #71717a; border-bottom: 1px solid #27272a; padding-bottom: 12px; margin-bottom: 20px;">Your Authorized Downloads</h2>
        ${itemsHtml}
      </div>
      
      <p style="font-size: 13px; line-height: 1.5; color: #71717a; text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #27272a;">
        These links are tied to your email (${buyerEmail}) and will remain active for 48 hours. Please securely backup your files.<br><br>
        If you need any assistance, simply reply to this email.
      </p>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: 'VaultMarket <onboarding@resend.dev>',
      to: buyerEmail,
      subject: \`Your Receipt & Download Links - $\${totalAmount}\`,
      html: htmlContent,
    });
    console.log("Email sent successfully:", data);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

sendTest();
