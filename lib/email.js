import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail(ordersArray, baseUrl) {
  if (!ordersArray || ordersArray.length === 0) return;
  const buyerEmail = ordersArray[0].buyer_email;
  const buyerName = ordersArray[0].buyer_name || 'Customer';
  
  // Calculate totals including discounts
  let totalOriginal = 0;
  let totalFinal = 0;
  let promoCodeUsed = null;

  ordersArray.forEach(o => {
    totalOriginal += (o.original_price ?? o.price_usd ?? 0);
    totalFinal += (o.price_usd ?? 0);
    if (o.promo_code) promoCodeUsed = o.promo_code;
  });

  const totalDiscount = totalOriginal - totalFinal;
  const isFree = totalFinal <= 0;
  
  const itemsHtml = ordersArray.map(o => {
    const itemOriginal = o.original_price ?? o.price_usd;
    const hasItemDiscount = itemOriginal > o.price_usd;
    
    const discountHtml = hasItemDiscount 
      ? '<span style="text-decoration: line-through; color: #6b6f7b; font-size: 13px; margin-right: 8px;">$' + itemOriginal.toFixed(2) + '</span>'
      : '';

    return `
      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding-bottom: 12px;">
              <h3 style="margin: 0; color: #fcfcfd; font-size: 16px; font-weight: 700;">${o.product_name}</h3>
            </td>
            <td style="text-align: right; padding-bottom: 12px;">
              ${discountHtml}
              <span style="color: #10b981; font-weight: 700; font-size: 16px;">$${o.price_usd.toFixed(2)}</span>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="border-top: 1px solid rgba(255,255,255,0.04); padding-top: 16px; text-align: center;">
              <a href="${baseUrl}/download/${o._id}" style="display: inline-block; width: 100%; box-sizing: border-box; text-align: center; padding: 12px 0; background: #8b5cf6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">Download Asset</a>
            </td>
          </tr>
        </table>
      </div>
    `;
  }).join('');

  const confirmText = isFree 
    ? '<p style="color: #10b981; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Promo Applied</p>'
    : '<p style="color: #10b981; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Payment Verified</p>';
    
  const bodyText = isFree
    ? '<p style="font-size: 15px; color: #c5c7d0; line-height: 1.7; margin: 0;">Your 100% free promotion was successful. Your source files are securely unlocked and ready for instant download.</p>'
    : '<p style="font-size: 15px; color: #c5c7d0; line-height: 1.7; margin: 0;">Your payment of <strong>$' + totalFinal.toFixed(2) + ' USD</strong> was successfully verified on the blockchain. Your source files are securely unlocked and ready for instant download.</p>';

  const summaryHtml = totalDiscount > 0 ? `
    <tr>
      <td style="padding: 6px 0; color: #6b6f7b; font-size: 14px;">Subtotal</td>
      <td style="padding: 6px 0; text-align: right; color: #c5c7d0; font-size: 14px;">$${totalOriginal.toFixed(2)}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; color: #10b981; font-size: 14px;">Discount ${promoCodeUsed ? '(' + promoCodeUsed + ')' : ''}</td>
      <td style="padding: 6px 0; text-align: right; color: #10b981; font-size: 14px; font-weight: 600;">-$${totalDiscount.toFixed(2)}</td>
    </tr>
  ` : '';

  const htmlContent = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #07070f; color: #e8e9f0; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1a0a2e 0%, #0d0d1e 100%); padding: 40px; border-bottom: 1px solid rgba(139,92,246,0.2); text-align: center;">
        <div style="display: inline-flex; justify-content: center; align-items: center; width: 56px; height: 56px; border-radius: 16px; background: rgba(16, 189, 129, 0.1); border: 1px solid rgba(16, 189, 129, 0.2); margin-bottom: 20px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        ${confirmText}
        <h1 style="margin: 12px 0 0; font-size: 28px; font-weight: 900; color: #fcfcfd; letter-spacing: -0.5px;">Order Confirmed</h1>
      </div>

      <!-- Body -->
      <div style="padding: 40px;">
        <p style="font-size: 16px; font-weight: 600; color: #fcfcfd; margin: 0 0 12px;">Hi ${buyerName.split(' ')[0]},</p>
        ${bodyText}

        <!-- Invoice Summary -->
        <div style="margin-top: 32px; background: rgba(139,92,246,0.04); border: 1px solid rgba(139,92,246,0.15); border-radius: 12px; padding: 24px;">
          <h2 style="margin: 0 0 16px; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #8b5cf6;">Invoice Summary</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${summaryHtml}
            <tr>
              <td style="padding: 16px 0 0; border-top: 1px solid rgba(255,255,255,0.06); color: #fcfcfd; font-size: 16px; font-weight: 700;">Total Paid</td>
              <td style="padding: 16px 0 0; border-top: 1px solid rgba(255,255,255,0.06); text-align: right; color: #fcfcfd; font-size: 18px; font-weight: 800;">$${totalFinal.toFixed(2)} ${isFree ? '' : 'USD'}</td>
            </tr>
          </table>
        </div>

        <!-- Downloads -->
        <div style="margin-top: 40px;">
          <h2 style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #6b6f7b; margin: 0 0 20px;">Your Secure Downloads</h2>
          ${itemsHtml}
        </div>
      </div>

      <!-- Footer -->
      <div style="padding: 32px 40px; border-top: 1px solid rgba(255,255,255,0.04); text-align: center; background: rgba(0,0,0,0.2);">
        <p style="margin: 0 0 12px; font-size: 13px; color: #6b6f7b; line-height: 1.6;">
          These secure links are exclusively tied to <strong>${buyerEmail}</strong>.<br>
          For your security, links will expire in 48 hours.
        </p>
        <p style="margin: 0; font-size: 12px; color: #4b4f5b;">Themes Zoo · Premium Digital Assets</p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'ThemesZoo <hello@themeszoo.com>',
    to: buyerEmail,
    subject: isFree ? 'Your Download Links (Free Promo)' : 'Your Receipt & Download Links - $' + totalFinal.toFixed(2),
    html: htmlContent,
  });
}
