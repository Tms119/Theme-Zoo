require('dotenv').config({ path: '.env.local' });
const { sendInvoiceEmail } = require('./lib/email.js');

async function test() {
  const dummyOrders = [{
    _id: "test1234",
    product_name: "Test Product",
    price_usd: 0,
    original_price: 100,
    buyer_email: "mohammadsayemweb@gmail.com",
    buyer_name: "Sayem"
  }];
  
  console.log("Sending email with Resend API Key:", process.env.RESEND_API_KEY ? "Found" : "Missing");
  console.log("From:", process.env.FROM_EMAIL);
  
  try {
    const res = await sendInvoiceEmail(dummyOrders, "http://localhost:3000");
    console.log("Response:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
